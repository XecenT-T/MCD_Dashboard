
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLanguage } from '../context/LanguageContext';

const AttendanceChart = ({ isOfficial, data }: { isOfficial: boolean, data?: any[] }) => {
    const { t } = useLanguage();
    // Check if data exists
    if (!data || data.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm italic">
                {t('no_records')}
            </div>
        );
    }
    const chartData = data;
    // Customize colors based on role or theme if needed
    const presentColor = isOfficial ? "#82ca9d" : "#2563eb"; // Green for official/team, Primary blue for worker

    return (
        <div className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={chartData}
                    margin={{
                        top: 10,
                        right: 10,
                        left: -20,
                        bottom: 0,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#fff',
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        cursor={{ fill: '#f3f4f6' }}
                    />
                    <Bar dataKey="present" name={t('present_days_chart')} fill={presentColor} radius={[4, 4, 0, 0]} barSize={40}>
                        {/* Optional: individual cell styling */}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default AttendanceChart;
