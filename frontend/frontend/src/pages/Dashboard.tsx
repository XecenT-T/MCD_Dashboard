import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useDashboardView } from '../context/DashboardViewContext';
import FaceEnrollment from '../components/FaceEnrollment';
import FaceAuthentication from '../components/FaceAuthentication';
import GrievanceModal from '../components/GrievanceModal';
import { useNavigate } from 'react-router-dom';
import AttendanceChart from '../components/AttendanceChart';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api/axios';

const Dashboard = () => {
    const { user, reloadUser } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const isSupervisor = user?.role === 'supervisor';
    const { viewMode, setViewMode } = useDashboardView();

    const [showEnrollment, setShowEnrollment] = useState(false);
    const [showAuth, setShowAuth] = useState(false);
    const [showGrievance, setShowGrievance] = useState(false);
    const [showNoticeModal, setShowNoticeModal] = useState(false);

    // Auto-open Face Enrollment for first-time users
    useEffect(() => {
        if (user && !user.isFaceRegistered) {
            const timer = setTimeout(() => {
                setShowEnrollment(true);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [user]);

    const handleEnrollmentSuccess = async () => {
        await reloadUser();
        setShowEnrollment(false);
        navigate('/attendance');
    };

    const handleAttendanceSuccess = () => {
        setShowAuth(false);
        alert("Attendance Marked Successfully!");
    };

    const handleMarkIn = () => {
        if (user?.isFaceRegistered) {
            navigate('/attendance');
        } else {
            setShowEnrollment(true);
        }
    };

    const handleWIP = (feature: string) => {
        alert(`${feature} ${t('wip')}!`);
    };

    // Stats Data
    const workerStats = [
        { label: 'Days Present (Oct)', value: '18 / 22', icon: 'calendar_month', color: 'text-green-600', bg: 'bg-green-100', progress: 85 },
        { label: 'Leave Balance', value: '5 Days', sub: 'Expires Dec 31', icon: 'beach_access', color: 'text-yellow-600', bg: 'bg-yellow-100' },
        { label: 'Next Pay Date', value: 'Oct 31', sub: 'Payroll processing...', icon: 'payments', color: 'text-blue-600', bg: 'bg-blue-100' },
        { label: 'Pending Actions', value: '2 Items', sub: 'View details', icon: 'pending_actions', color: 'text-red-600', bg: 'bg-red-100' }
    ];

    const departmentStats = [
        { label: 'Total Workers', value: '45', sub: 'Active in Dept', icon: 'groups', color: 'text-blue-600', bg: 'bg-blue-100' },
        { label: 'Dept. Attendance', value: '92%', sub: 'Today', icon: 'fact_check', color: 'text-green-600', bg: 'bg-green-100', progress: 92 },
        { label: 'Pending Grievances', value: '7', sub: 'Action Required', icon: 'report_problem', color: 'text-red-600', bg: 'bg-red-100' },
        { label: 'Total Payroll', value: '₹ 12.5L', sub: 'This Month', icon: 'payments', color: 'text-purple-600', bg: 'bg-purple-100' }
    ];

    const currentStats = viewMode === 'department' ? departmentStats : workerStats;

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header & View Switcher */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            {t('welcome_back')}, {user?.name?.split(' ')[0]} <span className="text-2xl animate-wave">👋</span>
                        </h2>
                        <p className="text-text-muted mt-1">
                            {viewMode === 'department' ? `Managing ${user?.department || 'General'} Department` : t('what_happening')}
                        </p>
                    </div>

                    {isSupervisor && (
                        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                            <button
                                onClick={() => setViewMode('personal')}
                                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${viewMode === 'personal' ? 'bg-white dark:bg-surface-dark shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">person</span>
                                    My Profile
                                </div>
                            </button>
                            <button
                                onClick={() => setViewMode('department')}
                                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${viewMode === 'department' ? 'bg-white dark:bg-surface-dark shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">domain</span>
                                    Dept. Management
                                </div>
                            </button>
                        </div>
                    )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {currentStats.map((stat, index) => (
                        <div key={index} className="bg-white dark:bg-surface-dark p-5 rounded-xl border border-gray-100 dark:border-border-dark shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                                    <span className="material-symbols-outlined text-2xl">{stat.icon}</span>
                                </div>
                                {stat.progress && (
                                    <div className="size-10 rounded-full border-4 border-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400">
                                        {stat.progress}%
                                    </div>
                                )}
                            </div>
                            <div>
                                <h3 className="text-text-muted text-sm font-medium uppercase tracking-wider">{stat.label}</h3>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                                {stat.sub && <p className="text-xs text-gray-500 mt-1 font-medium">{stat.sub}</p>}
                                {stat.progress && (
                                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-3">
                                        <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${stat.progress}%` }}></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content Area */}
                {viewMode === 'personal' ? (
                    // PERSONAL VIEW (Same as original Worker View)
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-border-dark shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('attendance_overview')}</h3>
                                    <p className="text-sm text-text-muted">Monthly presence visualizer</p>
                                </div>
                                <button className="text-sm font-medium text-primary">{t('view_report')}</button>
                            </div>
                            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg p-2">
                                <AttendanceChart isSupervisor={isSupervisor} />
                            </div>
                        </div>

                        <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-border-dark shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">{t('quick_actions')}</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <QuickAction
                                    icon="fingerprint"
                                    label={user?.isFaceRegistered ? t('mark_in') : t('setup_face')}
                                    onClick={handleMarkIn}
                                    primary
                                />
                                <QuickAction icon="flight_takeoff" label={t('apply_leave')} color="text-orange-600" bg="bg-orange-50" onClick={() => handleWIP('Apply Leave')} />
                                <QuickAction icon="receipt_long" label={t('payslip')} color="text-indigo-600" bg="bg-indigo-50" onClick={() => navigate('/payroll')} />
                                <QuickAction icon="description" label={t('form_16')} color="text-teal-600" bg="bg-teal-50" onClick={() => handleWIP('Form 16')} />
                                <QuickAction icon="mic" label={t('submit_grievance')} color="text-red-600" bg="bg-red-50" onClick={() => navigate('/grievance-submission')} />
                            </div>
                        </div>
                    </div>
                ) : (
                    // DEPARTMENT VIEW
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            {/* Worker Management Table */}
                            <div className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-border-dark shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-gray-100 dark:border-border-dark flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Department Workers</h3>
                                    <button className="text-sm font-bold text-primary hover:underline">{t('view_all')}</button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 font-medium">
                                            <tr>
                                                <th className="px-6 py-4">Employee</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4">Attendance</th>
                                                <th className="px-6 py-4 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                            <WorkerManagementRow name="Rishabh Pant" status="Present" attendance="95%" />
                                            <WorkerManagementRow name="Axar Patel" status="On Leave" attendance="88%" />
                                            <WorkerManagementRow name="Kuldeep Yadav" status="Present" attendance="92%" />
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Grievance Approvals */}
                            <div className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-border-dark shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-gray-100 dark:border-border-dark flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Pending Grievances</h3>
                                    <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-1 rounded-full">3 New</span>
                                </div>
                                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                    <GrievanceRow title="Salary Discrepancy" user="Rohit Sharma" date="Today" />
                                    <GrievanceRow title="Leave Request" user="Virat Kohli" date="Yesterday" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Supervisor Actions */}
                            <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-border-dark shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Management Actions</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <QuickAction
                                        icon="campaign"
                                        label="Post Notice"
                                        color="text-blue-600"
                                        bg="bg-blue-50"
                                        onClick={() => setShowNoticeModal(true)}
                                        primary
                                    />
                                    <QuickAction icon="how_to_reg" label={t('approve_leave')} color="text-green-600" bg="bg-green-50" onClick={() => handleWIP('Approve Leave')} />
                                    <QuickAction icon="transfer_within_a_station" label={t('transfers')} color="text-purple-600" bg="bg-purple-50" onClick={() => handleWIP('Transfers')} />
                                    <QuickAction icon="summarize" label={t('team_reports')} color="text-orange-600" bg="bg-orange-50" onClick={() => handleWIP('Team Reports')} />
                                </div>
                            </div>

                            {/* Budget/Notices Summary */}
                            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-2xl text-white shadow-lg">
                                <h3 className="font-bold text-lg mb-2">Department Notices</h3>
                                <p className="text-blue-100 text-sm mb-4">You have posted 5 notices this month.</p>
                                <button onClick={() => setShowNoticeModal(true)} className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-bold transition-colors">
                                    Manage Notices
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modals */}
                {showEnrollment && <FaceEnrollment onSuccess={handleEnrollmentSuccess} onClose={() => setShowEnrollment(false)} />}
                {showAuth && <FaceAuthentication onSuccess={handleAttendanceSuccess} onClose={() => setShowAuth(false)} />}
                {showGrievance && <GrievanceModal onClose={() => setShowGrievance(false)} />}
                {showNoticeModal && <NoticeModal onClose={() => setShowNoticeModal(false)} />}
            </div>
        </DashboardLayout>
    );
};

// Sub-components
const QuickAction = ({ icon, label, color, bg, onClick, primary }: { icon: string, label: string, color?: string, bg?: string, onClick?: () => void, primary?: boolean }) => (
    <button onClick={onClick} className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 border-transparent hover:border-primary/10 hover:shadow-md transition-all group ${primary ? 'bg-primary text-white hover:bg-primary-dark' : 'bg-gray-50 dark:bg-gray-800 hover:bg-white'}`}>
        <div className={`p-3 rounded-full ${primary ? 'bg-white/20 text-white' : `${bg} ${color}`} group-hover:scale-110 transition-transform`}>
            <span className="material-symbols-outlined text-2xl">{icon}</span>
        </div>
        <span className={`text-xs font-bold ${primary ? 'text-white' : 'text-gray-700 dark:text-gray-300 group-hover:text-primary'} transition-colors text-center`}>{label}</span>
    </button>
);

const WorkerManagementRow = ({ name, status, attendance }: any) => (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
        <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{name}</td>
        <td className="px-6 py-4">
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${status === 'Present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {status}
            </span>
        </td>
        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{attendance}</td>
        <td className="px-6 py-4 text-right">
            <button className="text-blue-600 hover:underline text-xs font-bold">View Profile</button>
        </td>
    </tr>
);

const GrievanceRow = ({ title, user, date }: any) => (
    <div className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                <span className="material-symbols-outlined text-xl">report_problem</span>
            </div>
            <div>
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">{title}</h4>
                <p className="text-xs text-text-muted">By {user} • {date}</p>
            </div>
        </div>
        <div className="flex gap-2">
            <button className="p-1 text-green-600 hover:bg-green-50 rounded"><span className="material-symbols-outlined">check</span></button>
            <button className="p-1 text-red-600 hover:bg-red-50 rounded"><span className="material-symbols-outlined">close</span></button>
        </div>
    </div>
);

const NoticeModal = ({ onClose }: { onClose: () => void }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/api/department-notices', { title, content, type: 'General' });
            alert('Notice Posted Successfully!');
            onClose();
        } catch (err) {
            alert('Failed to post notice');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-surface-dark rounded-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Post Department Notice</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Title</label>
                        <input
                            type="text"
                            required
                            className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent dark:text-white"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Content</label>
                        <textarea
                            required
                            className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent dark:text-white h-32"
                            value={content}
                            onChange={e => setContent(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Cancel</button>
                        <button type="submit" disabled={loading} className="flex-1 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark">
                            {loading ? 'Posting...' : 'Post Notice'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Dashboard;
