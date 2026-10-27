import React from 'react';
import {
  Search,
  MapPin,
  ShoppingBag,
  SlidersHorizontal,
  Clock,
  ShieldCheck,
  PhoneCall,
  Sparkles,
} from 'lucide-react';
import { StoreSettings } from '../types';

interface HeaderProps {
  settings: StoreSettings;
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  onOpenAdmin: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isVegOnly: boolean;
  onToggleVegOnly: () => void;
  isNonVegOnly: boolean;
  onToggleNonVegOnly: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  cartCount,
  cartTotal,
  onOpenCart,
  onOpenAdmin,
  searchQuery,
  onSearchChange,
  isVegOnly,
  onToggleVegOnly,
  isNonVegOnly,
  onToggleNonVegOnly,
}) => {
  const [showLocationDetail, setShowLocationDetail] = React.useState(false);

  return (
    <header className="sticky top-0 z-30 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800">
      {/* Top Banner: Store Status & Info */}
      <div
        style={{
          background: settings.primaryColor
            ? `linear-gradient(to right, ${settings.primaryColor}, #b91c1c)`
            : undefined,
        }}
        className="bg-gradient-to-r from-red-600 to-rose-700 text-white text-xs px-4 py-1.5 flex items-center justify-between font-medium"
      >
        <div className="flex items-center gap-1.5 truncate">
          <span className="flex h-2 w-2 relative">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                settings.isOpen ? 'bg-emerald-300' : 'bg-red-300'
              }`}
            ></span>
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                settings.isOpen ? 'bg-emerald-400' : 'bg-red-400'
              }`}
            ></span>
          </span>
          <span className="truncate">
            {settings.announcementText ||
              (settings.isOpen
                ? `Delivering Fresh to ${settings.storeLocation}`
                : 'Store Closed Currently • Pre-orders Accepted')}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden sm:inline-flex items-center gap-1 opacity-90 text-[11px]">
            <Clock className="w-3 h-3" /> {settings.openingHours}
          </span>
          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1 bg-black/30 hover:bg-black/50 text-[11px] px-2 py-0.5 rounded transition text-amber-300 font-semibold cursor-pointer"
            title="Admin & Menu Manager"
          >
            <ShieldCheck className="w-3 h-3" />
            <span>Admin</span>
          </button>
        </div>
      </div>

      {/* Main Brand & Actions Bar */}
      <div className="px-4 py-3 flex items-center justify-between gap-3">
        {/* Brand & Location */}
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer">
            <div
              style={{
                background: settings.primaryColor
                  ? `linear-gradient(135deg, ${settings.primaryColor}, #f59e0b)`
                  : undefined,
              }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 via-rose-600 to-amber-500 flex items-center justify-center shadow-lg shadow-red-900/40 text-xl font-black text-white transform -rotate-3 overflow-hidden"
            >
              {settings.logoIconUrl ? (
                <img
                  src={settings.logoIconUrl}
                  alt={settings.logoText || 'Pizza Xpress'}
                  className="w-full h-full object-cover"
                />
              ) : (
                settings.logoBadge || 'PX'
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-amber-400 text-neutral-950 text-[9px] font-black px-1 rounded-sm uppercase tracking-tighter">
              Hot
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-black tracking-tight text-white flex items-center">
                {settings.logoText ? (
                  <span>{settings.logoText}</span>
                ) : (
                  <>
                    PIZZA{' '}
                    <span
                      style={{ color: settings.primaryColor || '#ef4444' }}
                      className="text-red-500 ml-1"
                    >
                      XPRESS
                    </span>
                  </>
                )}
              </h1>
            </div>
            {/* Location selector */}
            <button
              onClick={() => setShowLocationDetail(!showLocationDetail)}
              className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white transition group text-left cursor-pointer"
            >
              <MapPin className="w-3 h-3 text-red-500 shrink-0" />
              <span className="font-semibold text-neutral-300 group-hover:underline truncate max-w-[170px] sm:max-w-xs">
                {settings.storeLocation}
              </span>
              <span className="text-[10px] text-neutral-500">▼</span>
            </button>
          </div>
        </div>

        {/* Cart Button */}
        <button
          onClick={onOpenCart}
          style={{
            backgroundColor: settings.primaryColor || undefined,
          }}
          className="relative flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-95 text-white px-3.5 py-2 rounded-xl font-bold text-sm shadow-lg shadow-red-600/30 transition cursor-pointer"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-amber-400 text-neutral-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-neutral-950">
                {cartCount}
              </span>
            )}
          </div>
        </button>
      </div>

      {/* Location Details Dropdown Modal/Banner */}
      {showLocationDetail && (
        <div className="bg-neutral-900 border-t border-b border-neutral-800 px-4 py-3 text-xs text-neutral-300 animate-in slide-in-from-top-2">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="font-bold text-white text-sm">📍 Pizza Xpress Kitchen</p>
              <p className="text-neutral-400">{settings.storeAddress}</p>
              <p className="text-neutral-400">PIN: <span className="text-amber-400 font-bold">{settings.pincode}</span></p>
              <p className="text-neutral-400 flex items-center gap-1 pt-1">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                <span>Hours: {settings.openingHours}</span>
              </p>
              <p className="text-emerald-400 font-semibold pt-0.5">
                🛵 Free Delivery on orders over ₹{settings.freeDeliveryAbove}!
              </p>
            </div>
            <button
              onClick={() => setShowLocationDetail(false)}
              className="text-neutral-400 hover:text-white px-2 py-1 rounded bg-neutral-800 text-xs cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Search Bar & Dietary Filter Pills */}
      <div className="px-4 pb-3 space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search pizza, cold drinks..."
            className="w-full bg-neutral-900 text-white placeholder-neutral-500 text-sm pl-10 pr-10 py-2.5 rounded-xl border border-neutral-800 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none transition"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white text-xs bg-neutral-800 px-1.5 py-0.5 rounded cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* 100% Pure Veg Badges */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-950/70 border border-emerald-500/60 text-emerald-300 shrink-0">
            <span className="veg-indicator scale-75"></span>
            <span>100% Pure Veg Kitchen</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-950/60 border border-amber-500/50 text-amber-300 shrink-0">
            <span>🏺 Fresh Kulhad Pizza</span>
          </div>

          <div className="h-4 w-[1px] bg-neutral-800 mx-1 shrink-0"></div>

          <div className="flex items-center gap-1 text-[11px] text-amber-400 bg-amber-950/30 border border-amber-900/40 px-2.5 py-1 rounded-lg shrink-0">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Hot & Cheesy</span>
          </div>
        </div>
      </div>
    </header>
  );
};
