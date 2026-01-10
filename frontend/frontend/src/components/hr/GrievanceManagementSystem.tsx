import { useState, useEffect } from 'react';
import type { Grievance } from '../../hooks/useHRData';
import ProfileModal from '../ProfileModal';

interface GrievanceManagementSystemProps {
    grievances: Grievance[];
    onToggleApproval?: (id: string, role: 'supervisor' | 'hr', approved: boolean) => void;
}

const GrievanceManagementSystem: React.FC<GrievanceManagementSystemProps> = ({ grievances, onToggleApproval }) => {
    const [filter, setFilter] = useState<'All' | 'official' | 'worker'>('All');
    const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);
    const [viewProfileUser, setViewProfileUser] = useState<any | null>(null);

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
        // Construct a User-like object from the grievance data to pass to ProfileModal
        setViewProfileUser({
            name: g.submittedBy,
            role: g.role,
            department: g.department,
            _id: 'unknown',
            email: 'Loading...', // Placeholder
            id: 'unknown'
        });
    };

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

                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase
                                    ${grievance.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                                        grievance.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-700'}`}>
                                    {grievance.status}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedGrievance && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => setSelectedGrievance(null)}>
                    <div className="bg-white dark:bg-surface-dark rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                        {/* Profile Section - TOP PRIORITY */}
                        <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/10 p-4 border-b border-gray-100 dark:border-gray-800">
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

                        {/* Title & Info Header */}
                        <div className="p-6 border-b border-gray-100 dark:border-border-dark flex justify-between items-start">
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
                                </div>
                            </div>
                            <button onClick={() => setSelectedGrievance(null)} className="text-gray-400 hover:text-gray-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Grievance Description */}
                            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl text-sm text-gray-700 dark:text-gray-300">
                                {selectedGrievance.description}
                            </div>

                            {/* Approval Actions */}
                            <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
                                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Approval Action</h4>
                                <div className="flex flex-col gap-4">
                                    {/* Show Official (Supervisor) Approval only if submitter is NOT an official */}
                                    {selectedGrievance.role !== 'official' && (
                                        <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                            <div>
                                                <span className="block text-sm font-bold text-gray-900 dark:text-white">Official Recommendation</span>
                                                <span className="text-xs text-text-muted">Is this valid?</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => onToggleApproval && onToggleApproval(selectedGrievance.id, 'supervisor', false)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${selectedGrievance.supervisorApproval === false
                                                        ? 'bg-red-100 text-red-700 border-red-200'
                                                        : 'bg-white dark:bg-surface-dark text-gray-500 border-gray-200 hover:border-red-200 hover:text-red-600'
                                                        }`}
                                                >
                                                    Reject
                                                </button>
                                                <button
                                                    onClick={() => onToggleApproval && onToggleApproval(selectedGrievance.id, 'supervisor', true)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${selectedGrievance.supervisorApproval === true
                                                        ? 'bg-blue-100 text-blue-700 border-blue-200'
                                                        : 'bg-white dark:bg-surface-dark text-gray-500 border-gray-200 hover:border-blue-200 hover:text-blue-600'
                                                        }`}
                                                >
                                                    Approve
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-purple-50 dark:bg-purple-900/10">
                                        <div>
                                            <span className="block text-sm font-bold text-gray-900 dark:text-white">HR Final Approval</span>
                                            <span className="text-xs text-text-muted">Final decision</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => onToggleApproval && onToggleApproval(selectedGrievance.id, 'hr', false)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${selectedGrievance.hrApproval === false
                                                    ? 'bg-red-100 text-red-700 border-red-200'
                                                    : 'bg-white dark:bg-surface-dark text-gray-500 border-gray-200 hover:border-red-200 hover:text-red-600'
                                                    }`}
                                            >
                                                Reject
                                            </button>
                                            <button
                                                onClick={() => onToggleApproval && onToggleApproval(selectedGrievance.id, 'hr', true)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${selectedGrievance.hrApproval === true
                                                    ? 'bg-green-100 text-green-700 border-green-200'
                                                    : 'bg-white dark:bg-surface-dark text-gray-500 border-gray-200 hover:border-green-200 hover:text-green-600'
                                                    }`}
                                            >
                                                Approve
                                            </button>
                                        </div>
                                    </div>
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
