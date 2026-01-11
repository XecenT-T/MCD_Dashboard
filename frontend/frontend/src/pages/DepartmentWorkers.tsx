import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api/axios';
import { useLanguage } from '../context/LanguageContext';

const DepartmentWorkers = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [workers, setWorkers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchWorkers = async () => {
            try {
                const res = await api.get('/api/auth/department-workers');
                setWorkers(res.data);
            } catch (err) {
                console.error("Failed to fetch workers", err);
            } finally {
                setLoading(false);
            }
        };
        fetchWorkers();
    }, []);

    const filteredWorkers = workers.filter(w =>
        w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (w.post || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (w.phoneNo || '').includes(searchTerm)
    );

    if (!user || (user.role !== 'official' && user.role !== 'hr')) {
        return <div className="p-10 text-center">{t('access_denied')}</div>;
    }

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('dept_workforce')}</h2>
                        <p className="text-text-muted">{t('managing_workers')} {user.department}</p>
                    </div>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                        <input
                            type="text"
                            placeholder={t('search_workers')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark focus:ring-2 focus:ring-primary focus:outline-none w-full sm:w-64"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="p-10 text-center text-gray-500">{t('loading_workforce')}</div>
                ) : (
                    <div className="bg-white dark:bg-surface-dark rounded-xl border border-gray-100 dark:border-border-dark shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-medium">
                                    <tr>
                                        <th className="p-4">{t('employee_header')}</th>
                                        <th className="p-4">{t('post_designation')}</th>
                                        <th className="p-4">{t('contact_header')}</th>
                                        <th className="p-4">{t('status_header')}</th>
                                        {/* <th className="p-4">Actions</th> */}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {filteredWorkers.length > 0 ? (
                                        filteredWorkers.map((worker) => (
                                            <tr key={worker._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold overflow-hidden">
                                                            {worker.profileImage ? (
                                                                <img src={worker.profileImage} alt={worker.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                worker.name.charAt(0)
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-900 dark:text-white">{worker.name}</div>
                                                            <div className="text-xs text-text-muted">{worker.username}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-gray-600 dark:text-gray-300">
                                                    {worker.post || t('worker')}
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-gray-900 dark:text-white">{worker.phoneNo}</div>
                                                    <div className="text-xs text-text-muted">{worker.email}</div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-col gap-1 items-start">
                                                        {worker.isFaceRegistered ? (
                                                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase border border-green-200">{t('face_reg')}</span>
                                                        ) : (
                                                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-bold rounded uppercase border border-yellow-200">{t('pending_face')}</span>
                                                        )}
                                                        {worker.isOnboarded ? (
                                                            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded uppercase border border-blue-100">{t('onboarded')}</span>
                                                        ) : (
                                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded uppercase border border-gray-200">{t('new_status')}</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-gray-500">{t('no_records')}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default DepartmentWorkers;
