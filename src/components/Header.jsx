import React, { useState, useEffect } from 'react';
import {
  Bell,
  Sun,
  Moon,
  Search,
  LogOut,
  Settings as SettingsIcon,
  Building2,
  ChevronDown,
  CheckCheck,
  Menu,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

export const Header = ({ globalQuery, setGlobalQuery, onToggleMobileSidebar }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const notifs = await api.getNotifications();
        setNotifications(notifs);
      } catch (e) {
        console.error(e);
      }
    };
    fetchNotifs();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const getUzbekDateString = () => {
    const d = new Date();
    const months = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];
    const days = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];
    return `${d.getDate()}-${months[d.getMonth()]} ${d.getFullYear()}-yil, ${days[d.getDay()]}`;
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 sm:h-20 px-3 sm:px-6 lg:px-8 bg-slate-50 dark:bg-[#020617]/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 transition-colors">
      {/* Mobile Hamburger & Welcome / Search */}
      <div className="flex items-center gap-2 sm:gap-4 flex-1 max-w-xl">
        <button
          onClick={onToggleMobileSidebar}
          className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white hover:bg-slate-200 dark:bg-white/10 border border-slate-200 dark:border-slate-700 transition-colors shrink-0"
          title="Menyu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden lg:block shrink-0">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight truncate">
            Xush kelibsiz, {user?.name || 'Foydalanuvchi'}!
          </h2>
          <p className="text-[11px] text-slate-700 dark:text-slate-300 font-bold">
            {getUzbekDateString()}
          </p>
        </div>

        <div className="relative flex-1 max-w-xs sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700 dark:text-slate-300 font-bold" />
          <input
            type="text"
            value={globalQuery || ''}
            onChange={(e) => setGlobalQuery && setGlobalQuery(e.target.value)}
            placeholder="Qidiruv..."
            className="w-full pl-8 sm:pl-10 pr-3 py-1.5 sm:py-2 text-xs bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-slate-700 focus:border-blue-500/50 rounded-full text-slate-100 placeholder-slate-500 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Right Action Icons */}
      <div className="flex items-center gap-3">
        {/* Branch Info Badge */}
        {user?.branchName && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-700 dark:text-blue-400">
            <Building2 className="w-3.5 h-3.5" />
            <span>{user.branchName}</span>
          </div>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-slate-800 transition-colors relative"
          title={theme === 'dark' ? "Yorug' rejim" : 'Qorong\'u rejim'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          )}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="p-2.5 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-slate-800 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-blue-400 ring-2 ring-[#020617]" />
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-white/5">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Bildirishnomalar
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-blue-700 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    O'qildi qilish
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-white/5 custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-700 font-bold">
                    Bildirishnomalar mavjud emas
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3.5 text-xs transition-colors ${
                        !n.read
                          ? 'bg-blue-500/10'
                          : 'hover:bg-slate-100 dark:bg-white/5'
                      }`}
                    >
                      <div className="font-semibold text-slate-900 dark:text-white mb-0.5">
                        {n.title}
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 font-bold leading-relaxed">
                        {n.message}
                      </p>
                      <div className="text-[10px] text-slate-700 font-bold mt-1">
                        {new Date(n.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-slate-200 dark:bg-white/10 mx-1" />

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 p-1.5 rounded-2xl hover:bg-slate-100 dark:bg-white/5 border border-transparent hover:border-slate-200 dark:border-slate-700 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 to-teal-400 text-black font-extrabold flex items-center justify-center text-xs shadow-md shadow-blue-500/20">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-slate-900 dark:text-white leading-none">
                {user?.name} {user?.surname}
              </div>
              <div className="text-[11px] font-bold text-blue-700 dark:text-blue-400 mt-0.5">
                {user?.role}
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-700 dark:text-slate-300 font-bold" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 p-2 space-y-1">
              <div className="p-3 border-b border-slate-200 dark:border-slate-700">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {user?.name} {user?.surname}
                </div>
                <div className="text-xs text-slate-700 dark:text-slate-300 font-bold">
                  {user?.email}
                </div>
              </div>

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate('/settings');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:bg-white/5 hover:text-slate-900 dark:text-white rounded-xl transition-colors"
              >
                <SettingsIcon className="w-4 h-4 text-slate-700 dark:text-slate-300 font-bold" />
                Sozlamalar
              </button>

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  logout();
                  navigate('/login');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                Chiqish (Logout)
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
