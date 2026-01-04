import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        role: 'supervisor', // default role
        password: '',
        confirmPassword: ''
    });
    const { register, error, clearError } = useAuth();
    const navigate = useNavigate();
    const { name, username, role, password, confirmPassword } = formData;
    const [passwordError, setPasswordError] = useState('');

    const onChangeSpecific = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, field: string) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
        if (error) clearError();
        if (passwordError) setPasswordError('');
    }

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Register Submit:', { password, confirmPassword, formData }); // DEBUG LOG
        if (password !== confirmPassword) {
            console.log('Password mismatch detected'); // DEBUG LOG
            setPasswordError('Passwords do not match');
            return;
        }
        try {
            await register({ name, username, password, role });
            navigate('/dashboard');
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
                    <h2 className="text-text-main dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">MCD Supervisor Portal</h2>
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
                        <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAM4WZCEvNoLMEgu_7gSyDRgAPmTcb0h2Wuk-Plj2RUg196H1zbbfAATxM1r8f0HViMK70VwiXbNm_jwZNGPMgnF5YN00RNVuTwcW4QqdnjM14m17DV_xCDNTQ6rxSiAna9_w0eSFid8rmSi6NGIUgLYIgnZ7U3v3VKhLCBUwBtEJEKMhdhZrp_zlLHaE-lArCVaxViowaApr9M_-MFi2L7TJdFSmQanc96D_lE-7175RVDNpoeS1dkMLtG8v9KktJcpTdPJukpROs')" }}>
                        </div>
                    </div>
                    {/* Content */}
                    <div className="relative z-20 flex flex-col h-full justify-center max-w-lg">
                        <div className="mb-8">
                            <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm border border-white/30 mb-6">
                                Official Portal v2.0
                            </span>
                            <h1 className="text-4xl lg:text-5xl font-black leading-tight tracking-tight mb-6">
                                Join the Unified System
                            </h1>
                            <p className="text-lg text-blue-100 font-medium leading-relaxed mb-8">
                                Create your official account to access management tools, payroll, and grievance services.
                            </p>
                        </div>
                        {/* Feature List */}
                        <div className="grid gap-6">
                            <div className="flex items-start gap-4">
                                <div className="p-2 rounded-lg bg-white/10 backdrop-blur-md">
                                    <span className="material-symbols-outlined text-white">verified_user</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Secure Registration</h3>
                                    <p className="text-blue-100 text-sm opacity-80">Official verification required for all new accounts.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Footer for Left Panel */}
                    <div className="relative z-20 mt-auto pt-10">
                        <p className="text-xs text-blue-200">© 2026 Municipal Corporation. All rights reserved.</p>
                    </div>
                </div>

                {/* Right Panel: Registration Form */}
                <div className="w-full md:w-7/12 lg:w-1/2 bg-surface-light dark:bg-background-dark flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
                    <div className="w-full max-w-[480px] flex flex-col gap-8">
                        {/* Mobile Only Header */}
                        <div className="md:hidden flex flex-col gap-2 mb-4">
                            <h1 className="text-3xl font-bold text-text-main dark:text-white">Create Account</h1>
                            <p className="text-text-muted dark:text-gray-400">Join MCD Official Portal</p>
                        </div>
                        {/* Form Heading */}
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2 text-primary mb-2">
                                <span className="material-symbols-outlined">person_add</span>
                                <span className="text-xs font-bold uppercase tracking-wider">New User Registration</span>
                            </div>
                            <h2 className="text-text-main dark:text-white tracking-tight text-[32px] font-bold leading-tight">Create your account</h2>
                            <p className="text-text-muted dark:text-gray-400 text-sm font-normal leading-normal">
                                Enter your details below. All fields are required.
                            </p>
                            {(error || passwordError) && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200">
                                    {error || passwordError}
                                    <div className="text-xs mt-1 font-mono">
                                        P: "{password}" ({password.length}) <br />
                                        CP: "{confirmPassword}" ({confirmPassword.length})
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Form Inputs */}
                        <form className="flex flex-col gap-5" onSubmit={onSubmit}>
                            {/* Name Field */}
                            <label className="flex flex-col w-full gap-2" htmlFor="name">
                                <span className="text-text-main dark:text-gray-200 text-sm font-medium leading-normal">Full Name</span>
                                <div className="relative group">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary">
                                        <span className="material-symbols-outlined text-[20px]">badge</span>
                                    </span>
                                    <input
                                        id="name"
                                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-text-main dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 border border-border-light dark:border-border-dark bg-background-light dark:bg-surface-dark focus:border-primary h-12 placeholder:text-text-muted pl-11 pr-4 text-base font-normal leading-normal transition-all"
                                        placeholder="e.g. John Doe"
                                        type="text"
                                        value={name}
                                        onChange={(e) => onChangeSpecific(e, 'name')}
                                        required
                                    />
                                </div>
                            </label>

                            {/* Username/ID Field */}
                            <label className="flex flex-col w-full gap-2" htmlFor="username">
                                <span className="text-text-main dark:text-gray-200 text-sm font-medium leading-normal">Supervisor ID / Username</span>
                                <div className="relative group">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary">
                                        <span className="material-symbols-outlined text-[20px]">person</span>
                                    </span>
                                    <input
                                        id="username"
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
                            <label className="flex flex-col w-full gap-2" htmlFor="password">
                                <span className="text-text-main dark:text-gray-200 text-sm font-medium leading-normal">Password</span>
                                <div className="relative group flex items-stretch">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary z-10">
                                        <span className="material-symbols-outlined text-[20px]">key</span>
                                    </span>
                                    <input
                                        id="password"
                                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg rounded-r-none text-text-main dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 border border-border-light dark:border-border-dark bg-background-light dark:bg-surface-dark focus:border-primary h-12 placeholder:text-text-muted pl-11 pr-2 text-base font-normal leading-normal border-r-0 transition-all"
                                        placeholder="Create a password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => onChangeSpecific(e, 'password')}
                                        required
                                    />
                                    <button aria-label="Toggle password visibility" className="flex items-center justify-center px-4 rounded-r-lg border border-l-0 border-border-light dark:border-border-dark bg-background-light dark:bg-surface-dark text-text-muted hover:text-primary transition-colors cursor-pointer" type="button">
                                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                                    </button>
                                </div>
                            </label>

                            {/* Confirm Password Field */}
                            <label className="flex flex-col w-full gap-2" htmlFor="confirmPassword">
                                <span className="text-text-main dark:text-gray-200 text-sm font-medium leading-normal">Confirm Password</span>
                                <div className="relative group flex items-stretch">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary z-10">
                                        <span className="material-symbols-outlined text-[20px]">check_circle</span>
                                    </span>
                                    <input
                                        id="confirmPassword"
                                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg rounded-r-none text-text-main dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 border border-border-light dark:border-border-dark bg-background-light dark:bg-surface-dark focus:border-primary h-12 placeholder:text-text-muted pl-11 pr-2 text-base font-normal leading-normal border-r-0 transition-all"
                                        placeholder="Confirm your password"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => onChangeSpecific(e, 'confirmPassword')}
                                        required
                                    />
                                    <button aria-label="Toggle password visibility" className="flex items-center justify-center px-4 rounded-r-lg border border-l-0 border-border-light dark:border-border-dark bg-background-light dark:bg-surface-dark text-text-muted hover:text-primary transition-colors cursor-pointer" type="button">
                                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                                    </button>
                                </div>
                            </label>



                            {/* Role Dropdown */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text-main dark:text-slate-200" htmlFor="role">
                                    Role
                                </label>
                                <select
                                    id="role"
                                    name="role"
                                    className="flex w-full h-10 px-3 py-2 text-sm bg-background-light dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md ring-offset-background placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-text-main dark:text-white"
                                    value={role}
                                    onChange={(e) => onChangeSpecific(e, 'role')}
                                >
                                    <option value="supervisor">Supervisor</option>
                                    <option value="worker">Worker</option>
                                </select>
                            </div>

                            {/* Actions */}
                            <div className="pt-2">
                                <button className="w-full flex items-center justify-center gap-2 h-12 bg-primary hover:bg-primary-dark text-white text-base font-bold rounded-lg shadow-lg shadow-primary/30 transition-all hover:scale-[1.01] active:scale-[0.99]">
                                    <span>Register Account</span>
                                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                                </button>
                            </div>

                            {/* Login Link */}
                            <div className="text-center mt-4">
                                <p className="text-text-muted dark:text-gray-400 text-sm">
                                    Already have an account?
                                    <Link className="text-primary font-bold hover:underline ml-1" to="/login">Sign in here</Link>
                                </p>
                            </div>
                        </form>
                        {/* Footer Links */}
                        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-text-muted dark:text-gray-500 mt-auto pt-6 border-t border-dashed border-border-light dark:border-border-dark">
                            <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
                            <a className="hover:text-primary transition-colors" href="#">Terms of Service</a>
                            <a className="hover:text-primary transition-colors" href="#">Security Guidelines</a>
                        </div>
                    </div>
                </div >
            </main >
        </div >
    );
};

export default Register;
