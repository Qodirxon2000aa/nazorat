import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Lock, Moon, Sun, Save, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const SettingsPage = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [name, setName] = useState(user?.name || '');
  const [surname, setSurname] = useState(user?.surname || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');

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
        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-400" />
          <span>Tizim va Profil Sozlamalari</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Shaxsiy profil, parol va interfeys ko'rinishlarini sozlash
        </p>
      </div>

      {savedMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold shadow-sm">
          {savedMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-2 p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#121214] border border-white/5 shadow-xl space-y-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-400" />
            <span>Shaxsiy Ma'lumotlar</span>
          </h3>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Ism
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-emerald-500/50 text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Familiya
                </label>
                <input
                  type="text"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-emerald-500/50 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-emerald-500/50 text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Telefon
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-emerald-500/50 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-extrabold text-black bg-emerald-500 hover:bg-emerald-400 rounded-xl shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>O'zgarishlarni Saqlash</span>
              </button>
            </div>
          </form>

          <hr className="border-white/5" />

          {/* Change Password */}
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-400" />
            <span>Parolni O'zgartirish</span>
          </h3>

          <form onSubmit={handleSavePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Joriy Parol
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-xs bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-emerald-500/50 text-white placeholder-slate-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Yangi Parol
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 text-xs bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-emerald-500/50 text-white placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Yangi Parolni Takrorlang
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 text-xs bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-emerald-500/50 text-white placeholder-slate-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-extrabold text-black bg-emerald-500 hover:bg-emerald-400 rounded-xl shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>Parolni Yangilash</span>
              </button>
            </div>
          </form>
        </div>

        {/* System & Theme Preferences */}
        <div className="space-y-6">
          <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#121214] border border-white/5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Mavzu Rejimi</span>
            </h3>
            <p className="text-xs text-slate-400">
              Qorong'u (Dark) yoki Yorug' (Light) dizayn rejimiga o'tish:
            </p>

            <button
              onClick={toggleTheme}
              className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 font-bold text-xs text-white flex items-center justify-between transition-colors border border-white/10 cursor-pointer"
            >
              <span className="flex items-center gap-2">
                {theme === 'dark' ? <Moon className="w-4 h-4 text-emerald-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
                {theme === 'dark' ? 'Qorong\'u (Dark Mode)' : 'Yorug\' (Light Mode)'}
              </span>
              <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-extrabold">
                Almashtirish
              </span>
            </button>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-emerald-950/20 border border-emerald-500/20 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <ShieldAlert className="w-4 h-4" />
              <span>Tizim Ma'lumotlari</span>
            </div>
            <div className="text-xs text-slate-300 space-y-1">
              <div>Vazifangiz: <strong className="text-white">{user?.role}</strong></div>
              <div>Biriktirilgan filial: <strong className="text-white">{user?.branchName || "Barcha filiallar"}</strong></div>
              <div>Tizim versiyasi: <strong className="text-white">v2.4.0 Production</strong></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
