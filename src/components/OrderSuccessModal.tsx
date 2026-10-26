import React, { useState } from 'react';
import { Order, StoreSettings } from '../types';
import {
  Copy,
  ExternalLink,
  Clock,
  AlertTriangle,
  QrCode,
  ArrowLeft,
  ShoppingBag,
  Check,
  X,
  MessageCircle,
  Hourglass,
  Send,
  ChefHat,
  Info,
} from 'lucide-react';

interface OrderSuccessModalProps {
  isOpen: boolean;
  order: Order | null;
  settings: StoreSettings;
  onCloseAndBackToMenu: () => void;
  onOpenCart: () => void;
  onShowUpiQr: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  isOpen,
  order,
  settings,
  onCloseAndBackToMenu,
  onOpenCart,
  onShowUpiQr,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !order) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(order.whatsappMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const cleanPhone = settings.whatsappNumber.replace(/[^0-9]/g, '');
  const targetNumber =
    cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const whatsAppUrl = `https://wa.me/${targetNumber}?text=${encodeURIComponent(
    order.whatsappMessage
  )}`;

  const handleOpenWhatsAppAgain = () => {
    window.open(whatsAppUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      onClick={onCloseAndBackToMenu}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-lg max-h-[94vh] flex flex-col overflow-hidden shadow-2xl relative"
      >
        {/* Top-Right Close Button */}
        <button
          onClick={onCloseAndBackToMenu}
          className="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-neutral-300 hover:text-white flex items-center justify-center transition cursor-pointer border border-white/10"
          title="Close / Back to Menu"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* PROMINENT PENDING STATUS HEADER */}
        <div className="bg-gradient-to-b from-amber-950/80 via-neutral-900 to-neutral-900 p-5 text-center relative border-b border-amber-900/40 shrink-0">
          {/* Animated Status Pill */}
          <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/50 text-amber-300 text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider mb-3 shadow-inner">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400"></span>
            </span>
            <span>STATUS: PENDING CONFIRMATION</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Order Needs WhatsApp Confirmation
          </h2>

          <p className="text-xs text-neutral-300 mt-1 max-w-sm mx-auto leading-relaxed">
            Your order details have been drafted. <strong className="text-amber-400 font-bold">Pizza Xpress has not started preparation yet.</strong>
          </p>

          {/* Order ID Pill */}
          <div className="mt-2.5 inline-block bg-neutral-950 px-3 py-1 rounded-lg border border-neutral-800 text-[11px] font-mono text-neutral-400">
            Order Reference: <strong className="text-white">#{order.orderNumber}</strong>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs text-neutral-300">
          {/* 3-STEP VISUAL PROGRESS FLOW */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-3.5 space-y-3">
            <div className="flex items-center justify-between text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              <span>Order Progress</span>
              <span className="text-amber-400">Step 2 of 3</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
              {/* Step 1 */}
              <div className="flex flex-col items-center p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/40">
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold mb-1">
                  <Check className="w-4 h-4" />
                </div>
                <span className="font-bold text-emerald-300">1. Drafted</span>
                <span className="text-[10px] text-neutral-400">Order saved</span>
              </div>

              {/* Step 2 - Active / Action Required */}
              <div className="flex flex-col items-center p-2 rounded-xl bg-amber-950/50 border-2 border-amber-500 shadow-md shadow-amber-950/50">
                <div className="w-7 h-7 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center font-black mb-1 animate-pulse">
                  <Send className="w-3.5 h-3.5" />
                </div>
                <span className="font-black text-amber-300">2. Send Chat</span>
                <span className="text-[10px] text-amber-200 font-semibold">Action Required</span>
              </div>

              {/* Step 3 - Pending Restaurant */}
              <div className="flex flex-col items-center p-2 rounded-xl bg-neutral-900 border border-neutral-800 opacity-60">
                <div className="w-7 h-7 rounded-full bg-neutral-800 text-neutral-400 flex items-center justify-center font-bold mb-1">
                  <ChefHat className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-neutral-400">3. Confirmed</span>
                <span className="text-[10px] text-neutral-500">Kitchen bakes</span>
              </div>
            </div>
          </div>

          {/* HIGH-IMPACT WARNING / NOTICE BANNER */}
          <div className="bg-gradient-to-r from-amber-950/60 to-red-950/50 border border-amber-500/50 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Mandatory: Send WhatsApp Message</span>
            </div>
            <p className="text-xs text-neutral-200 leading-relaxed">
              To complete your order, tap the green button below and <strong>hit 'Send' on WhatsApp to Pizza Xpress ({settings.whatsappNumber})</strong>.
            </p>
            <p className="text-[11px] text-amber-200/90 leading-relaxed pt-0.5 border-t border-amber-500/20">
              📌 The restaurant will review your message, accept it in chat, and provide the exact delivery/prep timing.
            </p>
          </div>

          {/* GIANT PRIMARY ACTION: SEND ON WHATSAPP */}
          <button
            onClick={handleOpenWhatsAppAgain}
            className="w-full bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-600 hover:from-emerald-400 hover:to-green-500 text-white font-black py-4 px-4 rounded-2xl shadow-xl shadow-green-950/80 flex items-center justify-between text-sm transition-all transform hover:scale-[1.01] active:scale-95 cursor-pointer ring-2 ring-emerald-400/40"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <span className="block text-xs uppercase tracking-wider font-bold text-emerald-100">
                  Tap to Confirm
                </span>
                <span className="font-black text-sm">Send Order on WhatsApp</span>
              </div>
            </div>
            <ExternalLink className="w-5 h-5 text-white/90" />
          </button>

          {/* UPI Payment Button if applicable */}
          {order.paymentMethod === 'upi' && (
            <button
              onClick={onShowUpiQr}
              className="w-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black py-2.5 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 text-xs transition cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>View UPI QR Code (Pay ₹{order.grandTotal})</span>
            </button>
          )}

          {/* Copy Message Text Backup */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-neutral-400 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-neutral-400" />
                Pre-formatted Message Preview
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>
            <pre className="text-[11px] font-mono text-neutral-400 bg-neutral-900/90 p-3 rounded-xl overflow-x-auto whitespace-pre-wrap max-h-32 no-scrollbar border border-neutral-800">
              {order.whatsappMessage}
            </pre>
          </div>

          {/* Order Summary Snapshot */}
          <div className="bg-neutral-950/80 border border-neutral-800 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-xs uppercase tracking-wider text-neutral-400">
                Order Summary
              </h4>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-900/50">
                🟡 Pending Acceptance
              </span>
            </div>

            <div className="flex justify-between text-neutral-300">
              <span>Customer</span>
              <span className="font-semibold text-white">
                {order.customerName} ({order.customerPhone})
              </span>
            </div>
            <div className="flex justify-between text-neutral-300">
              <span>Order Type</span>
              <span className="font-semibold text-white capitalize">
                {order.orderType === 'delivery'
                  ? '🛵 Home Delivery'
                  : '🛍️ Takeaway'}
              </span>
            </div>
            <div className="flex justify-between text-neutral-300">
              <span>Items Total</span>
              <span className="font-semibold text-white">₹{order.subtotal}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Discount</span>
                <span className="font-semibold">-₹{order.discount}</span>
              </div>
            )}
            <div className="flex justify-between text-neutral-300">
              <span>Delivery Fee</span>
              <span className="font-semibold text-white">
                {order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}
              </span>
            </div>
            <div className="pt-2 border-t border-neutral-800 flex justify-between font-black text-sm text-amber-400">
              <span>Grand Total</span>
              <span>₹{order.grandTotal}</span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 grid grid-cols-2 gap-2 shrink-0">
          <button
            onClick={onCloseAndBackToMenu}
            className="flex items-center justify-center gap-1.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Menu</span>
          </button>

          <button
            onClick={onOpenCart}
            className="flex items-center justify-center gap-1.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
            <span>View Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
};
