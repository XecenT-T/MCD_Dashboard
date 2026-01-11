import { useState, useEffect } from 'react';
import { getDepartmentLeaves, updateLeaveStatus as apiUpdateLeaveStatus } from '../api/leaves';

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

export const useHRData = () => {
    const [loading, setLoading] = useState(true);

    // Mock Data State
    const [attendanceData, setAttendanceData] = useState<DepartmentStats[]>([]);
    const [grievances, setGrievances] = useState<Grievance[]>([]);
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [payrollData, setPayrollData] = useState<PayrollData[]>([]);
    const [officials, setOfficials] = useState<Official[]>([]);
    const [liveAttendanceRecords, setLiveAttendanceRecords] = useState<AttendanceRecord[]>([]);

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

            // Fetch real leave requests
            getDepartmentLeaves().then(data => {
                setLeaveRequests(data);
            }).catch(err => {
                console.error("Failed to fetch leaves", err);
                // Fallback to empty if failed, or keep mock if desired (but plan says real data)
                setLeaveRequests([]);
            });

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

            setLiveAttendanceRecords([
                { _id: '1', checkInTime: '09:00 AM', location: { lat: 28.6139, lng: 77.2090, address: 'Connaught Place' }, user: { _id: 'u1', name: 'Rohan Gupta', role: 'Official', department: 'Education' }, status: 'Present' },
                { _id: '2', checkInTime: '09:15 AM', location: { lat: 28.5355, lng: 77.3910, address: 'Noida Sector 18' }, user: { _id: 'u2', name: 'Amit Kumar', role: 'Worker', department: 'Health' }, status: 'Present' },
                { _id: '3', checkInTime: '09:30 AM', location: { lat: 28.7041, lng: 77.1025, address: 'Pitampura' }, user: { _id: 'u3', name: 'Priya Singh', role: 'Worker', department: 'Engineering' }, status: 'Present' },
                { _id: '4', checkInTime: '09:45 AM', location: { lat: 28.6219, lng: 77.0878, address: 'Janakpuri' }, user: { _id: 'u4', name: 'Vikram M', role: 'Worker', department: 'Health' }, status: 'Present' },
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
        updateLeaveStatus
    };
};
