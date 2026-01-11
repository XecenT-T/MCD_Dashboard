import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useDashboardView } from '../context/DashboardViewContext';
import FaceEnrollment from '../components/FaceEnrollment';
import FaceAuthentication from '../components/FaceAuthentication';
import GrievanceModal from '../components/GrievanceModal';
import GrievanceDetailsModal from '../components/GrievanceDetailsModal';
import { useNavigate } from 'react-router-dom';
import AttendanceChart from '../components/AttendanceChart';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api/axios';

const Dashboard = () => {
    const { user, reloadUser } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const isOfficial = user?.role === 'official';
    const { viewMode, setViewMode } = useDashboardView();

    const [showEnrollment, setShowEnrollment] = useState(false);
    const [showAuth, setShowAuth] = useState(false);
    const [showGrievance, setShowGrievance] = useState(false);
    const [showNoticeModal, setShowNoticeModal] = useState(false);

    // Force Personal View for Non-Officials
    useEffect(() => {
        if (user && user.role !== 'official' && viewMode === 'department') {
            setViewMode('personal');
        }
    }, [user, viewMode, setViewMode]);

    // Auto-open Face Enrollment for first-time users
    useEffect(() => {
        if (user && !user.isFaceRegistered) {
            const timer = setTimeout(() => {
                setShowEnrollment(true);
            }, 500);
            return () => clearTimeout(timer);
        }

        // Redirect HR/Admin to HR Dashboard
        const department = (user?.department || '').toLowerCase();
        const isHR = user?.role === 'official' && ['general', 'administration', 'hr'].includes(department);
        // Also check explicit 'hr' role if backend supports it
        const isExplicitHR = user?.role === 'hr';

        if (isHR || isExplicitHR) {
            navigate('/hr-dashboard');
        }
    }, [user, navigate]);

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

    const [pendingGrievances, setPendingGrievances] = useState<any[]>([]);
    const [loadingGrievances, setLoadingGrievances] = useState(false);
    const [totalWorkers, setTotalWorkers] = useState<string>('...');
    const [deptAttendance, setDeptAttendance] = useState<string>('...');
    const [selectedGrievance, setSelectedGrievance] = useState<any | null>(null);

    // Fetch Data for Department View
    useEffect(() => {
        if (viewMode === 'department' && isOfficial) {
            const fetchData = async () => {
                setLoadingGrievances(true);
                try {
                    // Fetch Grievances
                    const resGrievances = await api.get('/api/grievances/department');
                    // Filter for strictly 'Pending' grievances (check both cases for robustness)
                    const active = resGrievances.data.filter((g: any) => (g.status || '').toLowerCase() === 'pending');
                    setPendingGrievances(active);

                    // Fetch Department Stats (Worker Count)
                    const resStats = await api.get('/api/auth/department-stats');
                    setTotalWorkers(resStats.data.totalWorkers.toString());

                    // Fetch Department Attendance Average
                    const resAtt = await api.get('/api/attendance/department-stats');
                    setDeptAttendance((resAtt.data.averageAttendance || 0) + '%');

                } catch (err) {
                    console.error("Failed to fetch dashboard data", err);
                } finally {
                    setLoadingGrievances(false);
                }
            };
            fetchData();
        }
    }, [viewMode, isOfficial]);

    const handleResolveGrievance = async (id: string) => {
        try {
            await api.patch(`/api/grievances/${id}/status`, { status: "Resolved" });
            // Update local state
            setPendingGrievances(prev => prev.filter(g => g._id !== id)); // Remove resolved from pending list
            setSelectedGrievance((prev: any) => prev ? { ...prev, status: 'Resolved' } : null);
            // Verify if user wants it removed from list immediately or just updated. Usually "Pending" list implies only pending items.
        } catch (error) {
            console.error("Failed to resolve", error);
        }
    };

    const handleReplyGrievance = async (id: string, message: string) => {
        try {
            const res = await api.post(`/api/grievances/${id}/reply`, { message });
            // Update local state for replies
            setSelectedGrievance((prev: any) => {
                if (!prev) return null;
                return {
                    ...prev,
                    replies: res.data // Assuming API returns updated replies array
                };
            });
            // Re-fetch or update list if necessary? Mostly deeply nested.
            // A simple re-fetch of the specific grievance or trusting response is okay.
            // For dashboard list, replies don't show.
        } catch (error) {
            console.error("Failed to reply", error);
        }
    };

    // Stats Data
    const workerStats = [
        { label: t('days_present') + ' (Oct)', value: '18 / 22', icon: 'calendar_month', color: 'text-green-600', bg: 'bg-green-100', progress: 85 },
        { label: t('leave_balance'), value: '5 ' + t('days_present').split(' ')[1], sub: t('expires_dec'), icon: 'beach_access', color: 'text-yellow-600', bg: 'bg-yellow-100' },
        { label: t('next_pay_date'), value: 'Oct 31', sub: t('processing'), icon: 'payments', color: 'text-blue-600', bg: 'bg-blue-100' },
        { label: t('pending_actions'), value: '2 Items', sub: t('view_details'), icon: 'pending_actions', color: 'text-red-600', bg: 'bg-red-100' }
    ];

    const departmentStats = [
        {
            label: t('total_workers'),
            value: totalWorkers,
            sub: t('active_in_dept'),
            icon: 'groups',
            color: 'text-blue-600',
            bg: 'bg-blue-100',
            action: () => navigate('/department-workers') // Open in same view
        },
        {
            label: t('dept_attendance'),
            value: deptAttendance,
            sub: t('today'),
            icon: 'fact_check',
            color: 'text-green-600',
            bg: 'bg-green-100',
            progress: parseInt(deptAttendance) || 0,
            action: () => navigate('/department-attendance')
        },
        { label: t('pending_grievances'), value: loadingGrievances ? '...' : pendingGrievances.length.toString(), sub: t('action_required'), icon: 'report_problem', color: 'text-red-600', bg: 'bg-red-100' },
        { label: t('total_payroll'), value: '₹ 12.5L', sub: t('this_month'), icon: 'payments', color: 'text-purple-600', bg: 'bg-purple-100' }
    ];

    const currentStats = (viewMode === 'department' && isOfficial) ? departmentStats : workerStats;

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
                            {(viewMode === 'department' && isOfficial) ? `Managing ${user?.department || 'General'} Department` : t('what_happening')}
                        </p>
                    </div>

                    {isOfficial && (
                        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                            <button
                                onClick={() => setViewMode('personal')}
                                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${viewMode === 'personal' ? 'bg-white dark:bg-surface-dark shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">person</span>
                                    {t('my_profile')}
                                </div>
                            </button>
                            <button
                                onClick={() => setViewMode('department')}
                                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${viewMode === 'department' ? 'bg-white dark:bg-surface-dark shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">domain</span>
                                    {t('dept_management')}
                                </div>
                            </button>
                        </div>
                    )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {currentStats.map((stat: any, index) => (
                        <div
                            key={index}
                            onClick={() => stat.action && stat.action()}
                            className={`bg-white dark:bg-surface-dark p-5 rounded-xl border border-gray-100 dark:border-border-dark shadow-sm hover:shadow-md transition-shadow ${stat.action ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800' : ''}`}
                        >
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

                {/* Content Switching based on View Mode */}
                {viewMode === 'personal' || !isOfficial ? (
                    // PERSONAL VIEW
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
                                <AttendanceChart isOfficial={isOfficial} />
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
                    // DEPARTMENT VIEW (Only available to Officials)
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            {/* Worker Management Table */}
                            <div className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-border-dark shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-gray-100 dark:border-border-dark flex items-center justify-between">
                                </div>
                            </div>

                            {/* Grievance Approvals */}
                            <div className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-border-dark shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-gray-100 dark:border-border-dark flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('pending_grievances')}</h3>
                                    <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-1 rounded-full">
                                        {loadingGrievances ? '...' : `${pendingGrievances.length} ${t('grievance_active_count')}`}
                                    </span>
                                </div>
                                <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[300px] overflow-y-auto">
                                    {loadingGrievances ? (
                                        [1, 2, 3].map(i => (
                                            <div key={i} className="p-4 flex items-center justify-between animate-pulse">
                                                <div className="flex items-center gap-3 w-full">
                                                    <div className="size-10 bg-gray-200 rounded-lg"></div>
                                                    <div className="space-y-2 flex-1 max-w-[200px]">
                                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : pendingGrievances.length === 0 ? (
                                        <div className="p-8 text-center text-text-muted">No pending grievances</div>
                                    ) : (
                                        pendingGrievances.slice(0, 5).map(g => (
                                            <GrievanceRow
                                                key={g._id}
                                                title={g.title}
                                                user={g.userId?.name || 'Unknown'}
                                                date={new Date(g.createdAt).toLocaleDateString()}
                                                status={g.status}
                                                onClick={() => setSelectedGrievance(g)}
                                            />
                                        ))
                                    )}
                                    {pendingGrievances.length > 5 && (
                                        <div className="p-3 text-center border-t border-gray-100 dark:border-gray-800">
                                            <button onClick={() => navigate('/grievances')} className="text-sm font-bold text-primary hover:underline">
                                                View All ({pendingGrievances.length})
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Official Actions */}
                            <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-border-dark shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">{t('management_actions')}</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <QuickAction
                                        icon="campaign"
                                        label={t('post_notice')}
                                        color="text-blue-600"
                                        bg="bg-blue-50"
                                        onClick={() => setShowNoticeModal(true)}
                                        primary
                                    />
                                    <QuickAction icon="how_to_reg" label={t('approve_leave')} color="text-green-600" bg="bg-green-50" onClick={() => handleWIP('Approve Leave')} />
                                    <QuickAction icon="transfer_within_a_station" label={t('transfers')} color="text-purple-600" bg="bg-purple-50" onClick={() => handleWIP('Transfers')} />
                                    <QuickAction icon="summarize" label={t('team_reports_label')} color="text-orange-600" bg="bg-orange-50" onClick={() => handleWIP('Team Reports')} />
                                    <QuickAction icon="person_add" label={t('add_user')} color="text-indigo-600" bg="bg-indigo-50" onClick={() => navigate('/admin/create-user')} />
                                </div>
                            </div>

                            {/* Budget/Notices Summary */}
                            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-2xl text-white shadow-lg">
                                <h3 className="font-bold text-lg mb-2">{t('department_notices')}</h3>
                                <p className="text-blue-100 text-sm mb-4">{t('notices_posted_text').replace('{count}', '5')}</p>
                                <button onClick={() => setShowNoticeModal(true)} className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-bold transition-colors">
                                    {t('manage_notices')}
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

                {selectedGrievance && (
                    <GrievanceDetailsModal
                        grievance={{
                            ...selectedGrievance,
                            id: selectedGrievance._id, // Adapt _id to id
                            submittedBy: selectedGrievance.userId?.name || 'Unknown',
                            date: new Date(selectedGrievance.createdAt).toLocaleDateString(),
                            submitterProfile: selectedGrievance.userId // Pass full profile
                        }}
                        onClose={() => setSelectedGrievance(null)}
                        onResolve={handleResolveGrievance}
                        onReply={handleReplyGrievance}
                        canResolve={true} // Official on their dashboard can usually resolve their dept grievances
                    />
                )}
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


const GrievanceRow = ({ title, user, date, status, onClick }: any) => (
    <div className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer" onClick={onClick}>
        <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                <span className="material-symbols-outlined text-xl">report_problem</span>
            </div>
            <div>
                <h4 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1">{title}</h4>
                <p className="text-xs text-text-muted">By {user} • {date}</p>
            </div>
        </div>
        <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold
            ${status === 'resolved' ? 'bg-green-100 text-green-700' :
                status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'}`}>
            {status}
        </span>
    </div>
);

const NoticeModal = ({ onClose }: { onClose: () => void }) => {
    const { t } = useLanguage();
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
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{t('post_notice')}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t('grievance_title')}</label>
                        <input
                            type="text"
                            required
                            className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent dark:text-white"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t('grievance_desc')}</label>
                        <textarea
                            required
                            className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent dark:text-white h-32"
                            value={content}
                            onChange={e => setContent(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">{t('cancel')}</button>
                        <button type="submit" disabled={loading} className="flex-1 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark">
                            {loading ? t('status_processing') : t('post_notice')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Dashboard;
