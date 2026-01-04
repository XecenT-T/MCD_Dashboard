import { createContext, useContext, useState, type ReactNode } from 'react';

type Language = 'en' | 'hi';

type Translations = {
    [key in Language]: {
        [key: string]: string;
    };
};

const translations: Translations = {
    en: {
        "dashboard_title_supervisor": "Supervisor Dashboard",
        "dashboard_title_worker": "Worker Dashboard",
        "welcome_back": "Welcome back",
        "what_happening": "Here's what's happening with your account today.",
        "reports": "Reports",
        "submit_grievance": "Submit Grievance",
        "team_attendance": "Team Attendance",
        "attendance_overview": "Attendance Overview",
        "view_report": "View Report",
        "quick_actions": "Quick Actions",
        "approve_leave": "Approve Leave",
        "transfers": "Transfers",
        "team_reports": "Team Reports",
        "announce": "Announce",
        "mark_in": "Mark In (Face)",
        "setup_face": "Setup Face ID",
        "apply_leave": "Apply Leave",
        "payslip": "Payslip",
        "form_16": "Form 16",
        "recent_transfers": "Recent Transfer Requests",
        "recent_payroll": "Recent Payroll",
        "view_all": "View All History",
        "active_grievances": "Active Grievances",
        "view_all_tickets": "View All Tickets",
        "logout": "Log Out",
        "need_help": "Need Help?",
        "contact_support": "Contact support for payroll issues.",
        "nav_dashboard": "Dashboard",
        "nav_attendance": "Attendance",
        "nav_payroll": "Payroll",
        "nav_transfers": "Transfers",
        "nav_grievances": "Grievances",
        "nav_profile": "Profile",
        "wip": "Work in Progress",
        "grievance_submitted": "Grievance submitted successfully!",
        "grievance_title": "Title",
        "grievance_desc": "Description",
        "submit": "Submit",
        "cancel": "Cancel",
        "submit_grievance_modal_title": "Submit a Grievance"
    },
    hi: {
        "dashboard_title_supervisor": "पर्यवेक्षक डैशबोर्ड",
        "dashboard_title_worker": "कर्मी डैशबोर्ड",
        "welcome_back": "वापसी पर स्वागत है",
        "what_happening": "आज आपके खाते में क्या हो रहा है, यहां देखें।",
        "reports": "रिपोर्ट्स",
        "submit_grievance": "शिकायत दर्ज करें",
        "team_attendance": "टीम उपस्थिति",
        "attendance_overview": "उपस्थिति अवलोकन",
        "view_report": "रिपोर्ट देखें",
        "quick_actions": "त्वरित कार्रवाई",
        "approve_leave": "छुट्टी मंजूर करें",
        "transfers": "स्थानांतरण",
        "team_reports": "टीम रिपोर्ट्स",
        "announce": "घोषणा करें",
        "mark_in": "हाजिरी लगाएं (चेहरा)",
        "setup_face": "फेस आईडी सेट करें",
        "apply_leave": "छुट्टी के लिए आवेदन",
        "payslip": "वेतन पर्ची",
        "form_16": "फॉर्म 16",
        "recent_transfers": "हालिया स्थानांतरण अनुरोध",
        "recent_payroll": "हालिया वेतन",
        "view_all": "सभी इतिहास देखें",
        "active_grievances": "सक्रिय शिकायतें",
        "view_all_tickets": "सभी टिकट देखें",
        "logout": "लॉग आउट",
        "need_help": "मदद चाहिए?",
        "contact_support": "पेरोल समस्याओं के लिए संपर्क करें।",
        "nav_dashboard": "डैशबोर्ड",
        "nav_attendance": "उपस्थिति",
        "nav_payroll": "वेतन",
        "nav_transfers": "स्थानांतरण",
        "nav_grievances": "शिकायतें",
        "nav_profile": "प्रोफ़ाइल",
        "wip": "कार्य प्रगति पर है",
        "grievance_submitted": "शिकायत सफलतापूर्वक दर्ज की गई!",
        "grievance_title": "शीर्षक",
        "grievance_desc": "विवरण",
        "submit": "जमा करें",
        "cancel": "रद्द करें",
        "submit_grievance_modal_title": "शिकायत दर्ज करें"
    }
};

interface LanguageContextType {
    language: Language;
    toggleLanguage: () => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguage] = useState<Language>('en');

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'en' ? 'hi' : 'en');
    };

    const t = (key: string) => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
