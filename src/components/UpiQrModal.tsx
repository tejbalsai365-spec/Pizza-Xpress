import React, { useState } from 'react';
import { StoreSettings } from '../types';
import { X, Copy, Check, QrCode, Smartphone, ExternalLink } from 'lucide-react';

interface UpiQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  settings: StoreSettings;
  orderNumber?: string;
}

export const UpiQrModal: React.FC<UpiQrModalProps> = ({
  isOpen,
  onClose,
  amount,
  settings,
  orderNumber,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const upiId = settings.upiId || '9608995300@upi';
  const payeeName = settings.upiPayeeName || 'Pizza Xpress';
  const upiString = `upi://pay?pa=${encodeURIComponent(
    upiId
  )}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=Order%20${
    orderNumber || 'PX'
  }`;

  // Use a reliable QR Code generator image API for pure client-side rendering
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(
    upiString
  )}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-sm flex flex-col overflow-hidden shadow-2xl text-center">
        {/* Header */}
        <div className="p-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-amber-400" />
            <h3 className="font-black text-sm text-white">Scan & Pay via UPI</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-neutral-800 text-neutral-300 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* QR Code Container */}
        <div className="p-6 space-y-4 flex flex-col items-center">
          <div className="bg-white p-3 rounded-2xl shadow-xl inline-block border-4 border-amber-400/40">
            <img
              src={qrCodeUrl}
              alt="UPI QR Code"
              className="w-48 h-48 object-contain"
              loading="lazy"
            />
          </div>

          <div>
            <span className="text-xs text-neutral-400 block">Total Amount</span>
            <span className="text-2xl font-black text-amber-400">₹{amount}</span>
          </div>

          {/* UPI ID copy pill */}
          <div className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 flex items-center justify-between gap-2">
            <div className="text-left truncate">
              <span className="text-[10px] text-neutral-500 uppercase block">
                UPI ID
              </span>
              <span className="text-xs font-mono font-bold text-white truncate">
                {upiId}
              </span>
            </div>
            <button
              onClick={handleCopy}
              className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 shrink-0 transition cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <p className="text-[11px] text-neutral-400 leading-relaxed">
            Scan using Google Pay, PhonePe, Paytm, or any BHIM UPI app. Once paid,
            kindly attach or mention the UTR / screenshot on WhatsApp.
          </p>
        </div>

        <div className="p-4 bg-neutral-950 border-t border-neutral-800">
          <button
            onClick={onClose}
            className="w-full bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
          >
            Done / Close
          </button>
        </div>
      </div>
    </div>
  );
};
