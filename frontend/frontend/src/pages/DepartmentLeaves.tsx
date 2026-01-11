import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import LeaveManagementTable from '../components/hr/LeaveManagementTable';
import { getDepartmentLeaves, updateLeaveStatus as apiUpdateLeaveStatus } from '../api/leaves';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export interface LeaveRequest {
    id: string; // The table expects 'id' but api might return '_id', we'll map it
    applicant: string;
    role: 'official' | 'worker';
    department: string;
    type: string;
    dates: string;
    reason: string;
    status: 'Pending' | 'Approved' | 'Rejected';
}

const DepartmentLeaves = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaves();
    }, []);

    const fetchLeaves = async () => {
        try {
            setLoading(true);
            const data = await getDepartmentLeaves();
            // Map _id to id if necessary, though our mock/api typically handles it.
            // The API response from 'department' logic I wrote in Step 72 maps `_id` to `id`.
            setRequests(data);
        } catch (error) {
            console.error("Failed to fetch department leaves", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, status: LeaveRequest['status']) => {
        try {
            await apiUpdateLeaveStatus(id, status);
            // Optimistic update
            setRequests(prev => prev.map(req => req.id === id ? { ...req, status } : req));
        } catch (error) {
            console.error("Failed to update status", error);
            // Revert or show error could go here
        }
    };

    if (loading) {
        return (
            <DashboardLayout title={t('dept_leaves') || "Department Leaves"}>
                <div className="flex h-screen items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title={t('dept_leaves') || "Department Leaves"}>
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-gray-100 dark:border-border-dark">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            {t('dept_leaves') || "Department Leaves"}
                        </h2>
                        <p className="text-sm text-text-muted">
                            Manage leave requests for {user?.department} department.
                        </p>
                    </div>
                </div>

                <div className="h-[calc(100vh-250px)]">
                    <LeaveManagementTable requests={requests} onUpdateStatus={handleUpdateStatus} />
                </div>
            </div>
        </DashboardLayout>
    );
};

export default DepartmentLeaves;
