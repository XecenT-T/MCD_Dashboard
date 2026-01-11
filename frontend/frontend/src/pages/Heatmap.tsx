import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import DashboardLayout from '../components/DashboardLayout';
import LiveLocationMap, { type GenericAttendanceRecord } from '../components/LiveLocationMap';

const Heatmap = () => {
    const { token } = useAuth();
    const [attendanceData, setAttendanceData] = useState<GenericAttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/api/attendance/department?date=today', {
                    headers: { 'x-auth-token': token }
                });
                setAttendanceData(res.data);
            } catch (err) {
                console.error("Failed to fetch heatmap data", err);
            } finally {
                setLoading(false);
            }
        };
        if (token) fetchData();
    }, [token]);

    return (
        <DashboardLayout title="Live Location Tracker">
            <LiveLocationMap attendanceData={attendanceData} loading={loading} />
        </DashboardLayout>
    );
};

export default Heatmap;
