import React, { useState } from 'react';
import { Sparkles, Lock, User, ArrowRight, KeyRound, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Kirishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdmin = () => {
    setUsername('admin');
    setPassword('admin');
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 relative overflow-hidden font-sans">
      {/* Dynamic Background Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-10">
        {/* Header Logo */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20 mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            FILIALLAR NAZORATI
          </h1>
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 font-bold mt-1">
            Xodimlarni kunlik baholash va monitoring tizimi
          </p>
        </div>

        {/* Quick Demo Info Box */}
        <div 
          onClick={handleQuickAdmin}
          className="mb-6 p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 text-xs flex items-center justify-between cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all group"
        >
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300">Admin login/parol:</span>{' '}
              <code className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded text-blue-700 dark:text-blue-300 font-mono border border-slate-200 dark:border-slate-700">admin</code> / <code className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded text-blue-700 dark:text-blue-300 font-mono border border-slate-200 dark:border-slate-700">admin</code>
            </div>
          </div>
          <span className="text-[10px] text-blue-600 dark:text-blue-400 group-hover:underline font-bold">Kiritish</span>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
              Foydalanuvchi logini
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700 font-bold" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="masalan: admin"
                className="w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-slate-100 text-sm placeholder-slate-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
              Parol
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700 font-bold" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 bg-slate-800/80 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-slate-100 text-sm placeholder-slate-500 focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-700 font-bold hover:text-slate-600 dark:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 font-bold hover:text-slate-700 dark:text-slate-200">
              <input type="checkbox" defaultChecked className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-0" />
              Eslab qolish
            </label>
            <button
              type="button"
              onClick={() => setShowForgotModal(true)}
              className="text-blue-700 dark:text-blue-400 hover:underline font-semibold"
            >
              Parolni unutdingizmi?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 font-bold text-slate-900 dark:text-white text-sm rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2 cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Tizimga kirish</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl text-left">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-700 dark:text-blue-400">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Parolni tiklash</h3>
            </div>
            {forgotMsg ? (
              <div className="text-xs text-blue-700 dark:text-blue-400 bg-blue-500/10 p-3 rounded-xl border border-blue-500/20 mb-4">
                {forgotMsg}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-slate-700 dark:text-slate-300 font-bold">
                  Tizimda ro'yxatdan o'tgan e-mail manzilingizni kiriting.
                </p>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="admin@filial.uz"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            )}
            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotMsg('');
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 font-bold hover:text-slate-900 dark:text-white"
              >
                Yopish
              </button>
              {!forgotMsg && (
                <button
                  type="button"
                  onClick={() => setForgotMsg("Tiklash kodi elektron pochtangizga yuborildi.")}
                  className="px-4 py-2 text-xs font-semibold text-slate-900 dark:text-white bg-blue-600 hover:bg-blue-500 rounded-xl"
                >
                  Yuborish
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
