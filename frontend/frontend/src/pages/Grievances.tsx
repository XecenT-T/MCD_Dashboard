import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import DashboardLayout from '../components/DashboardLayout';
import GrievanceManagementSystem from '../components/hr/GrievanceManagementSystem';
import type { Grievance } from '../hooks/useHRData'; // Using shared type

interface SentGrievance {
    _id: string;
    title: string;
    description: string;
    status: string;
    createdAt: string;
    department: string;
}

const Grievances = () => {
    const { user, token } = useAuth();
    const [activeTab, setActiveTab] = useState<'sent' | 'received'>('received');
    const [sentGrievances, setSentGrievances] = useState<SentGrievance[]>([]);
    const [receivedGrievances, setReceivedGrievances] = useState<Grievance[]>([]);
    const [loading, setLoading] = useState(true);

    const isOfficial = user?.role === 'official';
    const isHR = isOfficial && (user?.department === 'General' || user?.department === 'Administration' || user?.department === 'HR');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Fetch Sent Grievances (For everyone)
                const sentRes = await api.get('/api/grievances');
                setSentGrievances(sentRes.data);

                // 2. Fetch Received Grievances (For Officials/HR)
                if (isOfficial) {
                    let endpoint = '/api/grievances/department';
                    if (isHR) {
                        endpoint = '/api/grievances/all';
                    }
                    const receivedRes = await api.get(endpoint);

                    // Transform data to match Grievance interface expected by GrievanceManagementSystem
                    // The backend returns standard grievance objects. 
                    // GrievanceManagementSystem expects: { id, submittedBy, role, department, subject, description, date, status }
                    // Backend returns: { _id, userId: { name }, title, description, department, status, createdAt }

                    const transformed = receivedRes.data.map((g: any) => ({
                        id: g._id,
                        submittedBy: g.userId?.name || 'Unknown',
                        role: 'worker', // Defaulting as backend might not populate submitter role easily without extra query, or we can assume most are workers. Let's try to infer or ignore 'role' styling for now if missing.
                        // Actually, let's keep it simple.
                        department: g.department,
                        subject: g.title,
                        description: g.description,
                        date: new Date(g.createdAt).toLocaleDateString(),
                        status: g.status.charAt(0).toUpperCase() + g.status.slice(1) // Capitalize
                    }));
                    setReceivedGrievances(transformed);
                }
            } catch (err) {
                console.error("Error fetching grievances:", err);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchData();
    }, [token, isOfficial, isHR]);

    // Handle Status Update (Passed to GrievanceManagementSystem)
    const handleUpdateStatus = async (id: string, status: any) => {
        try {
            await api.patch(`/api/grievances/${id}/status`, { status: status.toLowerCase() });
            // Optimistic update
            setReceivedGrievances(prev => prev.map(g => g.id === id ? { ...g, status } : g));
        } catch (err) {
            console.error("Failed to update status", err);
            alert("Failed to update status");
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <DashboardLayout title="Grievances">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Grievance Portal</h2>
                        <p className="text-text-muted mt-1">Manage and track issues</p>
                    </div>
                </div>

                {isOfficial ? (
                    <div className="flex flex-col gap-6">
                        {/* Tabs */}
                        <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
                            <button
                                onClick={() => setActiveTab('received')}
                                className={`pb-2 text-sm font-medium transition-colors ${activeTab === 'received' ? 'border-b-2 border-primary text-primary' : 'text-text-muted hover:text-gray-700 dark:hover:text-gray-300'}`}
                            >
                                Received ({receivedGrievances.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('sent')}
                                className={`pb-2 text-sm font-medium transition-colors ${activeTab === 'sent' ? 'border-b-2 border-primary text-primary' : 'text-text-muted hover:text-gray-700 dark:hover:text-gray-300'}`}
                            >
                                Sent by Me ({sentGrievances.length})
                            </button>
                        </div>

                        {activeTab === 'received' ? (
                            <GrievanceManagementSystem grievances={receivedGrievances} onUpdateStatus={handleUpdateStatus} />
                        ) : (
                            <SentGrievancesList grievances={sentGrievances} />
                        )}
                    </div>
                ) : (
                    <SentGrievancesList grievances={sentGrievances} />
                )}
            </div>
        </DashboardLayout>
    );
};

// Sub-component for Sent Grievances List
const SentGrievancesList = ({ grievances }: { grievances: SentGrievance[] }) => {
    return (
        <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-bold text-gray-900 dark:text-white">My Submitted Grievances</h3>
            </div>
            {grievances.length === 0 ? (
                <div className="p-8 text-center text-text-muted">No grievances submitted.</div>
            ) : (
                <div className="dividing-y divide-gray-100 dark:divide-gray-800">
                    {grievances.map(g => (
                        <div key={g._id} className="p-5 flex justify-between items-start hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">{g.title}</h4>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold 
                                        ${g.status === 'resolved' ? 'bg-green-100 text-green-700' :
                                            g.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {g.status}
                                    </span>
                                </div>
                                <p className="text-sm text-text-muted mb-2">{g.description}</p>
                                <p className="text-xs text-text-muted">Submitted on {new Date(g.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Grievances;
