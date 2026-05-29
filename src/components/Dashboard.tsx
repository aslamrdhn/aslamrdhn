/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Product, RawMaterial, FinanceLog, AppConfig } from '../types';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Percent, 
  AlertTriangle, 
  Phone, 
  Sparkles, 
  RefreshCw,
  ShoppingBag,
  Clock
} from 'lucide-react';

interface DashboardProps {
  products: Product[];
  rawMaterials: RawMaterial[];
  financeLogs: FinanceLog[];
  appConfig: AppConfig;
  onRefresh: () => void;
}

export default function Dashboard({ products, rawMaterials, financeLogs, appConfig, onRefresh }: DashboardProps) {
  const [aiInsight, setAiInsight] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) + ' WIB');
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Hitung total pemasukan & pengeluaran dari history log keuangan
  const totalIncome = financeLogs
    .filter(log => log.type === 'income')
    .reduce((sum, log) => sum + log.amount, 0);

  const totalExpense = financeLogs
    .filter(log => log.type === 'expense')
    .reduce((sum, log) => sum + log.amount, 0);

  const netProfit = totalIncome - totalExpense;
  const marginPercentage = totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0;

  // Deteksi bahan baku kritis & produk kritis
  const lowMaterials = rawMaterials.filter(m => m.stockQuantity <= m.warningLimit);
  const lowProducts = products.filter(p => p.stock <= p.warningLimit);
  const totalWarnings = lowMaterials.length + lowProducts.length;

  const triggerAiAnalysis = async () => {
    const savedStore = localStorage.getItem('aslam_ledger_current_store');
    const tenantId = savedStore ? JSON.parse(savedStore).id : 'aslam-brew';

    setLoadingAi(true);
    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Tenant-Id': tenantId
        }
      });
      const data = await response.json();
      if (data.success) {
        setAiInsight(data.insight);
      } else {
        setAiInsight(data.message || 'Gagal memanggil model pintar.');
      }
    } catch (err) {
      setAiInsight('Error menghubungi server untuk analisis AI. Pastikan server aktif dan kunci API valid.');
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="space-y-6" id="dashboard-tab">
      {/* Header Dashboard */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight" id="db-title">
            Dashboard Utama
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Pantau ringkasan performa finansial dan stok kafe Anda secara real-time.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-slate-400 uppercase font-mono tracking-wider font-semibold">WAKTU SISTEM</p>
            <p className="text-sm font-mono font-medium text-slate-700">{currentTime || 'Loading...'}</p>
          </div>
          <button 
            id="refresh-state-btn"
            onClick={onRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition-all"
          >
            <RefreshCw size={16} />
            Muat Ulang Data
          </button>
        </div>
      </div>

      {/* Grid Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card Pemasukan */}
        <div className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-2xl border border-emerald-100 shadow-xs relative overflow-hidden" id="stat-income">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Total Pemasukan</p>
              <h3 className="text-2xl font-bold font-mono text-emerald-950 mt-2">
                Rp {totalIncome.toLocaleString('id-ID')}
              </h3>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-600">
              <TrendingUp size={22} />
            </div>
          </div>
          <p className="text-xs text-emerald-600 mt-4 flex items-center gap-1">
            <span>● Kas, Debit, QRIS terintegrasi aman</span>
          </p>
        </div>

        {/* Card Pengeluaran */}
        <div className="bg-gradient-to-br from-rose-50 to-white p-6 rounded-2xl border border-rose-100 shadow-xs relative overflow-hidden" id="stat-expense">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Total Pengeluaran</p>
              <h3 className="text-2xl font-bold font-mono text-rose-950 mt-2">
                Rp {totalExpense.toLocaleString('id-ID')}
              </h3>
            </div>
            <div className="p-3 bg-rose-500/10 rounded-xl text-rose-600">
              <TrendingDown size={22} />
            </div>
          </div>
          <p className="text-xs text-rose-500 mt-4">
            Operasional & restok bahan baku
          </p>
        </div>

        {/* Card Laba Bersih */}
        <div className="bg-gradient-to-br from-sky-50 to-white p-6 rounded-2xl border border-sky-100 shadow-xs relative overflow-hidden" id="stat-profit">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-sky-700 uppercase tracking-wider">Laba Bersih</p>
              <h3 className="text-2xl font-bold font-mono text-sky-950 mt-2">
                Rp {netProfit.toLocaleString('id-ID')}
              </h3>
            </div>
            <div className="p-3 bg-sky-500/10 rounded-xl text-sky-700">
              <DollarSign size={22} />
            </div>
          </div>
          <p className="text-xs text-sky-600 mt-4">
            Keuntungan bersih usaha Anda
          </p>
        </div>

        {/* Card Margin */}
        <div className="bg-gradient-to-br from-slate-50 to-white p-6 rounded-2xl border border-slate-200/60 shadow-xs relative overflow-hidden" id="stat-margin">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Rasio Profit Margin</p>
              <h3 className="text-2xl font-bold font-mono text-slate-900 mt-2">
                {marginPercentage}%
              </h3>
            </div>
            <div className="p-3 bg-slate-200 rounded-xl text-slate-700">
              <Percent size={20} />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4">
            Tingkat efisiensi biaya menu
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Kolom Kiri: Notifikasi Bahan Baku Kritis */}
        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs" id="critical-stock-module">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="text-amber-500 animate-pulse" size={20} />
              <h2 className="text-base font-bold text-slate-900">
                Peringatan Stok & Bahan Baku Kritis
              </h2>
            </div>
            <span className="px-2.5 py-1 text-xs font-bold font-mono bg-amber-50 text-amber-700 rounded-lg">
              {totalWarnings} Butuh Restok
            </span>
          </div>

          {totalWarnings === 0 ? (
            <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <ShoppingBag className="mx-auto text-slate-300 mb-2" size={32} />
              <p className="text-sm font-medium text-slate-600">Seluruh persediaan aman!</p>
              <p className="text-xs text-slate-400 mt-1">Stok produk dan bahan baku berada di atas ambang minimum.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {/* List Bahan Baku Kritis */}
              {lowMaterials.map((mat) => (
                <div key={mat.id} className="p-4 bg-amber-50/50 rounded-xl border border-amber-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span className="font-semibold text-slate-900">{mat.name}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Sisa: <strong className="text-rose-600 font-mono">{mat.stockQuantity} {mat.stockUnit}</strong> (Minimum: {mat.warningLimit} {mat.stockUnit})
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600">
                      <p className="text-[10px] text-slate-400 font-medium">SUPPLIER</p>
                      <p className="font-semibold text-slate-700">{mat.supplierName}</p>
                    </div>
                    <a 
                      href={`https://wa.me/${mat.supplierContact.replace(/[^0-9]/g, '')}?text=Halo%20${encodeURIComponent(mat.supplierName)},%20kami%20ingin%20memesan%20kembali%20${encodeURIComponent(mat.name)}%20untuk%20${encodeURIComponent(appConfig.storeName)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs rounded-lg transition-all"
                    >
                      <Phone size={14} />
                      Hubungi
                    </a>
                  </div>
                </div>
              ))}

              {/* List Produk Jadi Kritis */}
              {lowProducts.map((prod) => (
                <div key={prod.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-slate-400" />
                      <span className="font-semibold text-slate-900">{prod.name} ({prod.category})</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Sisa: <strong className="text-rose-600 font-mono">{prod.stock} Porsi</strong> (Minimum: {prod.warningLimit})
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600">
                      <p className="text-[10px] text-slate-400 font-medium font-semibold">SUPPLIER</p>
                      <p className="font-semibold text-slate-700">{prod.supplierName}</p>
                    </div>
                    <a 
                      href={`https://wa.me/${prod.supplierContact.replace(/[^0-9]/g, '')}?text=Halo%20${encodeURIComponent(prod.supplierName)},%20kami%20ingin%20mesan%20menu%20${encodeURIComponent(prod.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-800 text-white font-medium text-xs rounded-lg transition-all"
                    >
                      <Phone size={14} />
                      WhatsApp
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Kolom Kanan: Kecerdasan Buatan AI Insights */}
        <div className="bg-gradient-to-tr from-slate-900 to-indigo-950 text-white p-6 rounded-2xl border border-slate-800 shadow-lg flex flex-col justify-between min-h-[350px]" id="insight-ai-module">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-505/20 text-indigo-400 rounded-lg">
                  <Sparkles size={18} className="animate-spin-slow" />
                </div>
                <h3 className="text-sm font-bold tracking-tight text-slate-50 uppercase">Kecerdasan Buatan AI</h3>
              </div>
              <span className="bg-indigo-500/10 text-indigo-300 text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-md">
                Gemini 3.5
              </span>
            </div>
            
            <h2 className="text-lg font-bold text-white tracking-tight mt-1">
              Analisis Pintar Coffee Shop
            </h2>
            <p className="text-slate-300 text-xs mt-1">
              Dapatkan strategi instan menangani stok menipis dan target penjualan bulanan.
            </p>

            <div className="mt-4 text-xs leading-relaxed text-slate-200 bg-white/5 p-4 rounded-xl border border-white/10 max-h-[220px] overflow-y-auto font-sans">
              {loadingAi ? (
                <div className="flex flex-col items-center justify-center py-8 gap-3" id="ai-loading">
                  <RefreshCw className="animate-spin text-slate-400" size={24} />
                  <p className="text-slate-400 text-center animate-pulse">Konsultan AI senior sedang merancang ulasan keuangan dan stok...</p>
                </div>
              ) : aiInsight ? (
                <div className="whitespace-pre-line text-slate-100" id="ai-response-box">
                  {aiInsight}
                </div>
              ) : (
                <p className="text-slate-400 text-center py-6">
                  Klik tombol di bawah ini untuk menghasilkan ulasan bisnis khusus berdasarkan kondisi keuangan, stok bahan baku, dan supplier Anda secara otomatis.
                </p>
              )}
            </div>
          </div>

          <button
            id="generate-ai-insight-btn"
            disabled={loadingAi}
            onClick={triggerAiAnalysis}
            className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700/50 text-white text-sm font-semibold rounded-xl transition-all shadow-md cursor-pointer hover:shadow-indigo-500/20"
          >
            <Sparkles size={16} />
            {aiInsight ? 'Hubungkan AI & Analisis Lagi' : 'Hasilkan Rekomendasi Bisnis'}
          </button>
        </div>
      </div>
    </div>
  );
}
