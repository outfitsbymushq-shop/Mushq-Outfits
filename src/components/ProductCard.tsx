import React from 'react';
import { Eye, Heart, Sparkles, MessageSquare } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  key?: React.Key | string | number;
  product: Product;
  onViewDetails: (productId: string) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: boolean;
}

export default function ProductCard({
  product,
  onViewDetails,
  onToggleWishlist,
  isWishlisted
}: ProductCardProps) {
  const hasSale = !!product.salePrice && product.salePrice < product.price;
  
  // Format PKR currency
  const formatPrice = (amount: number) => {
    return `Rs. ${amount.toLocaleString('en-PK')}`;
  };

  return (
    <div 
      id={`product-card-${product.id}`}
      className="group relative bg-[#fff] border border-cream-150 transition-all duration-500 flex flex-col h-full hover:bg-cream-50"
    >
      {/* Product Image Stage */}
      <div className="relative aspect-[3/4] bg-cream-50 overflow-hidden cursor-pointer" onClick={() => onViewDetails(product.id)}>
        <img
          src={product.images[0]}
          alt={product.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Subtle overlay */}
        <div className="absolute inset-0 bg-emerald-950/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Floating Luxury Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {hasSale && (
            <span className="bg-rose-700 text-[#fff] text-[9.5px] font-extrabold tracking-widest uppercase px-2 py-1 rounded-sm shadow-sm font-sans">
              {Math.round(((product.price - product.salePrice!) / product.price) * 100)}% OFF
            </span>
          )}
          {product.isFeatured && (
            <span className="bg-gold-600 text-[#fff] text-[9px] font-extrabold tracking-widest uppercase px-2 py-0.5 rounded-sm shadow-sm flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              MUST-HAVE
            </span>
          )}
          {product.stockStatus === 'outofstock' && (
            <span className="bg-neutral-800 text-[#fff] text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-sm shadow-sm">
              SOLD OUT
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          id={`btn-wish-toggle-${product.id}`}
          className={`absolute top-3 right-3 p-2 rounded-full border shadow-xs transition-all duration-300 z-10 cursor-pointer ${
            isWishlisted
              ? 'bg-rose-50 border-rose-200 text-rose-600'
              : 'bg-[#fff]/80 hover:bg-[#fff] border-cream-200 text-neutral-600 hover:text-rose-600'
          }`}
          aria-label="Add to wishlist"
        >
          <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Action Drawer overlay (Revealed on hover on desktop only) */}
        <div className="hidden sm:flex absolute bottom-4 inset-x-4 items-center gap-2 transform translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(product.id);
            }}
            id={`btn-quick-view-${product.id}`}
            className="flex-1 bg-emerald-950 hover:bg-emerald-900 text-cream-50 text-[10px] font-bold tracking-[0.18em] uppercase py-2.5 px-3 rounded shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Product Information Grid */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 bg-[#fff] justify-between border-t border-cream-150">
        <div>
          {/* Collection Name & Fabric tag */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-[9px] text-gold-600 font-bold uppercase tracking-widest mb-1.5">
            <span className="opacity-95 truncate max-w-full">{product.category.replace('-', ' ')}</span>
            <span className="bg-cream-100 text-[8px] px-1.5 py-0.5 tracking-wider font-sans font-extrabold text-[#064e3b] w-fit shrink-0 rounded-xs">
              {product.fabric}
            </span>
          </div>

          {/* Title */}
          <h3 
            onClick={() => onViewDetails(product.id)}
            className="text-[12px] font-bold text-emerald-950 uppercase tracking-wide line-clamp-1 hover:text-gold-600 transition-colors cursor-pointer mb-2 font-sans"
          >
            {product.title}
          </h3>
        </div>

        {/* Pricing & Order Callout */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mt-auto pt-2 border-t border-cream-150">
          <div className="flex flex-wrap items-baseline gap-1">
            {hasSale ? (
              <div className="flex flex-col">
                <span className="text-[11px] sm:text-xs font-bold text-rose-800 font-mono leading-none">
                  {formatPrice(product.salePrice!)}
                </span>
                <span className="text-[9.5px] text-neutral-400 line-through font-mono mt-0.5 leading-none">
                  {formatPrice(product.price)}
                </span>
              </div>
            ) : (
              <span className="text-[11px] sm:text-xs font-bold text-gold-600 font-mono">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          
          <button
            onClick={() => onViewDetails(product.id)}
            className="text-[10px] uppercase tracking-widest font-extrabold text-[#fff] hover:text-[#fff] bg-emerald-900 hover:bg-emerald-950 py-2.5 px-4 rounded-md border border-emerald-900 cursor-pointer text-center w-full sm:w-auto min-h-[44px] sm:min-h-0 flex items-center justify-center select-none shadow-xs hover:shadow-sm transition-all focus:outline-none"
          >
            Order Now
          </button>
        </div>
      </div>
    </div>
  );
}
