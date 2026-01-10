import React from 'react';
import type { Supervisor } from '../../hooks/useHRData';

interface SupervisorListProps {
    supervisors: Supervisor[];
}

const SupervisorList: React.FC<SupervisorListProps> = ({ supervisors }) => {
    return (
        <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-border-dark shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-purple-600">supervisor_account</span>
                Active Supervisors
            </h3>

            <div className="space-y-4">
                {supervisors.map((supervisor) => (
                    <div key={supervisor.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 flex items-center justify-center text-purple-600 dark:text-purple-300 font-bold">
                                {supervisor.name.charAt(0)}
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-gray-900 dark:text-white">{supervisor.name}</h4>
                                <p className="text-xs text-text-muted">{supervisor.department}</p>
                            </div>
                        </div>
                        <button className="size-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/10 transition-colors" title="Contact">
                            <span className="material-symbols-outlined text-[20px]">call</span>
                        </button>
                    </div>
                ))}
            </div>

            <button className="w-full mt-6 py-2 text-sm font-bold text-primary hover:bg-primary/5 rounded-lg transition-colors">
                View All Directory
            </button>
        </div>
    );
};

export default SupervisorList;
