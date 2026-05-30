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
  isAdminLoggedIn: boolean;
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
  isAdminLoggedIn
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
      <div className="bg-emerald-950 text-[#fff] py-2 px-4 text-center text-[10px] md:text-xs font-medium tracking-[0.18em] uppercase flex items-center justify-center gap-2">
        <Sparkles className="w-3 h-3 text-gold-400 animate-pulse" />
        <span>LUXURY FESTIVE STITCHING & NATIONWIDE FREE SHIPPING ON INQUIRIES</span>
        <span className="hidden md:inline">| DIRECT WHATSAPP RESPONSE +92 302 0038010</span>
      </div>

      {/* Main navigation area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 md:h-24 flex items-center justify-between relative">
        
        {/* Left: Mobile hamburger & Search toggle */}
        <div className="flex items-center gap-6 w-1/4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            id="btn-mobile-menu"
            className="md:hidden p-2 text-emerald-950 focus:outline-none cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          
          <button 
            onClick={() => setSearchOpen(!searchOpen)}
            id="btn-desktop-search"
            className="hidden md:flex items-center gap-2 text-xs text-emerald-950 hover:text-gold-600 transition-colors uppercase font-medium tracking-widest cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>
        </div>

        {/* Center: Brand Identity */}
        <div className="absolute left-1/2 -translate-x-1/2 text-center flex flex-col items-center justify-center cursor-pointer select-none py-1" onClick={handleLogoClick}>
          <h1 className="text-2xl md:text-3.5xl font-serif tracking-[0.2em] uppercase text-emerald-950 leading-none">
            Mushq
          </h1>
          <span className="text-[7.5px] md:text-[8px] tracking-[0.45em] uppercase -mt-0.5 font-bold text-gold-500 block">
            Luxury Outfits
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center justify-end gap-3 md:gap-6 w-1/4">
          <button
            onClick={() => {
              onChangeView(currentView === 'admin' ? 'home' : 'admin');
            }}
            id="btn-admin-portal"
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase transition-all duration-200 cursor-pointer ${
              currentView === 'admin'
                ? 'bg-gold-500 text-emerald-950'
                : 'bg-emerald-950 text-[#fff] hover:bg-emerald-900 shadow-sm'
            }`}
          >
            <Settings className="w-3 h-3" />
            <span className="hidden sm:inline">{isAdminLoggedIn ? 'Dashboard' : 'Admin'}</span>
          </button>

          <button
            onClick={onOpenWishlist}
            id="btn-wishlist-drawer"
            className="relative p-2 text-emerald-950 hover:text-gold-600 transition-colors cursor-pointer text-xs font-medium uppercase tracking-widest flex items-center gap-1.5"
            aria-label="Wishlist"
          >
            <Heart className="w-4.5 h-4.5" />
            <span className="hidden md:inline">Bag ({wishlistCount})</span>
            {wishlistCount > 0 && (
              <span className="md:hidden absolute -top-1 -right-1 bg-gold-600 text-[#fff] text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {wishlistCount}
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

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex bg-transparent">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-[#000]/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
          
          <div className="relative flex flex-col w-4/5 max-w-sm bg-[#faf9f5] h-full shadow-2xl p-6 border-r border-cream-100 overflow-y-auto animate-in slide-in-from-left duration-300">
            <div className="flex justify-between items-center mb-10">
              <div className="flex flex-col">
                <span className="text-xl font-serif font-bold tracking-[0.16em] text-emerald-950">MUSHQ</span>
                <span className="text-[8px] tracking-[0.4em] text-gold-600 font-bold uppercase">OUTFITS</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-emerald-900 bg-cream-100 rounded-full cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Search input */}
            <div className="mb-8 relative">
              <Search className="w-4 h-4 text-emerald-800 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search outfits..."
                value={searchTerm}
                onChange={(e) => {
                  onSearch(e.target.value);
                  onChangeView('shop');
                }}
                className="w-full bg-[#fff] border border-cream-200 rounded-lg pl-10 pr-4 py-3 text-xs text-emerald-950 focus:outline-none focus:ring-2 focus:ring-gold-400"
              />
            </div>

            {/* Navigation items */}
            <span className="text-[10px] tracking-[0.2em] font-bold text-gold-600 uppercase mb-4 border-b border-cream-100 pb-2">Collections</span>
            
            <div className="flex flex-col gap-5.5">
              <button
                onClick={() => {
                  onChangeView('home');
                  setMobileMenuOpen(false);
                }}
                className={`text-left text-sm font-semibold uppercase tracking-wider ${currentView === 'home' ? 'text-gold-600' : 'text-emerald-950'}`}
              >
                🏡 Home Page
              </button>
              
              <button
                onClick={() => handleNavClick('all')}
                className={`text-left text-sm font-semibold uppercase tracking-wider ${currentView === 'shop' && activeCategory === 'all' ? 'text-gold-600' : 'text-emerald-950'}`}
              >
                👜 View All Outfits
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleNavClick(cat.slug)}
                  className={`text-left text-sm font-medium tracking-wide text-neutral-700 hover:text-gold-600 pl-4 py-0.5 border-l-2 ${
                    activeCategory === cat.slug && currentView === 'shop' ? 'border-gold-500 text-gold-600 font-bold' : 'border-transparent'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Micro details panel at bottom of drawer */}
            <div className="mt-auto border-t border-cream-100 pt-6 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium">
                <MessageSquare className="w-4 h-4 text-emerald-800" />
                <span>WhatsApp: +92 302 0038010</span>
              </div>
              <p className="text-[10px] text-neutral-400">Karachi, Pakistan. Absolute Eastern Elegance.</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
