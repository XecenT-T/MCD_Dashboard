import React, { useState } from 'react';
import type { LeaveRequest } from '../../hooks/useHRData';

interface LeaveManagementTableProps {
    requests: LeaveRequest[];
    onUpdateStatus: (id: string, status: LeaveRequest['status']) => void;
}

const LeaveManagementTable: React.FC<LeaveManagementTableProps> = ({ requests, onUpdateStatus }) => {
    const [roleFilter, setRoleFilter] = useState<'All' | 'supervisor' | 'worker'>('All');

    const filteredRequests = requests.filter(r => (roleFilter === 'All' || r.role === roleFilter) && r.status === 'Pending');

    return (
        <div className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-border-dark shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-gray-100 dark:border-border-dark flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-orange-500">flight_takeoff</span>
                        Leave Requests
                    </h3>
                    <p className="text-sm text-text-muted mt-1">Pending approvals</p>
                </div>
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                    {(['All', 'supervisor', 'worker'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setRoleFilter(f)}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all capitalize ${roleFilter === f ? 'bg-white dark:bg-surface-dark shadow-sm text-primary' : 'text-gray-500 dark:text-gray-400'}`}
                        >
                            {f === 'supervisor' ? 'Sup.' : f === 'worker' ? 'Work.' : 'All'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="overflow-x-auto flex-1">
                {filteredRequests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                        <span className="material-symbols-outlined text-4xl mb-2 opacity-50">event_available</span>
                        <p>No pending leave requests</p>
                    </div>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 font-medium">
                            <tr>
                                <th className="px-6 py-4">Applicant</th>
                                <th className="px-6 py-4">Type & Dates</th>
                                <th className="px-6 py-4">Reason</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {filteredRequests.map((request) => (
                                <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900 dark:text-white">{request.applicant}</div>
                                        <div className="flex items-center gap-1 mt-1">
                                            <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold border ${request.role === 'supervisor' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                                {request.role}
                                            </span>
                                            <span className="text-xs text-text-muted">• {request.department}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-800 dark:text-gray-200">{request.type}</div>
                                        <div className="text-xs text-text-muted mt-0.5 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[10px]">calendar_month</span>
                                            {request.dates}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="max-w-[200px] truncate text-gray-600 dark:text-gray-400" title={request.reason}>
                                            {request.reason}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => onUpdateStatus(request.id, 'Approved')}
                                                className="p-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-colors group"
                                                title="Approve"
                                            >
                                                <span className="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform">check</span>
                                            </button>
                                            <button
                                                onClick={() => onUpdateStatus(request.id, 'Rejected')}
                                                className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors group"
                                                title="Reject"
                                            >
                                                <span className="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform">close</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default LeaveManagementTable;
