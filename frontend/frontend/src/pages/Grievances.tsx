import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import DashboardLayout from '../components/DashboardLayout';
import GrievanceManagementSystem from '../components/hr/GrievanceManagementSystem';
import type { Grievance } from '../hooks/useHRData';

interface SentGrievance {
    _id: string;
    title: string;
    description: string;
    status: string;
    createdAt: string;
    department: string;
    replies?: any[];
}

const Grievances = () => {
    const { user, token } = useAuth();
    const navigate = useNavigate();

    // Helper to check HR role.
    // We prioritize role === 'hr'. Legacy fallback: official in HR department.
    const isHRCheck = (u: any) => u?.role === 'hr' || (u?.role === 'official' && ['general', 'administration', 'hr'].includes((u?.department || '').toLowerCase()));

    // Default HR to department view, managing grievances. Others to personal.
    const [officialViewMode, setOfficialViewMode] = useState<'personal' | 'department'>(isHRCheck(user) ? 'department' : 'personal');
    const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
    const [loading, setLoading] = useState(true);
    const [sentGrievances, setSentGrievances] = useState<SentGrievance[]>([]);
    const [receivedGrievances, setReceivedGrievances] = useState<Grievance[]>([]);

    const isHR = isHRCheck(user);
    const isOfficial = user?.role === 'official' || isHR; // HR implies official privileges for view logic

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Fetch Sent Grievances (For everyone)
                const sentRes = await api.get('/api/grievances');
                setSentGrievances(sentRes.data);

                // 2. Fetch Received Grievances (For Officials/HR)
                if (isOfficial || isHR) {
                    let endpoint = '/api/grievances/department';
                    if (isHR) {
                        endpoint = '/api/grievances/all';
                    }
                    const receivedRes = await api.get(endpoint);

                    // Transform data to match Grievance interface
                    const transformed = receivedRes.data.map((g: any) => ({
                        id: g._id,
                        submittedBy: g.userId?.name || 'Unknown',
                        submitterId: g.userId?._id, // Added for filtering
                        submitterProfile: g.userId, // Full profile for modal
                        role: g.userId?.role || 'worker',
                        department: g.department,
                        subject: g.title,
                        description: g.description,
                        date: new Date(g.createdAt).toLocaleDateString(),
                        status: g.status.charAt(0).toUpperCase() + g.status.slice(1), // Capitalize
                        replies: g.replies || []
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

    const handleResolve = async (id: string) => {
        try {
            await api.patch(`/api/grievances/${id}/status`, { status: 'resolved' });
            setReceivedGrievances(prev => prev.map(g =>
                g.id === id ? { ...g, status: 'Resolved' } : g
            ));
        } catch (err) {
            console.error("Failed to resolve grievance", err);
            alert("Failed to resolve grievance. You might not have permission.");
        }
    };

    const handleReply = async (id: string, message: string) => {
        try {
            const res = await api.post(`/api/grievances/${id}/reply`, { message });
            const updatedGrievance = res.data;

            setReceivedGrievances(prev => prev.map(g => {
                if (g.id === id) {
                    return {
                        ...g,
                        replies: updatedGrievance.replies
                    };
                }
                return g;
            }));

            // Allow Sent Grievances to update too if view is personal
            setSentGrievances(prev => prev.map(g => {
                if (g._id === id) {
                    return {
                        ...g,
                        replies: updatedGrievance.replies
                    };
                }
                return g;
            }));

        } catch (err) {
            console.error("Failed to send reply", err);
            alert("Failed to send reply");
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
                            {/* HR Role users don't need 'My Grievances' toggle in this view, effectively hiding it */}
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
                                    // 3. Officials/HR see all in their scope
                                    // 3. Officials/HR see all in their scope
                                    // 4. Update: Officials (non-HR) ONLY see Worker grievances
                                    // 5. Update: HR ONLY sees grievances sent to HR/General/Admin
                                    grievances={receivedGrievances.filter((g: any) => {
                                        const isSelf = g.submitterId === user?.id;
                                        if (isSelf) return false;

                                        const grievanceDept = g.department.toLowerCase();
                                        const hrDepts = ['hr', 'general', 'administration'];

                                        // HR RESTRICTION: Only see grievances for HR/General/Admin
                                        if (isHR) {
                                            if (!hrDepts.includes(grievanceDept)) return false;
                                            // Additional check: Ensure specific dept filter is respected
                                            if (selectedDepartment !== 'All' && g.department !== selectedDepartment) return false;
                                            return true;
                                        }

                                        // NON-HR RESTRICTION:
                                        // 1. Should NOT see HR grievances (backend ensures this via /department route but good to double check)
                                        if (hrDepts.includes(grievanceDept)) return false;

                                        // 2. Only see Worker grievances
                                        if (g.role !== 'worker') return false;

                                        return true;
                                    })}
                                    onResolve={handleResolve}
                                    onReply={handleReply}
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
                                <SentGrievancesTable grievances={sentGrievances} onReply={handleReply} />
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
                        <SentGrievancesTable grievances={sentGrievances} onReply={handleReply} />
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

// Sub-component for Sent Grievances Table
const SentGrievancesTable = ({ grievances, onReply }: { grievances: SentGrievance[], onReply: (id: string, msg: string) => void }) => {
    const [selectedGrievance, setSelectedGrievance] = useState<SentGrievance | null>(null);
    const [replyText, setReplyText] = useState('');

    const openDetails = (g: SentGrievance) => {
        setSelectedGrievance(g);
    };

    const closeDetails = () => {
        setSelectedGrievance(null);
        setReplyText('');
    };

    const handleSendReply = () => {
        if (!selectedGrievance || !replyText.trim()) return;
        onReply(selectedGrievance._id, replyText);
        setReplyText('');
        // Optimistic UI update or re-fetch handled by parent, 
        // but let's clear input.
    };

    // Sort replies to show latest last or first? usually chat style is bottom latest.
    const sortedReplies = selectedGrievance?.replies ? [...selectedGrievance.replies].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) : [];


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
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {grievances.map((g) => {
                                const dateObj = new Date(g.createdAt);
                                return (
                                    <tr key={g._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer" onClick={() => openDetails(g)}>
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{g.title}</td>
                                        <td className="px-6 py-4 text-text-muted">{dateObj.toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase
                                                ${g.status === 'resolved' ? 'bg-green-100 text-green-700' :
                                                    g.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'}`}>
                                                {g.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button className="text-primary hover:underline text-xs font-bold">View</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Worker Detail Modal */}
            {selectedGrievance && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={closeDetails}>
                    <div className="bg-white dark:bg-surface-dark rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-100 dark:border-border-dark flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedGrievance.title}</h3>
                                <p className="text-sm text-text-muted mt-1">
                                    Submitted on {new Date(selectedGrievance.createdAt).toLocaleDateString()} • {selectedGrievance.department}
                                </p>
                            </div>
                            <button onClick={closeDetails} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 space-y-6">
                            <div className="prose dark:prose-invert max-w-none">
                                <h4 className='text-sm font-bold uppercase text-gray-500'>Description</h4>
                                <p>{selectedGrievance.description === "[Voice Recording Attached]" || !selectedGrievance.description ? "No description" : selectedGrievance.description}</p>
                            </div>

                            <div className="border-t border-gray-100 dark:border-border-dark pt-6">
                                <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined">forum</span>
                                    Discussion
                                </h4>

                                <div className="space-y-4 mb-6">
                                    {sortedReplies.map((reply: any, idx: number) => {
                                        const isStaff = reply.role === 'official' || reply.role === 'hr';
                                        return (
                                            <div key={idx} className={`flex gap-3 ${!isStaff ? 'justify-end' : ''}`}>
                                                {isStaff && (
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                                        {reply.senderId?.name ? reply.senderId.name.charAt(0) : 'O'}
                                                    </div>
                                                )}
                                                <div className={`max-w-[80%] p-3 rounded-2xl ${!isStaff
                                                    ? 'bg-primary text-white rounded-br-none'
                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none'
                                                    }`}>
                                                    <div className="text-xs font-bold mb-1 opacity-80">
                                                        {reply.senderId?.name || 'User'} <span className='opacity-70 font-normal'>({reply.role})</span>
                                                    </div>
                                                    <p className="text-sm">{reply.message}</p>
                                                    <span className="text-[10px] opacity-70 mt-1 block text-right">
                                                        {new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                {!isStaff && (
                                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                                                        You
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                    {sortedReplies.length === 0 && (
                                        <p className="text-center text-text-muted italic text-sm">No replies yet.</p>
                                    )}
                                </div>

                                {/* Reply Input */}
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        className="flex-1 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder={selectedGrievance.status === 'resolved' || selectedGrievance.status === 'rejected' ? "This grievance is closed" : "Type a reply..."}
                                        value={replyText}
                                        onChange={e => setReplyText(e.target.value)}
                                        onKeyPress={e => e.key === 'Enter' && handleSendReply()}
                                        disabled={selectedGrievance.status === 'resolved' || selectedGrievance.status === 'rejected'}
                                    />
                                    <button
                                        onClick={handleSendReply}
                                        disabled={!replyText.trim() || selectedGrievance.status === 'resolved' || selectedGrievance.status === 'rejected'}
                                        className="p-3 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <span className="material-symbols-outlined">send</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Grievances;
