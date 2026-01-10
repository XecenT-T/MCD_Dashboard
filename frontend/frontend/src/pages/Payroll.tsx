import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const Payroll = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const isSupervisor = user?.role === 'supervisor';

    // Mock data for the logged-in worker's payslip
    const workerPayslip = {
        month: 'October 2023',
        earnings: {
            basic: '₹18,000',
            hra: '₹3,600',
            conveyance: '₹1,600',
            medical: '₹1,250',
            special: '₹1,050',
            total: '₹25,500'
        },
        deductions: {
            pf: '₹2,160',
            esi: '₹191',
            tax: '₹500',
            total: '₹2,851'
        },
        netPay: '₹22,649',
        status: 'Processed',
        paidOn: 'Oct 31, 2023',
        accountNo: 'XXXX-XXXX-4521'
    };

    return (
        <DashboardLayout title={t('nav_payroll')}>
            <div className="max-w-[1200px] mx-auto flex flex-col gap-6">
                {/* Breadcrumbs & Heading */}
                <div className="flex flex-col gap-4">
                    <nav className="flex text-sm text-gray-500 dark:text-gray-400">
                        <a className="hover:text-primary transition-colors" href="/dashboard">Home</a>
                        <span className="mx-2">/</span>
                        <span className="text-gray-900 dark:text-white font-medium">{t('nav_payroll')}</span>
                    </nav>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                                {isSupervisor ? 'Payroll Overview' : 'My Payslip'}
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">
                                {isSupervisor ? 'Manage disbursements, track processing status, and view history.' : 'View your salary details and download payslips.'}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium text-sm shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors">
                                <span className="material-symbols-outlined text-lg">download</span>
                                {isSupervisor ? 'Export Report' : 'Download Payslip'}
                            </button>
                            {isSupervisor && (
                                <button className="px-4 py-2 rounded-lg bg-primary text-white font-medium text-sm shadow hover:bg-blue-700 flex items-center gap-2 transition-colors">
                                    <span className="material-symbols-outlined text-lg">add</span>
                                    Create New Batch
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Worker View - Personal Payslip */}
                {true ? (
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Main Payslip Card */}
                        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-primary to-blue-600 text-white p-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-2xl font-bold">{workerPayslip.month}</h2>
                                        <p className="text-blue-100 mt-1">Salary Slip</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-100">
                                            <span className="material-symbols-outlined text-sm">check_circle</span>
                                            {workerPayslip.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Employee Info */}
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400">Employee Name</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{user?.name || 'Worker'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400">Employee ID</p>
                                        <p className="font-medium text-gray-900 dark:text-white">MCD-{user?.id?.slice(-4) || '0001'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400">Paid On</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{workerPayslip.paidOn}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400">Bank Account</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{workerPayslip.accountNo}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Earnings & Deductions */}
                            <div className="p-6">
                                <div className="grid md:grid-cols-2 gap-8">
                                    {/* Earnings */}
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                            Earnings
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500 dark:text-gray-400">Basic Salary</span>
                                                <span className="text-gray-900 dark:text-white font-medium">{workerPayslip.earnings.basic}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500 dark:text-gray-400">House Rent Allowance</span>
                                                <span className="text-gray-900 dark:text-white font-medium">{workerPayslip.earnings.hra}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500 dark:text-gray-400">Conveyance</span>
                                                <span className="text-gray-900 dark:text-white font-medium">{workerPayslip.earnings.conveyance}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500 dark:text-gray-400">Medical Allowance</span>
                                                <span className="text-gray-900 dark:text-white font-medium">{workerPayslip.earnings.medical}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500 dark:text-gray-400">Special Allowance</span>
                                                <span className="text-gray-900 dark:text-white font-medium">{workerPayslip.earnings.special}</span>
                                            </div>
                                            <div className="flex justify-between text-sm pt-3 border-t border-gray-200 dark:border-gray-700">
                                                <span className="text-gray-900 dark:text-white font-bold">Total Earnings</span>
                                                <span className="text-green-600 dark:text-green-400 font-bold">{workerPayslip.earnings.total}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Deductions */}
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                            Deductions
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500 dark:text-gray-400">Provident Fund</span>
                                                <span className="text-gray-900 dark:text-white font-medium">{workerPayslip.deductions.pf}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500 dark:text-gray-400">ESI</span>
                                                <span className="text-gray-900 dark:text-white font-medium">{workerPayslip.deductions.esi}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500 dark:text-gray-400">Professional Tax</span>
                                                <span className="text-gray-900 dark:text-white font-medium">{workerPayslip.deductions.tax}</span>
                                            </div>
                                            <div className="flex justify-between text-sm pt-3 border-t border-gray-200 dark:border-gray-700">
                                                <span className="text-gray-900 dark:text-white font-bold">Total Deductions</span>
                                                <span className="text-red-600 dark:text-red-400 font-bold">{workerPayslip.deductions.total}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Net Pay */}
                                <div className="mt-8 p-6 bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-xl border border-primary/20">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400 text-sm">Net Salary (Take Home)</p>
                                            <p className="text-4xl font-bold text-primary">{workerPayslip.netPay}</p>
                                        </div>
                                        <button className="px-6 py-3 rounded-lg bg-primary text-white font-medium shadow hover:bg-blue-700 flex items-center gap-2 transition-colors">
                                            <span className="material-symbols-outlined">picture_as_pdf</span>
                                            Download PDF
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar */}
                        <div className="w-full lg:w-80 flex flex-col gap-6">
                            {/* Recent Payslips */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
                                <h4 className="font-bold text-gray-900 dark:text-white mb-4">Previous Months</h4>
                                <div className="space-y-3">
                                    {['September 2023', 'August 2023', 'July 2023'].map((month, i) => (
                                        <button key={i} className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white text-sm">{month}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">₹22,649</p>
                                            </div>
                                            <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Year to Date */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
                                <h4 className="font-bold text-gray-900 dark:text-white mb-4">YTD Summary</h4>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-500 dark:text-gray-400">Total Earned</span>
                                            <span className="font-medium text-gray-900 dark:text-white">₹2,55,000</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-500 dark:text-gray-400">Total Deducted</span>
                                            <span className="font-medium text-gray-900 dark:text-white">₹28,510</span>
                                        </div>
                                    </div>
                                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-bold text-gray-900 dark:text-white">Net Received</span>
                                            <span className="font-bold text-primary">₹2,26,490</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Official View - Full Table (existing code) */
                    <>
                        {/* Stats Grid for Supervisors */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col gap-2">
                                <div className="flex justify-between items-start">
                                    <div className="p-2 rounded-lg bg-green-100 text-green-700"><span className="material-symbols-outlined">check_circle</span></div>
                                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-50 text-green-700">+12%</span>
                                </div>
                                <p className="text-gray-500 text-sm">Total Disbursed</p>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">₹4.2 Cr</h3>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col gap-2">
                                <div className="p-2 rounded-lg bg-orange-100 text-orange-700 w-fit"><span className="material-symbols-outlined">pending</span></div>
                                <p className="text-gray-500 text-sm">Pending Approvals</p>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">48</h3>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col gap-2">
                                <div className="p-2 rounded-lg bg-blue-100 text-primary w-fit"><span className="material-symbols-outlined">group</span></div>
                                <p className="text-gray-500 text-sm">Total Employees</p>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">1,240</h3>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col gap-2">
                                <div className="p-2 rounded-lg bg-red-100 text-red-700 w-fit"><span className="material-symbols-outlined">report_problem</span></div>
                                <p className="text-gray-500 text-sm">Grievances</p>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">5</h3>
                            </div>
                        </div>

                        {/* Table for Supervisors */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="font-bold text-gray-900 dark:text-white text-lg">Payroll Master List</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                                            <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase">Employee</th>
                                            <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase">Department</th>
                                            <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase">Earnings</th>
                                            <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase">Deductions</th>
                                            <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase">Net Pay</th>
                                            <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                                        <PayrollRow name="Amit Sharma" id="MCD-2023-89" dept="Sanitation" earnings="₹24,500" deductions="-₹2,100" net="₹22,400" status="Processed" statusColor="bg-green-100 text-green-800" />
                                        <PayrollRow name="Sunita Verma" id="MCD-2023-44" dept="Civil Works" earnings="₹32,000" deductions="-₹3,200" net="₹28,800" status="Pending" statusColor="bg-yellow-100 text-yellow-800" />
                                        <PayrollRow name="Rahul Singh" id="MCD-2023-12" dept="Administration" earnings="₹45,000" deductions="-₹4,500" net="₹40,500" status="Processed" statusColor="bg-green-100 text-green-800" />
                                        <PayrollRow name="Priya Gupta" id="MCD-2023-55" dept="Sanitation" earnings="₹22,000" deductions="-₹1,800" net="₹20,200" status="Hold" statusColor="bg-red-100 text-red-800" />
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
};

const PayrollRow = ({ name, id, dept, earnings, deductions, net, status, statusColor }: any) => (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
        <td className="py-4 px-5">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">{name.charAt(0)}</div>
                <div>
                    <span className="font-medium text-gray-900 dark:text-white">{name}</span>
                    <p className="text-xs text-gray-500">ID: {id}</p>
                </div>
            </div>
        </td>
        <td className="py-4 px-5 text-gray-500">{dept}</td>
        <td className="py-4 px-5 text-gray-900 dark:text-white font-medium">{earnings}</td>
        <td className="py-4 px-5 text-red-600">{deductions}</td>
        <td className="py-4 px-5 font-bold text-gray-900 dark:text-white">{net}</td>
        <td className="py-4 px-5">
            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>{status}</span>
        </td>
    </tr>
);

export default Payroll;
