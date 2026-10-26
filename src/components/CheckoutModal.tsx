import React, { useState } from 'react';
import { CheckoutFormData, StoreSettings } from '../types';
import {
  X,
  Bike,
  ShoppingBag,
  CreditCard,
  Banknote,
  MapPin,
  Phone,
  User,
  Compass,
  Link as LinkIcon,
  MessageSquare,
  AlertCircle,
  QrCode,
  ShieldAlert,
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  grandTotal: number;
  settings: StoreSettings;
  onSubmitOrder: (formData: CheckoutFormData) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  subtotal,
  deliveryFee,
  discount,
  grandTotal,
  settings,
  onSubmitOrder,
}) => {
  const [formData, setFormData] = useState<CheckoutFormData>({
    customerName: '',
    customerPhone: '',
    address: '',
    landmark: '',
    mapLink: '',
    orderType: 'delivery',
    paymentMethod: 'cod',
    instructions: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showUpiPreview, setShowUpiPreview] = useState(false);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.customerName.trim()) {
      errs.customerName = 'Please enter your full name';
    }
    const cleanPhone = formData.customerPhone.replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      errs.customerPhone = 'Please enter a valid 10-digit mobile number';
    }

    if (formData.orderType === 'delivery') {
      if (!formData.address.trim() || formData.address.trim().length < 8) {
        errs.address = 'Please provide full house/flat, street or area address';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmitOrder(formData);
  };

  const calculatedDeliveryFee =
    formData.orderType === 'delivery' ? deliveryFee : 0;
  const finalGrandTotal = subtotal - discount + calculatedDeliveryFee;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-neutral-900 border border-neutral-800 rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="p-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <span className="text-red-500">🍕</span> Checkout & Delivery
            </h2>
            <p className="text-xs text-neutral-400">
              Provide delivery info to send your order on WhatsApp
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800 text-neutral-300 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 text-xs text-neutral-300">
          {/* Order Type Toggle: Delivery vs Takeaway */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase tracking-wider text-amber-400">
              1. Choose Order Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, orderType: 'delivery' })
                }
                className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl border font-bold text-xs transition cursor-pointer ${
                  formData.orderType === 'delivery'
                    ? 'border-red-500 bg-red-950/40 text-white shadow-sm'
                    : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                }`}
              >
                <Bike className="w-4 h-4 text-red-500" />
                <span>Home Delivery</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, orderType: 'takeaway' })
                }
                className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl border font-bold text-xs transition cursor-pointer ${
                  formData.orderType === 'takeaway'
                    ? 'border-red-500 bg-red-950/40 text-white shadow-sm'
                    : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                }`}
              >
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <span>Takeaway / Pickup</span>
              </button>
            </div>
            {formData.orderType === 'takeaway' && (
              <p className="text-[11px] text-amber-300 bg-amber-950/30 p-2 rounded-lg border border-amber-900/50">
                📍 Pickup from: <strong>{settings.storeAddress}</strong>
              </p>
            )}
          </div>

          {/* Customer Personal Details */}
          <div className="space-y-3">
            <label className="text-[11px] font-black uppercase tracking-wider text-amber-400">
              2. Customer Contact
            </label>

            <div>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) =>
                    setFormData({ ...formData, customerName: e.target.value })
                  }
                  placeholder="Your Full Name *"
                  className={`w-full bg-neutral-950 text-white text-xs pl-9 pr-3 py-2.5 rounded-xl border focus:outline-none focus:border-red-500 transition ${
                    errors.customerName
                      ? 'border-red-500 ring-1 ring-red-500'
                      : 'border-neutral-800'
                  }`}
                />
              </div>
              {errors.customerName && (
                <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.customerName}
                </p>
              )}
            </div>

            <div>
              <div className="relative">
                <Phone className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  maxLength={10}
                  value={formData.customerPhone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      customerPhone: e.target.value.replace(/[^0-9]/g, ''),
                    })
                  }
                  placeholder="10-digit Mobile Number *"
                  className={`w-full bg-neutral-950 text-white text-xs pl-9 pr-3 py-2.5 rounded-xl border focus:outline-none focus:border-red-500 transition ${
                    errors.customerPhone
                      ? 'border-red-500 ring-1 ring-red-500'
                      : 'border-neutral-800'
                  }`}
                />
              </div>
              {errors.customerPhone && (
                <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.customerPhone}
                </p>
              )}
            </div>
          </div>

          {/* Delivery Address (only for Home Delivery) */}
          {formData.orderType === 'delivery' && (
            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase tracking-wider text-amber-400">
                3. Delivery Address
              </label>

              <div>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                  <textarea
                    rows={2}
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    placeholder="House / Flat No., Street, Colony, Thakur Tolli *"
                    className={`w-full bg-neutral-950 text-white text-xs pl-9 pr-3 py-2.5 rounded-xl border focus:outline-none focus:border-red-500 transition ${
                      errors.address
                        ? 'border-red-500 ring-1 ring-red-500'
                        : 'border-neutral-800'
                    }`}
                  />
                </div>
                {errors.address && (
                  <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.address}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="relative">
                  <Compass className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={formData.landmark}
                    onChange={(e) =>
                      setFormData({ ...formData, landmark: e.target.value })
                    }
                    placeholder="Landmark (e.g. Near School)"
                    className="w-full bg-neutral-950 text-white text-xs pl-9 pr-3 py-2.5 rounded-xl border border-neutral-800 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="relative">
                  <LinkIcon className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={formData.mapLink}
                    onChange={(e) =>
                      setFormData({ ...formData, mapLink: e.target.value })
                    }
                    placeholder="Google Maps link (optional)"
                    className="w-full bg-neutral-950 text-white text-xs pl-9 pr-3 py-2.5 rounded-xl border border-neutral-800 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Payment Method */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase tracking-wider text-amber-400">
              {formData.orderType === 'delivery' ? '4.' : '3.'} Payment Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, paymentMethod: 'cod' })
                }
                className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl border font-bold text-xs transition cursor-pointer ${
                  formData.paymentMethod === 'cod'
                    ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
                    : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                }`}
              >
                <Banknote className="w-4 h-4 text-emerald-400" />
                <span>Cash on Delivery</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFormData({ ...formData, paymentMethod: 'upi' });
                  setShowUpiPreview(true);
                }}
                className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl border font-bold text-xs transition cursor-pointer ${
                  formData.paymentMethod === 'upi'
                    ? 'border-amber-500 bg-amber-950/40 text-amber-300'
                    : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                }`}
              >
                <QrCode className="w-4 h-4 text-amber-400" />
                <span>UPI QR / Online</span>
              </button>
            </div>

            {formData.paymentMethod === 'upi' && (
              <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 space-y-1">
                <p className="text-[11px] text-amber-300 font-bold flex items-center gap-1">
                  <QrCode className="w-3.5 h-3.5" /> UPI ID: {settings.upiId}
                </p>
                <p className="text-[10px] text-neutral-400">
                  You can scan the QR code before or after sending your order on
                  WhatsApp.
                </p>
              </div>
            )}
          </div>

          {/* Special Instructions */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase tracking-wider text-amber-400">
              Special Cooking or Delivery Notes
            </label>
            <div className="relative">
              <MessageSquare className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
              <textarea
                rows={2}
                value={formData.instructions}
                onChange={(e) =>
                  setFormData({ ...formData, instructions: e.target.value })
                }
                placeholder="e.g. Less spicy, extra oregano sachets, ring the doorbell..."
                className="w-full bg-neutral-950 text-white text-xs pl-9 pr-3 py-2.5 rounded-xl border border-neutral-800 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Notice Banner */}
          <div className="bg-red-950/30 border border-red-900/50 rounded-xl p-3 flex items-start gap-2 text-neutral-300">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              Tapping the button below generates your order and opens WhatsApp
              to <strong>{settings.whatsappNumber}</strong>. Your order is confirmed
              once Pizza Xpress accepts it on chat!
            </p>
          </div>
        </form>

        {/* Sticky Action Footer */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between gap-3 shrink-0">
          <div>
            <span className="text-[10px] block text-neutral-400 uppercase tracking-wider">
              Payable Amount
            </span>
            <span className="text-xl font-black text-amber-400">
              ₹{finalGrandTotal}
            </span>
          </div>

          <button
            onClick={handleSubmit}
            className="flex-1 max-w-xs bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 active:scale-95 text-white font-black py-3.5 px-4 rounded-2xl shadow-xl shadow-green-950 flex items-center justify-center gap-2 text-sm transition cursor-pointer"
          >
            <span>Place Order on WhatsApp</span>
            <span className="text-base">🚀</span>
          </button>
        </div>
      </div>
    </div>
  );
};
