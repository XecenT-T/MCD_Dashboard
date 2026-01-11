import { useState, useEffect } from 'react';
import api from '../api/axios';
import { updateLeaveStatus as apiUpdateLeaveStatus } from '../api/leaves';

// Types
export interface DepartmentStats {
    department: string;
    present: number;
    absent: number;
    leave: number;
    total: number;
}

export interface Grievance {
    id: string;
    submittedBy: string;
    role: 'official' | 'worker';
    department: string;
    subject: string;
    description: string;
    date: string;
    status: 'Pending' | 'Resolved' | 'Under Review' | 'Rejected';
    submitterProfile?: any; // Full user object for modal
    replies?: {
        senderId: any;
        role: string;
        message: string;
        createdAt: string;
    }[];
}

export interface LeaveRequest {
    id: string;
    applicant: string;
    role: 'official' | 'worker';
    department: string;
    type: string;
    dates: string;
    reason: string;
    status: 'Pending' | 'Approved' | 'Rejected';
}

export interface PayrollData {
    department: string;
    budget: number;
    actuals: number;
    status: 'Pending' | 'Processing' | 'Released';
}

export interface Official {
    id: string;
    name: string;
    department: string;
    status: 'Active' | 'On Leave';
}
// ... (previous imports)

export interface AttendanceRecord {
    _id: string;
    checkInTime: string;
    location: { lat: number; lng: number, address: string };
    user: { _id: string, name: string, role: string, department: string };
    status: string;
}

export const useHRData = (department?: string) => {
    const [loading, setLoading] = useState(true);

    // Mock Data State
    const [attendanceData, setAttendanceData] = useState<DepartmentStats[]>([]);
    const [grievances, setGrievances] = useState<Grievance[]>([]);
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [payrollData, setPayrollData] = useState<PayrollData[]>([]);
    const [officials, setOfficials] = useState<Official[]>([]);
    const [liveAttendanceRecords, setLiveAttendanceRecords] = useState<AttendanceRecord[]>([]);

    // New State for Department Payroll
    const [departmentPayroll, setDepartmentPayroll] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch Real Grievances
                let endpoint = '/api/grievances/all';
                let params: any = {};

                if (department) {
                    endpoint = '/api/grievances/by-department-sender';
                    params.department = department;

                    // Fetch Department Payroll
                    try {
                        const payRes = await api.get('/api/payroll/by-department', { params: { department } });
                        setDepartmentPayroll(payRes.data);
                    } catch (e) {
                        console.error("Failed to fetch department payroll", e);
                    }
                }

                const griRes = await api.get(endpoint, { params });

                // ... (transform grievances logic)
                const transformedGrievances = griRes.data.map((g: any) => ({
                    id: g._id,
                    submittedBy: g.userId?.name || 'Unknown',
                    role: g.userId?.role || 'worker',
                    department: g.department,
                    subject: g.title,
                    description: g.description,
                    date: new Date(g.createdAt).toISOString().split('T')[0],
                    status: g.status.charAt(0).toUpperCase() + g.status.slice(1),
                    replies: g.replies,
                    submitterProfile: g.userId
                }));
                setGrievances(transformedGrievances);

            } catch (err) {
                console.error("Failed to fetch HR data", err);
            }

            // Fetch Real Attendance Stats
            try {
                const statsRes = await api.get('/api/attendance/stats');
                setAttendanceData(statsRes.data);
            } catch (e) {
                console.error("Failed to fetch attendance stats", e);
            }

            // Fetch Real Live Location
            try {
                const liveEndpoint = '/api/attendance/live';
                const liveParams = department ? { department } : {};
                const liveRes = await api.get(liveEndpoint, { params: liveParams });
                setLiveAttendanceRecords(liveRes.data);
            } catch (e) {
                console.error("Failed to fetch live location", e);
            }

            // Keep other mocks for now (Payroll Summary, Officials, Leave Requests) until backend integrated
            setLeaveRequests([
                { id: '1', applicant: 'Suresh Raina', role: 'worker', department: 'Education', type: 'Sick Leave', dates: 'Oct 28 - Oct 30', reason: 'Viral Fever', status: 'Pending' },
                { id: '2', applicant: 'Ajay Jadeja', role: 'official', department: 'Engineering', type: 'Casual Leave', dates: 'Nov 1 - Nov 5', reason: 'Family Wedding', status: 'Pending' },
                { id: '3', applicant: 'Deepak Hooda', role: 'worker', department: 'Health', type: 'Emergency', dates: 'Oct 27', reason: 'Personal Emergency', status: 'Approved' },
            ]);

            setPayrollData([
                { department: 'Education', budget: 1500000, actuals: 1450000, status: 'Processing' },
                { department: 'Health', budget: 1200000, actuals: 1180000, status: 'Pending' },
                { department: 'Engineering', budget: 1300000, actuals: 1250000, status: 'Released' },
            ]);

            setOfficials([
                { id: '1', name: 'Dr. A. Verma', department: 'Health', status: 'Active' },
                { id: '2', name: 'Mr. R. Singh', department: 'Sanitation', status: 'Active' },
                { id: '3', name: 'Mrs. K. Sharma', department: 'Education', status: 'On Leave' },
            ]);

            setLoading(false);
        };

        fetchData();
    }, [department]);

    // Action Handlers
    const releasePayroll = (departmentName?: string) => {
        setPayrollData(prev => prev.map(item =>
            (!departmentName || item.department === departmentName)
                ? { ...item, status: 'Released' }
                : item
        ));
    };

    const updateGrievanceStatus = (id: string, status: Grievance['status']) => {
        setGrievances(prev => prev.map(g => g.id === id ? { ...g, status } : g));
    };

    const updateLeaveStatus = async (id: string, status: LeaveRequest['status']) => {
        try {
            await apiUpdateLeaveStatus(id, status);
            setLeaveRequests(prev => prev.map(l => l.id === id ? { ...l, status } : l));
        } catch (error) {
            console.error("Failed to update leave status", error);
        }
    };

    return {
        loading,
        attendanceData,
        grievances,
        leaveRequests,
        payrollData,
        officials,
        liveAttendanceRecords,
        releasePayroll,
        updateGrievanceStatus,
        updateLeaveStatus,
        departmentPayroll
    };
};
