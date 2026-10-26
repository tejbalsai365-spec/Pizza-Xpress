import React, { useState, useEffect, useMemo } from 'react';
import {
  CartItem,
  CheckoutFormData,
  CrustOption,
  Order,
  Product,
  SizeOption,
} from './types';
import {
  buildWhatsAppOrder,
  getStoredCategories,
  getStoredOffers,
  getStoredOrders,
  getStoredProducts,
  getStoredSettings,
  saveOrder,
  saveProducts,
  saveCategories,
  saveOffers,
  saveSettings,
  updateOrderStatus,
} from './services/storeService';
import { Header } from './components/Header';
import { BannerSlider } from './components/BannerSlider';
import { CategoryBar } from './components/CategoryBar';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { UpiQrModal } from './components/UpiQrModal';
import { AdminPanel } from './components/AdminPanel';
import {
  ShoppingBag,
  ArrowRight,
  Sparkles,
  PhoneCall,
  Clock,
  ShieldCheck,
  ChevronRight,
  MessageCircle,
} from 'lucide-react';

export default function App() {
  // Store Data
  const [products, setProducts] = useState<Product[]>(getStoredProducts);
  const [categories, setCategories] = useState(getStoredCategories);
  const [offers, setOffers] = useState(getStoredOffers);
  const [settings, setSettings] = useState(getStoredSettings);
  const [orders, setOrders] = useState<Order[]>(getStoredOrders);

  // Cart & UI State
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('pizza_xpress_active_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isVegOnly, setIsVegOnly] = useState(false);
  const [isNonVegOnly, setIsNonVegOnly] = useState(false);

  // Modals
  const [selectedProductForDetail, setSelectedProductForDetail] =
    useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isUpiQrOpen, setIsUpiQrOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);
  const [isOrderSuccessOpen, setIsOrderSuccessOpen] = useState(false);

  // Sync cart to storage
  useEffect(() => {
    try {
      localStorage.setItem('pizza_xpress_active_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error(e);
    }
  }, [cartItems]);

  // Cart calculations
  const cartCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [cartItems]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.totalPrice, 0);
  }, [cartItems]);

  const discount = useMemo(() => {
    if (!appliedCoupon) return 0;
    const offer = offers.find(
      (o) => o.code.toUpperCase() === appliedCoupon.toUpperCase() && o.active
    );
    if (!offer || subtotal < offer.minOrder) return 0;

    if (offer.discountType === 'percentage') {
      const raw = Math.round((subtotal * offer.discountValue) / 100);
      return offer.maxDiscount ? Math.min(raw, offer.maxDiscount) : raw;
    }
    return offer.discountValue;
  }, [appliedCoupon, offers, subtotal]);

  // Auto invalidate coupon if subtotal falls below requirement
  useEffect(() => {
    if (appliedCoupon) {
      const offer = offers.find(
        (o) => o.code.toUpperCase() === appliedCoupon.toUpperCase() && o.active
      );
      if (offer && subtotal < offer.minOrder) {
        setAppliedCoupon(undefined);
      }
    }
  }, [subtotal, appliedCoupon, offers]);

  const deliveryFee = useMemo(() => {
    if (cartItems.length === 0) return 0;
    if (subtotal >= settings.freeDeliveryAbove) return 0;
    return settings.deliveryCharge;
  }, [subtotal, settings, cartItems.length]);

  const grandTotal = useMemo(() => {
    if (cartItems.length === 0) return 0;
    return Math.max(0, subtotal - discount + deliveryFee);
  }, [subtotal, discount, deliveryFee, cartItems.length]);

  // Cart Actions
  const handleAddToCart = (
    product: Product,
    size?: SizeOption,
    crust?: CrustOption,
    qty: number = 1
  ) => {
    const basePrice = product.discountPrice || product.price;
    const sizePrice = size ? size.priceDelta : 0;
    const crustPrice = crust ? crust.priceDelta : 0;
    const unitPrice = basePrice + sizePrice + crustPrice;

    const cartItemId = `${product.id}-${size?.id || 'std'}-${crust?.id || 'std'}`;

    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.cartItemId === cartItemId
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + qty;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          totalPrice: unitPrice * newQty,
        };
        return updated;
      }
      return [
        ...prev,
        {
          cartItemId,
          product,
          quantity: qty,
          selectedSize: size,
          selectedCrust: crust,
          unitPrice,
          totalPrice: unitPrice * qty,
        },
      ];
    });
  };

  const handleIncreaseCartQuantity = (cartItemId: string) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.cartItemId === cartItemId) {
          const newQty = item.quantity + 1;
          return {
            ...item,
            quantity: newQty,
            totalPrice: item.unitPrice * newQty,
          };
        }
        return item;
      })
    );
  };

  const handleDecreaseCartQuantity = (cartItemId: string) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.quantity - 1;
            return newQty > 0
              ? {
                  ...item,
                  quantity: newQty,
                  totalPrice: item.unitPrice * newQty,
                }
              : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveFromCart = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
  };

  const handleClearCart = () => {
    setCartItems([]);
    setAppliedCoupon(undefined);
  };

  // Helper for quick product card clicks (for items without customizations)
  const getProductCartCount = (productId: string) => {
    return cartItems
      .filter((i) => i.product.id === productId)
      .reduce((sum, i) => sum + i.quantity, 0);
  };

  // Checkout & WhatsApp Integration
  const handleCheckoutSubmit = (formData: CheckoutFormData) => {
    const orderNumber = `PX-${Math.floor(1000 + Math.random() * 9000)}`;
    const finalDelFee = formData.orderType === 'delivery' ? deliveryFee : 0;
    const finalTotal = Math.max(0, subtotal - discount + finalDelFee);

    const { messageText, whatsAppUrl } = buildWhatsAppOrder(
      orderNumber,
      formData,
      cartItems,
      subtotal,
      discount,
      appliedCoupon,
      finalDelFee,
      finalTotal,
      settings
    );

    const newOrder: Order = {
      id: `order-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        day: 'numeric',
        month: 'short',
      }),
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      address: formData.address,
      landmark: formData.landmark,
      mapLink: formData.mapLink,
      orderType: formData.orderType,
      paymentMethod: formData.paymentMethod,
      instructions: formData.instructions,
      items: [...cartItems],
      subtotal,
      discount,
      appliedCoupon,
      deliveryFee: finalDelFee,
      grandTotal: finalTotal,
      whatsappMessage: messageText,
      status: 'pending',
    };

    // Save order in history
    saveOrder(newOrder);
    setOrders((prev) => [newOrder, ...prev]);
    setLastPlacedOrder(newOrder);

    // Launch WhatsApp
    window.open(whatsAppUrl, '_blank', 'noopener,noreferrer');

    // Close checkout and display clear order confirmation screen
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    setIsOrderSuccessOpen(true);

    // Clear cart
    handleClearCart();
  };

  // Product Filtering
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesCat = item.category.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesCat) return false;
      }

      // Category
      if (selectedCategory && selectedCategory !== 'All') {
        if (item.category.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
      }

      // Veg only
      if (isVegOnly && !item.isVeg) return false;

      // Non-veg only
      if (isNonVegOnly && item.isVeg) return false;

      return true;
    });
  }, [products, searchQuery, selectedCategory, isVegOnly, isNonVegOnly]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between selection:bg-red-600 selection:text-white">
      {/* Top Header */}
      <Header
        settings={settings}
        cartCount={cartCount}
        cartTotal={grandTotal}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isVegOnly={isVegOnly}
        onToggleVegOnly={() => {
          setIsVegOnly(!isVegOnly);
          if (!isVegOnly) setIsNonVegOnly(false);
        }}
        isNonVegOnly={isNonVegOnly}
        onToggleNonVegOnly={() => {
          setIsNonVegOnly(!isNonVegOnly);
          if (!isNonVegOnly) setIsVegOnly(false);
        }}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto pb-24">
        {/* Promotional Banner Carousel (Optional - hidden by default, can be enabled in Admin) */}
        {Boolean(settings.showOffersBanner) && !searchQuery && (
          <BannerSlider
            offers={offers}
            onApplyCoupon={(code) => {
              setAppliedCoupon(code);
              setIsCartOpen(true);
            }}
            appliedCoupon={appliedCoupon}
          />
        )}

        {/* Categories Bar */}
        <CategoryBar
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          categoryCounts={categoryCounts}
        />

        {/* Menu Section Title */}
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
              {selectedCategory || 'Popular Treats'}
              <span className="text-xs font-normal text-neutral-400">
                ({filteredProducts.length} items)
              </span>
            </h2>
            <p className="text-[11px] text-neutral-400">
              Freshly baked upon your order with 100% real dairy mozzarella
            </p>
          </div>

          {(searchQuery || selectedCategory) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('');
              }}
              className="text-xs text-red-400 hover:text-red-300 font-bold cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Products Grid */}
        <div className="px-4 py-2">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 px-4 bg-neutral-900/40 rounded-2xl border border-neutral-800">
              <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center text-3xl mx-auto mb-3">
                🔍
              </div>
              <h3 className="font-bold text-base text-white">
                No matching food items found
              </h3>
              <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto">
                Try searching for something else or clear the filters to explore
                our full menu!
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('');
                  setIsVegOnly(false);
                  setIsNonVegOnly(false);
                }}
                className="mt-4 bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-4 py-2 rounded-xl cursor-pointer"
              >
                Show All Items
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  quantityInCart={getProductCartCount(product.id)}
                  onAddToCart={(p) => {
                    if (
                      (p.sizes && p.sizes.length > 0) ||
                      (p.crusts && p.crusts.length > 0)
                    ) {
                      setSelectedProductForDetail(p);
                    } else {
                      handleAddToCart(p);
                    }
                  }}
                  onIncreaseQuantity={(p) => handleAddToCart(p)}
                  onDecreaseQuantity={(p) => {
                    const found = cartItems.find(
                      (item) => item.product.id === p.id
                    );
                    if (found) handleDecreaseCartQuantity(found.cartItemId);
                  }}
                  onOpenDetails={(p) => setSelectedProductForDetail(p)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Bottom Store Footer Details */}
        <div className="mt-8 px-4 py-6 border-t border-neutral-900 text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <span className="font-black text-white text-base">
              PIZZA <span className="text-red-500">XPRESS</span>
            </span>
            <span className="text-neutral-600">•</span>
            <span className="text-xs text-neutral-400">Thakur Tolli Kitchen</span>
          </div>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Order directly via WhatsApp at{' '}
            <strong className="text-amber-400">{settings.whatsappNumber}</strong>.
            Hot and fresh delivery straight to your doorstep.
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-neutral-400">
            <button
              onClick={() => setIsAdminOpen(true)}
              className="hover:text-white underline cursor-pointer"
            >
              Owner Admin Login
            </button>
            <span>•</span>
            <a
              href={`https://wa.me/91${settings.whatsappNumber.replace(
                /[^0-9]/g,
                ''
              )}`}
              target="_blank"
              rel="noreferrer"
              className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Direct WhatsApp Help</span>
            </a>
          </div>
        </div>
      </main>

      {/* Floating Bottom Cart Bar (Zomato style) */}
      {cartCount > 0 && !isCartOpen && (
        <div className="fixed bottom-4 inset-x-0 z-40 max-w-md mx-auto px-4">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white rounded-2xl p-3.5 shadow-2xl shadow-red-950/80 flex items-center justify-between transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer ring-1 ring-white/20"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-black/40 backdrop-blur-sm flex items-center justify-center text-white font-bold relative">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-amber-400 text-neutral-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              </div>
              <div className="text-left">
                <span className="text-[11px] block uppercase tracking-wider font-bold text-white/90">
                  {cartCount} {cartCount === 1 ? 'Item' : 'Items'} Added
                </span>
                <span className="text-base font-black">₹{grandTotal}</span>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-black/30 backdrop-blur-sm px-3.5 py-1.5 rounded-xl font-black text-xs">
              <span>View Cart</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* Product Detail Customization Modal */}
      <ProductDetailModal
        product={selectedProductForDetail}
        onClose={() => setSelectedProductForDetail(null)}
        onConfirmAdd={(product, size, crust, qty) => {
          handleAddToCart(product, size, crust, qty);
        }}
      />

      {/* Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onIncreaseQuantity={handleIncreaseCartQuantity}
        onDecreaseQuantity={handleDecreaseCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        subtotal={subtotal}
        deliveryFee={deliveryFee}
        discount={discount}
        grandTotal={grandTotal}
        appliedCoupon={appliedCoupon}
        onApplyCoupon={(code) => setAppliedCoupon(code)}
        onRemoveCoupon={() => setAppliedCoupon(undefined)}
        offers={offers}
        settings={settings}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Checkout Screen */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        subtotal={subtotal}
        deliveryFee={deliveryFee}
        discount={discount}
        grandTotal={grandTotal}
        settings={settings}
        onSubmitOrder={handleCheckoutSubmit}
      />

      {/* Order Prepared for WhatsApp Confirmation Screen */}
      <OrderSuccessModal
        isOpen={isOrderSuccessOpen}
        order={lastPlacedOrder}
        settings={settings}
        onCloseAndBackToMenu={() => {
          setIsOrderSuccessOpen(false);
          setLastPlacedOrder(null);
        }}
        onOpenCart={() => {
          setIsOrderSuccessOpen(false);
          setLastPlacedOrder(null);
          setIsCartOpen(true);
        }}
        onShowUpiQr={() => setIsUpiQrOpen(true)}
      />

      {/* UPI QR Payment Modal */}
      <UpiQrModal
        isOpen={isUpiQrOpen}
        onClose={() => setIsUpiQrOpen(false)}
        amount={lastPlacedOrder?.grandTotal || grandTotal}
        settings={settings}
        orderNumber={lastPlacedOrder?.orderNumber}
      />

      {/* Admin & Menu Manager Panel */}
      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        products={products}
        onUpdateProducts={(updated) => {
          setProducts(updated);
          saveProducts(updated);
        }}
        categories={categories}
        onUpdateCategories={(updated) => {
          setCategories(updated);
          saveCategories(updated);
        }}
        offers={offers}
        onUpdateOffers={(updated) => {
          setOffers(updated);
          saveOffers(updated);
        }}
        settings={settings}
        onUpdateSettings={(updated) => {
          setSettings(updated);
          saveSettings(updated);
        }}
        orders={orders}
        onUpdateOrderStatus={(orderId, status) => {
          updateOrderStatus(orderId, status);
          setOrders(getStoredOrders());
        }}
      />
    </div>
  );
}
