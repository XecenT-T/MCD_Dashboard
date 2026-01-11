import { useState, useEffect } from 'react';
import type { Grievance } from '../../hooks/useHRData';
import { useAuth } from '../../context/AuthContext';
import GrievanceDetailsModal from '../GrievanceDetailsModal';

interface GrievanceManagementSystemProps {
    grievances: Grievance[];
    onResolve: (id: string) => void;
    onReply: (id: string, message: string) => Promise<void>;
    // onToggleApproval invalid now
}

import { useLanguage } from '../../context/LanguageContext';

const GrievanceManagementSystem: React.FC<GrievanceManagementSystemProps> = ({ grievances, onResolve, onReply }) => {
    const { t } = useLanguage();
    const [filter, setFilter] = useState<'All' | 'official' | 'worker'>('All');
    const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);

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

    // Check if user can resolve the selected grievance
    const canResolve = (grievance: Grievance) => {
        if (!user || (user.role !== 'official' && user.role !== 'hr')) return false;

        const grievanceDept = (grievance.department || '').toLowerCase().trim();
        const hrDepartments = ["general", "administration", "hr"];

        // If grievance is for HR logic
        if (hrDepartments.includes(grievanceDept)) {
            // Must be HR role OR Official in HR-related dept
            return isHR;
        }

        // If grievance is for Dept X -> Only Dept X official resolves.
        // STRICT: HR cannot resolve unrelated departments.
        return grievanceDept === userDept;
    };

    return (
        <div className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-border-dark shadow-sm flex flex-col h-full">
            <div className="p-6 border-b border-gray-100 dark:border-border-dark flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-red-500">report_problem</span>
                        {t('grievance_hub')}
                    </h3>
                    <p className="text-sm text-text-muted mt-1">{t('grievance_hub_desc')}</p>
                </div>
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg self-start">
                    {(['All', 'official', 'worker'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all capitalize ${filter === f ? 'bg-white dark:bg-surface-dark shadow-sm text-primary' : 'text-gray-500 dark:text-gray-400'}`}
                        >
                            {f === 'official' ? t('filter_officials') : f === 'worker' ? t('filter_workers') : t('filter_all')}
                        </button>
                    ))}
                </div>
            </div>
            <div className="overflow-y-auto max-h-[400px]">
                {filteredGrievances.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">{t('no_records')}</div>
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
                <GrievanceDetailsModal
                    grievance={selectedGrievance}
                    onClose={() => setSelectedGrievance(null)}
                    onResolve={onResolve}
                    onReply={onReply}
                    canResolve={canResolve(selectedGrievance)}
                />
            )}
        </div>
    );
};

export default GrievanceManagementSystem;
