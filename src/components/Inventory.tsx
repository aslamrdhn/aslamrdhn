/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Product, RawMaterial, Recipe } from '../types';
import { 
  Package, 
  Layers, 
  Plus, 
  AlertTriangle, 
  Search, 
  ArrowUpRight, 
  Phone, 
  Trash2, 
  Edit,
  User,
  Tags,
  Coffee,
  BookOpen,
  FileText,
  Check,
  Sparkles,
  Info
} from 'lucide-react';

interface InventoryProps {
  products: Product[];
  rawMaterials: RawMaterial[];
  recipes: Recipe[];
  appConfig: any;
  onRefresh: () => void;
}

export default function Inventory({ products, rawMaterials, recipes = [], appConfig, onRefresh }: InventoryProps) {
  const [activeSubTab, setActiveSubTab] = useState<'products' | 'materials' | 'recipes' | 'promo' | 'simulator'>('products');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [localToast, setLocalToast] = useState<string>('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string; type: 'product' | 'material' } | null>(null);
  
  // Simulator States
  const [inflationPercent, setInflationPercent] = useState<number>(20);
  const [newMatCost, setNewMatCost] = useState<number>(100);

  const triggerToast = (msg: string) => {
    setLocalToast(msg);
    setTimeout(() => setLocalToast(''), 4000);
  };

  // Helper to update menu product price directly from the simulation recommendations
  const updateProductPrice = async (productId: string, newPrice: number) => {
    try {
      const savedStore = localStorage.getItem('aslam_ledger_current_store');
      const tenantId = savedStore ? JSON.parse(savedStore).id : 'aslam-brew';
      const prodObj = products.find(p => p.id === productId);
      if (!prodObj) return;

      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Id': tenantId
        },
        body: JSON.stringify({ ...prodObj, price: newPrice })
      });
      if (response.ok) {
        triggerToast(`Sukses: Harga menu ${prodObj.name} disesuaikan ke Rp ${newPrice.toLocaleString('id-ID')}!`);
        onRefresh();
      }
    } catch (err) {
      triggerToast('Gagal menyinkronkan harga produk.');
    }
  };

  const updateMaterialCost = async (material: any, newCost: number) => {
    try {
      const savedStore = localStorage.getItem('aslam_ledger_current_store');
      const tenantId = savedStore ? JSON.parse(savedStore).id : 'aslam-brew';

      const response = await fetch(`/api/raw-materials/${material.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Id': tenantId
        },
        body: JSON.stringify({ ...material, unitCost: newCost })
      });
      if (response.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateMaterialTaxStatus = async (material: any, isTaxable: boolean, taxRate: number) => {
    try {
      const savedStore = localStorage.getItem('aslam_ledger_current_store');
      const tenantId = savedStore ? JSON.parse(savedStore).id : 'aslam-brew';

      const response = await fetch(`/api/raw-materials/${material.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Id': tenantId
        },
        body: JSON.stringify({ ...material, isTaxable, taxRate })
      });
      if (response.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Quick Add Product Form States
  const [quickProdName, setQuickProdName] = useState<string>('');
  const [quickProdCategory, setQuickProdCategory] = useState<'Coffee' | 'Non-Coffee' | 'Snacks' | 'Desserts' | 'Beans'>('Coffee');
  const [quickProdPrice, setQuickProdPrice] = useState<number>(0);
  const [quickProdCostPrice, setQuickProdCostPrice] = useState<number>(0);
  const [quickProdStock, setQuickProdStock] = useState<number>(0);
  const [isSavingQuickProd, setIsSavingQuickProd] = useState<boolean>(false);

  // Batch Edit Product Grid States
  const [isBatchEditMode, setIsBatchEditMode] = useState<boolean>(false);
  const [batchDraft, setBatchDraft] = useState<Record<string, { price: number; costPrice: number; stock: number }>>({});
  const [isSavingBatch, setIsSavingBatch] = useState<boolean>(false);

  // Weighted Average Restock Form States
  const [showWeightedRestockModal, setShowWeightedRestockModal] = useState<boolean>(false);
  const [restockProductId, setRestockProductId] = useState<string>('');
  const [restockAmount, setRestockAmount] = useState<number>(10);
  const [restockPurchasePrice, setRestockPurchasePrice] = useState<number>(5000);
  const [isSavingWeightedRestock, setIsSavingWeightedRestock] = useState<boolean>(false);

  const handleQuickAddSubmit = async () => {
    if (!quickProdName.trim()) {
      triggerToast('Nama menu Quick Add tidak boleh kosong!');
      return;
    }
    if (quickProdPrice <= 0 || quickProdCostPrice <= 0) {
      triggerToast('Harga jual & Modal HPP harus bernilai positif!');
      return;
    }

    setIsSavingQuickProd(true);
    const body = {
      name: quickProdName.trim(),
      category: quickProdCategory,
      price: quickProdPrice,
      costPrice: quickProdCostPrice,
      stock: quickProdStock,
      warningLimit: 5,
      barcode: 'QD-' + Math.floor(1000 + Math.random() * 9000),
      supplierName: 'Instant Quick Add',
      supplierContact: '081234567890'
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
        body: JSON.stringify(body)
      });
      if (response.ok) {
        setQuickProdName('');
        setQuickProdPrice(0);
        setQuickProdCostPrice(0);
        setQuickProdStock(0);
        triggerToast(`Menu "${body.name}" berhasil ditambahkan secara kilat!`);
        onRefresh();
      } else {
        triggerToast('Gagal memproses Quick Add.');
      }
    } catch (err) {
      triggerToast('Server Error saat Quick Add.');
    } finally {
      setIsSavingQuickProd(false);
    }
  };

  const toggleBatchMode = () => {
    if (!isBatchEditMode) {
      const draft: typeof batchDraft = {};
      products.forEach(p => {
        draft[p.id] = { price: p.price, costPrice: p.costPrice, stock: p.stock };
      });
      setBatchDraft(draft);
    }
    setIsBatchEditMode(!isBatchEditMode);
  };

  const handleBatchDraftChange = (id: string, field: 'price' | 'costPrice' | 'stock', value: number) => {
    setBatchDraft(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  const saveBatchChanges = async () => {
    setIsSavingBatch(true);
    try {
      const savedStore = localStorage.getItem('aslam_ledger_current_store');
      const tenantId = savedStore ? JSON.parse(savedStore).id : 'aslam-brew';

      const productsList = Object.entries(batchDraft).map(([id, values]) => {
        const item = values as { price: number; costPrice: number; stock: number };
        return {
          id,
          price: Number(item.price),
          costPrice: Number(item.costPrice),
          stock: Number(item.stock)
        };
      });

      const response = await fetch('/api/products/batch-save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Id': tenantId
        },
        body: JSON.stringify({ products: productsList })
      });

      if (response.ok) {
        triggerToast('Penyuntingan draf menu secara massal berhasil disimpan sistem!');
        setIsBatchEditMode(false);
        onRefresh();
      } else {
        triggerToast('Batal: Format data draf massal ditolak server.');
      }
    } catch (err) {
      triggerToast('Koneksi terputus saat menyimpan batch edit.');
    } finally {
      setIsSavingBatch(false);
    }
  };

  const handleWeightedRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockProductId) return;

    setIsSavingWeightedRestock(true);
    try {
      const savedStore = localStorage.getItem('aslam_ledger_current_store');
      const tenantId = savedStore ? JSON.parse(savedStore).id : 'aslam-brew';

      const response = await fetch(`/api/products/${restockProductId}/restock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Id': tenantId
        },
        body: JSON.stringify({
          amountToAdd: Number(restockAmount),
          newPurchasePrice: Number(restockPurchasePrice)
        })
      });

      if (response.ok) {
        const data = await response.json();
        triggerToast(`Sukses Restok Tertimbang: HPP baru "${data.product.name}" dihitung Rp ${data.product.costPrice.toLocaleString('id-ID')}`);
        setShowWeightedRestockModal(false);
        onRefresh();
      } else {
        triggerToast('Gagal memproses Restok HPP Tertimbang.');
      }
    } catch (err) {
      triggerToast('Gagal terhubung ke endpoint restock.');
    } finally {
      setIsSavingWeightedRestock(false);
    }
  };

  const toggleProductPromo = async (p: Product) => {
    const savedStore = localStorage.getItem('aslam_ledger_current_store');
    const tenantId = savedStore ? JSON.parse(savedStore).id : 'aslam-brew';

    const currActive = !!p.promoActive;
    const body = {
      promoActive: !currActive,
      promoDiscountPercent: p.promoDiscountPercent || 15 // default 15% discount
    };

    try {
      const response = await fetch(`/api/products/${p.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Id': tenantId
        },
        body: JSON.stringify(body)
      });
      if (response.ok) {
        triggerToast(`Status promo "${p.name}" berhasil diubah menjadi ${!currActive ? 'AKTIF' : 'NON-AKTIF'}.`);
        onRefresh();
      } else {
        triggerToast('Gagal memproses promo.');
      }
    } catch (e) {
      triggerToast('Koneksi promo terputus.');
    }
  };

  const updateProductPromoPercent = async (p: Product, percent: number) => {
    const savedStore = localStorage.getItem('aslam_ledger_current_store');
    const tenantId = savedStore ? JSON.parse(savedStore).id : 'aslam-brew';

    const body = {
      promoActive: true,
      promoDiscountPercent: Math.min(100, Math.max(1, percent))
    };

    try {
      const response = await fetch(`/api/products/${p.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Id': tenantId
        },
        body: JSON.stringify(body)
      });
      if (response.ok) {
        onRefresh();
      }
    } catch (e) {
      triggerToast('Gagal memperbarui nilai diskon.');
    }
  };
  
  // Forms states untuk menambahkan produk baru
  const [showAddProductModal, setShowAddProductModal] = useState<boolean>(false);
  const [newProdName, setNewProdName] = useState<string>('');
  const [newProdCategory, setNewProdCategory] = useState<'Coffee' | 'Non-Coffee' | 'Snacks' | 'Desserts' | 'Beans'>('Coffee');
  const [newProdPrice, setNewProdPrice] = useState<number>(20000);
  const [newProdCostPrice, setNewProdCostPrice] = useState<number>(6000);
  const [newProdStock, setNewProdStock] = useState<number>(50);
  const [newProdWarningLimit, setNewProdWarningLimit] = useState<number>(10);
  const [newProdBarcode, setNewProdBarcode] = useState<string>('PROD' + Math.floor(1000 + Math.random() * 9000));
  const [newProdSupplier, setNewProdSupplier] = useState<string>('Supplier Utama');
  const [newProdSupplierContact, setNewProdSupplierContact] = useState<string>('0812-3456-7890');
  const [newProdKomposisi, setNewProdKomposisi] = useState<string>('');
  const [newProdImageUrl, setNewProdImageUrl] = useState<string>('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        triggerToast("Gambar terlalu besar! Maksimum ukuran file adalah 2MB agar tidak memperlambat database.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProdImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Form states untuk bahan baku baru
  const [showAddMaterialModal, setShowAddMaterialModal] = useState<boolean>(false);
  const [newMatName, setNewMatName] = useState<string>('');
  const [newMatStock, setNewMatStock] = useState<number>(1000);
  const [newMatUnit, setNewMatUnit] = useState<'g' | 'ml' | 'pcs' | 'Kg'>('g');
  const [newMatWarningLimit, setNewMatWarningLimit] = useState<number>(200);
  const [newMatSupplierName, setNewMatSupplierName] = useState<string>('Supplier Bahan Baku');
  const [newMatSupplierContact, setNewMatSupplierContact] = useState<string>('0819-8765-4321');
  const [newMatIsTaxable, setNewMatIsTaxable] = useState<boolean>(false);
  const [newMatTaxRate, setNewMatTaxRate] = useState<number>(11); // default PPN 11%

  // Form states untuk Pelaporan Waste Bahan Baku (Operational Shrinkages)
  const [showWasteModal, setShowWasteModal] = useState<boolean>(false);
  const [wasteMaterial, setWasteMaterial] = useState<any | null>(null);
  const [wasteAmount, setWasteAmount] = useState<number>(10);
  const [wasteReason, setWasteReason] = useState<string>("Kedaluwarsa / Rusak (Expired)");
  const [isSubmittingWaste, setIsSubmittingWaste] = useState<boolean>(false);

  // —————————————————————————————————————————————————————————
  // RECIPE CREATOR & EDITING STATES & METHODS
  // —————————————————————————————————————————————————————————
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [recipeIngredients, setRecipeIngredients] = useState<{ materialId: string; amount: number }[]>([]);
  const [recipeNotes, setRecipeNotes] = useState<string>('');
  const [selectedMatIdForIngredient, setSelectedMatIdForIngredient] = useState<string>('');
  const [selectedMatAmount, setSelectedMatAmount] = useState<number>(10);
  const [isSavingRecipe, setIsSavingRecipe] = useState<boolean>(false);
  const [recipeSuccessMsg, setRecipeSuccessMsg] = useState<string>('');

  // Sync state values with active selected product/menu
  useEffect(() => {
    if (!selectedProductId) {
      setRecipeIngredients([]);
      setRecipeNotes('');
      setRecipeSuccessMsg('');
      return;
    }
    const current = recipes.find(r => r.productId === selectedProductId);
    if (current) {
      setRecipeIngredients(current.ingredients || []);
      setRecipeNotes(current.notes || '');
    } else {
      setRecipeIngredients([]);
      setRecipeNotes('');
    }
    setRecipeSuccessMsg('');
    if (rawMaterials.length > 0) {
      setSelectedMatIdForIngredient(rawMaterials[0].id);
    }
  }, [selectedProductId, recipes, rawMaterials]);

  const addRecipeIngredient = () => {
    if (!selectedMatIdForIngredient) return;
    if (recipeIngredients.some(i => i.materialId === selectedMatIdForIngredient)) {
      triggerToast('Bahan baku ini sudah dimasukkan ke dalam racikan menu ini.');
      return;
    }
    setRecipeIngredients([...recipeIngredients, { materialId: selectedMatIdForIngredient, amount: selectedMatAmount }]);
    
    // Auto shift to another unused material if possible
    const firstUnused = rawMaterials.find(m => !recipeIngredients.some(i => i.materialId === m.id) && m.id !== selectedMatIdForIngredient);
    if (firstUnused) {
      setSelectedMatIdForIngredient(firstUnused.id);
    }
  };

  const removeRecipeIngredient = (matId: string) => {
    setRecipeIngredients(recipeIngredients.filter(i => i.materialId !== matId));
  };

  const handleSaveRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;

    setIsSavingRecipe(true);
    setRecipeSuccessMsg('');

    try {
      const savedStore = localStorage.getItem('aslam_ledger_current_store');
      const tenantId = savedStore ? JSON.parse(savedStore).id : 'aslam-brew';

      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Id': tenantId
        },
        body: JSON.stringify({
          productId: selectedProductId,
          ingredients: recipeIngredients,
          notes: recipeNotes
        })
      });

      if (response.ok) {
        setRecipeSuccessMsg('Resep racikan kedai & catatan pribadi tersimpan!');
        onRefresh();
        setTimeout(() => setRecipeSuccessMsg(''), 3500);
      } else {
        triggerToast('Gagal memperbarui resep menu.');
      }
    } catch (err) {
      triggerToast('Error saat merekam resep.');
    } finally {
      setIsSavingRecipe(false);
    }
  };
  // —————————————————————————————————————————————————————————

  // Submit product creation
  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName) return;

    const body = {
      name: newProdName,
      category: newProdCategory,
      price: newProdPrice,
      costPrice: newProdCostPrice,
      stock: newProdStock,
      warningLimit: newProdWarningLimit,
      barcode: newProdBarcode,
      supplierName: newProdSupplier,
      supplierContact: newProdSupplierContact,
      imageUrl: newProdImageUrl || undefined,
      komposisi: newProdKomposisi || undefined
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
        body: JSON.stringify(body)
      });
      if (response.ok) {
        setShowAddProductModal(false);
        // Clear forms
        setNewProdName('');
        setNewProdKomposisi('');
        setNewProdImageUrl('');
        onRefresh();
      }
    } catch (err) {
      triggerToast('Gagal menambah produk');
    }
  };

  // Submit material creation
  const handleAddMaterialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMatName) return;

    const body = {
      name: newMatName,
      stockQuantity: newMatStock,
      stockUnit: newMatUnit,
      warningLimit: newMatWarningLimit,
      supplierName: newMatSupplierName,
      supplierContact: newMatSupplierContact,
      unitCost: newMatCost,
      isTaxable: newMatIsTaxable,
      taxRate: newMatIsTaxable ? newMatTaxRate : 0
    };

    try {
      const savedStore = localStorage.getItem('aslam_ledger_current_store');
      const tenantId = savedStore ? JSON.parse(savedStore).id : 'aslam-brew';

      const response = await fetch('/api/raw-materials', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Tenant-Id': tenantId
        },
        body: JSON.stringify(body)
      });
      if (response.ok) {
        setShowAddMaterialModal(false);
        setNewMatName('');
        setNewMatIsTaxable(false);
        setNewMatTaxRate(11);
        onRefresh();
      }
    } catch (err) {
      triggerToast('Gagal menambah bahan baku');
    }
  };

  // Submit Laporan Waste Bahan Baku
  const handleWasteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wasteMaterial || wasteAmount <= 0) return;

    if (wasteAmount > wasteMaterial.stockQuantity) {
      triggerToast(`Jumlah tumpah/waste (${wasteAmount}) melebihi stok saat ini (${wasteMaterial.stockQuantity})!`);
      return;
    }

    setIsSubmittingWaste(true);
    try {
      const savedStore = localStorage.getItem('aslam_ledger_current_store');
      const tenantId = savedStore ? JSON.parse(savedStore).id : 'aslam-brew';

      const response = await fetch(`/api/raw-materials/${wasteMaterial.id}/waste`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Id': tenantId
        },
        body: JSON.stringify({
          wasteAmount: wasteAmount,
          reason: wasteReason
        })
      });

      const data = await response.json();
      if (response.ok) {
        triggerToast(`Sukses: Melaporkan waste ${wasteMaterial.name} sebanyak ${wasteAmount} ${wasteMaterial.stockUnit}. Laba bersih akan terpangkas Rp ${data.financialLoss?.toLocaleString('id-ID')} harian.`);
        setShowWasteModal(false);
        setWasteMaterial(null);
        setWasteAmount(10);
        setWasteReason("Kedaluwarsa / Rusak (Expired)");
        onRefresh();
      } else {
        triggerToast(data.message || 'Gagal merekam lapor waste.');
      }
    } catch (err) {
      triggerToast('Koneksi internet atau server sibuk.');
    } finally {
      setIsSubmittingWaste(false);
    }
  };

  const deleteProduct = (id: string) => {
    const prod = products.find(p => p.id === id);
    if (prod) {
      setDeleteConfirm({ id, name: prod.name, type: 'product' });
    }
  };

  const deleteMaterial = (id: string) => {
    const mat = rawMaterials.find(m => m.id === id);
    if (mat) {
      setDeleteConfirm({ id, name: mat.name, type: 'material' });
    }
  };

  const executeDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const savedStore = localStorage.getItem('aslam_ledger_current_store');
      const tenantId = savedStore ? JSON.parse(savedStore).id : 'aslam-brew';

      if (deleteConfirm.type === 'product') {
        const response = await fetch(`/api/products/${deleteConfirm.id}`, { 
          method: 'DELETE',
          headers: {
            'X-Tenant-Id': tenantId
          }
        });
        if (response.ok) {
          triggerToast(`Selesai: Menu "${deleteConfirm.name}" berhasil dihapus.`);
        } else {
          triggerToast('Gagal menghapus produk dari database.');
        }
      } else {
        const response = await fetch(`/api/raw-materials/${deleteConfirm.id}`, { 
          method: 'DELETE',
          headers: {
            'X-Tenant-Id': tenantId
          }
        });
        if (response.ok) {
          triggerToast(`Selesai: Bahan baku "${deleteConfirm.name}" berhasil dihapus.`);
        } else {
          triggerToast('Gagal menghapus bahan baku dari database.');
        }
      }
      onRefresh();
    } catch (err) {
      triggerToast('Error saat menghapus data.');
    } finally {
      setDeleteConfirm(null);
    }
  };

  // Restok manual gampang
  const quickRestock = async (id: string, isMat: boolean, amountToAdd: number) => {
    const savedStore = localStorage.getItem('aslam_ledger_current_store');
    const tenantId = savedStore ? JSON.parse(savedStore).id : 'aslam-brew';

    if (isMat) {
      const target = rawMaterials.find(m => m.id === id);
      if (!target) return;
      const updatedStock = target.stockQuantity + amountToAdd;
      await fetch(`/api/raw-materials/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'X-Tenant-Id': tenantId
        },
        body: JSON.stringify({ stockQuantity: updatedStock })
      });
    } else {
      const target = products.find(p => p.id === id);
      if (!target) return;
      const updatedStock = target.stock + amountToAdd;
      await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'X-Tenant-Id': tenantId
        },
        body: JSON.stringify({ stock: updatedStock })
      });
    }
    onRefresh();
  };

  return (
    <div className="space-y-6" id="inventory-tab">
      
      {/* Tab Kontrol Inventori Atas */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
        <div className="flex gap-2 p-1 bg-slate-100 rounded-xl overflow-x-auto shrink-0 max-w-full" id="inventory-sub-filter">
          <button
            id="subtab-products-btn"
            onClick={() => { setActiveSubTab('products'); setSearchQuery(''); }}
            className={`px-4 py-2 font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'products' 
              ? 'bg-white text-slate-900 shadow-xs' 
              : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Package size={14} />
            Produk Menu ({products.length})
          </button>
          <button
            id="subtab-materials-btn"
            onClick={() => { setActiveSubTab('materials'); setSearchQuery(''); }}
            className={`px-4 py-2 font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'materials' 
              ? 'bg-white text-slate-900 shadow-xs' 
              : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers size={14} />
            Bahan Baku ({rawMaterials.length})
          </button>
          <button
            id="subtab-recipes-btn"
            onClick={() => { setActiveSubTab('recipes'); setSearchQuery(''); }}
            className={`px-4 py-2 font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'recipes' 
              ? 'bg-white text-slate-900 shadow-xs' 
              : 'text-slate-500 hover:text-slate-850 text-slate-500'
            }`}
          >
            <Coffee size={14} className="text-amber-500" />
            Resep Racikan & Catatan ({recipes.length})
          </button>
          <button
            id="subtab-promo-btn"
            onClick={() => { setActiveSubTab('promo'); setSearchQuery(''); }}
            className={`px-4 py-2 font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'promo' 
              ? 'bg-rose-50 text-rose-700 font-extrabold shadow-sm' 
              : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Tags size={14} className="text-rose-500 animate-pulse" />
            Katalog Promo & Diskon 🏷️
          </button>
          <button
            id="subtab-simulator-btn"
            onClick={() => { setActiveSubTab('simulator'); setSearchQuery(''); }}
            className={`px-4 py-2 font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'simulator' 
              ? 'bg-[#E0F2FE] text-[#0369A1] font-black shadow-sm border border-sky-200' 
              : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles size={14} className="text-[#0284C7] animate-pulse" />
            Simulator Margin & Inflasi 📈
          </button>
        </div>

        <div className="flex flex-wrap md:flex-nowrap gap-3 w-full md:w-auto items-center">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
            <input
              id="search-inventory"
              type="text"
              placeholder={activeSubTab === 'recipes' ? "Cari resep menu..." : "Cari..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-slate-200 focus:outline-hidden text-xs bg-slate-50 rounded-xl"
            />
          </div>

          {activeSubTab === 'products' && (
            <button
              id="batch-edit-toggle-btn"
              onClick={toggleBatchMode}
              className={`px-4 py-2 border font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                isBatchEditMode 
                ? 'bg-amber-100 border-amber-300 text-amber-900 font-extrabold' 
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <Edit size={14} />
              {isBatchEditMode ? 'Batal Grid Edit' : 'Edit Massall (Batch)'}
            </button>
          )}

          {isBatchEditMode && activeSubTab === 'products' && (
            <button
              id="batch-save-btn"
              onClick={saveBatchChanges}
              disabled={isSavingBatch}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
            >
              <Check size={14} />
              {isSavingBatch ? 'Merekam...' : 'Simpan Batch [Sync]'}
            </button>
          )}

          {activeSubTab !== 'recipes' && !isBatchEditMode && (
            <button
              id="add-item-modal-btn"
              onClick={() => activeSubTab === 'products' ? setShowAddProductModal(true) : setShowAddMaterialModal(true)}
              className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus size={14} />
              Tambah {activeSubTab === 'products' ? 'Produk Jual' : 'Bahan Baku'}
            </button>
          )}
        </div>
      </div>

      {/* Roster list tabel Produk Jual */}
      {activeSubTab === 'products' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden flex flex-col">
          
          {/* INLINE QUICK ADD PANELS - HEAVILY REQUESTED */}
          {!isBatchEditMode && (
            <div className="bg-slate-50 p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center gap-3">
              <div className="flex items-center gap-1.5 min-w-max">
                <span className="p-1 px-2.5 bg-amber-500 text-slate-900 rounded-lg text-[10px] font-black uppercase tracking-wider">Quick Add</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 flex-1">
                <input
                  type="text"
                  placeholder="Nama menu baru..."
                  maxLength={40}
                  value={quickProdName}
                  onChange={(e) => setQuickProdName(e.target.value)}
                  className="px-3 py-1.5 border border-slate-200 bg-white text-xs rounded-xl focus:outline-hidden focus:border-amber-500 text-slate-805 text-slate-800"
                />
                <select
                  value={quickProdCategory}
                  onChange={(e) => setQuickProdCategory(e.target.value as any)}
                  className="px-3 py-1.5 border border-slate-200 bg-white text-xs rounded-xl text-slate-700"
                >
                  <option value="Coffee">☕ Coffee</option>
                  <option value="Non-Coffee">🧊 Non-Coffee</option>
                  <option value="Snacks">🥐 Snacks</option>
                  <option value="Desserts">🍨 Desserts</option>
                  <option value="Beans">🫘 Beans</option>
                </select>
                <input
                  type="number"
                  placeholder="Harga Jual (Rp)"
                  value={quickProdPrice || ''}
                  onChange={(e) => setQuickProdPrice(Number(e.target.value))}
                  className="px-3 py-1.5 border border-slate-200 bg-white text-xs rounded-xl text-slate-800 font-mono"
                />
                <input
                  type="number"
                  placeholder="Modal Pokok HPP (Rp)"
                  value={quickProdCostPrice || ''}
                  onChange={(e) => setQuickProdCostPrice(Number(e.target.value))}
                  className="px-3 py-1.5 border border-slate-200 bg-white text-xs rounded-xl text-slate-800 font-mono"
                />
                <input
                  type="number"
                  placeholder="Awal Stok"
                  value={quickProdStock || ''}
                  onChange={(e) => setQuickProdStock(Number(e.target.value))}
                  className="px-3 py-1.5 border border-slate-200 bg-white text-xs rounded-xl text-slate-800 font-mono"
                />
              </div>
              <button
                type="button"
                onClick={handleQuickAddSubmit}
                disabled={isSavingQuickProd}
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-905 text-slate-900 text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 shrink-0 select-none shadow-xs"
              >
                <Plus size={13} />
                {isSavingQuickProd ? 'Menyimpan...' : 'Tambah Kilat'}
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold font-sans text-xs">
                <tr>
                  <th className="p-4">Nama Produk / Kode</th>
                  <th className="p-4">Kategori</th>
                  <th className="p-4">Harga Jual / Modal</th>
                  <th className="p-4">Persediaan (Porsi)</th>
                  <th className="p-4">Detail Supplier Utama</th>
                  <th className="p-4 text-right">Aksi Kelola</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products
                  .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.barcode.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((p) => {
                    const isLow = p.stock <= p.warningLimit;
                    return (
                      <tr key={p.id} className={`hover:bg-slate-50/50 transition-colors ${isLow ? 'bg-amber-50/20' : ''}`}>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-sky-50 text-sky-700 flex items-center justify-center rounded-lg font-bold overflow-hidden border border-slate-100 shrink-0">
                              {p.imageUrl ? (
                                <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                              ) : (
                                p.name.substring(0, 2).toUpperCase()
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800">{p.name}</p>
                              <p className="font-mono text-[10px] text-slate-400 mt-0.5">{p.barcode}</p>
                              {p.komposisi && (
                                <p className="text-[10px] text-slate-500 mt-1 italic font-sans max-w-[200px]" title={p.komposisi}>
                                  🌱 Komposisi: {p.komposisi}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-medium text-[11px] rounded-lg">
                            {p.category}
                          </span>
                        </td>
                        <td className="p-4">
                          {isBatchEditMode ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] font-bold text-slate-400">Jual:</span>
                                <input
                                  type="number"
                                  value={batchDraft[p.id]?.price ?? p.price}
                                  onChange={(e) => handleBatchDraftChange(p.id, 'price', Number(e.target.value))}
                                  className="px-2 py-1 border border-slate-200 rounded-lg w-20 text-xs font-mono text-slate-800"
                                />
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] font-bold text-slate-400">HPP:</span>
                                <input
                                  type="number"
                                  value={batchDraft[p.id]?.costPrice ?? p.costPrice}
                                  onChange={(e) => handleBatchDraftChange(p.id, 'costPrice', Number(e.target.value))}
                                  className="px-2 py-1 border border-slate-200 rounded-lg w-20 text-xs font-mono text-slate-800"
                                />
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className="font-bold font-mono text-slate-900 text-xs">Rp {p.price.toLocaleString('id-ID')}</p>
                              <p className="text-[10px] text-slate-400 font-mono">Modal: Rp {p.costPrice.toLocaleString('id-ID')}</p>
                            </>
                          )}
                        </td>
                        <td className="p-4">
                          {isBatchEditMode ? (
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] font-bold text-slate-400">Stok:</span>
                              <input
                                type="number"
                                value={batchDraft[p.id]?.stock ?? p.stock}
                                onChange={(e) => handleBatchDraftChange(p.id, 'stock', Number(e.target.value))}
                                className="px-2 py-1 border border-slate-200 rounded-lg w-16 text-xs font-mono text-slate-800"
                              />
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-2">
                                <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-sm ${
                                  p.stock === 0 
                                  ? 'bg-rose-100 text-rose-700' 
                                  : isLow 
                                  ? 'bg-amber-100 text-amber-700 font-bold' 
                                  : 'bg-emerald-50 text-emerald-700'
                                }`}>
                                  {p.stock} porsi
                                </span>
                                {isLow && (
                                  <span className="text-rose-600 flex items-center gap-0.5 text-[10px]" title="Stok Hampir Habis!">
                                    <AlertTriangle size={11} />
                                    Kritis
                                  </span>
                                )}
                              </div>
                              {/* Tambah Stok Instan */}
                              <div className="flex gap-1 mt-1.5">
                                <button 
                                  onClick={() => quickRestock(p.id, false, 10)}
                                  className="px-1.5 py-0.5 border border-slate-200 hover:border-slate-300 text-[10px] font-semibold text-slate-500 rounded hover:text-slate-800"
                                >
                                  +10 Jual
                                </button>
                                <button 
                                  onClick={() => quickRestock(p.id, false, 50)}
                                  className="px-1.5 py-0.5 border border-slate-200 hover:border-slate-300 text-[10px] font-semibold text-slate-500 rounded hover:text-slate-800"
                                >
                                  +50 Jual
                                </button>
                              </div>
                            </>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="text-xs">
                            <div className="flex items-center gap-1 font-semibold text-slate-700">
                              <User size={12} className="text-slate-400" />
                              {p.supplierName}
                            </div>
                            <a 
                              href={`https://wa.me/${p.supplierContact.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              className="text-slate-400 hover:text-slate-700 flex items-center gap-1 text-[10px] mt-0.5 font-mono"
                            >
                              <Phone size={10} />
                              {p.supplierContact}
                            </a>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {!isBatchEditMode && (
                              <button
                                onClick={() => {
                                  setRestockProductId(p.id);
                                  setRestockAmount(10);
                                  setRestockPurchasePrice(p.costPrice);
                                  setShowWeightedRestockModal(true);
                                }}
                                className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                                title="Weighted Average Restock"
                              >
                                <ArrowUpRight size={11} />
                                + Restok HPP
                              </button>
                            )}
                            <button 
                              onClick={() => deleteProduct(p.id)}
                              className="p-1.5 hover:bg-rose-50 text-rose-500 hover:text-rose-700 rounded-lg transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Roster list tabel Katalog Promo & Diskon */}
      {activeSubTab === 'promo' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden flex flex-col">
          <div className="bg-rose-50/50 p-4 border-b border-rose-105 border-rose-100 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black text-rose-800 uppercase tracking-widest flex items-center gap-1.5">
                <Tags size={14} className="text-rose-500 animate-pulse" />
                Arsitektur Katalog Promo & Diskon Neon
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Semua item promo akan berlabel neon khusus di kasir & memotong harga jual secara otomatis saat dipesan.</p>
            </div>
            <span className="text-[10px] bg-rose-100 text-rose-700 px-3 py-1 rounded-full font-black">
              ⚡ LIVE PROMO: {products.filter(p => p.promoActive).length} Menu
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-[#FFF1F2]/50 border-b border-rose-50 text-slate-500 font-semibold font-sans text-xs">
                <tr>
                  <th className="p-4 text-slate-700">Nama Menu Kedai</th>
                  <th className="p-4 text-slate-700">Harga Normal</th>
                  <th className="p-4 text-slate-700">Status Promo Aktif</th>
                  <th className="p-4 text-slate-700">Besar Potongan Diskon (%)</th>
                  <th className="p-4 text-slate-700 text-right">Hasil Harga Diskon Akhir (IDR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products
                  .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((p) => {
                    const isPromo = !!p.promoActive;
                    const discountPercent = p.promoDiscountPercent || 15;
                    const finalPromoPrice = isPromo ? Math.round(p.price * (1 - discountPercent / 100)) : p.price;

                    return (
                      <tr key={p.id} className={`hover:bg-slate-50/30 transition-colors ${isPromo ? 'bg-rose-50/10' : ''}`}>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-100 text-slate-700 flex items-center justify-center rounded-lg font-bold overflow-hidden border border-slate-200 shrink-0">
                              {p.imageUrl ? (
                                <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                              ) : (
                                p.name.substring(0, 2).toUpperCase()
                              )}
                            </div>
                            <div>
                              <p className="font-extrabold text-slate-800">{p.name}</p>
                              <p className="font-mono text-[10px] text-slate-400 mt-0.5">{p.barcode} • {p.category}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-xs font-semibold text-slate-500">
                          Rp {p.price.toLocaleString('id-ID')}
                        </td>
                        <td className="p-4">
                          <label className="relative inline-flex items-center cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={isPromo}
                              onChange={() => toggleProductPromo(p)}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-rose-200 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-500 shadow-inner" />
                            <span className={`text-[10px] font-extrabold ml-1.5 uppercase ${isPromo ? 'text-rose-600 font-mono tracking-wider' : 'text-slate-400 font-sans'}`}>
                              {isPromo ? '🏷️ PROMO AKTIF' : 'Masa Normal'}
                            </span>
                          </label>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min={1}
                              max={100}
                              disabled={!isPromo}
                              value={p.promoDiscountPercent ?? 15}
                              onChange={(e) => updateProductPromoPercent(p, parseInt(e.target.value) || 0)}
                              className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-center font-mono font-bold text-xs disabled:opacity-40 text-slate-900 focus:outline-hidden focus:border-rose-500"
                            />
                            <span className="text-xs text-slate-400 font-bold">% OFF</span>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          {isPromo ? (
                            <div className="space-y-0.5">
                              <p className="font-black font-mono text-rose-600 text-xs">Rp {finalPromoPrice.toLocaleString('id-ID')}</p>
                              <p className="text-[9px] line-through text-slate-400 font-mono">Rp {p.price.toLocaleString('id-ID')}</p>
                            </div>
                          ) : (
                            <span className="text-xs font-semibold text-slate-400 italic font-sans animate-pulse">Normal</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 📈 SIMULATOR SENSITIVITAS HPP & LABA */}
      {activeSubTab === 'simulator' && (
        <div className="space-y-6">
          {/* Banner Informasi & Slider Pengontrol */}
          <div className="bg-sky-50 border border-sky-200 p-6 rounded-2xl shadow-xs">
            <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
              <div className="space-y-1.5 max-w-xl">
                <h3 className="text-sm font-black text-[#0369A1] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={16} className="text-[#0284C7] animate-pulse" />
                  Simulator Sensitivitas Finansial: Dampak Harga Bahan Baku Naik
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Gunakan simulator cerdas ini untuk menganalisis bagaimana harga bahan baku kopi global yang naik (inflasi) memotong rasio profit margin menu kedai Anda. Anda juga bisa langsung menyesuaikan harga menu untuk mempertahankan kestabilan laba bersih!
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-xl border border-sky-100 min-w-full sm:min-w-[320px] shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Simulasi Kenaikan Bahan Global</label>
                  <span className="font-mono text-xs font-black px-2 py-0.5 bg-rose-100 text-rose-700 rounded-sm">
                    {inflationPercent >= 0 ? `+${inflationPercent}%` : `${inflationPercent}%`}
                  </span>
                </div>
                <input 
                  type="range" 
                  min="-30" 
                  max="100" 
                  step="5"
                  value={inflationPercent} 
                  onChange={(e) => setInflationPercent(parseInt(e.target.value) || 0)}
                  className="w-full accent-sky-600 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[9px] font-mono text-slate-400 mt-1">
                  <span>-30% Deflasi</span>
                  <span>0% Normal</span>
                  <span>+50% Tinggi</span>
                  <span>+100% Krisis</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Kolom Kiri: Detil Prediksi Bahan Baku Setelah Kenaikan */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div>
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1">
                  <Layers size={14} className="text-[#0284C7]" />
                  Proyeksi Harga Bahan Baku ({rawMaterials.length})
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Bahan baku pendukung racikan di kedai Kopi Kintamani Aslam.</p>
              </div>

              <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto pr-1">
                {rawMaterials.map((m) => {
                  const originalCost = m.unitCost || 0;
                  const simulatedCost = Math.round(originalCost * (1 + inflationPercent / 100));
                  const isRise = simulatedCost > originalCost;
                  
                  return (
                    <div key={m.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-800">{m.name}</p>
                        <p className="text-[9px] text-slate-400">Satuan dasar: /{m.stockUnit}</p>
                      </div>
                      <div className="text-right font-mono">
                        <p className="font-semibold text-slate-500 text-[10px]">Asli: Rp{originalCost}</p>
                        <p className={`font-bold ${isRise ? 'text-rose-600' : simulatedCost < originalCost ? 'text-emerald-600' : 'text-slate-700'}`}>
                          Simulasi: Rp{simulatedCost}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Kolom Kanan: Dampak Menu & Margin Profit (Grid 2 Kolom) */}
            <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div>
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1">
                  <Coffee size={14} className="text-[#0284C7]" />
                  Dampak Profit Margin Menu & Tindakan Rekomendasi
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Dihitung otomatis berdasarkan formula bahan resep racikan aktif.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[440px] overflow-y-auto pr-1">
                {products.map((p) => {
                  const recipe = recipes.find((r: any) => r.productId === p.id);
                  if (!recipe || !recipe.ingredients || recipe.ingredients.length === 0) {
                    // Menu tanpa resep (bukan racikan)
                    return (
                      <div key={p.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl relative opacity-60">
                        <span className="absolute top-3 right-3 text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-mono uppercase">Non-Racikan</span>
                        <h5 className="font-bold text-slate-700 text-xs">{p.name}</h5>
                        <p className="text-[10px] text-slate-400 mt-1 font-mono">Modal HPP (Statik): Rp {p.costPrice.toLocaleString()}</p>
                        <p className="text-[10px] text-slate-500 mt-3 italic">Bahan baku tidak tersimulasi karena tidak ada racikan resep terkonfigurasi.</p>
                      </div>
                    );
                  }

                  // Hitung HPP asli
                  let originalHPP = 0;
                  recipe.ingredients.forEach((ing: any) => {
                    const mat = rawMaterials.find((m: any) => m.id === ing.materialId);
                    if (mat) originalHPP += (ing.amount * (mat.unitCost || 0));
                  });
                  if (originalHPP === 0) originalHPP = p.costPrice || 1;

                  // Hitung HPP hasil simulasi
                  let simulatedHPP = 0;
                  recipe.ingredients.forEach((ing: any) => {
                    const mat = rawMaterials.find((m: any) => m.id === ing.materialId);
                    if (mat) {
                      const simUnitCost = (mat.unitCost || 0) * (1 + inflationPercent / 100);
                      simulatedHPP += (ing.amount * simUnitCost);
                    }
                  });
                  if (simulatedHPP === 0) simulatedHPP = originalHPP * (1 + inflationPercent / 100);

                  const originalMargin = Math.round(((p.price - originalHPP) / p.price) * 100);
                  const simulatedMargin = Math.round(((p.price - simulatedHPP) / p.price) * 100);
                  const marginHealth = simulatedMargin >= 50 ? 'healthy' : simulatedMargin >= 40 ? 'warning' : 'danger';

                  // Rekomendasi harga baru untuk mempertahankan profit margin ~60%
                  const recommendedPrice = Math.ceil((simulatedHPP / 0.4) / 500) * 500;

                  return (
                    <div 
                      key={p.id} 
                      className={`p-4 rounded-xl border transition-all ${
                        marginHealth === 'healthy' 
                        ? 'border-emerald-100 bg-emerald-50/10' 
                        : marginHealth === 'warning'
                        ? 'border-amber-100 bg-amber-50/10'
                        : 'border-rose-100 bg-rose-50/10'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="max-w-[70%]">
                          <h5 className="font-extrabold text-slate-800 text-xs truncate">{p.name}</h5>
                          <p className="text-[10px] text-slate-400 mt-0.5">Harga Normal: Rp {p.price.toLocaleString('id-ID')}</p>
                        </div>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-sm font-bold uppercase ${
                          marginHealth === 'healthy'
                          ? 'bg-emerald-100 text-emerald-700'
                          : marginHealth === 'warning'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-rose-100 text-rose-700 font-extrabold animate-pulse'
                        }`}>
                          {marginHealth === 'healthy' ? 'Aman' : marginHealth === 'warning' ? 'Waspada' : 'Kritis!'}
                        </span>
                      </div>

                      {/* Komparasi Angka HPP */}
                      <div className="grid grid-cols-2 gap-2 mt-3 p-2 bg-white/60 rounded-lg border border-slate-100 text-[10px]">
                        <div>
                          <p className="text-slate-400 font-sans">HPP Biasa / Simulasi</p>
                          <p className="font-mono font-bold text-slate-800">
                            Rp {Math.round(originalHPP)} &rarr; <span className="text-rose-600 font-black">Rp {Math.round(simulatedHPP)}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-400 font-sans">Margin Sebelumnya / Baru</p>
                          <p className="font-mono font-bold text-slate-800">
                            {originalMargin}% &rarr; <span className={`font-black ${marginHealth === 'healthy' ? 'text-emerald-600' : marginHealth === 'warning' ? 'text-amber-600' : 'text-rose-600'}`}>{simulatedMargin}%</span>
                          </p>
                        </div>
                      </div>

                      {/* Tindakan Rekomendasi Penyesuaian Harga */}
                      <div className="mt-3.5 pt-3 border-t border-slate-100/60 flex items-center justify-between gap-2">
                        <div className="text-[10px]">
                          <p className="text-slate-400 font-medium">Saran Harga Jual Baru</p>
                          <p className="font-mono font-extrabold text-[#0369A1]">Rp {recommendedPrice.toLocaleString('id-ID')}</p>
                        </div>
                        {p.price < recommendedPrice && (
                          <button
                            type="button"
                            onClick={() => updateProductPrice(p.id, recommendedPrice)}
                            className="bg-[#0284C7] hover:bg-[#0369A1] text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-sky-700 shadow-xs transition-all cursor-pointer"
                          >
                            Terapkan
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Roster Tabel Bahan Baku Racikan */}
      {activeSubTab === 'materials' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold font-sans text-xs">
                <tr>
                  <th className="p-4">Nama Bahan Baku</th>
                  <th className="p-4">Harga Beli Satuan (HPP)</th>
                  <th className="p-4">Pajak (PPN)</th>
                  <th className="p-4">Stok Saat Ini</th>
                  <th className="p-4">Warning Limit</th>
                  <th className="p-4">Supplier & Restock WhatsApp</th>
                  <th className="p-4 text-right">Aksi Kelola</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rawMaterials
                  .filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((m) => {
                    const isLow = m.stockQuantity <= m.warningLimit;
                    return (
                      <tr key={m.id} className={`hover:bg-slate-50/50 transition-colors ${isLow ? 'bg-amber-50/20' : ''}`}>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-amber-50 text-amber-700 flex items-center justify-center rounded-lg">
                              <Layers size={15} />
                            </div>
                            <div>
                              <p className="font-bold text-slate-800">{m.name}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] text-slate-400 font-mono">ID: {m.id}</span>
                                {m.isTaxable && (
                                  <span className="text-[8px] font-extrabold bg-amber-100/70 border border-amber-200 text-amber-800 px-1 rounded font-mono uppercase tracking-tight">
                                    +{m.taxRate}% PPN
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 max-w-[140px] bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg focus-within:bg-white focus-within:border-slate-400 transition-all">
                            <span className="text-slate-400 font-mono text-xs font-semibold">Rp</span>
                            <input 
                              type="number" 
                              value={m.unitCost || 0} 
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                updateMaterialCost(m, val);
                              }}
                              className="w-full font-mono text-xs font-bold text-slate-800 bg-transparent border-none outline-hidden focus:ring-0 p-0"
                            />
                            <span className="text-slate-400 font-medium text-[9px] lowercase shrink-0">/{m.stockUnit}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input 
                                type="checkbox"
                                checked={!!m.isTaxable}
                                onChange={(e) => {
                                  updateMaterialTaxStatus(m, e.target.checked, m.stockUnit === 'pcs' ? 11 : 11);
                                }}
                                className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 w-3.5 h-3.5 cursor-pointer"
                              />
                              <span className={`text-[11px] font-bold ${m.isTaxable ? 'text-amber-700' : 'text-slate-400'}`}>
                                {m.isTaxable ? 'Terkena' : 'Bebas'}
                              </span>
                            </label>
                            {m.isTaxable && (
                              <div className="flex items-center gap-1 text-[10px]">
                                <input
                                  type="number"
                                  value={m.taxRate || 11}
                                  onChange={(e) => {
                                    const rate = Math.max(0, parseInt(e.target.value) || 0);
                                    updateMaterialTaxStatus(m, true, rate);
                                  }}
                                  className="w-10 text-center font-mono font-bold bg-slate-50 border border-slate-200 rounded px-1 py-0.5 text-[10px] focus:outline-hidden"
                                />
                                <span className="text-slate-400 font-semibold">%</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-sm ${
                              isLow 
                              ? 'bg-rose-100 text-rose-700 font-bold' 
                              : 'bg-slate-100 text-slate-700'
                            }`}>
                              {m.stockQuantity.toLocaleString('id-ID')} {m.stockUnit}
                            </span>
                            {isLow && (
                              <span className="text-rose-600 flex items-center gap-0.5 text-[10px]">
                                <AlertTriangle size={11} />
                                Warning!
                              </span>
                            )}
                          </div>
                          {/* Tambah Stok Instan */}
                          <div className="flex gap-1 mt-1.5">
                            <button 
                              onClick={() => quickRestock(m.id, true, m.stockUnit === 'pcs' ? 50 : 1000)}
                              className="px-1.5 py-0.5 border border-slate-200 hover:border-slate-300 text-[10px] font-semibold text-slate-500 rounded hover:text-slate-800"
                            >
                              + {m.stockUnit === 'pcs' ? '50 pcs' : '1 Kg/Liter'}
                            </button>
                            <button 
                              onClick={() => quickRestock(m.id, true, m.stockUnit === 'pcs' ? 200 : 5000)}
                              className="px-1.5 py-0.5 border border-slate-200 hover:border-slate-300 text-[10px] font-semibold text-slate-500 rounded hover:text-slate-800"
                            >
                              + {m.stockUnit === 'pcs' ? '200 pcs' : '5 Kg/Liter'}
                            </button>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-xs font-medium text-slate-500">
                          {m.warningLimit.toLocaleString('id-ID')} {m.stockUnit}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50 p-2 rounded-lg border border-slate-100 max-w-[280px]">
                            <div className="text-xs">
                              <p className="font-bold text-slate-700">{m.supplierName}</p>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">{m.supplierContact}</p>
                            </div>
                            <a 
                              href={`https://wa.me/${m.supplierContact.replace(/[^0-9]/g, '')}?text=Halo%20${encodeURIComponent(m.supplierName)},%20kami%20dari%20${encodeURIComponent(appConfig.storeName)}%20ingin%20memesan%20kembali%20stok%20${encodeURIComponent(m.name)}%20sebanyak%205%20satuan.`}
                              target="_blank"
                              className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-medium text-[10px] rounded-md transition-all shrink-0"
                            >
                              <Phone size={10} />
                              Pesan WA
                            </a>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end items-center gap-2">
                            <button
                              onClick={() => {
                                setWasteMaterial(m);
                                setWasteAmount(m.stockQuantity >= 10 ? 10 : Math.max(1, Math.round(m.stockQuantity)));
                                setShowWasteModal(true);
                              }}
                              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 text-[10px] font-black rounded-lg flex items-center gap-1 transition-all border border-amber-200"
                              title="Laporkan kerugian/kerusakan bahan baku"
                            >
                              <AlertTriangle size={10} />
                              Lapor Waste
                            </button>
                            <button 
                              onClick={() => deleteMaterial(m.id)}
                              className="p-1.5 hover:bg-rose-50 text-rose-500 hover:text-rose-700 rounded-lg transition-all"
                              title="Hapus Bahan Baku"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* WORKSPACE MANAJEMEN RESEP MANDIRI + CATATAN PRIBADI */}
      {activeSubTab === 'recipes' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in" id="recipes-workspace">
          
          {/* LEFT SIDE: PRODUCT SELECTOR LIST (COL 5) */}
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">1. Pilih Menu Jual</h3>
              <p className="text-[10px] text-slate-500 mt-0.5 font-medium leading-relaxed">
                Tekan salah satu menu kedai di bawah untuk merekam takaran bahan baku otomatis atau menulis catatan brewing rahasia.
              </p>
            </div>

            <div className="space-y-2 overflow-y-auto max-h-[500px] pr-1" id="recipe-product-list">
              {products
                .filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((p) => {
                  const targetRecipe = recipes.find(r => r.productId === p.id);
                  const isSelected = selectedProductId === p.id;
                  
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedProductId(p.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex justify-between items-center text-left ${
                        isSelected 
                          ? 'bg-amber-500/10 border-amber-500 shadow-xs' 
                          : 'bg-slate-50 border-slate-200/60 hover:border-slate-350'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-700 font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden border border-amber-500/10">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            p.name.substring(0,2).toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className={`font-bold text-xs truncate max-w-[150px] ${isSelected ? 'text-amber-850' : 'text-slate-800'}`}>{p.name}</p>
                          <p className="text-[9px] text-slate-400 mt-0.5 font-mono">{p.category} • Rp{p.price.toLocaleString('id-ID')}</p>
                        </div>
                      </div>

                      <div>
                        {targetRecipe ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold text-[9px] rounded-full uppercase tracking-wider scale-90">
                            <Check size={9} />
                            Resep Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-450 text-[9px] font-bold rounded-full uppercase tracking-wider scale-90">
                            Kosong
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              
              {products.length === 0 && (
                <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                  <p className="text-xs text-slate-404 italic text-slate-400">Belum ada menu produk terdaftar.</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE: CUSTOM RECIPE CREATOR & COMPILER (COL 7) */}
          <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col space-y-4">
            
            {!selectedProductId ? (
              <div className="flex flex-col items-center justify-center text-center py-24 px-4 h-full space-y-4" id="empty-recipe-state">
                <div className="w-14 h-14 rounded-full bg-[#FFFBEB] border border-amber-100 flex items-center justify-center text-amber-500 shadow-xs">
                  <BookOpen size={24} className="animate-pulse" />
                </div>
                <div className="max-w-xs space-y-1.5">
                  <h4 className="font-extrabold text-sm text-slate-800">Workspace Resep Mandiri</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                    Silakan pilih salah satu menu produk di sebelah kiri untuk menyusun resep racikan baru serta mencatat catatan rahasia pengolahan bahan.
                  </p>
                </div>
              </div>
            ) : (() => {
              const productObj = products.find(p => p.id === selectedProductId);
              return (
                <form onSubmit={handleSaveRecipe} className="space-y-4 text-xs" id="active-recipe-form">
                  {/* Selected product title card */}
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <span className="text-[8px] font-bold tracking-wider uppercase text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md">
                        RESEP MENU AKTIF
                      </span>
                      <h4 className="text-base font-black text-slate-900 mt-1">{productObj?.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-mono">ID SKU: {productObj?.barcode}</p>
                    </div>
                    <div className="text-left sm:text-right border-t sm:border-t-0 border-slate-100 pt-2 sm:pt-0 w-full sm:w-auto">
                      <p className="text-[9px] text-slate-400">Harga Jual Menu</p>
                      <p className="font-extrabold text-[#0F1721] font-mono text-sm">Rp {productObj?.price.toLocaleString('id-ID')}</p>
                      <p className="text-[9px] text-slate-400">Persediaan Saat Ini: {productObj?.stock} porsi</p>
                    </div>
                  </div>

                  {/* FORM A: INGREDIENTS LIST BUILDER */}
                  <div className="space-y-3 border-b border-slate-100 pb-4">
                    <div className="flex justify-between items-center">
                      <h5 className="font-extrabold text-slate-800 flex items-center gap-1.5">
                        <Layers size={14} className="text-amber-500" />
                        Komposisi Takaran Bahan Baku
                      </h5>
                      <span className="text-[9px] font-bold text-slate-400 bg-amber-50 border border-amber-100 px-20-no px-2 py-0.5 rounded bg-amber-100/10 border-amber-200/5 select-none text-[8px]">
                        Kurangi otomatis pas checkout
                      </span>
                    </div>

                    {/* CURRENTLY ADDED INGREDIENTS LIST */}
                    <div className="space-y-1.5 max-h-[160px] overflow-y-auto" id="added-ingredients-list">
                      {recipeIngredients.map((item, index) => {
                        const mat = rawMaterials.find(m => m.id === item.materialId);
                        return (
                          <div key={item.materialId} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-150 rounded-xl">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 bg-white border border-slate-200/60 rounded-full flex items-center justify-center font-bold text-[10px] text-slate-500">
                                {index + 1}
                              </span>
                              <p className="font-extrabold text-slate-700">{mat ? mat.name : 'Unknown Raw Material'}</p>
                            </div>
                            <div className="flex items-center gap-4">
                              <p className="font-bold text-slate-900 font-mono italic">
                                {item.amount.toLocaleString('id-ID')} <span className="text-[10px] text-slate-400 font-sans not-italic font-medium">{mat?.stockUnit}</span>
                              </p>
                              <button
                                type="button"
                                onClick={() => removeRecipeIngredient(item.materialId)}
                                className="text-rose-500 hover:text-rose-700 font-bold transition-all text-[10px] hover:underline cursor-pointer"
                              >
                                Copot
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {recipeIngredients.length === 0 && (
                        <div className="p-6 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl text-slate-400 text-[10px] italic">
                          Belum ada bahan baku racikan yang dimasukkan. Tambahkan di bawah ini.
                        </div>
                      )}
                    </div>

                    {/* ADD NEW ROW FOR INGREDIENTS FORM */}
                    <div className="p-4 bg-slate-950/5 border border-slate-100 rounded-2xl space-y-3">
                      <p className="text-[10px] font-bold text-slate-700">Tambah Bahan Baku ke Racikan Produk:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5" id="add-recipe-row-inputs">
                        <div className="sm:col-span-6">
                          <label className="block text-[8px] font-bold text-slate-400 uppercase mb-0.5">Pilih Bahan Baku</label>
                          <select
                            value={selectedMatIdForIngredient}
                            onChange={(e) => setSelectedMatIdForIngredient(e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg text-xs"
                          >
                            <option value="">-- Hubungkan Bahan Baku --</option>
                            {rawMaterials
                              .filter(m => !recipeIngredients.some(i => i.materialId === m.id))
                              .map(m => (
                                <option key={m.id} value={m.id}>{m.name} ({m.stockUnit})</option>
                              ))
                            }
                          </select>
                        </div>

                        <div className="sm:col-span-3">
                          <label className="block text-[8px] font-bold text-slate-400 uppercase mb-0.5">Gram/mL/Pcs</label>
                          <input
                            type="number"
                            min={1}
                            value={selectedMatAmount}
                            onChange={(e) => setSelectedMatAmount(parseInt(e.target.value) || 0)}
                            className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg font-mono text-center font-bold text-xs"
                          />
                        </div>

                        <div className="sm:col-span-3 flex items-end">
                          <button
                            type="button"
                            onClick={addRecipeIngredient}
                            disabled={!selectedMatIdForIngredient}
                            className="w-full py-1.5 bg-slate-950 hover:bg-slate-800 disabled:bg-slate-200 text-white disabled:text-slate-450 font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 text-[10px]"
                          >
                            <Plus size={12} />
                            Masukkan
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* FORM B: PERSONAL NOTES TEXTAREA */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <FileText size={14} className="text-amber-500" />
                        Catatan Pribadi Resep Rahasia Kedai (Pro-Brewing Note)
                      </label>
                      <span className="text-[9px] text-[#A16207] font-bold uppercase bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md">
                        Kasir & Owner
                      </span>
                    </div>
                    <textarea
                      placeholder="Contoh: Takaran ini untuk satu porsi double shot espresso. Seduh biji kopi Arabica toraja medium dengan suhu air 92°C, tuangkan air susu pelan agar tidak pecah laktosanya..."
                      value={recipeNotes}
                      onChange={(e) => setRecipeNotes(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-slate-200 bg-slate-50 text-slate-800 rounded-xl leading-relaxed resize-none focus:outline-hidden focus:border-amber-500 font-sans text-xs focus:bg-white transition-all shadow-inner"
                    />
                  </div>

                  {/* FORM C: SUCCESS DISPLAY & ACTIONS */}
                  <div className="pt-2 flex flex-col sm:flex-row justify-between items-center gap-3">
                    <div className="flex-1 w-full text-left">
                      {recipeSuccessMsg && (
                        <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl flex items-center gap-2 font-bold text-[10px]">
                          <Check size={14} className="text-emerald-700 shrink-0" />
                          <span>{recipeSuccessMsg}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 justify-end w-full sm:w-auto shrink-0">
                      <button
                        type="button"
                        onClick={() => setSelectedProductId('')}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingRecipe}
                        className="px-5 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 text-slate-950 font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5 text-xs text-slate-900"
                      >
                        {isSavingRecipe ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent animate-spin rounded-full" />
                            Merekam Resep...
                          </>
                        ) : (
                          <>
                            <Sparkles size={13} />
                            Simpan Resep & Catatan
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              );
            })()}
          </div>
        </div>
      )}

      {/* MODAL / POPUP INPUT PRODUK BARU */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md border border-slate-200 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">Tambah Menu Jual Baru</h3>
            <form onSubmit={handleAddProductSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase font-sans mb-1">Nama Menu</label>
                <input required type="text" placeholder="Misal: Avocado Macchiato Double" value={newProdName} onChange={(e) => setNewProdName(e.target.value)} className="w-full px-3 py-2 border border-slate-200 bg-slate-50 font-medium rounded-lg" />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Kategori</label>
                  <select value={newProdCategory} onChange={(e: any) => setNewProdCategory(e.target.value)} className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg">
                    <option value="Coffee">Coffee</option>
                    <option value="Non-Coffee">Non-Coffee</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Beans">Beans</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Kode Barcode Menu (SKU)</label>
                  <input required type="text" value={newProdBarcode} onChange={(e) => setNewProdBarcode(e.target.value)} className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg font-mono font-bold text-center" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Harga Jual (IDR)</label>
                  <input required type="number" value={newProdPrice} onChange={(e) => setNewProdPrice(parseInt(e.target.value) || 0)} className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg font-mono" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Harga Modal Pokok (COGS)</label>
                  <input required type="number" value={newProdCostPrice} onChange={(e) => setNewProdCostPrice(parseInt(e.target.value) || 0)} className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg font-mono" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Stok Awal Jual</label>
                  <input required type="number" value={newProdStock} onChange={(e) => setNewProdStock(parseInt(e.target.value) || 0)} className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg font-mono" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Warning Limit Minim</label>
                  <input required type="number" value={newProdWarningLimit} onChange={(e) => setNewProdWarningLimit(parseInt(e.target.value) || 0)} className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg font-mono" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase font-sans mb-1">Komposisi Bahan / Ingredients</label>
                <textarea 
                  placeholder="Misal: Espresso Arabica, Gula Aren Cair, Susu Fresh Milk" 
                  value={newProdKomposisi} 
                  onChange={(e) => setNewProdKomposisi(e.target.value)} 
                  className="w-full px-3 py-2 border border-slate-200 bg-slate-50 font-medium rounded-lg h-14 resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase font-sans mb-1">Foto/Gambar Menu (Manual Upload / URL)</label>
                <div className="grid grid-cols-3 gap-3 items-center">
                  <div className="col-span-2 space-y-1.5">
                    {/* File selector input */}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      className="hidden" 
                      id="manual-image-uploader" 
                    />
                    <label 
                      htmlFor="manual-image-uploader" 
                      className="block px-3 py-2 border border-dashed border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 rounded-lg text-center cursor-pointer font-semibold transition-all text-[11px]"
                    >
                      📁 Pilih Gambar dari File HP / Laptop
                    </label>
                    <input 
                      type="text" 
                      placeholder="Atau tempel Link URL Gambar..." 
                      value={newProdImageUrl} 
                      onChange={(e) => setNewProdImageUrl(e.target.value)} 
                      className="w-full px-3 py-1.5 border border-slate-200 bg-slate-50 rounded-lg text-[10px]" 
                    />
                  </div>
                  <div className="h-16 w-full rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden relative">
                    {newProdImageUrl ? (
                      <>
                        <img src={newProdImageUrl} alt="Pratinjau" className="w-full h-full object-cover" />
                        <button 
                          type="button" 
                          onClick={() => setNewProdImageUrl('')} 
                          className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-[9px] font-bold cursor-pointer"
                        >
                          Hapus
                        </button>
                      </>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium italic text-center px-1">Belum Ada</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nama Supplier</label>
                  <input required type="text" value={newProdSupplier} onChange={(e) => setNewProdSupplier(e.target.value)} className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg font-medium" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">WhatsApp Supplier</label>
                  <input required type="text" value={newProdSupplierContact} onChange={(e) => setNewProdSupplierContact(e.target.value)} className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg font-mono" />
                </div>
              </div>

              <div className="flex gap-2 pt-3 justify-end">
                <button type="button" onClick={() => setShowAddProductModal(false)} className="px-4 py-2 bg-slate-100 font-semibold hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer">Batal</button>
                <button type="submit" className="px-5 py-2 bg-slate-950 font-bold text-white rounded-lg cursor-pointer">Simpan Menu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL / POPUP INPUT BAHAN BAKU BARU */}
      {showAddMaterialModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md border border-slate-200 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">Tambah Bahan Baku baru</h3>
            <form onSubmit={handleAddMaterialSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nama Bahan Jelas</label>
                <input required type="text" placeholder="Misal: Susu Gandum Oatly Oatmilk" value={newMatName} onChange={(e) => setNewMatName(e.target.value)} className="w-full px-3 py-2 border border-slate-200 bg-slate-50 font-medium rounded-lg" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Kuantitas Stok Awal</label>
                  <input required type="number" value={newMatStock} onChange={(e) => setNewMatStock(parseInt(e.target.value) || 0)} className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg font-mono" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Satuan</label>
                  <select value={newMatUnit} onChange={(e: any) => setNewMatUnit(e.target.value)} className="w-full px-2 py-2 border border-slate-200 bg-slate-50 rounded-lg">
                    <option value="g">g (Gram)</option>
                    <option value="ml">ml (Mililiter)</option>
                    <option value="pcs">pcs (Butir)</option>
                    <option value="Kg">Kg</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Warning Limit Minimum</label>
                <input required type="number" value={newMatWarningLimit} onChange={(e) => setNewMatWarningLimit(parseInt(e.target.value) || 0)} className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg font-mono" />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Harga Beli Satuan (HPP per Unit - Rupiah)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 font-mono font-bold text-xs">Rp</span>
                  <input required type="number" value={newMatCost} onChange={(e) => setNewMatCost(parseInt(e.target.value) || 0)} className="w-full pl-8 pr-3 py-2 border border-slate-200 bg-slate-50 rounded-lg font-mono font-bold text-slate-700" />
                </div>
              </div>

              <div className="bg-amber-50/50 p-2.5 rounded-lg border border-amber-200/50 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newMatIsTaxable}
                    onChange={(e) => setNewMatIsTaxable(e.target.checked)}
                    className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                  />
                  <span className="font-bold text-slate-700">Dikenakan Pajak Pembelian (PPN)</span>
                </label>
                {newMatIsTaxable && (
                  <div className="flex items-center gap-2 mt-1 animate-fade-in text-[11px]">
                    <span className="text-slate-500">Tarif Pajak (%):</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={newMatTaxRate}
                      onChange={(e) => setNewMatTaxRate(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-16 px-1.5 py-0.5 border border-slate-200 bg-white rounded-md text-center font-mono font-bold text-slate-800 focus:outline-hidden"
                    />
                    <span className="text-slate-400 font-medium text-[9px] leading-tight pr-1">Umumnya PPN 11%</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nama Supplier Baku</label>
                  <input required type="text" value={newMatSupplierName} onChange={(e) => setNewMatSupplierName(e.target.value)} className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg font-medium" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">WhatsApp Supplier Baku</label>
                  <input required type="text" value={newMatSupplierContact} onChange={(e) => setNewMatSupplierContact(e.target.value)} className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg font-mono" />
                </div>
              </div>

              <div className="flex gap-2 pt-3 justify-end">
                <button type="button" onClick={() => setShowAddMaterialModal(false)} className="px-4 py-2 bg-slate-100 font-semibold hover:bg-slate-200 text-slate-700 rounded-lg">Batal</button>
                <button type="submit" className="px-5 py-2 bg-slate-950 font-bold text-white rounded-lg">Simpan Bahan Baku</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOM DELETE CONFIRMATION MODAL FOR IFRAME COMPATIBILITY */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="inventory-delete-confirm-modal">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm border border-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 bg-rose-50 rounded-xl text-rose-600">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Hapus Permanen?</h3>
                <p className="text-[10px] text-slate-400 font-mono capitalize">Tipe: {deleteConfirm.type === 'product' ? 'Menu Kreatif' : 'Bahan Baku Resep'}</p>
              </div>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus <strong className="text-slate-900 font-semibold">"{deleteConfirm.name}"</strong> secara permanen dari database? Hubungan resep yang menggunakan data ini mungkin akan terpengaruh.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-50">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 bg-slate-150 hover:bg-slate-200 text-xs font-bold rounded-xl text-slate-700 transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white rounded-xl transition-all cursor-pointer shadow-md shadow-rose-150"
              >
                Ya, Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WEIGHTED AVERAGE RESTOCK MODAL */}
      {showWeightedRestockModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" id="inventory-weighted-restock-modal">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
                <ArrowUpRight size={18} />
              </span>
              <div>
                <h3 className="text-sm font-black text-slate-800">Restok & Rekalkulasi HPP</h3>
                <p className="text-[10px] text-slate-400">Formula Metodi Weighted Average Otomatis</p>
              </div>
            </div>

            {(() => {
              const matchedProd = products.find(p => p.id === restockProductId);
              if (!matchedProd) return <p className="text-xs text-rose-500">Menu tidak teridentifikasi.</p>;

              return (
                <form onSubmit={handleWeightedRestockSubmit} className="space-y-4">
                  {/* Current numbers indicators */}
                  <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
                    <p className="font-bold text-slate-700 flex justify-between">
                      <span>Menu Menu:</span>
                      <span className="text-slate-950 font-black">{matchedProd.name}</span>
                    </p>
                    <p className="flex justify-between text-slate-500">
                      <span>Stok Saat Ini:</span>
                      <strong className="text-slate-800">{matchedProd.stock} porsi</strong>
                    </p>
                    <p className="flex justify-between text-slate-500">
                      <span>COGS Lama (HPP):</span>
                      <strong className="text-slate-800 font-mono">Rp {matchedProd.costPrice.toLocaleString('id-ID')}</strong>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Stok Ditambahkan</label>
                      <input
                        required
                        type="number"
                        min={1}
                        value={restockAmount}
                        onChange={(e) => setRestockAmount(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg font-mono font-bold text-slate-800 text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Harga Beli Baru / Unit</label>
                      <input
                        required
                        type="number"
                        min={1}
                        value={restockPurchasePrice}
                        onChange={(e) => setRestockPurchasePrice(Math.max(1, parseInt(e.target.value) || 0))}
                        className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg font-mono font-bold text-slate-800 text-center"
                      />
                    </div>
                  </div>

                  {/* Calculated summary formula preview */}
                  {(() => {
                    const currentVal = matchedProd.stock * matchedProd.costPrice;
                    const newVal = restockAmount * restockPurchasePrice;
                    const combinedStock = matchedProd.stock + restockAmount;
                    const recalcHpp = combinedStock > 0 ? Math.round((currentVal + newVal) / combinedStock) : 0;

                    return (
                      <div className="p-3 bg-indigo-50 border border-indigo-120 rounded-xl text-xs space-y-1.5 text-indigo-900">
                        <p className="font-extrabold text-[10px] uppercase text-indigo-600 tracking-wider">Metode Rumus Weighted Average:</p>
                        <div className="font-mono text-[10px] space-y-0.5 opacity-85">
                          <p>Nilai Asset Lama: Rp {currentVal.toLocaleString('id-ID')}</p>
                          <p>Nilai Pasokan Baru: Rp {newVal.toLocaleString('id-ID')}</p>
                          <p>Total Persediaan: {combinedStock} porsi</p>
                        </div>
                        <p className="font-bold border-t border-indigo-200 pt-1.5 flex justify-between text-indigo-950">
                          <span>Simulasi HPP Baru:</span>
                          <span className="font-mono font-black text-indigo-600">Rp {recalcHpp.toLocaleString('id-ID')}</span>
                        </p>
                      </div>
                    );
                  })()}

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowWeightedRestockModal(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-bold rounded-xl text-slate-700 cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingWeightedRestock}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 text-white text-xs font-extrabold rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {isSavingWeightedRestock ? 'Memproses...' : 'Kalkulasi & Restok✓'}
                    </button>
                  </div>
                </form>
              );
            })()}
          </div>
        </div>
      )}

      {/* MODAL PELAPORAN WASTE BAHAN BAKU */}
      {showWasteModal && wasteMaterial && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" id="inventory-waste-modal">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5 text-amber-600">
              <span className="p-1.5 bg-amber-50 rounded-xl text-amber-600">
                <AlertTriangle size={18} />
              </span>
              <div>
                <h3 className="text-sm font-black text-slate-800">Lapor Susutan / Waste</h3>
                <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Operational Shrinkages & Loss</p>
              </div>
            </div>

            <form onSubmit={handleWasteSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-100 rounded-xl space-y-1.5">
                <p className="font-bold text-slate-700 flex justify-between">
                  <span>Nama Bahan:</span>
                  <span className="text-slate-950 font-black">{wasteMaterial.name}</span>
                </p>
                <p className="flex justify-between text-slate-500">
                  <span>Stok Aktif Kedai:</span>
                  <strong className="text-slate-800 font-mono">{wasteMaterial.stockQuantity.toLocaleString('id-ID')} {wasteMaterial.stockUnit}</strong>
                </p>
                <p className="flex justify-between text-slate-500">
                  <span>HPP per {wasteMaterial.stockUnit}:</span>
                  <strong className="text-slate-800 font-mono">Rp {(wasteMaterial.unitCost || 0).toLocaleString('id-ID')}</strong>
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Jumlah Bahan Terbuang ({wasteMaterial.stockUnit})</label>
                <input
                  required
                  type="number"
                  step="any"
                  min="0.01"
                  max={wasteMaterial.stockQuantity}
                  value={wasteAmount}
                  onChange={(e) => setWasteAmount(Math.max(0.01, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg font-mono font-bold text-slate-800 text-center"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Penyebab / Alasan Kerusakan</label>
                <select
                  value={wasteReason}
                  onChange={(e) => setWasteReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg font-medium text-slate-700"
                >
                  <option value="Susu/Bahan Kedaluwarsa & Basi">Susu/Bahan Kedaluwarsa & Basi</option>
                  <option value="Tumpah / Kebocoran Kemasan">Tumpah / Kebocoran Kemasan</option>
                  <option value="Bad Pull / Kegagalan Barista">Gagal Ekstraksi / Human Error Barista</option>
                  <option value="Pencegahan Kontaminasi / Higienitas">Pencegahan Kontaminasi / Higienitas</option>
                  <option value="Selisih Opname Fisik">Lainnya (Selisih Opname Fisik)</option>
                </select>
              </div>

              {/* Real-time potential loss preview */}
              {(() => {
                const baseLoss = Math.round(wasteAmount * (wasteMaterial.unitCost || 0));
                const taxRate = wasteMaterial.isTaxable ? (wasteMaterial.taxRate || 11) : 0;
                const taxLoss = Math.round(baseLoss * (taxRate / 100));
                const totalLoss = baseLoss + taxLoss;

                return (
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl space-y-1 text-rose-900">
                    <p className="font-extrabold text-[10px] uppercase text-rose-600 tracking-wider font-mono">Efek Profit & Loss (P&L):</p>
                    
                    {wasteMaterial.isTaxable ? (
                      <div className="text-[10px] space-y-0.5 border-b border-rose-200/50 pb-1.5 mb-1.5 opacity-90">
                        <p className="flex justify-between">
                          <span>Nilai Pokok Bahan Baku:</span>
                          <span className="font-mono">Rp {baseLoss.toLocaleString('id-ID')}</span>
                        </p>
                        <p className="flex justify-between">
                          <span>Estimasi PPN Terbuang ({taxRate}%):</span>
                          <span className="font-mono">Rp {taxLoss.toLocaleString('id-ID')}</span>
                        </p>
                      </div>
                    ) : null}

                    <p className="font-bold flex justify-between text-rose-950">
                      <span>Total Kerugian Finansial:</span>
                      <span className="font-mono font-black text-rose-600">- Rp {totalLoss.toLocaleString('id-ID')}</span>
                    </p>
                    <p className="text-[10px] text-rose-500/80 leading-relaxed">
                      Kerugian finansial ini terekam sebagai pengeluaran non-stok di Buku Kas untuk mencegah manipulasi data.
                    </p>
                  </div>
                );
              })()}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowWasteModal(false);
                    setWasteMaterial(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-bold rounded-xl text-slate-700 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingWaste}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-300 text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {isSubmittingWaste ? 'Melaporkan...' : 'Laporkan Kerugian✓'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FLOATING TOAST NOTIFICATION */}
      {localToast && (
        <div className="fixed bottom-5 right-5 bg-slate-900 border border-slate-800 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 z-55 animate-slide-in text-xs max-w-xs" id="inventory-toast">
          <Info className="text-amber-400 shrink-0" size={16} />
          <p className="font-semibold leading-relaxed">{localToast}</p>
        </div>
      )}

    </div>
  );
}
