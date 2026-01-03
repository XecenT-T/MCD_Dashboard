import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import * as faceapi from 'face-api.js';
import FaceEnrollment from '../components/FaceEnrollment';
import FaceAuthentication from '../components/FaceAuthentication';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const isOfficial = user?.role === 'official';

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const [showEnrollment, setShowEnrollment] = useState(false);
    const [showAuth, setShowAuth] = useState(false);

    const handleMarkIn = () => {
        if (user?.isFaceRegistered) {
            setShowAuth(true);
        } else {
            setShowEnrollment(true);
        }
    };

    const handleAttendanceSuccess = () => {
        setShowAuth(false);
        // Refresh dashboard or show success toast
        alert("Attendance Marked Successfully!");
    };

    const handleEnrollmentSuccess = () => {
        setShowEnrollment(false);
        // Ideally reload user to update isFaceRegistered
        window.location.reload();
    };

    // Mock Data for Worker
    const workerStats = [
        { label: 'Days Present (Oct)', value: '18 / 22', icon: 'calendar_month', color: 'text-green-600', bg: 'bg-green-100', progress: 85 },
        { label: 'Leave Balance', value: '5 Days', sub: 'Expires Dec 31', icon: 'beach_access', color: 'text-yellow-600', bg: 'bg-yellow-100' },
        { label: 'Next Pay Date', value: 'Oct 31', sub: 'Payroll processing...', icon: 'payments', color: 'text-blue-600', bg: 'bg-blue-100' },
        { label: 'Pending Actions', value: '2 Items', sub: 'View details', icon: 'pending_actions', color: 'text-red-600', bg: 'bg-red-100' }
    ];

    // Mock Data for Official
    const officialStats = [
        { label: 'Team Attendance', value: '92%', sub: '45/49 Present', icon: 'groups', color: 'text-green-600', bg: 'bg-green-100', progress: 92 },
        { label: 'Pending Approvals', value: '7 Requests', sub: 'Leave & Transfers', icon: 'assignment_turned_in', color: 'text-orange-600', bg: 'bg-orange-100' },
        { label: 'Dept. Budget', value: '₹ 4.5L', sub: 'Remaining Q3', icon: 'account_balance_wallet', color: 'text-purple-600', bg: 'bg-purple-100' },
        { label: 'Open Grievances', value: '12', sub: '3 High Priority', icon: 'report_problem', color: 'text-red-600', bg: 'bg-red-100' }
    ];

    const stats = isOfficial ? officialStats : workerStats;

    return (
        <div className="flex h-screen bg-gray-50 font-display text-text-main dark:text-gray-100 dark:bg-background-dark overflow-hidden">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-surface-dark border-r border-gray-200 dark:border-border-dark transform transition-transform duration-300 md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    <div className="flex items-center gap-3 px-6 h-16 border-b border-gray-100 dark:border-border-dark">
                        <div className="size-8 flex items-center justify-center text-primary bg-primary/10 rounded-lg">
                            <span className="material-symbols-outlined">account_balance</span>
                        </div>
                        <div>
                            <h1 className="font-bold text-lg leading-tight text-primary">MCD Portal</h1>
                            <p className="text-xs text-text-muted">Official Worker Portal</p>
                        </div>
                    </div>

                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        <NavItem icon="dashboard" label="Dashboard" active />
                        <NavItem icon="calendar_month" label="Attendance" />
                        <NavItem icon="payments" label="Payroll" />
                        <NavItem icon="swap_horiz" label="Transfers" />
                        <NavItem icon="report" label="Grievances" />
                        <NavItem icon="person" label="Profile" />
                    </nav>

                    <div className="p-4 border-t border-gray-100 dark:border-border-dark">
                        <div className="bg-blue-50 dark:bg-primary/10 rounded-xl p-4 mb-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-100 dark:bg-primary/20 text-blue-600 dark:text-primary rounded-lg">
                                    <span className="material-symbols-outlined text-xl">support_agent</span>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white">Need Help?</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Contact support for payroll issues.</p>
                                </div>
                            </div>
                        </div>
                        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg w-full transition-colors cursor-pointer">
                            <span className="material-symbols-outlined text-[20px]">logout</span>
                            Log Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile sidebar */}
            {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)}></div>}

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <header className="h-16 bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-border-dark flex items-center justify-between px-4 sm:px-8 shrink-0">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg" onClick={() => setSidebarOpen(true)}>
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white hidden sm:block">
                            {isOfficial ? 'Official Dashboard' : 'Worker Dashboard'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-6 flex-1 justify-end max-w-2xl">
                        <div className="hidden md:flex items-center flex-1 max-w-md bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
                            <span className="material-symbols-outlined text-gray-400 text-[20px]">search</span>
                            <input
                                type="text"
                                placeholder="Search..."
                                className="bg-transparent border-none focus:outline-none text-sm ml-2 w-full text-gray-700 dark:text-gray-200 placeholder:text-gray-400"
                            />
                        </div>

                        <div className="flex items-center gap-3 pl-2 sm:pl-6 border-l border-gray-200 dark:border-border-dark">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">{user?.name || 'User'}</p>
                                <p className="text-xs text-text-muted mt-1 capitalize">{user?.role || 'Role'}</p>
                            </div>
                            <div className="size-10 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-md shadow-primary/20">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-8">
                    <div className="max-w-7xl mx-auto space-y-8">
                        {/* Welcome Section */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                    Welcome back, {user?.name?.split(' ')[0]} <span className="text-2xl animate-wave">👋</span>
                                </h2>
                                <p className="text-text-muted mt-1">Here's what's happening with your account today.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark text-gray-700 dark:text-gray-200 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                                    <span className="material-symbols-outlined text-[20px]">download</span>
                                    Reports
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition-colors shadow-lg shadow-primary/30">
                                    <span className="material-symbols-outlined text-[20px]">add</span>
                                    Submit Grievance
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
                                            {isOfficial ? 'Team Attendance Trends' : 'Attendance Overview'}
                                        </h3>
                                        <p className="text-sm text-text-muted">Monthly presence visualizer</p>
                                    </div>
                                    <button className="text-sm font-medium text-primary">View Report</button>
                                </div>
                                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                                    <p className="text-gray-400">Chart Visualization Placeholder</p>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-border-dark shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {isOfficial ? (
                                        <>
                                            <QuickAction icon="how_to_reg" label="Approve Leave" color="text-green-600" bg="bg-green-50" />
                                            <QuickAction icon="transfer_within_a_station" label="Transfers" color="text-blue-600" bg="bg-blue-50" />
                                            <QuickAction icon="summarize" label="Team Reports" color="text-purple-600" bg="bg-purple-50" />
                                            <QuickAction icon="campaign" label="Announce" color="text-orange-600" bg="bg-orange-50" />
                                        </>
                                    ) : (
                                        <>
                                            <QuickAction
                                                icon="fingerprint"
                                                label={user?.isFaceRegistered ? "Mark In (Face)" : "Setup Face ID"}
                                                onClick={handleMarkIn}
                                                primary
                                            />
                                            <QuickAction icon="flight_takeoff" label="Apply Leave" color="text-orange-600" bg="bg-orange-50" />
                                            <QuickAction icon="receipt_long" label="Payslip" color="text-indigo-600" bg="bg-indigo-50" />
                                            <QuickAction icon="description" label="Form 16" color="text-teal-600" bg="bg-teal-50" />
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
                                        {isOfficial ? 'Recent Transfer Requests' : 'Recent Payroll'}
                                    </h3>
                                    <button className="text-sm font-bold text-primary hover:underline">View All History</button>
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
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Active Grievances</h3>
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
                                        View All Tickets
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
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
        </div>
    );
};

// Component Helpers
const NavItem = ({ icon, label, active = false }: { icon: string, label: string, active?: boolean }) => (
    <a href="#" className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${active ? 'bg-primary text-white font-bold shadow-md shadow-primary/30' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium'}`}>
        <span className="material-symbols-outlined text-[22px]">{icon}</span>
        <span className="text-sm">{label}</span>
    </a>
);

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
