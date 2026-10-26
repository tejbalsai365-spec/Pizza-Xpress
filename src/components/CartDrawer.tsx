import React, { useState } from 'react';
import { CartItem, Offer, StoreSettings } from '../types';
import {
  X,
  Trash2,
  Plus,
  Minus,
  Tag,
  ArrowRight,
  ShoppingBag,
  Bike,
  Check,
  AlertCircle,
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onIncreaseQuantity: (cartItemId: string) => void;
  onDecreaseQuantity: (cartItemId: string) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  grandTotal: number;
  appliedCoupon?: string;
  onApplyCoupon: (code: string) => void;
  onRemoveCoupon: () => void;
  offers: Offer[];
  settings: StoreSettings;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onIncreaseQuantity,
  onDecreaseQuantity,
  onRemoveItem,
  onClearCart,
  subtotal,
  deliveryFee,
  discount,
  grandTotal,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  offers,
  settings,
  onProceedToCheckout,
}) => {
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  if (!isOpen) return null;

  const handleApplyCoupon = (codeToApply?: string) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    if (!code) return;

    const offer = offers.find(
      (o) => o.code.toUpperCase() === code && o.active
    );
    if (!offer) {
      setCouponError('Invalid coupon code');
      return;
    }
    if (subtotal < offer.minOrder) {
      setCouponError(`Min order of ₹${offer.minOrder} required for ${code}`);
      return;
    }

    setCouponError('');
    onApplyCoupon(code);
    setCouponInput('');
  };

  const amountNeededForFreeDelivery = Math.max(
    0,
    settings.freeDeliveryAbove - subtotal
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-neutral-900 border-l border-neutral-800 flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-500 flex items-center justify-center font-bold">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-black text-white">Your Cart</h2>
                <p className="text-xs text-neutral-400">
                  {items.length} {items.length === 1 ? 'item' : 'items'} in order
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <button
                  onClick={onClearCart}
                  className="text-xs text-neutral-400 hover:text-red-400 px-2 py-1 rounded transition cursor-pointer"
                  title="Clear Cart"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-neutral-800 text-neutral-300 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Delivery threshold progress bar */}
          {items.length > 0 && (
            <div className="bg-neutral-950/80 px-4 py-2 border-b border-neutral-800">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="flex items-center gap-1.5 text-neutral-300 font-medium">
                  <Bike className="w-3.5 h-3.5 text-amber-400" />
                  {amountNeededForFreeDelivery === 0 ? (
                    <span className="text-emerald-400 font-bold">
                      🎉 You unlocked FREE Delivery!
                    </span>
                  ) : (
                    <span>
                      Add <strong className="text-amber-400">₹{amountNeededForFreeDelivery}</strong> more for Free Delivery
                    </span>
                  )}
                </span>
                <span className="text-[11px] text-neutral-500">
                  Goal: ₹{settings.freeDeliveryAbove}
                </span>
              </div>
              <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      100,
                      (subtotal / settings.freeDeliveryAbove) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Main Body */}
          {items.length === 0 ? (
            /* Empty Cart View */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-24 h-24 rounded-full bg-neutral-800/80 border border-neutral-700/50 flex items-center justify-center text-4xl mb-4 text-neutral-500 shadow-inner">
                🍕
              </div>
              <h3 className="text-lg font-black text-white mb-1">
                Your cart is empty
              </h3>
              <p className="text-xs text-neutral-400 max-w-xs mb-6">
                Good food is always just a few taps away. Explore our delicious
                pizzas, burgers, and sides!
              </p>
              <button
                onClick={onClose}
                className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs px-6 py-3 rounded-xl shadow-lg shadow-red-950 transition cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            /* Items List */
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.map((item) => (
                <div
                  key={item.cartItemId}
                  className="bg-neutral-950/70 border border-neutral-800/80 rounded-2xl p-3 flex items-start gap-3 transition hover:border-neutral-700"
                >
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 bg-neutral-800"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={
                            item.product.isVeg
                              ? 'veg-indicator scale-75'
                              : 'non-veg-indicator scale-75'
                          }
                        />
                        <h4 className="font-bold text-sm text-white truncate">
                          {item.product.name}
                        </h4>
                      </div>
                      <button
                        onClick={() => onRemoveItem(item.cartItemId)}
                        className="text-neutral-500 hover:text-red-400 p-1 transition cursor-pointer"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {(item.selectedSize || item.selectedCrust) && (
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        {[item.selectedSize?.name, item.selectedCrust?.name]
                          .filter(Boolean)
                          .join(' • ')}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-neutral-900">
                      <span className="font-black text-sm text-white">
                        ₹{item.totalPrice}
                      </span>

                      {/* Stepper */}
                      <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
                        <button
                          onClick={() => onDecreaseQuantity(item.cartItemId)}
                          className="px-2 py-1 text-neutral-300 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 font-black text-xs text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onIncreaseQuantity(item.cartItemId)}
                          className="px-2 py-1 text-neutral-300 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Coupon Section */}
              <div className="pt-2">
                <div className="bg-neutral-950/80 border border-neutral-800 rounded-2xl p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-neutral-300">
                    <span className="flex items-center gap-1.5 text-amber-400">
                      <Tag className="w-3.5 h-3.5" /> Apply Coupon
                    </span>
                    {appliedCoupon && (
                      <button
                        onClick={onRemoveCoupon}
                        className="text-[11px] text-red-400 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-emerald-950/40 border border-emerald-500/40 rounded-xl px-3 py-2 text-xs text-emerald-300">
                      <div className="flex items-center gap-1.5 font-bold">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>'{appliedCoupon}' Applied!</span>
                      </div>
                      <span className="font-black text-emerald-400">
                        -₹{discount}
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => {
                            setCouponInput(e.target.value);
                            setCouponError('');
                          }}
                          placeholder="Enter coupon code (e.g. WELCOME50)"
                          className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white uppercase placeholder-neutral-500 focus:outline-none focus:border-red-500"
                        />
                        <button
                          onClick={() => handleApplyCoupon()}
                          className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs px-3 py-2 rounded-xl transition cursor-pointer"
                        >
                          Apply
                        </button>
                      </div>
                      {couponError && (
                        <p className="text-[11px] text-red-400 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          {couponError}
                        </p>
                      )}

                      {/* Available quick chips */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {offers
                          .filter((o) => o.active)
                          .map((offer) => (
                            <button
                              key={offer.id}
                              onClick={() => handleApplyCoupon(offer.code)}
                              className="text-[10px] font-mono font-bold bg-neutral-900 hover:bg-amber-950/40 border border-neutral-800 hover:border-amber-500/40 text-amber-300 px-2 py-1 rounded-lg transition cursor-pointer"
                            >
                              {offer.code}
                            </button>
                          ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Bill Details */}
              <div className="bg-neutral-950/80 border border-neutral-800 rounded-2xl p-4 space-y-2 text-xs text-neutral-300">
                <h4 className="font-black text-xs uppercase tracking-wider text-neutral-400 mb-2">
                  Bill Summary
                </h4>

                <div className="flex justify-between">
                  <span className="text-neutral-400">Item Total</span>
                  <span className="font-semibold text-white">₹{subtotal}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Coupon Discount</span>
                    <span className="font-semibold">-₹{discount}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-neutral-400">Delivery Fee</span>
                  {deliveryFee === 0 ? (
                    <span className="font-bold text-emerald-400">FREE</span>
                  ) : (
                    <span className="font-semibold text-white">₹{deliveryFee}</span>
                  )}
                </div>

                <div className="pt-2 border-t border-neutral-800 flex justify-between items-baseline text-sm">
                  <span className="font-black text-white">Grand Total</span>
                  <span className="font-black text-lg text-amber-400">
                    ₹{grandTotal}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Footer Checkout CTA */}
          {items.length > 0 && (
            <div className="p-4 bg-neutral-950 border-t border-neutral-800 space-y-2 shrink-0">
              <button
                onClick={onProceedToCheckout}
                className="w-full bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 active:scale-95 text-white font-black py-3.5 px-4 rounded-2xl shadow-xl shadow-red-950 flex items-center justify-between transition cursor-pointer"
              >
                <div className="text-left">
                  <span className="text-[11px] block uppercase tracking-wider opacity-80">
                    Grand Total
                  </span>
                  <span className="text-lg font-black leading-none">
                    ₹{grandTotal}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-black text-sm">
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
