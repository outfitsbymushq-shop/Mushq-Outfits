import React, { useState } from 'react';
import { Menu, X, Search, Heart, ShoppingBag, Landmark, Settings, Sparkles, MessageSquare } from 'lucide-react';
import { Category } from '../types';

interface HeaderProps {
  categories: Category[];
  activeCategory: string;
  onSelectCategory: (categorySlug: string) => void;
  onSearch: (term: string) => void;
  searchTerm: string;
  currentView: 'home' | 'shop' | 'details' | 'admin';
  onChangeView: (view: 'home' | 'shop' | 'details' | 'admin') => void;
  wishlistCount: number;
  onOpenWishlist: () => void;
  cartCount: number;
  onOpenCart: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export default function Header({
  categories,
  activeCategory,
  onSelectCategory,
  onSearch,
  searchTerm,
  currentView,
  onChangeView,
  wishlistCount,
  onOpenWishlist,
  cartCount,
  onOpenCart,
  mobileMenuOpen,
  setMobileMenuOpen
}: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  const handleNavClick = (slug: string) => {
    onSelectCategory(slug);
    onChangeView('shop');
    setMobileMenuOpen(false);
  };

  const handleLogoClick = () => {
    onSelectCategory('all');
    onChangeView('home');
  };

  return (
    <header id="site-header" className="sticky top-0 z-50 bg-cream-50/85 backdrop-blur-md border-b border-cream-150 transition-all duration-300">
      {/* Top micro-banner */}
      <div className="bg-emerald-950 text-[#fff] py-2 px-3 text-center text-[9px] sm:text-xs font-medium tracking-[0.1em] sm:tracking-[0.18em] uppercase flex items-center justify-center gap-1.5 sm:gap-2 leading-tight break-all">
        <Sparkles className="w-3 h-3 text-gold-400 animate-pulse shrink-0" />
        <span className="truncate max-w-[85vw] sm:max-w-none">LUXURY FESTIVE STITCHING & NATIONWIDE FREE SHIPPING ON INQUIRIES</span>
        <span className="hidden md:inline">| DIRECT WHATSAPP RESPONSE +92 302 0038010</span>
      </div>

      {/* Main navigation area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 md:h-24 grid grid-cols-3 items-center relative w-full overflow-hidden">
        
        {/* Column 1: Left (Hamburger & Search) */}
        <div className="flex items-center justify-start gap-1 sm:gap-3 z-15 shrink-0">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            id="btn-mobile-menu"
            className="md:hidden p-2 text-emerald-950 focus:outline-none cursor-pointer hover:bg-cream-100/50 rounded-full active:scale-95 transition-all flex items-center justify-center"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5.5 h-5.5" /> : <Menu className="w-5.5 h-5.5" />}
          </button>
          
          <button 
            onClick={() => setSearchOpen(!searchOpen)}
            id="btn-desktop-search"
            className="p-2 text-emerald-950 hover:text-gold-600 transition-colors uppercase font-bold tracking-widest cursor-pointer flex items-center gap-1.5 text-xs rounded-full hover:bg-cream-100/35"
            aria-label="Search"
          >
            <Search className="w-4.5 h-4.5" />
            <span className="hidden md:inline">Search</span>
          </button>
        </div>

        {/* Column 2: Center (Logo BRAND) */}
        <div 
          className="flex flex-col items-center justify-center text-center cursor-pointer select-none py-1 z-10" 
          onClick={handleLogoClick}
        >
          <h1 className="text-lg sm:text-2xl md:text-3.5xl font-serif tracking-[0.15em] sm:tracking-[0.2em] uppercase text-emerald-950 leading-none">
            Mushq
          </h1>
          <span className="text-[6.5px] sm:text-[7.5px] md:text-[8px] tracking-[0.3em] sm:tracking-[0.45em] uppercase -mt-0.5 font-bold text-gold-500 block">
            Luxury Outfits
          </span>
        </div>

        {/* Column 3: Right (Wishlist & Cart) */}
        <div className="flex items-center justify-end gap-1 sm:gap-3 md:gap-5 z-15 shrink-0">
          <button
            onClick={onOpenWishlist}
            id="btn-wishlist-drawer"
            className="relative p-2 text-emerald-950 hover:text-gold-600 transition-colors cursor-pointer text-xs font-bold uppercase tracking-wider flex items-center gap-1 select-none"
            aria-label="Wishlist"
          >
            <Heart className="w-4.5 h-4.5 text-neutral-800 hover:text-rose-600" />
            <span className="hidden md:inline">Wishlist ({wishlistCount})</span>
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 md:-top-1.5 md:-right-1.5 bg-gold-600 text-[#fff] text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {wishlistCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenCart}
            id="btn-cart-drawer"
            className="relative p-2 text-emerald-950 hover:text-gold-600 transition-colors cursor-pointer text-xs font-bold uppercase tracking-wider flex items-center gap-1 select-none"
            aria-label="Cart"
          >
            <ShoppingBag className="w-4.5 h-4.5 text-emerald-900" />
            <span className="hidden md:inline">Cart ({cartCount})</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 md:-top-1.5 md:-right-1.5 bg-emerald-900 text-[#fff] text-[9px] font-extrabold w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-xs">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Desktop Menu links bar */}
      <nav className="hidden md:flex items-center justify-center border-t border-cream-150 py-3 bg-cream-50/40">
        <div className="flex items-center gap-8 text-[10px] lg:text-xs font-bold tracking-[0.22em] uppercase text-emerald-950">
          <button
            onClick={() => onChangeView('home')}
            className={`hover:text-gold-600 transition-colors cursor-pointer ${currentView === 'home' ? 'text-gold-600 border-b-2 border-gold-400 pb-1.5' : 'pb-1.5'}`}
          >
            Home
          </button>
          
          <button
            onClick={() => handleNavClick('all')}
            className={`hover:text-gold-600 transition-colors cursor-pointer ${currentView === 'shop' && activeCategory === 'all' ? 'text-gold-600 border-b-2 border-gold-400 pb-1.5' : 'pb-1.5'}`}
          >
            All Collections
          </button>

          {categories.slice(0, 5).map((category) => (
            <button
              key={category.id}
              onClick={() => handleNavClick(category.slug)}
              className={`hover:text-gold-600 transition-colors cursor-pointer ${currentView === 'shop' && activeCategory === category.slug ? 'text-gold-600 border-b-2 border-gold-400 pb-1.5' : 'pb-1.5'}`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </nav>

      {/* Inline Search Bar Row (When clicked) */}
      {searchOpen && (
        <div className="border-t border-cream-100 bg-[#fff] py-4 px-6 shadow-inner animate-in fade-in duration-200">
          <div className="max-w-3xl mx-auto flex items-center gap-4 relative">
            <Search className="w-5 h-5 text-emerald-900 absolute left-4" />
            <input
              type="text"
              placeholder="Search by product name, fabric, SKU, or collection..."
              value={searchTerm}
              onChange={(e) => {
                onSearch(e.target.value);
                if (currentView !== 'shop') {
                  onChangeView('shop'); // automatically switch to shop when typing
                }
              }}
              className="w-full bg-cream-50 pl-12 pr-12 py-3 rounded-lg border border-cream-200 focus:outline-none focus:ring-2 focus:ring-gold-500 font-sans text-sm text-emerald-950"
              autoFocus
            />
            {searchTerm && (
              <button 
                onClick={() => onSearch('')} 
                className="absolute right-16 text-neutral-400 hover:text-emerald-900 text-xs font-semibold uppercase tracking-wider cursor-pointer"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setSearchOpen(false)}
              className="p-2 text-emerald-950 hover:text-rose-600 bg-cream-100 rounded-md cursor-pointer text-xs font-bold uppercase tracking-wide px-3"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
