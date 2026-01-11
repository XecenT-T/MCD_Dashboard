import React, { useState } from 'react';
import ProfileModal from './ProfileModal';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useDashboardView } from '../context/DashboardViewContext';

const DashboardLayout = ({ children, title, forceCollapsed = false }: { children: React.ReactNode, title?: string, forceCollapsed?: boolean }) => {
    const { user, logout } = useAuth();
    const { t, language, setLanguage } = useLanguage();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const isOfficial = user?.role === 'official';

    // HR Detection
    const department = (user?.department || '').toLowerCase();
    const isHR = (isOfficial && ['general', 'administration', 'hr'].includes(department)) || user?.role === 'hr';

    const { viewMode } = useDashboardView();

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
            <aside className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-surface-dark border-r border-gray-200 dark:border-border-dark transform transition-all duration-300 ease-in-out md:relative 
                ${forceCollapsed ? 'w-0 -translate-x-full opacity-0 overflow-hidden' : 'w-64 opacity-100'} 
                ${!forceCollapsed && sidebarOpen ? 'translate-x-0' : ''} 
                ${!forceCollapsed && !sidebarOpen ? '-translate-x-full md:translate-x-0' : ''}
            `}>
                <div className="flex flex-col h-full">
                    <div className="flex items-center gap-3 px-6 h-16 border-b border-gray-100 dark:border-border-dark">
                        <div className="size-8 flex items-center justify-center text-primary bg-primary/10 rounded-lg">
                            <span className="material-symbols-outlined">account_balance</span>
                        </div>
                        <div>
                            <h1 className="font-bold text-lg leading-tight text-primary">MCD Portal</h1>
                            <p className="text-xs text-text-muted">MCD Official Portal</p>
                        </div>
                    </div>

                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        <NavItem
                            icon="dashboard"
                            label={t('nav_dashboard')}
                            onClick={() => navigate(isHR ? '/hr-dashboard' : '/dashboard')}
                            active={window.location.pathname === '/dashboard' || window.location.pathname === '/hr-dashboard'}
                        />

                        {viewMode === 'personal' && !isHR && (
                            <>
                                <NavItem icon="calendar_month" label={t('nav_attendance')} onClick={() => navigate('/attendance')} active={window.location.pathname === '/attendance'} />
                                <NavItem icon="payments" label={t('nav_payroll')} onClick={() => navigate('/payroll')} active={window.location.pathname === '/payroll'} />

                                <NavDropdown icon="description" label="Service Request">
                                    <NavItem icon="badge" label="ID Card Generator" onClick={() => handleWIP('ID Card Generator')} />
                                    <NavItem icon="folder_shared" label="Dept. Document" onClick={() => navigate('/department-documents')} />
                                </NavDropdown>


                                <NavItem icon="report" label={t('nav_grievances')} onClick={() => navigate('/grievances')} active={window.location.pathname === '/grievances'} />
                                <NavItem icon="person" label={t('nav_profile')} onClick={() => setShowProfileModal(true)} />
                            </>
                        )}

                        {viewMode === 'department' && user?.role === 'official' && (
                            <div className="px-4 py-4 mt-4 bg-blue-50 dark:bg-primary/10 rounded-xl border border-blue-100 dark:border-primary/20">
                                <p className="text-xs font-bold text-blue-600 dark:text-primary uppercase tracking-wider mb-2">Management Mode</p>
                                <NavItem icon="swap_horiz" label={t('nav_transfers')} onClick={() => handleWIP('Transfers')} />
                                <NavItem icon="map" label="Live Location" onClick={() => navigate('/heatmap')} active={window.location.pathname === '/heatmap'} />
                                <NavItem icon="report" label="Dept. Grievances" onClick={() => navigate('/department-grievances')} active={window.location.pathname === '/department-grievances'} />
                                <NavItem icon="description" label="Dept. Leaves" onClick={() => navigate('/hr-dashboard?tab=leaves')} active={window.location.search.includes('tab=leaves')} />
                            </div>
                        )}

                        {isHR && (
                            <>
                                <div className="px-4 mt-6 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    Administration
                                </div>
                                <NavItem icon="grid_view" label="Overview" onClick={() => navigate('/hr-dashboard')} active={window.location.pathname === '/hr-dashboard'} />

                                <NavItem icon="payments" label="Payroll" onClick={() => navigate('/payroll')} active={window.location.pathname === '/payroll'} />
                                <NavItem icon="inbox" label="Requests" onClick={() => handleWIP('Requests')} />
                                <NavItem icon="report" label="Grievances" onClick={() => navigate('/grievances')} active={window.location.pathname === '/grievances'} />
                            </>
                        )}
                    </nav>

                    <div className="p-4 border-t border-gray-100 dark:border-border-dark">
                        <div className="bg-blue-50 dark:bg-primary/10 rounded-xl p-4 mb-4">
                            <div className="flex items-start gap-3">
                                <button onClick={() => navigate('/help')} className="text-left flex items-start gap-3 w-full">
                                    <div className="p-2 bg-blue-100 dark:bg-primary/20 text-blue-600 dark:text-primary rounded-lg">
                                        <span className="material-symbols-outlined text-xl">support_agent</span>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm text-gray-900 dark:text-white">{t('need_help')}</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('contact_support')}</p>
                                    </div>
                                </button>
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
                        {/* Language Toggle (Simple Cycle for now or Modal later) */}
                        <button
                            onClick={() => {
                                // Simple cycle for demo purposes or redirect to settings
                                const langs: any[] = ['en', 'hi', 'pa', 'mr', 'ta', 'te', 'bn'];
                                const currentIndex = langs.indexOf(language);
                                const nextIndex = (currentIndex + 1) % langs.length;
                                setLanguage(langs[nextIndex]);
                            }}
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
                            <button
                                onClick={() => setShowProfileModal(true)}
                                className="size-10 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-md shadow-primary/20 hover:shadow-lg hover:scale-105 transition-all overflow-hidden"
                            >
                                {user?.profileImage ? (
                                    <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    user?.name?.charAt(0).toUpperCase() || 'U'
                                )}
                            </button>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-8">
                    {children}
                </main>
                {showProfileModal && <ProfileModal onClose={() => setShowProfileModal(false)} />}
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

const NavDropdown = ({ icon, label, children }: { icon: string, label: string, children: React.ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="space-y-1">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between px-3 py-3 rounded-lg transition-colors text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium`}
            >
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[22px]">{icon}</span>
                    <span className="text-sm">{label}</span>
                </div>
                <span className={`material-symbols-outlined text-[20px] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                    expand_more
                </span>
            </button>
            {isOpen && (
                <div className="pl-4 space-y-1 animate-in slide-in-from-top-2 fade-in duration-200">
                    {children}
                </div>
            )}
        </div>
    );
};

export default DashboardLayout;
