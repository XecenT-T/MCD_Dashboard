import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api/axios';

import { useNavigate } from 'react-router-dom';

const DepartmentAttendance = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/api/attendance/department-stats');
                setStats(res.data.workers || []); // Updated structure
            } catch (err) {
                console.error("Failed to fetch attendance stats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const filteredStats = stats.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.post.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!user || (user.role !== 'official' && user.role !== 'hr')) {
        return <div className="p-10 text-center">Access Denied</div>;
    }

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance Overview</h2>
                        <p className="text-text-muted">Tracking monthly presence for {user.department}</p>
                    </div>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                        <input
                            type="text"
                            placeholder="Search employee..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark focus:ring-2 focus:ring-primary focus:outline-none w-full sm:w-64"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="p-10 text-center text-gray-500">Loading attendance data...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredStats.map((stat) => (
                            <div
                                key={stat._id}
                                onClick={() => navigate(`/department-attendance/${stat._id}`)}
                                className="bg-white dark:bg-surface-dark p-5 rounded-xl border border-gray-100 dark:border-border-dark shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-primary/30"
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="size-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold overflow-hidden">
                                        {stat.profileImage ? (
                                            <img src={stat.profileImage} alt={stat.name} className="w-full h-full object-cover" />
                                        ) : (
                                            stat.name.charAt(0)
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white">{stat.name}</h3>
                                        <p className="text-xs text-text-muted">{stat.post}</p>
                                    </div>
                                    <div className="ml-auto text-right">
                                        <div className="text-lg font-bold text-gray-900 dark:text-white">{stat.percentage}%</div>
                                        <div className="text-[10px] text-text-muted">Attendance</div>
                                    </div>
                                </div>

                                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 mb-3">
                                    <div
                                        className={`h-2 rounded-full ${stat.percentage >= 90 ? 'bg-green-500' :
                                            stat.percentage >= 75 ? 'bg-blue-500' :
                                                stat.percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                            }`}
                                        style={{ width: `${stat.percentage}%` }}
                                    ></div>
                                </div>

                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>{stat.presentDays} Present</span>
                                    <span>{stat.totalDays - stat.presentDays} Absent/Off</span>
                                    <span>{stat.totalDays} Total Days</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && filteredStats.length === 0 && (
                    <div className="p-10 text-center text-gray-500">No records found.</div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default DepartmentAttendance;
