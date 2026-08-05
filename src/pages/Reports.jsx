import React, { useEffect, useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  FileText,
  Printer,
  Calendar,
  Search,
} from 'lucide-react';
import { api } from '../services/api';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { TableSkeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';

export const Reports = () => {
  const [reportType, setReportType] = useState('monthly');
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [branches, setBranches] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [brs, emps, rats] = await Promise.all([
        api.getBranches(),
        api.getEmployees(),
        api.getRatings(),
      ]);
      setBranches(brs);
      setEmployees(emps);
      setRatings(rats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter ratings according to selected date criteria & branch
  const getFilteredReportData = () => {
    let list = ratings;

    if (selectedBranchId) {
      list = list.filter((r) => r.branchId === selectedBranchId);
    }

    const today = new Date();
    if (reportType === 'daily') {
      const todayStr = today.toISOString().split('T')[0];
      list = list.filter((r) => r.date === todayStr);
    } else if (reportType === 'weekly') {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      list = list.filter((r) => new Date(r.date) >= lastWeek);
    } else if (reportType === 'monthly') {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      list = list.filter((r) => new Date(r.date) >= startOfMonth);
    } else if (reportType === 'yearly') {
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      list = list.filter((r) => new Date(r.date) >= startOfYear);
    } else if (reportType === 'custom' && startDate && endDate) {
      const s = new Date(startDate);
      const e = new Date(endDate);
      list = list.filter((r) => {
        const d = new Date(r.date);
        return d >= s && d <= e;
      });
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.employeeName.toLowerCase().includes(q) ||
          r.branchName.toLowerCase().includes(q) ||
          r.comment.toLowerCase().includes(q)
      );
    }

    return list;
  };

  const reportRows = getFilteredReportData();

  // Export Excel (.xlsx)
  const exportToExcel = () => {
    const excelData = reportRows.map((r, i) => ({
      '№': i + 1,
      'Sana': r.date,
      'Xodim': r.employeeName,
      'Filial': r.branchName,
      'Baho (1-5)': `${r.stars} ⭐`,
      'Izoh': r.comment,
      'Baholadi': r.ratedByName,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Hisobot');
    XLSX.writeFile(
      workbook,
      `Filiallar_Hisoboti_${new Date().toISOString().split('T')[0]}.xlsx`
    );
  };

  // Export CSV
  const exportToCSV = () => {
    const headers = ['№,Sana,Xodim,Filial,Baho,Izoh,Baholadi\n'];
    const rows = reportRows.map((r, i) =>
      [
        i + 1,
        `"${r.date}"`,
        `"${r.employeeName}"`,
        `"${r.branchName}"`,
        `"${r.stars}"`,
        `"${r.comment.replace(/"/g, '""')}"`,
        `"${r.ratedByName}"`,
      ].join(',')
    );

    const blob = new Blob([headers.concat(rows.join('\n')).join('')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Filiallar_Hisoboti_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Filiallar Xodimlarini Baholash Hisoboti', 14, 20);
    doc.setFontSize(10);
    doc.text(`Yaratilgan sana: ${new Date().toLocaleDateString()}`, 14, 28);

    let y = 40;
    doc.setFontSize(9);
    doc.text('№', 14, y);
    doc.text('Sana', 24, y);
    doc.text('Xodim', 50, y);
    doc.text('Filial', 100, y);
    doc.text('Baho', 150, y);

    y += 6;
    doc.line(14, y, 195, y);
    y += 6;

    reportRows.forEach((r, idx) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(`${idx + 1}`, 14, y);
      doc.text(r.date, 24, y);
      doc.text(r.employeeName.substring(0, 22), 50, y);
      doc.text(r.branchName.substring(0, 22), 100, y);
      doc.text(`${r.stars} yulduz`, 150, y);
      y += 8;
    });

    doc.save(`Hisobot_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Print format
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-400" />
            <span>Tizim Hisobotlari Markazi</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Kunlik, haftalik, oylik va yillik hisobotlarni shakllantirish va export qilish
          </p>
        </div>

        {/* Action Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Excel (.xlsx)</span>
          </button>

          <button
            onClick={exportToPDF}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30 font-bold text-xs transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>PDF</span>
          </button>

          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white font-bold text-xs transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white font-semibold text-xs hover:bg-slate-200 dark:bg-white/10 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Chop etish</span>
          </button>
        </div>
      </div>

      {/* Report Options & Filter Controls */}
      <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#121214] border border-slate-200 dark:border-white/5 shadow-xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
              Hisobot turi:
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="daily" className="bg-white dark:bg-[#121214] text-slate-900 dark:text-white">Kunlik Hisobot</option>
              <option value="weekly" className="bg-white dark:bg-[#121214] text-slate-900 dark:text-white">Haftalik Hisobot</option>
              <option value="monthly" className="bg-white dark:bg-[#121214] text-slate-900 dark:text-white">Oylik Hisobot</option>
              <option value="yearly" className="bg-white dark:bg-[#121214] text-slate-900 dark:text-white">Yillik Hisobot</option>
              <option value="custom" className="bg-white dark:bg-[#121214] text-slate-900 dark:text-white">Ixtiyoriy sana oralig'i</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
              Filial bo'yicha filter:
            </label>
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-white dark:bg-[#121214] text-slate-900 dark:text-white">Barcha Filiallar</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id} className="bg-white dark:bg-[#121214] text-slate-900 dark:text-white">
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
              Qidirish:
            </label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Xodim yoki filial nomi..."
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-emerald-500/50 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {reportType === 'custom' && (
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Boshlanish:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">—</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tugash:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Report Table */}
      {loading ? (
        <TableSkeleton rows={5} />
      ) : reportRows.length === 0 ? (
        <EmptyState description="Ushbu davr bo'yicha hisobot ma'lumotlari topilmadi." />
      ) : (
        <div className="bg-white dark:bg-[#121214] rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl overflow-hidden printable-area">
          <div className="p-4 bg-slate-100 dark:bg-white/5 border-b border-slate-200 dark:border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
            <span>
              Hisobot Yozuvlari Soni: {reportRows.length} ta yozuv
            </span>
            <span className="text-emerald-400 font-mono">
              O'rtacha Tizim Balli:{' '}
              {(
                reportRows.reduce((s, r) => s + r.stars, 0) / reportRows.length
              ).toFixed(1)}{' '}
              ⭐
            </span>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-white/5">
                <tr>
                  <th className="px-4 py-3">№</th>
                  <th className="px-4 py-3">Sana</th>
                  <th className="px-4 py-3">Xodim</th>
                  <th className="px-4 py-3">Filial</th>
                  <th className="px-4 py-3">Qo'yilgan Baho</th>
                  <th className="px-4 py-3">Menejer Izohi</th>
                  <th className="px-4 py-3">Baholadi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium text-slate-700 dark:text-slate-200">
                {reportRows.map((r, idx) => (
                  <tr key={r.id} className="hover:bg-slate-100 dark:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-slate-500 font-mono">{idx + 1}</td>
                    <td className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">
                      {r.date}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                      {r.employeeName}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{r.branchName}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                        {r.stars} ⭐
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 italic max-w-xs truncate">
                      "{r.comment}"
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{r.ratedByName}</td>
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
