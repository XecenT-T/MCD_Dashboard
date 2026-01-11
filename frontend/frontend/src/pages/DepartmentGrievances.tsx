import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import DashboardLayout from '../components/DashboardLayout';
import { useLanguage } from '../context/LanguageContext';
import GrievanceManagementSystem from '../components/hr/GrievanceManagementSystem';

const DepartmentGrievances = () => {
    const { user, token } = useAuth();
    const { t } = useLanguage();
    const [grievances, setGrievances] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const isHR = user?.role === 'hr' || (user?.role === 'official' && ['hr', 'general', 'administration'].includes((user?.department || '').toLowerCase()));

    useEffect(() => {
        const fetchGrievances = async () => {
            try {
                let endpoint = '/api/grievances/department';
                if (isHR) {
                    endpoint = '/api/grievances/all';
                }
                const res = await api.get(endpoint);

                // Transform data match GrievanceManagementSystem expectation
                const transformed = res.data.map((g: any) => ({
                    id: g._id,
                    submittedBy: g.userId?.name || 'Unknown',
                    submitterId: g.userId?._id,
                    submitterProfile: g.userId,
                    role: g.userId?.role || 'worker',
                    department: g.department,
                    subject: g.title,
                    description: g.description,
                    date: new Date(g.createdAt).toLocaleDateString(),
                    status: g.status.charAt(0).toUpperCase() + g.status.slice(1),
                    replies: g.replies || []
                }));

                setGrievances(transformed);
            } catch (err) {
                console.error("Error fetching department grievances:", err);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchGrievances();
    }, [token, isHR]);

    const handleResolve = async (id: string) => {
        try {
            await api.patch(`/api/grievances/${id}/status`, { status: 'resolved' });
            setGrievances(prev => prev.map(g =>
                g.id === id ? { ...g, status: 'Resolved' } : g
            ));
        } catch (err) {
            console.error("Failed to resolve grievance", err);
            alert("Failed to resolve grievance.");
        }
    };

    const handleReply = async (id: string, message: string) => {
        try {
            const res = await api.post(`/api/grievances/${id}/reply`, { message });
            const updated = res.data;
            setGrievances(prev => prev.map(g =>
                g.id === id ? { ...g, replies: updated.replies } : g
            ));
        } catch (err) {
            console.error("Failed to send reply", err);
            alert("Failed to send reply");
        }
    };

    if (loading) {
        return (
            <DashboardLayout title="Department Grievances">
                <div className="flex h-screen items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Department Grievances">
            <div className="max-w-7xl mx-auto space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('grievance_hub')}</h2>
                    <p className="text-text-muted mt-1">{t('grievance_hub_desc')}</p>
                </div>

                <GrievanceManagementSystem
                    grievances={grievances.filter((g: any) => {
                        // Filter Logic copied from previous implementation to ensure consistency
                        const isSelf = g.submitterId === user?.id;
                        if (isSelf) return false;

                        // Officials (non-HR) see only Worker grievances
                        if (!isHR && g.role !== 'worker') return false;

                        return true;
                    })}
                    onResolve={handleResolve}
                    onReply={handleReply}
                />
            </div>
        </DashboardLayout>
    );
};

export default DepartmentGrievances;
