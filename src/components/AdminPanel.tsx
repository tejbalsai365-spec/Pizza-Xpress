import React, { useState } from 'react';
import {
  Category,
  Offer,
  Order,
  Product,
  StoreSettings,
} from '../types';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Save,
  RotateCcw,
  Download,
  Upload,
  Check,
  AlertCircle,
  Database,
  Lock,
  Eye,
  EyeOff,
  ShoppingBag,
  Tag,
  Settings as SettingsIcon,
  Layers,
  Phone,
  Power,
  Image as ImageIcon,
  Palette,
  Cloud,
  RefreshCw,
  Copy,
  ExternalLink,
  Sparkles,
  Globe,
  ShieldCheck,
} from 'lucide-react';
import {
  exportStoreDataJson,
  getAdminPin,
  importStoreDataJson,
  resetStoreToDefaults,
  setAdminPin,
} from '../services/storeService';
import {
  getSupabaseConfigFromStorage,
  saveSupabaseConfigToStorage,
  testSupabaseConnection,
  fetchProductsFromSupabase,
  syncProductsToSupabase,
  fetchSettingsFromSupabase,
  syncSettingsToSupabase,
  fetchCategoriesFromSupabase,
  syncCategoriesToSupabase,
  fetchOffersFromSupabase,
  syncOffersToSupabase,
  SUPABASE_SETUP_SQL,
} from '../services/supabaseClient';
import desiCheesyKulhadNewImg from '../assets/desi_cheesy_kulhad_pizza_new.png';
import paneerKulhadImg from '../assets/paneer_kulhad_pizza_custom.png';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onUpdateProducts: (products: Product[]) => void;
  categories: Category[];
  onUpdateCategories: (categories: Category[]) => void;
  offers: Offer[];
  onUpdateOffers: (offers: Offer[]) => void;
  settings: StoreSettings;
  onUpdateSettings: (settings: StoreSettings) => void;
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
}

const COLOR_PRESETS = [
  { name: 'Pizza Red', primary: '#dc2626', accent: '#f59e0b' },
  { name: 'Zomato Crimson', primary: '#e11d48', accent: '#fbbf24' },
  { name: 'Fiery Orange', primary: '#ea580c', accent: '#facc15' },
  { name: 'Pure Veg Emerald', primary: '#059669', accent: '#34d399' },
  { name: 'Royal Purple', primary: '#7c3aed', accent: '#fbbf24' },
  { name: 'Midnight Blue', primary: '#2563eb', accent: '#38bdf8' },
];

const PRESET_FOOD_IMAGES = [
  {
    name: 'Desi Cheesy Kulhad Pizza (Clay Pot)',
    url: desiCheesyKulhadNewImg,
  },
  {
    name: 'Paneer Tikka Kulhad Pizza',
    url: paneerKulhadImg,
  },
  {
    name: 'Farmhouse Veg Pizza',
    url: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Golden Sweet Corn Pizza',
    url: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Paneer Makhani Pizza',
    url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Chilled Sting Energy Drink',
    url: 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Chilled Cola Bottle',
    url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Thums Up Fizz',
    url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Lemon Lime Soda',
    url: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?auto=format&fit=crop&w=800&q=80',
  },
];

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  products,
  onUpdateProducts,
  categories,
  onUpdateCategories,
  offers,
  onUpdateOffers,
  settings,
  onUpdateSettings,
  orders,
  onUpdateOrderStatus,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const [activeTab, setActiveTab] = useState<
    'products' | 'categories' | 'offers' | 'branding' | 'settings' | 'orders' | 'database'
  >('products');

  // Supabase Configuration & Sync State
  const initialSupa = getSupabaseConfigFromStorage();
  const [supaUrl, setSupaUrl] = useState(initialSupa.url);
  const [supaAnonKey, setSupaAnonKey] = useState(initialSupa.anonKey);
  const [showAnonKey, setShowAnonKey] = useState(false);
  const [supaStatus, setSupaStatus] = useState<{
    testing: boolean;
    message: string;
    success?: boolean;
  } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  // Product Editing / Creation State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);

  // New Category Input
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('🍕');

  // New Offer Input
  const [newOfferCode, setNewOfferCode] = useState('');
  const [newOfferTitle, setNewOfferTitle] = useState('');
  const [newOfferDesc, setNewOfferDesc] = useState('');
  const [newOfferDiscount, setNewOfferDiscount] = useState('50');
  const [newOfferMin, setNewOfferMin] = useState('199');

  // JSON Import / Export State
  const [jsonText, setJsonText] = useState('');
  const [jsonMessage, setJsonMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);

  // Settings Draft
  const [settingsDraft, setSettingsDraft] = useState<StoreSettings>({
    ...settings,
  });

  if (!isOpen) return null;

  // Supabase Actions
  const handleTestSupabase = async () => {
    if (!supaUrl.trim() || !supaAnonKey.trim()) {
      setSupaStatus({
        testing: false,
        success: false,
        message: 'Please provide both Project URL and Anon Public Key.',
      });
      return;
    }
    setSupaStatus({ testing: true, message: 'Connecting to Supabase...' });
    saveSupabaseConfigToStorage(supaUrl, supaAnonKey);
    const res = await testSupabaseConnection(supaUrl, supaAnonKey);
    setSupaStatus({
      testing: false,
      success: res.success,
      message: res.message,
    });
  };

  const handlePushToSupabase = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    saveSupabaseConfigToStorage(supaUrl, supaAnonKey);
    try {
      const [prodRes, setRes, catRes, offRes] = await Promise.all([
        syncProductsToSupabase(products),
        syncSettingsToSupabase(settingsDraft),
        syncCategoriesToSupabase(categories),
        syncOffersToSupabase(offers),
      ]);
      if (prodRes && setRes && catRes && offRes) {
        setSyncFeedback({
          type: 'success',
          message: 'All menu products, categories, offers, and settings pushed to Supabase successfully!',
        });
      } else {
        setSyncFeedback({
          type: 'error',
          message: 'Some tables could not be synced. Ensure the setup SQL script has been run in your Supabase SQL Editor.',
        });
      }
    } catch (e: any) {
      setSyncFeedback({
        type: 'error',
        message: e?.message || 'Failed to sync with Supabase.',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePullFromSupabase = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const [supaProducts, supaSettings, supaCategories, supaOffers] = await Promise.all([
        fetchProductsFromSupabase(),
        fetchSettingsFromSupabase(),
        fetchCategoriesFromSupabase(),
        fetchOffersFromSupabase(),
      ]);

      let count = 0;
      if (supaProducts && supaProducts.length > 0) {
        onUpdateProducts(supaProducts);
        count = supaProducts.length;
      }
      if (supaSettings) {
        onUpdateSettings(supaSettings);
        setSettingsDraft(supaSettings);
      }
      if (supaCategories && supaCategories.length > 0) {
        onUpdateCategories(supaCategories);
      }
      if (supaOffers && supaOffers.length > 0) {
        onUpdateOffers(supaOffers);
      }

      setSyncFeedback({
        type: 'success',
        message: `Pulled latest data from Supabase! (${count} products loaded)`,
      });
    } catch (e: any) {
      setSyncFeedback({
        type: 'error',
        message: e?.message || 'Failed to pull data from Supabase.',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleSaveBranding = () => {
    onUpdateSettings(settingsDraft);
    syncSettingsToSupabase(settingsDraft).catch(() => {});
    alert('Website logo, branding, and colors saved successfully!');
  };

  // PIN Authentication
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentPin = getAdminPin();
    if (pinInput === currentPin) {
      setIsAuthenticated(true);
      setPinError(false);
      setSettingsDraft({ ...settings });
    } else {
      setPinError(true);
    }
  };

  // Toggle in-stock status for product
  const toggleProductAvailability = (productId: string) => {
    const updated = products.map((p) =>
      p.id === productId ? { ...p, isAvailable: !p.isAvailable } : p
    );
    onUpdateProducts(updated);
  };

  // Delete product
  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('Are you sure you want to delete this food item?')) {
      const updated = products.filter((p) => p.id !== productId);
      onUpdateProducts(updated);
      if (editingProduct?.id === productId) setEditingProduct(null);
    }
  };

  // Save product changes (Edit or New)
  const handleSaveProduct = (prod: Product) => {
    if (!prod.name.trim()) return alert('Product name is required');
    if (!prod.price || prod.price <= 0) return alert('Valid price is required');

    let updated: Product[];
    if (isCreatingProduct) {
      updated = [prod, ...products];
    } else {
      updated = products.map((p) => (p.id === prod.id ? prod : p));
    }

    onUpdateProducts(updated);
    setEditingProduct(null);
    setIsCreatingProduct(false);
  };

  // Add Category
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: newCategoryName.trim(),
      icon: newCategoryIcon || '🍽️',
    };
    onUpdateCategories([...categories, newCat]);
    setNewCategoryName('');
  };

  // Delete Category
  const handleDeleteCategory = (catId: string) => {
    if (categories.length <= 1) {
      alert('You need at least one category!');
      return;
    }
    onUpdateCategories(categories.filter((c) => c.id !== catId));
  };

  // Add Offer
  const handleAddOffer = () => {
    if (!newOfferCode.trim() || !newOfferTitle.trim()) {
      return alert('Coupon code and title are required');
    }
    const newOff: Offer = {
      id: `off-${Date.now()}`,
      code: newOfferCode.trim().toUpperCase(),
      title: newOfferTitle.trim(),
      description: newOfferDesc.trim() || 'Special discount',
      discountType: 'percentage',
      discountValue: Number(newOfferDiscount) || 20,
      minOrder: Number(newOfferMin) || 199,
      bannerGradient: 'from-red-600 via-rose-600 to-amber-600',
      active: true,
    };
    onUpdateOffers([...offers, newOff]);
    setNewOfferCode('');
    setNewOfferTitle('');
    setNewOfferDesc('');
  };

  // Toggle Offer Active
  const handleToggleOffer = (offerId: string) => {
    const updated = offers.map((o) =>
      o.id === offerId ? { ...o, active: !o.active } : o
    );
    onUpdateOffers(updated);
  };

  // Delete Offer
  const handleDeleteOffer = (offerId: string) => {
    onUpdateOffers(offers.filter((o) => o.id !== offerId));
  };

  // Save Settings
  const handleSaveSettings = () => {
    onUpdateSettings(settingsDraft);
    alert('Store settings saved successfully!');
  };

  // Export JSON
  const handleExportJson = () => {
    const json = exportStoreDataJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pizza-xpress-menu-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON
  const handleImportJson = () => {
    if (!jsonText.trim()) return;
    const ok = importStoreDataJson(jsonText);
    if (ok) {
      setJsonMessage({
        text: 'Menu data successfully imported! Refreshing...',
        type: 'success',
      });
      setTimeout(() => window.location.reload(), 1200);
    } else {
      setJsonMessage({
        text: 'Invalid JSON format. Please verify.',
        type: 'error',
      });
    }
  };

  // Reset to Defaults
  const handleResetDefaults = () => {
    if (
      window.confirm(
        'Reset all menu items, categories, and settings to original defaults?'
      )
    ) {
      resetStoreToDefaults();
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-neutral-900 border border-neutral-800 rounded-none sm:rounded-3xl w-full max-w-4xl h-full sm:h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header Bar */}
        <div className="p-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-600/30 text-red-500 flex items-center justify-center font-bold">
              <SettingsIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">
                Store Manager & Menu Admin
              </h2>
              <p className="text-[11px] text-neutral-400">
                Easily edit menu, prices, WhatsApp number, and offers without coding
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800 text-neutral-300 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PIN Verification Screen if Not Authenticated */}
        {!isAuthenticated ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-red-500 mb-4 shadow-lg">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-white mb-1">
              Store Owner Access
            </h3>
            <p className="text-xs text-neutral-400 max-w-xs mb-6">
              Enter your admin security PIN to edit menu, prices, and orders.
              (Default PIN: <strong className="text-amber-400">1234</strong>)
            </p>

            <form onSubmit={handlePinSubmit} className="w-full max-w-xs space-y-3">
              <input
                type="password"
                maxLength={8}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(false);
                }}
                placeholder="Enter PIN (e.g. 1234)"
                className="w-full bg-neutral-950 text-white text-center text-lg tracking-widest py-3 rounded-xl border border-neutral-800 focus:outline-none focus:border-red-500"
                autoFocus
              />
              {pinError && (
                <p className="text-xs text-red-400">
                  Incorrect PIN. Try 1234.
                </p>
              )}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black py-3 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer"
              >
                Unlock Admin
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Admin Dashboard */
          <div className="flex-1 flex flex-col min-h-0">
            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar px-4 py-2 bg-neutral-950/70 border-b border-neutral-800 shrink-0">
              <button
                onClick={() => setActiveTab('products')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer ${
                  activeTab === 'products'
                    ? 'bg-red-600 text-white shadow'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Food Menu ({products.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('categories')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer ${
                  activeTab === 'categories'
                    ? 'bg-red-600 text-white shadow'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Categories</span>
              </button>

              <button
                onClick={() => setActiveTab('offers')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer ${
                  activeTab === 'offers'
                    ? 'bg-red-600 text-white shadow'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Offers & Coupons</span>
              </button>

              <button
                onClick={() => setActiveTab('branding')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer ${
                  activeTab === 'branding'
                    ? 'bg-red-600 text-white shadow'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Logo & Colors</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-red-600 text-white shadow'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <SettingsIcon className="w-3.5 h-3.5" />
                <span>Store & WhatsApp</span>
              </button>

              <button
                onClick={() => setActiveTab('database')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer ${
                  activeTab === 'database'
                    ? 'bg-red-600 text-white shadow'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <Cloud className="w-3.5 h-3.5" />
                <span>Supabase Cloud DB</span>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer ${
                  activeTab === 'orders'
                    ? 'bg-red-600 text-white shadow'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <span>📦 Orders ({orders.length})</span>
              </button>
            </div>

            {/* TAB 1: PRODUCTS / FOOD ITEMS */}
            {activeTab === 'products' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white text-sm">
                      Manage Food Items
                    </h3>
                    <p className="text-xs text-neutral-400">
                      Toggle availability, edit prices, photos, and descriptions
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const newProduct: Product = {
                        id: `px-${Date.now()}`,
                        name: 'New Pizza or Burger',
                        description: 'Delicious hot food prepared with fresh ingredients.',
                        price: 199,
                        category: categories[1]?.name || 'Pizza',
                        isVeg: true,
                        isAvailable: true,
                        imageUrl: PRESET_FOOD_IMAGES[0].url,
                        rating: 4.8,
                        ratingCount: 1,
                      };
                      setIsCreatingProduct(true);
                      setEditingProduct(newProduct);
                    }}
                    className="flex items-center gap-1 bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-3 py-2 rounded-xl transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Food Item</span>
                  </button>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {products.map((item) => (
                    <div
                      key={item.id}
                      className="bg-neutral-950/70 border border-neutral-800 rounded-2xl p-3 flex gap-3 items-center justify-between"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-14 h-14 rounded-xl object-cover bg-neutral-800 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={
                                item.isVeg
                                  ? 'veg-indicator scale-75'
                                  : 'non-veg-indicator scale-75'
                              }
                            />
                            <h4 className="font-bold text-xs text-white truncate">
                              {item.name}
                            </h4>
                          </div>
                          <p className="text-[11px] text-neutral-400">
                            {item.category} •{' '}
                            <strong className="text-amber-400">
                              ₹{item.discountPrice || item.price}
                            </strong>
                            {item.discountPrice && (
                              <span className="line-through text-neutral-500 ml-1">
                                ₹{item.price}
                              </span>
                            )}
                          </p>
                          <span
                            className={`inline-block text-[10px] font-bold px-1.5 rounded mt-0.5 ${
                              item.isAvailable
                                ? 'text-emerald-400 bg-emerald-950/40'
                                : 'text-red-400 bg-red-950/40'
                            }`}
                          >
                            {item.isAvailable ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => toggleProductAvailability(item.id)}
                          className={`p-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                            item.isAvailable
                              ? 'bg-neutral-800 text-neutral-300 hover:text-red-400'
                              : 'bg-emerald-950 text-emerald-400'
                          }`}
                          title={
                            item.isAvailable
                              ? 'Mark Out of Stock'
                              : 'Mark In Stock'
                          }
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            setIsCreatingProduct(false);
                            setEditingProduct({ ...item });
                          }}
                          className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition cursor-pointer"
                          title="Edit Item"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteProduct(item.id)}
                          className="p-2 rounded-lg bg-neutral-800 hover:bg-red-900/40 text-neutral-400 hover:text-red-400 transition cursor-pointer"
                          title="Delete Item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: CATEGORIES */}
            {activeTab === 'categories' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 space-y-3">
                  <h3 className="font-bold text-white text-sm">
                    Add New Category
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Category name (e.g. Pasta, Shakes, Combos)"
                      className="flex-1 bg-neutral-900 text-white text-xs px-3 py-2.5 rounded-xl border border-neutral-800 focus:outline-none focus:border-red-500"
                    />
                    <input
                      type="text"
                      value={newCategoryIcon}
                      onChange={(e) => setNewCategoryIcon(e.target.value)}
                      placeholder="Emoji (e.g. 🍝)"
                      className="w-20 bg-neutral-900 text-white text-xs px-3 py-2.5 rounded-xl border border-neutral-800 text-center focus:outline-none focus:border-red-500"
                    />
                    <button
                      onClick={handleAddCategory}
                      className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer"
                    >
                      Add Category
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider text-neutral-400">
                    Existing Categories
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {categories.map((cat) => (
                      <div
                        key={cat.id}
                        className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{cat.icon}</span>
                          <span className="font-bold text-xs text-white">
                            {cat.name}
                          </span>
                        </div>
                        {cat.name !== 'All' && (
                          <button
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="text-neutral-500 hover:text-red-400 p-1.5 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: OFFERS & COUPONS */}
            {activeTab === 'offers' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="bg-neutral-950/80 border border-neutral-800 rounded-xl p-3 flex items-center justify-between text-xs text-neutral-300">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-bold">ℹ️ Status:</span>
                    <span>
                      {settingsDraft.showOffersBanner
                        ? 'Special Offers Banner is currently VISIBLE on home screen.'
                        : 'Special Offers Banner is currently HIDDEN from home screen (Optional).'}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      const updated = {
                        ...settingsDraft,
                        showOffersBanner: !settingsDraft.showOffersBanner,
                      };
                      setSettingsDraft(updated);
                      onUpdateSettings(updated);
                    }}
                    className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white cursor-pointer"
                  >
                    {settingsDraft.showOffersBanner ? 'Hide from Home' : 'Show on Home'}
                  </button>
                </div>

                <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 space-y-3">
                  <h3 className="font-bold text-white text-sm">
                    Create New Promo Offer
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newOfferCode}
                      onChange={(e) => setNewOfferCode(e.target.value.toUpperCase())}
                      placeholder="Coupon Code (e.g. CHEESE20)"
                      className="bg-neutral-900 text-white text-xs px-3 py-2 rounded-xl border border-neutral-800 focus:outline-none focus:border-red-500 uppercase"
                    />
                    <input
                      type="text"
                      value={newOfferTitle}
                      onChange={(e) => setNewOfferTitle(e.target.value)}
                      placeholder="Title (e.g. 20% OFF Everything)"
                      className="bg-neutral-900 text-white text-xs px-3 py-2 rounded-xl border border-neutral-800 focus:outline-none focus:border-red-500"
                    />
                    <input
                      type="text"
                      value={newOfferDesc}
                      onChange={(e) => setNewOfferDesc(e.target.value)}
                      placeholder="Description (e.g. Valid today only)"
                      className="bg-neutral-900 text-white text-xs px-3 py-2 rounded-xl border border-neutral-800 focus:outline-none focus:border-red-500"
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={newOfferDiscount}
                        onChange={(e) => setNewOfferDiscount(e.target.value)}
                        placeholder="Discount Value"
                        className="w-1/2 bg-neutral-900 text-white text-xs px-3 py-2 rounded-xl border border-neutral-800 focus:outline-none focus:border-red-500"
                      />
                      <input
                        type="number"
                        value={newOfferMin}
                        onChange={(e) => setNewOfferMin(e.target.value)}
                        placeholder="Min Order (₹)"
                        className="w-1/2 bg-neutral-900 text-white text-xs px-3 py-2 rounded-xl border border-neutral-800 focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleAddOffer}
                    className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer"
                  >
                    Add Offer Banner
                  </button>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider text-neutral-400">
                    Active Banners & Offers
                  </h4>
                  <div className="space-y-2">
                    {offers.map((offer) => (
                      <div
                        key={offer.id}
                        className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-900/50">
                              {offer.code}
                            </span>
                            <span className="font-bold text-xs text-white">
                              {offer.title}
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-400 mt-1">
                            {offer.description} • Min Order: ₹{offer.minOrder}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleOffer(offer.id)}
                            className={`text-xs px-2.5 py-1 rounded-lg font-bold cursor-pointer ${
                              offer.active
                                ? 'bg-emerald-950 text-emerald-400'
                                : 'bg-neutral-800 text-neutral-500'
                            }`}
                          >
                            {offer.active ? 'Active' : 'Disabled'}
                          </button>
                          <button
                            onClick={() => handleDeleteOffer(offer.id)}
                            className="text-neutral-500 hover:text-red-400 p-1.5 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: WEBSITE BRANDING & COLORS */}
            {activeTab === 'branding' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-white text-sm flex items-center gap-2">
                        <Palette className="w-4 h-4 text-red-500" />
                        <span>Logo, Website Text & Theme Colors</span>
                      </h3>
                      <p className="text-xs text-neutral-400">
                        Customize your brand identity and colors with instant live preview — no coding needed
                      </p>
                    </div>
                  </div>

                  {/* Live Header & Brand Preview */}
                  <div className="p-4 bg-neutral-900/80 border border-neutral-800 rounded-2xl space-y-3">
                    <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                      Live Preview
                    </span>
                    <div className="flex items-center justify-between gap-3 p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                      <div className="flex items-center gap-3">
                        <div
                          style={{
                            background: settingsDraft.primaryColor
                              ? `linear-gradient(135deg, ${settingsDraft.primaryColor}, #f59e0b)`
                              : undefined,
                          }}
                          className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 via-rose-600 to-amber-500 flex items-center justify-center text-xl font-black text-white shadow-lg transform -rotate-3 overflow-hidden"
                        >
                          {settingsDraft.logoIconUrl ? (
                            <img
                              src={settingsDraft.logoIconUrl}
                              alt="Logo"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            settingsDraft.logoBadge || 'PX'
                          )}
                        </div>
                        <div>
                          <div className="text-base font-black text-white flex items-center">
                            {settingsDraft.logoText || 'PIZZA XPRESS'}
                          </div>
                          <span className="text-[11px] text-neutral-400">
                            {settingsDraft.tagline || '100% Pure Veg • Hot & Fresh'}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        style={{
                          backgroundColor: settingsDraft.primaryColor || '#dc2626',
                        }}
                        className="px-3.5 py-1.5 rounded-xl text-white font-bold text-xs shadow-md"
                      >
                        Sample Button
                      </button>
                    </div>
                  </div>

                  {/* Brand Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">
                        Logo Title Text (Shown in Header & Footer)
                      </label>
                      <input
                        type="text"
                        value={settingsDraft.logoText || ''}
                        onChange={(e) =>
                          setSettingsDraft({
                            ...settingsDraft,
                            logoText: e.target.value,
                          })
                        }
                        placeholder="e.g. PIZZA XPRESS"
                        className="w-full bg-neutral-900 text-white text-xs px-3 py-2 rounded-xl border border-neutral-800"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">
                        Logo Badge Monogram (1-3 letters or emoji)
                      </label>
                      <input
                        type="text"
                        maxLength={5}
                        value={settingsDraft.logoBadge || ''}
                        onChange={(e) =>
                          setSettingsDraft({
                            ...settingsDraft,
                            logoBadge: e.target.value,
                          })
                        }
                        placeholder="e.g. PX or 🍕"
                        className="w-full bg-neutral-900 text-white text-xs px-3 py-2 rounded-xl border border-neutral-800 font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">
                        Logo Icon / Image URL (Optional)
                      </label>
                      <input
                        type="url"
                        value={settingsDraft.logoIconUrl || ''}
                        onChange={(e) =>
                          setSettingsDraft({
                            ...settingsDraft,
                            logoIconUrl: e.target.value,
                          })
                        }
                        placeholder="https://... (optional image for logo)"
                        className="w-full bg-neutral-900 text-white text-xs px-3 py-2 rounded-xl border border-neutral-800"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">
                        Website Tagline / Slogan
                      </label>
                      <input
                        type="text"
                        value={settingsDraft.tagline || ''}
                        onChange={(e) =>
                          setSettingsDraft({
                            ...settingsDraft,
                            tagline: e.target.value,
                          })
                        }
                        placeholder="e.g. 100% Pure Veg • Hot, Cheesy & Fast!"
                        className="w-full bg-neutral-900 text-white text-xs px-3 py-2 rounded-xl border border-neutral-800"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[11px] text-neutral-400 block mb-1">
                        Top Announcement Bar Text
                      </label>
                      <input
                        type="text"
                        value={settingsDraft.announcementText || ''}
                        onChange={(e) =>
                          setSettingsDraft({
                            ...settingsDraft,
                            announcementText: e.target.value,
                          })
                        }
                        placeholder="e.g. Delivering Fresh to Thakur Tolli • Orders Accepted on WhatsApp"
                        className="w-full bg-neutral-900 text-white text-xs px-3 py-2 rounded-xl border border-neutral-800"
                      />
                    </div>
                  </div>

                  {/* Colors Customization */}
                  <div className="pt-2 border-t border-neutral-800 space-y-3">
                    <h4 className="font-bold text-white text-xs uppercase tracking-wider text-amber-400">
                      Theme Color Presets & Custom Palette
                    </h4>

                    {/* Quick Color Presets */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] text-neutral-400">Quick Palette Themes:</span>
                      <div className="flex flex-wrap gap-2">
                        {COLOR_PRESETS.map((p, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() =>
                              setSettingsDraft({
                                ...settingsDraft,
                                primaryColor: p.primary,
                                accentColor: p.accent,
                              })
                            }
                            className="flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 px-2.5 py-1.5 rounded-xl text-xs transition cursor-pointer"
                          >
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-black/40"
                              style={{ backgroundColor: p.primary }}
                            ></span>
                            <span className="text-white font-medium text-[11px]">{p.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {/* Primary Color Picker */}
                      <div>
                        <label className="text-[11px] text-neutral-400 block mb-1">
                          Primary Theme Color (Buttons, Badges, Header Highlights)
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={settingsDraft.primaryColor || '#dc2626'}
                            onChange={(e) =>
                              setSettingsDraft({
                                ...settingsDraft,
                                primaryColor: e.target.value,
                              })
                            }
                            className="w-9 h-9 rounded-lg border border-neutral-700 bg-neutral-900 cursor-pointer p-0.5"
                          />
                          <input
                            type="text"
                            value={settingsDraft.primaryColor || '#dc2626'}
                            onChange={(e) =>
                              setSettingsDraft({
                                ...settingsDraft,
                                primaryColor: e.target.value,
                              })
                            }
                            className="flex-1 bg-neutral-900 text-white font-mono text-xs px-3 py-2 rounded-xl border border-neutral-800"
                          />
                        </div>
                      </div>

                      {/* Accent Color Picker */}
                      <div>
                        <label className="text-[11px] text-neutral-400 block mb-1">
                          Accent Color (Badges, Offers, Stars)
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={settingsDraft.accentColor || '#f59e0b'}
                            onChange={(e) =>
                              setSettingsDraft({
                                ...settingsDraft,
                                accentColor: e.target.value,
                              })
                            }
                            className="w-9 h-9 rounded-lg border border-neutral-700 bg-neutral-900 cursor-pointer p-0.5"
                          />
                          <input
                            type="text"
                            value={settingsDraft.accentColor || '#f59e0b'}
                            onChange={(e) =>
                              setSettingsDraft({
                                ...settingsDraft,
                                accentColor: e.target.value,
                              })
                            }
                            className="flex-1 bg-neutral-900 text-white font-mono text-xs px-3 py-2 rounded-xl border border-neutral-800"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-neutral-800 flex justify-end">
                    <button
                      onClick={handleSaveBranding}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Branding & Colors</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: STORE SETTINGS & WHATSAPP */}
            {activeTab === 'settings' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 space-y-4">
                  <h3 className="font-bold text-white text-sm">
                    Store Configuration & WhatsApp
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">
                        Store Name
                      </label>
                      <input
                        type="text"
                        value={settingsDraft.storeName}
                        onChange={(e) =>
                          setSettingsDraft({
                            ...settingsDraft,
                            storeName: e.target.value,
                          })
                        }
                        className="w-full bg-neutral-900 text-white text-xs px-3 py-2 rounded-xl border border-neutral-800"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-amber-400 font-bold block mb-1">
                        WhatsApp Order Number (Current: {settings.whatsappNumber})
                      </label>
                      <input
                        type="text"
                        value={settingsDraft.whatsappNumber}
                        onChange={(e) =>
                          setSettingsDraft({
                            ...settingsDraft,
                            whatsappNumber: e.target.value,
                          })
                        }
                        placeholder="e.g. 9608995300"
                        className="w-full bg-neutral-900 text-white text-xs px-3 py-2 rounded-xl border border-amber-500/50"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">
                        Store Location / Area
                      </label>
                      <input
                        type="text"
                        value={settingsDraft.storeLocation}
                        onChange={(e) =>
                          setSettingsDraft({
                            ...settingsDraft,
                            storeLocation: e.target.value,
                          })
                        }
                        placeholder="Thakur Tolli, PIN 835223"
                        className="w-full bg-neutral-900 text-white text-xs px-3 py-2 rounded-xl border border-neutral-800"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">
                        Full Address
                      </label>
                      <input
                        type="text"
                        value={settingsDraft.storeAddress}
                        onChange={(e) =>
                          setSettingsDraft({
                            ...settingsDraft,
                            storeAddress: e.target.value,
                          })
                        }
                        className="w-full bg-neutral-900 text-white text-xs px-3 py-2 rounded-xl border border-neutral-800"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">
                        Delivery Charge (₹)
                      </label>
                      <input
                        type="number"
                        value={settingsDraft.deliveryCharge}
                        onChange={(e) =>
                          setSettingsDraft({
                            ...settingsDraft,
                            deliveryCharge: Number(e.target.value),
                          })
                        }
                        className="w-full bg-neutral-900 text-white text-xs px-3 py-2 rounded-xl border border-neutral-800"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">
                        Free Delivery Threshold (₹)
                      </label>
                      <input
                        type="number"
                        value={settingsDraft.freeDeliveryAbove}
                        onChange={(e) =>
                          setSettingsDraft({
                            ...settingsDraft,
                            freeDeliveryAbove: Number(e.target.value),
                          })
                        }
                        className="w-full bg-neutral-900 text-white text-xs px-3 py-2 rounded-xl border border-neutral-800"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">
                        UPI ID for QR Payments
                      </label>
                      <input
                        type="text"
                        value={settingsDraft.upiId}
                        onChange={(e) =>
                          setSettingsDraft({
                            ...settingsDraft,
                            upiId: e.target.value,
                          })
                        }
                        className="w-full bg-neutral-900 text-white text-xs px-3 py-2 rounded-xl border border-neutral-800"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">
                        Store Open Status
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setSettingsDraft({
                            ...settingsDraft,
                            isOpen: !settingsDraft.isOpen,
                          })
                        }
                        className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                          settingsDraft.isOpen
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/50'
                            : 'bg-red-950 text-red-400 border border-red-500/50'
                        }`}
                      >
                        {settingsDraft.isOpen
                          ? '🟢 Store Is OPEN & Taking Orders'
                          : '🔴 Store Is CLOSED'}
                      </button>
                    </div>

                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">
                        Special Offers Banner on Home (Optional)
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setSettingsDraft({
                            ...settingsDraft,
                            showOffersBanner: !settingsDraft.showOffersBanner,
                          })
                        }
                        className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                          settingsDraft.showOffersBanner
                            ? 'bg-amber-950 text-amber-300 border border-amber-500/50'
                            : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                        }`}
                      >
                        {settingsDraft.showOffersBanner
                          ? '🌟 Banner Enabled (Visible on Home)'
                          : '🚫 Banner Hidden (Optional / Disabled)'}
                      </button>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-neutral-800 flex justify-end">
                    <button
                      onClick={handleSaveSettings}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Settings</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: RECENT ORDERS */}
            {activeTab === 'orders' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white text-sm">
                      Recent Orders Log
                    </h3>
                    <p className="text-xs text-neutral-400">
                      Orders placed via this device or synced
                    </p>
                  </div>
                </div>

                {orders.length === 0 ? (
                  <div className="p-8 text-center text-neutral-500 text-xs">
                    No orders placed yet. Orders submitted by customers will
                    appear here!
                  </div>
                ) : (
                  orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-amber-400">
                          #{ord.orderNumber}
                        </span>
                        <span className="text-[11px] text-neutral-500">
                          {ord.createdAt}
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <div>
                          <strong className="text-white text-sm">
                            {ord.customerName}
                          </strong>
                          <span className="text-neutral-400 ml-2">
                            📱 {ord.customerPhone}
                          </span>
                        </div>
                        <span className="font-black text-amber-400 text-sm">
                          ₹{ord.grandTotal}
                        </span>
                      </div>

                      <p className="text-neutral-400">
                        {ord.orderType === 'delivery'
                          ? `📍 ${ord.address}`
                          : '🛍️ Takeaway / Pickup'}
                      </p>

                      <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
                        <span className="text-neutral-400 capitalize">
                          Payment: {ord.paymentMethod.toUpperCase()}
                        </span>
                        <select
                          value={ord.status}
                          onChange={(e) =>
                            onUpdateOrderStatus(
                              ord.id,
                              e.target.value as Order['status']
                            )
                          }
                          className="bg-neutral-900 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg border border-neutral-700"
                        >
                          <option value="pending">🟡 Pending WhatsApp</option>
                          <option value="accepted">🔵 Accepted</option>
                          <option value="preparing">🟠 Preparing</option>
                          <option value="delivered">🟢 Delivered</option>
                          <option value="cancelled">🔴 Cancelled</option>
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB: SUPABASE CLOUD DATABASE & BACKUP */}
            {activeTab === 'database' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs text-neutral-300">
                {/* Supabase Connection Card */}
                <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                        <Cloud className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-black text-sm text-white flex items-center gap-2">
                          <span>Supabase Cloud Database</span>
                          {supaStatus?.success ? (
                            <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/50 px-2 py-0.5 rounded-full font-bold">
                              Connected
                            </span>
                          ) : supaUrl ? (
                            <span className="text-[10px] bg-amber-950 text-amber-400 border border-amber-500/50 px-2 py-0.5 rounded-full font-bold">
                              Configured
                            </span>
                          ) : (
                            <span className="text-[10px] bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded-full font-bold">
                              Not Connected
                            </span>
                          )}
                        </h3>
                        <p className="text-[11px] text-neutral-400">
                          Connect Supabase so changes made here appear on the live website automatically
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Security Notice */}
                  <div className="bg-emerald-950/40 border border-emerald-600/40 rounded-xl p-3 flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="text-[11px] space-y-1">
                      <strong className="text-emerald-300 font-bold block">
                        Client Security Enforced: Anon Public Key Only
                      </strong>
                      <p className="text-neutral-300">
                        This dashboard only uses your Supabase <code>anon</code> public key with Row Level Security.
                        <strong> Never enter your secret <code>service_role</code> key.</strong>
                      </p>
                    </div>
                  </div>

                  {/* Input Fields */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] text-neutral-300 font-bold block mb-1">
                        Supabase Project URL *
                      </label>
                      <input
                        type="url"
                        value={supaUrl}
                        onChange={(e) => setSupaUrl(e.target.value)}
                        placeholder="https://your-project-ref.supabase.co"
                        className="w-full bg-neutral-900 text-white font-mono text-xs px-3 py-2 rounded-xl border border-neutral-800 focus:border-red-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[11px] text-neutral-300 font-bold">
                          Supabase Anon (Public) Key *
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowAnonKey(!showAnonKey)}
                          className="text-[10px] text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
                        >
                          {showAnonKey ? (
                            <>
                              <EyeOff className="w-3 h-3" /> Hide
                            </>
                          ) : (
                            <>
                              <Eye className="w-3 h-3" /> Show
                            </>
                          )}
                        </button>
                      </div>
                      <input
                        type={showAnonKey ? 'text' : 'password'}
                        value={supaAnonKey}
                        onChange={(e) => setSupaAnonKey(e.target.value)}
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                        className="w-full bg-neutral-900 text-white font-mono text-xs px-3 py-2 rounded-xl border border-neutral-800 focus:border-red-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Status Banner */}
                  {supaStatus && (
                    <div
                      className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                        supaStatus.success
                          ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                          : 'bg-red-950/60 border-red-500/50 text-red-300'
                      }`}
                    >
                      {supaStatus.testing ? (
                        <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                      ) : supaStatus.success ? (
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      )}
                      <span>{supaStatus.message}</span>
                    </div>
                  )}

                  {/* Sync Feedback */}
                  {syncFeedback && (
                    <div
                      className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                        syncFeedback.type === 'success'
                          ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                          : 'bg-red-950/60 border-red-500/50 text-red-300'
                      }`}
                    >
                      {syncFeedback.type === 'success' ? (
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      )}
                      <span>{syncFeedback.message}</span>
                    </div>
                  )}

                  {/* Connection & Sync Action Buttons */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleTestSupabase}
                      disabled={supaStatus?.testing}
                      className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 ${
                          supaStatus?.testing ? 'animate-spin' : ''
                        }`}
                      />
                      <span>Save & Test Connection</span>
                    </button>

                    <button
                      type="button"
                      onClick={handlePushToSupabase}
                      disabled={isSyncing}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow transition cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isSyncing ? 'Syncing...' : 'Push Local Menu to Supabase'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handlePullFromSupabase}
                      disabled={isSyncing}
                      className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Pull Live Menu from Supabase</span>
                    </button>
                  </div>
                </div>

                {/* Step-by-Step Supabase Setup Guide */}
                <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-xs uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Step-by-Step Supabase Setup Instructions</span>
                      </h4>
                      <p className="text-[11px] text-neutral-400">
                        Follow these 4 simple steps to connect your free Supabase cloud database
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopySql}
                      className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 transition cursor-pointer"
                    >
                      {copiedSql ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy SQL Script
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-neutral-900/70 border border-neutral-800 rounded-xl space-y-1">
                      <strong className="text-white block font-bold">
                        1. Create Free Project
                      </strong>
                      <p className="text-neutral-400 text-[11px]">
                        Go to <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-amber-400 underline font-semibold">supabase.com</a>, sign up for free, and click <em>New Project</em>. Enter a name like "pizza-xpress".
                      </p>
                    </div>

                    <div className="p-3 bg-neutral-900/70 border border-neutral-800 rounded-xl space-y-1">
                      <strong className="text-white block font-bold">
                        2. Run Setup SQL Script
                      </strong>
                      <p className="text-neutral-400 text-[11px]">
                        In your Supabase project dashboard, click <strong>SQL Editor</strong> on the left sidebar. Click <strong>Copy SQL Script</strong> above, paste it in the editor, and click <strong>Run</strong>.
                      </p>
                    </div>

                    <div className="p-3 bg-neutral-900/70 border border-neutral-800 rounded-xl space-y-1">
                      <strong className="text-white block font-bold">
                        3. Copy Project URL & Anon Key
                      </strong>
                      <p className="text-neutral-400 text-[11px]">
                        Navigate to <strong>Project Settings &gt; API</strong> in Supabase. Copy the <strong>Project URL</strong> and the <strong>anon public key</strong>.
                      </p>
                    </div>

                    <div className="p-3 bg-neutral-900/70 border border-neutral-800 rounded-xl space-y-1">
                      <strong className="text-white block font-bold">
                        4. Save & Push Menu
                      </strong>
                      <p className="text-neutral-400 text-[11px]">
                        Paste both into the fields above, click <strong>Save & Test Connection</strong>, then click <strong>Push Local Menu to Supabase</strong>!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Local JSON Backup / Restore */}
                <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-neutral-400" />
                    <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                      Offline Backup & JSON Export
                    </h4>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    You can also export a copy of all food items and settings as a standalone file anytime.
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleExportJson}
                      className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export Menu as JSON File</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleResetDefaults}
                      className="bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/50 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset to Sample Menu</span>
                    </button>
                  </div>

                  <div className="pt-2">
                    <textarea
                      rows={3}
                      value={jsonText}
                      onChange={(e) => setJsonText(e.target.value)}
                      placeholder="Or paste exported JSON here to restore..."
                      className="w-full bg-neutral-900 text-white font-mono text-[11px] p-3 rounded-xl border border-neutral-800 focus:outline-none focus:border-red-500"
                    />
                    {jsonMessage && (
                      <p
                        className={`text-xs font-bold mt-1 ${
                          jsonMessage.type === 'success'
                            ? 'text-emerald-400'
                            : 'text-red-400'
                        }`}
                      >
                        {jsonMessage.text}
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={handleImportJson}
                      className="mt-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs px-4 py-1.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Import JSON</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PRODUCT EDIT MODAL */}
        {editingProduct && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
              <div className="p-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
                <h3 className="font-black text-sm text-white">
                  {isCreatingProduct ? 'Add New Food Item' : 'Edit Food Item'}
                </h3>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="w-7 h-7 rounded-full bg-neutral-800 text-neutral-300 hover:text-white flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 overflow-y-auto space-y-3 text-xs text-neutral-300">
                <div>
                  <label className="text-neutral-400 block mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        name: e.target.value,
                      })
                    }
                    className="w-full bg-neutral-950 text-white text-xs px-3 py-2 rounded-xl border border-neutral-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-neutral-400 block mb-1">
                      Selling Price (₹) *
                    </label>
                    <input
                      type="number"
                      value={editingProduct.price}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          price: Number(e.target.value),
                        })
                      }
                      className="w-full bg-neutral-950 text-white text-xs px-3 py-2 rounded-xl border border-neutral-800"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-400 block mb-1">
                      Discounted Price (₹, optional)
                    </label>
                    <input
                      type="number"
                      value={editingProduct.discountPrice || ''}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          discountPrice: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                      placeholder="e.g. 199"
                      className="w-full bg-neutral-950 text-white text-xs px-3 py-2 rounded-xl border border-neutral-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-neutral-400 block mb-1">
                      Category
                    </label>
                    <select
                      value={editingProduct.category}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          category: e.target.value,
                        })
                      }
                      className="w-full bg-neutral-950 text-white text-xs px-3 py-2 rounded-xl border border-neutral-800"
                    >
                      {categories
                        .filter((c) => c.name !== 'All')
                        .map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.icon} {c.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-neutral-400 block mb-1">
                      Badge Tag (optional)
                    </label>
                    <input
                      type="text"
                      value={editingProduct.badge || ''}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          badge: e.target.value || undefined,
                        })
                      }
                      placeholder="e.g. Best Seller"
                      className="w-full bg-neutral-950 text-white text-xs px-3 py-2 rounded-xl border border-neutral-800"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingProduct.isVeg}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          isVeg: e.target.checked,
                        })
                      }
                      className="rounded bg-neutral-800 border-neutral-700 text-emerald-500"
                    />
                    <span className="text-xs font-bold text-white">
                      Pure Veg Item 🌱
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingProduct.isAvailable}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          isAvailable: e.target.checked,
                        })
                      }
                      className="rounded bg-neutral-800 border-neutral-700 text-red-500"
                    />
                    <span className="text-xs font-bold text-white">
                      In Stock / Available
                    </span>
                  </label>
                </div>

                {/* Food Image URL with Preset Selector */}
                <div className="space-y-1.5">
                  <label className="text-neutral-400 block">
                    Food Image URL
                  </label>
                  <input
                    type="url"
                    value={editingProduct.imageUrl}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        imageUrl: e.target.value,
                      })
                    }
                    placeholder="https://..."
                    className="w-full bg-neutral-950 text-white text-xs px-3 py-2 rounded-xl border border-neutral-800"
                  />
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                    <span className="text-[10px] text-neutral-500 shrink-0">
                      Preset Photos:
                    </span>
                    {PRESET_FOOD_IMAGES.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() =>
                          setEditingProduct({
                            ...editingProduct,
                            imageUrl: preset.url,
                          })
                        }
                        className="text-[10px] bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-2 py-0.5 rounded-lg shrink-0 transition cursor-pointer"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={editingProduct.description}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        description: e.target.value,
                      })
                    }
                    className="w-full bg-neutral-950 text-white text-xs px-3 py-2 rounded-xl border border-neutral-800"
                  />
                </div>
              </div>

              <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs px-4 py-2 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveProduct(editingProduct)}
                  className="bg-red-600 hover:bg-red-500 text-white font-black text-xs px-5 py-2 rounded-xl shadow cursor-pointer"
                >
                  Save Food Item
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
