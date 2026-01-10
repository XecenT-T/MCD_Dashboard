import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const { login, error, clearError, loginAsHR } = useAuth();
    const navigate = useNavigate();
    const { username, password } = formData;



    const onChangeSpecific = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        setFormData({ ...formData, [field]: e.target.value });
        if (error) clearError();
    }

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login({ username, password });
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
        }
    };

    const handleDevLogin = async () => {
        if (loginAsHR) {
            await loginAsHR();
            navigate('/hr-dashboard');
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
                        <a className="text-primary" href="#">English</a>
                        <span className="text-gray-300">|</span>
                        <a className="text-text-main dark:text-gray-300 hover:text-primary transition-colors" href="#">Hindi</a>
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
                            <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm border border-white/30 mb-6">
                                Official Portal v2.0
                            </span>
                            <h1 className="text-4xl lg:text-5xl font-black leading-tight tracking-tight mb-6">
                                Unified Management System
                            </h1>
                            <p className="text-lg text-blue-100 font-medium leading-relaxed mb-8">
                                Streamlined access for all Municipal Corporation users. Manage attendance, payroll, transfers, and grievances in one secure location.
                            </p>
                        </div>
                        {/* Feature List */}
                        <div className="grid gap-6">
                            <div className="flex items-start gap-4">
                                <div className="p-2 rounded-lg bg-white/10 backdrop-blur-md">
                                    <span className="material-symbols-outlined text-white">badge</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Employee Services</h3>
                                    <p className="text-blue-100 text-sm opacity-80">Access payroll slips and leave records instantly.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-2 rounded-lg bg-white/10 backdrop-blur-md">
                                    <span className="material-symbols-outlined text-white">how_to_reg</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Attendance Tracking</h3>
                                    <p className="text-blue-100 text-sm opacity-80">Real-time biometric and geo-tagged attendance logs.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-2 rounded-lg bg-white/10 backdrop-blur-md">
                                    <span className="material-symbols-outlined text-white">support_agent</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Grievance Redressal</h3>
                                    <p className="text-blue-100 text-sm opacity-80">Direct channel for internal complaints and resolution.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Footer for Left Panel */}
                    <div className="relative z-20 mt-auto pt-10">
                        <p className="text-xs text-blue-200">© 2026 Municipal Corporation. All rights reserved.</p>
                    </div>
                </div>

                {/* Right Panel: Login Form */}
                <div className="w-full md:w-7/12 lg:w-1/2 bg-surface-light dark:bg-background-dark flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
                    <div className="w-full max-w-[480px] flex flex-col gap-8">
                        {/* Mobile Only Header (Visible on small screens) */}
                        <div className="md:hidden flex flex-col gap-2 mb-4">
                            <h1 className="text-3xl font-bold text-text-main dark:text-white">Welcome Back</h1>
                            <p className="text-text-muted dark:text-gray-400">Unified MCD Official Portal</p>
                        </div>
                        {/* Form Heading */}
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2 text-primary mb-2">
                                <span className="material-symbols-outlined">lock</span>
                                <span className="text-xs font-bold uppercase tracking-wider">Secure Login</span>
                            </div>
                            <h2 className="text-text-main dark:text-white tracking-tight text-[32px] font-bold leading-tight">Sign in to your account</h2>
                            <p className="text-text-muted dark:text-gray-400 text-sm font-normal leading-normal">
                                Please enter your credentials to access the dashboard.
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
                                <span className="text-text-main dark:text-gray-200 text-sm font-medium leading-normal">User ID / Username</span>
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
                                    <span className="text-text-main dark:text-gray-200 text-sm font-medium leading-normal">Password</span>
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
                                    <a className="text-primary text-sm font-semibold hover:underline" href="#">Forgot Password?</a>
                                </div>
                            </label>
                            {/* CAPTCHA Section */}
                            <div className="flex flex-col gap-2">
                                <span className="text-text-main dark:text-gray-200 text-sm font-medium leading-normal">Security Check</span>
                                <div className="flex gap-3 flex-wrap sm:flex-nowrap">
                                    {/* Visual Captcha Placeholder */}
                                    <div className="h-12 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center select-none overflow-hidden relative border border-border-light dark:border-border-dark" title="CAPTCHA Image">
                                        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 opacity-50"></div>
                                        <span className="text-xl font-mono font-bold tracking-[0.2em] text-gray-500 dark:text-gray-400 italic z-10" style={{ textDecoration: 'line-through' }}>X7K9m</span>
                                    </div>
                                    {/* Refresh Button */}
                                    <button className="h-12 w-12 flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary/5 rounded-lg border border-border-light dark:border-border-dark transition-colors" title="Refresh CAPTCHA" type="button">
                                        <span className="material-symbols-outlined">refresh</span>
                                    </button>
                                    {/* Input */}
                                    <input className="form-input flex-1 h-12 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-surface-dark focus:border-primary focus:ring-2 focus:ring-primary/20 px-4 text-base placeholder:text-text-muted" placeholder="Enter code" type="text" />
                                </div>
                            </div>
                            {/* Actions */}
                            <div className="pt-2">
                                <button className="w-full flex items-center justify-center gap-2 h-12 bg-primary hover:bg-primary-dark text-white text-base font-bold rounded-lg shadow-lg shadow-primary/30 transition-all hover:scale-[1.01] active:scale-[0.99]">
                                    <span>Secure Login</span>
                                    <span className="material-symbols-outlined text-[20px]">login</span>
                                </button>

                                {/* Dev Mode Login */}
                                <div className="mt-4 relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-surface-light dark:bg-background-dark text-gray-500">Developer Access</span>
                                    </div>
                                </div>

                                <button type="button" onClick={handleDevLogin} className="w-full mt-4 flex items-center justify-center gap-2 h-10 border-2 border-dashed border-indigo-300 dark:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-sm font-bold rounded-lg transition-colors">
                                    <span>Demo Login (HR Admin)</span>
                                    <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                                </button>
                            </div>
                            {/* Register Link */}
                            <div className="text-center mt-4">
                                <p className="text-text-muted dark:text-gray-400 text-sm">
                                    New User?
                                    <Link className="text-primary font-bold hover:underline ml-1" to="/register">Register New Account</Link>
                                </p>
                            </div>
                        </form>
                        {/* Footer Links inside Form Area */}
                        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-text-muted dark:text-gray-500 mt-auto pt-6 border-t border-dashed border-border-light dark:border-border-dark">
                            <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
                            <a className="hover:text-primary transition-colors" href="#">Terms of Service</a>
                            <a className="hover:text-primary transition-colors" href="#">Security Guidelines</a>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Login;
