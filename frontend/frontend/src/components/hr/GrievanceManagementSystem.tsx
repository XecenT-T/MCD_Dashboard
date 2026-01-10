import { useState } from 'react';
import type { Grievance } from '../../hooks/useHRData';

interface GrievanceManagementSystemProps {
    grievances: Grievance[];
    onUpdateStatus: (id: string, status: Grievance['status']) => void;
}

const GrievanceManagementSystem: React.FC<GrievanceManagementSystemProps> = ({ grievances, onUpdateStatus }) => {
    const [filter, setFilter] = useState<'All' | 'supervisor' | 'worker'>('All');

    // Derived state for filtered grievances
    const filteredGrievances = grievances.filter(g => filter === 'All' || g.role === filter);

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
                    {(['All', 'supervisor', 'worker'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all capitalize ${filter === f ? 'bg-white dark:bg-surface-dark shadow-sm text-primary' : 'text-gray-500 dark:text-gray-400'}`}
                        >
                            {f === 'supervisor' ? 'Supervisors' : f === 'worker' ? 'Workers' : 'All'}
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
                            <div key={grievance.id} className="p-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${grievance.role === 'supervisor'
                                            ? 'bg-purple-50 text-purple-600 border-purple-100'
                                            : 'bg-blue-50 text-blue-600 border-blue-100'
                                            }`}>
                                            {grievance.role}
                                        </span>
                                        <span className="text-xs text-text-muted bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                                            {grievance.department}
                                        </span>
                                    </div>
                                    <span className="text-xs text-text-muted">{grievance.date}</span>
                                </div>

                                <h4 className="font-bold text-gray-900 dark:text-white mb-1 group-hover:text-primary transition-colors">
                                    {grievance.subject}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 ml-4 pl-3 border-l-2 border-gray-200 dark:border-gray-700 italic">
                                    "{grievance.description}"
                                </p>

                                <div className="flex items-center justify-between mt-4">
                                    <div className="flex items-center gap-2">
                                        <div className="size-6 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-300">
                                            {grievance.submittedBy.charAt(0)}
                                        </div>
                                        <span className="text-xs font-medium text-gray-900 dark:text-gray-200">{grievance.submittedBy}</span>
                                    </div>

                                    <div className="flex gap-2">
                                        {grievance.status === 'Resolved' ? (
                                            <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">
                                                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                                Resolved
                                            </span>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => onUpdateStatus(grievance.id, 'Resolved')}
                                                    className="px-3 py-1.5 text-xs font-bold text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                                                >
                                                    Resolve
                                                </button>
                                                <button
                                                    onClick={() => onUpdateStatus(grievance.id, 'Under Review')}
                                                    className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                                >
                                                    Review
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GrievanceManagementSystem;
