import React, { useState, useEffect } from 'react';
import { Offer } from '../types';
import { Tag, Sparkles, ChevronRight, Check } from 'lucide-react';

interface BannerSliderProps {
  offers: Offer[];
  onApplyCoupon: (code: string) => void;
  appliedCoupon?: string;
}

export const BannerSlider: React.FC<BannerSliderProps> = ({
  offers,
  onApplyCoupon,
  appliedCoupon,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const activeOffers = offers.filter((o) => o.active);

  useEffect(() => {
    if (activeOffers.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeOffers.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [activeOffers.length]);

  if (activeOffers.length === 0) return null;

  const current = activeOffers[currentIndex] || activeOffers[0];
  const isApplied = appliedCoupon?.toUpperCase() === current.code.toUpperCase();

  return (
    <div className="px-4 py-3">
      <div
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${current.bannerGradient} p-4 text-white shadow-xl border border-white/10 transition-all duration-500`}
      >
        {/* Background decorative circles */}
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="absolute right-12 top-0 w-24 h-24 rounded-full bg-amber-400/20 blur-lg pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="inline-flex items-center gap-1 bg-black/40 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider text-amber-300">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Special Offer
            </span>
            <div className="flex items-center gap-1.5">
              {activeOffers.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    idx === currentIndex
                      ? 'w-6 bg-amber-400'
                      : 'w-1.5 bg-white/40'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="my-1">
            <h3 className="text-xl font-black tracking-tight drop-shadow-md">
              {current.title}
            </h3>
            <p className="text-xs text-white/90 line-clamp-1 mt-0.5 font-medium">
              {current.description}
            </p>
          </div>

          <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-white/15">
            <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-white/10">
              <Tag className="w-3 h-3 text-amber-300" />
              <span className="text-xs font-mono font-bold tracking-wider text-amber-300">
                {current.code}
              </span>
            </div>

            <button
              onClick={() => onApplyCoupon(current.code)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black shadow-md transition transform active:scale-95 cursor-pointer ${
                isApplied
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white text-neutral-950 hover:bg-neutral-100'
              }`}
            >
              {isApplied ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Applied
                </>
              ) : (
                <>
                  Apply Coupon <ChevronRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
