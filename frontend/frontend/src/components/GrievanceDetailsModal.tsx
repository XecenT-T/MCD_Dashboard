import React, { useState } from 'react';
import type { Grievance } from '../hooks/useHRData';
import ProfileModal from './ProfileModal';

interface GrievanceDetailsModalProps {
    grievance: Grievance;
    onClose: () => void;
    onResolve?: (id: string) => void;
    onReply?: (id: string, message: string) => Promise<void>;
    canResolve: boolean;
}

const GrievanceDetailsModal: React.FC<GrievanceDetailsModalProps> = ({ grievance, onClose, onResolve, onReply, canResolve }) => {
    const [viewProfileUser, setViewProfileUser] = useState<any | null>(null);
    const [replyText, setReplyText] = useState('');
    const [replying, setReplying] = useState(false);

    // Derived State
    const isClosed = grievance.status === 'Resolved' || grievance.status === 'Rejected';

    const openProfile = () => {
        if (grievance.submitterProfile) {
            setViewProfileUser({
                ...grievance.submitterProfile,
                id: grievance.submitterProfile._id // Ensure ID mapping
            });
        } else {
            // Fallback (Legacy)
            setViewProfileUser({
                name: grievance.submittedBy,
                role: grievance.role,
                department: grievance.department,
                _id: 'unknown',
                email: 'Not available',
                id: 'unknown'
            });
        }
    };

    const handleSendReply = async () => {
        if (!replyText.trim() || !onReply) return;
        setReplying(true);
        try {
            await onReply(grievance.id, replyText);
            setReplyText('');
        } catch (error) {
            console.error(error);
        } finally {
            setReplying(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-surface-dark rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/10 p-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center font-bold text-blue-700 dark:text-blue-200">
                            {grievance.submittedBy.charAt(0)}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{grievance.submittedBy}</p>
                            <p className="text-xs text-text-muted capitalize">{grievance.department} Dept.</p>
                        </div>
                    </div>
                    <button
                        onClick={openProfile}
                        className="px-3 py-1.5 bg-white dark:bg-surface-dark text-primary text-xs font-bold rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        View Profile
                    </button>
                </div>

                {/* Title & Actions Header */}
                <div className="p-6 border-b border-gray-100 dark:border-border-dark flex justify-between items-start shrink-0">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{grievance.subject}</h3>
                        <div className="flex items-center gap-2 mt-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${grievance.role === 'official'
                                ? 'bg-purple-50 text-purple-600 border-purple-100'
                                : 'bg-blue-50 text-blue-600 border-blue-100'
                                }`}>
                                {grievance.role}
                            </span>
                            <span className="text-sm text-text-muted">{grievance.date}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ml-2 ${grievance.status === 'Resolved'
                                ? 'bg-green-100 text-green-700 border-green-200'
                                : grievance.status === 'Rejected'
                                    ? 'bg-red-100 text-red-700 border-red-200'
                                    : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                }`}>
                                {grievance.status}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {/* Resolve Button */}
                        {grievance.status !== 'Resolved' && canResolve && onResolve && (
                            <button
                                onClick={() => onResolve(grievance.id)}
                                className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-green-700 transition-colors flex items-center gap-1"
                            >
                                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                Mark Resolved
                            </button>
                        )}
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="p-6 space-y-6 overflow-y-auto">
                    {/* Grievance Description */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl text-sm text-gray-700 dark:text-gray-300">
                        {grievance.description === "[Voice Recording Attached]" || !grievance.description ? "No description" : grievance.description}
                    </div>

                    {/* Discussion Section */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-gray-400 text-lg">forum</span>
                            Discussion
                        </h4>

                        <div className="space-y-3 pl-2 border-l-2 border-gray-100 dark:border-gray-800">
                            {grievance.replies && grievance.replies.length > 0 ? (
                                // Sort by createdAt if needed, but assuming backend sends sorted or we sort here
                                [...grievance.replies].sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).map((reply, idx) => (
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
                                placeholder={isClosed ? "Discussion Closed" : "Type your reply..."}
                                className="flex-1 px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                                disabled={isClosed}
                            />
                            <button
                                onClick={handleSendReply}
                                disabled={replying || !replyText.trim() || isClosed}
                                className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg shadow-sm hover:bg-primary-dark disabled:opacity-50 disabled:grayscale transition-colors"
                            >
                                {replying ? 'Sending...' : 'Reply'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {viewProfileUser && <ProfileModal user={viewProfileUser} onClose={() => setViewProfileUser(null)} />}
        </div>
    );
};

export default GrievanceDetailsModal;
