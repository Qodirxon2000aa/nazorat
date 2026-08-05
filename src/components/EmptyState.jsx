import React from 'react';
import { FolderOpen } from 'lucide-react';

export const EmptyState = ({
  title = "Ma'lumot topilmadi",
  description = "Ayni paytda hech qanday ma'lumot kiritilmagan yoki qidiruv natijasi bo'sh.",
  action,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-200 dark:border-slate-800 my-4">
      <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-700 dark:text-blue-400 mb-4">
        {icon || <FolderOpen className="w-8 h-8" />}
      </div>
      <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
        {title}
      </h3>
      <p className="text-sm text-slate-700 dark:text-slate-300 font-bold max-w-sm mb-6">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 text-sm font-bold text-slate-900 dark:text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
