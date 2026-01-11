import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api/axios';
import AttendanceChart from '../components/AttendanceChart';

const WorkerAttendanceHistory = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [workerName, setWorkerName] = useState('Worker');

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await api.get(`/api/attendance/user/${userId}`);
                setRecords(res.data);
                // Ideally API should return user details too, but we can fetch name separately or pass it.
                // For MVP, just showing list.
            } catch (err) {
                console.error("Failed to fetch worker history", err);
            } finally {
                setLoading(false);
            }
        };
        if (userId) fetchHistory();
    }, [userId]);

    // Calculate chart data from records (Group by Week - Simplified to last 7 days for demo?)
    // Let's group by "Day" for the chart, last 7 entries.
    const chartData = records.slice(0, 7).reverse().map(r => ({
        name: new Date(r.date).toLocaleDateString('en-IN', { weekday: 'short' }),
        present: r.status === 'Present' ? 1 : 0,
        absent: r.status !== 'Present' ? 1 : 0
    }));

    if (!user || user.role !== 'official') {
        return <div className="p-10 text-center">Access Denied</div>;
    }

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance History</h2>
                        <p className="text-text-muted">Viewing records for ID: {userId}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Chart Section */}
                    <div className="lg:col-span-3 bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-border-dark shadow-sm h-80">
                        <h3 className="font-bold mb-4">Recent Activity</h3>
                        <AttendanceChart isOfficial={true} data={chartData.length ? chartData : undefined} />
                    </div>

                    {/* Table Section */}
                    <div className="lg:col-span-3 bg-white dark:bg-surface-dark rounded-xl border border-gray-100 dark:border-border-dark shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 dark:border-border-dark">
                            <h3 className="font-bold">Detailed Records</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-800/50">
                                    <tr>
                                        <th className="p-4">Date</th>
                                        <th className="p-4">Time</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Location</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {records.map((r) => (
                                        <tr key={r._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <td className="p-4">{new Date(r.date).toLocaleDateString()}</td>
                                            <td className="p-4">{r.checkInTime}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${r.status === 'Present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {r.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-xs text-text-muted max-w-xs truncate">{r.location?.address}</td>
                                        </tr>
                                    ))}
                                    {records.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center text-text-muted">No records found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default WorkerAttendanceHistory;
