import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export const ErrorState = ({ message, onRetry }) => (
  <div className="p-8 sm:p-12 text-center bg-white dark:bg-[#0f172a] rounded-3xl border border-red-500/20 shadow-xl">
    <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
    <h3 className="text-base font-bold text-slate-900 dark:text-white">Ma'lumotni yuklab bo'lmadi</h3>
    <p className="text-xs text-slate-700 dark:text-slate-300 font-bold mt-1 max-w-md mx-auto">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="mt-4 px-5 py-2.5 text-xs font-extrabold text-black bg-blue-500 hover:bg-blue-400 rounded-xl shadow-lg shadow-blue-500/20 inline-flex items-center gap-2 cursor-pointer"
      >
        <RefreshCw className="w-4 h-4" />
        <span>Qayta urinish</span>
      </button>
    )}
  </div>
);
