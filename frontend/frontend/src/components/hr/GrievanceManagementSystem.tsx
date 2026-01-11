import { useState, useEffect } from 'react';
import type { Grievance } from '../../hooks/useHRData';
import ProfileModal from '../ProfileModal';
import { useAuth } from '../../context/AuthContext';

interface GrievanceManagementSystemProps {
    grievances: Grievance[];
    onResolve: (id: string) => void;
    onReply: (id: string, message: string) => Promise<void>;
    // onToggleApproval invalid now
}

const GrievanceManagementSystem: React.FC<GrievanceManagementSystemProps> = ({ grievances, onResolve, onReply }) => {
    const [filter, setFilter] = useState<'All' | 'official' | 'worker'>('All');
    const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);
    const [viewProfileUser, setViewProfileUser] = useState<any | null>(null);
    const [replyText, setReplyText] = useState('');
    const [replying, setReplying] = useState(false);

    const { user } = useAuth();
    const department = (user?.department || '').toLowerCase().trim();
    // Prioritize 'hr' role. Legacy fallback: Official + HR department
    const isHR = user?.role === 'hr' || (user?.role === 'official' && ['general', 'administration', 'hr'].includes(department));
    const userDept = (user?.department || '').toLowerCase().trim();

    // Derived state for filtered grievances
    const filteredGrievances = grievances.filter(g => filter === 'All' || g.role === filter);

    // Sync selectedGrievance with updated grievances list to reflect changes immediately
    useEffect(() => {
        if (selectedGrievance) {
            const updated = grievances.find(g => g.id === selectedGrievance.id);
            if (updated && updated !== selectedGrievance) {
                setSelectedGrievance(updated);
            }
        }
    }, [grievances, selectedGrievance]);

    const openProfile = (g: Grievance) => {
        if (g.submitterProfile) {
            setViewProfileUser({
                ...g.submitterProfile,
                id: g.submitterProfile._id // Ensure ID mapping
            });
        } else {
            // Fallback (Legacy)
            setViewProfileUser({
                name: g.submittedBy,
                role: g.role,
                department: g.department,
                _id: 'unknown',
                email: 'Not available',
                id: 'unknown'
            });
        }
    };

    const handleSendReply = async () => {
        if (!replyText.trim() || !selectedGrievance || !onReply) return;
        setReplying(true);
        try {
            await onReply(selectedGrievance.id, replyText);
            setReplyText('');
        } catch (error) {
            console.error(error);
        } finally {
            setReplying(false);
        }
    };

    // Check if user can resolve the selected grievance
    const canResolve = (grievance: Grievance) => {
        if (!user || (user.role !== 'official' && user.role !== 'hr')) return false;

        const grievanceDept = (grievance.department || '').toLowerCase().trim();
        const hrDepartments = ["general", "administration", "hr"];

        // console.log(`Debug Resolve: userDept='${userDept}' grievanceDept='${grievanceDept}' role='${user.role}'`);

        // If grievance is for HR logic
        if (hrDepartments.includes(grievanceDept)) {
            // Must be HR role OR Official in HR-related dept
            return isHR;
        }

        // If grievance is for Dept X -> Only Dept X official resolves.
        // STRICT: HR cannot resolve unrelated departments.
        return grievanceDept === userDept;
    };

    const isClosed = (g: Grievance) => g.status === 'Resolved' || g.status === 'Rejected';

    return (
        <div className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-border-dark shadow-sm flex flex-col h-full">
            <div className="p-6 border-b border-gray-100 dark:border-border-dark flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-red-500">report_problem</span>
                        Grievance Hub
                    </h3>
                    <p className="text-sm text-text-muted mt-1">Review and resolve issues</p>
                </div>
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg self-start">
                    {(['All', 'official', 'worker'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all capitalize ${filter === f ? 'bg-white dark:bg-surface-dark shadow-sm text-primary' : 'text-gray-500 dark:text-gray-400'}`}
                        >
                            {f === 'official' ? 'Officials' : f === 'worker' ? 'Workers' : 'All'}
                        </button>
                    ))}
                </div>
            </div>
            <div className="overflow-y-auto max-h-[400px]">
                {filteredGrievances.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No grievances found.</div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {filteredGrievances.map((grievance) => (
                            <div
                                key={grievance.id}
                                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group flex items-center justify-between"
                                onClick={() => setSelectedGrievance(grievance)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-lg ${grievance.role === 'official' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                                        <span className="material-symbols-outlined text-[20px]">
                                            {grievance.role === 'official' ? 'admin_panel_settings' : 'engineering'}
                                        </span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white text-sm group-hover:text-primary transition-colors">
                                            {grievance.subject}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-text-muted">{grievance.submittedBy}</span>
                                            <span className="text-xs text-gray-300">•</span>
                                            <span className="text-xs text-text-muted">{grievance.date}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase
                                        ${grievance.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                                            grievance.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'}`}>
                                        {grievance.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedGrievance && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => setSelectedGrievance(null)}>
                    <div className="bg-white dark:bg-surface-dark rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>

                        {/* Header */}
                        <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/10 p-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center font-bold text-blue-700 dark:text-blue-200">
                                    {selectedGrievance.submittedBy.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedGrievance.submittedBy}</p>
                                    <p className="text-xs text-text-muted capitalize">{selectedGrievance.department} Dept.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => openProfile(selectedGrievance)}
                                className="px-3 py-1.5 bg-white dark:bg-surface-dark text-primary text-xs font-bold rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                View Profile
                            </button>
                        </div>

                        {/* Title & Actions Header */}
                        <div className="p-6 border-b border-gray-100 dark:border-border-dark flex justify-between items-start shrink-0">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedGrievance.subject}</h3>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${selectedGrievance.role === 'official'
                                        ? 'bg-purple-50 text-purple-600 border-purple-100'
                                        : 'bg-blue-50 text-blue-600 border-blue-100'
                                        }`}>
                                        {selectedGrievance.role}
                                    </span>
                                    <span className="text-sm text-text-muted">{selectedGrievance.date}</span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ml-2 ${selectedGrievance.status === 'Resolved'
                                        ? 'bg-green-100 text-green-700 border-green-200'
                                        : selectedGrievance.status === 'Rejected'
                                            ? 'bg-red-100 text-red-700 border-red-200'
                                            : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                        }`}>
                                        {selectedGrievance.status}
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                {/* Resolve Button */}
                                {selectedGrievance.status !== 'Resolved' && canResolve(selectedGrievance) && onResolve && (
                                    <button
                                        onClick={() => onResolve(selectedGrievance.id)}
                                        className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-green-700 transition-colors flex items-center gap-1"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                        Mark Resolved
                                    </button>
                                )}
                                <button onClick={() => setSelectedGrievance(null)} className="text-gray-400 hover:text-gray-600">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="p-6 space-y-6 overflow-y-auto">
                            {/* Grievance Description */}
                            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl text-sm text-gray-700 dark:text-gray-300">
                                {selectedGrievance.description === "[Voice Recording Attached]" || !selectedGrievance.description ? "No description" : selectedGrievance.description}
                            </div>

                            {/* Discussion Section */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-gray-400 text-lg">forum</span>
                                    Discussion
                                </h4>

                                <div className="space-y-3 pl-2 border-l-2 border-gray-100 dark:border-gray-800">
                                    {selectedGrievance.replies && selectedGrievance.replies.length > 0 ? (
                                        selectedGrievance.replies.map((reply, idx) => (
                                            <div key={idx} className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 p-3 rounded-lg shadow-sm">
                                                <div className="flex justify-between items-center mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-gray-900 dark:text-white">
                                                            {reply.senderId?.name || reply.role}
                                                        </span>
                                                        <span className='text-[10px] text-gray-400 capitalize'>({reply.role})</span>
                                                    </div>
                                                    <span className="text-[10px] text-gray-400">{new Date(reply.createdAt).toLocaleString()}</span>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">{reply.message}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-text-muted italic">No replies yet.</p>
                                    )}
                                </div>

                                {/* Reply Input */}
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder={isClosed(selectedGrievance) ? "Discussion Closed" : "Type your reply..."}
                                        className="flex-1 px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                                        disabled={isClosed(selectedGrievance)}
                                    />
                                    <button
                                        onClick={handleSendReply}
                                        disabled={replying || !replyText.trim() || isClosed(selectedGrievance)}
                                        className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg shadow-sm hover:bg-primary-dark disabled:opacity-50 disabled:grayscale transition-colors"
                                    >
                                        {replying ? 'Sending...' : 'Reply'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {viewProfileUser && <ProfileModal user={viewProfileUser} onClose={() => setViewProfileUser(null)} />}
        </div>
    );
};



export default GrievanceManagementSystem;
