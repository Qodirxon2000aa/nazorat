import React, { useEffect, useState } from 'react';
import {
  Star,
  CheckCircle2,
  Building2,
  Calendar,
  AlertCircle,
  MessageSquare,
  Sparkles,
  Search,
} from 'lucide-react';
import { api } from '../services/api';
import { StarRating } from '../components/StarRating';
import { TableSkeleton } from '../components/Skeleton';
import { ToastContainer } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { subscribeToUpdates } from '../services/sse';

export const DailyRatingPage = () => {
  const { user } = useAuth();
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const [employees, setEmployees] = useState([]);
  const [todayRatings, setTodayRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Ratings draft state for form inputs
  const [ratingDrafts, setRatingDrafts] = useState({});

  const [toasts, setToasts] = useState([]);

  const addToast = (type, message) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const brs = await api.getBranches();
      setBranches(brs);

      // Default to manager's branch if applicable
      const defaultBranch =
        user?.branchId || (brs.length > 0 ? brs[0].id : '');
      const activeBranchId = selectedBranchId || defaultBranch;
      setSelectedBranchId(activeBranchId);

      if (activeBranchId) {
        const [emps, ratings] = await Promise.all([
          api.getEmployees({ branchId: activeBranchId, status: 'Faol' }),
          api.getRatings({ branchId: activeBranchId, date: selectedDate }),
        ]);

        setEmployees(emps);
        setTodayRatings(ratings);

        // Initialize drafts
        const drafts = {};
        emps.forEach((emp) => {
          const existing = ratings.find((r) => r.employeeId === emp.id);
          drafts[emp.id] = {
            stars: existing ? existing.stars : 0,
            comment: existing ? existing.comment : '',
            submitting: false,
          };
        });
        setRatingDrafts(drafts);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleDataUpdate = (data) => {
      if (data.type === 'ratings' || data.type === 'employees') {
        loadData();
      }
    };

    const unsubscribe = subscribeToUpdates(handleDataUpdate);

    return () => {
      unsubscribe();
    };
  }, [selectedBranchId, selectedDate]);

  const handleStarChange = (empId, stars) => {
    setRatingDrafts((prev) => ({
      ...prev,
      [empId]: { ...prev[empId], stars },
    }));
  };

  const handleCommentChange = (empId, comment) => {
    setRatingDrafts((prev) => ({
      ...prev,
      [empId]: { ...prev[empId], comment },
    }));
  };

  const handleSaveRating = async (emp) => {
    const draft = ratingDrafts[emp.id];
    if (!draft || draft.stars === 0) {
      addToast('warning', 'Iltimos, yulduzli bahoni tanlang!');
      return;
    }

    setRatingDrafts((prev) => ({
      ...prev,
      [emp.id]: { ...prev[emp.id], submitting: true },
    }));

    try {
      const newRating = await api.createRating({
        employeeId: emp.id,
        stars: draft.stars,
        comment: draft.comment.trim() || 'Izoh yozilmadi',
        date: selectedDate,
      });

      setTodayRatings((prev) => [...prev.filter((r) => r.employeeId !== emp.id), newRating]);
      addToast('success', `${emp.firstName} ${emp.lastName} uchun baho saqlandi!`);
    } catch (err) {
      addToast('error', err.message || 'Baho saqlashda xatolik yuz berdi');
    } finally {
      setRatingDrafts((prev) => ({
        ...prev,
        [emp.id]: { ...prev[emp.id], submitting: false },
      }));
    }
  };

  const ratedCount = todayRatings.length;
  const totalEmps = employees.length;
  const progressPercent = totalEmps > 0 ? Math.round((ratedCount / totalEmps) * 100) : 0;

  const filteredEmployees = employees
    .filter((e) =>
      `${e.firstName} ${e.lastName} ${e.position}`
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const aRated = todayRatings.some((r) => r.employeeId === a.id);
      const bRated = todayRatings.some((r) => r.employeeId === b.id);
      if (aRated && !bRated) return 1;
      if (!aRated && bRated) return -1;
      return 0;
    });

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Star className="w-7 h-7 sm:w-8 sm:h-8 text-amber-400 fill-amber-400" />
            <span>Kunlik Baholash Tizimi</span>
          </h1>
          <p className="text-xs text-slate-700 dark:text-slate-300 font-bold mt-1">
            Filial xodimlari kunlik baholari va izohlari
          </p>
        </div>

        {/* Date & Branch Selectors */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-[#0f172a] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <Building2 className="w-4 h-4 text-blue-700 dark:text-blue-400" />
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id} className="bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white">
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-white dark:bg-[#0f172a] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <Calendar className="w-4 h-4 text-blue-700 dark:text-blue-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Progress & Search Bar */}
      <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="w-full md:w-1/2 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-600 dark:text-slate-300">
              Bugungi baholash jarayoni ({selectedDate}):
            </span>
            <span className="text-blue-700 dark:text-blue-400 font-mono">
              {ratedCount} / {totalEmps} xodim ({progressPercent}%)
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
            <div
              className="h-full bg-blue-500 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700 dark:text-slate-300 font-bold" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Xodimni ismidan qidirish..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-slate-700 focus:border-blue-500/50 rounded-full text-slate-100 placeholder-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Employee Cards Grid for Rating */}
      {loading ? (
        <TableSkeleton rows={4} />
      ) : filteredEmployees.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
          <Sparkles className="w-8 h-8 text-blue-700 dark:text-blue-400 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Ushbu filialda faol xodimlar topilmadi
          </h3>
          <p className="text-xs text-slate-700 dark:text-slate-300 font-bold mt-1">
            "Xodimlar" bo'limidan filialga yangi xodimlarni biriktiring.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredEmployees.map((emp) => {
            const existingRating = todayRatings.find((r) => r.employeeId === emp.id);
            const draft = ratingDrafts[emp.id] || { stars: 0, comment: '', submitting: false };

            return (
              <div
                key={emp.id}
                className={`p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0f172a] border transition-all shadow-xl ${
                  existingRating
                    ? 'border-blue-500/30 bg-blue-500/5'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-blue-600/20 text-blue-700 dark:text-blue-400 border border-blue-500/30 flex items-center justify-center font-extrabold text-base shrink-0">
                      {emp.firstName ? emp.firstName[0].toUpperCase() : 'X'}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {emp.firstName} {emp.lastName}
                      </h3>
                      <p className="text-xs text-blue-700 dark:text-blue-400 font-semibold">
                        {emp.position}
                      </p>
                      <span className="text-[10px] text-slate-700 dark:text-slate-300 font-bold">
                        O'rtacha reytingi: {emp.averageRating} ⭐
                      </span>
                    </div>
                  </div>

                  {existingRating ? (
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-blue-700 dark:text-blue-400" />
                      Baholandi
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-amber-400" />
                      Kutilmoqda
                    </span>
                  )}
                </div>

                {existingRating ? (
                  <div className="p-4 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-600 dark:text-slate-300">
                        Qo'yilgan baho:
                      </span>
                      <StarRating value={existingRating.stars} readonly size="md" showLabel />
                    </div>
                    <p className="text-slate-700 dark:text-slate-200 italic">
                      "{existingRating.comment}"
                    </p>
                    <div className="text-[10px] text-slate-700 dark:text-slate-300 font-bold text-right">
                      Baholadi: {existingRating.ratedByName}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
                        1. Yulduzli baho tanlang:
                      </label>
                      <StarRating
                        value={draft.stars}
                        onChange={(val) => handleStarChange(emp.id, val)}
                        size="lg"
                        showLabel
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
                        <span>2. Izoh qoldiring (Ixtiyoriy)</span>
                      </label>
                      <textarea
                        rows={2}
                        value={draft.comment}
                        onChange={(e) => handleCommentChange(emp.id, e.target.value)}
                        placeholder="masalan: Bugun mijozlar bilan mas'uliyatli ishladi..."
                        className="w-full px-3.5 py-2 text-xs bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500/50 text-slate-900 dark:text-white placeholder-slate-500"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => handleSaveRating(emp)}
                        disabled={draft.submitting}
                        className="px-5 py-2.5 text-xs font-extrabold text-black bg-blue-500 hover:bg-blue-400 rounded-xl shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                      >
                        {draft.submitting ? (
                          <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        ) : (
                          <>
                            <Star className="w-4 h-4 fill-black" />
                            <span>Bahoni Saqlash</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
