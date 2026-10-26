import React, { useState, useEffect } from 'react';
import { CrustOption, Product, SizeOption } from '../types';
import { X, Star, Plus, Minus, Check } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onConfirmAdd: (
    product: Product,
    size?: SizeOption,
    crust?: CrustOption,
    qty?: number
  ) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onConfirmAdd,
}) => {
  const [selectedSize, setSelectedSize] = useState<SizeOption | undefined>(
    undefined
  );
  const [selectedCrust, setSelectedCrust] = useState<CrustOption | undefined>(
    undefined
  );
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes?.[0]);
      setSelectedCrust(product.crusts?.[0]);
      setQuantity(1);
    }
  }, [product]);

  if (!product) return null;

  const basePrice = product.discountPrice || product.price;
  const sizePrice = selectedSize ? selectedSize.priceDelta : 0;
  const crustPrice = selectedCrust ? selectedCrust.priceDelta : 0;
  const unitPrice = basePrice + sizePrice + crustPrice;
  const totalPrice = unitPrice * quantity;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-neutral-900 border border-neutral-800 rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header with image */}
        <div className="relative aspect-[16/9] w-full bg-neutral-800 shrink-0">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-black/40 pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-3 left-4 flex items-center gap-2">
            <div className="bg-white p-1 rounded-md shadow">
              <span
                className={
                  product.isVeg ? 'veg-indicator' : 'non-veg-indicator'
                }
              />
            </div>
            <div className="bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-md text-xs font-bold text-white flex items-center gap-1 border border-white/10">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating.toFixed(1)}</span>
              <span className="text-neutral-400">({product.ratingCount})</span>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-neutral-200">
          <div>
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xl font-black text-white">{product.name}</h2>
              <span className="text-sm font-bold text-neutral-400 uppercase tracking-wider">
                {product.category}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Size Options */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-amber-400">
                  Select Size
                </label>
                <span className="text-[11px] text-neutral-400">Required</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {product.sizes.map((size) => {
                  const isSelected = selectedSize?.id === size.id;
                  const itemPrice = basePrice + size.priceDelta;
                  return (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`flex sm:flex-col items-center justify-between p-3 rounded-xl border text-left transition cursor-pointer ${
                        isSelected
                          ? 'border-red-500 bg-red-950/40 text-white'
                          : 'border-neutral-800 bg-neutral-950 text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-xs">{size.name}</div>
                        <div className="text-[11px] text-neutral-400">
                          ₹{itemPrice}
                        </div>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center border mt-0 sm:mt-2 ${
                          isSelected
                            ? 'border-red-500 bg-red-500 text-white'
                            : 'border-neutral-600'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Crust Options */}
          {product.crusts && product.crusts.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-amber-400">
                  Select Crust
                </label>
                <span className="text-[11px] text-neutral-400">Optional</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {product.crusts.map((crust) => {
                  const isSelected = selectedCrust?.id === crust.id;
                  return (
                    <button
                      key={crust.id}
                      type="button"
                      onClick={() => setSelectedCrust(crust)}
                      className={`flex items-center justify-between p-3 rounded-xl border transition cursor-pointer ${
                        isSelected
                          ? 'border-red-500 bg-red-950/40 text-white'
                          : 'border-neutral-800 bg-neutral-950 text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-xs">{crust.name}</span>
                        {crust.priceDelta > 0 && (
                          <span className="text-[11px] text-amber-400 ml-2 font-semibold">
                            +₹{crust.priceDelta}
                          </span>
                        )}
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                          isSelected
                            ? 'border-red-500 bg-red-500 text-white'
                            : 'border-neutral-600'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between gap-3 shrink-0">
          {/* Quantity Controls */}
          <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-3 py-2 text-neutral-300 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-3 font-black text-sm text-white">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="px-3 py-2 text-neutral-300 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add Button */}
          <button
            onClick={() => {
              onConfirmAdd(product, selectedSize, selectedCrust, quantity);
              onClose();
            }}
            className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-95 text-white font-black py-3 px-4 rounded-xl shadow-lg shadow-red-950 flex items-center justify-between transition cursor-pointer"
          >
            <span className="text-sm">Add to Order</span>
            <span className="text-base font-black">₹{totalPrice}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
