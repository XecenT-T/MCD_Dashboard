import { useState, useEffect } from 'react';

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
    status: 'Pending' | 'Resolved' | 'Under Review';
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

export const useHRData = () => {
    const [loading, setLoading] = useState(true);

    // Mock Data State
    const [attendanceData, setAttendanceData] = useState<DepartmentStats[]>([]);
    const [grievances, setGrievances] = useState<Grievance[]>([]);
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [payrollData, setPayrollData] = useState<PayrollData[]>([]);
    const [officials, setOfficials] = useState<Official[]>([]);

    useEffect(() => {
        // Simulate API fetch delay
        const timer = setTimeout(() => {
            setAttendanceData([
                { department: 'Education', present: 45, absent: 5, leave: 2, total: 52 },
                { department: 'Health', present: 38, absent: 8, leave: 4, total: 50 },
                { department: 'Engineering', present: 42, absent: 3, leave: 1, total: 46 },
            ]);

            setGrievances([
                { id: '1', submittedBy: 'Rohan Gupta', role: 'official', department: 'Education', subject: 'Staff Shortage', description: 'Urgent need for more math teachers.', date: '2023-10-25', status: 'Pending' },
                { id: '2', submittedBy: 'Amit Kumar', role: 'worker', department: 'Health', subject: 'Salary Delay', description: 'September salary not received yet.', date: '2023-10-26', status: 'Under Review' },
                { id: '3', submittedBy: 'Priya Singh', role: 'worker', department: 'Engineering', subject: 'Safety Gear', description: 'Helmets are damaged.', date: '2023-10-24', status: 'Pending' },
                { id: '4', submittedBy: 'Vikram Malhotra', role: 'official', department: 'Health', subject: 'Equipment Malfunction', description: 'X-Ray machine needs repair.', date: '2023-10-22', status: 'Resolved' },
            ]);

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
        }, 800);

        return () => clearTimeout(timer);
    }, []);

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

    const updateLeaveStatus = (id: string, status: LeaveRequest['status']) => {
        setLeaveRequests(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    };

    return {
        loading,
        attendanceData,
        grievances,
        leaveRequests,
        payrollData,
        officials,
        releasePayroll,
        updateGrievanceStatus,
        updateLeaveStatus
    };
};
