import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Category, Offer, Product, StoreSettings } from '../types';

let cachedClient: SupabaseClient | null = null;
let cachedConfigKey = '';

export const getSupabaseConfigFromStorage = (): {
  url: string;
  anonKey: string;
} => {
  // Check env vars first
  const envUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

  try {
    const raw = localStorage.getItem('pizza_xpress_supabase_config');
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        url: parsed.url || envUrl,
        anonKey: parsed.anonKey || envKey,
      };
    }
  } catch (e) {
    console.error('Error reading Supabase config from storage', e);
  }

  return { url: envUrl, anonKey: envKey };
};

export const saveSupabaseConfigToStorage = (url: string, anonKey: string) => {
  try {
    localStorage.setItem(
      'pizza_xpress_supabase_config',
      JSON.stringify({ url: url.trim(), anonKey: anonKey.trim() })
    );
    // Invalidate client cache
    cachedClient = null;
    cachedConfigKey = '';
  } catch (e) {
    console.error('Error saving Supabase config to storage', e);
  }
};

export const getSupabase = (): SupabaseClient | null => {
  const { url, anonKey } = getSupabaseConfigFromStorage();
  if (!url || !anonKey) return null;

  const currentKey = `${url}:::${anonKey}`;
  if (cachedClient && cachedConfigKey === currentKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    cachedConfigKey = currentKey;
    return cachedClient;
  } catch (e) {
    console.error('Failed to initialize Supabase client:', e);
    return null;
  }
};

export const testSupabaseConnection = async (
  url: string,
  anonKey: string
): Promise<{ success: boolean; message: string }> => {
  if (!url || !anonKey) {
    return { success: false, message: 'URL and Anon Key are required.' };
  }
  if (!url.startsWith('https://')) {
    return {
      success: false,
      message: 'Supabase URL must start with https://',
    };
  }

  try {
    const client = createClient(url, anonKey);
    // Simple ping to check if client can reach Supabase
    const { error } = await client.from('products').select('count', { count: 'exact', head: true });
    if (error && error.code !== 'PGRST116') {
      // If table doesn't exist yet, it's a 42P01 or similar relation does not exist error
      if (error.message.includes('relation') || error.code === '42P01') {
        return {
          success: true,
          message:
            'Connected to Supabase! (Tables not found yet — please run the setup SQL script below).',
        };
      }
      return {
        success: false,
        message: `Supabase Error: ${error.message} (Code: ${error.code})`,
      };
    }
    return { success: true, message: 'Successfully connected to Supabase!' };
  } catch (e: any) {
    return {
      success: false,
      message: e?.message || 'Could not connect to Supabase.',
    };
  }
};

/**
 * Fetch all products from Supabase
 */
export const fetchProductsFromSupabase = async (): Promise<Product[] | null> => {
  const client = getSupabase();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('products')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.warn('Supabase fetch products error:', error.message);
      return null;
    }

    if (data && data.length > 0) {
      // Map database snake_case or json to Product type
      return data.map((row: any) => ({
        id: row.id,
        name: row.name,
        description: row.description || '',
        price: Number(row.price),
        discountPrice: row.discount_price ? Number(row.discount_price) : undefined,
        category: row.category,
        isVeg: Boolean(row.is_veg),
        isAvailable: Boolean(row.is_available),
        imageUrl: row.image_url || '',
        rating: Number(row.rating || 4.8),
        ratingCount: Number(row.rating_count || 100),
        badge: row.badge || undefined,
        sizes: row.sizes || undefined,
        crusts: row.crusts || undefined,
      }));
    }
    return null;
  } catch (e) {
    console.error('Failed to fetch products from Supabase', e);
    return null;
  }
};

/**
 * Save products to Supabase (upsert)
 */
export const syncProductsToSupabase = async (
  products: Product[]
): Promise<boolean> => {
  const client = getSupabase();
  if (!client) return false;

  try {
    const rows = products.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      discount_price: p.discountPrice || null,
      category: p.category,
      is_veg: p.isVeg,
      is_available: p.isAvailable,
      image_url: p.imageUrl,
      rating: p.rating,
      rating_count: p.ratingCount,
      badge: p.badge || null,
      sizes: p.sizes || null,
      crusts: p.crusts || null,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await client.from('products').upsert(rows, { onConflict: 'id' });
    if (error) {
      console.error('Failed to sync products to Supabase', error);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Failed to sync products to Supabase', e);
    return false;
  }
};

/**
 * Fetch Store Settings from Supabase
 */
export const fetchSettingsFromSupabase = async (): Promise<StoreSettings | null> => {
  const client = getSupabase();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('store_settings')
      .select('*')
      .eq('id', 'primary')
      .maybeSingle();

    if (error || !data) return null;

    return {
      storeName: data.store_name,
      tagline: data.tagline,
      whatsappNumber: data.whatsapp_number,
      storeLocation: data.store_location,
      storeAddress: data.store_address,
      pincode: data.pincode,
      deliveryCharge: Number(data.delivery_charge),
      freeDeliveryAbove: Number(data.free_delivery_above),
      isOpen: Boolean(data.is_open),
      openingHours: data.opening_hours,
      upiId: data.upi_id,
      upiPayeeName: data.upi_payee_name,
      supportPhone: data.support_phone,
      showOffersBanner: Boolean(data.show_offers_banner),
      logoText: data.logo_text || undefined,
      logoBadge: data.logo_badge || undefined,
      logoIconUrl: data.logo_icon_url || undefined,
      announcementText: data.announcement_text || undefined,
      primaryColor: data.primary_color || undefined,
      accentColor: data.accent_color || undefined,
    };
  } catch (e) {
    console.error('Failed to fetch settings from Supabase', e);
    return null;
  }
};

/**
 * Save Store Settings to Supabase
 */
export const syncSettingsToSupabase = async (
  settings: StoreSettings
): Promise<boolean> => {
  const client = getSupabase();
  if (!client) return false;

  try {
    const row = {
      id: 'primary',
      store_name: settings.storeName,
      tagline: settings.tagline,
      whatsapp_number: settings.whatsappNumber,
      store_location: settings.storeLocation,
      store_address: settings.storeAddress,
      pincode: settings.pincode,
      delivery_charge: settings.deliveryCharge,
      free_delivery_above: settings.freeDeliveryAbove,
      is_open: settings.isOpen,
      opening_hours: settings.openingHours,
      upi_id: settings.upiId,
      upi_payee_name: settings.upiPayeeName,
      support_phone: settings.supportPhone,
      show_offers_banner: settings.showOffersBanner ?? false,
      logo_text: settings.logoText || null,
      logo_badge: settings.logoBadge || null,
      logo_icon_url: settings.logoIconUrl || null,
      announcement_text: settings.announcementText || null,
      primary_color: settings.primaryColor || null,
      accent_color: settings.accentColor || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await client.from('store_settings').upsert(row, { onConflict: 'id' });
    if (error) {
      console.error('Failed to sync settings to Supabase', error);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Failed to sync settings to Supabase', e);
    return false;
  }
};

/**
 * Fetch Categories from Supabase
 */
export const fetchCategoriesFromSupabase = async (): Promise<Category[] | null> => {
  const client = getSupabase();
  if (!client) return null;

  try {
    const { data, error } = await client.from('categories').select('*').order('id', { ascending: true });
    if (error || !data || data.length === 0) return null;
    return data.map((c: any) => ({
      id: c.id,
      name: c.name,
      icon: c.icon || '🍽️',
      color: c.color || undefined,
    }));
  } catch (e) {
    console.error('Failed to fetch categories from Supabase', e);
    return null;
  }
};

export const syncCategoriesToSupabase = async (
  categories: Category[]
): Promise<boolean> => {
  const client = getSupabase();
  if (!client) return false;

  try {
    const rows = categories.map((c) => ({
      id: c.id,
      name: c.name,
      icon: c.icon,
      color: c.color || null,
      updated_at: new Date().toISOString(),
    }));
    const { error } = await client.from('categories').upsert(rows, { onConflict: 'id' });
    return !error;
  } catch (e) {
    console.error('Failed to sync categories to Supabase', e);
    return false;
  }
};

/**
 * Fetch Offers from Supabase
 */
export const fetchOffersFromSupabase = async (): Promise<Offer[] | null> => {
  const client = getSupabase();
  if (!client) return null;

  try {
    const { data, error } = await client.from('offers').select('*').order('id', { ascending: true });
    if (error || !data || data.length === 0) return null;
    return data.map((o: any) => ({
      id: o.id,
      code: o.code,
      title: o.title,
      description: o.description || '',
      discountType: o.discount_type || 'percentage',
      discountValue: Number(o.discount_value),
      minOrder: Number(o.min_order || 0),
      maxDiscount: o.max_discount ? Number(o.max_discount) : undefined,
      bannerGradient: o.banner_gradient || 'from-red-600 via-rose-600 to-amber-600',
      active: Boolean(o.active),
    }));
  } catch (e) {
    console.error('Failed to fetch offers from Supabase', e);
    return null;
  }
};

export const syncOffersToSupabase = async (offers: Offer[]): Promise<boolean> => {
  const client = getSupabase();
  if (!client) return false;

  try {
    const rows = offers.map((o) => ({
      id: o.id,
      code: o.code,
      title: o.title,
      description: o.description,
      discount_type: o.discountType,
      discount_value: o.discountValue,
      min_order: o.minOrder,
      max_discount: o.maxDiscount || null,
      banner_gradient: o.bannerGradient,
      active: o.active,
      updated_at: new Date().toISOString(),
    }));
    const { error } = await client.from('offers').upsert(rows, { onConflict: 'id' });
    return !error;
  } catch (e) {
    console.error('Failed to sync offers to Supabase', e);
    return false;
  }
};

/**
 * Complete SQL Migration Script for Supabase SQL Editor
 */
export const SUPABASE_SETUP_SQL = `-- 🍕 PIZZA XPRESS SUPABASE DATABASE SCHEMA
-- Instructions:
-- 1. Go to your Supabase Project Dashboard -> SQL Editor
-- 2. Paste this entire script and click "RUN"
-- 3. Everything will be created with Row Level Security enabled

-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  discount_price NUMERIC,
  category TEXT NOT NULL,
  is_veg BOOLEAN DEFAULT TRUE,
  is_available BOOLEAN DEFAULT TRUE,
  image_url TEXT,
  rating NUMERIC DEFAULT 4.8,
  rating_count INTEGER DEFAULT 100,
  badge TEXT,
  sizes JSONB,
  crusts JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '🍽️',
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. OFFERS TABLE
CREATE TABLE IF NOT EXISTS public.offers (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  discount_type TEXT DEFAULT 'percentage',
  discount_value NUMERIC NOT NULL,
  min_order NUMERIC DEFAULT 0,
  max_discount NUMERIC,
  banner_gradient TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. STORE SETTINGS TABLE (Single row 'primary')
CREATE TABLE IF NOT EXISTS public.store_settings (
  id TEXT PRIMARY KEY DEFAULT 'primary',
  store_name TEXT NOT NULL DEFAULT 'Pizza Xpress',
  tagline TEXT DEFAULT '100% Pure Veg • Hot, Cheesy & Fast!',
  whatsapp_number TEXT DEFAULT '9608995300',
  store_location TEXT DEFAULT 'Thakur Tolli, PIN 835223',
  store_address TEXT DEFAULT 'Near Main Chowk, Thakur Tolli, Jharkhand',
  pincode TEXT DEFAULT '835223',
  delivery_charge NUMERIC DEFAULT 35,
  free_delivery_above NUMERIC DEFAULT 299,
  is_open BOOLEAN DEFAULT TRUE,
  opening_hours TEXT DEFAULT '10:30 AM - 11:30 PM (Daily)',
  upi_id TEXT DEFAULT '9608995300@upi',
  upi_payee_name TEXT DEFAULT 'Pizza Xpress',
  support_phone TEXT DEFAULT '9608995300',
  show_offers_banner BOOLEAN DEFAULT FALSE,
  logo_text TEXT DEFAULT 'PIZZA XPRESS',
  logo_badge TEXT DEFAULT 'PX',
  logo_icon_url TEXT,
  announcement_text TEXT,
  primary_color TEXT DEFAULT '#dc2626',
  accent_color TEXT DEFAULT '#f59e0b',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ORDERS LOG TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  address TEXT,
  landmark TEXT,
  order_type TEXT DEFAULT 'delivery',
  payment_method TEXT DEFAULT 'cod',
  items JSONB,
  subtotal NUMERIC,
  discount NUMERIC DEFAULT 0,
  delivery_fee NUMERIC DEFAULT 0,
  grand_total NUMERIC,
  whatsapp_message TEXT,
  status TEXT DEFAULT 'pending'
);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ POLICIES (Allows visitors to view menu & settings)
CREATE POLICY "Allow public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow public read offers" ON public.offers FOR SELECT USING (true);
CREATE POLICY "Allow public read store_settings" ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "Allow public read orders" ON public.orders FOR SELECT USING (true);

-- PUBLIC/ANON WRITE POLICIES (Allows admin and customer orders with Anon key)
CREATE POLICY "Allow all write products" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all write categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all write offers" ON public.offers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all write store_settings" ON public.store_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all write orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

-- ENABLE REALTIME (So saved changes in Supabase update live website instantly!)
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.store_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.offers;
`;
