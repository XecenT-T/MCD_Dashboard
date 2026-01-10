import { createContext, useState, useContext, type ReactNode } from 'react';

type ViewMode = 'personal' | 'department';

interface DashboardViewContextType {
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
}

const DashboardViewContext = createContext<DashboardViewContextType | undefined>(undefined);

export const DashboardViewProvider = ({ children }: { children: ReactNode }) => {
    const [viewMode, setViewMode] = useState<ViewMode>('personal');

    return (
        <DashboardViewContext.Provider value={{ viewMode, setViewMode }}>
            {children}
        </DashboardViewContext.Provider>
    );
};

export const useDashboardView = () => {
    const context = useContext(DashboardViewContext);
    if (!context) {
        throw new Error('useDashboardView must be used within a DashboardViewProvider');
    }
    return context;
};
