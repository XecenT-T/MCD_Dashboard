import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getUsersForPayroll, getPayrollByUser, getAllPayrolls, createPayroll, updatePayroll } from '../api/payroll';

const Payroll = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [searchParams] = useSearchParams();

    // View state with Priority to URL params
    const [view, setView] = useState<'overview' | 'manage'>((searchParams.get('mode') as 'manage') || 'overview');
    const [deptFilter, setDeptFilter] = useState(searchParams.get('dept') || '');

    const isOfficial = user?.role === 'official';
    const isHR = user?.role === 'hr' || (isOfficial && ['general', 'administration', 'hr'].includes((user?.department || '').toLowerCase()));

    // States
    const [users, setUsers] = useState<any[]>([]);
    // const [payrolls, setPayrolls] = useState<any[]>([]); // History for HR - UNUSED
    const [myPayrolls, setMyPayrolls] = useState<any[]>([]); // For Worker
    const [selectedUser, setSelectedUser] = useState<any>(null); // For Create/Edit Modal
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        month: '',
        basic: '0', hra: '0', conveyance: '0', medical: '0', special: '0',
        pf: '0', esi: '0', tax: '0',
        status: 'Pending', accountNo: '', paidOn: ''
    });

    // Fetch Data
    const loadData = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            if (isHR) {
                const [usersData] = await Promise.all([getUsersForPayroll(), getAllPayrolls()]);
                setUsers(usersData);
                // setPayrolls(historyData);
            } else {
                const myData = await getPayrollByUser(user.id);
                setMyPayrolls(myData);
            }
        } catch (err) {
            console.error("Failed to load payroll data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) loadData();
    }, [isHR, user]);

    // Filter Users for "Manage" View
    // If deptFilter is set, show only users from that department
    const filteredUsers = deptFilter
        ? users.filter(u => (u.department || '').toLowerCase() === deptFilter.toLowerCase())
        : users;

    /*
    const handleEdit = (payroll: any) => {
        // Hydrate form for editing
        setFormData({
            month: payroll.month,
            basic: payroll.earnings.basic,
            hra: payroll.earnings.hra,
            conveyance: payroll.earnings.conveyance,
            medical: payroll.earnings.medical,
            special: payroll.earnings.special,
            pf: payroll.deductions.pf,
            esi: payroll.deductions.esi,
            tax: payroll.deductions.tax,
            status: payroll.status,
            accountNo: payroll.accountNo || '',
            paidOn: payroll.paidOn || ''
        });
        setSelectedUser({ ...payroll.user, payrollId: payroll._id }); // Hack to pass ID
        setShowModal(true);
    };
    */

    const handleCreate = (userObj: any) => {
        // Reset form for new entry
        setFormData({
            month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
            basic: '20000', hra: '5000', conveyance: '2000', medical: '1000', special: '0',
            pf: '1800', esi: '500', tax: '0',
            status: 'Pending', accountNo: userObj.accountNo || '', paidOn: ''
        });
        setSelectedUser(userObj);
        setShowModal(true);
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        // Calculate totals
        const totalEarnings = (
            parseInt(formData.basic) + parseInt(formData.hra) + parseInt(formData.conveyance) +
            parseInt(formData.medical) + parseInt(formData.special)
        ).toString();

        const totalDeductions = (
            parseInt(formData.pf) + parseInt(formData.esi) + parseInt(formData.tax)
        ).toString();

        const netPay = (parseInt(totalEarnings) - parseInt(totalDeductions)).toString();

        const payload = {
            user: selectedUser._id || selectedUser.id,
            month: formData.month,
            earnings: {
                basic: formData.basic, hra: formData.hra, conveyance: formData.conveyance,
                medical: formData.medical, special: formData.special, total: totalEarnings
            },
            deductions: {
                pf: formData.pf, esi: formData.esi, tax: formData.tax, total: totalDeductions
            },
            netPay,
            status: formData.status,
            paidOn: formData.status === 'Processed' ? (formData.paidOn || new Date().toLocaleDateString()) : '', // Auto set date if paid
            accountNo: formData.accountNo
        };

        try {
            if (selectedUser.payrollId) {
                await updatePayroll(selectedUser.payrollId, payload);
            } else {
                await createPayroll(payload);
            }
            setShowModal(false);
            loadData(); // Re-fetch data instead of reload
            setView('overview'); // Switch back to overview to see the new entry
        } catch (err) {
            alert('Failed to save payroll');
        }
    };

    // Derived states
    const latestPayslip = myPayrolls.length > 0 ? myPayrolls[0] : null;

    return (
        <DashboardLayout>
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('payroll')}</h1>
                </div>

                {/* Overview View */}
                {view === 'overview' && (
                    <div className="space-y-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">{t('latest_pay')}</h3>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {latestPayslip ? `₹${parseFloat(latestPayslip.netPay).toLocaleString()}` : '-'}
                                </p>
                                <p className="text-xs text-green-500 mt-2 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-xs">check_circle</span>
                                    {latestPayslip?.status || 'No Data'}
                                </p>
                            </div>
                        </div>

                        {/* Recent Payrolls List */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="font-bold text-gray-900 dark:text-white">{t('history')}</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                                        <tr>
                                            <th className="py-3 px-6 font-medium text-gray-500">{t('month')}</th>
                                            <th className="py-3 px-6 font-medium text-gray-500">{t('earnings')}</th>
                                            <th className="py-3 px-6 font-medium text-gray-500">{t('deductions')}</th>
                                            <th className="py-3 px-6 font-medium text-gray-500">{t('net_pay')}</th>
                                            <th className="py-3 px-6 font-medium text-gray-500">{t('status')}</th>
                                            <th className="py-3 px-6 font-medium text-gray-500">{t('action')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {myPayrolls.map((p, i) => (
                                            <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                <td className="py-3 px-6 font-medium text-gray-900 dark:text-white">{p.month}</td>
                                                <td className="py-3 px-6 text-green-600">₹{p.earnings.total}</td>
                                                <td className="py-3 px-6 text-red-600">₹{p.deductions.total}</td>
                                                <td className="py-3 px-6 font-bold">₹{p.netPay}</td>
                                                <td className="py-3 px-6">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.status === 'Processed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                        {p.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-6">
                                                    <button className="text-blue-600 hover:text-blue-800 text-xs font-medium">Download</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* HR Manage View (User List) */}
                {
                    isHR && view === 'manage' && !loading && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                <h3 className="font-bold text-gray-900 dark:text-white">
                                    {deptFilter ? `${t('active_employees')} - ${deptFilter}` : t('active_employees')}
                                </h3>
                                {deptFilter && (
                                    <button onClick={() => setDeptFilter('')} className="text-xs text-red-500 hover:underline">
                                        Clear Filter
                                    </button>
                                )}
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                                        <tr>
                                            <th className="py-3 px-5 font-medium text-gray-500">Name</th>
                                            <th className="py-3 px-5 font-medium text-gray-500">Role</th>
                                            <th className="py-3 px-5 font-medium text-gray-500">Designation</th>
                                            <th className="py-3 px-5 font-medium text-gray-500">{t('action')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {filteredUsers.map((u) => (
                                            <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                <td className="py-3 px-5 font-medium">{u.name}</td>
                                                <td className="py-3 px-5 capitalize">{u.role}</td>
                                                <td className="py-3 px-5">{u.post || '-'}</td>
                                                <td className="py-3 px-5">
                                                    <button onClick={() => handleCreate(u)} className="px-3 py-1 bg-primary text-white rounded hover:bg-blue-700 transition-colors text-xs">
                                                        Process Payroll
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {filteredUsers.length === 0 && (
                                <div className="p-8 text-center text-gray-500">
                                    <span className="material-symbols-outlined text-4xl mb-2">group_off</span>
                                    <p>No employees found {deptFilter ? `in ${deptFilter}` : ''} to process payroll for.</p>
                                </div>
                            )}
                        </div>
                    )
                }

                {/* Create/Edit Modal */}
                {
                    showModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
                                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                    <h3 className="text-xl font-bold dark:text-white">
                                        {selectedUser?.payrollId ? t('save_payroll') : `${t('create_payroll')}: ${selectedUser?.name}`}
                                    </h3>
                                    <button onClick={() => setShowModal(false)}><span className="material-symbols-outlined">close</span></button>
                                </div>
                                <form onSubmit={handleSubmit} className="p-6 grid gap-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">{t('month')}</label>
                                            <input type="text" value={formData.month} onChange={e => setFormData({ ...formData, month: e.target.value })} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">{t('status')}</label>
                                            <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                                <option>Pending</option>
                                                <option>Processed</option>
                                                <option>Hold</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Account No</label>
                                            <input type="text" value={formData.accountNo} onChange={e => setFormData({ ...formData, accountNo: e.target.value })} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">{t('paid_on')}</label>
                                            <input type="text" value={formData.paidOn} onChange={e => setFormData({ ...formData, paidOn: e.target.value })} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="DD/MM/YYYY" />
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                        <h4 className="font-bold text-primary mb-3">{t('earnings')}</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {['basic', 'hra', 'conveyance', 'medical', 'special'].map(f => (
                                                <div key={f}>
                                                    <label className="block text-xs font-medium text-gray-500 mb-1 capitalize">{t(`${f}_col`)}</label>
                                                    <input type="number" value={formData[f as keyof typeof formData]} onChange={e => setFormData({ ...formData, [f]: e.target.value })} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                        <h4 className="font-bold text-red-600 mb-3">{t('deductions')}</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {['pf', 'esi', 'tax'].map(f => (
                                                <div key={f}>
                                                    <label className="block text-xs font-medium text-gray-500 mb-1 capitalize">{t(`${f}_col`)}</label>
                                                    <input type="number" value={formData[f as keyof typeof formData]} onChange={e => setFormData({ ...formData, [f]: e.target.value })} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 mt-4">
                                        <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white">{t('cancel')}</button>
                                        <button type="submit" className="px-4 py-2 bg-primary text-white rounded hover:bg-blue-700">{t('save_payroll')}</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )
                }

            </div >
        </DashboardLayout >
    );
};

export default Payroll;
