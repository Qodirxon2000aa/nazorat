import React, { useEffect, useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  Phone,
  MapPin,
  UserCheck,
  Edit2,
  Trash2,
  Users,
  Star,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { Modal } from '../components/Modal';
import { TableSkeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import { subscribeToUpdates } from '../services/sse';

export const Factories = ({ globalQuery }) => {
  const { hasPermission } = useAuth();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
  });

  // Branch Detail / Staff Drawer
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [branchEmployees, setBranchEmployees] = useState([]);
  const [drawerLoading, setDrawerLoading] = useState(false);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const data = await api.getBranches();
      setBranches(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();

    const handleDataUpdate = (data) => {
      if (data.type === 'branches' || data.type === 'employees') {
        fetchBranches();
      }
    };

    const unsubscribe = subscribeToUpdates(handleDataUpdate);

    return () => {
      unsubscribe();
    };
  }, []);

  const handleOpenAddModal = () => {
    setEditingBranch(null);
    setFormData({
      name: '',
      address: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (b) => {
    setEditingBranch(b);
    setFormData({
      name: b.name,
      address: b.address,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBranch) {
        await api.updateBranch(editingBranch.id, formData);
      } else {
        await api.createBranch({ ...formData, type: 'Zavod' });
      }
      setIsModalOpen(false);
      fetchBranches();
    } catch (err) {
      alert(err.message || "Xatolik yuz berdi");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Filialni o'chirishni tasdiqlaysizmi?")) {
      try {
        await api.deleteBranch(id);
        fetchBranches();
      } catch (err) {
        alert(err.message || "O'chirishda xatolik");
      }
    }
  };

  const handleViewBranchStaff = async (branch) => {
    setSelectedBranch(branch);
    setDrawerLoading(true);
    try {
      const emps = await api.getEmployees({ branchId: branch.id });
      setBranchEmployees(emps);
    } catch (e) {
      console.error(e);
    } finally {
      setDrawerLoading(false);
    }
  };

  const filteredBranches = branches.filter(b => b.type === 'Zavod').filter((b) => {
    const matchesGlobal =
      globalQuery && (
        b.name.toLowerCase().includes(globalQuery.toLowerCase()) ||
        b.address.toLowerCase().includes(globalQuery.toLowerCase())
      );
    
    if (globalQuery) return matchesGlobal;

    const matchesSearch =
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.address.toLowerCase().includes(search.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-7 h-7 sm:w-8 sm:h-8 text-blue-700 dark:text-blue-400" />
            <span>Zavodlar Boshqaruvi</span>
          </h1>
          <p className="text-xs text-slate-700 dark:text-slate-300 font-bold mt-1">
            Tizimdagi barcha filiallar, ularning xodimlari va ko'rsatkichlari
          </p>
        </div>

        {hasPermission('zavod_add') && (
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-black font-extrabold text-xs shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi Filial Qo'shish</span>
          </button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-[#0f172a] p-4 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700 dark:text-slate-300 font-bold" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filial nomi yoki manzil bo'yicha qidirish..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-slate-700 focus:border-blue-500/50 rounded-full text-slate-100 placeholder-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Branch Cards Grid */}
      {loading ? (
        <TableSkeleton rows={4} />
      ) : filteredBranches.length === 0 ? (
        <EmptyState
          title="Zavodlar topilmadi"
          description="Qidiruv parametrlari bo'yicha hech qanday filial kelmadi."
          action={
            hasPermission('zavod_add')
              ? { label: 'Zavod Yaratish', onClick: handleOpenAddModal }
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBranches.map((b) => (
            <div
              key={b.id}
              className="group relative rounded-2xl sm:rounded-3xl p-5 sm:p-6 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 hover:border-blue-500/30 shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {b.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-700 dark:text-slate-300 font-bold mt-0.5">
                        <MapPin className="w-3 h-3 text-blue-700 dark:text-blue-400 shrink-0" />
                        <span className="truncate">{b.address}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300`}
                    >
                      {b.type === 'Zavod' ? '🏭 Zavod' : '🏭 Zavod'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 py-3 border-y border-slate-200 dark:border-slate-800 my-3 text-xs">
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-bold">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-700 font-bold" /> Xodimlar:
                    </span>
                    <span className="font-bold text-blue-700 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-md">
                      {b.employeeCount || 0} kishi
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-auto">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 shrink-0">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span className="whitespace-nowrap">{b.averageRating || 0} ⭐ O'rtacha</span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleViewBranchStaff(b)}
                    className="px-3 py-1.5 text-blue-700 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 rounded-xl transition-colors text-xs font-bold"
                    title="Xodimlarni ko'rish"
                  >
                    Xodimlar
                  </button>

                  {hasPermission('filial_edit') && (
                    <button
                      onClick={() => handleOpenEditModal(b)}
                      className="p-1.5 text-slate-700 dark:text-slate-300 font-bold hover:text-slate-900 dark:text-white hover:bg-slate-100 dark:bg-white/5 rounded-lg transition-colors"
                      title="Tahrirlash"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}

                  {hasPermission('filial_delete') && (
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="p-1.5 text-slate-700 dark:text-slate-300 font-bold hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="O'chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Branch Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBranch ? 'Zavodni Tahrirlash' : 'Yangi Zavod Yaratish'}
        subtitle="Zavod rekvizitlari va rahbar ma'lumotlarini kiriting"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              Zavod Nomi *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="masalan: Toshkent Markaziy Filiali"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500/50 text-slate-900 dark:text-white placeholder-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              Manzili *
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Toshkent sh., Yunusobod t., Amir Temur ko'chasi 108"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500/50 text-slate-900 dark:text-white placeholder-slate-500"
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 font-bold hover:text-slate-900 dark:text-white hover:bg-slate-100 dark:bg-white/5 rounded-xl transition-colors"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-black bg-blue-500 hover:bg-blue-400 rounded-xl shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
            >
              Saqlash
            </button>
          </div>
        </form>
      </Modal>

      {/* Branch Staff Modal */}
      {selectedBranch && (
        <Modal
          isOpen={!!selectedBranch}
          onClose={() => setSelectedBranch(null)}
          title={`${selectedBranch.name} xodimlari`}
          subtitle="Filialdagi xodimlar ro'yxati va ularning reytinglari"
          maxWidth="2xl"
        >
          {drawerLoading ? (
            <TableSkeleton rows={3} />
          ) : branchEmployees.length === 0 ? (
            <EmptyState description="Ushbu filialga hali xodimlar biriktirilmagan." />
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {branchEmployees.map((emp) => (
                <div key={emp.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-700 dark:text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-sm shrink-0">
                      {emp.firstName ? emp.firstName[0].toUpperCase() : 'X'}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {emp.firstName} {emp.lastName}
                      </div>
                      <div className="text-[11px] text-slate-700 dark:text-slate-300 font-bold">
                        {emp.position}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-extrabold text-amber-500 flex items-center gap-1 justify-end">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{emp.averageRating} ⭐</span>
                    </div>
                    <span className="text-[10px] text-slate-700 dark:text-slate-300 font-bold">
                      {emp.totalRatingsCount} ta baho
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};
