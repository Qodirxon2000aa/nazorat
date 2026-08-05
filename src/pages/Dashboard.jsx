import React, { useEffect, useState } from 'react';
import {
  Building2,
  Users,
  Star,
  UserCheck,
  TrendingUp,
  Award,
  Clock,
  Plus,
  MessageSquare,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../services/api';
import { StarRating } from '../components/StarRating';
import { CardSkeleton } from '../components/Skeleton';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

export const Dashboard = ({ globalQuery }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [typeFilters, setTypeFilters] = useState({ zavod: false, filial: false });
  const [recentRatings, setRecentRatings] = useState([]);
  const [myRatings, setMyRatings] = useState([]);
  const [branchRankings, setBranchRankings] = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        let branchType = undefined;
        if (typeFilters.zavod && !typeFilters.filial) branchType = 'Zavod';
        if (!typeFilters.zavod && typeFilters.filial) branchType = 'Filial';

        const data = await api.getStats({ period: 'ushbu_oy', branchType });
        setStats(data.overview);
        setBranchRankings(data.branchRankings || []);

        const ratings = await api.getRatings();
        setRecentRatings(ratings.slice(0, 6));

        // Filter ratings for current employee if role === 'Xodim'
        if (user) {
          const userFullName = `${user.name || ''} ${user.surname || ''}`.trim().toLowerCase();
          const filtered = ratings.filter(r => 
            String(r.employeeId) === String(user.employeeId || user.id) ||
            (r.employeeName && r.employeeName.toLowerCase().includes((user.name || '').toLowerCase()))
          );
          setMyRatings(filtered);
        }
      } catch (e) {
        console.error('Dashboard load error:', e);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, [user, typeFilters]);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  // ==========================================
  // EMPLOYEE PERSONAL DASHBOARD (ROLI === 'Xodim')
  // ==========================================
  if (user?.role === 'Xodim') {
    const totalMyStars = myRatings.reduce((sum, r) => sum + (r.stars || 0), 0);
    const myAvgRating = myRatings.length > 0 ? Number((totalMyStars / myRatings.length).toFixed(1)) : 0;
    const fiveStarCount = myRatings.filter(r => r.stars === 5).length;

    return (
      <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-8 font-sans">
        {/* Profile Card Banner */}
        <div className="p-5 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-blue-950/90 via-slate-900 to-slate-950 border border-blue-500/20 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 text-slate-900 dark:text-white font-black text-xl sm:text-2xl flex items-center justify-center shadow-xl shadow-blue-500/30 shrink-0">
                {user.name ? user.name[0].toUpperCase() : 'X'}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 dark:text-white">
                    {user.name} {user.surname}
                  </h1>
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
                    Faol Xodim
                  </span>
                </div>
                <p className="text-xs text-blue-300 font-semibold">
                  {user.position || 'Xodim'} — {user.branchName || 'Filial'}
                </p>
                {user.phone && (
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-bold">
                    📞 Telefon: {user.phone}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shrink-0">
              <div className="text-center px-3">
                <div className="text-2xl font-black text-amber-400 flex items-center justify-center gap-1">
                  <span>{myAvgRating}</span>
                  <Star className="w-5 h-5 fill-amber-400" />
                </div>
                <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider mt-0.5">
                  O'rtacha baho
                </div>
              </div>
              <div className="w-px h-8 bg-slate-800" />
              <div className="text-center px-3">
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {myRatings.length}
                </div>
                <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider mt-0.5">
                  Jami baholar
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-bold">A'lo baholar (5 ⭐)</span>
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
                <Award className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{fiveStarCount} ta</div>
            <div className="text-[11px] text-slate-700 font-bold">Menejerlar tomonidan e'tirof etilgan</div>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-bold">Jami baholar soni</span>
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-700 dark:text-blue-400">
                <MessageSquare className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{myRatings.length} ta</div>
            <div className="text-[11px] text-slate-700 font-bold">Kunlik baholash davri mobaynida</div>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-bold">Oxirgi olgan bahoyim</span>
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-700 dark:text-blue-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-blue-700 dark:text-blue-400">
              {myRatings.length > 0 ? `${myRatings[0].stars} ⭐` : 'Mavjud emas'}
            </div>
            <div className="text-[11px] text-slate-700 font-bold">
              {myRatings.length > 0 ? `Sana: ${myRatings[0].date}` : 'Hali baho qo\'yilmagan'}
            </div>
          </div>
        </div>

        {/* My Ratings Timeline */}
        <div className="p-5 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                Mening Baholarim va Izohlarim
              </h2>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-bold mt-0.5">
                Menejer va rahbariyat tomonidan berilgan kunlik baholar va bildirilgan izohlar
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
              {myRatings.length} ta baho
            </span>
          </div>

          {myRatings.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <Star className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Sizga hali baho qo'yilmagan</h3>
              <p className="text-xs text-slate-700 font-bold mt-1">
                Kunlik baholash natijalari berilishi bilan ushbu bo'limda aks etadi.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {myRatings.map((rating) => (
                <div
                  key={rating.id}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 hover:border-blue-500/30 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <StarRating value={rating.stars} readonly size="md" showLabel />
                      <span className="text-xs text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-700 font-bold" />
                        {rating.date}
                      </span>
                    </div>

                    <span className="text-xs text-slate-700 dark:text-slate-300 font-bold bg-white dark:bg-slate-900 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-800">
                      Baholadi: <strong className="text-slate-700 dark:text-slate-200">{rating.ratedByName || 'Menejer'}</strong>
                    </span>
                  </div>

                  {rating.comment && (
                    <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/60 text-xs text-slate-700 dark:text-slate-200 italic leading-relaxed">
                      "{rating.comment}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // ADMIN & MANAGER DASHBOARD VIEW
  // ==========================================
  const statCards = [
    {
      title: (!typeFilters.zavod && !typeFilters.filial) || (typeFilters.zavod && typeFilters.filial) ? "Jami tashkilotlar" : typeFilters.zavod ? "Jami zavodlar" : "Jami filiallar",
      value: stats?.totalBranches || 0,
      subText: (!typeFilters.zavod && !typeFilters.filial) || (typeFilters.zavod && typeFilters.filial) ? "Faol tashkilotlar tarmog'i" : typeFilters.zavod ? "Faol zavodlar tarmog'i" : "Faol filiallar tarmog'i",
      icon: Building2,
      link: '/branches',
    },
    {
      title: 'Jami xodimlar',
      value: stats?.totalEmployees || 0,
      subText: 'Tizimdagi jami shtat',
      icon: Users,
      link: '/employees',
    },
    {
      title: 'Bugungi baholar',
      value: stats?.todayRatingsCount || 0,
      subText: 'Bugun baholanganlar',
      icon: Star,
      link: '/daily-rating',
    },
    {
      title: 'Bugungi faol foydalanuvchilar',
      value: stats?.todayActiveUsers || 0,
      subText: 'Tizimda faol a\'zolar',
      icon: UserCheck,
      link: '/activity-log',
    },
  ];

  const secondaryCards = [
    {
      title: 'O\'rtacha baho',
      value: `${stats?.overallAverageRating || 0} ⭐`,
      subText: 'Umumiy tizim balli',
      icon: TrendingUp,
      badge: 'Barchasi',
    },
    {
      title: 'Top xodim',
      value: stats?.topEmployee ? stats.topEmployee.name : 'Mavjud emas',
      subText: stats?.topEmployee ? `${stats.topEmployee.rating} ⭐ (${stats.topEmployee.branch})` : '-',
      icon: Award,
      badge: 'Eng yuqori',
    },
    {
      title: (!typeFilters.zavod && !typeFilters.filial) || (typeFilters.zavod && typeFilters.filial) ? "Top tashkilot" : typeFilters.zavod ? "Top zavod" : "Top filial",
      value: stats?.topBranch ? stats.topBranch.name : 'Mavjud emas',
      subText: stats?.topBranch ? `${stats.topBranch.rating} ⭐` : '-',
      icon: Building2,
      badge: (!typeFilters.zavod && !typeFilters.filial) || (typeFilters.zavod && typeFilters.filial) ? "N 1 Tashkilot" : typeFilters.zavod ? "N 1 Zavod" : "N 1 Filial",
    },
    {
      title: 'Kutilayotgan baholar',
      value: stats?.pendingRatingsCount || 0,
      subText: 'Bugun baholanmaganlar',
      icon: Clock,
      badge: 'Nazorat',
    },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Boshqaruv Paneli
          </h1>
          <p className="text-xs text-slate-700 dark:text-slate-300 font-bold mt-1">
            {(!typeFilters.zavod && !typeFilters.filial) || (typeFilters.zavod && typeFilters.filial) ? "Tashkilotlar" : typeFilters.zavod ? "Zavodlar" : "Filiallar"} faoliyati va xodimlarning kunlik baholash tahlili
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/daily-rating')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-black font-extrabold text-xs shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Star className="w-4 h-4 fill-black" />
            <span>Kunlik Baholash</span>
          </button>

          <button
            onClick={() => navigate('/employees')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:bg-white/10 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold text-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Xodim qo'shish</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 w-fit">
        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-900 dark:text-white">
          <input
            type="checkbox"
            checked={typeFilters.zavod}
            onChange={(e) => setTypeFilters({ ...typeFilters, zavod: e.target.checked })}
            className="rounded border-slate-300 text-blue-500 focus:ring-blue-500 w-4 h-4 cursor-pointer"
          />
          Zavodlar statistikasi
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-900 dark:text-white">
          <input
            type="checkbox"
            checked={typeFilters.filial}
            onChange={(e) => setTypeFilters({ ...typeFilters, filial: e.target.checked })}
            className="rounded border-slate-300 text-blue-500 focus:ring-blue-500 w-4 h-4 cursor-pointer"
          />
          Filiallar statistikasi
        </label>
      </div>

      {/* Primary Animated Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              onClick={() => navigate(card.link)}
              className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 hover:border-blue-500/30 transition-all shadow-xl cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-bold group-hover:text-slate-900 dark:text-white transition-colors">
                  {card.title}
                </span>
                <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-700 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-slate-900 dark:text-white transition-all shadow-lg">
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">
                {card.value}
              </div>
              <p className="text-[11px] font-bold text-slate-700 font-bold">
                {card.subText}
              </p>
            </div>
          );
        })}
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {secondaryCards.map((card, i) => {
          return (
            <div
              key={i}
              className="p-4 sm:p-5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-slate-800 space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300 font-bold">{card.title}</span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                  {card.badge}
                </span>
              </div>
              <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">{card.value}</div>
              <div className="text-[10px] text-slate-700 font-bold">{card.subText}</div>
            </div>
          );
        })}
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Branch Rankings Chart */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {(!typeFilters.zavod && !typeFilters.filial) || (typeFilters.zavod && typeFilters.filial) ? "Tashkilotlar" : typeFilters.zavod ? "Zavodlar" : "Filiallar"} Reytingi Tahlili
              </h2>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-bold mt-0.5">
                Barcha {(!typeFilters.zavod && !typeFilters.filial) || (typeFilters.zavod && typeFilters.filial) ? "tashkilotlarning" : typeFilters.zavod ? "zavodlarning" : "filiallarning"} o'rtacha ballar bo'yicha o'rni
              </p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchRankings}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 5]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="averageRating" radius={[8, 8, 0, 0]}>
                  {branchRankings.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === 0 ? '#10b981' : index === 1 ? '#6366f1' : '#3b82f6'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Ratings Timeline */}
        <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Oxirgi Baholar
            </h2>
            <button
              onClick={() => navigate('/daily-rating')}
              className="text-xs text-blue-700 dark:text-blue-400 hover:underline font-bold"
            >
              Barchasi
            </button>
          </div>

          <div className="space-y-4">
            {recentRatings.map((rating) => (
              <div
                key={rating.id}
                className="p-3.5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-slate-800 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">{rating.employeeName}</span>
                  <StarRating value={rating.stars} readonly size="sm" />
                </div>
                <div className="text-slate-700 dark:text-slate-300 font-bold text-[11px] truncate">
                  "{rating.comment || 'Izoh yo\'q'}"
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-700 font-bold pt-1">
                  <span>{rating.branchName}</span>
                  <span>{rating.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
