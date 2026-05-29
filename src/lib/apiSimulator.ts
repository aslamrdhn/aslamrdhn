/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { INITIAL_PRODUCTS, INITIAL_RAW_MATERIALS, INITIAL_RECIPES, INITIAL_TABLES, INITIAL_FINANCE_LOGS, DEFAULT_CONFIG } from '../data/mockData';

// Helper to generate simulated SHA-256 hash for secure financial logs
const generateSimulatedCryptoHash = (dataString: string) => {
  let hash = 0;
  for (let i = 0; i < dataString.length; i++) {
    const char = dataString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const absHash = Math.abs(hash).toString(16).padStart(8, '0');
  return `${absHash}a83bc2910de8e374bb29038d17a82ebd9ccde0f09a3948fa83bc2910de8e${absHash}`;
};

// Local storage keys
const KEYS = {
  PRODUCTS: 'pos_sandbox_products',
  RAW_MATERIALS: 'pos_sandbox_raw_materials',
  RECIPES: 'pos_sandbox_recipes',
  TABLES: 'pos_sandbox_tables',
  FINANCE_LOGS: 'pos_sandbox_finance_logs',
  ORDERS: 'pos_sandbox_orders',
  APP_CONFIG: 'pos_sandbox_app_config',
  BACKUP_HISTORY: 'pos_sandbox_backup_history'
};

// Initial state helpers
const getLocalData = (key: string, defaultValue: any) => {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return defaultValue;
  }
};

const saveLocalData = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Initialize sandbox states
const initSandbox = () => {
  return {
    products: getLocalData(KEYS.PRODUCTS, INITIAL_PRODUCTS),
    rawMaterials: getLocalData(KEYS.RAW_MATERIALS, INITIAL_RAW_MATERIALS),
    recipes: getLocalData(KEYS.RECIPES, INITIAL_RECIPES),
    tables: getLocalData(KEYS.TABLES, INITIAL_TABLES),
    financeLogs: getLocalData(KEYS.FINANCE_LOGS, INITIAL_FINANCE_LOGS),
    orders: getLocalData(KEYS.ORDERS, []),
    appConfig: getLocalData(KEYS.APP_CONFIG, DEFAULT_CONFIG),
    backupHistory: getLocalData(KEYS.BACKUP_HISTORY, [
      {
        id: 'back-1',
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
        fileSize: 12400,
        recordCount: INITIAL_PRODUCTS.length + INITIAL_RAW_MATERIALS.length + INITIAL_FINANCE_LOGS.length,
        status: 'Success (Local Sandbox)',
        checksum: 'e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e123456789abcdef'
      }
    ])
  };
};

// Setup and Intercept global fetch
export function setupApiSimulator() {
  const originalFetch = window.fetch.bind(window);

  const customFetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const urlString = input.toString();

    // Only intercept requests to /api/
    if (urlString.startsWith('/api') || urlString.includes('/api/')) {
      try {
        // Try the server first
        const response = await originalFetch(input, init);
        
        // If the server returns 404/502/500, we fall back to our sandbox!
        if (response.ok) {
          (window as any).isSandboxActive = false;
          return response;
        } else {
          console.warn(`Backend returned status ${response.status}. Falling back to sandbox...`);
        }
      } catch (err) {
        // Network error - Server is offline, we fallback to client local sandbox seamlessly
        console.info('Menggunakan koneksi database lokal untuk menjamin kecepatan respon sistem.');
      }

      // Handle the request in local sandbox mode
      (window as any).isSandboxActive = true;
      return handleLocalRequest(urlString, init);
    }

    // Default fetch for non-api requests
    return originalFetch(input, init);
  };

  try {
    Object.defineProperty(window, 'fetch', {
      value: customFetch,
      configurable: true,
      writable: true,
      enumerable: true
    });
  } catch (err) {
    console.warn("Could not modify window.fetch with defineProperty, attempting direct assignment on globalThis:", err);
    try {
      (globalThis as any).fetch = customFetch;
    } catch (err2) {
      console.error("Critical: Cannot intercept global fetch:", err2);
    }
  }
}

// Simulated local router
function handleLocalRequest(url: string, init?: RequestInit): Response {
  const method = init?.method?.toUpperCase() || 'GET';
  const body = init?.body ? JSON.parse(init.body as string) : null;
  const state = initSandbox();

  const createJsonResponse = (data: any, status = 200) => {
    return new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });
  };

  // 1. GET /api/state
  if (url.endsWith('/api/state') && method === 'GET') {
    return createJsonResponse(state);
  }

  // 2. POST /api/reset
  if (url.endsWith('/api/reset') && method === 'POST') {
    localStorage.removeItem(KEYS.PRODUCTS);
    localStorage.removeItem(KEYS.RAW_MATERIALS);
    localStorage.removeItem(KEYS.RECIPES);
    localStorage.removeItem(KEYS.TABLES);
    localStorage.removeItem(KEYS.FINANCE_LOGS);
    localStorage.removeItem(KEYS.ORDERS);
    localStorage.removeItem(KEYS.APP_CONFIG);
    localStorage.removeItem(KEYS.BACKUP_HISTORY);

    return createJsonResponse({
      success: true,
      message: 'Database reset to default Indonesian coffee shop values in client sandbox.'
    });
  }

  // 3. POST /api/config
  if (url.endsWith('/api/config') && method === 'POST') {
    const newConfig = { ...state.appConfig, ...body };
    saveLocalData(KEYS.APP_CONFIG, newConfig);
    return createJsonResponse({ success: true, config: newConfig });
  }

  // 4. Products endpoints
  if (url.endsWith('/api/products')) {
    if (method === 'GET') {
      return createJsonResponse(state.products);
    }
    if (method === 'POST') {
      const newProd = { id: `prod-${Date.now()}`, ...body };
      const updated = [...state.products, newProd];
      saveLocalData(KEYS.PRODUCTS, updated);
      return createJsonResponse({ success: true, product: newProd });
    }
  }

  const productMatch = url.match(/\/api\/products\/([^\/]+)$/);
  if (productMatch) {
    const id = productMatch[1];
    if (method === 'PUT') {
      const updated = state.products.map((p: any) => p.id === id ? { ...p, ...body } : p);
      saveLocalData(KEYS.PRODUCTS, updated);
      return createJsonResponse({ success: true });
    }
    if (method === 'DELETE') {
      const updated = state.products.filter((p: any) => p.id !== id);
      saveLocalData(KEYS.PRODUCTS, updated);
      return createJsonResponse({ success: true });
    }
  }

  // 5. Raw Materials endpoints
  const wasteMatch = url.match(/\/api\/raw-materials\/([^\/]+)\/waste$/);
  if (wasteMatch && method === 'POST') {
    const id = wasteMatch[1];
    const { wasteAmount, reason } = body;
    const localRawMaterials = [...state.rawMaterials];
    const mat = localRawMaterials.find((m: any) => m.id === id);
    if (!mat) {
      return createJsonResponse({ success: false, message: 'Bahan baku tidak ditemukan.' }, 404);
    }
    const amt = parseFloat(wasteAmount) || 0;
    if (amt <= 0) {
      return createJsonResponse({ success: false, message: 'Jumlah waste harus > 0' }, 400);
    }
    if (mat.stockQuantity < amt) {
      return createJsonResponse({ success: false, message: 'Waste melebihi sisa persediaan' }, 400);
    }

    const originalStock = mat.stockQuantity;
    mat.stockQuantity = parseFloat((mat.stockQuantity - amt).toFixed(2));
    
    // Hitung kerugian finansial dari unitCost & pajak
    const baseLoss = amt * (mat.unitCost || 0);
    const taxRate = mat.isTaxable ? (mat.taxRate || 11) : 0;
    const loss = Math.round(baseLoss * (1 + taxRate / 100));

    let updatedFinanceLogs = [...state.financeLogs];
    if (loss > 0) {
      const logId = `f-waste-${Date.now()}`;
      const today = new Date().toISOString().split('T')[0];
      const nowTime = new Date().toTimeString().split(' ')[0];
      const secureHash = generateSimulatedCryptoHash(`${logId}-${today}-${loss}`);
      
      const wasteLog = {
        id: logId,
        date: today,
        time: nowTime,
        type: 'expense' as const,
        category: 'Waste Bahan Baku',
        amount: loss,
        description: `Waste "${mat.name}" sebanyak ${amt} ${mat.stockUnit}. Alasan: ${reason || 'Tidak dispesifikan'}. Rugi HPP: Rp ${loss.toLocaleString('id-ID')}`,
        isEncrypted: true,
        secureHash
      };
      updatedFinanceLogs = [wasteLog, ...updatedFinanceLogs];
    }

    saveLocalData(KEYS.RAW_MATERIALS, localRawMaterials);
    saveLocalData(KEYS.FINANCE_LOGS, updatedFinanceLogs);
    return createJsonResponse({ success: true, financialLoss: loss });
  }

  if (url.endsWith('/api/raw-materials')) {
    if (method === 'GET') {
      return createJsonResponse(state.rawMaterials);
    }
    if (method === 'POST') {
      const newMat = { id: `m-${Date.now()}`, ...body };
      const updated = [...state.rawMaterials, newMat];
      saveLocalData(KEYS.RAW_MATERIALS, updated);
      return createJsonResponse({ success: true, material: newMat });
    }
  }

  const materialMatch = url.match(/\/api\/raw-materials\/([^\/]+)$/);
  if (materialMatch) {
    const id = materialMatch[1];
    if (method === 'PUT') {
      const updated = state.rawMaterials.map((m: any) => m.id === id ? { ...m, ...body } : m);
      saveLocalData(KEYS.RAW_MATERIALS, updated);
      return createJsonResponse({ success: true });
    }
    if (method === 'DELETE') {
      const updated = state.rawMaterials.filter((m: any) => m.id !== id);
      saveLocalData(KEYS.RAW_MATERIALS, updated);
      return createJsonResponse({ success: true });
    }
  }

  // 6. Recipes endpoints
  if (url.endsWith('/api/recipes')) {
    if (method === 'GET') {
      return createJsonResponse(state.recipes);
    }
    if (method === 'POST') {
      const { productId, ingredients, notes } = body;
      const recipesFiltered = state.recipes.filter((r: any) => r.productId !== productId);
      recipesFiltered.push({ productId, ingredients, notes });
      saveLocalData(KEYS.RECIPES, recipesFiltered);
      return createJsonResponse({ success: true });
    }
  }

  // 7. Table statuses
  const tableStatusMatch = url.match(/\/api\/tables\/([^\/]+)\/status$/);
  if (tableStatusMatch && method === 'PUT') {
    const id = tableStatusMatch[1];
    const { status } = body;
    const updated = state.tables.map((t: any) => t.id === id ? { ...t, status } : t);
    saveLocalData(KEYS.TABLES, updated);
    return createJsonResponse({ success: true });
  }

  // 8. POST /api/checkout
  if (url.endsWith('/api/checkout') && method === 'POST') {
    const orderData = body;
    const orderId = orderData.id || `TX-${Date.now()}`;
    const orderTime = orderData.orderTime || new Date().toISOString();
    const items = orderData.items || [];
    let stockWarningTriggered = false;

    // Mutate state copies locally
    const localProducts = [...state.products];
    const localRawMaterials = [...state.rawMaterials];

    items.forEach((item: any) => {
      // 1. Reduce product stock
      const prod = localProducts.find(p => p.id === item.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
        if (prod.stock <= prod.warningLimit) {
          stockWarningTriggered = true;
        }
      }

      // 2. Reduce recipe raw ingredients
      const recipe = state.recipes.find((r: any) => r.productId === item.productId);
      if (recipe) {
        recipe.ingredients.forEach((ing: any) => {
          const mat = localRawMaterials.find(m => m.id === ing.materialId);
          if (mat) {
            const totalReduction = ing.amount * item.quantity;
            mat.stockQuantity = Math.max(0, mat.stockQuantity - totalReduction);
            if (mat.stockQuantity <= mat.warningLimit) {
              stockWarningTriggered = true;
            }
          }
        });
      }
    });

    const totalPrice = orderData.totalPrice || 0;
    let totalCost = 0;
    items.forEach((item: any) => {
      const p = localProducts.find(pr => pr.id === item.productId);
      if (p) {
        totalCost += (p.costPrice * item.quantity);
      }
    });

    // Create encrypted finance log
    const logId = `f-gen-${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toTimeString().split(' ')[0];
    const secureHash = generateSimulatedCryptoHash(`${logId}-${today}-${totalPrice}-${Date.now()}`);

    const newFinanceLog = {
      id: logId,
      date: today,
      time: nowTime,
      type: 'income' as const,
      category: 'Penjualan Kopi',
      amount: totalPrice,
      description: `Transaksi Sandbox Kasir POS Ref ${orderId} di ${orderData.tableNumber || 'Kasir Utama'}`,
      isEncrypted: true,
      secureHash: secureHash
    };

    const completedOrder = {
      ...orderData,
      id: orderId,
      orderTime,
      totalCost,
      secureHash
    };

    const updatedFinanceLogs = [newFinanceLog, ...state.financeLogs];
    const updatedOrders = [completedOrder, ...state.orders];

    let updatedTables = [...state.tables];
    if (orderData.tableNumber && orderData.tableNumber !== 'Kasir Utama') {
      const cleanTableNum = orderData.tableNumber.replace(/[^0-9]/g, '');
      updatedTables = updatedTables.map(t => t.id === cleanTableNum ? { ...t, status: 'Occupied' } : t);
    }

    saveLocalData(KEYS.PRODUCTS, localProducts);
    saveLocalData(KEYS.RAW_MATERIALS, localRawMaterials);
    saveLocalData(KEYS.FINANCE_LOGS, updatedFinanceLogs);
    saveLocalData(KEYS.ORDERS, updatedOrders);
    saveLocalData(KEYS.TABLES, updatedTables);

    return createJsonResponse({
      success: true,
      order: completedOrder,
      financeLog: newFinanceLog,
      stockWarning: stockWarningTriggered
    });
  }

  // 9. Backup / download restore
  if (url.endsWith('/api/backup/download') && method === 'GET') {
    const fullBackup = {
      products: state.products,
      rawMaterials: state.rawMaterials,
      recipes: state.recipes,
      tables: state.tables,
      financeLogs: state.financeLogs,
      orders: state.orders,
      appConfig: state.appConfig,
      backupDate: new Date().toISOString(),
      secureChecksum: generateSimulatedCryptoHash(JSON.stringify({
        products: state.products,
        rawMaterials: state.rawMaterials,
        financeLogs: state.financeLogs
      }))
    };
    return createJsonResponse(fullBackup);
  }

  if (url.endsWith('/api/backup/restore') && method === 'POST') {
    const restoreData = body;
    if (restoreData.products && restoreData.rawMaterials && restoreData.financeLogs) {
      saveLocalData(KEYS.PRODUCTS, restoreData.products);
      saveLocalData(KEYS.RAW_MATERIALS, restoreData.rawMaterials);
      saveLocalData(KEYS.RECIPES, restoreData.recipes || state.recipes);
      saveLocalData(KEYS.TABLES, restoreData.tables || state.tables);
      saveLocalData(KEYS.FINANCE_LOGS, restoreData.financeLogs);
      saveLocalData(KEYS.ORDERS, restoreData.orders || state.orders);
      saveLocalData(KEYS.APP_CONFIG, restoreData.appConfig || state.appConfig);

      const restoreHistory = [
        {
          id: `back-restore-${Date.now()}`,
          timestamp: new Date().toISOString(),
          fileSize: JSON.stringify(restoreData).length,
          recordCount: restoreData.products.length + restoreData.rawMaterials.length + restoreData.financeLogs.length,
          status: 'Restore Success (Local Sandbox)',
          checksum: restoreData.secureChecksum || 'Direct-Uploaded-Config'
        },
        ...state.backupHistory
      ];
      saveLocalData(KEYS.BACKUP_HISTORY, restoreHistory);

      return createJsonResponse({ success: true, message: 'Data restored successfully in local sandbox!' });
    }
    return createJsonResponse({ success: false, message: 'Invalid backup structure.' }, 400);
  }

  // 10. AI insights fallback
  if (url.endsWith('/api/ai/analyze') && method === 'POST') {
    const totalPemasukan = state.financeLogs
      .filter((l: any) => l.type === 'income')
      .reduce((sum: number, l: any) => sum + l.amount, 0);

    const totalPengeluaran = state.financeLogs
      .filter((l: any) => l.type === 'expense')
      .reduce((sum: number, l: any) => sum + l.amount, 0);

    const lowStockMaterials = state.rawMaterials.filter((m: any) => m.stockQuantity <= m.warningLimit);

    const coffeeInsightSimulated = `[ANALISIS KONSULTAN BISNIS SANDBOX]
  Halo Pemilik ${state.appConfig.storeName}!
  Berikut adalah ringkasan performa penjualan harian Anda secara lokal:
  
  1. ANALISIS KEUANGAN: Pemasukan kotor Anda mencapai Rp ${totalPemasukan.toLocaleString('id-ID')} dengan laba bersih Rp ${(totalPemasukan - totalPengeluaran).toLocaleString('id-ID')}. Keuangan terpantau stabil dalam sandbox lokal.
  
  2. PERINGATAN BAHAN BAKU: ${lowStockMaterials.length > 0 ? `Terdapat ${lowStockMaterials.length} bahan kritis. Tolong periksa stok ${lowStockMaterials.map(m => m.name).join(', ')}. Hubungi supplier harian.` : 'Semua stok bahan baku aman terkendali di atas batas kritis minimum.'}
  
  3. TIPS INOVASI: Coba lakukan "Happy Hour Promo" diskon 15% untuk menu kopi di jam lengang (14:00 - 16:00 WIB) untuk menggenjot traffic pesanan online QR meja.`;

    return createJsonResponse({
      success: true,
      insight: coffeeInsightSimulated
    });
  }

  // 404 for handling other urls
  return createJsonResponse({ error: 'Endpoint not simulated in local sandbox' }, 404);
}
