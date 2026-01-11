
import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useNavigate } from 'react-router-dom';

interface DepartmentPayrollProps {
    department: string;
    data: any[]; // List of { user, payroll }
    onManage?: (item?: any) => void;
}

const DepartmentPayrollCommandCenter: React.FC<DepartmentPayrollProps> = ({ department, data, onManage }) => {
    const { t } = useLanguage();
    const navigate = useNavigate();

    // Calculate Stats
    // Assuming budget is not explicitly fetched per person, we might simulate it or just show actuals
    // For "Budget", let's sum up (NetPay if processed) or just count people * avg salary?
    // Let's just user "Total Monthly Outlay" as Sum of NetPay for all.

    const totalOutlay = data.reduce((acc, item) => {
        const amount = item.payroll ? parseInt(item.payroll.netPay || 0) : 0;
        return acc + amount;
    }, 0);

    const paidCount = data.filter(item => item.payroll?.status === 'Processed').length;
    const totalCount = data.length;

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumSignificantDigits: 3
        }).format(val);
    };

    return (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-surface-dark dark:to-black text-white p-6 rounded-2xl shadow-lg flex flex-col h-full relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 p-8 opacity-5">
                <span className="material-symbols-outlined text-9xl">payments</span>
            </div>

            <div className="flex items-center justify-between mb-8 relative z-10">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        {t('dept_management')} - Payroll
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">{department} Department</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold border ${paidCount === totalCount && totalCount > 0 ? 'bg-green-500/20 border-green-500/50 text-green-400' : 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'}`}>
                    {paidCount === totalCount && totalCount > 0 ? 'All Processed' : `${paidCount}/${totalCount} Processed`}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total Outlay</p>
                    <p className="text-2xl font-bold mt-1 text-white">{formatCurrency(totalOutlay)}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Employees</p>
                    <p className="text-2xl font-bold mt-1 text-blue-400">{totalCount}</p>
                </div>
            </div>

            <div className="space-y-3 mb-8 flex-1 relative z-10 overflow-y-auto max-h-[400px]">
                {data.length === 0 ? (
                    <div className="text-center text-gray-500 py-4">No employees found.</div>
                ) : (
                    data.map((item, idx) => {
                        const status = item.payroll?.status || 'Pending';
                        const amount = item.payroll ? parseInt(item.payroll.netPay) : 0;

                        return (
                            <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-transparent hover:border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className={`size-2 rounded-full ${status === 'Processed' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-yellow-500 animate-pulse'}`}></div>
                                    <div>
                                        <p className="font-bold text-sm">{item.user.name}</p>
                                        <p className="text-xs text-gray-400 capitalize">{item.user.role} • {status}</p>
                                    </div>
                                </div>
                                <div className="text-right flex items-center gap-3">
                                    <p className="font-mono text-sm font-bold">{amount > 0 ? formatCurrency(amount) : '-'}</p>
                                    <button
                                        onClick={() => onManage && onManage(item)}
                                        className="p-1 hover:bg-white/20 rounded text-gray-400 hover:text-white transition-colors"
                                        title="Edit Status"
                                    >
                                        <span className="material-symbols-outlined text-sm">edit</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <button
                className={`w-full py-4 rounded-xl font-bold text-sm relative overflow-hidden group transition-all z-10 ${totalCount === 0 ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/30'}`}
                onClick={() => {
                    if (onManage) onManage();
                    else navigate(`/payroll?mode=manage&dept=${department}`);
                }}
            >
                <div className="flex items-center justify-center gap-2 relative z-10">
                    <span className="material-symbols-outlined">settings</span>
                    Manage Department Payroll
                </div>
            </button>
        </div>
    );
};

export default DepartmentPayrollCommandCenter;
