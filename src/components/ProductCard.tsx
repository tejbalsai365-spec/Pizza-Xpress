import React from 'react';
import { Product } from '../types';
import { Star, Plus, Minus, Sparkles, ChevronRight } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  quantityInCart: number;
  onAddToCart: (product: Product) => void;
  onIncreaseQuantity: (product: Product) => void;
  onDecreaseQuantity: (product: Product) => void;
  onOpenDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  quantityInCart,
  onAddToCart,
  onIncreaseQuantity,
  onDecreaseQuantity,
  onOpenDetails,
}) => {
  const hasCustomOptions =
    (product.sizes && product.sizes.length > 0) ||
    (product.crusts && product.crusts.length > 0);

  const displayPrice = product.discountPrice || product.price;
  const originalPrice = product.discountPrice ? product.price : null;
  const savings = originalPrice ? originalPrice - displayPrice : 0;

  return (
    <div
      className={`relative bg-neutral-900/90 rounded-2xl border border-neutral-800/90 p-3.5 transition-all duration-200 hover:border-neutral-700 hover:bg-neutral-900 flex flex-col justify-between ${
        !product.isAvailable ? 'opacity-65 grayscale-[30%]' : ''
      }`}
    >
      <div>
        {/* Top Image + Badges */}
        <div
          onClick={() => onOpenDetails(product)}
          className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-neutral-800 mb-3 cursor-pointer group"
        >
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              // Fallback image if broken
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80';
            }}
          />

          {/* Gradient Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

          {/* Veg / Non-Veg Indicator */}
          <div className="absolute top-2.5 left-2.5 z-10 bg-white/95 backdrop-blur-sm p-1 rounded-md shadow-md">
            <span
              className={
                product.isVeg ? 'veg-indicator' : 'non-veg-indicator'
              }
            />
          </div>

          {/* Badge (Best Seller, Chef Special, etc.) */}
          {product.badge && (
            <div className="absolute top-2.5 right-2.5 z-10 bg-amber-400 text-neutral-950 font-black text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md">
              <Sparkles className="w-2.5 h-2.5" />
              {product.badge}
            </div>
          )}

          {/* Out of Stock Overlay */}
          {!product.isAvailable && (
            <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px] flex items-center justify-center z-20">
              <span className="bg-red-600/90 text-white font-black text-xs px-3 py-1 rounded-md tracking-wider uppercase border border-red-400">
                Out of Stock
              </span>
            </div>
          )}

          {/* Rating Pill */}
          <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md text-[11px] font-bold text-white border border-white/10">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{product.rating.toFixed(1)}</span>
            <span className="text-neutral-400 text-[10px]">
              ({product.ratingCount})
            </span>
          </div>

          {savings > 0 && (
            <div className="absolute bottom-2 right-2 z-10 bg-emerald-600/90 text-white font-black text-[10px] px-2 py-0.5 rounded-md">
              Save ₹{savings}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-1">
            <h3
              onClick={() => onOpenDetails(product)}
              className="font-bold text-white text-base leading-snug group-hover:text-red-400 cursor-pointer line-clamp-1"
            >
              {product.name}
            </h3>
          </div>

          <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>
      </div>

      {/* Pricing & Add To Cart Button */}
      <div className="mt-3 pt-3 border-t border-neutral-800/80 flex items-center justify-between gap-2">
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-black text-white">
              ₹{displayPrice}
            </span>
            {originalPrice && (
              <span className="text-xs text-neutral-500 line-through">
                ₹{originalPrice}
              </span>
            )}
          </div>
          {hasCustomOptions && (
            <span className="text-[10px] text-amber-400 font-semibold">
              Customizable options
            </span>
          )}
        </div>

        <div>
          {!product.isAvailable ? (
            <button
              disabled
              className="bg-neutral-800 text-neutral-500 text-xs font-bold px-3 py-2 rounded-xl cursor-not-allowed"
            >
              Unavailable
            </button>
          ) : hasCustomOptions && quantityInCart === 0 ? (
            <button
              onClick={() => onOpenDetails(product)}
              className="flex items-center gap-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-95 text-white font-black text-xs px-3.5 py-2 rounded-xl shadow-md shadow-red-950 transition cursor-pointer"
            >
              <span>ADD</span>
              <Plus className="w-3.5 h-3.5" />
            </button>
          ) : quantityInCart > 0 ? (
            <div className="flex items-center bg-red-600 text-white rounded-xl font-bold shadow-md shadow-red-950 overflow-hidden">
              <button
                onClick={() => onDecreaseQuantity(product)}
                className="px-2.5 py-1.5 hover:bg-red-700 active:scale-95 transition cursor-pointer"
                title="Decrease"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-black text-xs">{quantityInCart}</span>
              <button
                onClick={() => {
                  if (hasCustomOptions) {
                    onOpenDetails(product);
                  } else {
                    onIncreaseQuantity(product);
                  }
                }}
                className="px-2.5 py-1.5 hover:bg-red-700 active:scale-95 transition cursor-pointer"
                title="Increase / Add another"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onAddToCart(product)}
              className="flex items-center gap-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-95 text-white font-black text-xs px-3.5 py-2 rounded-xl shadow-md shadow-red-950 transition cursor-pointer"
            >
              <span>ADD</span>
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
