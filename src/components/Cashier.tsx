/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Product, CoffeeTable, OrderItem, FinanceLog, Order } from '../types';
import { 
  Search, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  QrCode, 
  DollarSign, 
  Printer, 
  Wifi, 
  Bluetooth, 
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface CashierProps {
  products: Product[];
  rawMaterials?: any[];
  recipes?: any[];
  tables: CoffeeTable[];
  appConfig: any;
  onRefresh: () => void;
}

export default function Cashier({ products, rawMaterials = [], recipes = [], tables, appConfig, onRefresh }: CashierProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [tableNumber, setTableNumber] = useState<string>('Kasir Utama');
  const [cart, setCart] = useState<{ product: Product; quantity: number; notes: string }[]>([]);
  
  // Dynamic raw material recipe validation for POS Checkout
  const checkIngredientStatus = (productId: string) => {
    if (!recipes || !rawMaterials || recipes.length === 0) return 'ok';
    const recipe = recipes.find(r => r.productId === productId);
    if (!recipe || !recipe.ingredients || recipe.ingredients.length === 0) return 'ok';

    let hasEmpty = false;
    let hasWarning = false;

    for (const ing of recipe.ingredients) {
      const mat = rawMaterials.find(m => m.id === ing.materialId);
      if (!mat) continue;
      
      if (mat.stockQuantity < ing.amount) {
        hasEmpty = true;
        break;
      }
      if (mat.stockQuantity <= mat.warningLimit) {
        hasWarning = true;
      }
    }

    if (hasEmpty) return 'empty';
    if (hasWarning) return 'warning';
    return 'ok';
  };
  
  // States untuk diskon & pajak
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const taxPercent = 11; // PPN 11% standart Indonesia

  // State Transaksi & Pembayaran & Offline Mode
  const [paymentMethod, setPaymentMethod] = useState<'QRIS' | 'Tunai' | 'Debit'>('QRIS');
  const [cashAmountGiven, setCashAmountGiven] = useState<string>('');
  
  // LedgerLine Emergency Offline Mode States
  const [offlineMode, setOfflineMode] = useState<boolean>(() => {
    return localStorage.getItem('ledgerline_offline_mode') === 'true';
  });
  const [offlineQueue, setOfflineQueue] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('ledgerline_offline_queue');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [syncingOffline, setSyncingOffline] = useState<boolean>(false);

  // Thermal Printer Simulator States
  const [selectedPrinterModel, setSelectedPrinterModel] = useState<string>('LedgerLine BP-80M (Bluetooth)');
  const [paperWidth, setPaperWidth] = useState<'58mm' | '80mm'>('80mm');
  const [interactivePaperTorn, setInteractivePaperTorn] = useState<boolean>(false);

  const [checkoutResult, setCheckoutResult] = useState<{
    success: boolean;
    order: Order;
    change: number;
    securityHash: string;
    isOfflineRecord?: boolean;
  } | null>(null);

  const [printerConnected, setPrinterConnected] = useState<'Bluetooth' | 'WiFi' | null>('Bluetooth');
  const [printingStatus, setPrintingStatus] = useState<boolean>(false);
  const [tempPrinterLog, setTempPrinterLog] = useState<string[]>([]);
  const [receiptType, setReceiptType] = useState<'customer' | 'kitchen'>('customer');
  const [qrisPaidStatus, setQrisPaidStatus] = useState<'pending' | 'success'>('pending');

  // EDC Terminal Simulator States
  const [edcStep, setEdcStep] = useState<'swipe_insert' | 'pin_entry' | 'authorizing' | 'success'>('swipe_insert');
  const [edcBank, setEdcBank] = useState<'BCA' | 'Mandiri' | 'BRI' | 'BNI'>('BCA');
  const [edcPin, setEdcPin] = useState<string>('');
  const [edcCardHoldName, setEdcCardHoldName] = useState<string>('ASLAM RAMADHAN');
  const [edcCardNumber, setEdcCardNumber] = useState<string>('5221-8890-4432-1109');
  const [edcCardType, setEdcCardType] = useState<'Visa' | 'MasterCard' | 'GPN'>('GPN');
  const [cashierToast, setCashierToast] = useState<string>('');

  const triggerCashierToast = (msg: string) => {
    setCashierToast(msg);
    setTimeout(() => setCashierToast(''), 4500);
  };

  // Filter products berdasarkan pencarian & kategori
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.barcode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Tambah ke keranjang belanja
  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { product, quantity: 1, notes: '' }]);
    }
  };

  const removeFromCart = (pId: string) => {
    setCart(cart.filter(item => item.product.id !== pId));
  };

  const updateQuantity = (pId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.product.id === pId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const updateNotes = (pId: string, notes: string) => {
    setCart(cart.map(item => item.product.id === pId ? { ...item, notes } : item));
  };

  // Kalkulasi total matematika
  const subtotal = cart.reduce((sum, item) => {
    const isPromo = !!item.product.promoActive;
    const itemPrice = isPromo 
      ? Math.round(item.product.price * (1 - (item.product.promoDiscountPercent || 15) / 100)) 
      : item.product.price;
    return sum + (itemPrice * item.quantity);
  }, 0);
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const taxAmount = Math.round(((subtotal - discountAmount) * taxPercent) / 100);
  const totalBill = subtotal - discountAmount + taxAmount;

  // Hitung kembalian tunai
  const cashGiven = parseFloat(cashAmountGiven) || 0;
  const changeDue = Math.max(0, cashGiven - totalBill);

  // Ambil data meja yang sedang dipilih saat ini
  const activeTableData = tables.find(t => `Meja ${t.id} (${t.name.split(' ')[2] || 'A'})` === tableNumber || t.id === tableNumber);

  // Toggle Offline Emergency Mode
  const handleToggleOfflineMode = (e: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = e.target.checked;
    setOfflineMode(enabled);
    localStorage.setItem('ledgerline_offline_mode', enabled ? 'true' : 'false');
    if (enabled && paymentMethod === 'QRIS') {
      // Offline mode tidak mendukung QRIS internet dinamis langsung, pindahkan ke Tunai
      setPaymentMethod('Tunai');
    }
  };

  // Sinkronisasi data offline ke backend
  const handleSynchronizeOffline = async () => {
    if (offlineQueue.length === 0) return;
    setSyncingOffline(true);
    
    // Simulasikan siklus putaran jaringan dengan loading bar yang sangat professional
    setTimeout(async () => {
      try {
        const savedStore = localStorage.getItem('aslam_ledger_current_store');
        const tenantId = savedStore ? JSON.parse(savedStore).id : 'aslam-brew';

        for (const offlineOrder of offlineQueue) {
          await fetch('/api/checkout', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'X-Tenant-Id': tenantId
            },
            body: JSON.stringify({ ...offlineOrder, id: undefined }) // Buat ID ledger baru dari broker server
          });
        }
        
        // Bersihkan queue setelah berhasil terkirim
        setOfflineQueue([]);
        localStorage.removeItem('ledgerline_offline_queue');
        setSyncingOffline(false);
        onRefresh();
        triggerCashierToast(`Sukses Sinkronisasi! ${offlineQueue.length} transaksi luring aman tercatat di ledger utama.`);
      } catch (err) {
        setSyncingOffline(false);
        triggerCashierToast('Gagal menyinkronkan data dengan database. Pastikan koneksi server atau local sandbox aktif.');
      }
    }, 2000);
  };

  // Proses Checkout
  const handleCheckout = async () => {
    if (cart.length === 0) return;

    const formattedItems: OrderItem[] = cart.map(item => {
      const isPromo = !!item.product.promoActive;
      const salePrice = isPromo 
        ? Math.round(item.product.price * (1 - (item.product.promoDiscountPercent || 15) / 100)) 
        : item.product.price;
      return {
        productId: item.product.id,
        quantity: item.quantity,
        notes: item.notes || undefined,
        priceAtSale: salePrice,
        costAtSale: item.product.costPrice
      };
    });

    const orderPayload = {
      orderTime: new Date().toISOString(),
      tableNumber,
      items: formattedItems,
      subtotal,
      discount: discountAmount,
      tax: taxAmount,
      totalPrice: totalBill,
      paymentMethod,
      paymentStatus: 'Success' as const,
      receiptPrinted: false,
      notes: `Order via ${tableNumber} ${offlineMode ? '(Offline Saved)' : ''}`
    };

    if (offlineMode) {
      // EKSEKUSI JALUR LURING (OFFLINE EMERGENCY METHOD)
      const simulatedHash = `offline-hash-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
      const simulatedOrder: Order = {
        id: `TX-OFFLINE-${Date.now().toString().substring(7)}`,
        orderTime: orderPayload.orderTime,
        tableNumber: orderPayload.tableNumber,
        items: orderPayload.items,
        subtotal: orderPayload.subtotal,
        discount: orderPayload.discount,
        tax: orderPayload.tax,
        totalPrice: orderPayload.totalPrice,
        paymentMethod: orderPayload.paymentMethod,
        paymentStatus: 'Success',
        receiptPrinted: false,
        secureHash: simulatedHash
      };

      const updatedQueue = [...offlineQueue, simulatedOrder];
      setOfflineQueue(updatedQueue);
      localStorage.setItem('ledgerline_offline_queue', JSON.stringify(updatedQueue));

      setCheckoutResult({
        success: true,
        order: simulatedOrder,
        change: changeDue,
        securityHash: simulatedHash,
        isOfflineRecord: true
      });

      // Reset keranjang lokal
      setCart([]);
      setCashAmountGiven('');
      setInteractivePaperTorn(false);
      setEdcStep('swipe_insert');
      setEdcPin('');
      setQrisPaidStatus('pending');
      return;
    }

    // JALUR SINKRON ONLINE UTAMA
    try {
      const savedStore = localStorage.getItem('aslam_ledger_current_store');
      const tenantId = savedStore ? JSON.parse(savedStore).id : 'aslam-brew';

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Tenant-Id': tenantId
        },
        body: JSON.stringify(orderPayload)
      });
      const data = await response.json();
      if (data.success) {
        setCheckoutResult({
          success: true,
          order: data.order,
          change: changeDue,
          securityHash: data.order.secureHash
        });
        // Clear keranjang
        setCart([]);
        setCashAmountGiven('');
        setInteractivePaperTorn(false);
        setEdcStep('swipe_insert');
        setEdcPin('');
        setQrisPaidStatus('pending');
        onRefresh(); // Refresh dashboard data stok & bahan baku harian
      } else {
        triggerCashierToast('Terjadi kesalahan checkout: ' + data.message);
      }
    } catch (err: any) {
      triggerCashierToast('Gagal mengirim transaksi ke server: ' + err.message);
    }
  };

  // Simulasi Cetak Struk menggunakan Printer Bluetooth / WiFi
  const handlePrintReceipt = () => {
    if (!checkoutResult) return;
    setPrintingStatus(true);
    setTempPrinterLog(prev => [...prev, `Mengkoneksikan ke printer ${selectedPrinterModel}...`]);
    
    setTimeout(() => {
      let receiptText = '';
      if (receiptType === 'customer') {
        receiptText = `
-----------------------------------------
      ${appConfig.storeName ? appConfig.storeName.toUpperCase() : 'LEDGERLINE BY ASLAM'}
   ${appConfig.storeAddress || 'Indonesia'}
        TELP: ${appConfig.storePhone || '0812-9988-7766'}
-----------------------------------------
ID TX  : ${checkoutResult.order.id}
TANGGAL: ${new Date(checkoutResult.order.orderTime).toLocaleString('id-ID')}
KASIR  : Shift Kopi Utama (${printerConnected || 'Virtual'} Link)
MEJA   : ${checkoutResult.order.tableNumber}
PRINTER: ${selectedPrinterModel} (${paperWidth})
-----------------------------------------
${checkoutResult.order.items.map(item => {
  const prod = products.find(p => p.id === item.productId);
  return `${prod?.name || 'Item'} x${item.quantity}\n          @Rp ${item.priceAtSale.toLocaleString('id-ID')} -> Rp ${(item.priceAtSale * item.quantity).toLocaleString('id-ID')}`;
}).join('\n')}
-----------------------------------------
SUBTOTAL    : Rp ${checkoutResult.order.subtotal.toLocaleString('id-ID')}
DISKON      : Rp ${checkoutResult.order.discount.toLocaleString('id-ID')}
PAJAK (11%) : Rp ${checkoutResult.order.tax.toLocaleString('id-ID')}
GRAND TOTAL : Rp ${checkoutResult.order.totalPrice.toLocaleString('id-ID')}
-----------------------------------------
METODE BAYAR: ${checkoutResult.order.paymentMethod}
STATUS      : ${checkoutResult.isOfflineRecord ? 'LOKAL OFFLINE - ANTRI SYNC' : 'LUNAS (SINKRON CLOUD)'}
-----------------------------------------
   [SHA-256 ENCRYPTED SIGNATURE AUDIT]
       ${checkoutResult.order.secureHash?.substring(0, 32)}...
-----------------------------------------
      TERIMA KASIH ATAS KUNJUNGANNYA
        POWERED BY LEDGERLINE POS
      `;
      } else {
        receiptText = `
=========================================
        TIKET ANTRIAN DAPUR (KOT)
        KEDAI: ${appConfig.storeName ? appConfig.storeName.toUpperCase() : 'ASLAM LEDGER'}
=========================================
ID TRANS : ${checkoutResult.order.id}
TANGGAL  : ${new Date(checkoutResult.order.orderTime).toLocaleDateString('id-ID')} ${new Date(checkoutResult.order.orderTime).toLocaleTimeString('id-ID')}
LOKASI   : ${checkoutResult.order.tableNumber.toUpperCase()}
PRINTER  : ${selectedPrinterModel} (Kitchen Link)
-----------------------------------------
Daftar Antrean Porsi Pembuatan Barista/Dapur:
-----------------------------------------
${checkoutResult.order.items.map((item, index) => {
  const prod = products.find(p => p.id === item.productId);
  const notesText = item.notes ? `   * CATATAN: ${item.notes.toUpperCase()} *` : '   (Tanpa instruksi tambahan)';
  return `${index + 1}. [ Qty: ${item.quantity} ] ${prod?.name?.toUpperCase() || 'MENU'}\n${notesText}`;
}).join('\n\n')}
-----------------------------------------
* Keamanan & Stok Terverifikasi Sistem POS
* Dapur Menerima Hasil Print Fisik Saja
=========================================
      HARAP DIPROSES SECEPATNYA!
=========================================
        LEDGER SYSTEM BY ASLAM
        `;
      }
      
      console.log(receiptText);
      setTempPrinterLog(prev => [
        ...prev, 
        `Koneksi ${selectedPrinterModel} Stabil.`,
        `Transmitting print jobs successfully...`,
        `Cetak ${receiptType === 'customer' ? 'Struk Transaksi' : 'Tiket Antrean Dapur'} ${checkoutResult.order.id} Selesai!`
      ]);
      setPrintingStatus(false);
      
      // Buka dialog printer web browser orisinil untuk real-world hardware compatibility
      const printFriendly = window.open("", "_blank");
      if (printFriendly) {
        printFriendly.document.write(`<pre style="font-family: monospace; font-size:12px; padding:20px;">${receiptText}</pre>`);
        printFriendly.document.close();
        printFriendly.focus();
        printFriendly.print();
        printFriendly.close();
      }
    }, 1200);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6" id="cashier-tab">
      
      {/* Kolom Kiri: Pilih Menu & Barcode (Katalog) - Col 7 */}
      <div className="md:col-span-12 space-y-4">
        {/* LEDGERLINE OPERATIONAL INTELLIGENCE CONTROL BAR */}
        <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-slate-800 shadow-xl transition-all">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 font-bold text-[9px] uppercase tracking-wider rounded border border-blue-500/20">
                LedgerLine Intel Node
              </span>
              {offlineMode ? (
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              ) : (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              )}
            </div>
            <h3 className="text-sm font-extrabold tracking-tight">
              Sistem Pengaman Transaksi ({offlineMode ? 'Mode Luring Aktif' : 'Mode Awatara Cloud Aktif'})
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
              Meminimalkan bug printer Bluetooth browser & menangani drop jaringan QRIS secara otomatis dengan teknologi luring sinkronis dua arah.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
            {/* OFFLINE TOGGLE */}
            <label className="relative inline-flex items-center cursor-pointer select-none bg-slate-850 p-2.5 rounded-xl border border-slate-800 gap-3">
              <input 
                type="checkbox" 
                checked={offlineMode} 
                onChange={handleToggleOfflineMode}
                className="sr-only peer" 
              />
              <div className="w-9 h-5 bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[12px] after:start-[14px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
              <span className="text-xs font-bold text-slate-300">Mode Darurat Luring</span>
            </label>

            {/* SYNC TRIGGER BUTTON */}
            {offlineQueue.length > 0 && (
              <button
                id="sync-offline-queue-btn"
                disabled={syncingOffline}
                onClick={handleSynchronizeOffline}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 text-white bg-amber-500 hover:bg-amber-600 transition-all ${
                  syncingOffline ? 'animate-pulse cursor-not-allowed' : 'shadow-md shadow-amber-500/10'
                }`}
              >
                {syncingOffline ? (
                  <>
                    <RefreshCw className="animate-spin" size={13} />
                    Menyinkronkan ({offlineQueue.length})...
                  </>
                ) : (
                  <>
                    <Wifi size={13} className="animate-bounce" />
                    Sinkronkan {offlineQueue.length} Tagihan
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* DOUBLE BOOKING / COLLISION WARNING PANEL */}
        {activeTableData && activeTableData.status !== 'Empty' && (
          <div className="bg-amber-50 border border-amber-200/80 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 animate-fade-in shrink-0" id="table-conflict-banner">
            <div className="flex items-center gap-3 text-amber-850">
              <AlertCircle size={20} className="text-amber-600 shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-amber-900">🚨 Peringatan Meja Sedang Aktif ({activeTableData.name})</p>
                <p className="text-amber-700 font-medium">Pengunjung saat ini masih menempati meja ini secara fisik atau memiliki pesanan berjalan.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-[10px] font-mono font-bold uppercase py-1 px-2.5 rounded-md bg-amber-200 text-amber-800 animate-pulse">
                Meja Terkunci
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Kolom Kiri: Pilih Menu & Barcode (Katalog) - Col 7 */}
      <div className="col-span-1 md:col-span-6 lg:col-span-7 space-y-4">
        
        {/* Kontrol Cari & Filter Meja */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Input Cari */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input
                id="search-menu"
                type="text"
                placeholder="Cari Menu / Scan Barcode Produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 focus:border-slate-400 focus:outline-hidden text-sm bg-slate-50 rounded-xl"
              />
            </div>
            {/* Pemilihan Meja */}
            <div className="w-full sm:w-48">
              <select
                id="table-selector"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 focus:border-slate-400 focus:outline-hidden text-sm bg-slate-50 font-medium rounded-xl text-slate-700"
              >
                <option value="Kasir Utama">Kasir Utama</option>
                {tables.map(table => (
                  <option key={table.id} value={`Meja ${table.id} (${table.name.split(' ')[2] || 'A'})`}>
                    {table.name} ({table.status === 'Empty' ? 'Kosong' : 'Isi - Terkunci'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Navigasi Kategori Menu */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {['All', 'Coffee', 'Non-Coffee', 'Heavy Meals', 'Snacks', 'Desserts', 'Beans'].map((cat) => (
              <button
                key={cat}
                id={`cat-filter-${cat.toLowerCase().replace(' ', '-')}`}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat 
                  ? 'bg-slate-900 text-white shadow-xs' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800'
                }`}
              >
                {cat === 'All' ? 'Semua Menu' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid Menu */}
        <div 
          className={appConfig?.layoutMode === 'list' 
            ? "flex flex-col gap-2.5 max-h-[640px] overflow-y-auto pr-1" 
            : "grid grid-cols-2 lg:grid-cols-3 gap-4 max-h-[640px] overflow-y-auto pr-1"
          } 
          id="products-catalog-grid"
        >
          {filteredProducts.map((p) => {
            const ingStatus = checkIngredientStatus(p.id);
            const isOutOfStock = p.stock === 0 || ingStatus === 'empty';

            return (
              <div 
                key={p.id}
                onClick={() => !isOutOfStock && addToCart(p)}
                className={`bg-white rounded-xl border border-slate-100 hover:border-slate-300 hover:shadow-md transition-all duration-200 ease-out transform active:scale-95 flex ${
                  appConfig?.layoutMode === 'list' ? 'flex-row items-center justify-between' : 'flex-col justify-between'
                } cursor-pointer group shrink-0 overflow-hidden ${
                  isOutOfStock ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''
                }`}
                style={{ contentVisibility: 'auto' }}
              >
                {appConfig?.layoutMode === 'list' ? (
                  // HORIZONTAL LIST CARD VIEW
                  <div className="flex items-center gap-3 p-2.5 w-full">
                    {/* Left image or icon */}
                    <div className="w-12 h-12 bg-slate-50 flex-shrink-0 rounded-lg overflow-hidden border border-slate-100 flex items-center justify-center">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <ShoppingBag size={18} className="text-slate-300" />
                      )}
                    </div>
                    {/* Middle details */}
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="bg-slate-100 text-[8px] font-mono font-black px-1.5 py-0.5 rounded text-slate-500 uppercase leading-none">
                          {p.category}
                        </span>
                        {p.stock <= p.warningLimit && p.stock > 0 && (
                          <span className="text-[8px] font-bold text-amber-600 bg-amber-50 px-1 py-0.5 rounded animate-pulse leading-none">
                            Sisa Sedikit
                          </span>
                        )}
                        {ingStatus === 'empty' && (
                          <span className="text-[8px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded leading-none border border-rose-100 animate-pulse">
                            Bahan Baku Habis 🚫
                          </span>
                        )}
                        {ingStatus === 'warning' && (
                          <span className="text-[8px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded leading-none border border-amber-100 animate-pulse">
                            Bahan Kritis ⚠️
                          </span>
                        )}
                      </div>
                      <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm mt-1 truncate leading-tight group-hover:text-slate-950">
                        {p.name}
                      </h4>
                      {p.komposisi && (
                        <p className="text-[9px] text-slate-400 font-sans italic truncate">
                          🌱 {p.komposisi}
                        </p>
                      )}
                    </div>
                    {/* Right numbers */}
                    <div className="text-right shrink-0">
                      {p.promoActive ? (
                        <div className="space-y-0.5">
                          <span className="text-[7px] font-black tracking-wider bg-rose-500 text-white px-1 ml-auto block w-fit rounded-sm uppercase leading-none mb-1">PROMO</span>
                          <p className="text-rose-600 font-extrabold text-xs sm:text-sm font-mono leading-none">
                            Rp {Math.round(p.price * (1 - (p.promoDiscountPercent || 15) / 100)).toLocaleString('id-ID')}
                          </p>
                          <p className="text-[10px] line-through text-slate-400 font-mono leading-none">
                            Rp {p.price.toLocaleString('id-ID')}
                          </p>
                        </div>
                      ) : (
                        <p className="text-slate-900 font-extrabold text-xs sm:text-sm font-mono leading-none">
                          Rp {p.price.toLocaleString('id-ID')}
                        </p>
                      )}
                      <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded inline-block mt-1 leading-none ${
                        isOutOfStock 
                        ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                        : p.stock <= p.warningLimit 
                        ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                      }`}>
                        {isOutOfStock ? (ingStatus === 'empty' ? 'Bahan Habis' : 'Habis') : `Stok: ${p.stock}`}
                      </span>
                    </div>
                  </div>
                ) : (
                  // DEFAULT GRID CARD VIEW
                  <>
                    {/* Product Thumbnail Image */}
                    {p.imageUrl ? (
                      <div className="relative h-28 w-full overflow-hidden bg-slate-50 border-b border-slate-100">
                        <img 
                          src={p.imageUrl} 
                          alt={p.name} 
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-60" />
                      </div>
                    ) : (
                      <div className="h-28 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center border-b border-slate-100">
                        <ShoppingBag size={24} className="text-slate-300" />
                      </div>
                    )}

                    <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center gap-1">
                          <span className="bg-slate-100 text-[8px] font-mono tracking-wider font-extrabold px-1.5 py-0.5 rounded text-slate-500 uppercase">
                            {p.category}
                          </span>
                          {p.promoActive && (
                            <span className="bg-rose-500 text-[8px] font-mono tracking-wider font-extrabold px-1.5 py-0.5 rounded text-white uppercase animate-pulse leading-none shadow-xs">
                              🔥 PROMO {p.promoDiscountPercent || 15}%
                            </span>
                          )}
                          {p.stock <= p.warningLimit && p.stock > 0 && !p.promoActive && (
                            <span className="text-[8px] font-bold text-amber-600 bg-amber-50 px-1 py-0.5 rounded animate-pulse">
                              Sisa Sedikit
                            </span>
                          )}
                        </div>
                        
                        <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm mt-1.5 line-clamp-2 leading-tight group-hover:text-slate-950">
                          {p.name}
                        </h4>
                        {p.komposisi && (
                          <p className="text-[9px] text-slate-500 font-sans mt-1 italic line-clamp-2 leading-tight">
                            🌱 Komposisi: {p.komposisi}
                          </p>
                        )}

                        <div className="flex gap-1 flex-wrap mt-1">
                          {ingStatus === 'empty' && (
                            <span className="text-[8px] scale-95 font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100 uppercase animate-pulse">
                              Bahan Baku Habis 🚫
                            </span>
                          )}
                          {ingStatus === 'warning' && (
                            <span className="text-[8px] scale-95 font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 uppercase">
                              Bahan Kritis ⚠️
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="pt-2">
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-[9px] text-slate-400 font-mono leading-none mb-1">{p.barcode}</p>
                            {p.promoActive ? (
                              <div className="space-y-0.5">
                                <p className="text-rose-600 font-black text-xs sm:text-sm leading-none">
                                  Rp {Math.round(p.price * (1 - (p.promoDiscountPercent || 15) / 100)).toLocaleString('id-ID')}
                                </p>
                                <p className="text-[10px] line-through text-slate-400 font-mono leading-none">
                                  Rp {p.price.toLocaleString('id-ID')}
                                </p>
                              </div>
                            ) : (
                              <span className="text-slate-900 font-extrabold text-xs sm:text-sm">
                                Rp {p.price.toLocaleString('id-ID')}
                              </span>
                            )}
                          </div>
                          
                          <span className={`text-[9px] font-extrabold font-mono px-1.5 py-0.5 rounded ${
                            isOutOfStock 
                            ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                            : p.stock <= p.warningLimit 
                            ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                          }`}>
                            {isOutOfStock ? (ingStatus === 'empty' ? 'Bahan Habis' : 'Habis') : `Stok: ${p.stock}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* Kolom Kanan: Keranjang & Detail Pembayaran - Col 5 */}
      <div className="col-span-1 md:col-span-6 lg:col-span-5 space-y-4">
        
        {/* List Struk Keranjang / Cart POS */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between min-h-[500px]">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="text-slate-700" size={18} />
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Tagihan {tableNumber}</h3>
              </div>
              <span className="bg-slate-100 text-slate-700 font-bold font-mono text-[10px] px-2 py-0.5 rounded-md">
                {cart.length} Item
              </span>
            </div>

            {cart.length === 0 ? (
              <div className="py-20 text-center text-slate-400">
                <ShoppingBag className="mx-auto text-slate-200 mb-3" size={44} />
                <p className="text-xs font-semibold text-slate-500">Keranjang masih kosong.</p>
                <p className="text-[11px] text-slate-400 mt-1">Pilihlah salah satu menu premium LedgerLine.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[250px] overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.product.id} className="text-sm">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <span className="font-extrabold text-slate-800 text-xs sm:text-sm">{item.product.name}</span>
                        {item.product.promoActive ? (
                          <div className="flex flex-wrap items-center gap-1.5 mt-0.5" id={`promo-cart-badge-${item.product.id}`}>
                            <span className="text-[8px] font-black font-mono tracking-wider bg-rose-500 text-white px-1.5 py-0.5 rounded uppercase leading-none">
                              🏷️ PROMO
                            </span>
                            <span className="text-xs font-mono font-black text-rose-600">
                              Rp {Math.round(item.product.price * (1 - (item.product.promoDiscountPercent || 15) / 100)).toLocaleString('id-ID')}
                            </span>
                            <span className="text-[10px] text-slate-405 line-through font-mono text-slate-400">
                              {item.product.price.toLocaleString('id-ID')}
                            </span>
                          </div>
                        ) : (
                          <p className="text-xs font-mono font-semibold text-slate-400">Rp {item.product.price.toLocaleString('id-ID')}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-900 border border-slate-200 rounded-md"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="font-mono text-xs font-bold w-6 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-900 border border-slate-200 rounded-md"
                        >
                          <Plus size={12} />
                        </button>
                        <button 
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-1 hover:bg-rose-50 text-rose-500 hover:text-rose-700 rounded-md ml-1"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                    
                    {/* Notes detail item */}
                    <input
                      type="text"
                      placeholder="Catatan porsi (misal: Less sugar, extra ice)..."
                      value={item.notes}
                      onChange={(e) => updateNotes(item.product.id, e.target.value)}
                      className="w-full mt-1.5 px-2 py-1 text-[11px] border border-slate-100 hover:border-slate-200 rounded bg-slate-50 placeholder-slate-400 focus:outline-hidden"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Subtotal & Kalkulator Tagihan */}
          <div className="border-t border-slate-100 pt-4 mt-4 space-y-3">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Subtotal Menu</span>
              <span className="font-mono font-medium">Rp {subtotal.toLocaleString('id-ID')}</span>
            </div>
            
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span className="flex items-center gap-1">Diskon Tambahan (%)</span>
              <div className="flex items-center gap-2">
                <input
                  id="discount-input"
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-12 text-center border border-slate-200 py-0.5 font-mono font-bold text-xs bg-slate-50 rounded"
                />
                <span className="font-mono">- Rp {discountAmount.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="flex justify-between text-xs text-slate-500">
              <span>Pajak Restoran PPN (11%)</span>
              <span className="font-mono">Rp {taxAmount.toLocaleString('id-ID')}</span>
            </div>

            <div className="flex justify-between text-base font-bold text-slate-900 border-t border-dashed border-slate-200 pt-3">
              <span>Total Tagihan</span>
              <span className="font-mono text-slate-900">Rp {totalBill.toLocaleString('id-ID')}</span>
            </div>

            {/* Metode Pembayaran Tab */}
            <div className="grid grid-cols-3 gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200/50 mt-4">
              <button
                disabled={offlineMode && paymentMethod === 'QRIS'}
                onClick={() => setPaymentMethod('QRIS')}
                className={`py-2 text-xs font-semibold rounded-lg flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  paymentMethod === 'QRIS' 
                  ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-100' 
                  : 'text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed'
                }`}
              >
                <QrCode size={14} />
                QRIS Dinamis
              </button>
              <button
                onClick={() => setPaymentMethod('Tunai')}
                className={`py-2 text-xs font-semibold rounded-lg flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  paymentMethod === 'Tunai' 
                  ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-100' 
                  : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <DollarSign size={14} />
                Tunai Cash
              </button>
              <button
                onClick={() => setPaymentMethod('Debit')}
                className={`py-2 text-xs font-semibold rounded-lg flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  paymentMethod === 'Debit' 
                  ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-100' 
                  : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <CreditCard size={14} />
                Kartu Debit
              </button>
            </div>

            {/* Panel Input Detail Tunai */}
            {paymentMethod === 'Tunai' && cart.length > 0 && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-250 mt-2 space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase font-sans">Uang Tunai Diberikan (Rp):</label>
                <div className="flex gap-2">
                  <input
                    id="cash-granted-input"
                    type="number"
                    placeholder="Masukkan nominal tunai..."
                    value={cashAmountGiven}
                    onChange={(e) => setCashAmountGiven(e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-slate-200 focus:outline-hidden text-xs bg-white font-mono font-bold rounded-lg text-slate-800"
                  />
                  <button 
                    onClick={() => setCashAmountGiven(totalBill.toString())}
                    className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition-all"
                  >
                    Pas
                  </button>
                </div>
                {cashGiven > 0 && (
                  <div className="flex justify-between text-xs pt-1">
                    <span className="text-slate-500 font-semibold">Uang Kembalian</span>
                    <strong className="font-mono text-emerald-600 font-bold">Rp {changeDue.toLocaleString('id-ID')}</strong>
                  </div>
                )}
              </div>
            )}

            {/* Panel Tinjauan Bayar QRIS Dinamis */}
            {paymentMethod === 'QRIS' && cart.length > 0 && (
              <div className="p-3 bg-sky-50/50 rounded-xl border border-sky-100 flex items-center gap-3">
                <QrCode className="text-sky-600 shrink-0" size={24} />
                <p className="text-[10px] text-sky-800 leading-normal text-sky-800">
                  QRIS otomatis dibangkitkan senilai <strong className="font-mono font-bold">Rp {totalBill.toLocaleString('id-ID')}</strong>. Terenkripsi audit aman.
                </p>
              </div>
            )}

            {/* Panel Tinjauan Bayar Debit EDC */}
            {paymentMethod === 'Debit' && cart.length > 0 && (
              <div className="p-3 bg-indigo-50/65 rounded-xl border border-indigo-100/80 flex items-center gap-3 animate-fade-in mt-2 gap-3">
                <CreditCard className="text-indigo-600 shrink-0" size={24} />
                <p className="text-[10px] text-indigo-800 leading-normal">
                  Terminal EDC Ledger Line terintegrasi senilai <strong className="font-mono font-bold">Rp {totalBill.toLocaleString('id-ID')}</strong>. Gesek/masukkan kartu pada simulator setelah konfirmasi.
                </p>
              </div>
            )}

            {/* Tombol Simpan Transaksi / Checkout */}
            <button
              id="checkout-trigger-btn"
              disabled={cart.length === 0}
              onClick={handleCheckout}
              className="w-full mt-4 py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-slate-900/10"
            >
              <CheckCircle2 size={16} />
              Konfirmasi & Selesaikan Transaksi {offlineMode && '(Luring)'}
            </button>
          </div>
        </div>

        {/* HIGH COMPLEMENTARY PHYSICAL THERMAL PRINTER SIMULATOR */}
        {checkoutResult && (
          <div className="bg-[#F1F5F9] border border-slate-300/85 p-5 rounded-2xl shadow-xl space-y-4 animate-fade-in relative overflow-hidden" id="checkout-receipt-panel">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Printer size={16} className="text-slate-700 shrink-0" />
                <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
                  Internal Thermal Slip Simulator
                </span>
                {checkoutResult.isOfflineRecord && (
                  <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold animate-pulse">
                    Luring
                  </span>
                )}
              </div>
              
              <button 
                onClick={() => {
                  setCheckoutResult(null);
                  setQrisPaidStatus('pending');
                }}
                className="text-slate-400 hover:text-slate-600 font-extrabold text-[10px] uppercase cursor-pointer transition-all"
              >
                Tutup Monitor
              </button>
            </div>

            {/* CONFIG SLIP CONTROLLER TOOLS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] bg-slate-200/50 p-2.5 rounded-xl border border-slate-200">
              <div>
                <label className="text-slate-500 font-bold block mb-1">Pilih Model Mesin Print:</label>
                <select 
                  value={selectedPrinterModel} 
                  onChange={(e) => setSelectedPrinterModel(e.target.value)}
                  className="w-full p-1 bg-white border border-slate-300 rounded font-bold text-slate-700"
                >
                  <option value="LedgerLine BP-80M (Bluetooth)">LedgerLine BP-80M (Bluetooth)</option>
                  <option value="Epson TM-T82X (WiFi-Direct)">Epson TM-T82X (WiFi-Direct)</option>
                  <option value="Star Micronics WebPrint">Star Micronics WebPrint (REST API)</option>
                </select>
              </div>
              <div>
                <label className="text-slate-500 font-bold block mb-1">Pilih Output Slip Cetak:</label>
                <div className="grid grid-cols-2 gap-1 font-sans">
                  <button 
                    onClick={() => setReceiptType('customer')}
                    className={`font-semibold py-1 rounded transition-all border text-[9px] cursor-pointer ${
                      receiptType === 'customer' ? 'bg-[#1E293B] text-white border-slate-900' : 'bg-white text-slate-600 border-slate-300'
                    }`}
                  >
                    Struk Tagihan
                  </button>
                  <button 
                    onClick={() => setReceiptType('kitchen')}
                    className={`font-semibold py-1 rounded transition-all border text-[9px] cursor-pointer ${
                      receiptType === 'kitchen' ? 'bg-[#1E293B] text-white border-slate-900' : 'bg-white text-slate-600 border-slate-300'
                    }`}
                  >
                    Tiket Dapur (KOT)
                  </button>
                </div>
              </div>
            </div>

            {/* TWO-COLUMN GRID FOR SPLIT LAYOUT WHEN QRIS OR DEBIT CARD METHOD USED */}
            <div className={`grid grid-cols-1 ${['QRIS', 'Debit'].includes(checkoutResult.order.paymentMethod) ? 'lg:grid-cols-12' : ''} gap-5`}>
              
              {/* KOLOM Kiri: Kertas Struk Thermal */}
              <div className={`${['QRIS', 'Debit'].includes(checkoutResult.order.paymentMethod) ? 'lg:col-span-6' : 'w-full'} flex items-center justify-center`}>
                {!interactivePaperTorn ? (
                  <div 
                    className="bg-[#FAFAFA] text-slate-900 font-mono text-[10px] p-6 shadow-xs border-r border-l border-slate-200 relative mx-auto overflow-hidden transition-all duration-500"
                    style={{
                      width: '250px',
                      boxShadow: '0px 10px 20px -5px rgba(0,0,0,0.1)',
                      backgroundImage: 'radial-gradient(circle, #f3f4f6 1px, transparent 1px)',
                      backgroundSize: '4px 4px'
                    }}
                  >
                    {/* Visual Top Jagged Cutout Line */}
                    <div className="absolute top-0 inset-x-0 h-1 bg-[linear-gradient(45deg,transparent_25%,#e2e8f0_25%,#e2e8f0_50%,transparent_50%,transparent_75%,#e2e8f0_75%)] bg-[size:8px_8px]" />

                    {/* SELECTIVE SLIP RECEIPT CONTENT */}
                    {receiptType === 'customer' ? (
                      /* CUSTOMER BILL RECEIPT */
                      <div className="space-y-4 pt-2 text-center">
                        <div>
                          <h4 className="font-extrabold text-xs text-slate-900 tracking-tight">
                            {appConfig.storeName ? appConfig.storeName.toUpperCase() : 'LEDGERLINE BY ASLAM'}
                          </h4>
                          <p className="text-[8px] text-slate-500 leading-tight mt-0.5">
                            {appConfig.storeAddress || 'Kawasan Bisnis Senayan, Jakarta'}
                          </p>
                          <p className="text-[8px] text-slate-500 mt-0.5">
                            Telp: {appConfig.storePhone || '0812-9988-7766'}
                          </p>
                        </div>

                        <div className="text-left space-y-0.5 border-t border-b border-dashed border-slate-300 py-1.5 text-[8px] text-slate-600 font-mono">
                          <p>ID TRANS: {checkoutResult.order.id}</p>
                          <p>TANGGAL : {new Date(checkoutResult.order.orderTime).toLocaleDateString('id-ID')} {new Date(checkoutResult.order.orderTime).toLocaleTimeString('id-ID')}</p>
                          <p>MEJA    : {checkoutResult.order.tableNumber}</p>
                          <p>PELAYAN : Barista Kasir (Standard)</p>
                        </div>

                        {/* PRODUCTS LIST thermal style */}
                        <div className="space-y-1.5 text-left text-[9px] font-mono">
                          {checkoutResult.order.items.map((item, i) => {
                            const prod = products.find(p => p.id === item.productId);
                            return (
                              <div key={i} className="flex justify-between items-start gap-2">
                                <div className="min-w-0 flex-1">
                                  <span className="font-bold truncate text-slate-800">{prod?.name || 'Menu Porsi'}</span>
                                  <span className="block text-[8px] text-slate-500">
                                    {item.quantity} x Rp {item.priceAtSale.toLocaleString('id-ID')}
                                  </span>
                                </div>
                                <span className="font-bold text-slate-850 shrink-0">
                                  Rp {(item.priceAtSale * item.quantity).toLocaleString('id-ID')}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* CALCULATOR LOGS thermal standard */}
                        <div className="border-t border-dashed border-slate-300 pt-2 text-left space-y-0.5 font-bold text-[8px] font-mono">
                          <div className="flex justify-between">
                            <span className="font-medium text-slate-500">SUBTOTAL</span>
                            <span className="font-bold text-slate-800">Rp {checkoutResult.order.subtotal.toLocaleString('id-ID')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-slate-500">DISKON</span>
                            <span className="font-bold text-slate-800">- Rp {checkoutResult.order.discount.toLocaleString('id-ID')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-slate-500">PAJAK PPN 11%</span>
                            <span className="font-bold text-slate-800">Rp {checkoutResult.order.tax.toLocaleString('id-ID')}</span>
                          </div>
                          <div className="flex justify-between border-t border-solid border-slate-400 pt-1 text-[9px]">
                            <span className="text-slate-900 font-extrabold">TOTAL KESELURUHAN</span>
                            <span className="text-slate-900 font-extrabold">Rp {checkoutResult.order.totalPrice.toLocaleString('id-ID')}</span>
                          </div>
                        </div>

                        <div className="border-t border-dashed border-slate-300 pt-2 text-[8px] space-y-0.5 text-center text-slate-500 font-mono">
                          <p className="font-bold text-slate-800">SISTEM PEMBAYARAN: {checkoutResult.order.paymentMethod}</p>
                          <p>Keamanan Terverifikasi Hash SHA-224</p>
                          <p className="font-mono text-[7px] select-all bg-slate-100 p-0.5 rounded leading-none text-slate-400">
                            {checkoutResult.securityHash || 'SECURE_HASH'}
                          </p>
                          <p className="pt-2 font-semibold">*** TERIMA KASIH ***</p>
                          <p className="font-mono text-[7px] text-slate-400 mt-1">POWERED BY LEDGERLINE</p>
                        </div>
                      </div>
                    ) : (
                      /* KITCHEN ONLY PREPARATION TICKET (NO PRICES) */
                      <div className="space-y-4 pt-2 text-center text-slate-900">
                        <div className="border-b-2 border-slate-800 pb-1.5">
                          <h4 className="font-black text-xs text-rose-600 tracking-wider">
                            ** ANTRIAN DAPUR (KOT) **
                          </h4>
                          <p className="text-[7px] text-slate-500 font-extrabold uppercase mt-0.5">
                            KITCHEN PREPARATION TICKET
                          </p>
                        </div>

                        <div className="text-left space-y-0.5 text-[8px] text-slate-700 font-mono bg-slate-100 p-2 rounded-lg">
                          <p className="font-bold text-slate-800">ID TRANS: {checkoutResult.order.id}</p>
                          <p>TANGGAL : {new Date(checkoutResult.order.orderTime).toLocaleDateString('id-ID')} {new Date(checkoutResult.order.orderTime).toLocaleTimeString('id-ID')}</p>
                          <p>LOKASI  : {checkoutResult.order.tableNumber.toUpperCase()}</p>
                          <p className="text-rose-650 font-extrabold border-t border-dashed border-slate-300 pt-1 mt-1 font-mono">KHUSUS PROSES DAPUR (RAHASIA FINANSIAL)</p>
                        </div>

                        {/* PRODUCTS LIST thermal style without pricing */}
                        <div className="space-y-3.5 text-left text-[9px] pt-1 font-mono">
                          {checkoutResult.order.items.map((item, i) => {
                            const prod = products.find(p => p.id === item.productId);
                            return (
                              <div key={i} className="border-b border-dashed border-slate-200 pb-2 last:border-0 last:pb-0">
                                <div className="flex justify-between items-start">
                                  <span className="font-black text-[12px] text-slate-900 leading-tight">
                                    [ Qty: {item.quantity} ] {prod?.name?.toUpperCase() || 'PORSI MENU'}
                                  </span>
                                </div>
                                {item.notes ? (
                                  <span className="block text-[8px] font-bold text-rose-700 bg-rose-50 border border-rose-100 rounded p-1 mt-1 font-sans">
                                    👉 NOTE: "{item.notes.toUpperCase()}"
                                  </span>
                                ) : (
                                  <span className="block text-[7px] text-slate-400 mt-0.5 italic">
                                    (Tidak Ada Catatan Khusus)
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        <div className="border-t-2 border-dashed border-slate-300 pt-3 text-[8px] space-y-0.5 text-center text-slate-500 font-mono">
                          <p className="font-bold text-slate-800 uppercase tracking-wider font-sans bg-rose-100 text-rose-700 py-1 rounded">
                            DAPUR MENERIMA HASIL PRINT SAJA
                          </p>
                          <p className="font-mono text-[7px] text-slate-400 pt-1">Sistem Otomasi Dapur • Ledger Line by Aslam</p>
                        </div>
                      </div>
                    )}

                    {/* Interactive Scissors Overlay on Hover to Tear Paper */}
                    <button
                      onClick={() => setInteractivePaperTorn(true)}
                      className="absolute inset-x-0 bottom-0 bg-slate-900/90 text-white font-extrabold text-[10px] py-1.5 flex items-center justify-center gap-1.5 cursor-pointer opacity-0 hover:opacity-100 transition-opacity duration-200"
                    >
                      ✂️ Gunting & Sobek Slip Dapur / Kasir
                    </button>
                  </div>
                ) : (
                  <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-300 animate-fade-in w-full max-w-[300px]">
                    <p className="text-xs font-bold text-emerald-600">✂️ Slip Berhasil Disobek!</p>
                    <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                      Kertas antrean dicetak & diserahkan langsung. Dapur akan merespon tiket fisik ini.
                    </p>
                    <button 
                      onClick={() => setInteractivePaperTorn(false)}
                      className="mt-3 px-3 py-1 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-lg border border-slate-200 hover:bg-slate-200 cursor-pointer"
                    >
                      Pasang Kertas Baru
                    </button>
                  </div>
                )}
              </div>

              {/* KOLOM Kanan: HIGH RESOLUTION QRIS STAND TABLETOP SIMULATOR */}
              {checkoutResult.order.paymentMethod === 'QRIS' && (
                <div className="lg:col-span-6 flex flex-col justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-md">
                  
                  {/* QRIS BRAND STANDARD BANNER */}
                  <div className="w-full bg-[#E11D48] text-white p-3 rounded-lg text-center shadow-xs">
                    <div className="flex justify-between items-center text-left">
                      <span className="text-[14px] font-black tracking-widest font-sans leading-none">QRIS</span>
                      <span className="text-[8px] font-mono opacity-90 leading-tight text-right uppercase">
                        Sistem GPN Indonesia
                      </span>
                    </div>
                    <p className="text-[7px] uppercase font-bold tracking-tight mt-0.5 text-center leading-none opacity-90">
                      Quick Response Code Indonesian Standard
                    </p>
                  </div>

                  {/* Merchant / Stand Info */}
                  <div className="text-center my-2.5">
                    <h5 className="font-extrabold text-[11px] text-slate-900 tracking-tight uppercase">
                      {appConfig.storeName ? appConfig.storeName.toUpperCase() : "ASLAM'S LEDGER"}
                    </h5>
                    <p className="text-[8px] text-slate-400 font-mono tracking-wider leading-none">NMID : ID102435799100 • ASLAM_POS</p>
                    <div className="h-[1px] bg-slate-150 w-24 mx-auto mt-1.5" />
                  </div>

                  {/* QRIS Code Box */}
                  <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-inner flex flex-col items-center justify-center relative group min-h-[160px]">
                    {qrisPaidStatus === 'success' ? (
                      <div className="w-full h-full flex flex-col items-center justify-center text-center text-emerald-600 animate-fade-in gap-1.5 p-3 bg-emerald-50 rounded-lg">
                        <CheckCircle2 size={36} className="text-emerald-500 animate-bounce" />
                        <p className="text-[11px] font-black uppercase tracking-wide">Pembayaran Sukses!</p>
                        <p className="text-[8px] text-slate-500 font-semibold leading-normal">
                          Dana senilai <strong>Rp {checkoutResult.order.totalPrice.toLocaleString('id-ID')}</strong> berhasil dikreditkan ke buku kas utama Aslam.
                        </p>
                      </div>
                    ) : (
                      <>
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&color=1e293b&data=00020101021226500016ID.CO.ASLAM.LEDGER011893075200026207015512345678901235204581153033605406${checkoutResult.order.totalPrice}5802ID5915ASLAM%20LEDGER%20POS6007JAKARTA6304`}
                          alt="Dynamic QRIS QR Code"
                          referrerPolicy="no-referrer"
                          className="w-36 h-36"
                        />
                        <div className="absolute inset-x-0 bottom-1 flex justify-center">
                          <span className="px-1.5 py-0.5 bg-rose-600 text-white font-mono text-[7px] font-black rounded shadow-xs uppercase tracking-wider animate-pulse">
                            DINAMIS SIMULATOR
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Invoice / Billing pricing container */}
                  <div className="text-center w-full my-2 space-y-0.5 font-sans">
                    <p className="text-[7.5px] text-slate-400 uppercase font-bold tracking-widest font-mono">
                      TOTAL TAGIHAN NOMINAL
                    </p>
                    <p className="text-sm font-black text-slate-900 font-mono tracking-tight text-[#1E293B]">
                      Rp {checkoutResult.order.totalPrice.toLocaleString('id-ID')}
                    </p>
                    {qrisPaidStatus === 'pending' && (
                      <div className="flex justify-center items-center gap-1 mt-0.5 text-[8px] text-amber-600 bg-amber-50 rounded-full px-2 py-0.5 w-max mx-auto border border-amber-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                        <span>Menunggu pembayaran HP pengunjung...</span>
                      </div>
                    )}
                  </div>

                  {/* Simulation Controls for Teller/Guest */}
                  <div className="w-full space-y-1 bg-slate-50 p-2 rounded-lg border border-slate-200">
                    {qrisPaidStatus === 'pending' ? (
                      <button
                        onClick={() => setQrisPaidStatus('success')}
                        className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[9px] uppercase tracking-wider rounded-md transition-all flex items-center justify-center gap-1 cursor-pointer shadow-xs shadow-emerald-500/10 animate-fade-in"
                      >
                        <CheckCircle2 size={11} />
                        Simulasi Pelanggan Scan Berhasil
                      </button>
                    ) : (
                      <button
                        onClick={() => setQrisPaidStatus('pending')}
                        className="w-full py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[9px] uppercase tracking-wider rounded-md transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        🔄 Ganti Dynamic QRIS (Reset)
                      </button>
                    )}
                    <p className="text-[7px] text-slate-400 text-center font-mono leading-none">
                      QRIS ini dinamis, berubah otomatis mengikuti jumlah billing pesanan.
                    </p>
                  </div>

                </div>
              )}

              {/* KOLOM Kanan: HIGH RESOLUTION EDC TERMINAL BANK SIMULATOR */}
              {checkoutResult.order.paymentMethod === 'Debit' && (
                <div className="lg:col-span-6 flex flex-col justify-between p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden min-h-[440px] font-sans">
                  
                  {/* GLOW DECORATIONS */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />

                  {/* BANK CORRESPONDING ACCENT BAR */}
                  <div className={`w-full p-2.5 rounded-xl text-center shadow-lg transition-all duration-300 ${
                    edcBank === 'BCA' ? 'bg-blue-600 text-white' :
                    edcBank === 'Mandiri' ? 'bg-[#1E3A8A] text-[#FBBF24] border border-[#FBBF24]/30' :
                    edcBank === 'BRI' ? 'bg-blue-800 text-white border-b-2 border-orange-500' :
                    'bg-teal-700 text-white'
                  }`}>
                    <div className="flex justify-between items-center text-left">
                      <span className="text-xs font-black tracking-widest font-mono">EDC TERMINAL</span>
                      <span className="text-[10px] font-extrabold uppercase bg-white/10 px-2 py-0.5 rounded">
                        {edcBank} NETWORK
                      </span>
                    </div>
                    <div className="flex gap-1.5 justify-center items-center mt-1.5 text-[8px] tracking-wider uppercase font-extrabold opacity-95">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Mencari Sinyal GPRS/Ethernet... OK
                    </div>
                  </div>

                  {/* SIMULATOR SCREEN CONTENT (INSIDE CONSOLE LCD DISPLAY) */}
                  <div className="bg-[#0b101d] p-3.5 my-3 rounded-xl border border-slate-800 shadow-inner min-h-[175px] flex flex-col justify-between font-mono text-[10px]">
                    
                    {/* Header */}
                    <div className="flex justify-between items-center text-[#64748B] text-[8px] pb-1 border-b border-white/5">
                      <span>{edcBank} COMMERCE V8.4</span>
                      <span className="animate-pulse">● ONLINE</span>
                    </div>

                    {/* Step-by-Step Display Viewports */}
                    {edcStep === 'swipe_insert' && (
                      <div className="space-y-2.5 my-auto text-center py-2 animate-fade-in">
                        <p className="text-[#38BDF8] font-bold text-xs uppercase tracking-wide">SILAKAN TRANSAKSI</p>
                        <p className="text-white text-[11px] leading-relaxed">
                          Masukkan kartu chip Anda ke bawah, gesek pita magnetik, atau tempelkan e-wallet/HP (NFC Pay)
                        </p>
                        <div className="bg-slate-950/80 p-2 rounded border border-white/5 space-y-0.5">
                          <p className="text-[8px] text-slate-500 uppercase font-bold">Total Nominal EDC</p>
                          <p className="text-[#10B981] font-bold text-sm">Rp {checkoutResult.order.totalPrice.toLocaleString('id-ID')}</p>
                        </div>

                        {/* Quick Simulated Actions */}
                        <div className="grid grid-cols-2 gap-1.5 pt-1">
                          <button
                            onClick={() => {
                              setEdcCardType('GPN');
                              setEdcCardNumber('5221-8890-4432-1109');
                              setEdcCardHoldName('ASLAM RAMADHAN');
                              setEdcStep('pin_entry');
                            }}
                            className="p-1 px-2 bg-slate-850 hover:bg-slate-800 rounded border border-white/10 text-[9px] text-[#A7F3D0] active:scale-95 transition-all cursor-pointer font-bold"
                          >
                            💳 Tempel GPN Debit (NFC)
                          </button>
                          <button
                            onClick={() => {
                              setEdcCardType('Visa');
                              setEdcCardNumber('4112-9023-1188-7561');
                              setEdcCardHoldName('ASLAM CLIENT GOLD');
                              setEdcStep('pin_entry');
                            }}
                            className="p-1 px-2 bg-slate-850 hover:bg-slate-800 rounded border border-white/10 text-[9px] text-[#93C5FD] active:scale-95 transition-all cursor-pointer font-bold"
                          >
                            💳 Gesek Kartu Visa Gold
                          </button>
                        </div>
                      </div>
                    )}

                    {edcStep === 'pin_entry' && (
                      <div className="space-y-2 my-auto py-1 animate-fade-in text-center">
                        <p className="text-[#FBBF24] font-bold text-xs tracking-wide">MASUKKAN PIN DEBIT</p>
                        <p className="text-slate-400 text-[9px] leading-normal font-sans">
                          Silakan mintakan pelanggan memasukkan 6-digit PIN keamanan melalui Keyboard PinPad di bawah.
                        </p>

                        <div className="flex justify-center gap-1.5 my-2">
                          {[0, 1, 2, 3, 4, 5].map((idx) => (
                            <div 
                              key={idx} 
                              className={`w-4 h-4 rounded-full border flex items-center justify-center font-bold text-xs ${
                                edcPin.length > idx 
                                  ? 'bg-amber-400 border-amber-500 text-slate-950 animate-pulse' 
                                  : 'bg-slate-950 border-slate-800 text-slate-705'
                              }`}
                            >
                              {edcPin.length > idx ? '●' : ''}
                            </div>
                          ))}
                        </div>

                        <p className="text-[8px] text-slate-500 uppercase tracking-widest leading-none font-bold">
                          KARTU: {edcCardType} • {edcCardNumber.substring(14)}
                        </p>
                      </div>
                    )}

                    {edcStep === 'authorizing' && (
                      <div className="space-y-2.5 my-auto text-center py-4 animate-fade-in flex flex-col items-center">
                        <RefreshCw size={24} className="text-[#38BDF8] animate-spin" />
                        <div>
                          <p className="text-[#38BDF8] font-bold text-xs uppercase tracking-widest font-mono">DIAL HOST...</p>
                          <p className="text-[9px] text-slate-400 font-sans mt-0.5">Meminta otorisasi pin {edcBank} Bank Network...</p>
                        </div>
                        <div className="bg-slate-950/50 px-3 py-1 rounded text-[8px] text-[#A7F3D0] border border-[#A7F3D0]/10">
                          ID TRACE : {Math.floor(100000 + Math.random() * 900000)}
                        </div>
                      </div>
                    )}

                    {edcStep === 'success' && (
                      <div className="space-y-1.5 my-auto text-center animate-fade-in">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500 flex items-center justify-center mx-auto mb-1">
                          <CheckCircle2 size={18} className="text-[#10B981] animate-bounce" />
                        </div>
                        <p className="text-[#10B981] font-bold text-xs tracking-wider uppercase">DITERIMA / APPROVED</p>
                        
                        <div className="bg-slate-950/80 p-2.5 rounded border border-white/5 text-left text-[8px] space-y-0.5 text-slate-350 font-mono text-slate-300">
                          <p>APPR CODE: {Math.floor(100000 + Math.random() * 900000).toString(16).toUpperCase()}</p>
                          <p>KARTU    : {edcCardType} ({edcCardNumber})</p>
                          <p>NAMA     : {edcCardHoldName}</p>
                          <p>NOMINAL  : Rp {checkoutResult.order.totalPrice.toLocaleString('id-ID')}</p>
                        </div>

                        <p className="text-[7.5px] text-slate-500 font-sans leading-none">
                          Transaksi aman bersertifikat Bank GPN Indonesia & OJK.
                        </p>
                      </div>
                    )}

                    {/* Footer LCD */}
                    <div className="flex justify-between items-center text-[#64748B] text-[7px] pt-1 border-t border-white/5">
                      <span>MERCHANT: LEDGERLINE_ASLAM</span>
                      <span>TRACE : 202605</span>
                    </div>
                  </div>

                  {/* BANK SELECTOR CHIPS - ONLY SHOW IN IDLE/SWIPE_INSERT & SUCCESS RESET */}
                  {edcStep === 'swipe_insert' && (
                    <div className="space-y-1 pb-2">
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest font-mono">PILIH JARINGAN BANK EDC:</span>
                      <div className="grid grid-cols-4 gap-1">
                        {(['BCA', 'Mandiri', 'BRI', 'BNI'] as const).map((b) => (
                          <button
                            key={b}
                            onClick={() => setEdcBank(b)}
                            className={`p-1 py-1.5 text-[8.5px] font-extrabold rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                              edcBank === b 
                                ? 'bg-[#38BDF8]/10 text-[#38BDF8] border-[#38BDF8]' 
                                : 'bg-slate-950/40 text-slate-400 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* EDC NUMERIC KEYBOARD/PINPAD PANEL */}
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 shadow-inner">
                    <div className="grid grid-cols-3 gap-1.5 text-slate-300 font-mono">
                      
                      {/* Numeric rows */}
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <button
                          key={num}
                          type="button"
                          disabled={edcStep !== 'pin_entry' || edcPin.length >= 6}
                          onClick={() => {
                            setEdcPin(prev => prev + num.toString());
                          }}
                          className="py-1.5 bg-slate-900 hover:bg-slate-850 disabled:opacity-40 border border-slate-800 rounded-xl text-center font-black transition-all cursor-pointer text-xs flex items-center justify-center active:scale-90"
                        >
                          {num}
                        </button>
                      ))}

                      {/* CANCEL (Red) */}
                      <button
                        type="button"
                        onClick={() => {
                          setEdcStep('swipe_insert');
                          setEdcPin('');
                        }}
                        className="py-1.5 bg-rose-900/80 hover:bg-rose-900 border border-rose-800 rounded-xl text-slate-100 font-black transition-all cursor-pointer text-[8px] flex items-center justify-center uppercase tracking-wide tracking-tighter"
                      >
                        Batal
                      </button>

                      {/* 0 */}
                      <button
                        type="button"
                        disabled={edcStep !== 'pin_entry' || edcPin.length >= 6}
                        onClick={() => {
                          setEdcPin(prev => prev + '0');
                        }}
                        className="py-1.5 bg-slate-900 hover:bg-slate-850 disabled:opacity-40 border border-slate-800 rounded-xl text-center font-black transition-all cursor-pointer text-xs flex items-center justify-center active:scale-90"
                      >
                        0
                      </button>

                      {/* CLEAR (Yellow) */}
                      <button
                        type="button"
                        disabled={edcStep !== 'pin_entry'}
                        onClick={() => {
                          setEdcPin('');
                        }}
                        className="py-1.5 bg-amber-600/80 hover:bg-amber-600 border border-amber-500 rounded-xl text-slate-950 font-black transition-all cursor-pointer text-[8px] flex items-center justify-center uppercase tracking-wide tracking-tighter"
                      >
                        Hapus
                      </button>

                      {/* ENTER KEY (Large bottom wide or corner button - Green) */}
                      <button
                        type="button"
                        disabled={edcStep !== 'pin_entry'}
                        onClick={() => {
                          if (edcPin.length < 6) {
                            triggerCashierToast('PIN Debit Bank wajib terdiri dari 6 digit keamanan!');
                            return;
                          }
                          setEdcStep('authorizing');
                          setTimeout(() => {
                            setEdcStep('success');
                          }, 1800);
                        }}
                        className="col-span-3 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-45 border border-emerald-500 rounded-xl text-slate-950 font-black transition-all cursor-pointer text-[10px] flex items-center justify-center gap-1.5 uppercase tracking-wider"
                      >
                        <CheckCircle2 size={11} />
                        Kirim PIN & Otorisasi Bank (Enter)
                      </button>

                    </div>
                  </div>

                  {/* BOTTOM RESET OPTION */}
                  {edcStep === 'success' && (
                    <button
                      onClick={() => {
                        setEdcStep('swipe_insert');
                        setEdcPin('');
                      }}
                      className="mt-2 w-full py-1.5 bg-slate-800 hover:bg-slate-700 font-bold text-[9px] uppercase tracking-wider rounded-lg transition-all text-center.5 flex justify-center items-center gap-1 text-slate-300 cursor-pointer"
                    >
                      🔄 Reset / Mulai Ulang EDC
                    </button>
                  )}

                </div>
              )}

            </div>

            {/* DIRECT HARDWARE TRIGGER PRINT BUTTON PANEL */}
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                disabled={printingStatus}
                onClick={handlePrintReceipt}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-blue-500/10"
              >
                <Printer size={13} />
                {printingStatus ? 'Sedang Mencetak...' : 'Cetak & Hubungkan Ke USB/Bluetooth'}
              </button>

              <button
                onClick={() => {
                  const blob = new Blob([
                    `LEDGERLINE BY ASLAM - RECEIPT STATUS LUNAS\nID TX: ${checkoutResult.order.id}\nTOTAL: Rp ${checkoutResult.order.totalPrice.toLocaleString('id-ID')}`
                  ], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `LedgerLine-Struk-${checkoutResult.order.id}.txt`;
                  a.click();
                }}
                className="px-4 py-2 bg-slate-150 hover:bg-slate-200 text-slate-700 border border-slate-250 font-semibold text-xs rounded-xl transition-all"
              >
                Unduh File Struk (.txt)
              </button>
            </div>
          </div>
        )}

      </div>

      {/* FLOATING IN-APP TOAST */}
      {cashierToast && (
        <div className="fixed bottom-5 right-5 bg-slate-900 border border-slate-800 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 z-55 animate-slide-in text-xs max-w-xs" id="cashier-toast">
          <AlertCircle className="text-amber-400 shrink-0" size={16} />
          <p className="font-semibold leading-relaxed text-slate-100">{cashierToast}</p>
        </div>
      )}

    </div>
  );
}
