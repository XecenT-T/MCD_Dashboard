
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { createPayroll, updatePayroll } from '../../api/payroll';

interface DepartmentPayrollManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    department: string;
    employees: any[]; // List of { user, payroll }
    onSuccess?: () => void;
    initialSelectedUser?: any;
}

const DepartmentPayrollManagerModal: React.FC<DepartmentPayrollManagerModalProps> = ({ isOpen, onClose, department, employees, onSuccess, initialSelectedUser }) => {
    const { t } = useLanguage();
    const [view, setView] = useState<'list' | 'form'>('list');
    const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        month: '',
        basic: '0', hra: '0', conveyance: '0', medical: '0', special: '0',
        pf: '0', esi: '0', tax: '0',
        status: 'Pending', accountNo: '', paidOn: ''
    });

    // Reset view when opening
    useEffect(() => {
        if (isOpen) {
            if (initialSelectedUser) {
                // Auto-open form
                handleProcess(initialSelectedUser);
            } else {
                setView('list');
                setSelectedEmployee(null);
            }
        }
    }, [isOpen, initialSelectedUser]);

    const handleProcess = (employee: any) => {
        const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
        const existingPayroll = employee.payroll;
        const isCurrentMonth = existingPayroll && existingPayroll.month === currentMonth;

        if (isCurrentMonth) {
            // Edit Mode
            setFormData({
                month: existingPayroll.month,
                basic: existingPayroll.earnings.basic,
                hra: existingPayroll.earnings.hra,
                conveyance: existingPayroll.earnings.conveyance,
                medical: existingPayroll.earnings.medical,
                special: existingPayroll.earnings.special,
                pf: existingPayroll.deductions.pf,
                esi: existingPayroll.deductions.esi,
                tax: existingPayroll.deductions.tax,
                status: existingPayroll.status,
                accountNo: existingPayroll.accountNo || '',
                paidOn: existingPayroll.paidOn || ''
            });
            setSelectedEmployee({ ...employee.user, payrollId: existingPayroll._id, isEdit: true });
        } else {
            // Create Mode
            setFormData({
                month: currentMonth,
                basic: '20000', hra: '5000', conveyance: '2000', medical: '1000', special: '0',
                pf: '1800', esi: '500', tax: '0',
                status: 'Pending', accountNo: employee.user.accountNo || '', paidOn: ''
            });
            setSelectedEmployee({ ...employee.user, isEdit: false });
        }
        setView('form');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

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
            user: selectedEmployee._id || selectedEmployee.id,
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
            paidOn: formData.status === 'Processed' ? (formData.paidOn || new Date().toLocaleDateString()) : '',
            accountNo: formData.accountNo
        };

        try {
            if (selectedEmployee.isEdit && selectedEmployee.payrollId) {
                await updatePayroll(selectedEmployee.payrollId, payload);
            } else {
                await createPayroll(payload);
            }
            if (onSuccess) onSuccess();
            setView('list'); // Return to list after success to process others
        } catch (err) {
            console.error(err);
            alert('Failed to save payroll');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">

                {/* Header */}
                <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
                    <div>
                        <h3 className="text-xl font-bold dark:text-white">
                            {view === 'list' ? `Manage Payroll: ${department}` : (selectedEmployee?.isEdit ? 'Edit Payroll' : 'Process New Payroll')}
                        </h3>
                        {view === 'form' && <p className="text-sm text-gray-500">{selectedEmployee?.name} • {formData.month}</p>}
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {view === 'list' ? (
                        <div className="space-y-4">
                            {employees.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">No employees found in this department.</p>
                            ) : (
                                employees.map((item, idx) => {
                                    const latestMonth = item.payroll?.month;
                                    const isProcessedThisMonth = latestMonth === new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

                                    return (
                                        <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                                            <div className="flex items-center gap-4">
                                                <div className={`size-10 rounded-full flex items-center justify-center text-white font-bold ${isProcessedThisMonth ? 'bg-green-500' : 'bg-blue-500'}`}>
                                                    {item.user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold dark:text-white">{item.user.name}</p>
                                                    <p className="text-xs text-gray-500 capitalize">{item.user.role} • {item.user.post || 'No Post'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {isProcessedThisMonth && (
                                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[10px]">check_circle</span> Processed
                                                    </span>
                                                )}
                                                <button
                                                    onClick={() => handleProcess(item)}
                                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isProcessedThisMonth ? 'bg-gray-200 dark:bg-gray-600 dark:text-gray-300 hover:bg-gray-300' : 'bg-primary text-white hover:bg-blue-700'}`}
                                                >
                                                    {isProcessedThisMonth ? 'Edit' : 'Process'}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="grid gap-6">
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
                        </form>
                    )}
                </div>

                {/* Footer */}
                {view === 'form' && (
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-900">
                        <button
                            type="button"
                            onClick={() => setView('list')}
                            className="px-4 py-2 border rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-white transition-colors"
                        >
                            Back to List
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Payroll'}
                        </button>
                    </div>
                )}
                {view === 'list' && (
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-900">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                        >
                            Done
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DepartmentPayrollManagerModal;
