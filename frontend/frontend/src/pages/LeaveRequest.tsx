import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { createLeaveRequest, getMyLeaves } from '../api/leaves';
import { useLanguage } from '../context/LanguageContext';

interface LeaveRequest {
    _id: string;
    type: string;
    dates: string;
    reason: string;
    status: string;
    createdAt: string;
}

const LeaveRequest = () => {
    const { t } = useLanguage();
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [formData, setFormData] = useState({
        type: 'Sick Leave',
        dates: '',
        reason: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const data = await getMyLeaves();
            setRequests(data);
        } catch (error) {
            console.error('Failed to fetch leaves', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            await createLeaveRequest(formData);
            setMessage('Leave request submitted successfully!');
            setFormData({ type: 'Sick Leave', dates: '', reason: '' });
            fetchRequests();
        } catch (error) {
            console.error(error);
            setMessage('Failed to submit request.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout title="Leave Management">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Request Form */}
                <div className="bg-white dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-border-dark">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">add_circle</span>
                        Request Leave
                    </h2>

                    {message && (
                        <div className={`p-3 rounded-lg text-sm mb-4 ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Leave Type</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-primary outline-none"
                                >
                                    <option value="Sick Leave">Sick Leave</option>
                                    <option value="Casual Leave">Casual Leave</option>
                                    <option value="Emergency">Emergency</option>
                                    <option value="Earned Leave">Earned Leave</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dates (e.g., Oct 20 - Oct 22)</label>
                                <input
                                    type="text"
                                    value={formData.dates}
                                    onChange={(e) => setFormData({ ...formData, dates: e.target.value })}
                                    placeholder="e.g. 12th Jan - 14th Jan"
                                    required
                                    className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-primary outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason</label>
                            <textarea
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                rows={3}
                                required
                                className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-primary outline-none"
                            ></textarea>
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Submitting...' : 'Submit Request'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* My Requests List */}
                <div className="bg-white dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-border-dark">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-gray-500">history</span>
                        My History
                    </h2>

                    {requests.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No leave requests found.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 font-medium">
                                    <tr>
                                        <th className="px-4 py-3">Type</th>
                                        <th className="px-4 py-3">Dates</th>
                                        <th className="px-4 py-3">Reason</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 text-right">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {requests.map((req) => (
                                        <tr key={req._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{req.type}</td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{req.dates}</td>
                                            <td className="px-4 py-3 text-gray-500 truncate max-w-[200px]" title={req.reason}>{req.reason}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${req.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                                        req.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                            'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {req.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right text-gray-500 text-xs">
                                                {new Date(req.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default LeaveRequest;
