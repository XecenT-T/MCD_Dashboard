import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import FaceEnrollment from '../components/FaceEnrollment';
import FaceAuthentication from '../components/FaceAuthentication';
import GrievanceModal from '../components/GrievanceModal';
import { useNavigate } from 'react-router-dom';
import AttendanceChart from '../components/AttendanceChart';
import DashboardLayout from '../components/DashboardLayout';

const Dashboard = () => {
    const { user, reloadUser } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const isOfficial = user?.role === 'official';

    const [showEnrollment, setShowEnrollment] = useState(false);
    const [showAuth, setShowAuth] = useState(false);
    const [showGrievance, setShowGrievance] = useState(false);

    // Auto-open Face Enrollment for first-time users (workers and officials)
    useEffect(() => {
        if (user && !user.isFaceRegistered) {
            // Small delay to let dashboard render first
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

    // Mock Data using translations
    const workerStats = [
        { label: 'Days Present (Oct)', value: '18 / 22', icon: 'calendar_month', color: 'text-green-600', bg: 'bg-green-100', progress: 85 },
        { label: 'Leave Balance', value: '5 Days', sub: 'Expires Dec 31', icon: 'beach_access', color: 'text-yellow-600', bg: 'bg-yellow-100' },
        { label: 'Next Pay Date', value: 'Oct 31', sub: 'Payroll processing...', icon: 'payments', color: 'text-blue-600', bg: 'bg-blue-100' },
        { label: 'Pending Actions', value: '2 Items', sub: 'View details', icon: 'pending_actions', color: 'text-red-600', bg: 'bg-red-100' }
    ];

    const officialStats = [
        { label: t('team_attendance'), value: '92%', sub: '45/49 Present', icon: 'groups', color: 'text-green-600', bg: 'bg-green-100', progress: 92 },
        { label: 'Pending Approvals', value: '7 Requests', sub: 'Leave & Transfers', icon: 'assignment_turned_in', color: 'text-orange-600', bg: 'bg-orange-100' },
        { label: 'Dept. Budget', value: '₹ 4.5L', sub: 'Remaining Q3', icon: 'account_balance_wallet', color: 'text-purple-600', bg: 'bg-purple-100' },
        { label: 'Open Grievances', value: '12', sub: '3 High Priority', icon: 'report_problem', color: 'text-red-600', bg: 'bg-red-100' }
    ];

    const stats = isOfficial ? officialStats : workerStats;

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Welcome Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            {t('welcome_back')}, {user?.name?.split(' ')[0]} <span className="text-2xl animate-wave">👋</span>
                        </h2>
                        <p className="text-text-muted mt-1">{t('what_happening')}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark text-gray-700 dark:text-gray-200 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                            <span className="material-symbols-outlined text-[20px]">download</span>
                            {t('reports')}
                        </button>
                        <button onClick={() => navigate('/grievance-submission')} className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition-colors shadow-lg shadow-primary/30">
                            <span className="material-symbols-outlined text-[20px]">mic</span>
                            {t('submit_grievance')}
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, index) => (
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

                {/* Middle Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-border-dark shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                    {isOfficial ? t('team_attendance') : t('attendance_overview')}
                                </h3>
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
                            {isOfficial ? (
                                <>
                                    <QuickAction icon="how_to_reg" label={t('approve_leave')} color="text-green-600" bg="bg-green-50" onClick={() => handleWIP('Approve Leave')} />
                                    <QuickAction icon="transfer_within_a_station" label={t('transfers')} color="text-blue-600" bg="bg-blue-50" onClick={() => handleWIP('Transfers')} />
                                    <QuickAction icon="summarize" label={t('team_reports')} color="text-purple-600" bg="bg-purple-50" onClick={() => handleWIP('Team Reports')} />
                                    <QuickAction icon="campaign" label={t('announce')} color="text-orange-600" bg="bg-orange-50" onClick={() => handleWIP('Announce')} />
                                </>
                            ) : (
                                <>
                                    <QuickAction
                                        icon="fingerprint"
                                        label={user?.isFaceRegistered ? t('mark_in') : t('setup_face')}
                                        onClick={handleMarkIn}
                                        primary
                                    />
                                    <QuickAction icon="flight_takeoff" label={t('apply_leave')} color="text-orange-600" bg="bg-orange-50" onClick={() => handleWIP('Apply Leave')} />
                                    <QuickAction icon="receipt_long" label={t('payslip')} color="text-indigo-600" bg="bg-indigo-50" onClick={() => navigate('/payroll')} />
                                    <QuickAction icon="description" label={t('form_16')} color="text-teal-600" bg="bg-teal-50" onClick={() => handleWIP('Form 16')} />
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-border-light dark:border-border-dark flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {isOfficial ? t('recent_transfers') : t('recent_payroll')}
                            </h3>
                            <button className="text-sm font-bold text-primary hover:underline">{t('view_all')}</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 font-medium">
                                    <tr>
                                        <th className="px-6 py-4">{isOfficial ? 'Employee' : 'Month'}</th>
                                        <th className="px-6 py-4">{isOfficial ? 'Request Date' : 'Date Paid'}</th>
                                        <th className="px-6 py-4 text-center">{isOfficial ? 'Department' : 'Net Pay'}</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {isOfficial ? (
                                        <OfficialRow name="Amit Sharma" date="Oct 24, 2023" dept="Sanitation" status="Pending" />
                                    ) : (
                                        <WorkerRow month="September 2023" date="Sep 30, 2023" pay="₹45,200" status="Paid" />
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-border-dark shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('active_grievances')}</h3>
                            <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">1 Active</span>
                        </div>
                        <div className="space-y-6">
                            <div className="flex gap-4 p-4 bg-orange-50 rounded-xl border border-orange-100">
                                <div className="mt-1">
                                    <span className="material-symbols-outlined text-orange-500">pending</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm">Ticket #4922 - PF Discrepancy</h4>
                                    <p className="text-xs text-gray-500 mt-1">Submitted on Oct 12.</p>
                                    <span className="inline-block mt-2 text-[10px] font-bold text-orange-600 uppercase tracking-wide">In Progress</span>
                                </div>
                            </div>
                            <button className="w-full text-center text-sm font-bold text-primary py-2 hover:bg-gray-50 rounded-lg transition-colors">
                                {t('view_all_tickets')}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Face Recognition Modals */}
                {showEnrollment && (
                    <FaceEnrollment
                        onSuccess={handleEnrollmentSuccess}
                        onClose={() => setShowEnrollment(false)}
                    />
                )}
                {showAuth && (
                    <FaceAuthentication
                        onSuccess={handleAttendanceSuccess}
                        onClose={() => setShowAuth(false)}
                    />
                )}
                {/* Grievance Modal */}
                {showGrievance && (
                    <GrievanceModal onClose={() => setShowGrievance(false)} />
                )}
            </div>
        </DashboardLayout>
    );
};

const QuickAction = ({ icon, label, color, bg, onClick, primary }: { icon: string, label: string, color?: string, bg?: string, onClick?: () => void, primary?: boolean }) => (
    <button onClick={onClick} className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 border-transparent hover:border-primary/10 hover:shadow-md transition-all group ${primary ? 'bg-primary text-white hover:bg-primary-dark' : 'bg-gray-50 dark:bg-gray-800 hover:bg-white'}`}>
        <div className={`p-3 rounded-full ${primary ? 'bg-white/20 text-white' : `${bg} ${color}`} group-hover:scale-110 transition-transform`}>
            <span className="material-symbols-outlined text-2xl">{icon}</span>
        </div>
        <span className={`text-xs font-bold ${primary ? 'text-white' : 'text-gray-700 dark:text-gray-300 group-hover:text-primary'} transition-colors`}>{label}</span>
    </button>
);

const WorkerRow = ({ month, date, pay, status }: any) => (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group cursor-pointer">
        <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{month}</td>
        <td className="px-6 py-4 text-gray-500">{date}</td>
        <td className="px-6 py-4 text-center font-mono font-medium">{pay}</td>
        <td className="px-6 py-4 text-center">
            <span className="inline-block px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                {status}
            </span>
        </td>
        <td className="px-6 py-4 text-right">
            <button className="text-gray-400 hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-xl">download</span>
            </button>
        </td>
    </tr>
);

const OfficialRow = ({ name, date, dept, status }: any) => (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group cursor-pointer">
        <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{name}</td>
        <td className="px-6 py-4 text-gray-500">{date}</td>
        <td className="px-6 py-4 text-center">{dept}</td>
        <td className="px-6 py-4 text-center">
            <span className="inline-block px-2 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
                {status}
            </span>
        </td>
        <td className="px-6 py-4 text-right flex justify-end gap-2">
            <button className="text-gray-400 hover:text-green-600 transition-colors" title="Approve">
                <span className="material-symbols-outlined text-xl">check_circle</span>
            </button>
            <button className="text-gray-400 hover:text-red-600 transition-colors" title="Reject">
                <span className="material-symbols-outlined text-xl">cancel</span>
            </button>
        </td>
    </tr>
);

export default Dashboard;
