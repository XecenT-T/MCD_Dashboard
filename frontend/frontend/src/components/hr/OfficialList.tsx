import React from 'react';
import type { Official } from '../../hooks/useHRData';

interface OfficialListProps {
    officials: Official[];
}

const OfficialList: React.FC<OfficialListProps> = ({ officials }) => {
    return (
        <div className="bg-white dark:bg-surface-dark border border-gray-100 dark:border-border-dark rounded-2xl p-6 shadow-sm h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-purple-600">supervisor_account</span>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Active Officials</h3>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
                {officials.map((official) => (
                    <div key={official.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm">
                                {official.name.charAt(0)}
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-gray-900 dark:text-white">{official.name}</h4>
                                <p className="text-xs text-text-muted">{official.department}</p>
                            </div>
                        </div>
                        <button className="h-8 w-8 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary transition-all">
                            <span className="material-symbols-outlined text-[18px]">more_vert</span>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OfficialList;
