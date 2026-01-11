
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import mcdWorkersImage from '../assets/mcd-workers.jpg';

const LandingPage: React.FC = () => {
    const { user, logout } = useAuth();
    const { t, language, setLanguage } = useLanguage();

    return (
        <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-white min-h-screen flex flex-col overflow-x-hidden font-display">
            {/* Navbar */}
            <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-surface-light dark:bg-surface-dark shadow-sm">
                <div className="px-4 md:px-10 py-3 flex items-center justify-between mx-auto max-w-7xl">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center text-primary size-8">
                            <span className="material-symbols-outlined text-3xl">account_balance</span>
                        </div>
                        <h2 className="text-text-main dark:text-white text-lg font-bold leading-tight tracking-tight">{t('mcd_digital_portal')}</h2>
                    </div>
                    <div className="hidden md:flex items-center gap-8">
                        <nav className="flex items-center gap-6">
                            <a className="text-text-main dark:text-slate-200 text-sm font-medium hover:text-primary transition-colors" href="#">Departments</a>
                            <a className="text-text-main dark:text-slate-200 text-sm font-medium hover:text-primary transition-colors" href="#">Notifications</a>
                        </nav>
                        <div className="flex items-center gap-4">
                            {/* Language Switcher */}
                            <div className="hidden sm:flex items-center gap-2 text-sm font-medium mr-2">
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

                            {user ? (
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-semibold text-text-main dark:text-white">Welcome, {user.name}</span>
                                    <button onClick={logout} className="flex items-center justify-center rounded-lg h-10 px-6 border border-slate-200 dark:border-slate-700 text-text-main dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-sm transition-colors">
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <Link to="/login" className="flex items-center justify-center rounded-lg h-10 px-6 bg-primary hover:bg-primary-dark text-white text-sm font-bold transition-all shadow-sm">
                                    Login / Register
                                </Link>
                            )}
                        </div>
                    </div>
                    {/* Mobile Menu Icon */}
                    <button className="md:hidden text-text-main dark:text-white">
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                </div>
            </header>

            <main className="flex-grow flex flex-col items-center w-full">

                {/* Hero Section */}
                <div className="w-full max-w-7xl px-4 md:px-10 py-10 md:py-16">
                    <div className="@container">
                        <div className="flex flex-col-reverse lg:flex-row gap-10 items-center">
                            <div className="flex flex-col gap-6 lg:w-1/2 items-start text-left">
                                <div className="flex flex-col gap-4">
                                    <h1 className="text-text-main dark:text-white text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight">
                                        {t('unified_efficient_transparent')}
                                    </h1>
                                    <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
                                        {t('landing_hero_desc')}
                                    </p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                                    <Link to="/login" className="flex items-center justify-center rounded-lg h-12 px-8 bg-primary hover:bg-primary-dark text-white text-base font-bold shadow-md transition-all w-full sm:w-auto">
                                        {t('access_portal')}
                                    </Link>
                                    <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="flex items-center justify-center rounded-lg h-12 px-8 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 text-text-main dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 text-base font-bold shadow-sm transition-all w-full sm:w-auto">
                                        {t('learn_more')}
                                    </button>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mt-2">
                                    <span className="material-symbols-outlined text-[18px]">verified_user</span>
                                    <span>Powered by Secure Government Infrastructure</span>
                                </div>
                            </div>
                            <div className="w-full lg:w-1/2 h-full">
                                <div className="w-full aspect-video lg:aspect-[4/3] bg-slate-200 dark:bg-slate-800 rounded-2xl overflow-hidden shadow-xl relative group">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                                    <div
                                        className="w-full h-full bg-center bg-cover transition-transform duration-700 group-hover:scale-105"
                                        style={{
                                            backgroundImage: `url("${mcdWorkersImage}")`
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div id="features" className="w-full bg-surface-light dark:bg-surface-dark border-y border-slate-200 dark:border-slate-800">
                    <div className="max-w-7xl mx-auto px-4 md:px-10 py-16">
                        {/* Who is this for? Section */}
                        <div className="flex flex-col gap-10 mb-20">
                            <div className="flex flex-col gap-3 text-center md:text-left">
                                <h2 className="text-text-main dark:text-white text-3xl md:text-4xl font-bold tracking-tight">Who is this for?</h2>
                                <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl">Tailored experiences for every role in the Municipal Corporation.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Card 1: Employees */}
                                <div className="flex flex-col gap-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-background-light dark:bg-background-dark p-6 hover:shadow-lg hover:border-primary/50 transition-all duration-300">
                                    <div className="flex items-center gap-4">
                                        <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                            <span className="material-symbols-outlined text-2xl">badge</span>
                                        </div>
                                        <h3 className="text-text-main dark:text-white text-xl font-bold">Employees</h3>
                                    </div>
                                    <ul className="flex flex-col gap-3 mt-2">
                                        {['Attendance', 'Leave', 'Payslips', 'Grievances'].map((item, i) => (
                                            <li key={i} className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm font-medium">
                                                <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Card 2: Officials */}
                                <div className="flex flex-col gap-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-background-light dark:bg-background-dark p-6 hover:shadow-lg hover:border-primary/50 transition-all duration-300">
                                    <div className="flex items-center gap-4">
                                        <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                            <span className="material-symbols-outlined text-2xl">supervisor_account</span>
                                        </div>
                                        <h3 className="text-text-main dark:text-white text-xl font-bold">Officials</h3>
                                    </div>
                                    <ul className="flex flex-col gap-3 mt-2">
                                        {['Team attendance', 'Approvals', 'Performance inputs'].map((item, i) => (
                                            <li key={i} className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm font-medium">
                                                <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Card 3: Administrators */}
                                <div className="flex flex-col gap-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-background-light dark:bg-background-dark p-6 hover:shadow-lg hover:border-primary/50 transition-all duration-300">
                                    <div className="flex items-center gap-4">
                                        <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                            <span className="material-symbols-outlined text-2xl">admin_panel_settings</span>
                                        </div>
                                        <h3 className="text-text-main dark:text-white text-xl font-bold">Administrators</h3>
                                    </div>
                                    <ul className="flex flex-col gap-3 mt-2">
                                        {['Policy rules', 'Transfers', 'Dashboards'].map((item, i) => (
                                            <li key={i} className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm font-medium">
                                                <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-10">
                            <div className="flex flex-col gap-3 text-center md:text-left">
                                <h2 className="text-text-main dark:text-white text-3xl md:text-4xl font-bold tracking-tight">Core Services</h2>
                                <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl">Access essential modules designed to streamline your daily administrative tasks efficiently and transparently.</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* Card 1: Attendance */}
                                <div className="group flex flex-col gap-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-background-light dark:bg-background-dark p-6 hover:shadow-lg hover:border-primary/50 transition-all duration-300">
                                    <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                        <span className="material-symbols-outlined text-2xl">location_on</span>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <h3 className="text-text-main dark:text-white text-lg font-bold">Smart Attendance</h3>
                                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">Geo-fenced marking and real-time tracking for accuracy.</p>
                                    </div>
                                    <a className="mt-auto flex items-center gap-1 text-primary text-sm font-semibold group-hover:translate-x-1 transition-transform" href="#">
                                        Access Module <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                    </a>
                                </div>

                                {/* Card 2: Payroll */}
                                <div className="group flex flex-col gap-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-background-light dark:bg-background-dark p-6 hover:shadow-lg hover:border-primary/50 transition-all duration-300">
                                    <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                        <span className="material-symbols-outlined text-2xl">payments</span>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <h3 className="text-text-main dark:text-white text-lg font-bold">Seamless Payroll</h3>
                                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">View slips, form-16, and manage tax declarations instantly.</p>
                                    </div>
                                    <a className="mt-auto flex items-center gap-1 text-primary text-sm font-semibold group-hover:translate-x-1 transition-transform" href="#">
                                        Access Module <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                    </a>
                                </div>

                                {/* Card 3: Transfers */}
                                <div className="group flex flex-col gap-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-background-light dark:bg-background-dark p-6 hover:shadow-lg hover:border-primary/50 transition-all duration-300">
                                    <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                        <span className="material-symbols-outlined text-2xl">swap_horiz</span>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <h3 className="text-text-main dark:text-white text-lg font-bold">Transparent Transfers</h3>
                                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">Policy-driven transfer requests and real-time status updates.</p>
                                    </div>
                                    <a className="mt-auto flex items-center gap-1 text-primary text-sm font-semibold group-hover:translate-x-1 transition-transform" href="#">
                                        Access Module <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                    </a>
                                </div>

                                {/* Card 4: Grievance */}
                                <div className="group flex flex-col gap-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-background-light dark:bg-background-dark p-6 hover:shadow-lg hover:border-primary/50 transition-all duration-300">
                                    <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                        <span className="material-symbols-outlined text-2xl">support_agent</span>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <h3 className="text-text-main dark:text-white text-lg font-bold">Grievance Redressal</h3>
                                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">Direct channel for resolving workplace issues and tracking complaints.</p>
                                    </div>
                                    <a className="mt-auto flex items-center gap-1 text-primary text-sm font-semibold group-hover:translate-x-1 transition-transform" href="#">
                                        Access Module <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </main>

            {/* Footer */}
            <footer className="w-full bg-surface-light dark:bg-surface-dark border-t border-slate-200 dark:border-slate-800 mt-auto">
                <div className="max-w-7xl mx-auto px-4 md:px-10 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                        <div className="col-span-1 md:col-span-2 flex flex-col gap-4">
                            <div className="flex items-center gap-2 text-primary">
                                <span className="material-symbols-outlined text-3xl">account_balance</span>
                                <span className="text-text-main dark:text-white font-bold text-xl">MCD Digital Portal</span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 text-sm max-w-sm">
                                Building a transparent and efficient ecosystem for the Municipal Corporation Department workforce.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <h4 className="text-text-main dark:text-white font-bold mb-1">Quick Links</h4>
                            <a className="text-slate-600 dark:text-slate-400 hover:text-primary text-sm" href="#">About Us</a>
                            <a className="text-slate-600 dark:text-slate-400 hover:text-primary text-sm" href="#">Help Desk</a>
                            <a className="text-slate-600 dark:text-slate-400 hover:text-primary text-sm" href="#">User Manuals</a>
                            <a className="text-slate-600 dark:text-slate-400 hover:text-primary text-sm" href="#">Contact Support</a>
                        </div>
                        <div className="flex flex-col gap-3">
                            <h4 className="text-text-main dark:text-white font-bold mb-1">Legal</h4>
                            <a className="text-slate-600 dark:text-slate-400 hover:text-primary text-sm" href="#">Privacy Policy</a>
                            <a className="text-slate-600 dark:text-slate-400 hover:text-primary text-sm" href="#">Terms of Service</a>
                            <a className="text-slate-600 dark:text-slate-400 hover:text-primary text-sm" href="#">Accessibility Statement</a>
                        </div>
                    </div>
                    <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-slate-500 dark:text-slate-500 text-sm text-center md:text-left">
                            © 2026 Municipal Corporation Department. All rights reserved.
                        </p>
                        <div className="flex gap-4">
                            <a className="text-slate-400 hover:text-primary" href="#"><span className="material-symbols-outlined">public</span></a>
                            <a className="text-slate-400 hover:text-primary" href="#"><span className="material-symbols-outlined">mail</span></a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
