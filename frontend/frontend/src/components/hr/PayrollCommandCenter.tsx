
import type { PayrollData } from '../../hooks/useHRData';
import { useLanguage } from '../../context/LanguageContext';

interface PayrollCommandCenterProps {
    data: PayrollData[];
    onRelease: (department?: string) => void;
}

const PayrollCommandCenter: React.FC<PayrollCommandCenterProps> = ({ data, onRelease }) => {
    const { t } = useLanguage();
    const totalBudget = data.reduce((acc, curr) => acc + curr.budget, 0);
    const totalActuals = data.reduce((acc, curr) => acc + curr.actuals, 0);
    const allreleased = data.every(d => d.status === 'Released');

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
                        {t('payroll_command_center')}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">October 2023 {t('cycle_txt')}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold border ${allreleased ? 'bg-green-500/20 border-green-500/50 text-green-400' : 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'}`}>
                    {allreleased ? t('cycle_completed') : t('action_required_caps')}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{t('total_allocated')}</p>
                    <p className="text-2xl font-bold mt-1 text-white">{formatCurrency(totalBudget)}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{t('total_balance')}</p>
                    <p className={`text-2xl font-bold mt-1 ${totalBudget - totalActuals < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {formatCurrency(totalBudget - totalActuals)}
                    </p>
                </div>
            </div>

            <div className="space-y-3 mb-8 flex-1 relative z-10 overflow-y-auto pr-2">
                {data.map((item, idx) => {
                    const utilization = (item.actuals / item.budget) * 100;
                    const isOverBudget = item.actuals > item.budget;

                    return (
                        <div key={idx} className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-transparent hover:border-white/10">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <div className={`size-2 rounded-full ${item.status === 'Released' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-yellow-500 animate-pulse'}`}></div>
                                    <div>
                                        <p className="font-bold text-sm">{t(`dept_${item.department.toLowerCase()}`) || item.department}</p>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">{item.status}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-mono text-sm font-bold">{formatCurrency(item.actuals)}</p>
                                    <p className="text-[10px] text-gray-400">of {formatCurrency(item.budget)}</p>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full bg-black/20 h-1.5 rounded-full overflow-hidden flex">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${isOverBudget ? 'bg-red-500' : 'bg-blue-500'}`}
                                    style={{ width: `${Math.min(utilization, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    )
                })}
            </div>

            <button
                onClick={() => onRelease()}
                disabled={allreleased}
                className={`w-full py-4 rounded-xl font-bold text-sm relative overflow-hidden group transition-all z-10 ${allreleased ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white shadow-lg shadow-green-500/30'}`}
            >
                <div className="flex items-center justify-center gap-2 relative z-10">
                    <span className="material-symbols-outlined">{allreleased ? 'check_circle' : 'send_money'}</span>
                    {allreleased ? t('payouts_released') : t('release_batch_payout')}
                </div>
                {!allreleased && (
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                )}
            </button>
        </div>
    );
};

export default PayrollCommandCenter;
