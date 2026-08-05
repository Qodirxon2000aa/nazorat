import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Branches } from './pages/Branches';
import { Employees } from './pages/Employees';
import { DailyRatingPage } from './pages/DailyRating';
import { Statistics } from './pages/Statistics';
import { Reports } from './pages/Reports';
import { ActivityLogPage } from './pages/ActivityLog';
import { SettingsPage } from './pages/Settings';
import { initSSE } from './services/sse';

const ProtectedLayout = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [globalQuery, setGlobalQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Tizim ma'lumotlari yuklanmoqda...
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          globalQuery={globalQuery}
          setGlobalQuery={setGlobalQuery}
          onToggleMobileSidebar={() => setMobileOpen(!mobileOpen)}
        />
        <main className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<Dashboard globalQuery={globalQuery} />} />
            <Route path="/branches" element={<Branches globalQuery={globalQuery} />} />
            <Route path="/employees" element={<Employees globalQuery={globalQuery} />} />
            <Route path="/daily-rating" element={<DailyRatingPage />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/activity-log" element={<ActivityLogPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  useEffect(() => {
    initSSE();
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={<ProtectedLayout />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
