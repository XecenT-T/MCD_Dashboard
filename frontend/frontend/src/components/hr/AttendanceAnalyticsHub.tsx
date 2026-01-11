
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { DepartmentStats } from '../../hooks/useHRData';
import { useLanguage } from '../../context/LanguageContext';

interface AttendanceAnalyticsHubProps {
    data: DepartmentStats[];
}

const AttendanceAnalyticsHub: React.FC<AttendanceAnalyticsHubProps> = ({ data }) => {
    const { t } = useLanguage();

    return (
        <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-border-dark shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">analytics</span>
                        {t('attendance_analytics_hub')}
                    </h3>
                    <p className="text-sm text-text-muted mt-1">{t('real_time_presence')}</p>
                </div>
            </div>

            <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        barSize={20}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis
                            dataKey="department"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar dataKey="present" name={t('legend_present')} fill="#10B981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="absent" name={t('legend_absent')} fill="#EF4444" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="leave" name={t('legend_on_leave')} fill="#F59E0B" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4 border-t border-gray-100 dark:border-border-dark pt-6">
                {data.map((dept, idx) => (
                    <div key={idx} className="text-center">
                        <p className="text-xs font-bold text-gray-500 uppercase">{t(`dept_${dept.department.toLowerCase()}`) || dept.department}</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                            {Math.round((dept.present / dept.total) * 100)}%
                        </p>
                        <p className="text-[10px] text-green-600">{t('legend_present')}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AttendanceAnalyticsHub;
