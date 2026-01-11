
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useHRData } from '../hooks/useHRData';
import AttendanceAnalyticsHub from '../components/hr/AttendanceAnalyticsHub';
import GrievanceManagementSystem from '../components/hr/GrievanceManagementSystem';
import LeaveManagementTable from '../components/hr/LeaveManagementTable';
import PayrollCommandCenter from '../components/hr/PayrollCommandCenter';
import OfficialList from '../components/hr/OfficialList';
import LiveLocationMap from '../components/LiveLocationMap';

const HRDashboard = () => {
    const { user } = useAuth();
    const {
        loading,
        attendanceData,
        grievances,
        leaveRequests,
        payrollData,
        officials,
        liveAttendanceRecords,
        releasePayroll,
        updateGrievanceStatus,
        updateLeaveStatus
    } = useHRData();

    // View State
    const [viewMode, setViewMode] = useState<'overall' | 'department'>('overall');
    const [selectedDept, setSelectedDept] = useState('Health'); // Default to first
    const [activeTab, setActiveTab] = useState('overview');
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab) {
            setActiveTab(tab);
            setViewMode('department');
        }
    }, [searchParams]);

    const departments = ['Health', 'Education', 'Engineering', 'Sanitation', 'General'];

    const filteredAttendance = attendanceData.filter(d => d.department === selectedDept);
    const filteredGrievances = grievances.filter(g => g.department === selectedDept);
    const filteredLeaveRequests = leaveRequests.filter(l => l.department === selectedDept);
    const filteredPayroll = payrollData.filter(p => p.department === selectedDept);
    const filteredLiveRecords = liveAttendanceRecords.filter(r => r.user.department === selectedDept);

    if (loading) {
        return (
            <DashboardLayout title="Admin Console">
                <div className="flex h-screen items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout
            title={viewMode === 'overall' ? "Admin Console" : `${selectedDept} Department`}
        >
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header Control Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-gray-100 dark:border-border-dark">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            {viewMode === 'overall' ? `Welcome, ${user?.name}` : `${selectedDept} Management`}
                        </h2>
                        <p className="text-sm text-text-muted">
                            {viewMode === 'overall' ? 'Central Administration Hub' : 'Department Specific Controls'}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Department Selector (Only visible in Department Mode) */}
                        {viewMode === 'department' && (
                            <div className="relative">
                                <select
                                    value={selectedDept}
                                    onChange={(e) => setSelectedDept(e.target.value)}
                                    className="appearance-none bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 py-2 pl-4 pr-10 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none cursor-pointer font-medium"
                                >
                                    {departments.map(dept => (
                                        <option key={dept} value={dept}>{dept}</option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                    <span className="material-symbols-outlined">expand_more</span>
                                </div>
                            </div>
                        )}

                        {/* View Toggle */}
                        <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-lg">
                            <button
                                onClick={() => setViewMode('overall')}
                                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${viewMode === 'overall' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                            >
                                Overall
                            </button>
                            <button
                                onClick={() => { setViewMode('department'); setActiveTab('overview'); }}
                                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${viewMode === 'department' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                            >
                                Department
                            </button>
                        </div>
                    </div>
                </div>

                {/* OVERALL VIEW */}
                {viewMode === 'overall' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        {/* Top Row: Attendance & Payroll */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <AttendanceAnalyticsHub data={attendanceData} />
                            </div>
                            <div className="lg:col-span-1">
                                <PayrollCommandCenter data={payrollData} onRelease={releasePayroll} />
                            </div>
                        </div>

                        {/* Middle Row: Approvals & Grievances */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-[500px]">
                            <LeaveManagementTable requests={leaveRequests} onUpdateStatus={updateLeaveStatus} />
                            <GrievanceManagementSystem
                                grievances={grievances}
                                onResolve={(id) => updateGrievanceStatus(id, 'Resolved')}
                                onReply={async () => { }}
                            />
                        </div>

                        {/* Bottom Row: Officials & Directory */}
                        <div className="grid grid-cols-1 gap-6">
                            <OfficialList officials={officials} />
                        </div>
                    </div>
                )}

                {/* DEPARTMENT VIEW */}
                {viewMode === 'department' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        {/* Tabs */}
                        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 pb-1 overflow-x-auto">
                            {['Overview', 'Payroll', 'Grievances', 'Leaves', 'Live Map'].map((tab) => {
                                const key = tab.toLowerCase().replace(' ', '');
                                return (
                                    <button
                                        key={key}
                                        onClick={() => setActiveTab(key)}
                                        className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === key
                                            ? 'border-primary text-primary'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                                    >
                                        {tab}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Tab Content */}
                        <div className="min-h-[500px]">
                            {activeTab === 'overview' && (
                                <div className="space-y-6">
                                    <AttendanceAnalyticsHub data={filteredAttendance} />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-xl border border-blue-100 dark:border-blue-800">
                                            <h3 className="text-blue-800 dark:text-blue-300 font-bold mb-2">Budget Status</h3>
                                            <p className="text-3xl font-black text-blue-600 dark:text-blue-400">
                                                ₹{(filteredPayroll[0]?.actuals || 0).toLocaleString()} / ₹{(filteredPayroll[0]?.budget || 0).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="bg-purple-50 dark:bg-purple-900/10 p-6 rounded-xl border border-purple-100 dark:border-purple-800">
                                            <h3 className="text-purple-800 dark:text-purple-300 font-bold mb-2">Active Grievances</h3>
                                            <p className="text-3xl font-black text-purple-600 dark:text-purple-400">
                                                {filteredGrievances.filter(g => g.status !== 'Resolved').length}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'payroll' && (
                                <PayrollCommandCenter data={filteredPayroll} onRelease={() => releasePayroll(selectedDept)} />
                            )}

                            {activeTab === 'grievances' && (
                                <GrievanceManagementSystem
                                    grievances={filteredGrievances}
                                    onResolve={(id) => updateGrievanceStatus(id, 'Resolved')}
                                    onReply={async () => { }}
                                />
                            )}

                            {activeTab === 'leaves' && (
                                <LeaveManagementTable requests={filteredLeaveRequests} onUpdateStatus={updateLeaveStatus} />
                            )}

                            {activeTab === 'livemap' && (
                                <LiveLocationMap attendanceData={filteredLiveRecords} loading={loading} />
                            )}
                        </div>
                    </div>
                )}

            </div>
        </DashboardLayout>
    );
};

export default HRDashboard;
