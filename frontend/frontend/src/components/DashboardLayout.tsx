import React, { useState } from 'react';
import ProfileModal from './ProfileModal';
import IDCardModal from './IDCardModal';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useDashboardView } from '../context/DashboardViewContext';
import { updateLanguage } from '../api/user';


const DashboardLayout = ({ children, title, forceCollapsed = false }: { children: React.ReactNode, title?: string, forceCollapsed?: boolean }) => {
    const { user, logout, reloadUser } = useAuth();
    const { t, language, setLanguage } = useLanguage();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showIDCard, setShowIDCard] = useState(false);
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
                            <h1 className="font-bold text-lg leading-tight text-primary">{t('mcd_portal')}</h1>
                            <p className="text-xs text-text-muted">{t('official_portal')}</p>
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

                                <NavDropdown icon="description" label={t('service_request')}>
                                    <NavItem icon="badge" label={t('id_card_generator')} onClick={() => navigate('/id-card-print')} active={window.location.pathname === '/id-card-print'} />
                                    <NavItem icon="folder_shared" label={t('dept_document_nav')} onClick={() => navigate('/department-documents')} />
                                </NavDropdown>


                                <NavItem icon="report" label={t('nav_grievances')} onClick={() => navigate('/grievances')} active={window.location.pathname === '/grievances'} />
                                <NavItem icon="person" label={t('nav_profile')} onClick={() => setShowProfileModal(true)} />
                            </>
                        )}

                        {viewMode === 'department' && user?.role === 'official' && (
                            <div className="px-4 py-4 mt-4 bg-blue-50 dark:bg-primary/10 rounded-xl border border-blue-100 dark:border-primary/20">
                                <p className="text-xs font-bold text-blue-600 dark:text-primary uppercase tracking-wider mb-2">{t('management_mode')}</p>
                                <NavItem icon="swap_horiz" label={t('nav_transfers')} onClick={() => navigate('/transfers')} active={window.location.pathname === '/transfers'} />
                                <NavItem icon="map" label={t('live_location')} onClick={() => navigate('/heatmap')} active={window.location.pathname === '/heatmap'} />
                                <NavItem icon="report" label={t('dept_grievances')} onClick={() => navigate('/department-grievances')} active={window.location.pathname === '/department-grievances'} />
                                <NavItem icon="description" label={t('dept_leaves')} onClick={() => navigate('/hr-dashboard?tab=leaves')} active={window.location.search.includes('tab=leaves')} />
                            </div>
                        )}

                        {isHR && (
                            <>
                                <div className="px-4 mt-6 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    {t('administration')}
                                </div>
                                <NavItem icon="grid_view" label={t('overview')} onClick={() => navigate('/hr-dashboard')} active={window.location.pathname === '/hr-dashboard'} />

                                <NavItem icon="payments" label={t('nav_payroll')} onClick={() => navigate('/payroll')} active={window.location.pathname === '/payroll'} />
                                <NavItem icon="inbox" label={t('requests')} onClick={() => handleWIP('Requests')} />
                                <NavItem icon="report" label={t('nav_grievances')} onClick={() => navigate('/grievances')} active={window.location.pathname === '/grievances'} />
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

                        {/* Language Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setSidebarOpen(false) /* reusing close logic just in case, but mainly just toggle local state needed */}
                                // Actually, we need a local state for this dropdown. 
                                // Since I can't easily add state in this Replace block without changing the whole file to add useState at the top if it wasn't there, 
                                // I will check if I can use the existing NavDropdown logic or just add a simple state.
                                // DashboardLayout already has useState imported. I'll add a new state for langMenuOpen in a separate edit if needed, 
                                // but wait, I can't add state inside the component body from here easily if I don't see the top.
                                // Let's assume I will add `const [langMenuOpen, setLangMenuOpen] = useState(false);` in the next step.
                                // For now, I'll write the JSX that uses `langMenuOpen`.
                                onMouseEnter={() => { }} // No-op, we'll use click or simple hover css
                            >
                            </button>
                        </div>
                        {/* RE-WRITING THE WHOLE DROPDOWN LOGIC PROPERLY */}
                        <LanguageSelector
                            currentLang={language}
                            onSelect={async (newLang: any) => {
                                setLanguage(newLang);
                                if (user) {
                                    try {
                                        await updateLanguage(newLang);
                                        await reloadUser();
                                    } catch (err) {
                                        console.error('Failed to persist language preference');
                                    }
                                }
                            }}
                        />



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
                {showIDCard && user && <IDCardModal user={user} onClose={() => setShowIDCard(false)} />}
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

const LanguageSelector = ({ currentLang, onSelect }: { currentLang: string, onSelect: (lang: string) => void }) => {
    const [isOpen, setIsOpen] = useState(false);

    const languages = [
        { code: 'en', label: 'English' },
        { code: 'hi', label: 'Hindi (हिंदी)' },
        { code: 'pa', label: 'Punjabi (ਪੰਜਾਬੀ)' },
        { code: 'mr', label: 'Marathi (मराठी)' },
        { code: 'ta', label: 'Tamil (தமிழ்)' },
        { code: 'te', label: 'Telugu (తెలుగు)' },
        { code: 'bn', label: 'Bengali (বাংলা)' },
    ];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-border-dark hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
                <span className="material-symbols-outlined text-gray-500 text-[20px]">translate</span>
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase">{currentLang}</span>
                <span className="material-symbols-outlined text-[16px] text-gray-400">arrow_drop_down</span>
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-surface-dark rounded-xl shadow-lg border border-gray-100 dark:border-border-dark py-2 z-20 animate-in fade-in zoom-in-95 duration-200">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => {
                                    onSelect(lang.code);
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors
                                    ${currentLang === lang.code ? 'text-primary font-bold bg-blue-50/50 dark:bg-primary/10' : 'text-gray-700 dark:text-gray-300'}
                                `}
                            >
                                <span>{lang.label}</span>
                                {currentLang === lang.code && <span className="material-symbols-outlined text-[16px]">check</span>}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};
