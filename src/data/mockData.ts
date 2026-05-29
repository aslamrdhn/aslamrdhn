/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, RawMaterial, Recipe, CoffeeTable, FinanceLog, AppConfig } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Espresso Arabica Kintamani',
    category: 'Coffee',
    price: 18000,
    costPrice: 4000,
    stock: 120,
    warningLimit: 20,
    barcode: 'PROD0001',
    supplierName: 'Koperasi Kopi Kintamani',
    supplierContact: '0812-3456-7890',
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'prod-2',
    name: 'Cappuccino Velvet (Hot)',
    category: 'Coffee',
    price: 24000,
    costPrice: 7500,
    stock: 95,
    warningLimit: 15,
    barcode: 'PROD0002',
    supplierName: 'IndoMilk Distributor Bali',
    supplierContact: '0819-8765-4321',
    imageUrl: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'prod-3',
    name: 'Es Kopi Susu Gula Aren',
    category: 'Coffee',
    price: 20000,
    costPrice: 6000,
    stock: 15,
    warningLimit: 20,
    barcode: 'PROD0003',
    supplierName: 'Gula Aren Lestari',
    supplierContact: '0821-4433-2211',
    imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'prod-10',
    name: 'Gayo V60 Single Origin',
    category: 'Coffee',
    price: 25500,
    costPrice: 8000,
    stock: 35,
    warningLimit: 10,
    barcode: 'PROD0010',
    supplierName: 'Koperasi Gayo Coffee',
    supplierContact: '0811-2233-4455',
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'prod-11',
    name: 'Es Kopi Pandan Latte',
    category: 'Coffee',
    price: 23000,
    costPrice: 6550,
    stock: 60,
    warningLimit: 12,
    barcode: 'PROD0011',
    supplierName: 'IndoMilk Distributor Bali',
    supplierContact: '0819-8765-4321',
    imageUrl: 'https://images.unsplash.com/photo-1497515114629-f71d768fd07c?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'prod-21',
    name: 'Es Kopi Macchiato Caramel Luxe',
    category: 'Coffee',
    price: 28000,
    costPrice: 9000,
    stock: 45,
    warningLimit: 10,
    barcode: 'PROD0021',
    supplierName: 'IndoMilk Distributor Bali',
    supplierContact: '0819-8765-4321',
    imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'prod-22',
    name: 'Kopi Luwak Authentic Gayo',
    category: 'Coffee',
    price: 48000,
    costPrice: 15000,
    stock: 15,
    warningLimit: 5,
    barcode: 'PROD0022',
    supplierName: 'Koperasi Gayo Coffee',
    supplierContact: '0811-2233-4455',
    imageUrl: 'https://images.unsplash.com/photo-1610632380989-680024991353?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'prod-4',
    name: 'Matcha Green Tea Latte',
    category: 'Non-Coffee',
    price: 26000,
    costPrice: 9000,
    stock: 80,
    warningLimit: 10,
    barcode: 'PROD0004',
    supplierName: 'Toko Bahan Kue Sakura',
    supplierContact: '0857-1122-3344',
    imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'prod-5',
    name: 'Choco Cream Cookies',
    category: 'Non-Coffee',
    price: 25000,
    costPrice: 8000,
    stock: 45,
    warningLimit: 10,
    barcode: 'PROD0005',
    supplierName: 'Cocoa Premium Supplier',
    supplierContact: '0899-7766-5544',
    imageUrl: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'prod-12',
    name: 'Es Red Velvet Fudge Milkshake',
    category: 'Non-Coffee',
    price: 26000,
    costPrice: 8500,
    stock: 40,
    warningLimit: 10,
    barcode: 'PROD0012',
    supplierName: 'Toko Bahan Kue Sakura',
    supplierContact: '0857-1122-3344',
    imageUrl: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'prod-13',
    name: 'Avocado Coffee Espresso Float',
    category: 'Non-Coffee',
    price: 28500,
    costPrice: 11000,
    stock: 32,
    warningLimit: 8,
    barcode: 'PROD0013',
    supplierName: 'IndoMilk Distributor Bali',
    supplierContact: '0819-8765-4321',
    imageUrl: 'https://images.unsplash.com/photo-1596073410222-0a59cfc8e26e?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'prod-6',
    name: 'Butter Croissant Premium',
    category: 'Snacks',
    price: 22000,
    costPrice: 11000,
    stock: 8,
    warningLimit: 10,
    barcode: 'PROD0006',
    supplierName: 'Bonjour Bakery & Pastry',
    supplierContact: '0811-9988-7766',
    imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'prod-7',
    name: 'Garlic Bread Cheese',
    category: 'Snacks',
    price: 24000,
    costPrice: 12000,
    stock: 25,
    warningLimit: 8,
    barcode: 'PROD0007',
    supplierName: 'Bonjour Bakery & Pastry',
    supplierContact: '0811-9988-7766',
    imageUrl: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'prod-14',
    name: 'Pisang Goreng Pasir Crispy',
    category: 'Snacks',
    price: 18000,
    costPrice: 5000,
    stock: 50,
    warningLimit: 15,
    barcode: 'PROD0014',
    supplierName: 'Mitra Kue Denpasar',
    supplierContact: '0878-6543-2101',
    imageUrl: 'https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'prod-15',
    name: 'Roti Bakar Bandung Cokelat Keju',
    category: 'Snacks',
    price: 19500,
    costPrice: 6000,
    stock: 45,
    warningLimit: 12,
    barcode: 'PROD0015',
    supplierName: 'Mitra Kue Denpasar',
    supplierContact: '0878-6543-2101',
    imageUrl: 'https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'prod-16',
    name: 'Cireng Crispy Bumbu Rujak',
    category: 'Snacks',
    price: 16000,
    costPrice: 4000,
    stock: 65,
    warningLimit: 15,
    barcode: 'PROD0016',
    supplierName: 'Mitra Kue Denpasar',
    supplierContact: '0878-6543-2101',
    imageUrl: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'prod-25',
    name: 'Singkong Goreng Keju Merekah',
    category: 'Snacks',
    price: 17500,
    costPrice: 5000,
    stock: 55,
    warningLimit: 12,
    barcode: 'PROD0025',
    supplierName: 'Mitra Kue Denpasar',
    supplierContact: '0878-6543-2101',
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'prod-26',
    name: 'Tempe Mendoan Anget Banyumas',
    category: 'Snacks',
    price: 15000,
    costPrice: 4000,
    stock: 70,
    warningLimit: 15,
    barcode: 'PROD0026',
    supplierName: 'Mitra Kue Denpasar',
    supplierContact: '0878-6543-2101',
    imageUrl: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'prod-17',
    name: 'Nasi Goreng Kampung Premium',
    category: 'Heavy Meals',
    price: 29000,
    costPrice: 10000,
    stock: 40,
    warningLimit: 10,
    barcode: 'PROD0017',
    supplierName: 'Bonjour Bakery & Pastry',
    supplierContact: '0811-9988-7766',
    imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'prod-18',
    name: 'Mie Goreng Jawa Sambal Limau',
    category: 'Heavy Meals',
    price: 27000,
    costPrice: 9000,
    stock: 45,
    warningLimit: 10,
    barcode: 'PROD0018',
    supplierName: 'Bonjour Bakery & Pastry',
    supplierContact: '0811-9988-7766',
    imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'prod-19',
    name: 'Ayam Geprek Sambal Korek',
    category: 'Heavy Meals',
    price: 28000,
    costPrice: 11000,
    stock: 35,
    warningLimit: 10,
    barcode: 'PROD0019',
    supplierName: 'Roastery Nusantara Utama',
    supplierContact: '0813-1111-2222',
    imageUrl: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'prod-20',
    name: 'Nasi Gila Senayan Spesial',
    category: 'Heavy Meals',
    price: 29500,
    costPrice: 11500,
    stock: 30,
    warningLimit: 8,
    barcode: 'PROD0020',
    supplierName: 'Roastery Nusantara Utama',
    supplierContact: '0813-1111-2222',
    imageUrl: 'https://images.unsplash.com/photo-1603133872878-6966546e3002?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'prod-23',
    name: 'Soto Ayam Lamongan Istimewa',
    category: 'Heavy Meals',
    price: 28000,
    costPrice: 10000,
    stock: 35,
    warningLimit: 8,
    barcode: 'PROD0023',
    supplierName: 'Mitra Daging Segar',
    supplierContact: '0812-2255-7799',
    imageUrl: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'prod-24',
    name: 'Sate Ayam Madura Saos Kacang',
    category: 'Heavy Meals',
    price: 32000,
    costPrice: 12000,
    stock: 40,
    warningLimit: 8,
    barcode: 'PROD0024',
    supplierName: 'Mitra Daging Segar',
    supplierContact: '0812-2255-7799',
    imageUrl: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'prod-8',
    name: 'Signature Chocolate Lava Cake',
    category: 'Desserts',
    price: 28000,
    costPrice: 13000,
    stock: 16,
    warningLimit: 5,
    barcode: 'PROD0008',
    supplierName: 'Mitra Kue Denpasar',
    supplierContact: '0878-6543-2101',
    imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'prod-9',
    name: 'Coffee Beans HouseBlend 250g',
    category: 'Beans',
    price: 85000,
    costPrice: 40000,
    stock: 3,
    warningLimit: 5,
    barcode: 'PROD0009',
    supplierName: 'Roastery Nusantara Utama',
    supplierContact: '0813-1111-2222',
    imageUrl: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=500&auto=format&fit=crop&q=60'
  }
];

export const INITIAL_RAW_MATERIALS: RawMaterial[] = [
  {
    id: 'm-1',
    name: 'Biji Kopi House Blend (Arabica/Robusta)',
    stockQuantity: 1200, // dalam gram (1.2 Kg) - Sengaja dibuat kritis!
    stockUnit: 'g',
    warningLimit: 5000, // limit warning adalah 5 Kg (5000g)
    supplierName: 'Roastery Nusantara Utama',
    supplierContact: '0813-1111-2222',
    unitCost: 200, // Rp 200 per gram
    isTaxable: true,
    taxRate: 11
  },
  {
    id: 'm-2',
    name: 'Susu Segar Pasteur (Fresh Milk)',
    stockQuantity: 9500, // dalam ml (9.5 Liter)
    stockUnit: 'ml',
    warningLimit: 15000, // warning limit 15 Liter (15000ml)
    supplierName: 'IndoMilk Distributor Bali',
    supplierContact: '0819-8765-4321',
    unitCost: 18, // Rp 18 per mL
    isTaxable: false,
    taxRate: 0
  },
  {
    id: 'm-3',
    name: 'Sirup Gula Aren Organik',
    stockQuantity: 450, // dalam ml - Sangat kritis!
    stockUnit: 'ml',
    warningLimit: 2000, // warning limit 2 Liter
    supplierName: 'Gula Aren Lestari',
    supplierContact: '0821-4433-2211',
    unitCost: 25, // Rp 25 per mL
    isTaxable: false,
    taxRate: 0
  },
  {
    id: 'm-4',
    name: 'Bubuk Premium Uji Matcha',
    stockQuantity: 2800, // dalam gram
    stockUnit: 'g',
    warningLimit: 1000,
    supplierName: 'Toko Bahan Kue Sakura',
    supplierContact: '0857-1122-3344',
    unitCost: 750, // Rp 750 per gram
    isTaxable: true,
    taxRate: 11
  },
  {
    id: 'm-5',
    name: 'Gelas Kertas Kopi + Tutup (Paper Cup Double Wall)',
    stockQuantity: 48, // dalam pcs - Kritis!
    stockUnit: 'pcs',
    warningLimit: 150,
    supplierName: 'Solo Inti Plastik Packaging',
    supplierContact: '0852-7777-8888',
    unitCost: 1500, // Rp 1500 per pcs
    isTaxable: false,
    taxRate: 0
  },
  {
    id: 'm-6',
    name: 'Sedotan Ramah Lingkungan (Straw Paper)',
    stockQuantity: 220, // dalam pcs
    stockUnit: 'pcs',
    warningLimit: 100,
    supplierName: 'Solo Inti Plastik Packaging',
    supplierContact: '0852-7777-8888',
    unitCost: 200, // Rp 200 per pcs
    isTaxable: false,
    taxRate: 0
  }
];

// Resep pemotongan bahan baku otomatis saat terjual
export const INITIAL_RECIPES: Recipe[] = [
  {
    productId: 'prod-1', // Espresso
    ingredients: [
      { materialId: 'm-1', amount: 18 }, // 18 gram kopi
      { materialId: 'm-5', amount: 1 }   // 1 paper cup
    ]
  },
  {
    productId: 'prod-2', // Cappuccino
    ingredients: [
      { materialId: 'm-1', amount: 18 },  // 18g biji kopi
      { materialId: 'm-2', amount: 150 }, // 150ml susu segar
      { materialId: 'm-5', amount: 1 }    // 1 paper cup
    ]
  },
  {
    productId: 'prod-3', // Es Kopi Susu Aren
    ingredients: [
      { materialId: 'm-1', amount: 15 },  // 15g kopi
      { materialId: 'm-2', amount: 120 }, // 120ml fresh milk
      { materialId: 'm-3', amount: 30 },  // 30ml gula aren
      { materialId: 'm-5', amount: 1 },   // 1 paper cup
      { materialId: 'm-6', amount: 1 }    // 1 sedotan
    ]
  },
  {
    productId: 'prod-4', // Matcha Latte
    ingredients: [
      { materialId: 'm-4', amount: 8 },   // 8g bubuk matcha
      { materialId: 'm-2', amount: 180 }, // 180ml milk
      { materialId: 'm-5', amount: 1 }    // 1 paper cup
    ]
  }
];

export const INITIAL_TABLES: CoffeeTable[] = [
  { id: '1', name: 'Meja 01 (VVIP Int)', status: 'Empty', qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=table_1_qr_order_link' },
  { id: '2', name: 'Meja 02 (Indoor)', status: 'Empty', qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=table_2_qr_order_link' },
  { id: '3', name: 'Meja 03 (Indoor)', status: 'Empty', qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=table_3_qr_order_link' },
  { id: '4', name: 'Meja 04 (Indoor)', status: 'Empty', qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=table_4_qr_order_link' },
  { id: '5', name: 'Meja 05 (Sofa Area)', status: 'Occupied', qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=table_5_qr_order_link' },
  { id: '6', name: 'Meja 06 (Sofa Area)', status: 'Empty', qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=table_6_qr_order_link' },
  { id: '7', name: 'Meja 07 (Semi-Out)', status: 'Empty', qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=table_7_qr_order_link' },
  { id: '8', name: 'Meja 08 (Outdoor)', status: 'Empty', qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=table_8_qr_order_link' },
  { id: '9', name: 'Meja 09 (Bar Side)', status: 'Empty', qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=table_9_qr_order_link' },
  { id: '10', name: 'Meja 10 (Bar Side)', status: 'Empty', qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=table_10_qr_order_link' }
];

export const INITIAL_FINANCE_LOGS: FinanceLog[] = [
  {
    id: 'f-1',
    date: '2026-05-20',
    time: '08:30:15',
    type: 'expense',
    category: 'Stok Bahan Baku',
    amount: 1200000,
    description: 'Beli Biji Kopi Arabica Kintamani Green Beans 10 Kg',
    isEncrypted: true,
    secureHash: 'a52f9c8d3b2e1a0b5c4d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b'
  },
  {
    id: 'f-2',
    date: '2026-05-21',
    time: '12:00:00',
    type: 'expense',
    category: 'Biaya Operasional',
    amount: 350000,
    description: 'Bayar Tagihan Wi-Fi Biznet Biz 100 Mbps',
    isEncrypted: true,
    secureHash: 'e4928f01ba32c19e5d487f61a293b04c81e9f2a0b1d3cf4e5f6a7b8c9d0e1234'
  },
  {
    id: 'f-3',
    date: '2026-05-22',
    time: '21:30:45',
    type: 'income',
    category: 'Penjualan Kopi',
    amount: 2340000,
    description: 'Penjualan Harian Kasir Toko Utama (64 transaksi)',
    isEncrypted: true,
    secureHash: 'f01e2d3c4b5a69788796a5b4c3d2e1f0e4d9c8b7a6f5e4d2c1b0a9f8e7d6c5b4'
  },
  {
    id: 'f-4',
    date: '2026-05-23',
    time: '21:45:00',
    type: 'income',
    category: 'Penjualan Kopi',
    amount: 3120000,
    description: 'Penjualan Harian Kasir Toko Rekon QRIS (82 transaksi)',
    isEncrypted: true,
    secureHash: '3948fa83bc2910de8e374bb29038d17a82ebd9ccde0f09a83bc2910de8e374bb'
  },
  {
    id: 'f-5',
    date: '2026-05-24',
    time: '21:10:00',
    type: 'income',
    category: 'Penjualan Non-Kopi',
    amount: 1480000,
    description: 'Penjualan Harian Item Pastry Merch Handbrew',
    isEncrypted: true,
    secureHash: 'b4a5c6d7e8f90123456789abcdef0123456789abcdef0123456789abcdef0123'
  },
  {
    id: 'f-6',
    date: '2026-05-25',
    time: '10:15:00',
    type: 'expense',
    category: 'Perlengkapan',
    amount: 250000,
    description: 'Beli Paper Cup, Sedotan Kertas & Tissue Tambahan',
    isEncrypted: true,
    secureHash: '83bc2910de8e374bb29038d17a82ebd9ccde0f09a3948fa83bc2910de8e374bb'
  },
  {
    id: 'f-7',
    date: '2026-05-26',
    time: '15:20:00',
    type: 'income',
    category: 'Penjualan Kopi',
    amount: 1250000,
    description: 'Sesi Shift Sore Transaksi Meja Barcode (34 order)',
    isEncrypted: true,
    secureHash: '2ebd9ccde0f09a83bc2910de8e374bb3948fa83bc2910de8e374bb29038d17a8'
  }
];

export const DEFAULT_CONFIG: AppConfig = {
  storeName: 'LedgerLine by Aslam',
  storeAddress: 'Jl. Sudirman No. 42, Senayan, Jakarta',
  storePhone: '+62 812-9988-7766',
  storeWifiName: 'LedgerLine_Premium_5G',
  storeWifiPass: 'ledgerline2026',
  subscriptionPricePerMonth: 49000, // IDR 49,000 / Bulan (sangat hemat untuk UMKM)
  licenseKey: 'LL-ASLAM-SECURE-2026-8849-P'
};
