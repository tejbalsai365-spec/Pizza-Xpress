import {
  INITIAL_CATEGORIES,
  INITIAL_OFFERS,
  INITIAL_PRODUCTS,
  INITIAL_SETTINGS,
} from '../data/initialData';
import {
  CartItem,
  Category,
  CheckoutFormData,
  Offer,
  Order,
  Product,
  StoreSettings,
} from '../types';
import {
  syncProductsToSupabase,
  syncSettingsToSupabase,
  syncCategoriesToSupabase,
  syncOffersToSupabase,
} from './supabaseClient';

const STORAGE_KEYS = {
  PRODUCTS: 'pizza_xpress_products_v8',
  CATEGORIES: 'pizza_xpress_categories_v3',
  OFFERS: 'pizza_xpress_offers_v1',
  SETTINGS: 'pizza_xpress_settings_v2',
  ORDERS: 'pizza_xpress_orders_v1',
  ADMIN_PIN: 'pizza_xpress_admin_pin_v1',
};

export const getStoredProducts = (): Product[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (raw) {
      const items: Product[] = JSON.parse(raw);
      const filtered = items
        .filter(
          (p) =>
            p.isVeg === true &&
            (p.category === 'Kulhad Pizza' ||
              p.category === 'Pizza' ||
              p.category === 'Cold Drinks')
        )
        .map((p) => {
          if (p.id === 'px-k1') {
            const initial = INITIAL_PRODUCTS.find((init) => init.id === 'px-k1');
            return initial ? { ...p, imageUrl: initial.imageUrl } : p;
          }
          if (p.id === 'px-k2') {
            const initial = INITIAL_PRODUCTS.find((init) => init.id === 'px-k2');
            return initial ? { ...p, imageUrl: initial.imageUrl } : p;
          }
          return p;
        });
      if (filtered.length > 0) return filtered;
    }
  } catch (e) {
    console.error('Failed to load products from storage', e);
  }
  // Initialize with defaults if empty
  saveProducts(INITIAL_PRODUCTS);
  return INITIAL_PRODUCTS;
};

export const saveProducts = (products: Product[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    syncProductsToSupabase(products).catch(() => {});
  } catch (e) {
    console.error('Failed to save products', e);
  }
};

export const getStoredCategories = (): Category[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (raw) {
      const cats: Category[] = JSON.parse(raw);
      const filtered = cats.filter(
        (c) =>
          c.name === 'All' ||
          c.name === 'Kulhad Pizza' ||
          c.name === 'Pizza' ||
          c.name === 'Cold Drinks'
      );
      if (filtered.length >= 2) return filtered;
    }
  } catch (e) {
    console.error('Failed to load categories', e);
  }
  saveCategories(INITIAL_CATEGORIES);
  return INITIAL_CATEGORIES;
};

export const saveCategories = (categories: Category[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    syncCategoriesToSupabase(categories).catch(() => {});
  } catch (e) {
    console.error('Failed to save categories', e);
  }
};

export const getStoredOffers = (): Offer[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.OFFERS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load offers', e);
  }
  saveOffers(INITIAL_OFFERS);
  return INITIAL_OFFERS;
};

export const saveOffers = (offers: Offer[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.OFFERS, JSON.stringify(offers));
    syncOffersToSupabase(offers).catch(() => {});
  } catch (e) {
    console.error('Failed to save offers', e);
  }
};

export const getStoredSettings = (): StoreSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...INITIAL_SETTINGS,
        ...parsed,
        showOffersBanner: parsed.showOffersBanner === true,
      };
    }
  } catch (e) {
    console.error('Failed to load settings', e);
  }
  saveSettings(INITIAL_SETTINGS);
  return INITIAL_SETTINGS;
};

export const saveSettings = (settings: StoreSettings) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    syncSettingsToSupabase(settings).catch(() => {});
  } catch (e) {
    console.error('Failed to save settings', e);
  }
};

export const getStoredOrders = (): Order[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load orders', e);
  }
  return [];
};

export const saveOrder = (order: Order) => {
  try {
    const current = getStoredOrders();
    const updated = [order, ...current];
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save order', e);
  }
};

export const updateOrderStatus = (orderId: string, status: Order['status']) => {
  try {
    const orders = getStoredOrders().map((o) =>
      o.id === orderId ? { ...o, status } : o
    );
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  } catch (e) {
    console.error('Failed to update order status', e);
  }
};

export const getAdminPin = (): string => {
  return localStorage.getItem(STORAGE_KEYS.ADMIN_PIN) || '1234';
};

export const setAdminPin = (newPin: string) => {
  localStorage.setItem(STORAGE_KEYS.ADMIN_PIN, newPin);
};

export const resetStoreToDefaults = () => {
  localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
  localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
  localStorage.removeItem(STORAGE_KEYS.OFFERS);
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  // Re-seed
  saveProducts(INITIAL_PRODUCTS);
  saveCategories(INITIAL_CATEGORIES);
  saveOffers(INITIAL_OFFERS);
  saveSettings(INITIAL_SETTINGS);
};

export const exportStoreDataJson = (): string => {
  const data = {
    appName: 'Pizza Xpress',
    exportDate: new Date().toISOString(),
    storeSettings: getStoredSettings(),
    categories: getStoredCategories(),
    products: getStoredProducts(),
    offers: getStoredOffers(),
  };
  return JSON.stringify(data, null, 2);
};

export const importStoreDataJson = (jsonString: string): boolean => {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed.products && Array.isArray(parsed.products)) {
      saveProducts(parsed.products);
    }
    if (parsed.categories && Array.isArray(parsed.categories)) {
      saveCategories(parsed.categories);
    }
    if (parsed.offers && Array.isArray(parsed.offers)) {
      saveOffers(parsed.offers);
    }
    if (parsed.storeSettings && typeof parsed.storeSettings === 'object') {
      saveSettings(parsed.storeSettings);
    }
    return true;
  } catch (e) {
    console.error('Import failed', e);
    return false;
  }
};

/**
 * Generate formatted WhatsApp message text and official wa.me link
 */
export const buildWhatsAppOrder = (
  orderNumber: string,
  formData: CheckoutFormData,
  items: CartItem[],
  subtotal: number,
  discount: number,
  couponCode: string | undefined,
  deliveryFee: number,
  grandTotal: number,
  settings: StoreSettings
): { messageText: string; whatsAppUrl: string } => {
  const cleanPhone = settings.whatsappNumber.replace(/[^0-9]/g, '');
  // Format for WhatsApp: if 10 digits starting with 9, prefix India 91
  const targetNumber = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  const now = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const itemsList = items
    .map((item) => {
      let customOptions = '';
      if (item.selectedSize || item.selectedCrust) {
        const parts = [
          item.selectedSize?.name,
          item.selectedCrust?.name,
        ].filter(Boolean);
        customOptions = ` (${parts.join(', ')})`;
      }
      return `• ${item.quantity}x ${item.product.name}${customOptions} - ₹${item.totalPrice}`;
    })
    .join('\n');

  const orderTypeText =
    formData.orderType === 'delivery'
      ? '🛵 Home Delivery'
      : '🛍️ Takeaway / Pickup';

  const paymentText =
    formData.paymentMethod === 'cod'
      ? '💵 Cash on Delivery'
      : `📱 UPI Payment (to ${settings.upiId})`;

  let message = `🍕 *NEW ORDER - PIZZA XPRESS* 🍕\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `*Order ID:* #${orderNumber}\n`;
  message += `*Date/Time:* ${now}\n`;
  message += `*Order Type:* ${orderTypeText}\n`;
  message += `*Payment:* ${paymentText}\n\n`;

  message += `👤 *CUSTOMER DETAILS:*\n`;
  message += `• *Name:* ${formData.customerName.trim()}\n`;
  message += `• *Mobile:* ${formData.customerPhone.trim()}\n`;

  if (formData.orderType === 'delivery') {
    message += `• *Address:* ${formData.address.trim()}\n`;
    if (formData.landmark.trim()) {
      message += `• *Landmark:* ${formData.landmark.trim()}\n`;
    }
    if (formData.mapLink.trim()) {
      message += `• *Map Location:* ${formData.mapLink.trim()}\n`;
    }
  } else {
    message += `• *Pickup Point:* ${settings.storeLocation}\n`;
  }

  message += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `📋 *ORDER ITEMS:*\n`;
  message += `${itemsList}\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n`;

  message += `*Subtotal:* ₹${subtotal}\n`;
  if (discount > 0) {
    message += `*Coupon Discount (${couponCode || 'PROMO'}):* -₹${discount}\n`;
  }
  if (formData.orderType === 'delivery') {
    message += `*Delivery Fee:* ${deliveryFee === 0 ? 'FREE (₹0)' : `₹${deliveryFee}`}\n`;
  } else {
    message += `*Delivery Fee:* ₹0 (Takeaway)\n`;
  }
  message += `💰 *GRAND TOTAL: ₹${grandTotal}*\n`;

  if (formData.instructions.trim()) {
    message += `\n📝 *Special Instructions:*\n"${formData.instructions.trim()}"\n`;
  }

  message += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `🙏 *Please confirm this order and let me know the estimated delivery/prep time. Thank you!*`;

  const encoded = encodeURIComponent(message);
  const whatsAppUrl = `https://wa.me/${targetNumber}?text=${encoded}`;

  return { messageText: message, whatsAppUrl };
};
