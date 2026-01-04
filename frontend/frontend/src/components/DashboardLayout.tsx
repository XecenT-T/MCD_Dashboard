import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const DashboardLayout = ({ children, title }: { children: React.ReactNode, title?: string }) => {
    const { user, logout } = useAuth();
    const { t, language, toggleLanguage } = useLanguage();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const isOfficial = user?.role === 'official';

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleWIP = (feature: string) => {
        alert(`${feature} ${t('wip')}!`);
    };

    return (
        <div className="flex h-screen bg-gray-50 font-display text-text-main dark:text-gray-100 dark:bg-background-dark overflow-hidden">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-surface-dark border-r border-gray-200 dark:border-border-dark transform transition-transform duration-300 md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    <div className="flex items-center gap-3 px-6 h-16 border-b border-gray-100 dark:border-border-dark">
                        <div className="size-8 flex items-center justify-center text-primary bg-primary/10 rounded-lg">
                            <span className="material-symbols-outlined">account_balance</span>
                        </div>
                        <div>
                            <h1 className="font-bold text-lg leading-tight text-primary">MCD Portal</h1>
                            <p className="text-xs text-text-muted">Official Worker Portal</p>
                        </div>
                    </div>

                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        <NavItem icon="dashboard" label={t('nav_dashboard')} onClick={() => navigate('/dashboard')} active={window.location.pathname === '/dashboard'} />
                        <NavItem icon="calendar_month" label={t('nav_attendance')} onClick={() => navigate('/attendance')} active={window.location.pathname === '/attendance'} />
                        <NavItem icon="payments" label={t('nav_payroll')} onClick={() => navigate('/payroll')} active={window.location.pathname === '/payroll'} />
                        <NavItem icon="swap_horiz" label={t('nav_transfers')} onClick={() => handleWIP('Transfers')} />
                        <NavItem icon="report" label={t('nav_grievances')} onClick={() => handleWIP('Grievances')} />
                        <NavItem icon="person" label={t('nav_profile')} onClick={() => handleWIP('Profile')} />
                    </nav>

                    <div className="p-4 border-t border-gray-100 dark:border-border-dark">
                        <div className="bg-blue-50 dark:bg-primary/10 rounded-xl p-4 mb-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-100 dark:bg-primary/20 text-blue-600 dark:text-primary rounded-lg">
                                    <span className="material-symbols-outlined text-xl">support_agent</span>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white">{t('need_help')}</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('contact_support')}</p>
                                </div>
                            </div>
                        </div>
                        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg w-full transition-colors cursor-pointer">
                            <span className="material-symbols-outlined text-[20px]">logout</span>
                            {t('logout')}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile sidebar */}
            {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)}></div>}

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <header className="h-16 bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-border-dark flex items-center justify-between px-4 sm:px-8 shrink-0">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg" onClick={() => setSidebarOpen(true)}>
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white hidden sm:block">
                            {title || (isOfficial ? t('dashboard_title_official') : t('dashboard_title_worker'))}
                        </h2>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-6 flex-1 justify-end max-w-2xl">
                        {/* Language Toggle */}
                        <button
                            onClick={toggleLanguage}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-border-dark hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            <span className="material-symbols-outlined text-gray-500 text-[20px]">translate</span>
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase">{language}</span>
                        </button>

                        <div className="hidden md:flex items-center flex-1 max-w-md bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
                            <span className="material-symbols-outlined text-gray-400 text-[20px]">search</span>
                            <input
                                type="text"
                                placeholder="Search..."
                                className="bg-transparent border-none focus:outline-none text-sm ml-2 w-full text-gray-700 dark:text-gray-200 placeholder:text-gray-400"
                            />
                        </div>

                        <div className="flex items-center gap-3 pl-2 sm:pl-6 border-l border-gray-200 dark:border-border-dark">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">{user?.name || 'User'}</p>
                                <p className="text-xs text-text-muted mt-1 capitalize">{user?.role || 'Role'}</p>
                            </div>
                            <div className="size-10 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-md shadow-primary/20">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

const NavItem = ({ icon, label, active = false, onClick }: { icon: string, label: string, active?: boolean, onClick?: () => void }) => (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${active ? 'bg-primary text-white font-bold shadow-md shadow-primary/30' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium'}`}>
        <span className="material-symbols-outlined text-[22px]">{icon}</span>
        <span className="text-sm">{label}</span>
    </button>
);

export default DashboardLayout;
