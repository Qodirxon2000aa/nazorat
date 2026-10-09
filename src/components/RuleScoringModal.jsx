import React, { useEffect, useState } from 'react';
import { MessageSquare, Star } from 'lucide-react';
import { Modal } from './Modal';
import { StarRating } from './StarRating';
import { getApplicableRules, RULE_SCORES, calcScore } from '../data/rules';

const scoreStyles = {
  2: 'bg-emerald-500 text-white border-emerald-500',
  1: 'bg-amber-500 text-white border-amber-500',
  0: 'bg-red-500 text-white border-red-500',
};

export const RuleScoringModal = ({ employee, onClose, onSubmit }) => {
  const [showAll, setShowAll] = useState(false);
  const [scores, setScores] = useState({});
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setShowAll(false);
    setScores({});
    setComment('');
    setError('');
  }, [employee?.id]);

  const rules = employee ? getApplicableRules(employee.position, showAll) : [];
  // Belgilanmagan qoida — "Bajarildi": baholovchi faqat kamchiliklarni belgilaydi
  const scoreOf = (id) => (scores[id] === undefined ? 2 : scores[id]);
  const { percent, stars } = calcScore(rules.map((r) => scoreOf(r.id)));
  const violations = rules.filter((r) => scoreOf(r.id) === 0).length;

  const handleSubmit = async () => {
    if (submitting) return;
    if (violations > 0 && !comment.trim()) {
      setError("Qoida buzilgan bo'lsa, izohda sababini yozing");
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await onSubmit({
        employeeId: employee.id,
        rules: rules.map((r) => ({ ruleId: r.id, score: scoreOf(r.id) })),
        // Yulduz eski serverlar bilan ham ishlashi uchun yuboriladi; yangi server uni qayta hisoblaydi
        stars,
        comment: comment.trim() || 'Barcha qoidalar bajarildi',
      });
      onClose();
    } catch (e) {
      setError(e.message || 'Baho saqlashda xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={!!employee}
      onClose={onClose}
      title="Qoidalar bo'yicha baholash"
      subtitle={employee ? `${employee.firstName} ${employee.lastName} — ${employee.position}` : ''}
      maxWidth="2xl"
    >
      {employee && (
        <div className="space-y-4">
          <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
            Har bir qoidaga baho bering. Belgilanmagan qoida "Bajarildi" deb hisoblanadi — faqat
            kamchilikni belgilang.
          </p>

          <div className="space-y-2">
            {rules.map((r) => {
              const current = scoreOf(r.id);
              return (
                <div
                  key={r.id}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-white/5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3"
                >
                  <div className="flex-1 min-w-0 text-xs font-bold text-slate-900 dark:text-white">
                    <span className="text-blue-700 dark:text-blue-400 mr-1.5">{r.id}.</span>
                    {r.title}
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    {RULE_SCORES.map((s) => (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => setScores((prev) => ({ ...prev, [r.id]: s.value }))}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-extrabold border transition-colors cursor-pointer ${
                          current === s.value
                            ? scoreStyles[s.value]
                            : 'bg-white dark:bg-[#0f172a] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                        }`}
                      >
                        {s.short} {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-[11px] font-bold text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={showAll}
              onChange={(e) => setShowAll(e.target.checked)}
              className="rounded border-slate-300 text-blue-500 w-4 h-4 cursor-pointer"
            />
            Barcha qoidalarni ko'rsatish (haydovchi / omborchi / operator qoidalari ham)
          </label>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
              <span>Izoh {violations > 0 ? '(majburiy — qoida buzilgan)' : '(ixtiyoriy)'}</span>
            </label>
            <textarea
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="masalan: Bugun ishga 20 daqiqa kech qoldi..."
              className="w-full px-3.5 py-2 text-xs bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500/50 text-slate-900 dark:text-white placeholder-slate-500"
            />
          </div>

          {error && <div className="text-xs font-bold text-red-500">{error}</div>}

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="text-2xl font-extrabold text-blue-700 dark:text-blue-400 font-mono">{percent}%</div>
              <StarRating value={stars} readonly size="md" showLabel />
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting || rules.length === 0}
              className="px-5 py-2.5 text-xs font-extrabold text-black bg-blue-500 hover:bg-blue-400 rounded-xl shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {submitting ? (
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
    </Modal>
  );
};
