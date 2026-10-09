import React, { useState } from 'react';
import { Scale, Search } from 'lucide-react';
import { RULES } from '../data/rules';

export const RulesPage = () => {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();

  const items = RULES.filter(
    (r) => !q || r.title.toLowerCase().includes(q) || r.text.toLowerCase().includes(q)
  );

  return (
    <div className="p-4 sm:p-4 md:p-6 w-full max-w-[1600px] mx-auto space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Scale className="w-7 h-7 sm:w-8 sm:h-8 text-blue-700 dark:text-blue-400" />
          <span>Ichki tartib qoidalari</span>
        </h1>
        <p className="text-xs text-slate-700 dark:text-slate-300 font-bold mt-1">
          Barcha xodimlar uchun majburiy qonun-qoidalar ({RULES.length} ta band)
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Qoidalardan qidirish..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {items.map((r) => (
          <div
            key={r.id}
            className="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm flex gap-4"
          >
            <div className="w-9 h-9 shrink-0 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-400 text-sm font-extrabold flex items-center justify-center">
              {r.id}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{r.title}</h3>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1.5 leading-relaxed">{r.text}</p>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Hech narsa topilmadi</div>
        )}
      </div>
    </div>
  );
};
