import React, { useEffect, useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Building2,
  Briefcase,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  Star,
} from 'lucide-react';
import { api } from '../services/api';
import { Modal } from '../components/Modal';
import { TableSkeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import { StarRating } from '../components/StarRating';
import { useAuth } from '../context/AuthContext';
import { subscribeToUpdates } from '../services/sse';

export const Employees = ({ globalQuery }) => {
  const { hasPermission } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [search, setSearch] = useState('');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('');

  // Add/Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    phone: '',
    position: '',
    branchId: '',
    branchName: '',
    avatar: '',
    username: '',
    password: '',
    status: 'Faol',
    hireDate: new Date().toISOString().split('T')[0],
  });

  // Employee Profile Modal
  const [profileEmp, setProfileEmp] = useState(null);
  const [profileRatings, setProfileRatings] = useState([]);
  const [profileLoading, setProfileLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [emps, brs] = await Promise.all([api.getEmployees(), api.getBranches()]);
      setEmployees(emps);
      setBranches(brs);
      if (brs.length > 0 && !formData.branchId) {
        setFormData((prev) => ({ ...prev, branchId: brs[0].id, branchName: brs[0].name }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const handleDataUpdate = (data) => {
      if (data.type === 'employees' || data.type === 'branches') {
        fetchData();
      }
    };

    const unsubscribe = subscribeToUpdates(handleDataUpdate);

    return () => {
      unsubscribe();
    };
  }, []);

  const handleOpenAddModal = () => {
    setEditingEmp(null);
    setFormData({
      firstName: '',
      lastName: '',
      middleName: '',
      phone: '',
      position: '',
      branchId: branches[0]?.id || '',
      branchName: branches[0]?.name || '',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      username: '',
      password: '',
      status: 'Faol',
      hireDate: new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (emp) => {
    setEditingEmp(emp);
    setFormData({
      firstName: emp.firstName,
      lastName: emp.lastName,
      middleName: emp.middleName,
      phone: emp.phone,
      position: emp.position,
      branchId: emp.branchId,
      branchName: emp.branchName,
      avatar: emp.avatar,
      username: emp.username,
      password: '',
      status: emp.status,
      hireDate: emp.hireDate,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const selectedBranch = branches.find((b) => b.id === formData.branchId);
      const payload = {
        ...formData,
        branchName: selectedBranch ? selectedBranch.name : formData.branchName,
      };

      if (editingEmp) {
        await api.updateEmployee(editingEmp.id, payload);
      } else {
        await api.createEmployee(payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.message || 'Xatolik yuz berdi');
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Xodimni o'chirishni tasdiqlaysizmi?")) {
      try {
        await api.deleteEmployee(id);
        fetchData();
      } catch (err) {
        alert(err.message || "O'chirishda xatolik");
      }
    }
  };

  const handleViewProfile = async (emp) => {
    setProfileEmp(emp);
    setProfileLoading(true);
    try {
      const ratings = await api.getRatings({ employeeId: emp.id });
      setProfileRatings(ratings);
    } catch (e) {
      console.error(e);
    } finally {
      setProfileLoading(false);
    }
  };

  const activeSearch = globalQuery || search;

  const filteredEmployees = employees.filter((emp) => {
    const fullName = `${emp.firstName} ${emp.lastName} ${emp.middleName}`.toLowerCase();
    const matchesSearch =
      fullName.includes(activeSearch.toLowerCase()) ||
      emp.position.toLowerCase().includes(activeSearch.toLowerCase()) ||
      emp.phone.includes(activeSearch);
    const matchesBranch =
      !selectedBranchFilter || emp.branchId === selectedBranchFilter;
    const matchesStatus =
      !selectedStatusFilter || emp.status === selectedStatusFilter;
    return matchesSearch && matchesBranch && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-400" />
            <span>Xodimlar Katalogi</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Barcha filiallar xodimlari ro'yxati, lavozimlari va shaxsiy kartochkalari
          </p>
        </div>

        {hasPermission('xodim_add') && (
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Xodim Qo'shish</span>
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white dark:bg-[#121214] p-4 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ism, familiya yoki telefon..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-emerald-500/50 rounded-full text-slate-100 placeholder-slate-500 focus:outline-none"
          />
        </div>

        <select
          value={selectedBranchFilter}
          onChange={(e) => setSelectedBranchFilter(e.target.value)}
          className="px-3.5 py-2 text-xs bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none font-medium"
        >
          <option value="" className="bg-white dark:bg-[#121214] text-slate-900 dark:text-white">Barcha Filiallar</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id} className="bg-white dark:bg-[#121214] text-slate-900 dark:text-white">
              {b.name}
            </option>
          ))}
        </select>

        <select
          value={selectedStatusFilter}
          onChange={(e) => setSelectedStatusFilter(e.target.value)}
          className="px-3.5 py-2 text-xs bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none font-medium"
        >
          <option value="" className="bg-white dark:bg-[#121214] text-slate-900 dark:text-white">Barcha Holatlar</option>
          <option value="Faol" className="bg-white dark:bg-[#121214] text-slate-900 dark:text-white">Faol</option>
          <option value="Ta'tilda" className="bg-white dark:bg-[#121214] text-slate-900 dark:text-white">Ta'tilda</option>
          <option value="Nofaol" className="bg-white dark:bg-[#121214] text-slate-900 dark:text-white">Nofaol</option>
        </select>
      </div>

      {/* Employee Table */}
      {loading ? (
        <TableSkeleton rows={5} />
      ) : filteredEmployees.length === 0 ? (
        <EmptyState
          title="Xodimlar topilmadi"
          description="Tanlangan mezonlarga mos keladigan xodim topilmadi."
          action={
            hasPermission('xodim_add')
              ? { label: "Xodim qo'shish", onClick: handleOpenAddModal }
              : undefined
          }
        />
      ) : (
        <div className="bg-white dark:bg-[#121214] rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-white/10">
                <tr>
                  <th className="px-5 py-4">Xodim</th>
                  <th className="px-5 py-4">Filial</th>
                  <th className="px-5 py-4">Lavozim</th>
                  <th className="px-5 py-4">Telefon</th>
                  <th className="px-5 py-4 text-center">O'rtacha Baho</th>
                  <th className="px-5 py-4">Holati</th>
                  <th className="px-5 py-4 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium text-slate-700 dark:text-slate-200">
                {filteredEmployees.map((emp) => (
                  <tr
                    key={emp.id}
                    className="hover:bg-slate-100 dark:bg-white/5 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-sm shrink-0">
                          {emp.firstName ? emp.firstName[0].toUpperCase() : 'X'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">
                            {emp.firstName} {emp.lastName}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">
                            {emp.middleName}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300">
                        <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                        {emp.branchName}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-300">
                        <Briefcase className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                        {emp.position}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 font-mono">
                      {emp.phone}
                    </td>

                    <td className="px-5 py-3.5 text-center">
                      <div className="inline-flex items-center gap-1 font-extrabold text-amber-400 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{emp.averageRating}</span>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          emp.status === 'Faol'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : emp.status === "Ta'tilda"
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {emp.status === 'Faol' && <CheckCircle2 className="w-3 h-3" />}
                        {emp.status === "Ta'tilda" && <Clock className="w-3 h-3" />}
                        {emp.status === 'Nofaol' && <XCircle className="w-3 h-3" />}
                        {emp.status}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleViewProfile(emp)}
                          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                          title="Profil va baholar"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {hasPermission('xodim_edit') && (
                          <button
                            onClick={() => handleOpenEditModal(emp)}
                            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-slate-100 dark:bg-white/5 rounded-lg transition-colors"
                            title="Tahrirlash"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}

                        {hasPermission('xodim_delete') && (
                          <button
                            onClick={() => handleDelete(emp.id)}
                            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                            title="O'chirish"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Employee Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEmp ? 'Xodimni Tahrirlash' : "Yangi Xodim Qo'shish"}
        subtitle="Xodimning shaxsiy va xizmat ma'lumotlarini kiriting"
        maxWidth="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Ism *
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Jamshid"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-emerald-500/50 text-slate-900 dark:text-white placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Familiya *
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Narzullayev"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-emerald-500/50 text-slate-900 dark:text-white placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Otasining ismi
              </label>
              <input
                type="text"
                value={formData.middleName}
                onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                placeholder="G'ofurovich"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-emerald-500/50 text-slate-900 dark:text-white placeholder-slate-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Filial *
              </label>
              <select
                required
                value={formData.branchId}
                onChange={(e) => {
                  const br = branches.find((b) => b.id === e.target.value);
                  setFormData({
                    ...formData,
                    branchId: e.target.value,
                    branchName: br ? br.name : '',
                  });
                }}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none text-slate-900 dark:text-white font-medium"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id} className="bg-white dark:bg-[#121214] text-slate-900 dark:text-white">
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Lavozim *
              </label>
              <input
                type="text"
                required
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="masalan: Katta sotuvchi menejer"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-emerald-500/50 text-slate-900 dark:text-white placeholder-slate-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Telefon *
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+998 90 123 45 67"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-emerald-500/50 text-slate-900 dark:text-white placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Ishga kirgan sana
              </label>
              <input
                type="date"
                value={formData.hireDate}
                onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-emerald-500/50 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Tizim Logini
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="jamshid_n"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-emerald-500/50 text-slate-900 dark:text-white placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Tizim Paroli
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={editingEmp ? "O'zgartirmaslik uchun bo'sh qoldiring" : "123456"}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-emerald-500/50 text-slate-900 dark:text-white placeholder-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              Holati
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="w-full px-3.5 py-2.5 text-xs bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none text-slate-900 dark:text-white font-medium"
            >
              <option value="Faol" className="bg-white dark:bg-[#121214] text-slate-900 dark:text-white">Faol</option>
              <option value="Ta'tilda" className="bg-white dark:bg-[#121214] text-slate-900 dark:text-white">Ta'tilda</option>
              <option value="Nofaol" className="bg-white dark:bg-[#121214] text-slate-900 dark:text-white">Nofaol</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-slate-100 dark:bg-white/5 rounded-xl transition-colors"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-black bg-emerald-500 hover:bg-emerald-400 rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              Saqlash
            </button>
          </div>
        </form>
      </Modal>

      {/* Employee Profile & Ratings Timeline Modal */}
      {profileEmp && (
        <Modal
          isOpen={!!profileEmp}
          onClose={() => setProfileEmp(null)}
          title={`${profileEmp.firstName} ${profileEmp.lastName}`}
          subtitle={`${profileEmp.position} — ${profileEmp.branchName}`}
          maxWidth="2xl"
        >
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-extrabold text-xl shrink-0">
                {profileEmp.firstName ? profileEmp.firstName[0].toUpperCase() : 'X'}
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {profileEmp.firstName} {profileEmp.lastName} {profileEmp.middleName}
                </div>
                <div className="text-xs text-emerald-400 font-semibold">
                  {profileEmp.position} ({profileEmp.branchName})
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span>📞 {profileEmp.phone}</span>
                  <span>📅 Ishga kirgan: {profileEmp.hireDate}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                Baholashlar Tarixi ({profileRatings.length} ta)
              </h4>

              {profileLoading ? (
                <TableSkeleton rows={3} />
              ) : profileRatings.length === 0 ? (
                <EmptyState description="Ushbu xodimga hali baho qo'yilmagan." />
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                  {profileRatings.map((r) => (
                    <div
                      key={r.id}
                      className="p-3.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <StarRating value={r.stars} readonly size="sm" showLabel />
                          <span className="text-[10px] text-slate-500 font-mono">({r.date})</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                          "{r.comment}"
                        </p>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          Baholadi: {r.ratedByName}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
