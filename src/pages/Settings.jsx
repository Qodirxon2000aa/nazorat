import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Lock, Moon, Sun, Save, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const SettingsPage = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [name, setName] = useState(user?.name || '');
  const [surname, setSurname] = useState(user?.surname || '');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [savedMsg, setSavedMsg] = useState('');

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setSavedMsg("Profil ma'lumotlari saqlandi!");
    setTimeout(() => setSavedMsg(''), 3000);
  };

  const handleSavePassword = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Yangi parollar mos kelmadi!');
      return;
    }
    setSavedMsg("Parol muvaffaqiyatli o'zgartirildi!");
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-7 h-7 sm:w-8 sm:h-8 text-blue-700 dark:text-blue-400" />
          <span>Tizim va Profil Sozlamalari</span>
        </h1>
        <p className="text-xs text-slate-700 dark:text-slate-300 font-bold mt-1">
          Shaxsiy profil, parol va interfeys ko'rinishlarini sozlash
        </p>
      </div>

      {savedMsg && (
        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-400 text-xs font-bold shadow-sm">
          {savedMsg}
        </div>
      )}

      <div className="space-y-6">
        {/* Profile Card */}
        <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-5 h-5 text-blue-700 dark:text-blue-400" />
            <span>Shaxsiy Ma'lumotlar</span>
          </h3>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Ism
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500/50 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Familiya
                </label>
                <input
                  type="text"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500/50 text-slate-900 dark:text-white"
                />
              </div>
            </div>



            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-extrabold text-black bg-blue-500 hover:bg-blue-400 rounded-xl shadow-lg shadow-blue-500/20 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>O'zgarishlarni Saqlash</span>
              </button>
            </div>
          </form>

          <hr className="border-slate-200 dark:border-slate-800" />

          {/* Change Password */}
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-700 dark:text-blue-400" />
            <span>Parolni O'zgartirish</span>
          </h3>

          <form onSubmit={handleSavePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Joriy Parol
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500/50 text-slate-900 dark:text-white placeholder-slate-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Yangi Parol
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500/50 text-slate-900 dark:text-white placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Yangi Parolni Takrorlang
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500/50 text-slate-900 dark:text-white placeholder-slate-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-extrabold text-black bg-blue-500 hover:bg-blue-400 rounded-xl shadow-lg shadow-blue-500/20 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>Parolni Yangilash</span>
              </button>
            </div>
          </form>
        </div>

        {/* System & Theme Preferences */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Mavzu Rejimi</span>
            </h3>

            <button
              onClick={toggleTheme}
              className="w-full p-3 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white flex items-center justify-between transition-all border border-slate-200 dark:border-slate-700 cursor-pointer group"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2 bg-white dark:bg-[#0f172a] rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 group-hover:scale-105 transition-transform shrink-0">
                  {theme === 'dark' ? <Moon className="w-4 h-4 text-blue-700 dark:text-blue-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
                </div>
                <div className="text-left truncate">
                  <div className="text-xs font-extrabold truncate">{theme === 'dark' ? 'Qorong\'u Rejim' : 'Yorug\' Rejim'}</div>
                  <div className="text-[10px] text-slate-600 dark:text-slate-400 font-bold mt-0.5 truncate">Tizim ko'rinishi</div>
                </div>
              </div>
            </button>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-blue-950/20 border border-blue-500/20 space-y-3">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold text-xs">
              <ShieldAlert className="w-4 h-4" />
              <span>Tizim Ma'lumotlari</span>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
              <div className="flex justify-between items-center">
                <span>Vazifangiz:</span>
                <strong className="text-slate-900 dark:text-white">{user?.role}</strong>
              </div>
              <div className="flex justify-between items-center">
                <span>Biriktirilgan filial:</span>
                <strong className="text-slate-900 dark:text-white">{user?.branchName || "Barcha filiallar"}</strong>
              </div>
              <div className="flex justify-between items-center">
                <span>Tizim versiyasi:</span>
                <strong className="text-slate-900 dark:text-white">v2.4.0 Production</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
