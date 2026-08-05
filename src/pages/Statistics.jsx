import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Calendar,
  Award,
  TrendingDown,
  TrendingUp,
  Building2,
  Star,
  Trophy,
} from 'lucide-react';
import { api } from '../services/api';
import { CardSkeleton } from '../components/Skeleton';
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';

export const Statistics = () => {
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [typeFilters, setTypeFilters] = useState({ zavod: false, filial: false });
  const [period, setPeriod] = useState('ushbu_oy');

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      let branchType = undefined;
      if (typeFilters.zavod && !typeFilters.filial) branchType = 'Zavod';
      if (!typeFilters.zavod && typeFilters.filial) branchType = 'Filial';

      const res = await api.getStats({
        period,
        startDate: period === 'custom' ? startDate : undefined,
        endDate: period === 'custom' ? endDate : undefined,
        branchId: selectedBranchId || undefined,
        branchType,
      });
      setStatsData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initBranches = async () => {
      try {
        const brs = await api.getBranches();
        setBranches(brs);
      } catch (e) {
        console.error(e);
      }
    };
    initBranches();
  }, []);

  useEffect(() => {
    fetchStats();
  }, [period, selectedBranchId, startDate, endDate, typeFilters]);

  const quickFilterButtons = [
    { id: 'bugun', label: 'Bugun' },
    { id: 'kecha', label: 'Kecha' },
    { id: '7kun', label: 'Oxirgi 7 kun' },
    { id: '30kun', label: 'Oxirgi 30 kun' },
    { id: 'ushbu_oy', label: 'Ushbu oy' },
    { id: 'otgan_oy', label: "O'tgan oy" },
    { id: 'ushbu_yil', label: 'Ushbu yil' },
    { id: 'custom', label: 'Tanlangan sana' },
  ];

  const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#f97316', '#ef4444'];

  return (
    <div className="p-4 sm:p-4 md:p-6 w-full max-w-[1600px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-7 h-7 sm:w-8 sm:h-8 text-blue-700 dark:text-blue-400" />
            <span>Tahliliy Statistika va Reytinglar</span>
          </h1>
          <p className="text-xs text-slate-700 dark:text-slate-300 font-bold mt-1">
            Xodimlar va tashkilotlar ko'rsatkichlarining chuqurlashtirilgan grafik diagrammalari
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
        {/* Quick Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {quickFilterButtons.map((btn) => (
            <button
              key={btn.id}
              onClick={() => setPeriod(btn.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                period === btn.id
                  ? 'bg-blue-500 text-black font-extrabold shadow-lg shadow-blue-500/20'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:bg-white/10'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Dropdowns & Custom Date Inputs */}
        <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-700 dark:text-blue-400" />
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="px-3.5 py-2 text-xs bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold focus:outline-none cursor-pointer"
              >
                <option value="" className="bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white">
                  {(!typeFilters.zavod && !typeFilters.filial) || (typeFilters.zavod && typeFilters.filial) ? "Barcha Tashkilotlar" : typeFilters.zavod ? "Barcha Zavodlar" : "Barcha Filiallar"}
                </option>
                {branches
                  .filter(b => {
                    if (typeFilters.zavod && typeFilters.filial) return true;
                    if (typeFilters.zavod) return b.type === 'Zavod';
                    if (typeFilters.filial) return b.type === 'Filial' || !b.type;
                    return true;
                  })
                  .map((b) => (
                  <option key={b.id} value={b.id} className="bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white">
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-4 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-900 dark:text-white">
                <input
                  type="checkbox"
                  checked={typeFilters.filial}
                  onChange={(e) => setTypeFilters({ ...typeFilters, filial: e.target.checked })}
                  className="rounded border-slate-300 text-blue-500 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                Filial
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-900 dark:text-white">
                <input
                  type="checkbox"
                  checked={typeFilters.zavod}
                  onChange={(e) => setTypeFilters({ ...typeFilters, zavod: e.target.checked })}
                  className="rounded border-slate-300 text-blue-500 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                Zavod
              </label>
            </div>
          </div>

          {period === 'custom' && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-700 dark:text-blue-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
              />
              <span className="text-xs text-slate-700 dark:text-slate-300 font-bold">—</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* Main Analytics Content */}
      {loading || !statsData ? (
        <CardSkeleton />
      ) : (
        <div className="space-y-8">
          {/* Section: Umumiy Jamlangan Ballar (Accumulated Total Points Leaderboard) */}
          <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0f172a] border border-blue-500/20 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-amber-400" />
                  <span>Umumiy Jamlangan Ballar Reytingi</span>
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-bold mt-0.5">
                  Xodimlarning barcha kunlik olgan baholari yig'indisi
                </p>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold self-start sm:self-auto">
                🏆 Ballar Bo'yicha Etakchilar
              </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3">O'rin</th>
                    <th className="px-4 py-3">Xodim</th>
                    <th className="px-4 py-3">
                      {(!typeFilters.zavod && !typeFilters.filial) || (typeFilters.zavod && typeFilters.filial) ? "Tashkilot" : typeFilters.zavod ? "Zavod" : "Filial"}
                    </th>
                    <th className="px-4 py-3 text-center">Jami To'plangan Ball</th>
                    <th className="px-4 py-3 text-center">O'rtacha Ball</th>
                    <th className="px-4 py-3 text-right">Baholar Soni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-bold text-slate-700 dark:text-slate-200">
                  {(statsData?.cumulativePointsLeaderboard || []).map((emp, index) => (
                    <tr key={emp.id || index} className="hover:bg-slate-100 dark:bg-white/5 transition-colors">
                      <td className="px-4 py-3.5">
                        <span
                          className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black ${
                            index === 0
                              ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/30'
                              : index === 1
                              ? 'bg-slate-300 text-black'
                              : index === 2
                              ? 'bg-amber-700 text-slate-900 dark:text-white'
                              : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 font-bold'
                          }`}
                        >
                          {index + 1}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-700 dark:text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                            {emp.name ? emp.name[0].toUpperCase() : 'X'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white text-xs">{emp.name}</div>
                            <div className="text-[10px] text-slate-700 dark:text-slate-300 font-bold">{emp.position}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                        {emp.branch}
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-700 dark:text-blue-400 font-black text-sm">
                          <Star className="w-4 h-4 fill-blue-400" />
                          <span>{emp.totalPoints} BALL</span>
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-center font-mono font-bold text-amber-400">
                        {emp.averageRating} ⭐
                      </td>

                      <td className="px-4 py-3.5 text-right font-mono text-slate-700 dark:text-slate-300 font-bold">
                        {emp.totalRatingsCount} marta
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Leaders Showcase Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 hover:border-blue-500/30 transition-all text-slate-900 dark:text-white shadow-xl group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Eng Yuqori Xodim</span>
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-700 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <div className="text-base sm:text-lg font-black truncate mt-1">
                {statsData.overview?.topEmployee?.name || 'Mavjud emas'}
              </div>
              <div className="text-[11px] font-bold text-blue-700 dark:text-blue-400 mt-1">
                {statsData.overview?.topEmployee
                  ? `${statsData.overview.topEmployee.rating} ⭐ (${statsData.overview.topEmployee.branch})`
                  : '-'}
              </div>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 hover:border-blue-500/30 transition-all text-slate-900 dark:text-white shadow-xl group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Eng Past Xodim</span>
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-700 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <TrendingDown className="w-4 h-4" />
                </div>
              </div>
              <div className="text-base sm:text-lg font-black truncate mt-1">
                {statsData.overview?.bottomEmployee?.name || 'Mavjud emas'}
              </div>
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1">
                {statsData.overview?.bottomEmployee
                  ? `${statsData.overview.bottomEmployee.rating} ⭐ (${statsData.overview.bottomEmployee.branch})`
                  : '-'}
              </div>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 hover:border-blue-500/30 transition-all text-slate-900 dark:text-white shadow-xl group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {(!typeFilters.zavod && !typeFilters.filial) || (typeFilters.zavod && typeFilters.filial) ? "Eng Yaxshi Tashkilot" : typeFilters.zavod ? "Eng Yaxshi Zavod" : "Eng Yaxshi Filial"}
                </span>
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-700 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-base sm:text-lg font-black truncate mt-1">
                {statsData.overview?.topBranch?.name || 'Mavjud emas'}
              </div>
              <div className="text-[11px] font-bold text-blue-700 dark:text-blue-400 mt-1">
                {statsData.overview?.topBranch
                  ? `${statsData.overview.topBranch.rating} ⭐ O'rtacha`
                  : '-'}
              </div>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 hover:border-blue-500/30 transition-all text-slate-900 dark:text-white shadow-xl group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {(!typeFilters.zavod && !typeFilters.filial) || (typeFilters.zavod && typeFilters.filial) ? "Eng Sust Tashkilot" : typeFilters.zavod ? "Eng Sust Zavod" : "Eng Sust Filial"}
                </span>
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-700 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-base sm:text-lg font-black truncate mt-1">
                {statsData.overview?.weakestBranch?.name || 'Mavjud emas'}
              </div>
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1">
                {statsData.overview?.weakestBranch
                  ? `${statsData.overview.weakestBranch.rating} ⭐ O'rtacha`
                  : '-'}
              </div>
            </div>
          </div>

          {/* Charts Row 1: Line Chart & Pie Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-xl">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                Oylik va Dinamik O'rtacha Reyting (Area Chart)
              </h3>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-bold mb-6">
                Vaqt oralig'ida tizim bo'yicha baholarning o'sish va pasayish dinamikasi
              </p>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={statsData?.monthlyChartData || []}>
                    <defs>
                      <linearGradient id="ratingGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.6} />
                    <XAxis dataKey="month" stroke="#71717a" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 5]} stroke="#71717a" tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#18181b',
                        borderColor: '#27272a',
                        borderRadius: '0.75rem',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="rating"
                      stroke="#10b981"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#ratingGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Rating Distribution Pie Chart */}
            <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col items-center justify-between">
              <div className="w-full text-left">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Baholar Taqsimoti (Pie Chart)
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-bold">
                  1 tadan 5 tagacha yulduzli baholar ulushi
                </p>
              </div>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statsData?.distributionData || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="count"
                    >
                      {(statsData?.distributionData || []).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#18181b',
                        borderColor: '#27272a',
                        borderRadius: '0.75rem',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 w-full text-[11px] pt-2">
                {(statsData?.distributionData || []).map((d, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                    />
                    <span className="text-slate-600 dark:text-slate-300 font-bold">
                      {d.name}: {d.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Leaderboards Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top 10 Employees */}
            <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-xl">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span>Top 10 Xodimlar Reytingi</span>
              </h3>

              <div className="divide-y divide-white/5 max-h-96 overflow-y-auto custom-scrollbar">
                {(statsData?.topPerformers || statsData?.empRankings || []).slice(0, 10).map((emp, rank) => (
                  <div key={emp.id || rank} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${
                          rank === 0
                            ? 'bg-amber-400 text-black'
                            : rank === 1
                            ? 'bg-slate-300 text-black'
                            : rank === 2
                            ? 'bg-amber-700 text-slate-900 dark:text-white'
                            : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 font-bold'
                        }`}
                      >
                        {rank + 1}
                      </span>

                      <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-700 dark:text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-sm shrink-0">
                        {emp.name ? emp.name[0].toUpperCase() : 'X'}
                      </div>

                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {emp.name}
                        </div>
                        <div className="text-[10px] text-slate-700 dark:text-slate-300 font-bold">{emp.branch}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-extrabold text-amber-400 flex items-center gap-1 justify-end">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{emp.averageRating} ⭐</span>
                      </div>
                      <span className="text-[10px] text-slate-700 dark:text-slate-300 font-bold font-mono">
                        {emp.ratingCount || emp.count || 0} ta baho
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Branch Rating Performance */}
            <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-xl">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-blue-700 dark:text-blue-400" />
                <span>
                  {(!typeFilters.zavod && !typeFilters.filial) || (typeFilters.zavod && typeFilters.filial) ? "Tashkilotlar Reytingi" : typeFilters.zavod ? "Zavodlar Reytingi" : "Filiallar Reytingi"}
                </span>
              </h3>

              <div className="divide-y divide-white/5 max-h-96 overflow-y-auto custom-scrollbar">
                {(statsData?.branchRankings || []).map((b, rank) => (
                  <div key={b.id || rank} className="py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-400 flex items-center justify-center text-xs font-black">
                        {rank + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {b.name}
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-extrabold text-blue-700 dark:text-blue-400">
                        {b.averageRating} ⭐
                      </div>
                      <span className="text-[10px] text-slate-700 dark:text-slate-300 font-bold font-mono">
                        {b.count} ta baholash
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
