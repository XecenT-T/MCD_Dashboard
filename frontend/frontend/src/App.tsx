import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminUserCreation from './pages/AdminUserCreation';
import Dashboard from './pages/Dashboard';
import HRDashboard from './pages/HRDashboard';
import Attendance from './pages/Attendance';
import GrievanceSubmission from './pages/GrievanceSubmission';
import Payroll from './pages/Payroll';
import Grievances from './pages/Grievances';
import ChatPage from './pages/ChatPage';
import LandingPage from './components/LandingPage';
import Onboarding from './pages/Onboarding';
import Heatmap from './pages/Heatmap';
import DepartmentDocuments from './pages/DepartmentDocuments';
import DepartmentWorkers from './pages/DepartmentWorkers';
import DepartmentAttendance from './pages/DepartmentAttendance';
import WorkerAttendanceHistory from './pages/WorkerAttendanceHistory';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { DashboardViewProvider } from './context/DashboardViewContext';
import './App.css';

// Protected Route Component
const PrivateRoute = ({ children }: { children: React.ReactElement }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="h-screen w-full flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  if (!user) return <Navigate to="/login" />;

  // Force onboarding if not completed AND no face registered
  // If user has Face Registered, we consider them effectively onboarded (legacy support or partial completion)
  const isEffectiveOnboarded = user.isOnboarded || user.isFaceRegistered;

  if (!isEffectiveOnboarded && window.location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" />;
  }

  // If completed onboarding but trying to access /onboarding, redirect to dashboard
  if (isEffectiveOnboarded && window.location.pathname === '/onboarding') {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

// Language Sync Component
const LanguageSync = () => {
  const { user } = useAuth();
  const { setLanguage, language } = useLanguage();

  React.useEffect(() => {
    // Don't sync if we are on onboarding page (user is choosing language)
    if (window.location.pathname === '/onboarding') return;

    if (user?.preferredLanguage && user.preferredLanguage !== language) {
      // Sync context with user preference from DB
      // We cast because user.preferredLanguage might be just 'en' | 'hi' in old types, but context supports more.
      // It's safe if the value matches one of the known languages.
      setLanguage(user.preferredLanguage as any);
    }
  }, [user, language, setLanguage]);

  return null;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <DashboardViewProvider>
          <LanguageProvider>
            <LanguageSync />
            <div className="App">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                  path="/onboarding"
                  element={
                    <PrivateRoute>
                      <Onboarding />
                    </PrivateRoute>
                  }
                />
                {/* Register removed - Admin only */}
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/hr-dashboard"
                  element={
                    <PrivateRoute>
                      <HRDashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/attendance"
                  element={
                    <PrivateRoute>
                      <Attendance />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/grievance-submission"
                  element={
                    <PrivateRoute>
                      <GrievanceSubmission />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/grievances"
                  element={
                    <PrivateRoute>
                      <Grievances />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/payroll"
                  element={
                    <PrivateRoute>
                      <Payroll />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/department-documents"
                  element={
                    <PrivateRoute>
                      <DepartmentDocuments />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/department-workers"
                  element={
                    <PrivateRoute>
                      <DepartmentWorkers />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/department-attendance"
                  element={
                    <PrivateRoute>
                      <DepartmentAttendance />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/department-attendance/:userId"
                  element={
                    <PrivateRoute>
                      <WorkerAttendanceHistory />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/help"
                  element={
                    <PrivateRoute>
                      <ChatPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/heatmap"
                  element={
                    <PrivateRoute>
                      <Heatmap />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/admin/create-user"
                  element={
                    <PrivateRoute>
                      <AdminUserCreation />
                    </PrivateRoute>
                  }
                />
                <Route path="/" element={<LandingPage />} />
              </Routes>
            </div>
          </LanguageProvider>
        </DashboardViewProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
