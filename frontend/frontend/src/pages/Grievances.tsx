import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    supervisorApproval?: boolean;
    hrApproval?: boolean;
}

const Grievances = () => {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [sentGrievances, setSentGrievances] = useState<SentGrievance[]>([]);
    const [receivedGrievances, setReceivedGrievances] = useState<Grievance[]>([]);
    const [officialViewMode, setOfficialViewMode] = useState<'personal' | 'department'>('department');
    const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
    const [loading, setLoading] = useState(true);

    const isOfficial = user?.role === 'official';
    const department = (user?.department || '').toLowerCase();
    const isHR = isOfficial && ['general', 'administration', 'hr'].includes(department);

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
                    const transformed = receivedRes.data.map((g: any) => ({
                        id: g._id,
                        submittedBy: g.userId?.name || 'Unknown',
                        submitterId: g.userId?._id, // Added for filtering
                        role: g.userId?.role || 'worker',
                        department: g.department,
                        subject: g.title,
                        description: g.description,
                        date: new Date(g.createdAt).toLocaleDateString(),
                        status: g.status.charAt(0).toUpperCase() + g.status.slice(1), // Capitalize
                        supervisorApproval: g.supervisorApproval,
                        hrApproval: g.hrApproval
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
    const handleToggleApproval = async (id: string, role: 'supervisor' | 'hr', approved: boolean) => {
        try {
            const res = await api.patch(`/api/grievances/${id}/approval`, { role, approved });
            const updated = res.data;

            // Map backend response status to frontend status format (Capitalized)
            const frontendStatus = updated.status.charAt(0).toUpperCase() + updated.status.slice(1);

            setReceivedGrievances(prev => prev.map(g => {
                if (g.id === id) {
                    return {
                        ...g,
                        supervisorApproval: updated.supervisorApproval,
                        hrApproval: updated.hrApproval,
                        status: frontendStatus
                    } as Grievance;
                }
                return g;
            }));
        } catch (err) {
            console.error("Failed to toggle approval", err);
            alert("Failed to update approval");
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
                        {/* Official View Switcher */}
                        <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
                            <button
                                onClick={() => setOfficialViewMode('department')}
                                className={`pb-2 text-sm font-medium transition-colors ${officialViewMode === 'department' ? 'border-b-2 border-primary text-primary' : 'text-text-muted hover:text-gray-700 dark:hover:text-gray-300'}`}
                            >
                                Review Department Grievances
                            </button>
                            {!isHR && (
                                <button
                                    onClick={() => setOfficialViewMode('personal')}
                                    className={`pb-2 text-sm font-medium transition-colors ${officialViewMode === 'personal' ? 'border-b-2 border-primary text-primary' : 'text-text-muted hover:text-gray-700 dark:hover:text-gray-300'}`}
                                >
                                    My Grievances
                                </button>
                            )}
                        </div>

                        {officialViewMode === 'department' ? (
                            <div className="space-y-4">
                                {isHR && (
                                    <div className="flex items-center gap-2 bg-white dark:bg-surface-dark p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm w-fit">
                                        <span className="material-symbols-outlined text-gray-500">filter_list</span>
                                        <select
                                            value={selectedDepartment}
                                            onChange={(e) => setSelectedDepartment(e.target.value)}
                                            className="bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                                        >
                                            <option value="All">All Departments</option>
                                            {Array.from(new Set(receivedGrievances.map(g => g.department))).sort().map(dept => (
                                                <option key={dept} value={dept}>{dept}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <GrievanceManagementSystem
                                    // Filter Logic:
                                    // 1. Exclude own grievances (submitterId !== user.id)
                                    // 2. Department Filter (if active)
                                    // 3. If HR: Show (Role=Official) OR (Role=Worker AND SupervisorApproved=True)
                                    // 4. If Supervisor: Show all Department grievances (except own)
                                    grievances={receivedGrievances.filter((g: any) => {
                                        const isSelf = g.submitterId === user?.id;
                                        if (isSelf) return false;

                                        // Department Filter
                                        if (isHR && selectedDepartment !== 'All' && g.department !== selectedDepartment) {
                                            return false;
                                        }

                                        if (isHR) {
                                            const isOfficialSubmitter = g.role === 'official' || g.role === 'hr';
                                            const isWorkerSubmitter = g.role === 'worker';
                                            // HR sees: Official grievances OR Approved Worker grievances
                                            return isOfficialSubmitter || (isWorkerSubmitter && g.supervisorApproval === true);
                                        }

                                        // Supervisors see only WORKER grievances in their department
                                        return g.role === 'worker';
                                    })}
                                    onToggleApproval={handleToggleApproval}
                                />
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => navigate('/grievance-submission')}
                                        className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-bold transition-colors shadow-sm"
                                    >
                                        <span className="material-symbols-outlined">add_circle</span>
                                        Submit Grievance
                                    </button>
                                </div>
                                <SentGrievancesTable grievances={sentGrievances} isOfficial={isOfficial} />
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex justify-end">
                            <button
                                onClick={() => navigate('/grievance-submission')}
                                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-bold transition-colors shadow-sm"
                            >
                                <span className="material-symbols-outlined">add_circle</span>
                                Submit Grievance
                            </button>
                        </div>
                        <SentGrievancesTable grievances={sentGrievances} isOfficial={isOfficial} />
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

// Sub-component for Sent Grievances Table
const SentGrievancesTable = ({ grievances, isOfficial }: { grievances: SentGrievance[], isOfficial: boolean }) => {

    // Helper for Status Icon
    const getStatusIcon = (approved?: boolean) => {
        if (approved === true) return <span className="material-symbols-outlined text-green-600 font-bold">check_circle</span>;
        if (approved === false) return <span className="material-symbols-outlined text-red-600 font-bold">cancel</span>;
        return <span className="material-symbols-outlined text-yellow-600 font-bold">schedule</span>;
    };

    return (
        <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-bold text-gray-900 dark:text-white">My Submitted Grievances</h3>
            </div>
            {grievances.length === 0 ? (
                <div className="p-8 text-center text-text-muted">No grievances submitted.</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium">
                            <tr>
                                <th className="px-6 py-4">Topic</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Time</th>
                                {/* Hide Supervisor Approval Column for Officials */}
                                {!isOfficial && <th className="px-6 py-4 text-center">Supervisor Approval</th>}
                                <th className="px-6 py-4 text-center">HR Approval</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {grievances.map((g) => {
                                const dateObj = new Date(g.createdAt);
                                return (
                                    <tr key={g._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{g.title}</td>
                                        <td className="px-6 py-4 text-text-muted">{dateObj.toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-text-muted">{dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>

                                        {!isOfficial && (
                                            <td className="px-6 py-4 text-center">
                                                {getStatusIcon(g.supervisorApproval)}
                                            </td>
                                        )}

                                        <td className="px-6 py-4 text-center">
                                            {getStatusIcon(g.hrApproval)}
                                        </td>

                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase
                                                ${g.status === 'resolved' ? 'bg-green-100 text-green-700' :
                                                    g.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'}`}>
                                                {g.status === 'resolved' ? 'Approved' : g.status === 'rejected' ? 'Denied' : 'Pending'}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Grievances;
