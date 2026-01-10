
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useHRData } from '../hooks/useHRData';
import AttendanceAnalyticsHub from '../components/hr/AttendanceAnalyticsHub';
import GrievanceManagementSystem from '../components/hr/GrievanceManagementSystem';
import LeaveManagementTable from '../components/hr/LeaveManagementTable';
import PayrollCommandCenter from '../components/hr/PayrollCommandCenter';
import SupervisorList from '../components/hr/SupervisorList';

const HRDashboard = () => {
    const { user } = useAuth();
    const {
        loading,
        attendanceData,
        grievances,
        leaveRequests,
        payrollData,
        supervisors,
        releasePayroll,
        updateGrievanceStatus,
        updateLeaveStatus
    } = useHRData();

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
        <DashboardLayout title="Admin Console">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Welcome, {user?.name}
                        </h2>
                        <p className="text-text-muted mt-1">
                            Central Administration Hub
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-100">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                    </div>
                </div>

                {/* Top Row: Attendance & Payroll (High Priority) */}
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
                    <GrievanceManagementSystem grievances={grievances} onUpdateStatus={updateGrievanceStatus} />
                </div>

                {/* Bottom Row: Supervisors & Directory */}
                <div className="grid grid-cols-1 gap-6">
                    <SupervisorList supervisors={supervisors} />
                </div>

            </div>
        </DashboardLayout>
    );
};

export default HRDashboard;
