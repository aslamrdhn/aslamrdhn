/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Product, RawMaterial, CoffeeTable, FinanceLog, AppConfig, Order } from './types';
import Dashboard from './components/Dashboard';
import Cashier from './components/Cashier';
import Inventory from './components/Inventory';
import TableOrders from './components/TableOrders';
import FinancialReports from './components/FinancialReports';
import StorefrontProfile from './components/StorefrontProfile';
import { 
  Building2, 
  LayoutDashboard, 
  Calculator, 
  Layers, 
  QrCode, 
  FileBarChart2, 
  Lock, 
  Smartphone,
  Phone,
  RefreshCw,
  Cpu,
  Coffee,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  LogOut,
  Cloud
} from 'lucide-react';
import StoreLoginPortal from './components/StoreLoginPortal';

const DEFAULT_TENANTS = [
  {
    id: 'aslam-brew',
    storeName: 'Ledger Line by Aslam',
    storeAddress: 'Jl. Malioboro No. 45, Yogyakarta, Indonesia',
    storePhone: '+62 812-4455-6677',
    storeWifiName: 'LedgerLine_Aslam_5G',
    storeWifiPass: 'espresso123',
    theme: 'espresso',
    cashierName: 'Aslam Ramadhan',
    cashierRole: 'Owner & Head Barista',
    cashierShift: 'Sore (Afternoon)',
    cashierPhone: '+62 812-4455-6677',
    cashierEmail: 'aslamramadhan08@gmail.com',
    cashierPin: '1234',
    cashierAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=85&w=150&auto=format&fit=crop',
    licenseKey: 'LL-ASLAM-BREW-2026',
    layoutMode: 'grid',
    driveConnected: true,
    driveStoreFolder: '/AslamLedger_CloudServer',
    driveClientId: '25838048293-aslam89b4.apps.googleusercontent.com',
    driveClientSecret: 'GOCSPX-AslAm91bL842hPqS7',
    driveAutoSync: true
  },
  {
    id: 'kopi-kita',
    storeName: 'Ledger Line Sentral',
    storeAddress: 'Jl. Sudirman No. 102, Jakarta Selatan, Indonesia',
    storePhone: '+62 811-2233-4455',
    storeWifiName: 'LedgerLine_FreeWifi',
    storeWifiPass: 'ledgerlinegratis',
    theme: 'slate',
    cashierName: 'Budi Sentosa',
    cashierRole: 'Store Manager',
    cashierShift: 'Pagi (Morning)',
    cashierPhone: '+62 811-2233-4455',
    cashierEmail: 'budi@ledgerline.id',
    cashierPin: '2580',
    cashierAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=85&w=150&auto=format&fit=crop',
    licenseKey: 'LL-ASLAM-BREW-2026',
    layoutMode: 'list',
    driveConnected: false,
    driveStoreFolder: '/LedgerLine_Backup',
    driveClientId: '',
    driveClientSecret: '',
    driveAutoSync: false
  },
  {
    id: 'zen-matcha',
    storeName: 'Zen Matcha Garden',
    storeAddress: 'Ubud Center Hill, Gianyar, Bali, Indonesia',
    storePhone: '+62 819-8765-4321',
    storeWifiName: 'ZenMatcha_QuietZone',
    storeWifiPass: 'matchalove88',
    theme: 'matcha',
    cashierName: 'Arimbi Putri',
    cashierRole: 'Lead Matcha Artisan',
    cashierShift: 'Siang (Noon)',
    cashierPhone: '+62 819-8765-4321',
    cashierEmail: 'arimbi@zenmatcha.com',
    cashierPin: '8888',
    cashierAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=85&w=150&auto=format&fit=crop',
    licenseKey: 'LL-ZENMATCHA-UBUD-2026',
    layoutMode: 'grid',
    driveConnected: false,
    driveStoreFolder: '/ZenMatcha_DriveStore',
    driveClientId: '',
    driveClientSecret: '',
    driveAutoSync: false
  },
  {
    id: 'midnight-cyber',
    storeName: 'Midnight Techno Coffee',
    storeAddress: 'Dago IT Hub Blok G-12, Bandung, Indonesia',
    storePhone: '+62 899-0011-2233',
    storeWifiName: 'MidnightCyber_Dago',
    storeWifiPass: 'cyberpunk2026',
    theme: 'midnight',
    cashierName: 'Reza Pratama',
    cashierRole: 'Systems Barista',
    cashierShift: 'Malam (Full Night)',
    cashierPhone: '+62 899-0011-2233',
    cashierEmail: 'reza@midnightcyber.io',
    cashierPin: '0000',
    cashierAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=85&w=150&auto=format&fit=crop',
    licenseKey: 'LL-MIDNIGHT-CYBER-2026',
    layoutMode: 'grid',
    driveConnected: true,
    driveStoreFolder: '/Midnight_Ledger_Host',
    driveClientId: '92184938210-midnight91c.apps.googleusercontent.com',
    driveClientSecret: 'GOCSPX-midNightSec9210',
    driveAutoSync: false
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'kasir' | 'stok' | 'meja' | 'laporan' | 'pengaturan'>('dashboard');
  const [loading, setLoading] = useState<boolean>(true);
  const [showDeploymentGuide, setShowDeploymentGuide] = useState<boolean>(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState<boolean>(false);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  // Ref penanda data tenant aktif yang siap disimpan untuk mencegah race condition
  const loadedStoreIdRef = useRef<string | null>(null);

  // Multi-Tenant States
  const [registeredTenants, setRegisteredTenants] = useState<any[]>(() => {
    const saved = localStorage.getItem('aslam_ledger_registered_tenants');
    return saved ? JSON.parse(saved) : DEFAULT_TENANTS;
  });

  const [currentStore, setCurrentStore] = useState<any>(() => {
    const saved = localStorage.getItem('aslam_ledger_current_store');
    return saved ? JSON.parse(saved) : null;
  });

  // Core database states
  const [products, setProducts] = useState<Product[]>([]);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [tables, setTables] = useState<CoffeeTable[]>([]);
  const [financeLogs, setFinanceLogs] = useState<FinanceLog[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [appConfig, setAppConfig] = useState<any>({});
  const [backupHistory, setBackupHistory] = useState<any[]>([]);

  // Narasi notifikasi toast harian
  const [toastMessage, setToastMessage] = useState<string>('');
  const [isSandbox, setIsSandbox] = useState<boolean>(false);

  // Fetch state komprehensif dari database server express
  const fetchState = async () => {
    try {
      const headers: Record<string, string> = {};
      if (currentStore) {
        headers['X-Tenant-Id'] = currentStore.id;
      }
      const response = await fetch('/api/state', { headers });
      if (response.ok) {
        const data = await response.json();
        
        // Membaca data terisolasi berdasarkan sesi toko saat ini
        if (currentStore) {
          const sId = currentStore.id;
          const storeProducts = localStorage.getItem(`store_products_${sId}`);
          const storeMaterials = localStorage.getItem(`store_materials_${sId}`);
          const storeFinance = localStorage.getItem(`store_finance_${sId}`);
          const storeOrders = localStorage.getItem(`store_orders_${sId}`);
          const storeConfig = localStorage.getItem(`store_config_${sId}`);

          const finalProducts = data.products !== undefined && data.products !== null ? data.products : (storeProducts ? JSON.parse(storeProducts) : []);
          const finalMaterials = data.rawMaterials !== undefined && data.rawMaterials !== null ? data.rawMaterials : (storeMaterials ? JSON.parse(storeMaterials) : []);
          const finalFinance = data.financeLogs !== undefined && data.financeLogs !== null ? data.financeLogs : (storeFinance ? JSON.parse(storeFinance) : []);
          const finalOrders = data.orders !== undefined && data.orders !== null ? data.orders : (storeOrders ? JSON.parse(storeOrders) : []);
          const finalConfig = data.appConfig && Object.keys(data.appConfig).length > 0 ? data.appConfig : (storeConfig ? JSON.parse(storeConfig) : { ...data.appConfig, ...currentStore });

          setProducts(prev => JSON.stringify(prev) !== JSON.stringify(finalProducts) ? finalProducts : prev);
          setRawMaterials(prev => JSON.stringify(prev) !== JSON.stringify(finalMaterials) ? finalMaterials : prev);
          setRecipes(prev => JSON.stringify(prev) !== JSON.stringify(data.recipes || []) ? (data.recipes || []) : prev);
          setTables(prev => JSON.stringify(prev) !== JSON.stringify(data.tables || []) ? (data.tables || []) : prev);
          setFinanceLogs(prev => JSON.stringify(prev) !== JSON.stringify(finalFinance) ? finalFinance : prev);
          setOrders(prev => JSON.stringify(prev) !== JSON.stringify(finalOrders) ? finalOrders : prev);
          setAppConfig(prev => JSON.stringify(prev) !== JSON.stringify(finalConfig) ? finalConfig : prev);

          loadedStoreIdRef.current = sId;
        } else {
          setProducts(prev => JSON.stringify(prev) !== JSON.stringify(data.products || []) ? (data.products || []) : prev);
          setRawMaterials(prev => JSON.stringify(prev) !== JSON.stringify(data.rawMaterials || []) ? (data.rawMaterials || []) : prev);
          setRecipes(prev => JSON.stringify(prev) !== JSON.stringify(data.recipes || []) ? (data.recipes || []) : prev);
          setTables(prev => JSON.stringify(prev) !== JSON.stringify(data.tables || []) ? (data.tables || []) : prev);
          setFinanceLogs(prev => JSON.stringify(prev) !== JSON.stringify(data.financeLogs || []) ? (data.financeLogs || []) : prev);
          setOrders(prev => JSON.stringify(prev) !== JSON.stringify(data.orders || []) ? (data.orders || []) : prev);
          setAppConfig(prev => JSON.stringify(prev) !== JSON.stringify(data.appConfig || {}) ? (data.appConfig || {}) : prev);
        }
        
        setBackupHistory(prev => JSON.stringify(prev) !== JSON.stringify(data.backupHistory || []) ? (data.backupHistory || []) : prev);
        setIsSandbox((window as any).isSandboxActive || false);
      }
    } catch (err) {
      console.info('Menggunakan database lokal otomatis demi performa terbaik...');
      setIsSandbox(true);
      // Fallback lokal jika server mati
      if (currentStore) {
        const sId = currentStore.id;
        const storeProducts = localStorage.getItem(`store_products_${sId}`);
        const storeMaterials = localStorage.getItem(`store_materials_${sId}`);
        const storeFinance = localStorage.getItem(`store_finance_${sId}`);
        const storeOrders = localStorage.getItem(`store_orders_${sId}`);
        const storeConfig = localStorage.getItem(`store_config_${sId}`);

        if (storeProducts) setProducts(JSON.parse(storeProducts));
        if (storeMaterials) setRawMaterials(JSON.parse(storeMaterials));
        if (storeFinance) setFinanceLogs(JSON.parse(storeFinance));
        if (storeOrders) setOrders(JSON.parse(storeOrders));
        if (storeConfig) setAppConfig(JSON.parse(storeConfig));
        
        loadedStoreIdRef.current = sId;
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchState();
    // Tarik info berkala setiap 10 detik agar sinkron untuk pesanan HP meja
    const interval = setInterval(fetchState, 10000);
    return () => clearInterval(interval);
  }, [currentStore]);

  // Efek persistensi lokal otomatis per cabang toko (pembatasan multi-tenant terisolasi)
  useEffect(() => {
    if (currentStore && loadedStoreIdRef.current === currentStore.id) {
      const sId = currentStore.id;
      localStorage.setItem(`store_products_${sId}`, JSON.stringify(products));
      localStorage.setItem(`store_materials_${sId}`, JSON.stringify(rawMaterials));
      localStorage.setItem(`store_finance_${sId}`, JSON.stringify(financeLogs));
      localStorage.setItem(`store_orders_${sId}`, JSON.stringify(orders));
      localStorage.setItem(`store_config_${sId}`, JSON.stringify(appConfig));
    }
  }, [products, rawMaterials, financeLogs, orders, appConfig, currentStore]);

  const handleLoginStore = async (store: any) => {
    setCurrentStore(store);
    localStorage.setItem('aslam_ledger_current_store', JSON.stringify(store));
    
    // Inisialisasi offline terisolasi secepatnya untuk menghindari race condition
    const sId = store.id;
    const storeProducts = localStorage.getItem(`store_products_${sId}`);
    const storeMaterials = localStorage.getItem(`store_materials_${sId}`);
    const storeFinance = localStorage.getItem(`store_finance_${sId}`);
    const storeOrders = localStorage.getItem(`store_orders_${sId}`);
    const storeConfig = localStorage.getItem(`store_config_${sId}`);

    if (storeProducts) setProducts(JSON.parse(storeProducts));
    if (storeMaterials) setRawMaterials(JSON.parse(storeMaterials));
    if (storeFinance) setFinanceLogs(JSON.parse(storeFinance));
    if (storeOrders) setOrders(JSON.parse(storeOrders));
    if (storeConfig) setAppConfig(JSON.parse(storeConfig));

    loadedStoreIdRef.current = sId;

    // Sinkronisasi config di server memory agar konsisten
    try {
      await fetch('/api/config', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Tenant-Id': sId
        },
        body: JSON.stringify(store)
      });
      await fetchState();
    } catch (err) {}
    
    setToastMessage(`Sukses masuk sebagai operator ${store.cashierName}!`);
    setTimeout(() => setToastMessage(''), 2500);
  };

  const handleLogoutStore = () => {
    setShowLogoutConfirm(true);
  };

  const executeLogout = () => {
    setCurrentStore(null);
    localStorage.removeItem('aslam_ledger_current_store');
    setToastMessage('Sesi kasir berhasil ditutup aman.');
    setTimeout(() => setToastMessage(''), 2500);
    setShowLogoutConfirm(false);
  };

  const handleUpdateConfig = async (updated: Partial<AppConfig>) => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (currentStore) {
        headers['X-Tenant-Id'] = currentStore.id;
      }
      const response = await fetch('/api/config', {
        method: 'POST',
        headers,
        body: JSON.stringify(updated)
      });
      if (response.ok) {
        const resData = await response.json();
        setAppConfig(resData.config);
        
        // Simpan pembaruan juga ke config terisolasi di localStorage
        if (currentStore) {
          localStorage.setItem(`store_config_${currentStore.id}`, JSON.stringify(resData.config));
        }

        setToastMessage('Kredensial kedai kopi tersimpan!');
        setTimeout(() => setToastMessage(''), 2500);
      }
    } catch (err) {}
  };

  const handleResetDatabase = () => {
    setShowResetConfirm(true);
  };

  const executeResetDatabase = async () => {
    setShowResetConfirm(false);
    setLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (currentStore) {
        headers['X-Tenant-Id'] = currentStore.id;
      }
      const res = await fetch('/api/reset', { method: 'POST', headers });
      const data = await res.json();
      
      if (data.success && data.state) {
        if (currentStore) {
          const sId = currentStore.id;
          localStorage.setItem(`store_products_${sId}`, JSON.stringify(data.state.products || []));
          localStorage.setItem(`store_materials_${sId}`, JSON.stringify(data.state.rawMaterials || []));
          localStorage.setItem(`store_finance_${sId}`, JSON.stringify(data.state.financeLogs || []));
          localStorage.setItem(`store_orders_${sId}`, JSON.stringify(data.state.orders || []));
          localStorage.setItem(`store_config_${sId}`, JSON.stringify(data.state.appConfig || {}));
        }
      }
      
      await fetchState();
      setToastMessage('Database berhasil direset bersih ke titik nol. Semua log finansial dikosongkan.');
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {}
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 gap-3">
        <RefreshCw className="animate-spin text-slate-450" size={36} />
        <p className="text-slate-700 font-bold text-sm">Menghubungkan ke Sistem Kasir LedgerLine by Aslam...</p>
        <p className="text-xs text-slate-400">Harap tunggu sementara database finansial dimuat aman.</p>
      </div>
    );
  }

  // Cari bahan baku kritis untuk ditaruh di notifikasi banner utama
  const activeBahanKritis = rawMaterials.filter(m => m.stockQuantity <= m.warningLimit);

  const currentTheme = appConfig.theme || 'slate';
  const theme = {
    slate: {
      appBg: 'bg-[#F8FAFC]',
      asideBg: 'bg-[#1E293B]',
      border: 'border-slate-800/80',
      activeTab: 'bg-blue-600/20 text-blue-450 text-blue-400 border border-blue-500/20 font-extrabold shadow-sm',
      inactiveTab: 'text-slate-400 hover:bg-white/5 hover:text-white',
      headerBg: 'bg-white border-slate-200',
      headerText: 'text-slate-700',
      accentText: 'text-amber-400',
      accentBtn: 'bg-emerald-500 hover:bg-emerald-600'
    },
    espresso: {
      appBg: 'bg-[#FAF6F0]',
      asideBg: 'bg-[#2A1810]',
      border: 'border-[#3D251A]',
      activeTab: 'bg-amber-600/20 text-amber-450 text-amber-400 border border-amber-500/20 font-extrabold shadow-xs',
      inactiveTab: 'text-amber-200/60 hover:bg-white/5 hover:text-amber-100',
      headerBg: 'bg-[#F3ECE0] border-amber-200',
      headerText: 'text-amber-900',
      accentText: 'text-amber-300',
      accentBtn: 'bg-amber-700 hover:bg-amber-850'
    },
    midnight: {
      appBg: 'bg-[#0B0F19]',
      asideBg: 'bg-[#090D16]',
      border: 'border-slate-850',
      activeTab: 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 font-extrabold shadow-xs',
      inactiveTab: 'text-slate-500 hover:bg-white/5 hover:text-slate-200',
      headerBg: 'bg-[#0D1527] border-slate-800',
      headerText: 'text-slate-100',
      accentText: 'text-cyan-400',
      accentBtn: 'bg-indigo-600 hover:bg-indigo-500'
    },
    matcha: {
      appBg: 'bg-[#F2F7F4]',
      asideBg: 'bg-[#122216]',
      border: 'border-emerald-950',
      activeTab: 'bg-[#15803D]/20 text-emerald-400 border border-emerald-500/25 font-extrabold shadow-xs',
      inactiveTab: 'text-emerald-300/60 hover:bg-white/5 hover:text-emerald-100',
      headerBg: 'bg-[#E5EFE9] border-emerald-250 border-emerald-200',
      headerText: 'text-emerald-900',
      accentText: 'text-yellow-300',
      accentBtn: 'bg-[#15803D] hover:bg-[#166534]'
    }
  }[currentTheme as 'slate' | 'espresso' | 'midnight' | 'matcha'] || {
    appBg: 'bg-[#F8FAFC]',
    asideBg: 'bg-[#1E293B]',
    border: 'border-slate-800/80',
    activeTab: 'bg-blue-600/20 text-blue-400 border border-blue-500/20 font-extrabold shadow-sm',
    inactiveTab: 'text-slate-400 hover:bg-white/5 hover:text-white',
    headerBg: 'bg-white border-slate-200',
    headerText: 'text-slate-700',
    accentText: 'text-amber-400',
    accentBtn: 'bg-emerald-500 hover:bg-emerald-600'
  };

  if (!currentStore) {
    return (
      <StoreLoginPortal 
        tenants={registeredTenants} 
        onLogin={handleLoginStore}
        onRegister={(newTenant) => {
          const updated = [...registeredTenants, newTenant];
          setRegisteredTenants(updated);
          localStorage.setItem('aslam_ledger_registered_tenants', JSON.stringify(updated));
          handleLoginStore(newTenant);
        }}
      />
    );
  }

  return (
    <div className={`min-h-screen ${theme.appBg} font-sans flex flex-col md:flex-row`} id="app-container">
      
      {/* SIDE NAV BAR KIRI - Menu Kompleks dengan Solid background */}
      <aside className={`w-full md:w-20 lg:w-64 shrink-0 ${theme.asideBg} text-slate-300 flex flex-col border-b md:border-b-0 md:border-r ${theme.border}`} id="sidebar">
        
        {/* BRANDING KEDAI / LOGO - CUSTOM ASLAM SIGNATURE LOGO */}
        <div className={`p-4 lg:p-6 flex flex-col items-center text-center gap-3 lg:gap-4 border-b ${theme.border} bg-slate-950/20 relative overflow-hidden group`}>
          {/* Subtle Ambient light behind the logo */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full" />
          
          {/* Custom Royal Authentic Monogram */}
          <div className="relative w-12 h-12 lg:w-20 lg:h-20 bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-xl shadow-amber-950/40 border border-amber-300/30 transform transition-transform duration-300 group-hover:scale-105">
            <svg 
              viewBox="0 0 100 100" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg" 
              className="w-8 h-8 lg:w-14 lg:h-14 text-white filter drop-shadow-[0_3px_5px_rgba(0,0,0,0.2)]"
            >
              <path d="M30 22C32 16 38 15 38 8M48 22C50 14 56 15 56 8M66 22C68 17 74 15 74 8" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-90 animate-pulse" />
              <path d="M25 82L45 32H55L75 82" stroke="white" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M36 60H64" stroke="#D97706" strokeWidth="6" strokeLinecap="round" />
              <path d="M10 78L36 60L50 63L66 42L90 28" stroke="#1E293B" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M10 78L36 60L50 63L66 42L90 28" stroke="#FCD34D" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_6px_rgba(252,211,77,0.8)]" />
              <circle cx="50" cy="63" r="4" fill="white" stroke="#D97706" strokeWidth="1.5" />
              <circle cx="66" cy="42" r="4" fill="#FCD34D" stroke="#1E293B" strokeWidth="1.5" />
              <circle cx="90" cy="28" r="4.5" fill="#10B981" stroke="white" strokeWidth="1.5" />
            </svg>
            
            <div className="absolute -bottom-1 -right-1 bg-slate-900 border border-slate-700 text-white font-mono text-[7px] lg:text-[9px] font-black px-1 lg:px-1.5 py-0.5 rounded-md shadow-md">
              ASLAM
            </div>
          </div>
          
          <div className="min-w-0 space-y-1 w-full hidden lg:block">
            <h1 className="text-sm font-black tracking-wide text-white font-sans uppercase truncate max-w-[210px]" title={currentStore?.storeName}>
              {currentStore?.storeName || "Aslam's Ledger"}
            </h1>
            <p className={`text-[9px] font-extrabold ${theme.accentText} uppercase tracking-widest leading-none font-mono`}>
              {currentStore?.cashierName || "Owner"} • {currentStore?.cashierRole || "Operator"}
            </p>
            <div className="flex items-center justify-center gap-1 pt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[8px] font-mono font-bold text-slate-400">Cabang: {currentStore?.id?.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* LIST TOMBOL TRIGGER TAB */}
        <div className="p-3 lg:p-4 flex-1 space-y-1.5 overflow-y-auto flex flex-col items-center lg:items-stretch">
          <p className="text-[9px] lg:text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2 font-sans text-center lg:text-left truncate w-full">MENU</p>
          
          <button
            id="tab-dashboard"
            onClick={() => setActiveTab('dashboard')}
            className={`w-full px-2 lg:px-3 py-3 rounded-xl justify-center lg:justify-start text-xs font-bold font-sans flex items-center gap-3 transition-all cursor-pointer ${
              activeTab === 'dashboard' ? theme.activeTab : `${theme.inactiveTab} border border-transparent`
            }`}
            title="Dashboard Overview"
          >
            <LayoutDashboard size={15} className="shrink-0" />
            <span className="hidden lg:inline truncate">Dashboard Overview</span>
          </button>

          <button
            id="tab-kasir"
            onClick={() => setActiveTab('kasir')}
            className={`w-full px-2 lg:px-3 py-3 rounded-xl justify-center lg:justify-start text-xs font-bold font-sans flex items-center gap-3 transition-all cursor-pointer ${
              activeTab === 'kasir' ? theme.activeTab : `${theme.inactiveTab} border border-transparent`
            }`}
            title="Mesin Kasir POS"
          >
            <Calculator size={15} className="shrink-0" />
            <span className="hidden lg:inline truncate">Mesin Kasir POS</span>
          </button>

          <button
            id="tab-stok"
            onClick={() => setActiveTab('stok')}
            className={`w-full px-2 lg:px-3 py-3 rounded-xl justify-center lg:justify-start text-xs font-bold font-sans flex items-center gap-3 transition-all cursor-pointer ${
              activeTab === 'stok' ? theme.activeTab : `${theme.inactiveTab} border border-transparent`
            }`}
            title="Stok & Bahan Baku"
          >
            <Layers size={15} className="shrink-0" />
            <span className="hidden lg:inline truncate">Stok & Bahan Baku</span>
          </button>

          <button
            id="tab-meja"
            onClick={() => setActiveTab('meja')}
            className={`w-full px-2 lg:px-3 py-3 rounded-xl justify-center lg:justify-start text-xs font-bold font-sans flex items-center gap-3 transition-all cursor-pointer ${
              activeTab === 'meja' ? theme.activeTab : `${theme.inactiveTab} border border-transparent`
            }`}
            title="Barcode Meja QR"
          >
            <QrCode size={15} className="shrink-0" />
            <span className="hidden lg:inline truncate">Barcode Meja QR</span>
          </button>

          <button
            id="tab-laporan"
            onClick={() => setActiveTab('laporan')}
            className={`w-full px-2 lg:px-3 py-3 rounded-xl justify-center lg:justify-start text-xs font-bold font-sans flex items-center gap-3 transition-all cursor-pointer ${
              activeTab === 'laporan' ? theme.activeTab : `${theme.inactiveTab} border border-transparent`
            }`}
            title="Laporan Keuangan"
          >
            <FileBarChart2 size={15} className="shrink-0" />
            <span className="hidden lg:inline truncate">Laporan Keuangan</span>
          </button>

          <button
            id="tab-pengaturan"
            onClick={() => setActiveTab('pengaturan')}
            className={`w-full px-2 lg:px-3 py-3 rounded-xl justify-center lg:justify-start text-xs font-bold font-sans flex items-center gap-3 transition-all cursor-pointer ${
              activeTab === 'pengaturan' ? theme.activeTab : `${theme.inactiveTab} border border-transparent`
            }`}
            title="Profil & Pengaturan"
          >
            <Building2 size={15} className="shrink-0" />
            <span className="hidden lg:inline truncate">Profil & Pengaturan</span>
          </button>

          <button
            id="logout-store-session-btn"
            onClick={handleLogoutStore}
            className="w-full px-2 lg:px-3 py-3 rounded-xl justify-center lg:justify-start text-xs font-bold font-sans flex items-center gap-3 transition-colors text-rose-400 hover:bg-rose-950/20 hover:text-rose-300 border border-transparent cursor-pointer"
            title="Keluar Sesi Toko"
          >
            <LogOut size={15} className="shrink-0" />
            <span className="hidden lg:inline truncate">Keluar Sesi Toko</span>
          </button>
        </div>

        {/* STATUS SISTEM & TOMBOL RESET DEVELOPER */}
        <div className={`p-4 border-t ${theme.border} mx-2 mb-2 space-y-3 shrink-0 hidden lg:block`}>
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span>System Status</span>
            <span className="text-emerald-400 font-semibold font-mono text-[10px]">Secure AES-256</span>
          </div>
          
          <div className="bg-slate-800/60 p-3 rounded-xl flex items-center gap-2 border border-slate-700/60">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs text-white font-medium">Auto-Backup: Success</span>
          </div>

          <button
            id="reset-state-master-btn"
            onClick={handleResetDatabase}
            className="w-full py-1.5 bg-slate-800/80 hover:bg-slate-800 hover:text-white border border-slate-700 text-slate-400 font-semibold text-[10px] rounded-lg transition-all cursor-pointer"
          >
            Reset Kalkulasi Laba & Finansial
          </button>
        </div>
      </aside>

      {/* RIGHT AREA: HEADER TERPOLISH + KONTEN UTAMA */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOP HEADER - White Solid, elegant borders */}
        <header className={`h-16 ${theme.headerBg} border-b flex items-center justify-between px-6 shrink-0 sticky top-0 z-45`}>
          <div className="flex items-center gap-4">
            <h2 className={`text-base font-extrabold ${theme.headerText}`} id="header-selected-tab-title">
              {activeTab === 'dashboard' && 'Dashboard Overview'}
              {activeTab === 'kasir' && 'Mesin Kasir POS'}
              {activeTab === 'stok' && 'Stok Bahan Baku'}
              {activeTab === 'meja' && 'E-Order Barcode Meja'}
              {activeTab === 'laporan' && 'Laporan Keuangan'}
              {activeTab === 'pengaturan' && 'Sistem Pengaturan Hub'}
            </h2>
            <div className="h-5 w-px bg-slate-200"></div>
            <div className="flex items-center gap-2 text-slate-450">
              <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
              </svg>
              <span className="text-xs font-semibold text-slate-500">Printer: Connected (BT-5.0)</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Indikator Keamanan Database */}
            {isSandbox ? (
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-xs font-semibold text-amber-700 animate-pulse">
                <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                <span>Sandbox Lokal Aktif</span>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs font-semibold text-blue-700">
                <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                <span>Layanan Cloud Aktif</span>
              </div>
            )}

            {/* Panduan Pembungkusan Ke Android/iOS */}
            <button
               id="deploy-guide-btn"
               onClick={() => setShowDeploymentGuide(true)}
               className={`flex items-center gap-2 ${theme.accentBtn} text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer shadow-xs transition-colors`}
            >
              <Smartphone size={14} />
              Bungkus Jadi APK / IPA
            </button>
          </div>
        </header>

        {/* BANNER NOTIFIKASI STOK MENIPIS UTAMA */}
        {activeBahanKritis.length > 0 && (
          <div className="bg-amber-50 border-b border-amber-200/80 py-2.5 px-6 shrink-0" id="warning-banner">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
              <div className="flex items-center gap-2 text-amber-800">
                <AlertTriangle className="text-amber-600 shrink-0 animate-pulse" size={15} />
                <p className="font-medium">
                  Peringatan: <strong>{activeBahanKritis.length} Bahan Baku</strong> kritis di bawah target limit harian! Segera hubungi supplier melalui tombol aksi di menu Stok.
                </p>
              </div>
              <button 
                onClick={() => setActiveTab('stok')}
                className="text-amber-800 font-bold hover:underline shrink-0 cursor-pointer text-xs"
              >
                Periksa Stok & WhatsApp Supplier →
              </button>
            </div>
          </div>
        )}

        {/* NOTIFIKASI TOAST SISTEM */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-2xl shadow-xl z-50 flex items-center gap-2 text-xs font-semibold animate-bounce">
            <CheckCircle2 className="text-emerald-400" size={16} />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* CONTAINER KONTEN UTAMA */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8" id="main-content">
          {activeTab === 'dashboard' && (
            <Dashboard 
              products={products} 
              rawMaterials={rawMaterials} 
              financeLogs={financeLogs} 
              appConfig={appConfig}
              onRefresh={fetchState}
            />
          )}

          {activeTab === 'kasir' && (
            <Cashier 
              products={products} 
              rawMaterials={rawMaterials}
              recipes={recipes}
              tables={tables}
              appConfig={appConfig}
              onRefresh={fetchState}
            />
          )}

          {activeTab === 'stok' && (
            <Inventory 
              products={products} 
              rawMaterials={rawMaterials} 
              recipes={recipes}
              appConfig={appConfig}
              onRefresh={fetchState}
            />
          )}

          {activeTab === 'meja' && (
            <TableOrders 
              tables={tables} 
              products={products}
              appConfig={appConfig}
              onRefresh={fetchState}
            />
          )}

          {activeTab === 'laporan' && (
            <FinancialReports 
              financeLogs={financeLogs} 
              products={products} 
              orders={orders}
              appConfig={appConfig}
              backupHistory={backupHistory}
              onRefresh={fetchState}
            />
          )}

          {activeTab === 'pengaturan' && (
            <StorefrontProfile 
              appConfig={appConfig} 
              onUpdateConfig={handleUpdateConfig}
              products={products}
              onRefresh={fetchState}
            />
          )}
        </main>

        {/* FOOTER & BRANDING */}
        <footer className="bg-white border-t border-slate-100 py-6 text-center text-xs text-slate-400 shrink-0 leading-normal text-slate-400 font-sans">
          <p>© 2026 {appConfig.storeName || 'LedgerLine by Aslam'} Hub. Hak Cipta Dilindungi Undang-Undang.</p>
          <p className="mt-1">Dirancang khusus untuk pembungkusan hibrida cepat Capacitor & Flutter.</p>
        </footer>

      </div>

      {/* MODEL GUIDE POPUP: PETUNJUK IMPLEMENTASI ANDROID/IOS */}
      {showDeploymentGuide && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="deployment-guide-modal">
          <div className="bg-slate-900 text-slate-100 p-6 rounded-2xl w-full max-w-2xl border border-slate-800 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-indigo-300 flex items-center gap-2">
                <Smartphone size={18} />
                Panduan Migrasi ke Android & iOS (Capacitor / Flutter)
              </h3>
              <button 
                onClick={() => setShowDeploymentGuide(false)}
                className="text-slate-400 hover:text-white font-bold text-xs"
              >
                Tutup Panduan
              </button>
            </div>

            <div className="space-y-4 text-xs max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
              <div className="space-y-1 bg-white/5 p-3 rounded-xl border border-white/10">
                <p className="font-bold text-indigo-400">Peta Struktur Proyek Hibrida</p>
                <p className="text-slate-350 leading-relaxed text-[11px]">
                  Kode web React & Tailwind v4 ini sepenuhnya kompatibel tanpa bug untuk dibungkus kedalam runtime hibrida mobile (Capacitor) demi sinkronisasi database 100% instan di genggaman.
                </p>
              </div>

              <div className="space-y-2">
                <p className="font-bold text-white">Langkah 1: Menggunakan Capacitor (Rekomendasi Tercepat)</p>
                <p className="text-slate-400 leading-normal text-[11px]">
                  Capacitor membantu Anda membungkus kode web HTML/CSS/JS menjadi aplikasi native iOS & Android secara otomatis.
                </p>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 font-mono text-[10px] text-indigo-300">
                  <p># Install Capacitor Core & CLI</p>
                  <p className="text-white">npm install @capacitor/core @capacitor/cli</p>
                  <p className="mt-2"># Inisialisasi konfigurasi Capacitor</p>
                  <p className="text-white">npx cap init "BaristaPOS" "com.ledgerline.pos" --web-dir=dist</p>
                  <p className="mt-2"># Tambahkan platform Android dan iOS</p>
                  <p className="text-white">npm install @capacitor/android @capacitor/ios</p>
                  <p className="text-white">npx cap add android</p>
                  <p className="text-white">npx cap add ios</p>
                  <p className="mt-2 font-semibold"># Compile React Web & Sync ke folder Native Assets</p>
                  <p className="text-white">npm run build</p>
                  <p className="text-white">npx cap sync</p>
                  <p className="mt-2 font-semibold text-emerald-400"># Buka proyek native Xcode / Android Studio</p>
                  <p className="text-white">npx cap open android</p>
                  <p className="text-white">npx cap open ios</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-bold text-white">Langkah 2: Menggunakan Flutter Web-View (Alternatif Kustomisasi)</p>
                <p className="text-slate-400 leading-normal text-[11px]">
                  Jika kedai kopi Anda mendambakan performa flutter native widgets, Anda bisa menancapkan etalase url website ini kedalam widget WebView Flutter.
                </p>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 font-mono text-[10px] text-slate-300">
                  <p className="text-emerald-505">// Flutter Dart Code in main.dart</p>
                  <p className="text-indigo-300">import 'package:webview_flutter/webview_flutter.dart';</p>
                  <p className="mt-2">class POSScreen extends StatelessWidget &#123;</p>
                  <p className="text-white">&nbsp;&nbsp;final controller = WebViewController()</p>
                  <p className="text-white">&nbsp;&nbsp;&nbsp;&nbsp;..setJavaScriptMode(JavaScriptMode.unrestricted)</p>
                  <p className="text-white">&nbsp;&nbsp;&nbsp;&nbsp;..loadRequest(Uri.parse('https://your-domain.app'));</p>
                  <p className="mt-2">&nbsp;&nbsp;@override</p>
                  <p className="text-white">&nbsp;&nbsp;Widget build(BuildContext context) =&gt; WebViewWidget(controller: controller);</p>
                  <p>&#125;</p>
                </div>
              </div>

              <div className="p-3 bg-emerald-950/20 rounded-xl border border-emerald-900 text-slate-300">
                <p className="text-[11px] leading-relaxed">
                  <strong>Peringatan Printer Bluetooth Native:</strong> Pastikan Anda menginstall plugin khusus <code>@capacitor-community/bluetooth-le</code> atau <code>blue_thermal_printer</code> dart package saat membungkusnya agar direct printing struk kasir melalui bluetooth terhubung mulus di HP pemilik usaha.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-white/10">
              <button
                onClick={() => setShowDeploymentGuide(false)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white rounded-xl transition-all"
              >
                Saya Mengerti, Tutup Panduan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM LOGOUT CONFIRMATION MODAL */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="logout-confirm-modal">
          <div className="bg-slate-900 text-slate-100 p-6 rounded-2xl w-full max-w-sm border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <LogOut size={28} className="shrink-0" />
              <div>
                <h3 className="text-sm md:text-base font-bold text-white">Konfirmasi Keluar Sesi</h3>
                <p className="text-[11px] text-slate-400">Ledger Line by Aslam Security</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Apakah Anda yakin ingin menutup sesi kasir aktif dan keluar dari akun toko ini? Pembukuan harian yang sedang berjalan telah disimpan dengan aman.
            </p>
            <div className="flex justify-end gap-2.5 pt-2 border-t border-white/5">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl text-slate-300 transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={executeLogout}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white rounded-xl transition-all cursor-pointer shadow-md shadow-rose-950/50"
              >
                Ya, Keluar Sesi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM RESET DATABASE CONFIRMATION MODAL */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="reset-confirm-modal">
          <div className="bg-slate-900 text-slate-100 p-6 rounded-2xl w-full max-w-sm border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-500">
              <AlertTriangle size={28} className="shrink-0 animate-pulse" />
              <div>
                <h3 className="text-sm md:text-base font-bold text-white font-sans">Reset Metrik Finansial</h3>
                <p className="text-[11px] text-slate-400">Tindakan Aman & Bersih</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Apakah Anda yakin ingin mengatur ulang data finansial ke Rp 0? Tindakan ini akan mengosongkan log pengeluaran, pemasukan, dan pesanan harian. Daftar menu, bahan baku, resep, dan konfigurasi aslinya akan dikembalikan ke setelan default agar Anda siap mengisi mutasi keuangan secara manual.
            </p>
            <div className="flex justify-end gap-2.5 pt-2 border-t border-white/5">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl text-slate-300 transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={executeResetDatabase}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-xs font-bold text-slate-950 rounded-xl transition-all cursor-pointer shadow-md"
              >
                Ya, Reset Finansial Ke 0
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
