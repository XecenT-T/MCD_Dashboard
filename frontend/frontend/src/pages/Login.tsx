import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const Login = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const { login, error, clearError } = useAuth();
    const { t, language, setLanguage } = useLanguage();
    const navigate = useNavigate();

    // Force English on Login page load
    useEffect(() => {
        setLanguage('en');
    }, [setLanguage]);

    const { username, password } = formData;



    const onChangeSpecific = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        setFormData({ ...formData, [field]: e.target.value });
        if (error) clearError();
    }

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const user = await login({ username, password }); // login now returns user
            if (user && user.username === 'admin') {
                navigate('/admin/create-user');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            console.error(err);
        }
    };



    return (
        <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-gray-100 font-display min-h-screen flex flex-col">
            {/* Top Navigation (Minimal) */}
            <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e7ebf3] dark:border-border-dark px-6 py-3 bg-surface-light dark:bg-surface-dark shadow-sm">
                <Link to="/" className="flex items-center gap-3 text-text-main dark:text-white hover:opacity-80 transition-opacity">
                    <div className="size-8 flex items-center justify-center text-primary rounded-lg bg-primary/10">
                        <span className="material-symbols-outlined text-2xl">account_balance</span>
                    </div>
                    <h2 className="text-text-main dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">MCD User Portal</h2>
                </Link>
                <div className="flex items-center gap-6">
                    <a className="text-text-main dark:text-gray-300 text-sm font-medium leading-normal hover:text-primary transition-colors flex items-center gap-1" href="#">
                        <span className="material-symbols-outlined text-[18px]">help</span>
                        <span>Help / Support</span>
                    </a>
                    <div className="hidden sm:flex items-center gap-2 text-sm font-medium">
                        <button
                            onClick={() => setLanguage('en')}
                            className={`${language === 'en' ? 'text-primary font-bold' : 'text-text-main dark:text-gray-300 hover:text-primary'} transition-colors`}
                        >
                            English
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                            onClick={() => setLanguage('hi')}
                            className={`${language === 'hi' ? 'text-primary font-bold' : 'text-text-main dark:text-gray-300 hover:text-primary'} transition-colors`}
                        >
                            Hindi
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Split Layout */}
            <main className="flex flex-1 flex-col md:flex-row h-full">
                {/* Left Panel: Hero / Visual */}
                <div className="relative hidden md:flex w-full md:w-5/12 lg:w-1/2 flex-col justify-between p-12 overflow-hidden bg-primary text-white">
                    {/* Background Image with Overlay */}
                    <div className="absolute inset-0 z-0">
                        <div className="absolute inset-0 bg-primary/85 z-10 mix-blend-multiply"></div>
                        <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-transparent to-transparent z-10"></div>
                        <div className="h-full w-full bg-cover bg-center" data-alt="Modern government office building facade reflecting blue sky" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAM4WZCEvNoLMEgu_7gSyDRgAPmTcb0h2Wuk-Plj2RUg196H1zbbfAATxM1r8f0HViMK70VwiXbNm_jwZNGPMgnF5YN00RNVuTwcW4QqdnjM14m17DV_xCDNTQ6rxSiAna9_w0eSFid8rmSi6NGIUgLYIgnZ7U3v3VKhLCBUwBtEJEKMhdhZrp_zlLHaE-lArCVaxViowaApr9M_-MFi2L7TJdFSmQanc96D_lE-7175RVDNpoeS1dkMLtG8v9KktJcpTdPJukpROs')" }}>
                        </div>
                    </div>
                    {/* Content */}
                    <div className="relative z-20 flex flex-col h-full justify-center max-w-lg">
                        <div className="mb-8">

                            <h1 className="text-4xl lg:text-5xl font-black leading-tight tracking-tight mb-6">
                                {t('unified_sys')}
                            </h1>
                            <p className="text-lg text-blue-100 font-medium leading-relaxed mb-8">
                                {t('streamlined_access')}
                            </p>
                        </div>
                        {/* Feature List */}
                        <div className="grid gap-6">
                            <div className="flex items-start gap-4">
                                <div className="p-2 rounded-lg bg-white/10 backdrop-blur-md">
                                    <span className="material-symbols-outlined text-white">badge</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{t('employee_services_title')}</h3>
                                    <p className="text-blue-100 text-sm opacity-80">{t('employee_services_desc')}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-2 rounded-lg bg-white/10 backdrop-blur-md">
                                    <span className="material-symbols-outlined text-white">how_to_reg</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{t('attendance_tracking_title')}</h3>
                                    <p className="text-blue-100 text-sm opacity-80">{t('attendance_tracking_desc')}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-2 rounded-lg bg-white/10 backdrop-blur-md">
                                    <span className="material-symbols-outlined text-white">support_agent</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{t('grievance_redressal_title')}</h3>
                                    <p className="text-blue-100 text-sm opacity-80">{t('grievance_redressal_desc')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Footer for Left Panel */}
                    <div className="relative z-20 mt-auto pt-10">
                        <p className="text-xs text-blue-200">{t('copyright')}</p>
                    </div>
                </div>

                {/* Right Panel: Login Form */}
                <div className="w-full md:w-7/12 lg:w-1/2 bg-surface-light dark:bg-background-dark flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
                    <div className="w-full max-w-[480px] flex flex-col gap-8">
                        {/* Mobile Only Header (Visible on small screens) */}
                        <div className="md:hidden flex flex-col gap-2 mb-4">
                            <h1 className="text-3xl font-bold text-text-main dark:text-white">{t('welcome_back')}</h1>
                            <p className="text-text-muted dark:text-gray-400">{t('official_portal')}</p>
                        </div>
                        {/* Form Heading */}
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2 text-primary mb-2">
                                <span className="material-symbols-outlined">lock</span>
                                <span className="text-xs font-bold uppercase tracking-wider">{t('secure_login')}</span>
                            </div>
                            <h2 className="text-text-main dark:text-white tracking-tight text-[32px] font-bold leading-tight">{t('sign_in_title')}</h2>
                            <p className="text-text-muted dark:text-gray-400 text-sm font-normal leading-normal">
                                {t('enter_creds')}
                            </p>
                            {error && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200">
                                    {error}
                                </div>
                            )}
                        </div>
                        {/* Form Inputs */}
                        <form className="flex flex-col gap-6" onSubmit={onSubmit}>
                            {/* Username Field */}
                            <label className="flex flex-col w-full gap-2">
                                <span className="text-text-main dark:text-gray-200 text-sm font-medium leading-normal">{t('user_id')} / Username</span>
                                <div className="relative group">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary">
                                        <span className="material-symbols-outlined text-[20px]">person</span>
                                    </span>
                                    <input
                                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-text-main dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 border border-border-light dark:border-border-dark bg-background-light dark:bg-surface-dark focus:border-primary h-12 placeholder:text-text-muted pl-11 pr-4 text-base font-normal leading-normal transition-all"
                                        placeholder="e.g. MCD-83921"
                                        type="text"
                                        value={username}
                                        onChange={(e) => onChangeSpecific(e, 'username')}
                                        required
                                    />
                                </div>
                            </label>
                            {/* Password Field */}
                            <label className="flex flex-col w-full gap-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-text-main dark:text-gray-200 text-sm font-medium leading-normal">{t('password')}</span>
                                </div>
                                <div className="relative group flex items-stretch">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary z-10">
                                        <span className="material-symbols-outlined text-[20px]">key</span>
                                    </span>
                                    <input
                                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg rounded-r-none text-text-main dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 border border-border-light dark:border-border-dark bg-background-light dark:bg-surface-dark focus:border-primary h-12 placeholder:text-text-muted pl-11 pr-2 text-base font-normal leading-normal border-r-0 transition-all"
                                        placeholder="Enter your password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => onChangeSpecific(e, 'password')}
                                        required
                                    />
                                    <button aria-label="Toggle password visibility" className="flex items-center justify-center px-4 rounded-r-lg border border-l-0 border-border-light dark:border-border-dark bg-background-light dark:bg-surface-dark text-text-muted hover:text-primary transition-colors cursor-pointer" type="button">
                                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                                    </button>
                                </div>
                                <div className="flex justify-end mt-1">
                                    <a className="text-primary text-sm font-semibold hover:underline" href="#">{t('forgot_password')}</a>
                                </div>
                            </label>
                            {/* CAPTCHA Section Removed */}
                            {/* Actions */}
                            <div className="pt-2">
                                <button className="w-full flex items-center justify-center gap-2 h-12 bg-primary hover:bg-primary-dark text-white text-base font-bold rounded-lg shadow-lg shadow-primary/30 transition-all hover:scale-[1.01] active:scale-[0.99]">
                                    <span>{t('secure_login')}</span>
                                    <span className="material-symbols-outlined text-[20px]">login</span>
                                </button>


                            </div>
                            {/* Register Link Removed - Admin Only Creation */}
                            <div className="text-center mt-4">
                                <p className="text-text-muted dark:text-gray-400 text-sm">
                                    {t('no_account')} <span className="text-gray-500">{t('contact_dept_head')}</span>
                                </p>
                            </div>
                        </form>
                        {/* Footer Links inside Form Area */}
                        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-text-muted dark:text-gray-500 mt-auto pt-6 border-t border-dashed border-border-light dark:border-border-dark">
                            <a className="hover:text-primary transition-colors" href="#">{t('privacy_policy')}</a>
                            <a className="hover:text-primary transition-colors" href="#">{t('terms_service')}</a>
                            <a className="hover:text-primary transition-colors" href="#">{t('security_guidelines')}</a>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Login;
