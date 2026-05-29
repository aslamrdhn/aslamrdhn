/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CoffeeTable, Product } from '../types';
import { 
  QrCode, 
  Smartphone, 
  ChevronRight, 
  Utensils, 
  CheckCircle2, 
  ShoppingBag, 
  Plus, 
  Minus,
  Sparkles,
  Info
} from 'lucide-react';

interface TableOrdersProps {
  tables: CoffeeTable[];
  products: Product[];
  appConfig: any;
  onRefresh: () => void;
}

export default function TableOrders({ tables, products, appConfig, onRefresh }: TableOrdersProps) {
  const [selectedTableForQR, setSelectedTableForQR] = useState<CoffeeTable>(tables[0]);
  const [customerModeActive, setCustomerModeActive] = useState<boolean>(false);
  
  // States khusus simulator customer-side ordering
  const [customerTable, setCustomerTable] = useState<string>('Meja 01 (VVIP Int)');
  const [customerCart, setCustomerCart] = useState<{ product: Product; quantity: number; notes: string }[]>([]);
  const [customerSuccessOrder, setCustomerSuccessOrder] = useState<any | null>(null);
  const [isOrdering, setIsOrdering] = useState<boolean>(false);
  const [orderError, setOrderError] = useState<string>('');

  // Tambah item ke keranjang pelanggan
  const addCustomerItem = (p: Product) => {
    const existing = customerCart.find(item => item.product.id === p.id);
    if (existing) {
      setCustomerCart(customerCart.map(item => item.product.id === p.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCustomerCart([...customerCart, { product: p, quantity: 1, notes: '' }]);
    }
  };

  const removeCustomerQty = (pId: string) => {
    const target = customerCart.find(item => item.product.id === pId);
    if (!target) return;
    if (target.quantity === 1) {
      setCustomerCart(customerCart.filter(item => item.product.id !== pId));
    } else {
      setCustomerCart(customerCart.map(item => item.product.id === pId ? { ...item, quantity: item.quantity - 1 } : item));
    }
  };

  const updateCustomerNotes = (pId: string, notes: string) => {
    setCustomerCart(customerCart.map(item => item.product.id === pId ? { ...item, notes } : item));
  };

  const customerSubtotal = customerCart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const customerTax = Math.round(customerSubtotal * 0.11);
  const customerTotal = customerSubtotal + customerTax;

  // Pelanggan melakukan pemesanan langsung dari HP (simulasi scanning qrish barcode meja)
  const submitCustomerOrder = async () => {
    if (customerCart.length === 0) return;
    setIsOrdering(true);
    setOrderError('');

    const formattedItems = customerCart.map(item => ({
      productId: item.product.id,
      quantity: item.quantity,
      notes: item.notes || undefined,
      priceAtSale: item.product.price,
      costAtSale: item.product.costPrice
    }));

    const orderPayload = {
      orderTime: new Date().toISOString(),
      tableNumber: customerTable,
      items: formattedItems,
      subtotal: customerSubtotal,
      discount: 0,
      tax: customerTax,
      totalPrice: customerTotal,
      paymentMethod: 'QRIS' as const,
      paymentStatus: 'Success' as const,
      receiptPrinted: false,
      notes: `Pemesanan mandiri via Scan QR Barcode ${customerTable}`
    };

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
        setCustomerSuccessOrder(data.order);
        setCustomerCart([]);
        onRefresh(); // Tarik info stok baru ke dashboard harian
      } else {
        setOrderError('Gagal memproses pemesanan mandiri.');
      }
    } catch (err) {
      setOrderError('Error saat mengirimkan porsi');
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6" id="table-orders-tab">
      
      {/* KIRI - Panel Admin Scanner / Cetak Barcode Meja (Col 5) */}
      <div className="md:col-span-5 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <QrCode className="text-slate-800" size={18} />
            Pengaturan Barcode Meja Pengunjung
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pusat generate kode QR unik per meja untuk pemesanan digital otomatis.
          </p>
        </div>

        {/* List Grid Select Meja */}
        <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
          {tables.map(table => (
            <button
              key={table.id}
              onClick={() => setSelectedTableForQR(table)}
              className={`p-3 text-left rounded-xl border text-xs font-bold flex flex-col justify-between transition-all cursor-pointer ${
                selectedTableForQR.id === table.id 
                ? 'bg-[#1E293B] text-white border-slate-800 shadow-xs' 
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <span>{table.name}</span>
              <span className={`text-[9px] font-bold uppercase mt-2 px-1.5 py-0.5 rounded-sm inline-block ${
                selectedTableForQR.id === table.id 
                ? 'bg-white/20 text-white' 
                : table.status === 'Empty' 
                ? 'bg-emerald-50 text-emerald-700' 
                : 'bg-amber-50 text-amber-700'
              }`}>
                {table.status === 'Empty' ? 'Meja Kosong' : 'Meja Terisi'}
              </span>
            </button>
          ))}
        </div>

        {/* View Detail Barcode bendera Meja yang sedang terpilih */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase font-sans tracking-widest bg-slate-200/50 px-2 py-0.5 rounded-sm">
            E-ORDER TAG TEMPLATE
          </p>
          <h4 className="text-base font-bold text-slate-800 mt-2">
            {selectedTableForQR.name}
          </h4>
          <p className="text-[11px] text-slate-500 mb-3 leading-normal">
            Silakan tempel stiker Barcode di meja {selectedTableForQR.name} ini. Pengunjung cukup scan untuk membuka menu etalase digital.
          </p>

          <img 
            src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(appConfig.storeName + '_Meja_' + selectedTableForQR.id)}`}
            alt={`QR Barcode Meja ${selectedTableForQR.id}`}
            referrerPolicy="no-referrer"
            className="w-36 h-36 border border-slate-300 p-1.5 bg-white shadow-xs rounded-lg"
          />

          <button
            onClick={() => window.print()}
            className="mt-4 flex items-center justify-center gap-2 w-full py-2 border border-slate-350 hover:bg-slate-100 font-semibold text-slate-705 text-xs rounded-xl transition-all"
          >
            Cetak Label Meja ({selectedTableForQR.name})
          </button>
        </div>
      </div>

      {/* KANAN - Simulator HP Pengunjung (Customer-Side Screen) - Col 7 */}
      <div className="md:col-span-7 bg-[#1E293B] text-white p-5 rounded-2xl border border-slate-800 shadow-lg relative flex flex-col justify-between min-h-[500px]" id="customer-phone-simulator">
        
        {/* Header Simulator HP */}
        <div>
          <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-3">
            <div className="flex items-center gap-1.5">
              <Smartphone className="text-blue-450 text-blue-400" size={16} />
              <span className="text-xs font-mono font-bold tracking-wider text-slate-300">SIMULATOR HP MANDIRI PENGUNJUNG</span>
            </div>
            
            <button
              id="toggle-simulator-view"
              onClick={() => {
                setCustomerModeActive(!customerModeActive);
                setCustomerSuccessOrder(null);
              }}
              className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-[10px] font-bold tracking-wider font-mono rounded-md text-blue-400 uppercase transition-all"
            >
              {customerModeActive ? 'Kembali' : 'Coba Pesan'}
            </button>
          </div>

          {!customerModeActive ? (
            /* Intro State Simulator */
            <div className="py-12 text-center text-slate-300 space-y-4">
              <Utensils className="mx-auto text-blue-500 animate-bounce" size={48} />
              <h3 className="text-base font-bold text-white tracking-tight">E-Order Mandiri Kedai Kopi</h3>
              <p className="text-xs max-w-sm mx-auto leading-normal text-slate-400">
                Aplikasi ini mendukung skenario canggih dimana pelanggan kafe dapat memesan minum kopi dari kursi meja mereka sendiri dengan memindai kode QR.
              </p>
              <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-left space-y-2">
                <div className="flex gap-2 items-start text-xs text-blue-300">
                  <Sparkles size={16} className="shrink-0 mt-0.5" />
                  <p>Klik tombol <strong>"Coba Pesan"</strong> di pojok kanan atas untuk mensimulasikan layar HP pelanggan di meja!</p>
                </div>
                <div className="flex gap-2 items-start text-xs text-slate-400">
                  <Info size={16} className="shrink-0 mt-0.5" />
                  <p>Setiap transaksi pelanggan akan otomatis memotong stok bahan baku dan langsung masuk ke laporan harian kasir utama kedai Anda.</p>
                </div>
              </div>
            </div>
          ) : customerSuccessOrder ? (
            /* Success Order State Customer Screen */
            <div className="py-6 text-center space-y-4" id="customer-success-screen">
              <CheckCircle2 className="mx-auto text-emerald-400" size={54} />
              <h3 className="text-lg font-bold text-emerald-400">Pesanan Berhasil Dikirim!</h3>
              <p className="text-xs text-slate-300 max-w-xs mx-auto">
                Pesanan dari <strong className="text-white underline">{customerSuccessOrder.tableNumber}</strong> telah dikirim langsung ke monitor kasir barista utama.
              </p>
              
              <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-left max-w-md mx-auto text-xs space-y-1.5 font-mono">
                <p className="text-slate-400">TRANSAKSI ID: {customerSuccessOrder.id}</p>
                <p className="text-slate-400">METODE BAYAR: QRIS (E-PEMBAYARAN)</p>
                <p className="text-blue-300 font-bold border-t border-dashed border-white/10 pt-1.5 mt-1.5">
                  TOTAL BILLING: Rp {customerSuccessOrder.totalPrice.toLocaleString('id-ID')}
                </p>
              </div>

              <div className="pt-4">
                <button
                  id="reset-customer-flow-btn"
                  onClick={() => setCustomerSuccessOrder(null)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 font-bold text-xs text-white rounded-lg transition-all"
                >
                  Pesan Lagi
                </button>
              </div>
            </div>
          ) : (
            /* Active Ordering State Customer Screen */
            <div className="space-y-4">
              {/* Header Etalase Pengunjung */}
              <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10 text-xs">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">LOKASI PELANGGAN</p>
                  <select
                    id="simulator-customer-table-select"
                    value={customerTable}
                    onChange={(e) => setCustomerTable(e.target.value)}
                    className="bg-transparent border-0 font-bold text-blue-400 focus:outline-hidden cursor-pointer"
                  >
                    {tables.map(t => (
                      <option key={t.id} value={`Meja ${t.id} (${t.name.split(' ')[2] || 'A'})`} className="text-slate-900 bg-white">
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-400">{appConfig.storeName}</p>
                  <p className="text-[10px] text-slate-400">Menu Etalase</p>
                </div>
              </div>

              {/* List Menu Terintegrasi dengan Stok Kasir */}
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-2">Pilih Minuman & Cemilan:</p>
                {products
                  .filter(p => p.category !== 'Beans' && p.stock > 0)
                  .map(p => (
                    <div key={p.id} className="p-2.5 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 flex justify-between items-center text-xs">
                      <div className="flex-1 pr-2">
                        <span className="font-bold text-white">{p.name}</span>
                        {p.komposisi && (
                          <p className="text-[10px] text-slate-300 mt-1 italic leading-tight">🌱 Komposisi: {p.komposisi}</p>
                        )}
                        <p className="text-[11px] text-blue-300 font-mono mt-1">Rp {p.price.toLocaleString('id-ID')}</p>
                      </div>
                      <button
                        onClick={() => addCustomerItem(p)}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white rounded-lg"
                      >
                        + Tambah
                      </button>
                    </div>
                  ))}
              </div>

              {/* Ringkasan Keranjang Pembeli Mandiri */}
              {customerCart.length > 0 && (
                <div className="bg-white/5 p-4 rounded-xl border border-dashed border-white/25 text-xs space-y-3">
                  <p className="font-bold text-blue-300 flex items-center gap-1">
                    <ShoppingBag size={14} />
                    Keranjang Belanja Anda:
                  </p>
                  <div className="space-y-2 max-h-[120px] overflow-y-auto">
                    {customerCart.map(item => (
                      <div key={item.product.id} className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold text-slate-100">{item.product.name} (x{item.quantity})</p>
                          <input 
                            placeholder="Catatan tambahan..." 
                            value={item.notes} 
                            onChange={(e) => updateCustomerNotes(item.product.id, e.target.value)}
                            className="w-full mt-1 bg-white/5 rounded border border-white/10 text-[10px] p-1 text-slate-200" 
                          />
                        </div>
                        <div className="flex items-center gap-2 font-mono text-xs ml-3">
                          <button onClick={() => removeCustomerQty(item.product.id)} className="p-0.5 bg-white/10 rounded"><Minus size={10} /></button>
                          <span>{item.quantity}</span>
                          <button onClick={() => addCustomerItem(item.product)} className="p-0.5 bg-white/10 rounded"><Plus size={10} /></button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-white/10 pt-2 flex justify-between font-bold text-xs mt-2">
                    <span>Total Bayar (Pajak 11% Included)</span>
                    <span className="font-mono text-blue-300">Rp {customerTotal.toLocaleString('id-ID')}</span>
                  </div>

                  {orderError && (
                    <div className="p-2.5 bg-rose-950/40 border border-rose-800 text-rose-200 text-[10px] rounded-lg text-center font-semibold mt-2">
                      ⚠️ {orderError}
                    </div>
                  )}

                  <button
                    onClick={submitCustomerOrder}
                    disabled={isOrdering}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-all mt-2"
                  >
                    {isOrdering ? 'Memproses Orderan...' : 'Pesan & Bayar QRIS Instan'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Simulator HP */}
        <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-center text-[11px] text-slate-400 mt-4 leading-normal">
          <p>Fitur ini mensinkronisasi database etalase pengunjung & kasir internal secara real-time demi kenyamanan penuh pelanggan kedai kopi masa kini.</p>
        </div>

      </div>

    </div>
  );
}
