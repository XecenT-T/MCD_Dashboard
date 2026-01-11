import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useLanguage } from '../context/LanguageContext';
import api from '../api/axios';

const DepartmentLeaves = () => {
    const { t } = useLanguage();
    const [leaves, setLeaves] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('Pending');

    useEffect(() => {
        fetchLeaves();
    }, []);

    const fetchLeaves = async () => {
        try {
            const res = await api.get('/api/leaves/department');
            setLeaves(res.data);
        } catch (error) {
            console.error("Failed to fetch leaves", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, status: string) => {
        try {
            await api.patch(`/api/leaves/${id}/status`, { status });
            // Update local state
            setLeaves(prev => prev.map(leave => leave._id === id ? { ...leave, status } : leave));
        } catch (error) {
            console.error(`Failed to update status to ${status}`, error);
            alert("Failed to update status");
        }
    };

    const filteredLeaves = leaves.filter(leave => filter === 'All' || leave.status === filter);

    return (
        <DashboardLayout title={t('dept_leaves')}>
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-gray-100 dark:border-border-dark">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('leave_requests')}</h2>

                    <div className="flex gap-2">
                        {['Pending', 'Approved', 'Rejected', 'All'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === status
                                        ? 'bg-primary text-white shadow-md'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                            >
                                {status === 'All' ? t('filter_all') : t(`status_${status.toLowerCase()}`) || status}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center p-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-border-dark overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 dark:bg-gray-800/50">
                                <tr>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">{t('employee_header')}</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">{t('leave_type')}</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">{t('dates')}</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">{t('reason')}</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">{t('status_header')}</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">{t('doc_actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {filteredLeaves.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-gray-500">{t('no_records')}</td>
                                    </tr>
                                ) : (
                                    filteredLeaves.map((leave) => (
                                        <tr key={leave._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
                                                        {leave.user?.name?.charAt(0) || 'U'}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{leave.user?.name || 'Unknown User'}</p>
                                                        <p className="text-xs text-text-muted">{leave.role}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm text-gray-700 dark:text-gray-300">
                                                <span className="px-2 py-1 rounded bg-blue-50 text-blue-600 text-xs font-medium border border-blue-100">
                                                    {leave.type}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                                                {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate" title={leave.reason}>
                                                {leave.reason}
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${leave.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                                        leave.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                            'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {leave.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                {leave.status === 'Pending' && (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleStatusUpdate(leave._id, 'Approved')}
                                                            className="size-8 flex items-center justify-center rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                                                            title="Approve"
                                                        >
                                                            <span className="material-symbols-outlined text-[20px]">check</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusUpdate(leave._id, 'Rejected')}
                                                            className="size-8 flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                                            title="Reject"
                                                        >
                                                            <span className="material-symbols-outlined text-[20px]">close</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default DepartmentLeaves;
