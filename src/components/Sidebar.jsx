import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  Star,
  BarChart3,
  FileSpreadsheet,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';

export const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, hasPermission } = useAuth();

  const navItems = [
    {
      to: '/',
      label: 'Boshqaruv paneli',
      icon: LayoutDashboard,
      show: true,
    },
    {
      to: '/branches',
      label: 'Filiallar',
      icon: Building2,
      show: hasPermission('filial_view'),
    },
    {
      to: '/employees',
      label: 'Xodimlar',
      icon: Users,
      show: hasPermission('xodim_view'),
    },
    {
      to: '/daily-rating',
      label: 'Kunlik Baholash',
      icon: Star,
      show: hasPermission('baho_add') || user?.role === 'Super Admin',
      badge: 'Kunlik',
    },
    {
      to: '/statistics',
      label: 'Statistika',
      icon: BarChart3,
      show: hasPermission('statistika_view'),
    },
    {
      to: '/reports',
      label: 'Hisobotlar',
      icon: FileSpreadsheet,
      show: hasPermission('hisobot_view'),
    },
    {
      to: '/activity-log',
      label: 'Faoliyat Jurnali',
      icon: History,
      show: hasPermission('log_view') || user?.role === 'Super Admin',
    },
    {
      to: '/settings',
      label: 'Sozlamalar',
      icon: Settings,
      show: true,
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#020617] text-slate-100 border-r border-slate-200 dark:border-slate-700 select-none">
      {/* Brand Header */}
      <div className={`relative flex items-center h-20 border-b border-slate-200 dark:border-slate-700 shrink-0 transition-all ${collapsed && !mobileOpen ? 'justify-center' : 'px-5 justify-between'}`}>
        <div className="flex items-center gap-3 overflow-hidden">
          {(!collapsed || mobileOpen) ? (
            <div className="flex items-center justify-center w-full mt-2">
              <Logo className="w-14 h-auto drop-shadow-sm" />
            </div>
          ) : (
            <div className="flex items-center justify-center w-full">
              <Logo iconOnly className="w-8 h-auto drop-shadow-sm" />
            </div>
          )}
        </div>

        {/* Desktop collapse button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`hidden md:flex items-center justify-center rounded-lg text-slate-700 dark:text-slate-300 font-bold hover:text-slate-900 dark:text-white hover:bg-slate-200 dark:bg-white/10 transition-colors ${
            collapsed && !mobileOpen
              ? 'absolute -right-3 top-7 w-6 h-6 bg-slate-50 dark:bg-[#020617] border border-slate-200 dark:border-slate-700 z-50 rounded-full shadow-md'
              : 'p-1.5'
          }`}
          title={collapsed ? 'Kengaytirish' : 'Yig\'ish'}
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Mobile close button */}
        {setMobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-2 rounded-xl text-slate-700 dark:text-slate-300 font-bold hover:text-slate-900 dark:text-white hover:bg-slate-200 dark:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto custom-scrollbar">
        {navItems
          .filter((item) => item.show)
          .map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setMobileOpen && setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs transition-all relative ${
                    isActive
                      ? 'bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-slate-700 text-blue-700 dark:text-blue-400 font-bold shadow-sm'
                      : 'text-slate-700 dark:text-slate-300 font-bold hover:text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:bg-white/5'
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                {(!collapsed || mobileOpen) && <span className="truncate">{item.label}</span>}
                {(!collapsed || mobileOpen) && item.badge && (
                  <span className="ml-auto text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-500/30">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
      </nav>

      {/* Footer Role Card */}
      {(!collapsed || mobileOpen) && user && (
        <div className="p-4 m-3 rounded-2xl bg-blue-500/5 border border-blue-500/20 flex items-center justify-between shrink-0">
          <div>
            <div className="text-[10px] uppercase tracking-wider font-bold text-slate-700 dark:text-slate-300 font-bold">
              Faol Rol
            </div>
            <div className="text-xs font-extrabold text-blue-700 dark:text-blue-400 truncate mt-0.5">
              {user.role}
            </div>
          </div>
          <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse shadow-md shadow-blue-400/50" />
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col h-screen transition-all duration-300 z-40 shrink-0 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen && setMobileOpen(false)}
          />
          {/* Drawer */}
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl z-50 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
