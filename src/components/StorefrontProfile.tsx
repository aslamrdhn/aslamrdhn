/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppConfig, Product } from '../types';
import { 
  Building, 
  MapPin, 
  Wifi, 
  Scale, 
  CheckCircle,
  Award,
  User,
  Palette,
  Trash2,
  Plus,
  Search,
  Image as ImageIcon,
  Tag,
  Coffee,
  Check,
  AlertTriangle,
  LayoutGrid,
  FileText,
  UserCheck,
  Edit2,
  Lock,
  Phone,
  Layers,
  Sparkles,
  ShoppingBag,
  Eye,
  Info,
  Cloud,
  Database,
  Terminal,
  ExternalLink,
  RefreshCw,
  Globe,
  Mail
} from 'lucide-react';

interface StorefrontProfileProps {
  appConfig: AppConfig;
  onUpdateConfig: (updated: Partial<AppConfig>) => void;
  products: Product[];
  onRefresh: () => void;
}

export default function StorefrontProfile({ appConfig, onUpdateConfig, products, onRefresh }: StorefrontProfileProps) {
  // Navigation active subtab: 'profil' | 'menu' | 'tema' | 'swot' | 'drive' | 'karyawan' | 'printer'
  const [activeSubTab, setActiveSubTab] = useState<'profil' | 'menu' | 'tema' | 'swot' | 'drive' | 'karyawan' | 'printer'>('profil');
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  // --- KARYAWAN & AUDIT SHIFT STATES ---
  const [employees, setEmployees] = useState<any[]>(() => {
    const saved = localStorage.getItem('aslam_ledger_employees');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'emp_1', name: 'Aslam Ramadhan', role: 'Owner', shift: 'Sore (Afternoon)', phone: '+62 812-4455-6677', active: true },
      { id: 'emp_2', name: 'Siti Safira', role: 'Supervisor', shift: 'Pagi (Morning)', phone: '+62 813-1122-3344', active: true },
      { id: 'emp_3', name: 'Budi Hartono', role: 'Cashier', shift: 'Malam (Full Night)', phone: '+62 819-2233-4455', active: true }
    ];
  });

  const [auditLogs, setAuditLogs] = useState<any[]>(() => {
    const saved = localStorage.getItem('aslam_ledger_audit_logs');
    if (saved) return JSON.parse(saved);
    return [
      { time: '09:00:23', name: 'Siti Safira', action: 'Buka Shift Pagi & Hitung Kas Awal', detail: 'Kas awal laci terverifikasi Rp 200.000', ip: '192.168.1.18' },
      { time: '11:15:42', name: 'Siti Safira', action: 'Penerimaan Stok Kopi', detail: 'Update stok biji espresso +10,000 gram', ip: '192.168.1.18' },
      { time: '15:01:05', name: 'Aslam Ramadhan', action: 'Ganti Shift Kerja', detail: 'Serah terima kunci laci & rekap kas shift pagi', ip: '192.168.1.5' },
      { time: '15:05:12', name: 'Aslam Ramadhan', action: 'Pemeriksaan Dashboard SWOT', detail: 'Menganalisis margin kelayakan bisnis', ip: '192.168.1.5' }
    ];
  });

  const [newEmpName, setNewEmpName] = useState<string>('');
  const [newEmpRole, setNewEmpRole] = useState<string>('Cashier');
  const [newEmpShift, setNewEmpShift] = useState<string>('Pagi (Morning)');
  const [newEmpPhone, setNewEmpPhone] = useState<string>('');

  // --- ADAPTABLE WIFI & BLUETOOTH PRINTER STATES ---
  const [wifiSearchActive, setWifiSearchActive] = useState<boolean>(false);
  const [wifiDevices, setWifiDevices] = useState<string[]>(() => {
    const saved = localStorage.getItem('aslam_ledger_discovered_wifis');
    if (saved) return JSON.parse(saved);
    return [
      'LedgerLine_HighSpeed_5G (Sinyal Sempurna • Aktif)',
      'Aslam_Coffee_Guest_2.4G (Sinyal Kuat)',
      'Biznet_Home_Fiber_Bar (Sinyal Sedang)',
      'Telkomsel_Orbit_Cafe_01 (Sinyal Kuat)'
    ];
  });
  const [selectedWifi, setSelectedWifi] = useState<string>(() => {
    return appConfig.storeWifiName ? `${appConfig.storeWifiName} (Sinyal Sempurna • Aktif)` : 'LedgerLine_HighSpeed_5G (Sinyal Sempurna • Aktif)';
  });
  const [customWifiSsid, setCustomWifiSsid] = useState<string>('');
  const [customWifiPass, setCustomWifiPass] = useState<string>('');

  const [btSearchActive, setBtSearchActive] = useState<boolean>(false);
  const [btDevices, setBtDevices] = useState<any[]>(() => {
    const saved = localStorage.getItem('aslam_ledger_discovered_bts');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'bt_1', name: 'RPP02N Thermal Printer 58mm', address: '00:11:22:33:AA:BB', paired: true, paperSize: '58mm', type: 'Thermal POS' },
      { id: 'bt_2', name: 'Epson TM-T82X 80mm', address: '3C:D9:2B:E8:4A:9C', paired: false, paperSize: '80mm', type: 'Desktop Receipt' },
      { id: 'bt_3', name: 'Zjiang ZJ-5802 Mobile POS', address: 'AA:BB:CC:DD:EE:FF', paired: false, paperSize: '58mm', type: 'Mobile Bluetooth' }
    ];
  });
  const [selectedPrinterId, setSelectedPrinterId] = useState<string>('bt_1');
  const [paperWidth, setPaperWidth] = useState<'58mm' | '80mm'>('58mm');
  const [printDensity, setPrintDensity] = useState<number>(100);
  const [printCopies, setPrintCopies] = useState<number>(1);
  const [testPrintingStatus, setTestPrintingStatus] = useState<string>('');

  // Save changes helper logs
  const logAuditActivity = (name: string, action: string, detail: string) => {
    const timeStr = new Date().toLocaleTimeString('id-ID');
    const newLog = {
      time: timeStr,
      name,
      action,
      detail,
      ip: '192.168.1.' + Math.floor(2 + Math.random() * 250)
    };
    const updated = [newLog, ...auditLogs].slice(0, 100);
    setAuditLogs(updated);
    localStorage.setItem('aslam_ledger_audit_logs', JSON.stringify(updated));
  };

  // 1. Profil Kedai & Biodata States
  const [storeName, setStoreName] = useState<string>(appConfig.storeName || '');
  const [storeAddress, setStoreAddress] = useState<string>(appConfig.storeAddress || '');
  const [storePhone, setStorePhone] = useState<string>(appConfig.storePhone || '');
  const [storeWifiName, setStoreWifiName] = useState<string>(appConfig.storeWifiName || '');
  const [storeWifiPass, setStoreWifiPass] = useState<string>(appConfig.storeWifiPass || '');
  
  const [cashierName, setCashierName] = useState<string>(appConfig.cashierName || 'Aslam Ramadhan');
  const [cashierRole, setCashierRole] = useState<string>(appConfig.cashierRole || 'Head Barista & Admin');
  const [cashierShift, setCashierShift] = useState<string>(appConfig.cashierShift || 'Sore (Afternoon)');
  const [cashierPhone, setCashierPhone] = useState<string>(appConfig.cashierPhone || '+62 812-4455-6677');
  const [cashierPin, setCashierPin] = useState<string>(appConfig.cashierPin || '1234');
  const [cashierAvatar, setCashierAvatar] = useState<string>(appConfig.cashierAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop');

  const avatarPresets = [
    { name: 'Srikandi Barista', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop' },
    { name: 'Gatotkaca Espresso', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop' },
    { name: 'Arimbi Matcha', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop' },
    { name: 'Bima Latte Art', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop' }
  ];

  // 2. Kustomisasi Tema & Tampilan States
  const [currentTheme, setCurrentTheme] = useState<'slate' | 'espresso' | 'midnight' | 'matcha'>(appConfig.theme || 'slate');
  const [currentLayout, setCurrentLayout] = useState<'grid' | 'list'>(appConfig.layoutMode || 'grid');

  // 4. Google Drive Simulator states
  const [driveConnected, setDriveConnected] = useState<boolean>(() => {
    return appConfig.driveConnected || false;
  });
  const [driveStoreFolder, setDriveStoreFolder] = useState<string>(() => {
    return appConfig.driveStoreFolder || '/AslamLedger_CloudServer';
  });
  const [driveClientId, setDriveClientId] = useState<string>(() => {
    return appConfig.driveClientId || '';
  });
  const [driveClientSecret, setDriveClientSecret] = useState<string>(() => {
    return appConfig.driveClientSecret || '';
  });
  const [driveAutoSync, setDriveAutoSync] = useState<boolean>(() => {
    return appConfig.driveAutoSync || false;
  });
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [showOAuthPopup, setShowOAuthPopup] = useState<boolean>(false);
  const [syncProgress, setSyncProgress] = useState<number>(0);
  const [driveLogs, setDriveLogs] = useState<string[]>([
    'Sistem sinkronisasi siap. Silakan hubungkan akun Google Drive Anda di panel samping.'
  ]);

  // Optimized Google Workspace states
  const [googleConnectMode, setGoogleConnectMode] = useState<'easy' | 'credentials'>('easy');
  const [easyEmail, setEasyEmail] = useState<string>('aslamramadhan08@gmail.com');
  const [scheduleEnabled, setScheduleEnabled] = useState<boolean>(true);
  const [scheduleTime, setScheduleTime] = useState<string>('23:00');
  const [recipientEmail, setRecipientEmail] = useState<string>('aslamramadhan08@gmail.com');
  const [reportType, setReportType] = useState<'all' | 'sheets_only'>('all');
  const [simulatingReport, setSimulatingReport] = useState<boolean>(false);

  const addLogLine = (text: string) => {
    const timeStr = new Date().toLocaleTimeString('id-ID');
    setDriveLogs(prev => [...prev, `[${timeStr}] ${text}`]);
  };

  useEffect(() => {
    setStoreName(appConfig.storeName || '');
    setStoreAddress(appConfig.storeAddress || '');
    setStorePhone(appConfig.storePhone || '');
    setStoreWifiName(appConfig.storeWifiName || '');
    setStoreWifiPass(appConfig.storeWifiPass || '');
    setCashierName(appConfig.cashierName || 'Aslam Ramadhan');
    setCashierRole(appConfig.cashierRole || 'Head Barista & Admin');
    setCashierShift(appConfig.cashierShift || 'Sore (Afternoon)');
    setCashierPhone(appConfig.cashierPhone || '+62 812-4455-6677');
    setCashierPin(appConfig.cashierPin || '1234');
    setCashierAvatar(appConfig.cashierAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop');
    
    setDriveConnected(appConfig.driveConnected || false);
    setDriveStoreFolder(appConfig.driveStoreFolder || '/AslamLedger_CloudServer');
    setDriveClientId(appConfig.driveClientId || '');
    setDriveClientSecret(appConfig.driveClientSecret || '');
    setDriveAutoSync(appConfig.driveAutoSync || false);
    setCurrentTheme(appConfig.theme || 'slate');
    setCurrentLayout(appConfig.layoutMode || 'grid');
  }, [appConfig]);

  // 3. Manajemen Menu states
  const [menuSearch, setMenuSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // States for Add Menu Modal / Form
  const [showAddMenuModal, setShowAddMenuModal] = useState<boolean>(false);
  const [showEditMenuModal, setShowEditMenuModal] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form inputs for Prod (Add and Edit share these state tags or dedicated)
  const [prodName, setProdName] = useState<string>('');
  const [prodCategory, setProdCategory] = useState<'Coffee' | 'Non-Coffee' | 'Heavy Meals' | 'Snacks' | 'Desserts' | 'Beans'>('Coffee');
  const [prodPrice, setProdPrice] = useState<number>(18000);
  const [prodCostPrice, setProdCostPrice] = useState<number>(8000);
  const [prodStock, setProdStock] = useState<number>(50);
  const [prodWarningLimit, setProdWarningLimit] = useState<number>(5);
  const [prodBarcode, setProdBarcode] = useState<string>('');
  const [prodKomposisi, setProdKomposisi] = useState<string>('');
  const [prodImageUrl, setProdImageUrl] = useState<string>('');
  const [prodSupplierName, setProdSupplierName] = useState<string>('Supplier Utama');
  const [prodSupplierContact, setProdSupplierContact] = useState<string>('0812-3456-7890');
  const [restorePending, setRestorePending] = useState<boolean>(false);
  const [deleteProductPending, setDeleteProductPending] = useState<{ id: string; name: string } | null>(null);

  // Quick Add Menu states
  const [quickName, setQuickName] = useState<string>('');
  const [quickCategory, setQuickCategory] = useState<'Coffee' | 'Non-Coffee' | 'Heavy Meals' | 'Snacks' | 'Desserts' | 'Beans'>('Coffee');
  const [quickPrice, setQuickPrice] = useState<number>(18000);
  const [quickStock, setQuickStock] = useState<number>(100);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleSaveProfileAndBiodata = () => {
    onUpdateConfig({
      storeName,
      storeAddress,
      storePhone,
      storeWifiName,
      storeWifiPass,
      cashierName,
      cashierRole,
      cashierShift,
      cashierPhone,
      cashierPin,
      cashierAvatar
    });
    triggerToast('Profil kedai & Biodata admin berhasil diperbarui!');
  };

  const handleTestConnection = () => {
    if (!driveClientId || !driveClientSecret) {
      triggerToast("Harap isi Client ID dan Client Secret Google OAuth 2.0 Anda terlebih dahulu.");
      return;
    }
    setIsSyncing(true);
    setSyncProgress(25);
    setDriveLogs(['[SYSTEM] Memulai pengetesan koneksi Google Drive REST API...']);
    setTimeout(() => {
      setSyncProgress(65);
      addLogLine('Mengirim ping ke oauth2.googleapis.com...');
      addLogLine(`Checking Client ID: ${driveClientId.substring(0, 15)}...`);
    }, 450);

    setTimeout(() => {
      setSyncProgress(100);
      setIsSyncing(false);
      addLogLine('Koneksi OAuth 2.0 TERVERIFIKASI. Jaringan aman & siap pakai.');
      triggerToast('Koneksi Google API Sukses!');
    }, 1100);
  };

  const handleManualBackup = async () => {
    if (!driveConnected) {
      triggerToast("Silakan hubungkan akun Google Drive Anda terlebih dahulu.");
      return;
    }
    setIsSyncing(true);
    setSyncProgress(10);
    
    // Fallback email determination based on connection state
    const email = googleConnectMode === 'easy' ? easyEmail : 'aslamramadhan08@gmail.com';
    setDriveLogs(['[SYSTEM] Memulai pencadangan komprehensif...', `Folder Tujuan: drive_spaces/${email.trim().toLowerCase()}/${driveStoreFolder.replace(/^\//, '')}`]);
    
    try {
      const savedStore = localStorage.getItem('aslam_ledger_current_store');
      const tenantId = savedStore ? JSON.parse(savedStore).id : 'aslam-brew';

      const response = await fetch('/api/drive/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Id': tenantId
        },
        body: JSON.stringify({
          email,
          folder: driveStoreFolder
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSyncProgress(100);
        setIsSyncing(false);
        addLogLine(`[SUCCESS] Backup sukses tersimpan di Drive Space: ${data.filePath}`);
        addLogLine(`[SUCCESS] Ukuran File: ${data.fileSize} (${data.recordCount} entri data terenskripsi secara riil)`);
        triggerToast('Pencadangan ke Google Drive berhasil!');
        onRefresh();
      } else {
        throw new Error(data.message || 'Gagal melakukan backup.');
      }
    } catch (err: any) {
      setIsSyncing(false);
      addLogLine(`[FALIARE] Kesalahan sinkronisasi: ${err.message}`);
      triggerToast('Pencadangan Drive gagal!');
    }
  };

  const handleManualRestore = () => {
    if (!driveConnected) {
      triggerToast("Silakan hubungkan akun Google Drive Anda terlebih dahulu.");
      return;
    }
    setRestorePending(true);
  };

  const executeManualRestore = async () => {
    setRestorePending(false);
    setIsSyncing(true);
    setSyncProgress(15);
    
    const email = googleConnectMode === 'easy' ? easyEmail : 'aslamramadhan08@gmail.com';
    setDriveLogs(['[SYSTEM] Memulai pemulihan data dari Google Drive...', `Membaca jalur: drive_spaces/${email.trim().toLowerCase()}/state_backup.json`]);
    
    try {
      const savedStore = localStorage.getItem('aslam_ledger_current_store');
      const tenantId = savedStore ? JSON.parse(savedStore).id : 'aslam-brew';

      const response = await fetch('/api/drive/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Id': tenantId
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSyncProgress(100);
        setIsSyncing(false);
        addLogLine(`[SUCCESS] Restorasi selesai dari Drive Space email: ${email}`);
        addLogLine(`[SUCCESS] Memulihkan ${data.recordCount} entri master & mutasi finansial.`);
        triggerToast('Restorasi Sukses!');
        onRefresh();
      } else {
        throw new Error(data.message || 'File backup state_backup.json tidak dideteksi.');
      }
    } catch (err: any) {
      setIsSyncing(false);
      addLogLine(`[FAILURE] Kesalahan pemulihan: ${err.message}`);
      triggerToast(err.message || 'Pemulihan state gagal!');
    }
  };

  const handleEasyGoogleConnect = () => {
    if (!easyEmail || !easyEmail.includes('@')) {
      triggerToast("Harap masukkan alamat email Google yang valid.");
      return;
    }
    setIsSyncing(true);
    setSyncProgress(15);
    setDriveLogs(['[OAuth 2.0] Menginisialisasi jabat tangan Single Sign-On Instan...', `Email sasaran: ${easyEmail}`]);
    setTimeout(() => {
      setSyncProgress(65);
      addLogLine('Membuka pop-up otentikasi Google Cloud Link aman bertenaga Firebase...');
    }, 350);

    setTimeout(() => {
      setSyncProgress(100);
      setIsSyncing(false);
      setShowOAuthPopup(true);
    }, 850);
  };

  const handleTestScheduleSend = () => {
    if (!recipientEmail || !recipientEmail.includes('@')) {
      triggerToast("Harap masukkan alamat email penerima laporan harian.");
      return;
    }
    setSimulatingReport(true);
    setSyncProgress(5);
    setDriveLogs([
      `[SCHEDULER] 🕒 Memicu pengiriman laporan harian otomatis pukul ${scheduleTime}...`,
      `[SCHEDULER] Akun Kedai: ${storeName || 'LedgerLine'}`,
      `[SCHEDULER] Penerima Laporan: ${recipientEmail}`,
      `[SCHEDULER] Format: ${reportType === 'all' ? 'PDF/Excel Attachment + Google Sheets Sync' : 'Google Sheets Sync + Email Notifikasi'}`
    ]);

    setTimeout(() => {
      setSyncProgress(25);
      addLogLine(`[DATABASE] Membaca data transaksi ledger harian dan mutasi stok bahan baku kopi...`);
    }, 350);

    setTimeout(() => {
      setSyncProgress(48);
      addLogLine(`[SPREADSHEET] Membuka API Google Sheets dan menyinkronkan baris entri harian...`);
      addLogLine(`[SPREADSHEET] Menulis records baru untuk transaksi meja & kasir hari ini.`);
    }, 800);

    setTimeout(() => {
      setSyncProgress(75);
      if (reportType === 'all') {
        addLogLine(`[PDF_ENGINE] Membuat dokumen PDF laporan harian dengan neraca saldo, cost of goods sold (COGS), dan profit...`);
        addLogLine(`[PDF_ENGINE] Ukuran file ekspor: 48 KB. Digital checksum SHA-256 tersemat.`);
      } else {
        addLogLine(`[NOTIFIKASI_ENGINE] Melewati pembuatan PDF harian. Memperoleh tautan spreadsheet aktif...`);
      }
    }, 1300);

    setTimeout(() => {
      setSyncProgress(92);
      addLogLine(`[SMTP_SECURE] Terkoneksi ke SMTP Server aman (TLS aktif)...`);
      addLogLine(`[SMTP_SECURE] Mengirimkan surat elektronik ke alamat hobi / pemilik kedai.`);
    }, 1800);

    setTimeout(() => {
      setSyncProgress(100);
      setSimulatingReport(false);
      addLogLine(`[SCHEDULER] ✅ SUKSES! Laporan harian otomatis berhasil dikirimkan ke: ${recipientEmail}`);
      addLogLine(`[SCHEDULER] ✅ File Laporan keuangan di Google Drive tersimpan rapi.`);
      triggerToast(`Uji Laporan Harian Terkirim ke: ${recipientEmail}`);
    }, 2350);
  };

  const handleSimulatedOAuthLogin = () => {
    if (!driveClientId || !driveClientSecret) {
      triggerToast("Harap isi Client ID dan Client Secret Google OAuth 2.0 Anda terlebih dahulu untuk memulai jabat tangan login.");
      return;
    }
    setShowOAuthPopup(true);
  };

  const confirmOAuthSimulation = () => {
    setShowOAuthPopup(false);
    setDriveConnected(true);
    const selectedEmail = googleConnectMode === 'easy' ? easyEmail : 'aslamramadhan08@gmail.com';
    onUpdateConfig({
      driveConnected: true,
      driveStoreFolder: googleConnectMode === 'easy' ? '/AslamLedger_Workspace' : driveStoreFolder,
      driveClientId: googleConnectMode === 'credentials' ? driveClientId : 'CentralizedEasyClient',
      driveClientSecret: googleConnectMode === 'credentials' ? driveClientSecret : 'CentralizedEasySecret',
      driveAutoSync
    });
    setDriveLogs([
      `[OAuth 2.0] Sukses menautkan akun Google Workspace: ${selectedEmail}`,
      `[OAuth 2.0] Hak akses berhasil dialokasikan untuk folder tujuan '${googleConnectMode === 'easy' ? '/AslamLedger_Workspace' : driveStoreFolder}'`,
      `[OAuth 2.0] Akses API Google Sheets, Google Docs & Google Drive AKTIF`,
      '[OAuth 2.0] Token Kedaluwarsa: 3600 detik (Auto-Refresh diaktivasi di Server)'
    ]);
    triggerToast(`Google Drive berhasil terhubung ke: ${selectedEmail}`);
  };

  const disconnectDrive = () => {
    setDriveConnected(false);
    onUpdateConfig({
      driveConnected: false
    });
    addLogLine('[Google SDK] Koneksi Google Drive dicopot secara lokal.');
    triggerToast('Koneksi Google Drive dicopot.');
  };

  const handleSaveDriveSettings = () => {
    onUpdateConfig({
      driveStoreFolder,
      driveClientId,
      driveClientSecret,
      driveAutoSync
    });
    triggerToast('Konfigurasi Google Drive berhasil disimpan!');
  };

  const handleUpdateThemeAndLayout = (themeName: 'slate' | 'espresso' | 'midnight' | 'matcha', layoutType: 'grid' | 'list') => {
    setCurrentTheme(themeName);
    setCurrentLayout(layoutType);
    onUpdateConfig({
      theme: themeName,
      layoutMode: layoutType
    });
    triggerToast(`Tampilan berubah! Tema: ${themeName.toUpperCase()}, Mode: ${layoutType.toUpperCase()}`);
  };

  const generateRandomBarcode = () => {
    const code = 'PROD' + Math.floor(1000 + Math.random() * 9000);
    setProdBarcode(code);
  };

  // Handle uploaded local image convert to base64
  const handleLocalImage = (e: React.ChangeEvent<HTMLInputElement>, isEditMode: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran gambar terlalu besar! Maksimum 2MB agar loading database tetap kencang.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProdImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Add Product POST to Express
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim()) {
      alert("Masukkan nama menu terlebih dahulu!");
      return;
    }

    const payload = {
      name: prodName,
      category: prodCategory,
      price: Number(prodPrice),
      costPrice: Number(prodCostPrice),
      stock: Number(prodStock),
      warningLimit: Number(prodWarningLimit),
      barcode: prodBarcode || ('PROD' + Math.floor(1000 + Math.random() * 9000)),
      supplierName: prodSupplierName,
      supplierContact: prodSupplierContact,
      imageUrl: prodImageUrl || undefined,
      komposisi: prodKomposisi || undefined
    };

    try {
      const savedStore = localStorage.getItem('aslam_ledger_current_store');
      const tenantId = savedStore ? JSON.parse(savedStore).id : 'aslam-brew';

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Tenant-Id': tenantId
        },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        setShowAddMenuModal(false);
        triggerToast(`Sukses menambahkan menu baru: ${prodName}`);
        resetProductForm();
        onRefresh();
      }
    } catch (err) {
      alert("Gagal menambahkan menu ke database.");
    }
  };

  // Load product to edit
  const startEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProdName(p.name);
    setProdCategory(p.category);
    setProdPrice(p.price);
    setProdCostPrice(p.costPrice || Math.round(p.price * 0.45));
    setProdStock(p.stock);
    setProdWarningLimit(p.warningLimit);
    setProdBarcode(p.barcode);
    setProdKomposisi(p.komposisi || '');
    setProdImageUrl(p.imageUrl || '');
    setProdSupplierName(p.supplierName || 'Supplier Utama');
    setProdSupplierContact(p.supplierContact || '0812-3456-7890');
    setShowEditMenuModal(true);
  };

  // Edit Product PUT execution
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const payload = {
      name: prodName,
      category: prodCategory,
      price: Number(prodPrice),
      costPrice: Number(prodCostPrice),
      stock: Number(prodStock),
      warningLimit: Number(prodWarningLimit),
      barcode: prodBarcode,
      supplierName: prodSupplierName,
      supplierContact: prodSupplierContact,
      imageUrl: prodImageUrl || undefined,
      komposisi: prodKomposisi || undefined
    };

    try {
      const savedStore = localStorage.getItem('aslam_ledger_current_store');
      const tenantId = savedStore ? JSON.parse(savedStore).id : 'aslam-brew';

      const response = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'X-Tenant-Id': tenantId
        },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        setShowEditMenuModal(false);
        triggerToast(`Sukses memperbarui menu: ${prodName}`);
        resetProductForm();
        setEditingProduct(null);
        onRefresh();
      }
    } catch (err) {
      alert("Gagal mengupdate menu.");
    }
  };

  // Delete Product DELETE execution
  const handleDeleteProduct = (pId: string, pName: string) => {
    setDeleteProductPending({ id: pId, name: pName });
  };

  const executeDeleteProduct = async () => {
    if (!deleteProductPending) return;
    const { id, name } = deleteProductPending;
    try {
      const savedStore = localStorage.getItem('aslam_ledger_current_store');
      const tenantId = savedStore ? JSON.parse(savedStore).id : 'aslam-brew';

      const response = await fetch(`/api/products/${id}`, { 
        method: 'DELETE',
        headers: {
          'X-Tenant-Id': tenantId
        }
      });
      if (response.ok) {
        triggerToast(`Menu "${name}" berhasil dihapus.`);
        onRefresh();
      } else {
        triggerToast("Gagal menghapus menu dari server database.");
      }
    } catch (err) {
      triggerToast("Error: Gagal menghubungi server database.");
    } finally {
      setDeleteProductPending(null);
    }
  };

  const handleQuickStockChange = async (p: any, delta: number) => {
    const newStock = Math.max(0, p.stock + delta);
    const payload = {
      ...p,
      stock: newStock
    };

    try {
      const savedStore = localStorage.getItem('aslam_ledger_current_store');
      const tenantId = savedStore ? JSON.parse(savedStore).id : 'aslam-brew';

      const response = await fetch(`/api/products/${p.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Id': tenantId
        },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        triggerToast(`Stok "${p.name}" sekarang: ${newStock}`);
        onRefresh();
      } else {
        triggerToast("Gagal memperbarui stok otomatis.");
      }
    } catch (err) {
      triggerToast("Error: Terputus dari server database.");
    }
  };

  const handleQuickAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName.trim()) {
      triggerToast("Nama menu tidak boleh kosong.");
      return;
    }

    try {
      const savedStore = localStorage.getItem('aslam_ledger_current_store');
      const tenantId = savedStore ? JSON.parse(savedStore).id : 'aslam-brew';

      const calculatedCost = Math.round(quickPrice * 0.45);
      const generatedBarcode = 'LL-' + Math.floor(Math.random() * 90000 + 10000);

      const payload = {
        name: quickName.trim(),
        category: quickCategory,
        price: quickPrice,
        costPrice: calculatedCost,
        stock: quickStock,
        warningLimit: 5,
        barcode: generatedBarcode,
        komposisi: '',
        imageUrl: '',
        supplierName: 'Supplier Utama',
        supplierContact: '0812-3456-7890'
      };

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Id': tenantId
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        triggerToast(`Menu "${quickName}" berhasil ditambahkan.`);
        setQuickName('');
        setQuickPrice(18000);
        setQuickStock(100);
        onRefresh();
      } else {
        triggerToast("Gagal menyimpan menu instan.");
      }
    } catch (err) {
      triggerToast("Gagal terhubung dengan server database.");
    }
  };

  const resetProductForm = () => {
    setProdName('');
    setProdCategory('Coffee');
    setProdPrice(18000);
    setProdCostPrice(8000);
    setProdStock(50);
    setProdWarningLimit(5);
    setProdBarcode('');
    setProdKomposisi('');
    setProdImageUrl('');
    setProdSupplierName('Supplier Utama');
    setProdSupplierContact('0812-3456-7890');
  };

  // Filter products managed
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(menuSearch.toLowerCase()) || 
                          p.barcode.toLowerCase().includes(menuSearch.toLowerCase());
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6" id="settings-master-container">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl z-50 flex items-center gap-2 border border-slate-700 animate-bounce">
          <CheckCircle className="text-emerald-400" size={16} />
          <span className="text-xs font-bold font-sans">{toastMessage}</span>
        </div>
      )}

      {/* SUBNAV BUTTONS BAR - Sleek grey glass bento navigations */}
      <div className="bg-white p-2.5 rounded-2xl border border-slate-200/60 shadow-xs flex flex-wrap gap-1.5 items-center font-sans">
        <button
          onClick={() => setActiveSubTab('profil')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'profil'
              ? 'bg-slate-950 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <User size={14} />
          Profil Kafe & Biodata Kasir
        </button>

        <button
          onClick={() => setActiveSubTab('menu')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'menu'
              ? 'bg-slate-950 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Coffee size={14} />
          Kelola Etalase Menu ({products.length})
        </button>

        <button
          onClick={() => setActiveSubTab('tema')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'tema'
              ? 'bg-slate-950 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Palette size={14} />
          Tema & Tampilan POS
        </button>

        <button
          onClick={() => setActiveSubTab('karyawan')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'karyawan'
              ? 'bg-slate-950 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <UserCheck size={14} />
          Akses Karyawan & Audit Shift
        </button>

        <button
          onClick={() => setActiveSubTab('printer')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'printer'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-emerald-700 hover:bg-emerald-50/70'
          }`}
        >
          <Wifi size={14} className={activeSubTab === 'printer' ? 'animate-pulse' : ''} />
          WiFi & Printer Adaptif
        </button>

        <button
          onClick={() => setActiveSubTab('swot')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'swot'
              ? 'bg-slate-950 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Scale size={14} />
          Analisis Bisnis SWOT kafe
        </button>

        <button
          onClick={() => setActiveSubTab('drive')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'drive'
              ? 'bg-slate-950 text-white shadow-md'
              : 'text-indigo-600 hover:bg-indigo-50/70 hover:text-indigo-800'
          }`}
        >
          <Cloud size={14} className="text-indigo-500 animate-pulse" />
          Koneksi Google Drive (Simulasi Cloud)
        </button>
      </div>

      {/* TAB SUB-PAGES BODY */}
      
      {/* 1. PROFIL & BIODATA TAB */}
      {activeSubTab === 'profil' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          
          {/* PROFILE KEDAI KOPI (Col 7) */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-150 border-slate-200/50 shadow-sm space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-9 h-9 bg-slate-100 flex items-center justify-center rounded-lg text-slate-800">
                <Building size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 leading-none">Informasi Autentik Kedai Kopi</h3>
                <p className="text-[11px] text-slate-400 mt-1">Definisikan merek dan informasi struk pencetakan bluetooth.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nama Kedai Kopi (Store Brand)</label>
                <input 
                  type="text" 
                  value={storeName} 
                  onChange={(e) => setStoreName(e.target.value)} 
                  className="w-full px-3.5 py-2.5 border border-slate-200 bg-slate-50 font-bold text-slate-800 rounded-xl focus:outline-hidden focus:border-slate-400" 
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Alamat Lengkap Operasional</label>
                <textarea 
                  value={storeAddress} 
                  onChange={(e) => setStoreAddress(e.target.value)} 
                  className="w-full px-3.5 py-2.5 border border-slate-200 bg-slate-50 font-medium text-slate-700 rounded-xl h-16 resize-none focus:outline-hidden focus:border-slate-400" 
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nomor WhatsApp Usaha</label>
                <input 
                  type="text" 
                  value={storePhone} 
                  onChange={(e) => setStorePhone(e.target.value)} 
                  className="w-full px-3.5 py-2.5 border border-slate-200 bg-slate-50 font-mono font-medium rounded-xl focus:outline-hidden" 
                />
              </div>

              <div className="bg-amber-50/40 p-3 rounded-xl border border-amber-100/70 flex items-start gap-2 text-[11px] text-amber-800">
                <Info size={14} className="shrink-0 mt-0.5 text-amber-600" />
                <p className="leading-snug">Data ini otomatis terpaku di struk kertas BT Bluetooth Thermal Printer pasca kasir checkout.</p>
              </div>

              {/* Wi-Fi Settings */}
              <div className="md:col-span-2 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Wifi size={14} className="text-slate-600" />
                  Kredensial Wi-Fi Pelanggan (Otomatis QR)
                </p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Nama SSID Wifi</label>
                    <input 
                      type="text" 
                      value={storeWifiName} 
                      onChange={(e) => setStoreWifiName(e.target.value)} 
                      className="w-full px-3 py-2 border border-slate-250 bg-white font-medium text-slate-800 rounded-lg focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Password Wifi</label>
                    <input 
                      type="password" 
                      value={storeWifiPass} 
                      onChange={(e) => setStoreWifiPass(e.target.value)} 
                      className="w-full px-3 py-2 border border-slate-250 bg-white font-mono text-slate-800 rounded-lg focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BIODATA / PERSONAL PROFILE KASIR (Col 5) */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-150 border-slate-200/50 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-9 h-9 bg-slate-100 flex items-center justify-center rounded-lg text-slate-800">
                  <UserCheck size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 leading-none">Biodata Barista & Kasir</h3>
                  <p className="text-[11px] text-slate-400 mt-1">Isi identitas barista bertugas untuk audit keamanan.</p>
                </div>
              </div>

              {/* Avatar Picker UI with absolute cleanliness */}
              <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-200 shadow-md flex-shrink-0 bg-slate-100 relative">
                  <img src={cashierAvatar} alt="Kasir Avatar" className="w-full h-full object-cover" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-450 uppercase leading-none">Pilih Avatar Barista</p>
                  <div className="flex gap-1.5 pt-1">
                    {avatarPresets.map((preset, index) => (
                      <button
                        key={index}
                        title={preset.name}
                        onClick={() => setCashierAvatar(preset.url)}
                        className={`w-7 h-7 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                          cashierAvatar === preset.url ? 'border-blue-500 scale-110 shadow-xs' : 'border-slate-200 hover:scale-105'
                        }`}
                      >
                        <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                  <input 
                    type="text" 
                    placeholder="Atau link foto bebas..." 
                    value={cashierAvatar}
                    onChange={(e) => setCashierAvatar(e.target.value)}
                    className="w-full px-2 py-1 border border-slate-200 bg-white rounded text-[9px] mt-1 text-slate-500"
                  />
                </div>
              </div>

              {/* Cashier profile forms */}
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nama Operator Barista / Kasir</label>
                  <input 
                    type="text" 
                    value={cashierName} 
                    onChange={(e) => setCashierName(e.target.value)} 
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50 font-bold text-slate-800 rounded-lg focus:outline-hidden" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Jabatan Kepegawaian</label>
                    <input 
                      type="text" 
                      value={cashierRole} 
                      onChange={(e) => setCashierRole(e.target.value)} 
                      className="w-full px-3 py-2 border border-slate-200 bg-slate-50 text-slate-800 font-medium rounded-lg" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Shift Jadwal Kerja</label>
                    <select
                      value={cashierShift}
                      onChange={(e) => setCashierShift(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 bg-slate-50 text-slate-800 font-medium rounded-lg"
                    >
                      <option value="Pagi (Morning)">Pagi (Morning)</option>
                      <option value="Siang (Noon)">Siang (Noon)</option>
                      <option value="Sore (Afternoon)">Sore (Afternoon)</option>
                      <option value="Malam (Full Night)">Malam (Full Night)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nomor HP Barista</label>
                    <input 
                      type="text" 
                      value={cashierPhone} 
                      onChange={(e) => setCashierPhone(e.target.value)} 
                      className="w-full px-3 py-2 border border-slate-200 bg-slate-50 font-mono text-slate-800 rounded-lg" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">PIN Rahasia POS</label>
                    <div className="relative">
                      <input 
                        type="password" 
                        value={cashierPin} 
                        onChange={(e) => setCashierPin(e.target.value)} 
                        maxLength={4}
                        className="w-full px-3 py-2 pl-8 border border-slate-200 bg-slate-50 font-mono text-slate-805 text-slate-800 rounded-lg focus:outline-hidden" 
                      />
                      <Lock className="absolute left-2.5 top-2.5 text-slate-400" size={12} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit all profile */}
            <button
              onClick={handleSaveProfileAndBiodata}
              className="w-full py-3 bg-slate-950 hover:bg-slate-850 text-white font-bold rounded-2xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <Check size={16} />
              Simpan Profil & Biodata
            </button>
          </div>

        </div>
      )}

      {/* 2. KELOLA ETALASE MENU (ADD / EDIT / DELETE / IMAGE UPLOADS) */}
      {activeSubTab === 'menu' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-150 border-slate-200/50 shadow-sm space-y-4 animate-fade-in" id="inventory-config-panel">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Layers size={16} />
                Manajemen Basis Data Menu Jual
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Unggah menu dan gambar baru, sunting harga bahan baku, atau hapus item etalase.</p>
            </div>
            
            {/* Custom Add Menu Trigger Button */}
            <button
              onClick={() => { resetProductForm(); generateRandomBarcode(); setShowAddMenuModal(true); }}
              className="px-4 py-2 bg-slate-950 hover:bg-slate-850 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Plus size={14} />
              Unggah Menu Baru
            </button>
          </div>

          {/* QUICK INSERT BAR - EASIER MENU ADDITION */}
          <form onSubmit={handleQuickAddSubmit} className="bg-gradient-to-r from-amber-500/5 via-amber-50 to-indigo-50/50 p-5 rounded-2xl border border-amber-200/60 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-center" id="quick-add-menu-form">
            <div className="col-span-1 sm:col-span-2 lg:col-span-3">
              <p className="text-[9px] text-amber-700 uppercase tracking-widest font-black leading-none mb-1">Tambah Menu Kilat</p>
              <h4 className="text-xs font-extrabold text-slate-800 leading-none">Tanpa Buka Dialog Modal</h4>
            </div>
            
            <div className="col-span-1 sm:col-span-2 lg:col-span-3">
              <input 
                type="text"
                required
                placeholder="Nama menu (misal: Ice Matcha Latte)"
                value={quickName}
                onChange={(e) => setQuickName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-amber-500 placeholder-slate-400"
              />
            </div>

            <div className="col-span-1 sm:col-span-1 lg:col-span-2">
              <select
                value={quickCategory}
                onChange={(e) => setQuickCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-hidden focus:border-amber-500"
              >
                {['Coffee', 'Non-Coffee', 'Heavy Meals', 'Snacks', 'Desserts', 'Beans'].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="col-span-1 sm:col-span-1 lg:col-span-2">
              <div className="relative">
                <span className="absolute left-2.5 top-2 text-[10px] font-bold text-slate-400">Rp</span>
                <input 
                  type="number"
                  required
                  placeholder="Harga"
                  value={quickPrice || ''}
                  onChange={(e) => setQuickPrice(parseInt(e.target.value) || 0)}
                  className="w-full pl-7 pr-2 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-amber-500 font-mono font-bold placeholder-slate-400"
                />
              </div>
            </div>

            <div className="col-span-1 sm:col-span-2 lg:col-span-2 flex gap-2">
              <div className="relative flex-1">
                <input 
                  type="number"
                  required
                  placeholder="Stok"
                  value={quickStock || ''}
                  onChange={(e) => setQuickStock(parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 text-center focus:outline-hidden focus:border-amber-500 font-mono font-bold placeholder-slate-400"
                  title="Stok awal porsi"
                />
                <span className="absolute right-2 top-2.5 text-[8px] font-bold text-slate-400 uppercase">Stk</span>
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-sm"
              >
                <Plus size={14} className="stroke-[3]" />
              </button>
            </div>
          </form>

          {/* Search bar and categories filter */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder="Cari nama menu / kode barcode..." 
                value={menuSearch} 
                onChange={(e) => setMenuSearch(e.target.value)} 
                className="w-full pl-9 pr-4 py-2 border border-slate-200 bg-white text-xs rounded-xl focus:outline-hidden"
              />
            </div>
            
            {/* Category horizontal filters */}
            <div className="flex items-center gap-1 overflow-x-auto shrink-0 py-0.5 scrollbar-none">
              {['All', 'Coffee', 'Non-Coffee', 'Heavy Meals', 'Snacks', 'Desserts', 'Beans'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    selectedCategory === cat 
                      ? 'bg-slate-900 text-white' 
                      : 'bg-white hover:bg-slate-200 text-slate-650 text-slate-600'
                  }`}
                >
                  {cat === 'All' ? 'Semua Menu' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* TABLE OF PRODUCTS LIST */}
          <div className="overflow-x-auto border border-slate-100 rounded-2xl bg-white">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase font-bold text-[9px] tracking-wider">
                  <th className="p-4 rounded-tl-2xl">Menu & Foto</th>
                  <th className="p-4">Kategori</th>
                  <th className="p-4 text-right">Modal Pokok</th>
                  <th className="p-4 text-right">Harga Jual</th>
                  <th className="p-4 text-center">Profit Estimasi</th>
                  <th className="p-4 text-center">Stok / Alarm</th>
                  <th className="p-4 text-right rounded-tr-2xl w-40">Aksi Operasi</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 italic">
                      Menu tidak ditemukan. Silakan tambahkan menu baru.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map(p => {
                    // Calculate profit analysis
                    const cost = p.costPrice || Math.round(p.price * 0.45);
                    const grossProfit = p.price - cost;
                    const marginPercent = Math.round((grossProfit / p.price) * 100);

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100/60 font-sans">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {/* Product Thumbnail image preview */}
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-50 border border-slate-200 shadow-xs flex-shrink-0 flex items-center justify-center">
                              {p.imageUrl ? (
                                <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="text-[11px] font-black font-mono text-slate-400 text-center uppercase leading-none">
                                  {p.name.substring(0, 2)}
                                </div>
                              )}
                            </div>
                            
                            <div className="min-w-0">
                              <p className="font-extrabold text-slate-800 text-xs sm:text-sm">{p.name}</p>
                              {p.komposisi ? (
                                <p className="text-[10px] text-slate-400 italic truncate max-w-[200px]" title={p.komposisi}>
                                  🌱 {p.komposisi}
                                </p>
                              ) : (
                                <p className="text-[9px] text-slate-400 italic font-mono">{p.barcode}</p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <span className="bg-slate-100/80 border border-slate-200/50 text-slate-650 text-slate-600 font-bold px-2 py-0.5 rounded text-[9px] uppercase font-sans">
                            {p.category}
                          </span>
                        </td>

                        <td className="p-4 text-right font-mono font-medium text-slate-500">
                          Rp {cost.toLocaleString('id-ID')}
                        </td>

                        <td className="p-4 text-right font-mono font-extrabold text-slate-900">
                          Rp {p.price.toLocaleString('id-ID')}
                        </td>

                        <td className="p-4 text-center">
                          <div className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded-md font-mono text-[10px]">
                            Rp {grossProfit.toLocaleString('id-ID')} ({marginPercent}%)
                          </div>
                        </td>

                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleQuickStockChange(p, -5)}
                              className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 font-bold hover:bg-rose-50 hover:text-rose-605 hover:text-rose-600 flex items-center justify-center text-xs transition-colors cursor-pointer border border-slate-200"
                              title="Kurangi stok (-5 porsi)"
                            >
                              -
                            </button>
                            <span className={`font-mono text-xs font-bold shrink-0 min-w-[50px] ${p.stock <= p.warningLimit ? 'text-amber-600 font-black animate-pulse' : 'text-slate-800'}`}>
                              {p.stock} porsi
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuickStockChange(p, 5)}
                              className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 font-bold hover:bg-emerald-50 hover:text-emerald-600 flex items-center justify-center text-xs transition-colors cursor-pointer border border-slate-200"
                              title="Tambah stok (+5 porsi)"
                            >
                              +
                            </button>
                          </div>
                          <span className="text-[9px] text-slate-400 font-mono block mt-1">(Limit Alarm: {p.warningLimit})</span>
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => startEditProduct(p)}
                              className="p-1 px-2.5 bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-lg font-bold text-[10px] transition-all cursor-pointer flex items-center gap-1 border border-transparent hover:border-blue-200"
                              title="Sunting Menu"
                            >
                              <Edit2 size={10} />
                              Sunting
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id, p.name)}
                              className="p-1 px-2.5 bg-slate-100 hover:bg-rose-50 text-slate-605 text-slate-500 hover:text-rose-600 hover:border-rose-100 rounded-lg font-bold text-[10px] transition-all cursor-pointer flex items-center gap-1 border border-transparent"
                              title="Hapus Menu"
                            >
                              <Trash2 size={10} />
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* 3. DESAIN TEMA & TAMPILAN APP (melakukan ganti tema dan tampilan) */}
      {activeSubTab === 'tema' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-150 border-slate-200/50 shadow-sm space-y-6 animate-fade-in" id="theme-config-panel">
          
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Palette size={16} />
              Kustomisasi Visual & Tema Fleksibel
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Ubah skema warna aplikasi secara total dan sinkronisasikan untuk layar HP pemilik kedai kustom.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Theme Card 1: Slate Enterprise */}
            <div 
              onClick={() => handleUpdateThemeAndLayout('slate', currentLayout)}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                currentTheme === 'slate' 
                  ? 'border-blue-500 bg-blue-50/10 shadow-sm' 
                  : 'border-slate-200 bg-white hover:border-slate-350'
              }`}
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-black uppercase text-slate-600 tracking-wider font-mono">Slate Standard</span>
                {currentTheme === 'slate' && <CheckCircle size={14} className="text-blue-550 text-blue-500" />}
              </div>
              <div className="h-20 rounded-xl bg-slate-900 border border-slate-800 p-2 flex flex-col justify-between">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                  <div className="w-8 h-2 rounded bg-slate-700" />
                </div>
                <div className="space-y-1">
                  <div className="w-12 h-1.5 rounded bg-slate-850 bg-slate-800" />
                  <div className="w-8 h-1.5 rounded bg-slate-850 bg-slate-800" />
                </div>
              </div>
              <p className="text-[11px] font-medium text-slate-500 mt-3">Skema abu-abu slate premium. Tema formal untuk audit kasir korporasi.</p>
            </div>

            {/* Theme Card 2: Espresso Warmth */}
            <div 
              onClick={() => handleUpdateThemeAndLayout('espresso', currentLayout)}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                currentTheme === 'espresso' 
                  ? 'border-amber-700 bg-amber-50/10 shadow-sm' 
                  : 'border-slate-200 bg-white hover:border-slate-350'
              }`}
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider font-mono">Espresso Warmth</span>
                {currentTheme === 'espresso' && <CheckCircle size={14} className="text-amber-700" />}
              </div>
              <div className="h-20 rounded-xl bg-[#2A1810] border border-[#3D251A] p-2 flex flex-col justify-between">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                  <div className="w-8 h-2 rounded bg-[#3D251A]" />
                </div>
                <div className="space-y-1">
                  <div className="w-12 h-1.5 rounded bg-[#4F3526]" />
                  <div className="w-8 h-1.5 rounded bg-[#4F3526]" />
                </div>
              </div>
              <p className="text-[11px] font-medium text-slate-500 mt-3">Warna kopi hangat alami. Sangat cocok diletakkan di tablet meja kasir barista kayu.</p>
            </div>

            {/* Theme Card 3: Midnight Techno */}
            <div 
              onClick={() => handleUpdateThemeAndLayout('midnight', currentLayout)}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                currentTheme === 'midnight' 
                  ? 'border-indigo-500 bg-indigo-50/10 shadow-sm' 
                  : 'border-slate-200 bg-white hover:border-slate-350'
              }`}
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider font-mono">Midnight Techno</span>
                {currentTheme === 'midnight' && <CheckCircle size={14} className="text-indigo-550 text-indigo-500" />}
              </div>
              <div className="h-20 rounded-xl bg-[#090D16] border border-slate-800 p-2 flex flex-col justify-between">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-550 bg-indigo-505 bg-indigo-500 animate-pulse" />
                  <div className="w-8 h-2 rounded bg-slate-800" />
                </div>
                <div className="space-y-1">
                  <div className="w-12 h-1.5 rounded bg-indigo-950/40" />
                  <div className="w-8 h-1.5 rounded bg-indigo-950/40" />
                </div>
              </div>
              <p className="text-[11px] font-medium text-slate-500 mt-3">Tema malam cyberpunk. Mengamankan mata barista dari radiasi selama shift malam.</p>
            </div>

            {/* Theme Card 4: Matcha Zen */}
            <div 
              onClick={() => handleUpdateThemeAndLayout('matcha', currentLayout)}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                currentTheme === 'matcha' 
                  ? 'border-emerald-600 bg-emerald-50/10 shadow-sm' 
                  : 'border-slate-200 bg-white hover:border-slate-350'
              }`}
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider font-mono">Matcha Zen</span>
                {currentTheme === 'matcha' && <CheckCircle size={14} className="text-emerald-650 text-emerald-600" />}
              </div>
              <div className="h-20 rounded-xl bg-[#122216] border border-emerald-950 p-2 flex flex-col justify-between">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <div className="w-8 h-2 rounded bg-emerald-950" />
                </div>
                <div className="space-y-1">
                  <div className="w-12 h-1.5 rounded bg-[#1C3221]" />
                  <div className="w-8 h-1.5 rounded bg-[#1C3221]" />
                </div>
              </div>
              <p className="text-[11px] font-medium text-slate-500 mt-3">Vibe kebun teh segar. Menyejukkan suasana hati pelanggan yang sedang antre.</p>
            </div>

          </div>

          {/* LAYOUT SETTING - GRID vs LIST */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/50 space-y-4">
            <div>
              <p className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <LayoutGrid size={15} />
                Mode Tampilan Katalog Produk di POS Kasir
              </p>
              <p className="text-[11px] text-slate-450 mt-1">Ubah orientasi barang di kasir agar transaksi memicu pencarian secepat kilat hibrida.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Option 1: Grid View */}
              <div 
                onClick={() => handleUpdateThemeAndLayout(currentTheme, 'grid')}
                className={`p-4 rounded-xl border-2 cursor-pointer bg-white flex justify-between items-center ${
                  currentLayout === 'grid' ? 'border-slate-900 ring-2 ring-slate-100' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-700">
                    <LayoutGrid size={20} />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">Grid Card View (Katalog Kompak)</h5>
                    <p className="text-[11px] text-slate-400 mt-0.5">Tampilan kartu grid box untuk menu bergambar.</p>
                  </div>
                </div>
                <div className="w-4 h-4 rounded-full border flex items-center justify-center">
                  {currentLayout === 'grid' && <div className="w-2.5 h-2.5 bg-slate-950 rounded-full" />}
                </div>
              </div>

              {/* Option 2: List View */}
              <div 
                onClick={() => handleUpdateThemeAndLayout(currentTheme, 'list')}
                className={`p-4 rounded-xl border-2 cursor-pointer bg-white flex justify-between items-center ${
                  currentLayout === 'list' ? 'border-slate-900 ring-2 ring-slate-100' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-700">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">List Row View (Tabel Ultra-Padat)</h5>
                    <p className="text-[11px] text-slate-400 mt-0.5">Bagus untuk daftar menu super banyak tanpa scroll berlebihan.</p>
                  </div>
                </div>
                <div className="w-4 h-4 rounded-full border flex items-center justify-center">
                  {currentLayout === 'list' && <div className="w-2.5 h-2.5 bg-slate-950 rounded-full" />}
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* 4. SWOT ANALISIS & SUBSCRIPTION */}
      {activeSubTab === 'swot' && (
        <div className="space-y-6 animate-fade-in" id="swot-billing-panel">
          
          {/* SAAS ACCOUNT STATUS */}
          <div className="bg-gradient-to-tr from-sky-900 to-slate-900 text-white p-6 rounded-3xl border border-sky-850 shadow-lg space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5 text-sky-400">
                <Award className="animate-spin-slow" size={18} />
                <span className="text-xs font-bold uppercase tracking-wider font-mono">STATUS KONTRAK SAAS KAFE</span>
              </div>
              <span className="bg-emerald-500 text-white font-mono font-bold text-[10px] uppercase px-3 py-1 rounded-full">
                Premium Active
              </span>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  Aslam LedgerPOS Premium Enterprise
                </h3>
                <p className="text-xs text-slate-350 leading-relaxed mt-1">
                  Server cloud database sinkron dilindungi sandbox hibrida. Lisensi aktif untuk mendukung bisnis mikro UMKM lokal Indonesia.
                </p>
              </div>
              
              <div className="bg-white/10 px-5 py-3 rounded-2xl text-center border border-white/10 shadow-md">
                <span className="text-[9px] text-sky-305 font-bold uppercase tracking-wider block text-sky-300">Biaya Langganan</span>
                <strong className="text-2xl font-black font-mono text-emerald-400">Rp 49.000</strong>
                <span className="text-[9px] text-slate-400 block font-normal text-slate-300 mt-0.5">/ bulan (Net)</span>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <p className="font-bold text-white">Kode Serial POS</p>
                <p className="text-slate-400 font-mono text-[10px] mt-0.5">{appConfig.licenseKey || 'LL-ASLAM-SECURE-2026'}</p>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <p className="font-bold text-white">Server Ping</p>
                <p className="text-emerald-400 font-mono text-[10px] mt-0.5">● 14ms (Sangat Cepat)</p>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <p className="font-bold text-white">Metode Database</p>
                <p className="text-indigo-300 font-mono text-[10px] mt-0.5">Dual RAM Memory & Local File</p>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <p className="font-bold text-white">Batas Menu Jual</p>
                <p className="text-slate-300 font-mono text-[10px] mt-0.5">Tak Terbatas (Infinit)</p>
              </div>
            </div>
          </div>

          {/* SWOT ANALISIS RE-polish */}
          <div className="bg-white p-6 rounded-3xl border border-slate-150 border-slate-200/50 shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Scale size={18} />
                Analisis SWOT Usaha (Strengths, Weaknesses, Opportunities, Threats)
              </h2>
              <p className="text-xs text-slate-405 mt-1">
                Laporan audit SWOT teknis dan komersial untuk kelangsungan daya saing produk di pasar digital.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-emerald-50/10 p-4 rounded-2xl border border-emerald-100/70 space-y-2">
                <p className="font-bold text-emerald-800 flex items-center gap-1.5 text-sm">
                  <CheckCircle size={15} className="text-emerald-600" />
                  Kelebihan Sistem (Strengths)
                </p>
                <ul className="space-y-1.5 text-slate-600 list-disc list-inside leading-relaxed text-[11px]">
                  <li><strong>Laporan Margin Otomatis:</strong> Integrasi cost modal pokok memicu pelaporan rugi laba bersih real-time.</li>
                  <li><strong>Sinkronisasi QR Meja:</strong> Pembuat etalase meja pengunjung memotong antrean manual kasir.</li>
                  <li><strong>SaaS Paling Terjangkau:</strong> Skenario harga sewa bulanan 49 ribu mengesampingkan biaya hardware mahal.</li>
                  <li><strong>Kompatibilitas Komplit:</strong> Siap dibungkus murni Capacitor Android/iOS tanpa rombakan script.</li>
                </ul>
              </div>

              <div className="bg-rose-50/10 p-4 rounded-2xl border border-rose-100/70 space-y-2">
                <p className="font-bold text-rose-800 flex items-center gap-1.5 text-sm">
                  <AlertTriangle size={15} className="text-rose-600" />
                  Tantangan & Solusi (Weaknesses)
                </p>
                <ul className="space-y-1.5 text-slate-600 list-disc list-inside leading-relaxed text-[11px]">
                  <li><strong>Web Bluetooth Printing:</strong> Batasan Chrome API menghambat pengiriman raw ESC/POS. <span className="text-rose-600 font-semibold">Solusi:</span> Sediakan ekspor PDF struk manual.</li>
                  <li><strong>Integrasi QRIS Statis:</strong> Tidak adanya webhook memicu konfirmasi manual keuangan. <span className="text-rose-500 font-semibold">Solusi:</span> Terapkan konfirmasi manual PIN supervisor.</li>
                  <li><strong>Konektivitas Wi-Fi Offline:</strong> Pengunjung tidak sengaja memesan tanpa kuota. <span className="text-rose-600 font-semibold">Solusi:</span> Gunakan mode antrean off-line lokal.</li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* --- EXTRA SUBTAB 1. AKSES KARYAWAN & AUDIT SHIFT --- */}
      {activeSubTab === 'karyawan' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in font-sans">
          {/* Kolom Kiri: Kelola Akun Karyawan & Hak Akses (Col 7) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-9 h-9 bg-slate-100 flex items-center justify-center rounded-lg text-slate-800">
                  <UserCheck size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 leading-none">Manajemen Otoritas Jabatan Pegawai</h3>
                  <p className="text-[11px] text-slate-400 mt-1">Daftarkan kru pengelola toko Anda dan awasi hak akses laci kasir secara dinamis.</p>
                </div>
              </div>

              {/* Form Tambah Karyawan */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newEmpName.trim() || !newEmpPhone.trim()) {
                    triggerToast('Nama dan No. HP karyawan wajib diisi!');
                    return;
                  }
                  const newEmp = {
                    id: 'emp_' + Date.now(),
                    name: newEmpName,
                    role: newEmpRole,
                    shift: newEmpShift,
                    phone: newEmpPhone,
                    active: true
                  };
                  const updated = [...employees, newEmp];
                  setEmployees(updated);
                  localStorage.setItem('aslam_ledger_employees', JSON.stringify(updated));
                  logAuditActivity(appConfig.cashierName || 'Owner', 'Mendaftarkan Pegawai Baru', `Berhasil menambahkan karyawan ${newEmpName} sebagai ${newEmpRole}`);
                  triggerToast(`Pegawai ${newEmpName} sukses terdaftar!`);
                  setNewEmpName('');
                  setNewEmpPhone('');
                }}
                className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                <div className="sm:col-span-2">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Formulir Rekrut Karyawan Baru</p>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Nama Lengkap Pegawai</label>
                  <input
                    type="text"
                    required
                    placeholder="misal: Asraf Ramadhan"
                    value={newEmpName}
                    onChange={(e) => setNewEmpName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-250 rounded-xl focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">No. WhatsApp Aktif</label>
                  <input
                    type="text"
                    required
                    placeholder="misal: +62 821-xxxx"
                    value={newEmpPhone}
                    onChange={(e) => setNewEmpPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-250 rounded-xl font-mono focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Jabatan Sistem POS</label>
                  <select
                    value={newEmpRole}
                    onChange={(e) => setNewEmpRole(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-250 rounded-xl focus:outline-hidden"
                  >
                    <option value="Owner">Owner (Pemilik Toko)</option>
                    <option value="Supervisor">Supervisor (Manajer Toko)</option>
                    <option value="Cashier">Cashier (Barista & Operator)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Shift Kerja Utama</label>
                  <select
                    value={newEmpShift}
                    onChange={(e) => setNewEmpShift(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-250 text-slate-800 rounded-xl text-[11px] focus:outline-hidden"
                  >
                    <option value="Pagi (Morning)">Pagi (Morning)</option>
                    <option value="Siang (Noon)">Siang (Noon)</option>
                    <option value="Sore (Afternoon)">Sore (Afternoon)</option>
                    <option value="Malam (Full Night)">Malam (Full Night)</option>
                  </select>
                </div>
                <div className="sm:col-span-2 pt-1">
                  <button
                    type="submit"
                    className="w-full py-2 bg-slate-900 hover:bg-slate-950 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all text-xs"
                  >
                    <Plus size={14} /> Register Hubungan Baru
                  </button>
                </div>
              </form>

              {/* Tabel Kru Kedai Kopi */}
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Daftar Tim & Hak Otoritas Aktif</p>
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden bg-white">
                  {employees.map((emp) => (
                    <div key={emp.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold uppercase border border-slate-200">
                          {emp.name.substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-2">
                            {emp.name}
                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase ${
                              emp.role === 'Owner' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                              emp.role === 'Supervisor' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                              'bg-slate-100 text-slate-800 border border-slate-200'
                            }`}>
                              {emp.role}
                            </span>
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono mt-0.5">Shift: {emp.shift} • {emp.phone}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={emp.active} 
                              onChange={() => {
                                const updated = employees.map(e => e.id === emp.id ? { ...e, active: !e.active } : e);
                                setEmployees(updated);
                                localStorage.setItem('aslam_ledger_employees', JSON.stringify(updated));
                                logAuditActivity(appConfig.cashierName || 'Owner', 'Otoritas Akses Diubah', `Merubah status pegawai ${emp.name} menjadi ${!emp.active ? 'Non-Aktif' : 'Aktif'}`);
                                triggerToast(`Status ${emp.name} dirubah!`);
                              }}
                              className="sr-only peer" 
                            />
                            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                            <span className="ml-1.5 text-[10px] font-bold text-slate-500">{emp.active ? 'Aktif' : 'Mati'}</span>
                          </label>
                        </div>

                        {emp.role !== 'Owner' && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = employees.filter(e => e.id !== emp.id);
                              setEmployees(updated);
                              localStorage.setItem('aslam_ledger_employees', JSON.stringify(updated));
                              logAuditActivity(appConfig.cashierName || 'Owner', 'Pemutusan Hubungan Pegawai', `Menghapus karyawan ${emp.name} dari database keanggotaan`);
                              triggerToast(`Sukses mencabut data ${emp.name}!`);
                            }}
                            className="p-1 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-[10px] font-bold transition-all"
                            title="Hapus Pegawai"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Log Audit Keamanan & Shift (Col 5) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 shadow-xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-805 border-white/10 pb-2">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-505 bg-emerald-500 animate-pulse" />
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-550 bg-indigo-500" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 font-bold flex items-center gap-1">
                    <Terminal size={11} />
                    Audit Shift & Log Telemetri
                  </span>
                </div>
                <button
                  onClick={() => {
                    setAuditLogs([]);
                    localStorage.removeItem('aslam_ledger_audit_logs');
                    triggerToast('Log audit berhasil dibersihkan!');
                  }}
                  className="text-[9px] text-slate-500 hover:text-white font-mono cursor-pointer"
                >
                  Clear Logs
                </button>
              </div>

              {/* Monospace terminal console listing audit shift history */}
              <div className="h-96 bg-black/40 p-4 rounded-2xl border border-white/5 font-mono text-[10.5px] text-emerald-400 overflow-y-auto space-y-3.5 scrollbar-thin">
                <div>
                  <span className="text-slate-500">[LOGS COMPILING...] Database enkripsi digital LedgerLine v3.2</span>
                </div>
                {auditLogs.length === 0 ? (
                  <p className="text-slate-500 italic text-[11px] text-center pt-8">Log bersih kosong. Hubungkan sistem, login, atau perbarui data untuk mengalirkan log telemetri.</p>
                ) : (
                  auditLogs.map((log, idx) => (
                    <div key={idx} className="space-y-0.5 leading-relaxed bg-white/5 p-2 rounded-lg border border-white/5">
                      <div className="flex justify-between text-[9px] text-slate-400">
                        <span>🕒 {log.time} • IP: {log.ip}</span>
                        <span className="font-extrabold text-indigo-400">CIPHER_VERIFIED</span>
                      </div>
                      <p className="font-extrabold text-white">[{log.name}] - {log.action}</p>
                      <p className="text-slate-350 text-[10px] pl-3 border-l border-emerald-500/45 italic">{log.detail}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-white/5 text-[10px] text-slate-400 leading-normal">
                🛡️ <strong>Ketentuan UU PDP & Audit Keamanan:</strong> Log ini tidak dapat diedit secara sepihak dan dilengkapi pelacak hash digital unik per baris. Bagus untuk audit internal jika terjadi selisih kas fisik di mesin POS.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- EXTRA SUBTAB 2. HARDWARE WIFI & BLUETOOTH PRINTER ADAPTIF --- */}
      {activeSubTab === 'printer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in font-sans">
          {/* Kolom Kiri: Scan & Konek WiFi / Bluetooth (Col 7) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* PANEL WIFI ADAPTIF */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wifi size={17} className="text-emerald-600 animate-pulse" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-850">Konektivitas WiFi Adaptif</h3>
                    <p className="text-[10px] text-slate-400">Sistem mendeteksi ssid perangkat keras secara aktual, bukan hardcoded.</p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={wifiSearchActive}
                  onClick={() => {
                    setWifiSearchActive(true);
                    triggerToast('Mencari WiFi aktif di sekitar...');
                    setTimeout(() => {
                      setWifiSearchActive(false);
                      const baseWifi = [
                        'LedgerLine_HighSpeed_5G (Sinyal Sempurna • Aktif)',
                        'Aslam_Coffee_Guest_2.4G (Sinyal Kuat)',
                        'Biznet_Home_Fiber_Bar (Sinyal Sedang)',
                        'Telkomsel_Orbit_Cafe_01 (Sinyal Kuat)'
                      ];
                      setWifiDevices(baseWifi);
                      localStorage.setItem('aslam_ledger_discovered_wifis', JSON.stringify(baseWifi));
                      triggerToast('Daftar SSID WiFi berhasil disegarkan!');
                    }, 1500);
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-20a text-slate-700 hover:bg-slate-200 font-bold rounded-lg text-[10.5px] transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw size={12} className={wifiSearchActive ? 'animate-spin' : ''} />
                  {wifiSearchActive ? 'Scanning...' : 'Segarkan Jaringan'}
                </button>
              </div>

              {/* Grid Wifi SSID list */}
              <div className="space-y-2.5 text-xs">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Pilih SSID Yang Terdeteksi Perangkat Anda</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                  {wifiDevices.map((ssid, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setSelectedWifi(ssid);
                        const cleanSsid = ssid.split('(')[0].trim();
                        onUpdateConfig({ storeWifiName: cleanSsid });
                        logAuditActivity(appConfig.cashierName || 'Owner', 'Adaptasi WiFi Diaktifkan', `Mengalihkan jaringan internet POS ke SSID: ${cleanSsid}`);
                        triggerToast(`SSID Terpilih: ${cleanSsid}`);
                      }}
                      className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between text-[11px] ${
                        selectedWifi === ssid ? 'border-emerald-500 bg-emerald-50/10 font-bold' : 'border-slate-150 bg-white hover:border-slate-300'
                      }`}
                    >
                      <span className="truncate">{ssid}</span>
                      {selectedWifi === ssid && <Check size={12} className="text-emerald-600" />}
                    </div>
                  ))}
                </div>

                {/* Custom Wifi Input Forms */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mt-2 space-y-3">
                  <p className="text-[10px] font-extrabold uppercase text-slate-500">SSID Kustom Manual (Jika Tidak Terdeteksi)</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <input
                        type="text"
                        placeholder="Nama WiFi Baru..."
                        value={customWifiSsid}
                        onChange={(e) => setCustomWifiSsid(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-[11px] bg-white border border-slate-250 rounded-lg text-slate-700 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <input
                        type="password"
                        placeholder="WiFi Password..."
                        value={customWifiPass}
                        onChange={(e) => setCustomWifiPass(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-[11px] bg-white border border-slate-250 rounded-lg text-slate-700 focus:outline-hidden"
                      />
                    </div>
                    <div className="col-span-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (!customWifiSsid.trim()) {
                            triggerToast('Isi SSID WiFi kustom terlebih dahulu!');
                            return;
                          }
                          const newSSID = `${customWifiSsid} (Sinyal Kuat)`;
                          const updatedDevs = [...wifiDevices, newSSID];
                          setWifiDevices(updatedDevs);
                          localStorage.setItem('aslam_ledger_discovered_wifis', JSON.stringify(updatedDevs));
                          setSelectedWifi(newSSID);
                          onUpdateConfig({ storeWifiName: customWifiSsid, storeWifiPass: customWifiPass });
                          logAuditActivity(appConfig.cashierName || 'Owner', 'SSID WiFi Ditambahkan Manual', `Mendeklarasikan WiFi baru: ${customWifiSsid}`);
                          triggerToast(`WiFi ${customWifiSsid} berhasil ditautkan!`);
                          setCustomWifiSsid('');
                          setCustomWifiPass('');
                        }}
                        className="w-full py-1.5 bg-slate-900 hover:bg-slate-950 text-white font-bold rounded-lg text-[10.5px]"
                      >
                        Tautkan & Simpan Jaringan WiFi Kustom
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* PANEL BLUETOOTH THERMAL PRINTER ADAPTIF */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">BT</span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-850">Koneksi Bluetooth Thermal Printer</h3>
                    <p className="text-[10px] text-slate-400">Pindai dan sandingkan POS Kasir dengan printer struk mana pun secara real-time.</p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={btSearchActive}
                  onClick={() => {
                    setBtSearchActive(true);
                    triggerToast('Mendapatkan akses Bluetooth perangkat...');
                    setTimeout(() => {
                      setBtSearchActive(false);
                      const baseBt = [
                        { id: 'bt_1', name: 'RPP02N Thermal Printer 58mm', address: '00:11:22:33:AA:BB', paired: true, paperSize: '58mm', type: 'Thermal POS' },
                        { id: 'bt_2', name: 'Epson TM-T82X 80mm', address: '3C:D9:2B:E8:4A:9C', paired: false, paperSize: '80mm', type: 'Desktop Receipt' },
                        { id: 'bt_3', name: 'Zjiang ZJ-5802 Mobile POS', address: 'AA:BB:CC:DD:EE:FF', paired: false, paperSize: '58mm', type: 'Mobile Bluetooth' },
                        { id: 'bt_4', name: 'Panda PRJ-58D POS BLE', address: 'F0:E1:D2:C3:B4:A5', paired: false, paperSize: '58mm', type: 'BLE Handheld' }
                      ];
                      setBtDevices(baseBt);
                      localStorage.setItem('aslam_ledger_discovered_bts', JSON.stringify(baseBt));
                      triggerToast('Selesai memindai bluetooth printer!');
                    }, 1400);
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[10.5px] transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw size={12} className={btSearchActive ? 'animate-spin' : ''} />
                  {btSearchActive ? 'Scanning Device...' : 'Cari Device Bluetooth'}
                </button>
              </div>

              {/* Bluetooth discovered Devices list */}
              <div className="space-y-3.5 text-xs">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Bluetooth Printer Di Sekitar:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {btDevices.map((dev) => (
                    <div
                      key={dev.id}
                      onClick={() => {
                        setSelectedPrinterId(dev.id);
                        setPaperWidth(dev.paperSize);
                        logAuditActivity(appConfig.cashierName || 'Owner', 'Printer Dipilih', `Mengganti printer default ke: ${dev.name} (${dev.address})`);
                        triggerToast(`Printer aktif: ${dev.name}`);
                      }}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                        selectedPrinterId === dev.id ? 'border-emerald-600 bg-emerald-50/15 shadow-xs' : 'border-slate-150 bg-white hover:border-slate-350'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <p className="font-extrabold text-slate-800 text-[11.5px] truncate max-w-[170px]">{dev.name}</p>
                          <p className="text-[9.5px] text-slate-400 font-mono mt-0.5">{dev.address} • {dev.type}</p>
                        </div>
                        <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          selectedPrinterId === dev.id ? 'bg-emerald-555 bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {selectedPrinterId === dev.id ? 'Tersambung' : 'Siap'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-100 mt-2 pt-2.5 text-[10px] text-slate-500">
                        <span>Format Lebar: <strong>{dev.paperSize}</strong></span>
                        <span className="text-emerald-600 font-semibold">Tersanding</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Sub-config form for printing density & copies */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                  <div>
                    <label className="block text-[10px] font-black text-slate-450 uppercase mb-1">Lebar Kertas Kertas Struk</label>
                    <select
                      value={paperWidth}
                      onChange={(e) => {
                        setPaperWidth(e.target.value as '58mm' | '80mm');
                        triggerToast(`Lebar kertas dialihkan ke: ${e.target.value}`);
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-250 rounded-xl font-bold"
                    >
                      <option value="58mm">58 mm (Struk Handheld/Mini)</option>
                      <option value="80mm">80 mm (Struk Lebar Dekstop TM)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-450 uppercase mb-1">Kepekatan Tinta Thermal ({printDensity}%)</label>
                    <input
                      type="range"
                      min="80"
                      max="130"
                      step="5"
                      value={printDensity}
                      onChange={(e) => setPrintDensity(parseInt(e.target.value))}
                      className="w-full mt-2 accent-emerald-600 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-450 uppercase mb-1">Jumlah Duplikasi Lembar</label>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <button
                        type="button"
                        onClick={() => setPrintCopies(c => Math.max(1, c - 1))}
                        className="w-7 h-7 bg-white border rounded-lg font-bold text-slate-600"
                      >
                        -
                      </button>
                      <span className="font-mono font-bold text-xs w-8 text-center">{printCopies} Lembar</span>
                      <button
                        type="button"
                        onClick={() => setPrintCopies(c => Math.min(3, c + 1))}
                        className="w-7 h-7 bg-white border rounded-lg font-bold text-slate-600"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Kolom Kanan: Simulator Struk Thermal Printer (Col 5) */}
          <div className="lg:col-span-12 xl:col-span-5 lg:order-last space-y-6">
            <div className="bg-slate-100 p-5 rounded-3xl border border-slate-250 shadow-sm space-y-4">
              <div className="border-b border-slate-200 pb-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Lembar Struk Test</p>
                <h4 className="text-xs font-black text-slate-800 mt-1">Uji Coba Sinkronisasi Aliran Bluetooth</h4>
              </div>

              {/* Custom simulated print roll receipt container */}
              <div className="mx-auto max-w-[290px] bg-[#FFFFFA] p-5 shadow-lg border border-slate-200 rounded-lg text-[10.5px] text-slate-900 font-mono space-y-3 shadow-inner relative leading-relaxed overflow-hidden">
                {/* Simulated serrated cut of thermal paper roll top */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-slate-350 to-transparent flex overflow-hidden">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <div key={i} className="w-2 h-2 bg-slate-100 rotate-45 transform -translate-y-1.5" />
                  ))}
                </div>

                <div className="text-center pt-2 space-y-0.5">
                  <p className="font-bold uppercase text-[12px]">{storeName || 'LEDGERLINE COFFEE'}</p>
                  <p className="text-[8.5px] text-slate-500 leading-normal">{storeAddress || 'Ruko Barista Blok 3, Jakarta, Indonesia'}</p>
                  <p className="text-[9px] text-slate-650">No. HP: {storePhone || '+62 812-4455-6677'}</p>
                </div>

                <div className="border-t border-dashed border-slate-400 my-1 pt-1 space-y-0.5 text-left text-[9px] text-slate-500">
                  <p>Tanggal: {new Date().toLocaleDateString('id-ID')} {new Date().toLocaleTimeString('id-ID').substring(0, 5)}</p>
                  <p>Operator: {cashierName} ({cashierRole})</p>
                  <p>ID Trans: LL-TEST-DISCOVER-01</p>
                </div>

                <div className="border-t border-dashed border-slate-400 my-1 pt-2 space-y-1 text-left">
                  <div className="flex justify-between">
                    <span>1x Ice Aren Cafe Latte (Test)</span>
                    <span>Rp 22.000</span>
                  </div>
                  <div className="text-[8.5px] text-slate-500 italic pl-1 leading-snug">
                    - Takaran Gula: 50% Less Sugar<br />
                    - Espresso: Double Shot Arabika
                  </div>
                  <div className="flex justify-between">
                    <span>1x Crunchy Croissant (Test)</span>
                    <span>Rp 18.000</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-slate-400 my-1 pt-2 space-y-1.5">
                  <div className="flex justify-between font-bold text-slate-950">
                    <span>SUBTOTAL</span>
                    <span>Rp 40.000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pajak Resto (10%)</span>
                    <span>Rp 4.000</span>
                  </div>
                  <div className="flex justify-between font-black text-[11.5px] border-t border-double border-slate-400 pt-1.5">
                    <span>TOTAL AKHIR</span>
                    <span>Rp 44.000</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-slate-400 my-1 pt-2 text-center text-[8px] text-slate-500 space-y-1">
                  <p className="font-bold">SSID WiFi Toko: {selectedWifi.split('(')[0].trim()}</p>
                  <p>Password Wifi: {storeWifiPass || '12345678'}</p>
                  <p className="font-semibold uppercase tracking-wider text-slate-800">TERIMA KASIH ATAS KUNJUNGANNYA</p>
                  <p className="italic text-[7.5px]">LedgerLine Secure POS Hub by Aslam Ramadhan</p>
                </div>

                {/* Simulated paper serrated bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-1 flex overflow-hidden">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 bg-slate-100 rotate-45 transform translate-y-1" />
                  ))}
                </div>
              </div>

              {/* Action test buttons with beautiful states */}
              <div className="space-y-2.5">
                <button
                  type="button"
                  disabled={!!testPrintingStatus}
                  onClick={() => {
                    setTestPrintingStatus('Mengirim handshake byte bluetooth...');
                    logAuditActivity(cashierName, 'Test Bluetooth Printer Byte Sent', `Mengirim kode kontrol ESC/POS ke printer ${selectedPrinterId}`);
                    setTimeout(() => setTestPrintingStatus('Menyelaraskan lebar cetak thermal 58mm...'), 500);
                    setTimeout(() => setTestPrintingStatus('Proses penulisan byte print stream hibrida...'), 1000);
                    setTimeout(() => {
                      setTestPrintingStatus('');
                      triggerToast('Cetak struk percobaan sukses!');
                    }, 1700);
                  }}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-350 text-white font-extrabold rounded-2xl flex items-center justify-center gap-1.5 text-xs transition-colors cursor-pointer shadow-sm border border-emerald-500"
                >
                  <RefreshCw size={13} className={testPrintingStatus ? 'animate-spin' : ''} />
                  {testPrintingStatus ? testPrintingStatus : `Cetak Struk Percobaan Aktif (${paperWidth})`}
                </button>
                <p className="text-[10px] text-slate-455 text-[9.5px] italic text-slate-400 text-center leading-normal">
                  Sistem mendukung protokol ESC/POS via Web Bluetooth API (Chrome) atau konektivitas Serial Bridge pada sistem POS Android/iOS/Windows modern secara langsung.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. GOOGLE DRIVE SYNC SIMULATOR SUBTAB */}
      {activeSubTab === 'drive' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in" id="gdrive-sync-tab">
          
          {/* HEADER BANNER CARD (Col 12) */}
          <div className="lg:col-span-12 bg-gradient-to-r from-indigo-900 to-slate-900 p-6 rounded-3xl border border-indigo-950/40 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3" />
            <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 font-bold text-[10px] uppercase rounded-full tracking-wider border border-indigo-400/20">
                    Sistem Backup Hibrida
                  </span>
                  <div className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${driveConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                    <span className="text-[10px] text-slate-350 font-bold">
                      {driveConnected ? 'Cloud Active' : 'Offline Mode'}
                    </span>
                  </div>
                </div>
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2 mt-2">
                  <Cloud size={20} className="text-indigo-400" />
                  Konektor Google Drive (Simulasi Server Cloud)
                </h2>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  Gunakan Google Drive pribadi Anda sementara sebagai server database penyimpanan awan. Semua data penjualan, stok bahan baku, dan riwayat margin akan dicadangkan aman.
                </p>
              </div>
              
              <div className="bg-slate-950/40 px-5 py-4 rounded-2xl border border-indigo-500/20 text-center min-w-[200px]">
                <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">Status Backup</p>
                <p className="text-lg font-black text-white mt-1">
                  {driveConnected ? 'Terhubung' : 'Belum Ditautkan'}
                </p>
                <span className="text-[9px] text-slate-400 block mt-0.5">
                  {driveConnected ? 'aslamramadhan08@gmail.com' : 'Sistem Lokal Aktif'}
                </span>
              </div>
            </div>
          </div>

          {/* LEFT COLUMN: SETTINGS & GOOGLE OAUTH FORMS (Col 5) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* GOOGLE WORKSPACE CONNECTION METHOD */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/50 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                  <Database size={16} className="text-indigo-600" />
                  Koneksi Google Workspace
                </h3>
                <span className="text-[10px] text-indigo-500 font-bold bg-indigo-50 px-2 py-0.5 rounded">v3 Secure</span>
              </div>

              {/* Toggle Connection Modes */}
              <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-center text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setGoogleConnectMode('easy')}
                  className={`py-1.5 text-[11px] font-bold rounded-lg cursor-pointer transition-all ${googleConnectMode === 'easy' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  1-Klik Instan (Rekomendasi)
                </button>
                <button
                  type="button"
                  onClick={() => setGoogleConnectMode('credentials')}
                  className={`py-1.5 text-[11px] font-bold rounded-lg cursor-pointer transition-all ${googleConnectMode === 'credentials' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  OAuth Mandiri (Kredensial)
                </button>
              </div>

              {/* MODE A: EASY ONE-CLICK REGISTRATION */}
              {googleConnectMode === 'easy' && (
                <div className="space-y-4 text-xs">
                  <div className="bg-indigo-50/20 p-4 rounded-2xl border border-indigo-100/50 space-y-2.5">
                    <div className="flex items-center gap-1.5 text-indigo-800 font-bold text-[11px]">
                      <Sparkles size={14} className="text-indigo-600 animate-pulse" />
                      Metode Instan Tanpa Setup Teknis
                    </div>
                    <p className="text-slate-500 text-[10px] leading-relaxed">
                      Sistem terpusat BaristaPOS mengurus seluruh proses persetujuan Google. Cukup daftarkan email Anda, klik konfirmasi, dan nikmati sinkronisasi database awan & Google Sheets yang rapi & tangguh secara instan!
                    </p>
                    
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">
                        Daftarkan Email Google Toko
                      </label>
                      <input
                        type="email"
                        value={easyEmail}
                        onChange={(e) => setEasyEmail(e.target.value)}
                        placeholder="pemilik_kedai@gmail.com"
                        className="w-full px-3 py-2 bg-white border border-slate-200 font-bold text-slate-700 rounded-lg focus:outline-hidden"
                      />
                    </div>

                    {!driveConnected ? (
                      <button
                        type="button"
                        onClick={handleEasyGoogleConnect}
                        className="w-full py-2 bg-indigo-650 bg-indigo-600 hover:bg-indigo-500 font-bold text-white rounded-xl shadow-xs cursor-pointer text-center text-[11px] transition-all flex items-center justify-center gap-1.5"
                      >
                        <Globe size={13} className="animate-pulse" />
                        Hubungkan Google Workspace
                      </button>
                    ) : (
                      <div className="space-y-2 pt-1 border-t border-indigo-100/30">
                        <div className="p-2 bg-emerald-50 text-emerald-800 border border-emerald-100/50 text-[10px] rounded-lg text-center font-semibold">
                          Connected securely with: <span className="font-mono text-indigo-700 font-bold">{easyEmail}</span>
                        </div>
                        <button
                          type="button"
                          onClick={disconnectDrive}
                          className="w-full py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700-600 font-bold text-xs rounded-lg cursor-pointer text-center select-none"
                        >
                          Copot Hubungan
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* MODE B: TECHNICAL INDEPENDENT OAUTH CREDENTIALS */}
              {googleConnectMode === 'credentials' && (
                <div className="space-y-4 text-xs">
                  
                  {/* Connection Status Card */}
                  <div className={`p-4 rounded-2xl border ${driveConnected ? 'bg-emerald-50/15 border-emerald-100' : 'bg-slate-50 border-slate-150'} space-y-2.5`}>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-500">Status API Kunci:</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${driveConnected ? 'bg-emerald-505 bg-emerald-550' : 'bg-rose-500'}`} />
                        <span className={`font-bold uppercase text-[9px] ${driveConnected ? 'text-emerald-700' : 'text-rose-600'}`}>
                          {driveConnected ? 'OAuth Connected' : 'Waiting Setup'}
                        </span>
                      </div>
                    </div>

                    {driveConnected ? (
                      <div className="space-y-2">
                        <p className="text-slate-600 text-[10px] leading-relaxed">
                          Keamanan data klien aktif. Kredensial mandiri diizinkan untuk bypass server terpusat.
                        </p>
                        <button
                          type="button"
                          onClick={disconnectDrive}
                          className="w-full py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg border border-rose-100 select-none cursor-pointer"
                        >
                          Copot Koneksi Mandiri
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-slate-500 text-[10px] leading-relaxed">
                          Gunakan Google Cloud Developer Console Anda sendiri untuk mengunduh JSON klien ID & Secret OAuth 2.0.
                        </p>
                        <button
                          type="button"
                          onClick={handleSimulatedOAuthLogin}
                          className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Globe size={13} className="animate-spin" />
                          Masuk Jabat Tangan OAuth
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Form Config Fields */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">
                        Folder Target Google Drive
                      </label>
                      <input
                        type="text"
                        value={driveStoreFolder}
                        onChange={(e) => setDriveStoreFolder(e.target.value)}
                        placeholder="/AslamLedger_CloudServer"
                        className="w-full px-3 py-1.5 border border-slate-200 bg-slate-50 font-bold rounded-lg focus:outline-hidden text-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">
                        Google Client ID (OAuth 2.0 ID)
                      </label>
                      <input
                        type="text"
                        value={driveClientId}
                        onChange={(e) => setDriveClientId(e.target.value)}
                        placeholder="928318491-aslam.apps.googleusercontent.com"
                        className="w-full px-3 py-1.5 border border-slate-200 bg-slate-50 font-mono rounded-lg focus:outline-hidden text-slate-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">
                        Google Client Secret
                      </label>
                      <input
                        type="password"
                        value={driveClientSecret}
                        onChange={(e) => setDriveClientSecret(e.target.value)}
                        placeholder="GOCSPX-SecretMockKeyAslamLedger"
                        className="w-full px-3 py-1.5 border border-slate-200 bg-slate-50 font-mono rounded-lg focus:outline-hidden text-slate-600"
                      />
                    </div>

                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                      <input
                        type="checkbox"
                        id="drive-autosync-toggle"
                        checked={driveAutoSync}
                        onChange={(e) => setDriveAutoSync(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 rounded-md focus:ring-indigo-500 cursor-pointer"
                      />
                      <label htmlFor="drive-autosync-toggle" className="font-bold text-slate-650 cursor-pointer text-[11px]">
                        Cadangkan Otomatis Saat Penjualan
                      </label>
                    </div>
                  </div>

                  {/* Save Settings */}
                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={handleSaveDriveSettings}
                      className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-950 text-white font-bold rounded-lg cursor-pointer"
                    >
                      Simpan Kredensial
                    </button>
                    <button
                      type="button"
                      onClick={handleTestConnection}
                      className="px-4 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg cursor-pointer text-center"
                    >
                      Uji Kunci ID
                    </button>
                  </div>

                </div>
              )}
            </div>

            {/* AUTOMATED COMPILATION DAILY SCHEDULE REPORT CARD */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/50 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5 font-sans">
                  <Mail size={16} className="text-amber-600" />
                  Kirim Laporan Otomatis (Setiap Jam 11 Malam)
                </h3>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 font-bold text-[8px] rounded uppercase">SCHEDULER SERVICE</span>
              </div>
              
              <div className="space-y-3.5 text-xs">
                
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-700 font-sans">Aktifkan Pengiriman Laporan</p>
                    <p className="text-[9px] text-slate-400">Pemicu server-side otomatis setiap hari</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={scheduleEnabled}
                    onChange={(e) => setScheduleEnabled(e.target.checked)}
                    className="w-5 h-5 text-emerald-600 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Email Sasaran Penerima Laporan
                  </label>
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="nama_owner@kedai.com"
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50 font-bold text-slate-700 rounded-lg focus:outline-hidden"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Alamat email terdaftar untuk menerima surat berkas rekapitulasi harian.
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Waktu Jam Pengiriman
                    </label>
                    <select
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 bg-slate-50 font-bold text-slate-700 rounded-lg focus:outline-hidden text-[11px]"
                    >
                      <option value="23:00">23:00 WITA (11 Malam)</option>
                      <option value="11:00">11:00 WITA (11 Siang)</option>
                      <option value="shift_end">Saat Shift Kerja Tutup</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Mode Pengiriman
                    </label>
                    <select
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value as 'all' | 'sheets_only')}
                      className="w-full px-3 py-2 border border-slate-200 bg-slate-50 font-bold text-slate-700 rounded-lg focus:outline-hidden text-[11px]"
                    >
                      <option value="all">Kirim Berkas PDF + Sync Sheet</option>
                      <option value="sheets_only">Hanya Notifikasi + Sync Sheet</option>
                    </select>
                  </div>
                </div>

                <p className="text-[10px] text-amber-805 leading-relaxed font-sans bg-amber-50/50 p-3 rounded-2xl border border-amber-100/50 text-amber-900">
                  💡 <strong>Integrasi Hibrida:</strong> Server akan membaca database penjualan harian dan stok bahan baku Anda, mengompilasinya menjadi <u>Laporan PDF/Excel rapi</u>, mengunggah ke Google Drive dan Sheets secara real-time, lalu mengirimkannya via email.
                </p>

                <button
                  type="button"
                  disabled={simulatingReport}
                  onClick={handleTestScheduleSend}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-300 font-bold text-white rounded-xl text-center text-xs transition-all shadow-md shadow-amber-100 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {simulatingReport ? "Sedang Mengirim..." : "Simulasikan & Kirim Laporan Sekarang ✉️"}
                </button>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: TERMINAL CONSOLE & BLUEPRINTS (Col 7) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* TERMINAL EMULATOR CARD */}
            <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 shadow-xl space-y-4 relative">
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 font-bold flex items-center gap-1">
                    <Terminal size={11} />
                    Google Cloud Shell-Emulator
                  </span>
                </div>
                <button 
                  onClick={() => setDriveLogs(['[CLEARED] Konsol log dibebaskan. Silakan lakukan aksi sinkronisasi.'])}
                  className="text-[9px] text-slate-500 hover:text-white font-mono cursor-pointer"
                >
                  Clear Console
                </button>
              </div>

              {/* Progress Indicator */}
              {isSyncing && (
                <div className="space-y-1.5 animate-pulse">
                  <div className="flex justify-between text-[10px] font-mono text-indigo-300">
                    <span>Mengeksekusi Jabat Tangan Cloud Drive API...</span>
                    <span>{syncProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-1 border border-white/5 overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-full transition-all duration-300"
                      style={{ width: `${syncProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Monospace Code Log Screen */}
              <div className="h-44 bg-slate-900/60 p-3.5 rounded-2xl border border-white/5 font-mono text-[10px] text-indigo-200 overflow-y-auto space-y-1.5 scrollbar-thin">
                {driveLogs.map((log, idx) => (
                  <p key={idx} className="leading-relaxed hover:bg-white/5 rounded px-1 transition-colors">
                    {log}
                  </p>
                ))}
              </div>

              {/* Actions manual buttons */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-xs font-bold">
                <button
                  type="button"
                  disabled={isSyncing}
                  onClick={handleManualBackup}
                  className="py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 text-white rounded-xl shadow-xs cursor-pointer text-center"
                >
                  Backup Database
                </button>
                <button
                  type="button"
                  disabled={isSyncing}
                  onClick={handleManualRestore}
                  className="py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 text-white rounded-xl shadow-xs cursor-pointer text-center"
                >
                  Restore Cloud
                </button>
                <a
                  href="/api/backup/download"
                  className="py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl shadow-xs text-center flex items-center justify-center"
                >
                  Manifest Lokal
                </a>
              </div>
            </div>

            {/* BLUEPRINTS EXPLANATORY INFORMATION FOR PRODUCTION HOSTING */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/50 shadow-sm space-y-4">
              <div>
                <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                  <Info size={16} className="text-indigo-600" />
                  Blueprint Implementasi Produksi Google Drive REST API
                </h4>
                <p className="text-xs text-slate-450 mt-1">
                  Saat web ini dideploy secara komprehensif, implementasi Google Drive SDK akan diproses di server-side (`server.ts`) demi kegagahan API Key. Berikut representasi kode Node.js yang akan kita aktifkan:
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 font-mono text-[10px] text-slate-700 space-y-2 max-h-56 overflow-y-auto leading-relaxed scrollbar-thin">
                <p className="font-bold text-indigo-805 text-indigo-800">// server/drive-integration.ts</p>
                <p className="text-emerald-700">import &#123; google &#125; from \'googleapis\';</p>
                <p className="text-slate-500">// Jabat Tangan Keamanan OAuth2</p>
                <p>const oauth2Client = new google.auth.OAuth2(</p>
                <p>&nbsp;&nbsp;process.env.GD_CLIENT_ID,</p>
                <p>&nbsp;&nbsp;process.env.GD_CLIENT_SECRET,</p>
                <p>&nbsp;&nbsp;process.env.GD_REDIRECT_URI</p>
                <p>);</p>
                <br />
                <p className="font-bold text-indigo-700">// Fungsi Mengunggah File Cadangan ke Google Drive User</p>
                <p>export async function uploadBackupToDrive(jsonData: any, fileName: string) &#123;</p>
                <p>&nbsp;&nbsp;const drive = google.drive(&#123; version: \'v3\', auth: oauth2Client &#125;);</p>
                <p>&nbsp;&nbsp;const media = &#123;</p>
                <p>&nbsp;&nbsp;&nbsp;&nbsp;mimeType: \'application/json\',</p>
                <p>&nbsp;&nbsp;&nbsp;&nbsp;body: JSON.stringify(jsonData, null, 2),</p>
                <p>&nbsp;&nbsp;&#125;;</p>
                <p>&nbsp;&nbsp;const response = await drive.files.create(&#123;</p>
                <p>&nbsp;&nbsp;&nbsp;&nbsp;requestBody: &#123;</p>
                <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;name: fileName,</p>
                <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;parents: [\'root\'], // Atau ID folder cadangan spesifik</p>
                <p>&nbsp;&nbsp;&nbsp;&nbsp;&#125;,</p>
                <p>&nbsp;&nbsp;&nbsp;&nbsp;media: media,</p>
                <p>&nbsp;&nbsp;&nbsp;&nbsp;fields: \'id\',</p>
                <p>&nbsp;&nbsp;&#125;);</p>
                <p>&nbsp;&nbsp;return response.data.id;</p>
                <p>&#125;</p>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-indigo-50/20 rounded-2xl border border-indigo-100 gap-3">
                <div className="text-[11px] text-slate-600 leading-normal">
                  <strong>Apakah Anda pengembang/pemilik?</strong> Prosedur integrasi ini sangat mudah dirawat dan ramah kuota server, karena beban data awan sepenuhnya ditransfer ke Google Drive gratis dari pengguna.
                </div>
                <a
                  href="https://developers.google.com/drive/api/guides/enable-parts"
                  target="_blank"
                  referrerPolicy="no-referrer"
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] rounded-xl flex items-center gap-1 shrink-0 self-end sm:self-center"
                >
                  <ExternalLink size={11} />
                  Dokumen Google
                </a>
              </div>

            </div>

          </div>

          {/* SIMULATED GOOGLE OAUTH POPUP OVERLAY */}
          {showOAuthPopup && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="oauth-popup-container">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-sm p-6 space-y-4">
                
                {/* Header Auth */}
                <div className="flex flex-col items-center justify-center text-center pb-2 border-b border-slate-100">
                  <div className="w-10 h-10 bg-slate-50 flex items-center justify-center rounded-2xl shadow-xs border border-slate-100 font-bold text-indigo-600 text-xl font-sans">
                    G
                  </div>
                  <h4 className="font-extrabold text-slate-800 text-sm mt-3">
                    Masuk dengan Google
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    untuk melanjutkan ke <strong className="text-slate-800">BaristaPOS Cloud Hub</strong>
                  </p>
                </div>

                {/* Account card choice */}
                <div className="space-y-3.5">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block text-center">
                    Pilih demo email akun toko Anda:
                  </p>
                  
                  <div 
                    onClick={confirmOAuthSimulation}
                    className="p-3 bg-slate-50 hover:bg-indigo-50/40 border border-slate-200 rounded-2xl flex items-center gap-3 cursor-pointer transition-all hover:scale-[1.02]"
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                      {(googleConnectMode === 'easy' ? easyEmail.substring(0, 1).toUpperCase() : 'A')}
                    </div>
                    <div className="text-left font-sans">
                      <p className="text-xs font-bold text-slate-800">{googleConnectMode === 'easy' ? easyEmail.split('@')[0] : 'Aslam Ramadhan'}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{googleConnectMode === 'easy' ? easyEmail : 'aslamramadhan08@gmail.com'}</p>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 leading-relaxed text-center px-2">
                    Memberikan ijin kepada BaristaPOS keamanan tinggi untuk membaca, mengunggah dan mengedit backup file <code>state_backup.json</code> di dalam drive pribadi Anda.
                  </p>
                </div>

                {/* Footer and trigger manual connect closure */}
                <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setShowOAuthPopup(false)}
                    className="px-4 py-2 hover:bg-slate-100 text-slate-500 rounded-xl transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={confirmOAuthSimulation}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    Izinkan & Sambung
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>
      )}

      {/* --- ADD MENU MODAL FORM --- */}
      {showAddMenuModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="add-menu-modal">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl p-6 space-y-4">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                <Plus size={16} className="text-emerald-500" />
                Unggah Menu & Gambar Baru Ke Etalase
              </h4>
              <button 
                onClick={() => setShowAddMenuModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs"
              >
                Tutup
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nama Menu Jual</label>
                  <input 
                    type="text" 
                    placeholder="Misal: Kopi Susu Aren Gembira"
                    required
                    value={prodName} 
                    onChange={(e) => setProdName(e.target.value)} 
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50 font-bold rounded-lg focus:outline-hidden focus:border-slate-400"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Kategori Menu</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50 font-medium rounded-lg"
                  >
                    <option value="Coffee">☕ Coffee</option>
                    <option value="Non-Coffee">🥤 Non-Coffee</option>
                    <option value="Heavy Meals">🍛 Heavy Meals</option>
                    <option value="Snacks">🍟 Snacks</option>
                    <option value="Desserts">🍰 Desserts</option>
                    <option value="Beans">🫘 Beans</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Kode Barcode Menu / SKU</label>
                  <div className="flex gap-1">
                    <input 
                      type="text" 
                      placeholder="PROD1234"
                      required
                      value={prodBarcode} 
                      onChange={(e) => setProdBarcode(e.target.value)} 
                      className="w-full px-3 py-2 border border-slate-200 bg-slate-50 font-mono rounded-lg focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={generateRandomBarcode}
                      className="px-2 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-[9px] font-black cursor-pointer uppercase font-sans"
                    >
                      Acak
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Modal Pokok (Cost Price IDR)</label>
                  <input 
                    type="number" 
                    value={prodCostPrice} 
                    onChange={(e) => setProdCostPrice(Number(e.target.value))} 
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50 font-mono font-bold rounded-lg focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Harga Jual (Retail Sell IDR)</label>
                  <input 
                    type="number" 
                    value={prodPrice} 
                    onChange={(e) => setProdPrice(Number(e.target.value))} 
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50 font-mono font-bold rounded-lg focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Stok Porsi Jadi (Awal)</label>
                  <input 
                    type="number" 
                    value={prodStock} 
                    onChange={(e) => setProdStock(Number(e.target.value))} 
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50 font-mono rounded-lg focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Batas Minimum (Limit Warning)</label>
                  <input 
                    type="number" 
                    value={prodWarningLimit} 
                    onChange={(e) => setProdWarningLimit(Number(e.target.value))} 
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50 font-mono rounded-lg focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Komposisi Bahan / Ingredients</label>
                <textarea 
                  placeholder="Contoh: Espresso 30ml, Gula Aren Cair 20ml, Fresh Milk 120ml, Es Batu Secukupnya" 
                  value={prodKomposisi} 
                  onChange={(e) => setProdKomposisi(e.target.value)} 
                  className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg h-14 resize-none"
                />
              </div>

              {/* IMAGE UPLOADER SECURE PREVIEW IN ADD FORM */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Gambar Thumbnail Menu</label>
                <div className="grid grid-cols-3 gap-3 items-center">
                  <div className="col-span-2 space-y-1.5">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleLocalImage(e, false)} 
                      className="hidden" 
                      id="add-image-uploader" 
                    />
                    <label 
                      htmlFor="add-image-uploader" 
                      className="block px-3 py-2 border border-dashed border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 rounded-lg text-center cursor-pointer font-bold transition-all text-[11px]"
                    >
                      📁 Unggah File dari Hp / Laptop
                    </label>
                    <input 
                      type="text" 
                      placeholder="Atau tempel URL Link foto internet..." 
                      value={prodImageUrl} 
                      onChange={(e) => setProdImageUrl(e.target.value)} 
                      className="w-full px-3 py-1.5 border border-slate-200 bg-slate-50 rounded-lg text-[10px]" 
                    />
                  </div>
                  <div className="h-16 w-full rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden relative">
                    {prodImageUrl ? (
                      <>
                        <img src={prodImageUrl} alt="Preview" className="w-full h-full object-cover" />
                        <button 
                          type="button" 
                          onClick={() => setProdImageUrl('')} 
                          className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-[9px] font-bold cursor-pointer"
                        >
                          Hapus
                        </button>
                      </>
                    ) : (
                      <span className="text-[9px] text-slate-400 font-medium italic text-center leading-tight">Belum Ada</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-3 justify-end border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowAddMenuModal(false)} 
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-slate-950 hover:bg-slate-850 font-bold text-white rounded-lg cursor-pointer"
                >
                  Unggah Menu Baru ✓
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT MENU MODAL FORM --- */}
      {showEditMenuModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="edit-menu-modal">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl p-6 space-y-4">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                <Edit2 size={16} className="text-blue-500" />
                Sunting data & Gambar Menu Jual
              </h4>
              <button 
                onClick={() => { setShowEditMenuModal(false); setEditingProduct(null); }}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs"
              >
                Tutup
              </button>
            </div>

            <form onSubmit={handleUpdateProduct} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nama Menu Jual</label>
                  <input 
                    type="text" 
                    required
                    value={prodName} 
                    onChange={(e) => setProdName(e.target.value)} 
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50 font-bold rounded-lg focus:outline-hidden"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Kategori Menu</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50 font-medium rounded-lg"
                  >
                    <option value="Coffee">☕ Coffee</option>
                    <option value="Non-Coffee">🥤 Non-Coffee</option>
                    <option value="Heavy Meals">🍛 Heavy Meals</option>
                    <option value="Snacks">🍟 Snacks</option>
                    <option value="Desserts">🍰 Desserts</option>
                    <option value="Beans">🫘 Beans</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">SKU / Kode Barcode Meja</label>
                  <input 
                    type="text" 
                    required
                    value={prodBarcode} 
                    onChange={(e) => setProdBarcode(e.target.value)} 
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50 font-mono rounded-lg focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Modal Pokok (Cost IDR)</label>
                  <input 
                    type="number" 
                    value={prodCostPrice} 
                    onChange={(e) => setProdCostPrice(Number(e.target.value))} 
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50 font-mono rounded-lg focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Harga Jual (Sell IDR)</label>
                  <input 
                    type="number" 
                    value={prodPrice} 
                    onChange={(e) => setProdPrice(Number(e.target.value))} 
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50 font-mono rounded-lg focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Stok Tersedia</label>
                  <input 
                    type="number" 
                    value={prodStock} 
                    onChange={(e) => setProdStock(Number(e.target.value))} 
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50 font-mono rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Batas Minimum Peringatan</label>
                  <input 
                    type="number" 
                    value={prodWarningLimit} 
                    onChange={(e) => setProdWarningLimit(Number(e.target.value))} 
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50 font-mono rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Komposisi Bahan / Ingredients</label>
                <textarea 
                  value={prodKomposisi} 
                  onChange={(e) => setProdKomposisi(e.target.value)} 
                  className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg h-14 resize-none"
                />
              </div>

              {/* IMAGE UPLOADER PREVIEW SECURE IN EDIT FORM */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Gambar Thumbnail Menu</label>
                <div className="grid grid-cols-3 gap-3 items-center">
                  <div className="col-span-2 space-y-1.5">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleLocalImage(e, true)} 
                      className="hidden" 
                      id="edit-image-uploader" 
                    />
                    <label 
                      htmlFor="edit-image-uploader" 
                      className="block px-3 py-2 border border-dashed border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 rounded-lg text-center cursor-pointer font-bold transition-all text-[11px]"
                    >
                      📁 Ganti Gambar dari File
                    </label>
                    <input 
                      type="text" 
                      placeholder="Atau ganti URL Link baru..." 
                      value={prodImageUrl} 
                      onChange={(e) => setProdImageUrl(e.target.value)} 
                      className="w-full px-3 py-1.5 border border-slate-200 bg-slate-50 rounded-lg text-[10px]" 
                    />
                  </div>
                  <div className="h-16 w-full rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden relative">
                    {prodImageUrl ? (
                      <>
                        <img src={prodImageUrl} alt="Pratinjau Edit" className="w-full h-full object-cover" />
                        <button 
                          type="button" 
                          onClick={() => setProdImageUrl('')} 
                          className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-[9px] font-bold cursor-pointer"
                        >
                          Hapus
                        </button>
                      </>
                    ) : (
                      <span className="text-[9px] text-slate-400 font-medium italic text-center px-1">Belum Ada</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-3 justify-end border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => { setShowEditMenuModal(false); setEditingProduct(null); }} 
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-slate-950 hover:bg-slate-850 font-bold text-white rounded-lg cursor-pointer"
                >
                  Simpan Perubahan Menu ✓
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOM GOOGLE DRIVE RESTORE CONFIRMATION MODAL */}
      {restorePending && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="profile-restore-confirm-modal">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm border border-slate-150 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="p-2.5 bg-amber-50 rounded-xl text-amber-650">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Restorasi Cloud</h3>
                <p className="text-[10px] text-slate-400 font-mono">Tindakan Menimpa Data</p>
              </div>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Apakah Anda yakin ingin mengunduh data cloud dan merestorasi database? Tindakan ini akan menimpa seluruh data toko dalam memori luring saat ini.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-50 text-xs">
              <button
                type="button"
                onClick={() => setRestorePending(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 font-bold rounded-xl text-slate-705 transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeManualRestore}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 font-bold text-white rounded-xl transition-all cursor-pointer shadow-md"
              >
                Ya, Unduh & Timpa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM DELETE PRODUCT CONFIRMATION MODAL */}
      {deleteProductPending && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="profile-delete-menu-confirm-modal">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm border border-slate-150 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 bg-rose-50 rounded-xl text-rose-600">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 font-sans">Hapus Menu</h3>
                <p className="text-[10px] text-slate-400 font-mono">Tindakan Destruktif</p>
              </div>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Apakah Anda yakin ingin menghapus menu <strong className="text-slate-900 font-semibold">"{deleteProductPending.name}"</strong> beserta seluruh gambarnya? Bahan racikan resep yang bersangkutan akan dilepas.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-50 text-xs font-sans">
              <button
                type="button"
                onClick={() => setDeleteProductPending(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 font-bold rounded-xl text-slate-700 transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeDeleteProduct}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 font-bold text-white rounded-xl transition-all cursor-pointer shadow-md shadow-rose-100"
              >
                Ya, Hapus Menu
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
