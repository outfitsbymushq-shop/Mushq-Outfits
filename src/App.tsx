import React, { useState, useEffect } from 'react';
import { 
  Heart, Trash2, Eye, Sparkles, ChevronLeft, ChevronRight, 
  MessageSquare, Star, ArrowRight, Instagram, Facebook, Mail, 
  Check, Phone, MapPin, Search, Grid, List, SlidersHorizontal, Info, ShoppingBag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Category, Banner, Inquiry, Review } from './types';
import { 
  getProducts, getCategories, getBanners, getSEO, getReviews,
  addInquiry, incrementVisitors 
} from './storage';
import Header from './components/Header';
import Footer from './components/Footer';
import ProductCard from './components/ProductCard';
import ProductDetails from './components/ProductDetails';
import AdminPanel from './components/AdminPanel';

export default function App() {
  // Database active states
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  // Page routing
  const [currentView, setCurrentView] = useState<'home' | 'shop' | 'details' | 'admin'>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Search and Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState<number>(30000);
  const [sortBy, setSortBy] = useState<string>('featured');

  // Customer wishlist storage
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [wishlistOpen, setWishlistOpen] = useState(false);

  // Home Hero Banner slider state
  const [activeSlide, setActiveSlide] = useState(0);

  // Newsletter states
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Setup databases & tracking
  const refreshDatabase = () => {
    setProducts(getProducts());
    setCategories(getCategories());
    setBanners(getBanners().filter(b => b.isActive));
    setReviews(getReviews());
  };

  useEffect(() => {
    incrementVisitors(); // Increment operational visits logged
    refreshDatabase();

    // Load wishlist
    const savedWish = localStorage.getItem('mushq_wishlist');
    if (savedWish) {
      setWishlist(JSON.parse(savedWish));
    }
  }, []);

  // Slider automated transition timer
  useEffect(() => {
    if (banners.length === 0) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % banners.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [banners]);

  // Handle wishlist mutations
  const handleToggleWishlist = (product: Product) => {
    let updated;
    if (wishlist.some(item => item.id === product.id)) {
      updated = wishlist.filter(item => item.id !== product.id);
    } else {
      updated = [...wishlist, product];
    }
    setWishlist(updated);
    localStorage.setItem('mushq_wishlist', JSON.stringify(updated));
  };

  const handleRemoveFromWishlist = (id: string) => {
    const updated = wishlist.filter(item => item.id !== id);
    setWishlist(updated);
    localStorage.setItem('mushq_wishlist', JSON.stringify(updated));
  };

  // Add inquiry checkout triggered via WhatsApp form
  const handleNewInquiryLog = (inq: Omit<Inquiry, 'id' | 'date'>) => {
    addInquiry(inq);
    refreshDatabase(); // Refresh local back-office variables
  };

  // Calculate filtered shop products
  const filteredProducts = products.filter((p) => {
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchesPrice = p.price <= priceRange || (p.salePrice && p.salePrice <= priceRange);
    
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      p.title.toLowerCase().includes(term) ||
      p.description.toLowerCase().includes(term) ||
      p.sku.toLowerCase().includes(term) ||
      p.fabric.toLowerCase().includes(term);

    return matchesCategory && matchesPrice && matchesSearch;
  });

  // Apply sorting models
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = a.salePrice || a.price;
    const priceB = b.salePrice || b.price;

    if (sortBy === 'low-to-high') return priceA - priceB;
    if (sortBy === 'high-to-low') return priceB - priceA;
    if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return a.isFeatured === b.isFeatured ? 0 : a.isFeatured ? -1 : 1;
  });

  // Render detail view product helper
  const activeProduct = products.find(p => p.id === selectedProductId);

  return (
    <div className="flex flex-col min-h-screen bg-cream-50 selection:bg-gold-500/35 selection:text-emerald-950 font-sans">
      
      {/* Visual Header */}
      <Header
        categories={categories}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        onSearch={setSearchTerm}
        searchTerm={searchTerm}
        currentView={currentView}
        onChangeView={(view) => {
          setCurrentView(view);
          if (view !== 'shop') {
            setSearchTerm(''); // clean state searches
          }
        }}
        wishlistCount={wishlist.length}
        onOpenWishlist={() => setWishlistOpen(true)}
        isAdminLoggedIn={true} // autoconfigured active sandbox indicator
      />

      <main className="flex-1">
        
        {/* VIEW 1: HOME PANEL */}
        {currentView === 'home' && (
          <div className="space-y-16 animate-in fade-in duration-300">
            
            {/* HER0 SLIDER BANNER CAROUSEL */}
            {banners.length > 0 && (
              <section id="hero-carousel" className="relative h-[480px] md:h-[650px] bg-emerald-950 overflow-hidden w-full select-none">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSlide}
                    initial={{ opacity: 0, scale: 1.03 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0 w-full h-full"
                  >
                    <img
                      src={banners[activeSlide].image}
                      alt={banners[activeSlide].title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover opacity-80"
                    />
                    
                    {/* Shadow overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/70 via-emerald-950/20 to-emerald-950/50" />

                    {/* Centered Luxury Caption */}
                    <div className="absolute inset-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-start text-[#fff] z-10">
                      <motion.span 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="text-[11px] md:text-xs font-semibold tracking-[0.4em] text-gold-400 uppercase mb-4"
                      >
                        Bespoke Eastern Haute Couture
                      </motion.span>
                      
                      <motion.h2 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="text-3xl md:text-6xl font-serif font-bold tracking-wide italic leading-tight max-w-xl md:max-w-3xl"
                      >
                        {banners[activeSlide].title}
                      </motion.h2>

                      <motion.p 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="text-xs md:text-sm text-neutral-300 tracking-wider max-w-md mt-4 font-sans font-light"
                      >
                        {banners[activeSlide].subtitle}
                      </motion.p>

                      <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        className="flex gap-4 mt-8"
                      >
                        <button
                          onClick={() => {
                            setActiveCategory('all');
                            setCurrentView('shop');
                          }}
                          className="bg-gold-500 hover:bg-gold-600 font-bold text-emerald-950 py-3.5 px-8 rounded-none text-xs tracking-[0.25em] uppercase transition-all select-none cursor-pointer text-center"
                        >
                          Explore Brand
                        </button>
                        <button
                          onClick={() => {
                            setActiveCategory('party-wear');
                            setCurrentView('shop');
                          }}
                          className="bg-transparent hover:bg-[#fff]/10 border border-[#fff] font-bold text-[#fff] py-3.5 px-8 rounded-none text-xs tracking-[0.25em] uppercase transition-all select-none cursor-pointer text-center"
                        >
                          Party Wear
                        </button>
                      </motion.div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Left/Right manual click triggers */}
                <button
                  onClick={() => setActiveSlide((prev) => (prev - 1 + banners.length) % banners.length)}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-[#000]/20 hover:bg-[#faf9f5]/20 hover:text-gold-500 text-cream-50 p-2.5 rounded-full z-20 cursor-pointer"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setActiveSlide((prev) => (prev + 1) % banners.length)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-[#000]/20 hover:bg-[#faf9f5]/20 hover:text-gold-500 text-cream-50 p-2.5 rounded-full z-20 cursor-pointer"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </section>
            )}

            {/* HIGH-FASHION DECLARATION BLOCK */}
            <section className="text-center max-w-3xl mx-auto px-4 py-8">
              <span className="text-[10px] tracking-[0.35em] text-gold-600 font-extrabold block uppercase mb-3">Est. Karachi Boutique</span>
              <h2 className="text-2xl md:text-3xl font-serif text-emerald-950 font-bold mb-4 tracking-wide leading-snug">
                Where Traditional Grace Meets Absolute Modern Craft
              </h2>
              <div className="w-16 h-0.5 bg-gold-400 mx-auto my-6" />
              <p className="text-xs md:text-sm text-neutral-500 leading-relaxed font-sans max-w-2xl mx-auto font-light">
                Each apparel set inside the Mushq Outfits vault is created collectively by elite Pakistani textile looms and skilled handcraft artisans. Tailored beautifully under professional monitors, our apparel ensures you look exceptionally opulent on pre-wedding festivities, formal dinners, and summer events.
              </p>
            </section>

            {/* FEATURED CATEGORIES EDITORIAL INDEX GRID */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h3 className="text-[10px] font-bold tracking-[0.3em] text-gold-700 uppercase mb-8 text-center font-sans">
                Featured Boutique Divisions
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 border border-cream-150 bg-[#fff] shadow-xs">
                {categories.map((cat, idx) => (
                  <div
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.slug);
                      setCurrentView('shop');
                    }}
                    className="p-6 flex flex-col justify-between min-h-[150px] border-r border-b last:border-r-0 border-cream-150 hover:bg-[#064e3b]/5 transition-all duration-300 cursor-pointer group"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] text-[#064e3b]/50 tracking-widest font-mono">0{idx + 1}</span>
                      <div className="w-9 h-9 border border-cream-150 overflow-hidden opacity-80 group-hover:opacity-100 transition-all">
                        <img
                          src={cat.image}
                          alt={cat.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    </div>
                    <h3 className="font-serif text-[13px] text-[#064e3b] font-bold group-hover:text-gold-600 tracking-wide transition-colors mt-8 uppercase">
                      {cat.name}
                    </h3>
                  </div>
                ))}
              </div>
            </section>

            {/* NEW ARRIVALS & SIGNATURE OUTLINE SNEAK PEEK */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-baseline mb-8 pb-3 border-b border-cream-150">
                <div>
                  <h3 className="text-xl md:text-2xl text-emerald-950 font-bold font-serif tracking-wide">
                    New Arrivals & Must-Have Outfits
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1">Impeccant tailored coordinates released this season</p>
                </div>
                <button
                  onClick={() => {
                    setActiveCategory('all');
                    setCurrentView('shop');
                  }}
                  className="text-[10px] text-emerald-950 font-bold tracking-widest uppercase hover:text-gold-600 transition-colors flex items-center gap-1 select-none cursor-pointer underline underline-offset-4"
                >
                  <span>See Entire Closet</span>
                  <span>→</span>
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-7">
                {products.slice(0, 4).map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onViewDetails={(id) => {
                      setSelectedProductId(id);
                      setCurrentView('details');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    onToggleWishlist={handleToggleWishlist}
                    isWishlisted={wishlist.some(item => item.id === p.id)}
                  />
                ))}
              </div>
            </section>

            {/* SPLIT LUXURY COLLECTION STATIONS */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Summer Station */}
              <div className="relative aspect-[16/10] rounded-none overflow-hidden border border-cream-150 group cursor-pointer"
                   onClick={() => { setActiveCategory('summer-collection'); setCurrentView('shop'); }}>
                <img
                  src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80"
                  alt="Summer closet"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-emerald-950/45 group-hover:bg-emerald-950/35 transition-colors" />
                <div className="absolute inset-6 md:inset-10 flex flex-col justify-end text-[#fff]">
                  <span className="text-[10px] uppercase font-semibold tracking-[0.25em] text-gold-300">Sumptuous Breathability</span>
                  <h3 className="text-xl md:text-3xl font-serif font-bold tracking-wide mt-2">The Summer Jacquards</h3>
                  <p className="text-xs text-neutral-200 mt-2 font-sans font-light opacity-95">Fine cotton woven threads with organza patchings and airy silk borders.</p>
                </div>
              </div>

              {/* Winter Station */}
              <div className="relative aspect-[16/10] rounded-none overflow-hidden border border-cream-150 group cursor-pointer"
                   onClick={() => { setActiveCategory('winter-collection'); setCurrentView('shop'); }}>
                <img
                  src="https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?auto=format&fit=crop&w=800&q=80"
                  alt="Winter luxury"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-emerald-950/45 group-hover:bg-emerald-950/35 transition-colors" />
                <div className="absolute inset-6 md:inset-10 flex flex-col justify-end text-[#fff]">
                  <span className="text-[10px] uppercase font-semibold tracking-[0.25em] text-gold-300">Sumptuous Heaviness</span>
                  <h3 className="text-xl md:text-3xl font-serif font-bold tracking-wide mt-2">Bespoke Karandi & Velvets</h3>
                  <p className="text-xs text-neutral-200 mt-2 font-sans font-light opacity-95">Earthy shades, micro-spun fibers, heavy Kashmiri-style wool duppatas.</p>
                </div>
              </div>

            </section>

            {/* SELLER STARS & REVIEWS FEEDBACK */}
            <section className="bg-cream-100/50 border-t border-b border-cream-150 py-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
                <div>
                  <span className="text-[10px] tracking-[0.3em] uppercase text-gold-600 font-extrabold block">Bespoke Customer Trust</span>
                  <h3 className="text-xl md:text-3xl font-serif font-bold text-emerald-950 mt-2">What Luxury Patrons Tell About Us</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="bg-[#fff] border border-cream-100 p-6 rounded-xl shadow-xs flex flex-col justify-between">
                      <div className="space-y-3">
                        {/* Rating stars */}
                        <div className="flex gap-1">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-gold-500 fill-current" />
                          ))}
                        </div>
                        <p className="text-xs text-neutral-600 leading-relaxed font-sans">{rev.comment}</p>
                      </div>

                      <div className="flex justify-between items-center border-t border-cream-100 mt-4 pt-3 text-[11px]">
                        <div>
                          <span className="font-bold text-emerald-950 block font-serif">{rev.name}</span>
                          <span className="text-neutral-400 block">{rev.location}</span>
                        </div>
                        <span className="bg-emerald-50 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                          🛡 Verified Buyer
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* INSTANT ORDER BANNER (PROMO WHATSAPP CARD) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-emerald-gradient p-8 md:p-14 rounded-3xl text-center text-[#fff] relative border border-emerald-900 shadow-xl overflow-hidden shimmer flex flex-col items-center justify-center">
                <div className="absolute inset-0 bg-[#000]/10" />
                <Sparkles className="w-8 h-8 text-gold-400 animate-bounce mb-4 block" />
                <h3 className="text-2xl md:text-4xl font-serif font-bold tracking-wide">Prefer Custom Modifications?</h3>
                <p className="text-xs md:text-sm text-neutral-300 max-w-xl mt-3 leading-relaxed">
                  Connect directly with Mushq’s elite in-house boutique tailors. Request custom arm lengths, neckline modifications, custom shades, or seek advice on your size chart parameters live via WhatsApp!
                </p>
                <a
                  href="https://wa.me/923020038010"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 bg-[#fff] hover:bg-gold-500 hover:text-emerald-950 font-bold text-emerald-950 py-3.5 px-8 rounded-lg text-xs tracking-widest uppercase transition-all select-none cursor-pointer inline-flex items-center gap-2"
                >
                  <MessageSquare className="w-4.5 h-4.5" />
                  <span>Start WhatsApp Consultation</span>
                </a>
              </div>
            </section>

            {/* HIGH-FASHION NEWSLETTER COMPILER */}
            <section className="bg-emerald-950 text-[#fff] py-16 border-t border-b border-emerald-900">
              <div className="max-w-md mx-auto px-4 text-center space-y-4">
                <Mail className="w-7 h-7 text-gold-400 mx-auto" />
                <h3 className="text-xl md:text-2xl font-serif font-bold">Unveil the luxury releases first</h3>
                <p className="text-xs text-neutral-300">Join our exclusive private newsletter list to receive seasonal catalogues and alerts for custom stitching slots first.</p>
                
                {newsletterSubscribed ? (
                  <p className="text-xs text-gold-400 font-bold bg-[#fff]/5 p-3.5 rounded border border-gold-900/40">
                    ✓ Welcome to Mushq VIP Club ! Exclusive catalogs will resolve on your inbox.
                  </p>
                ) : (
                  <form 
                    onSubmit={(e) => { e.preventDefault(); if (newsletterEmail) setNewsletterSubscribed(true); }}
                    className="flex mt-6 border border-zinc-700 rounded-lg overflow-hidden bg-zinc-800"
                  >
                    <input
                      type="email"
                      required
                      placeholder="Enter your email"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      className="flex-1 bg-transparent px-4 py-3 text-xs focus:outline-none focus:bg-zinc-700/50"
                    />
                    <button
                      type="submit"
                      className="bg-gold-500 hover:bg-gold-600 text-emerald-950 font-bold px-6 text-xs tracking-wider uppercase select-none cursor-pointer"
                    >
                      Subscribe
                    </button>
                  </form>
                )}
              </div>
            </section>

          </div>
        )}

        {/* VIEW 2: PRODUCT LISTING CLOSES */}
        {currentView === 'shop' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in duration-300">
            
            {/* Upper Shop Heading indicator */}
            <div className="bg-emerald-950 text-[#fff] p-8 md:p-12 rounded-2xl border border-emerald-900 shadow mb-10 text-center select-none relative overflow-hidden">
              <div className="absolute inset-0 bg-[#000]/15" />
              <h1 className="text-3xl md:text-5xl font-serif font-bold tracking-wide italic leading-tight capitalize">
                {activeCategory === 'all' ? 'All Mushq Closets' : activeCategory.replace('-', ' ')}
              </h1>
              <p className="text-xs text-neutral-300 tracking-widest uppercase mt-3">
                {sortedProducts.length} Premium Outfits listed underneath
              </p>
            </div>

            {/* Filters Row + Catalog Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              
              {/* FILTERS SIDEBAR */}
              <div className="bg-[#fff] border border-cream-100 rounded-xl p-5 shadow-sm space-y-6 h-fit">
                <div className="flex items-center justify-between border-b border-cream-100 pb-3">
                  <h3 className="text-xs uppercase font-bold tracking-widest text-emerald-950 flex items-center gap-1.5">
                    <SlidersHorizontal className="w-4 h-4 text-[#ab8215]" />
                    <span>Closet Filters</span>
                  </h3>
                  {(searchTerm || activeCategory !== 'all' || priceRange < 30000) && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setActiveCategory('all');
                        setPriceRange(30000);
                      }}
                      className="text-[10px] text-rose-700 font-bold uppercase tracking-wider hover:underline p-1 cursor-pointer"
                    >
                      Reset All
                    </button>
                  )}
                </div>

                {/* Categories filtering links */}
                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-3">Filter by Collection</label>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setActiveCategory('all')}
                      className={`text-left text-xs font-semibold uppercase tracking-wider pl-3 py-1 border-l-2 ${
                        activeCategory === 'all' ? 'border-[#ab8215] text-[#ab8215]' : 'border-transparent text-neutral-700'
                      }`}
                    >
                      ✨ All Closets
                    </button>
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setActiveCategory(c.slug)}
                        className={`text-left text-xs font-semibold pl-3 py-1 border-l-2 ${
                          activeCategory === c.slug ? 'border-[#ab8215] text-[#ab8215]' : 'border-transparent text-neutral-600 hover:text-gold-600'
                        }`}
                      >
                        ⚡ {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Search input */}
                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-2.5">Live Design Search</label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-emerald-900 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="e.g. Silk, Karandi..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-cream-50 pl-9 pr-3 py-2.5 rounded-lg border border-cream-200 text-xs focus:outline-none focus:ring-1 focus:ring-gold-500 text-neutral-800"
                    />
                  </div>
                </div>

                {/* Price limit bar selector */}
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Price ceiling</label>
                    <span className="font-mono text-xs font-bold text-emerald-950">Rs. {priceRange.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="5000"
                    max="30000"
                    step="500"
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="w-full h-1 bg-cream-100 rounded-lg appearance-none cursor-pointer accent-emerald-900"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
                    <span>Rs. 5,000</span>
                    <span>Rs. 30,000</span>
                  </div>
                </div>

                {/* Sorting options */}
                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-2.5">Organize Closet items</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full bg-cream-50 border border-cream-200 rounded-lg p-2.5 text-xs text-neutral-800"
                  >
                    <option value="featured">★ Our Signature Picks</option>
                    <option value="low-to-high">💵 Low to High Price</option>
                    <option value="high-to-low">💵 High to Low Price</option>
                    <option value="newest">⚡ Newly Tailored</option>
                  </select>
                </div>
              </div>

              {/* PRODUCTS CATALOG GRID (3 cols on lg) */}
              <div className="lg:col-span-3">
                {sortedProducts.length === 0 ? (
                  <div className="bg-[#fff] border border-cream-100 rounded-2xl p-12 text-center text-neutral-400">
                    <Info className="w-8 h-8 mx-auto mb-3 text-gold-500" />
                    <h3 className="text-md font-serif font-bold text-emerald-950 uppercase tracking-wider mb-2">No outfits match the filters</h3>
                    <p className="text-xs">Try searching with other terms, expanding price limits, or shifting collections.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-7">
                    {sortedProducts.map((p) => (
                      <ProductCard
                        key={p.id}
                        product={p}
                        onViewDetails={(id) => {
                          setSelectedProductId(id);
                          setCurrentView('details');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        onToggleWishlist={handleToggleWishlist}
                        isWishlisted={wishlist.some(item => item.id === p.id)}
                      />
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* VIEW 3: PRODUCT DETAILS SHEET */}
        {currentView === 'details' && activeProduct && (
          <ProductDetails
            product={activeProduct}
            onGoBack={() => {
              setCurrentView('shop');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onAddInquiry={handleNewInquiryLog}
          />
        )}

        {/* VIEW 4: ADMIN CONSOLE */}
        {currentView === 'admin' && (
          <AdminPanel
            onDatabaseUpdate={() => {
              refreshDatabase();
            }}
            onLogoutAdmin={() => {
              setCurrentView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

      </main>

      {/* SLA INTERACTIVE WISHLIST DRAWER SIDEBAR */}
      {wishlistOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-transparent">
          {/* Backdrop screen */}
          <div className="fixed inset-0 bg-[#000]/40 backdrop-blur-sm transition-opacity" onClick={() => setWishlistOpen(false)} />
          
          <div className="fixed inset-y-0 right-0 max-w-full pl-10 flex">
            <div className="w-screen max-w-sm bg-[#faf9f5] shadow-2xl relative flex flex-col h-full border-l border-cream-100 animate-in slide-in-from-right duration-300">
              <div className="px-6 py-5 bg-emerald-950 text-[#fff] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-gold-400 fill-current" />
                  <span className="font-serif font-bold text-md tracking-wider uppercase">My Liked Vault ({wishlist.length})</span>
                </div>
                <button onClick={() => setWishlistOpen(false)} className="p-2 bg-emerald-900 rounded-full cursor-pointer text-[#fff]">✕</button>
              </div>

              {/* Wishlist items list scrollable */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scroll">
                {wishlist.length === 0 ? (
                  <div className="text-center text-neutral-400 text-xs py-10 font-medium">
                    Your liked outfit vault is empty. Click heart badges on clothing cards to add items!
                  </div>
                ) : (
                  wishlist.map((item) => (
                    <div key={item.id} className="flex gap-3 bg-[#fff] border border-cream-100 p-2.5 rounded-lg shadow-xs group">
                      <img src={item.images[0]} alt={item.title} referrerPolicy="no-referrer" className="w-14 aspect-[3/4] object-cover rounded border" />
                      <div className="flex-1 flex flex-col justify-between text-xs">
                        <div>
                          <h4 className="font-bold text-neutral-800 line-clamp-1 font-serif">{item.title}</h4>
                          <span className="text-[10px] text-neutral-400 block mt-0.5">SKU: {item.sku}</span>
                          <span className="text-[10px] italic text-[#ab8215] font-semibold block">{item.fabric}</span>
                        </div>
                        <div className="flex items-center justify-between border-t border-cream-50 pt-1.5 mt-1">
                          <span className="font-mono font-bold text-emerald-950">Rs. {(item.salePrice || item.price).toLocaleString()}</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedProductId(item.id);
                                setCurrentView('details');
                                setWishlistOpen(false);
                              }}
                              className="text-[10px] text-emerald-900 font-bold hover:underline cursor-pointer"
                            >
                              Details
                            </button>
                            <button
                              onClick={() => handleRemoveFromWishlist(item.id)}
                              className="text-rose-600 hover:text-rose-800 cursor-pointer"
                              title="Delete item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Wishlist footer checkout button */}
              {wishlist.length > 0 && (
                <div className="bg-cream-100 p-4 border-t border-cream-200">
                  <p className="text-[11px] text-neutral-500 leading-relaxed mb-4 text-center">
                    Click "Details" on items in the vault to customized arm lengths or request cash on deliveries on checkout.
                  </p>
                  <button
                    onClick={() => {
                      setActiveCategory('all');
                      setCurrentView('shop');
                      setWishlistOpen(false);
                    }}
                    className="w-full bg-emerald-950 text-cream-50 font-bold tracking-widest text-[11px] py-3 uppercase rounded shadow hover:bg-emerald-900 transition-colors cursor-pointer"
                  >
                    👜 Back to Closet Store
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Custom operational bottom assurance band */}
      <Footer onSelectCategory={setActiveCategory} onChangeView={setCurrentView} />
    </div>
  );
}
