import React, { useState } from 'react';
import { Menu, X, Search, Heart, ShoppingBag, Landmark, Settings, Sparkles, MessageSquare, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Category } from '../types';
import { getCustomWebsiteConfigs } from '../storage';
import { useCurrency } from '../currencyContext';

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
  storeName?: string;
  whatsappNumber?: string;
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
  setMobileMenuOpen,
  storeName = 'Mushq Outfits',
  whatsappNumber = '+92 302 0038010'
}: HeaderProps) {
  const { selectedCurrencyCode, currencyConfig, setCurrencyCode } = useCurrency();
  const webConfigs = getCustomWebsiteConfigs();
  const [searchOpen, setSearchOpen] = useState(false);
  const [currencyMenuOpen, setCurrencyMenuOpen] = useState(false);

  const currentCurrency = currencyConfig.currencies.find(c => c.code === selectedCurrencyCode) || { flag: '🇵🇰', code: 'PKR', symbol: 'Rs.', country: 'Pakistan', countryCode: 'PK' };

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
      {webConfigs.announcementEnabled && (
        <div className="bg-emerald-950 text-[#fff] py-2 px-3 text-center text-[9px] sm:text-xs font-medium tracking-[0.1em] sm:tracking-[0.18em] uppercase flex items-center justify-center gap-1.5 sm:gap-2 leading-tight break-all transition-all duration-300">
          <Sparkles className="w-3 h-3 text-gold-400 animate-pulse shrink-0" />
          <span className="truncate max-w-[85vw] sm:max-w-none uppercase">
            {webConfigs.announcementText || 'LUXURY FESTIVE STITCHING & NATIONWIDE FREE SHIPPING ON INQUIRIES'}
          </span>
          <span className="hidden md:inline">| DIRECT WHATSAPP RESPONSE {whatsappNumber}</span>
        </div>
      )}

      {/* Main navigation area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 md:h-24 grid grid-cols-3 items-center relative w-full">
        
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
            {storeName.split(' ')[0]}
          </h1>
          <span className="text-[6.5px] sm:text-[7.5px] md:text-[8px] tracking-[0.3em] sm:tracking-[0.45em] uppercase -mt-0.5 font-bold text-gold-500 block">
            {storeName.split(' ').slice(1).join(' ') || 'Luxury Outfits'}
          </span>
        </div>

        {/* Column 3: Right (Wishlist & Cart & Currency) */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-3 md:gap-4.5 z-15 shrink-0">
          
          {/* Multi-Currency Dropdown */}
          <div className="relative inline-block text-left" id="currency-switcher-container">
            <button
              onClick={() => setCurrencyMenuOpen(!currencyMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 text-[10px] md:text-xs font-bold text-emerald-950 uppercase tracking-widest rounded-full border border-cream-250 hover:bg-cream-100 hover:border-gold-450 bg-white/60 shadow-3xs transition-all duration-300 cursor-pointer select-none active:scale-95"
              type="button"
              id="btn-currency-select"
            >
              <span className="flex items-center shrink-0 w-4.5 h-3 overflow-hidden rounded-xs border border-neutral-200/50">
                <img 
                  src={`https://flagcdn.com/w40/${(currentCurrency.countryCode || currentCurrency.code.substring(0, 2)).toLowerCase()}.png`} 
                  alt={currentCurrency.code} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </span>
              <span className="font-mono text-[9px] md:text-[11px] text-neutral-800 tracking-tight select-none">
                {currentCurrency.code} <span className="text-neutral-400 font-normal text-[8px] md:text-[9px] ml-0.5">{currentCurrency.symbol}</span>
              </span>
              <span className="text-[7px] text-gold-600 transition-transform duration-300 transform leading-none">▼</span>
            </button>
            <AnimatePresence>
              {currencyMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40 bg-transparent" 
                    onClick={() => setCurrencyMenuOpen(false)} 
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="absolute right-0 mt-2 w-52 max-h-[380px] sm:max-h-[460px] overflow-y-auto bg-white border border-[#eae2d5] rounded-xl shadow-xl z-50 py-1.5 custom-scrollbar animate-none"
                  >
                    <div className="px-3 py-1 mb-1 border-b border-cream-100 pb-1.5">
                      <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block">Select Currency</span>
                    </div>
                    {currencyConfig.currencies.filter(c => c.isEnabled).map((c) => {
                      const isSelected = c.code === selectedCurrencyCode;
                      const countryCode = (c.countryCode || c.code.substring(0, 2)).toLowerCase();
                      return (
                        <button
                          key={c.code}
                          onClick={() => {
                            setCurrencyCode(c.code);
                            setCurrencyMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs font-semibold font-sans hover:bg-cream-50 transition-colors cursor-pointer rounded-xs ${
                            isSelected ? 'bg-cream-50/70 border-l-2 border-gold-500 text-emerald-950 font-bold pl-2.5' : 'text-neutral-700'
                          }`}
                          type="button"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="flex items-center shrink-0 w-[18px] h-[12px] overflow-hidden rounded-xs border border-neutral-200/50">
                              <img 
                                src={`https://flagcdn.com/w40/${countryCode}.png`} 
                                alt={c.country} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            </span>
                            <div className="flex flex-col leading-none">
                              <span className="font-mono text-[10.5px] font-bold text-neutral-850 tracking-wide uppercase">{c.code}</span>
                              <span className="text-[8px] text-neutral-400 font-normal tracking-wide truncate max-w-[100px] block mt-0.5">{c.country}</span>
                            </div>
                          </div>
                          
                          <span className="font-mono text-[9px] text-neutral-500 font-bold bg-neutral-100/85 border border-neutral-200/40 px-1.5 py-0.5 rounded uppercase">
                            {c.symbol}
                          </span>
                        </button>
                      );
                    })}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={onOpenWishlist}
            id="btn-wishlist-drawer"
            className="relative p-1.5 text-emerald-950 hover:text-gold-600 transition-colors cursor-pointer text-[10px] md:text-xs font-bold uppercase tracking-wider flex items-center gap-1 select-none font-sans"
            aria-label="Wishlist"
          >
            <Heart className="w-4 h-4 text-neutral-800 hover:text-rose-600" />
            <span className="hidden md:inline">Likes ({wishlistCount})</span>
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-0.5 bg-gold-600 text-[#fff] text-[8px] font-extrabold w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-xs">
                {wishlistCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenCart}
            id="btn-cart-drawer"
            className="relative p-1.5 text-emerald-950 hover:text-gold-600 transition-colors cursor-pointer text-[10px] md:text-xs font-bold uppercase tracking-wider flex items-center gap-1 select-none font-sans"
            aria-label="Cart"
          >
            <ShoppingBag className="w-4 h-4 text-emerald-900" />
            <span className="hidden md:inline">Cart ({cartCount})</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-0.5 bg-emerald-900 text-[#fff] text-[8px] font-extrabold w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-xs">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Desktop Menu links bar */}
      <nav className="hidden md:flex items-center justify-center border-t border-cream-150 py-3 bg-cream-50/40">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-[10px] lg:text-xs font-bold tracking-[0.22em] uppercase text-emerald-950 px-4">
          {webConfigs.menuItems && webConfigs.menuItems.length > 0 ? (
            webConfigs.menuItems.map((menuItem) => {
              const isActive = menuItem.type === 'home'
                ? currentView === 'home'
                : menuItem.type === 'all_collections'
                  ? currentView === 'shop' && activeCategory === 'all'
                  : currentView === 'shop' && activeCategory === menuItem.categorySlug;
              
              const handleClick = () => {
                if (menuItem.type === 'home') {
                  onChangeView('home');
                } else if (menuItem.type === 'all_collections') {
                  handleNavClick('all');
                } else if (menuItem.type === 'category' && menuItem.categorySlug) {
                  handleNavClick(menuItem.categorySlug);
                }
              };

              return (
                <button
                  key={menuItem.id}
                  onClick={handleClick}
                  className={`hover:text-gold-600 transition-colors cursor-pointer pb-1 ${isActive ? 'text-gold-650 border-b-2 border-gold-400' : ''}`}
                >
                  {menuItem.name}
                </button>
              );
            })
          ) : (
            <>
              <button
                onClick={() => onChangeView('home')}
                className={`hover:text-gold-600 transition-colors cursor-pointer pb-1 ${currentView === 'home' ? 'text-gold-650 border-b-2 border-gold-400' : ''}`}
              >
                Home
              </button>
              <button
                onClick={() => handleNavClick('all')}
                className={`hover:text-gold-600 transition-colors cursor-pointer pb-1 ${currentView === 'shop' && activeCategory === 'all' ? 'text-gold-650 border-b-2 border-gold-400' : ''}`}
              >
                All Collections
              </button>
            </>
          )}
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
