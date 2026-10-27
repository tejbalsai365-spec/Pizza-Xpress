export interface SizeOption {
  id: string;
  name: string; // e.g. "Regular (7\")", "Medium (9\")", "Large (12\")"
  priceDelta: number; // e.g. 0, 150, 280
}

export interface CrustOption {
  id: string;
  name: string; // e.g. "Classic Hand Tossed", "Cheese Burst", "Thin Crust"
  priceDelta: number; // e.g. 0, 80, 40
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string;
  isVeg: boolean;
  isAvailable: boolean;
  imageUrl: string;
  rating: number;
  ratingCount: number;
  badge?: string; // "Best Seller", "Chef's Special", "50% OFF"
  sizes?: SizeOption[];
  crusts?: CrustOption[];
}

export interface CartItem {
  cartItemId: string; // unique key combining product.id + size + crust
  product: Product;
  quantity: number;
  selectedSize?: SizeOption;
  selectedCrust?: CrustOption;
  unitPrice: number;
  totalPrice: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color?: string;
}

export interface Offer {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'flat';
  discountValue: number; // e.g. 20 for 20% or 100 for ₹100 flat
  minOrder: number;
  maxDiscount?: number;
  bannerGradient: string;
  active: boolean;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
  autoSync: boolean;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  whatsappNumber: string;
  storeLocation: string;
  storeAddress: string;
  pincode: string;
  deliveryCharge: number;
  freeDeliveryAbove: number;
  isOpen: boolean;
  openingHours: string;
  upiId: string;
  upiPayeeName: string;
  supportPhone: string;
  showOffersBanner?: boolean;
  // Visual & Branding Customization
  logoText?: string;
  logoBadge?: string;
  logoIconUrl?: string;
  announcementText?: string;
  primaryColor?: string;
  accentColor?: string;
  supabaseConfig?: SupabaseConfig;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  address: string;
  landmark: string;
  mapLink?: string;
  orderType: 'delivery' | 'takeaway';
  paymentMethod: 'cod' | 'upi';
  instructions?: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  appliedCoupon?: string;
  deliveryFee: number;
  grandTotal: number;
  whatsappMessage: string;
  status: 'pending' | 'accepted' | 'preparing' | 'delivered' | 'cancelled';
}

export interface CheckoutFormData {
  customerName: string;
  customerPhone: string;
  address: string;
  landmark: string;
  mapLink: string;
  orderType: 'delivery' | 'takeaway';
  paymentMethod: 'cod' | 'upi';
  instructions: string;
}
