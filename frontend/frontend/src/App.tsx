import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Attendance from './pages/Attendance';
import GrievanceSubmission from './pages/GrievanceSubmission';
import Payroll from './pages/Payroll';
import ChatPage from './pages/ChatPage';
import LandingPage from './components/LandingPage';
import DepartmentDocuments from './pages/DepartmentDocuments';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { DashboardViewProvider } from './context/DashboardViewContext';
import './App.css';

// Protected Route Component
const PrivateRoute = ({ children }: { children: React.ReactElement }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <DashboardViewProvider>
          <LanguageProvider>
            <div className="App">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <Dashboard />
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
                  path="/help"
                  element={
                    <PrivateRoute>
                      <ChatPage />
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
