import React, { useEffect, useState } from 'react';
import { History, Search, Shield, User, Clock, Laptop } from 'lucide-react';
import { api } from '../services/api';
import { TableSkeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';

export const ActivityLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await api.getActivityLogs();
      setLogs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(
    (l) =>
      l.userName.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.details.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <History className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-400" />
            <span>Faoliyat Jurnali (Audit Logs)</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Foydalanuvchilarning tizimdagi barcha harakatlari va o'zgarishlar tarixi
          </p>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Foydalanuvchi yoki amal bo'yicha..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-white dark:bg-[#121214] border border-slate-200 dark:border-white/10 focus:border-emerald-500/50 rounded-full text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={6} />
      ) : filteredLogs.length === 0 ? (
        <EmptyState description="Hali hech qanday faoliyat log yozuvlari topilmadi." />
      ) : (
        <div className="bg-white dark:bg-[#121214] rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-white/5">
                <tr>
                  <th className="px-5 py-3.5">Foydalanuvchi</th>
                  <th className="px-5 py-3.5">Amal / Harakat</th>
                  <th className="px-5 py-3.5">Tafsilotlar</th>
                  <th className="px-5 py-3.5">Sana va Vaqt</th>
                  <th className="px-5 py-3.5">IP Manzil</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium text-slate-700 dark:text-slate-200">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-100 dark:bg-white/5 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">
                            {log.userName}
                          </div>
                          <div className="text-[10px] text-emerald-400 font-semibold">
                            {log.userRole}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 font-bold text-slate-900 dark:text-white px-2.5 py-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl">
                        <Shield className="w-3.5 h-3.5 text-emerald-400" />
                        {log.action}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                      {log.details}
                    </td>

                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 font-medium">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      <span className="inline-flex items-center gap-1">
                        <Laptop className="w-3 h-3 text-slate-500" />
                        {log.ipAddress || '127.0.0.1'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
