import api from './axios';

export interface Payroll {
    _id: string;
    user: string | any; // Expanded user object when populated
    month: string;
    earnings: {
        basic: string;
        hra: string;
        conveyance: string;
        medical: string;
        special: string;
        total: string;
    };
    deductions: {
        pf: string;
        esi: string;
        tax: string;
        total: string;
    };
    netPay: string;
    status: 'Processed' | 'Pending' | 'Hold';
    paidOn?: string;
    accountNo?: string;
    createdAt: string;
}

export const createPayroll = async (payrollData: any) => {
    const res = await api.post('/api/payroll/create', payrollData);
    return res.data;
};

export const updatePayroll = async (id: string, payrollData: any) => {
    const res = await api.put(`/api/payroll/update/${id}`, payrollData);
    return res.data;
};

export const getPayrollByUser = async (userId: string) => {
    const res = await api.get(`/api/payroll/user/${userId}`);
    return res.data;
};

export const getAllPayrolls = async () => {
    const res = await api.get('/api/payroll/history');
    return res.data;
};

export const getUsersForPayroll = async () => {
    const res = await api.get('/api/payroll/users');
    return res.data;
};

export const downloadPayslip = (payrollId: string) => {
    // Open in new window or directly download
    const token = localStorage.getItem('token');
    window.open(`${api.defaults.baseURL}/api/payroll/slip/${payrollId}/pdf?x-auth-token=${token}`, '_blank');
};
