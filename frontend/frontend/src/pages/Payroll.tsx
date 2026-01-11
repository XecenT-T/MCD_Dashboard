import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getUsersForPayroll, getPayrollByUser, getAllPayrolls, createPayroll, updatePayroll, downloadPayslip } from '../api/payroll';

const Payroll = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const isOfficial = user?.role === 'official';
    const isHR = user?.role === 'hr' || (isOfficial && ['general', 'administration', 'hr'].includes((user?.department || '').toLowerCase()));

    // States
    const [view, setView] = useState<'overview' | 'manage'>('overview');
    const [users, setUsers] = useState<any[]>([]);
    const [payrolls, setPayrolls] = useState<any[]>([]); // History for HR
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
    // Fetch Data
    const loadData = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            if (isHR) {
                const [usersData, historyData] = await Promise.all([getUsersForPayroll(), getAllPayrolls()]);
                setUsers(usersData);
                setPayrolls(historyData);
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
        <DashboardLayout title={t('nav_payroll')}>
            <div className="max-w-[1200px] mx-auto flex flex-col gap-6">

                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {isHR ? t('payroll_management') : t('my_payslip')}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            {isHR ? t('payroll_desc_hr') : t('payroll_desc_user')}
                        </p>
                    </div>
                    {isHR && (
                        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                            <button onClick={() => setView('overview')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${view === 'overview' ? 'bg-white dark:bg-gray-700 shadow text-primary' : 'text-gray-500'}`}>{t('overview')}</button>
                            <button onClick={() => setView('manage')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${view === 'manage' ? 'bg-white dark:bg-gray-700 shadow text-primary' : 'text-gray-500'}`}>{t('management_mode')}</button>
                        </div>
                    )}
                </div>

                {loading && (
                    <div className="flex justify-center p-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                )}

                {/* Worker View */}
                {!isHR && !loading && (
                    <div className="flex flex-col gap-6">
                        {latestPayslip ? (
                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white flex justify-between items-center">
                                    <div>
                                        <h2 className="text-2xl font-bold">{latestPayslip.month}</h2>
                                        <p className="text-blue-100">{t('status')}: {latestPayslip.status}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm opacity-80">{t('net_pay')}</p>
                                        <p className="text-3xl font-bold">₹{latestPayslip.netPay}</p>
                                    </div>
                                </div>

                                <div className="p-6 grid md:grid-cols-2 gap-8">
                                    <div>
                                        <h3 className="font-bold mb-4 text-green-600">{t('earnings')}</h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between px-2 py-1 bg-gray-50 dark:bg-gray-900/50 rounded"><span>{t('basic_col')}</span><span>₹{latestPayslip.earnings.basic}</span></div>
                                            <div className="flex justify-between px-2 py-1"><span>{t('hra_col')}</span><span>₹{latestPayslip.earnings.hra}</span></div>
                                            <div className="flex justify-between px-2 py-1 bg-gray-50 dark:bg-gray-900/50 rounded"><span>{t('conveyance_col')}</span><span>₹{latestPayslip.earnings.conveyance}</span></div>
                                            <div className="flex justify-between px-2 py-1"><span>{t('medical_col')}</span><span>₹{latestPayslip.earnings.medical}</span></div>
                                            <div className="flex justify-between px-2 py-1 bg-gray-50 dark:bg-gray-900/50 rounded"><span>{t('special_col')}</span><span>₹{latestPayslip.earnings.special}</span></div>
                                            <div className="flex justify-between font-bold pt-2 border-t"><span>{t('total')}</span><span>₹{latestPayslip.earnings.total}</span></div>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold mb-4 text-red-600">{t('deductions')}</h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between px-2 py-1 bg-gray-50 dark:bg-gray-900/50 rounded"><span>{t('pf_col')}</span><span>₹{latestPayslip.deductions.pf}</span></div>
                                            <div className="flex justify-between px-2 py-1"><span>{t('esi_col')}</span><span>₹{latestPayslip.deductions.esi}</span></div>
                                            <div className="flex justify-between px-2 py-1 bg-gray-50 dark:bg-gray-900/50 rounded"><span>{t('tax_col')}</span><span>₹{latestPayslip.deductions.tax}</span></div>
                                            <div className="flex justify-between font-bold pt-2 border-t"><span>{t('total')}</span><span>₹{latestPayslip.deductions.total}</span></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                                    <button onClick={() => downloadPayslip(latestPayslip._id)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors">
                                        <span className="material-symbols-outlined">download</span> {t('download_pdf')}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                                <span className="material-symbols-outlined text-4xl text-gray-300">payments</span>
                                <p className="text-gray-500 mt-2">No payslips found.</p>
                            </div>
                        )}

                        {/* History */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">{t('payment_history')}</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-500">
                                            <th className="pb-3">{t('month')}</th>
                                            <th className="pb-3">{t('paid_on')}</th>
                                            <th className="pb-3">{t('amount')}</th>
                                            <th className="pb-3">{t('status')}</th>
                                            <th className="pb-3 text-right">{t('action')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {myPayrolls.map((p) => (
                                            <tr key={p._id}>
                                                <td className="py-3 font-medium">{p.month}</td>
                                                <td className="py-3">{p.paidOn || '-'}</td>
                                                <td className="py-3">₹{p.netPay}</td>
                                                <td className="py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.status === 'Processed' ? 'bg-green-100 text-green-700' : p.status === 'Hold' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                        {p.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 text-right">
                                                    <button onClick={() => downloadPayslip(p._id)} className="text-primary hover:underline text-xs">Download</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* HR View */}
                {isHR && view === 'overview' && !loading && (
                    <div className="space-y-6">
                        {/* Actions Row */}
                        <div className="flex justify-end">
                            <button
                                onClick={() => setView('manage')}
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg shadow hover:bg-blue-700 transition-colors"
                            >
                                <span className="material-symbols-outlined">add_circle</span>
                                {t('process_new_payroll')}
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                                <p className="text-gray-500 text-sm">{t('total_disbursed')}</p>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    ₹{payrolls.reduce((acc, curr) => acc + parseInt(curr.netPay || 0), 0).toLocaleString()}
                                </h3>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                                <p className="text-gray-500 text-sm">{t('pending_actions')}</p>
                                <h3 className="text-2xl font-bold text-yellow-600 mt-1">
                                    {payrolls.filter(p => p.status === 'Pending').length}
                                </h3>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                                <p className="text-gray-500 text-sm">{t('employees_paid')}</p>
                                <h3 className="text-2xl font-bold text-green-600 mt-1">
                                    {payrolls.filter(p => p.status === 'Processed').length}
                                </h3>
                            </div>
                        </div>

                        {/* Recent Transactions Table */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                            <div className="p-5 border-b border-gray-200 dark:border-gray-700 font-bold text-gray-900 dark:text-white">{t('recent_transactions')}</div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                                        <tr>
                                            <th className="py-3 px-5 font-medium text-gray-500">Employee</th>
                                            <th className="py-3 px-5 font-medium text-gray-500">{t('month')}</th>
                                            <th className="py-3 px-5 font-medium text-gray-500">{t('net_pay')}</th>
                                            <th className="py-3 px-5 font-medium text-gray-500">{t('status')}</th>
                                            <th className="py-3 px-5 font-medium text-gray-500">{t('action')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {payrolls.map((p) => (
                                            <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                <td className="py-3 px-5 font-medium">{p.user?.name || 'Unknown'}</td>
                                                <td className="py-3 px-5">{p.month}</td>
                                                <td className="py-3 px-5">₹{p.netPay}</td>
                                                <td className="py-3 px-5">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.status === 'Processed' ? 'bg-green-100 text-green-700' : p.status === 'Hold' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                        {p.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-5">
                                                    <button onClick={() => handleEdit(p)} className="text-primary hover:underline">Edit</button>
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
                {isHR && view === 'manage' && !loading && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="font-bold text-gray-900 dark:text-white">{t('active_employees')}</h3>
                            {/* Search could go here */}
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
                                    {users.map((u) => (
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
                        {users.length === 0 && (
                            <div className="p-8 text-center text-gray-500">
                                <span className="material-symbols-outlined text-4xl mb-2">group_off</span>
                                <p>No employees found to process payroll for.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Create/Edit Modal */}
                {showModal && (
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
                )}

            </div>
        </DashboardLayout>
    );
};

export default Payroll;
