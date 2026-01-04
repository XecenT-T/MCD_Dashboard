import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'Week 1', present: 5, absent: 0 },
    { name: 'Week 2', present: 4, absent: 1 },
    { name: 'Week 3', present: 5, absent: 0 },
    { name: 'Week 4', present: 3, absent: 2 },
];

const AttendanceChart = ({ isSupervisor }: { isSupervisor: boolean }) => {
    // Customize colors based on role or theme if needed
    const presentColor = isSupervisor ? "#82ca9d" : "#2563eb"; // Green for supervisor/team, Primary blue for worker

    return (
        <div className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
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
                    <Bar dataKey="present" name="Present Days" fill={presentColor} radius={[4, 4, 0, 0]} barSize={40}>
                        {/* Optional: individual cell styling */}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default AttendanceChart;
