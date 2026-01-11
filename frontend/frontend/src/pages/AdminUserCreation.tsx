import { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../api/axios';

const AdminUserCreation = () => {
    const { token } = useAuth();
    const { t } = useLanguage();

    const [formData, setFormData] = useState({
        name: '',
        aadharCardNo: '',
        dob: '',
        email: '',
        phoneNo: '',
        post: '',
        department: 'Education',
        role: 'worker'
    });

    const [status, setStatus] = useState({ type: '', msg: '' });
    const [createdCreds, setCreatedCreds] = useState<any>(null);

    const { name, aadharCardNo, dob, email, phoneNo, post, department, role } = formData;

    const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'role') {
            if (value === 'hr') {
                setFormData(prev => ({ ...prev, role: 'hr', department: 'HR' }));
            } else {
                setFormData(prev => ({ ...prev, role: value, department: 'Education' })); // Reset to default valid dept
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus({ type: 'loading', msg: 'Generating credentials and sending email...' });
        setCreatedCreds(null);

        try {
            const config = { headers: { 'x-auth-token': token } };

            const submissionData = { ...formData };

            const res = await api.post('/api/admin/create-user', submissionData, config);

            setStatus({ type: 'success', msg: res.data.msg });
            setCreatedCreds(res.data.credentials);
            setFormData({
                name: '', aadharCardNo: '', dob: '', email: '', phoneNo: '', post: '', department: 'Education', role: 'worker'
            });

        } catch (err: any) {
            setStatus({
                type: 'error',
                msg: err.response?.data?.msg || 'Error creating user'
            });
        }
    };

    return (
        <DashboardLayout title={t('user_management')}>
            <div className="max-w-4xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">person_add</span>
                            {t('register_employee')}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                            {t('register_desc')}
                        </p>
                    </div>

                    <div className="p-8">
                        {status.msg && (
                            <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${status.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
                                status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
                                    'bg-blue-50 text-blue-700 border border-blue-200'
                                }`}>
                                <span className="material-symbols-outlined text-xl mt-0.5">
                                    {status.type === 'error' ? 'error' : status.type === 'success' ? 'check_circle' : 'info'}
                                </span>
                                <div>
                                    <p className="font-medium">{status.msg}</p>
                                    {createdCreds && (
                                        <div className="mt-2 text-sm bg-white/50 p-2 rounded border border-green-200">
                                            <p><strong>Status:</strong> {t('email_sent')} ✅</p>
                                            <p><strong>{t('user_id')}:</strong> {createdCreds.username}</p>
                                            <p><strong>{t('password')}:</strong> {createdCreds.password}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <form onSubmit={onSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Personal Details */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">{t('personal_details')}</h3>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('full_name')}</label>
                                        <input type="text" name="name" value={name} onChange={onChange} required
                                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-primary focus:border-primary" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('dob')}</label>
                                        <input type="date" name="dob" value={dob} onChange={onChange} required
                                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-primary focus:border-primary" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('aadhar')}</label>
                                        <input type="text" name="aadharCardNo" value={aadharCardNo} onChange={onChange} required placeholder="XXXX-XXXX-XXXX"
                                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-primary focus:border-primary" />
                                    </div>
                                </div>

                                {/* Contact & Job Details */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">{t('contact_job')}</h3>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('email_address')}</label>
                                        <input type="email" name="email" value={email} onChange={onChange} required
                                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-primary focus:border-primary" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('phone_number')}</label>
                                        <input type="tel" name="phoneNo" value={phoneNo} onChange={onChange} required
                                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-primary focus:border-primary" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('designation')}</label>
                                        <input type="text" name="post" value={post} onChange={onChange} required placeholder={t('designation_placeholder')}
                                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-primary focus:border-primary" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('department')}</label>
                                            <select name="department" value={department} onChange={onChange} disabled={role === 'hr'}
                                                className={`w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-primary focus:border-primary ${role === 'hr' ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                {role === 'hr' ? (
                                                    <option value="HR">{t('hr_restricted')}</option>
                                                ) : (
                                                    <>
                                                        <option value="Education">{t('dept_education')}</option>
                                                        <option value="Health">{t('dept_health')}</option>
                                                        <option value="Engineering">{t('dept_engineering')}</option>
                                                    </>
                                                )}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('role')}</label>
                                            <select
                                                name="role"
                                                value={formData.role}
                                                onChange={onChange}
                                                className="w-full px-4 py-2 border border-border-light dark:border-border-dark rounded-lg bg-white dark:bg-surface-dark focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            >
                                                <option value="worker">{t('worker')}</option>
                                                <option value="official">{t('official')}</option>
                                                <option value="hr">{t('hr_admin')}</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button type="submit" disabled={status.type === 'loading'}
                                    className="px-6 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition-colors shadow-lg shadow-primary/25 disabled:opacity-70 flex items-center gap-2">
                                    {status.type === 'loading' ? (
                                        <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                    ) : (
                                        <span className="material-symbols-outlined">send</span>
                                    )}
                                    {t('generate_email')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminUserCreation;
