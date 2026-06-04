import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, Trash2, Eye, Sparkles, ChevronLeft, ChevronRight, 
  MessageSquare, Star, ArrowRight, Instagram, Facebook, Mail, 
  Check, Phone, MapPin, Search, Grid, List, SlidersHorizontal, Info, ShoppingBag,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Category, Banner, Inquiry, Review, CartItem } from './types';
import { 
  getProducts, getCategories, getBanners, getSEO, getReviews,
  addInquiry, incrementVisitors, getWebsiteSettings, addReview
} from './storage';
import Header from './components/Header';
import Footer from './components/Footer';
import ProductCard from './components/ProductCard';
import ProductDetails from './components/ProductDetails';
import AdminPanel from './components/AdminPanel';

export default function App() {
  // Brand initial loading state
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  // Refs
  const categoryTrackRef = useRef<HTMLDivElement>(null);

  // Database active states
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  // Page routing
  const [currentView, setCurrentView] = useState<'home' | 'shop' | 'details' | 'admin'>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Search and Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState<number>(30000);
  const [sortBy, setSortBy] = useState<string>('featured');

  // Customer wishlist storage
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [wishlistOpen, setWishlistOpen] = useState(false);

  // Customer cart storage
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  // Checkout Form metadata
  const [cartName, setCartName] = useState('');
  const [cartPhone, setCartPhone] = useState('');
  const [cartAddress, setCartAddress] = useState('');

  // Home Hero Banner slider state
  const [activeSlide, setActiveSlide] = useState(0);

  // Newsletter states
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Dynamic Company Coordinate Settings
  const [storeName, setStoreName] = useState('Mushq Outfits');
  const [whatsappNumber, setWhatsappNumber] = useState('+92 302 0038010');
  const [facebookLink, setFacebookLink] = useState('https://facebook.com/mushqpk');

  // Setup databases & tracking
  const refreshDatabase = async () => {
    try {
      const prods = await getProducts();
      setProducts(prods);
      const cats = await getCategories();
      setCategories(cats);
      const bans = await getBanners();
      setBanners(bans.filter(b => b.isActive));
      const revs = await getReviews();
      setReviews(revs);
      
      const setts = await getWebsiteSettings();
      setStoreName(setts.storeName);
      setWhatsappNumber(setts.whatsappNumber);
      setFacebookLink(setts.facebookLink);
    } catch (e) {
      console.error('Failed refreshing database:', e);
    }
  };

  useEffect(() => {
    const init = async () => {
      const startTime = Date.now();
      await incrementVisitors(); // Increment operational visits logged
      await refreshDatabase();
      
      const elapsed = Date.now() - startTime;
      const minDuration = 1800; // Let the beautiful monogram reveal animate for 1.8 seconds minimum
      if (elapsed < minDuration) {
        await new Promise(resolve => setTimeout(resolve, minDuration - elapsed));
      }
      setIsInitialLoading(false);
    };
    init();

    // Load wishlist
    const savedWish = localStorage.getItem('mushq_wishlist');
    if (savedWish) {
      setWishlist(JSON.parse(savedWish));
    }

    // Load cart
    const savedCart = localStorage.getItem('mushq_cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Page navigation & filter transition indicators
  useEffect(() => {
    if (isInitialLoading) return;
    setLoadingProgress(25);
    const timer1 = setTimeout(() => setLoadingProgress(65), 100);
    const timer2 = setTimeout(() => setLoadingProgress(100), 220);
    const timer3 = setTimeout(() => setLoadingProgress(0), 450);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [currentView, activeCategory, isInitialLoading]);

  // Automated Horizontal Categories scroll timer
  useEffect(() => {
    if (isInitialLoading || categories.length === 0) return;
    const interval = setInterval(() => {
      const el = categoryTrackRef.current;
      if (el) {
        // Scroll right. If near the end, wrap smoothly back to 0
        const cardWidth = 220 + 16; // width + gap
        if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 20) {
          el.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          el.scrollBy({ left: cardWidth, behavior: 'smooth' });
        }
      }
    }, 4500); // Exquisite transition every 4.5 seconds

    return () => clearInterval(interval);
  }, [isInitialLoading, categories]);

  // Slider automated transition timer
  useEffect(() => {
    if (banners.length === 0) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % banners.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [banners]);

  // Client SPA Routing for direct /admin URL access
  useEffect(() => {
    const checkAdminRoute = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === '/admin' || hash === '#/admin' || hash === '#admin') {
        setCurrentView('admin');
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    };

    checkAdminRoute();
    window.addEventListener('popstate', checkAdminRoute);
    window.addEventListener('hashchange', checkAdminRoute);
    return () => {
      window.removeEventListener('popstate', checkAdminRoute);
      window.removeEventListener('hashchange', checkAdminRoute);
    };
  }, []);

  // Lock document body scroll when any drawer is active
  useEffect(() => {
    if (mobileMenuOpen || wishlistOpen || cartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen, wishlistOpen, cartOpen]);

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

  // Complete Add to Cart systems
  const handleAddToCart = (product: Product, quantity: number, size: string, customMeasurements?: any) => {
    setCart((prevCart) => {
      const cartItemId = `${product.id}-${size}`;
      const existingIdx = prevCart.findIndex(item => item.id === cartItemId);
      let updated;
      if (existingIdx > -1) {
        updated = [...prevCart];
        updated[existingIdx].quantity += quantity;
      } else {
        updated = [
          ...prevCart,
          {
            id: cartItemId,
            product,
            quantity,
            selectedSize: size,
            customMeasurements
          }
        ];
      }
      localStorage.setItem('mushq_cart', JSON.stringify(updated));
      return updated;
    });
    setCartOpen(true); // Auto reveal the cart beautifully
  };

  const handleUpdateCartQty = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(itemId);
      return;
    }
    setCart((prevCart) => {
      const updated = prevCart.map(item => item.id === itemId ? { ...item, quantity } : item);
      localStorage.setItem('mushq_cart', JSON.stringify(updated));
      return updated;
    });
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart((prevCart) => {
      const updated = prevCart.filter(item => item.id !== itemId);
      localStorage.setItem('mushq_cart', JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearCart = () => {
    setCart([]);
    localStorage.removeItem('mushq_cart');
  };

  // Add inquiry checkout triggered via WhatsApp form
  const handleNewInquiryLog = async (inq: Omit<Inquiry, 'id' | 'date'>) => {
    await addInquiry(inq);
    await refreshDatabase(); // Refresh local back-office variables
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
      
      {/* Dynamic Top Navigation Progress Bar */}
      {loadingProgress > 0 && (
        <div 
          className="fixed top-0 left-0 h-[3px] bg-gradient-to-r from-emerald-600 via-gold-400 to-gold-500 z-[999] transition-all duration-300 ease-out" 
          style={{ width: `${loadingProgress}%` }}
        />
      )}

      {/* Luxury Initial Brand Intro Screen */}
      <AnimatePresence>
        {isInitialLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 bg-emerald-950 z-[9999] flex flex-col items-center justify-center text-[#fff]"
          >
            <div className="text-center space-y-6 px-6">
              {/* Luxury Monogram Reveal */}
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="relative inline-block"
              >
                {/* Golden rotating/shimmering halo ring */}
                <div className="absolute -inset-4 border border-gold-400/25 rounded-full animate-[spin_10s_linear_infinite]" />
                <div className="absolute -inset-1 border border-dashed border-gold-300/10 rounded-full animate-[spin_18s_linear_infinite]" />
                
                {/* Monogram Box */}
                <div className="w-20 h-20 bg-emerald-900 border border-gold-350/40 rounded-full flex items-center justify-center shadow-2xl relative">
                  <span className="font-serif text-3xl font-bold text-gold-400 tracking-wider font-semibold">M</span>
                </div>
              </motion.div>

              {/* Brand Lettering */}
              <div className="space-y-2">
                <motion.h1
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="font-serif text-2xl md:text-3xl font-extrabold tracking-[0.2em] text-cream-50 uppercase"
                >
                  Outfits by Mushq
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.7 }}
                  transition={{ delay: 0.6, duration: 1 }}
                  className="text-[9px] font-sans font-bold uppercase tracking-[0.3em] text-gold-300"
                >
                  Sartorial Luxury Concierge • Stitched & Unstitched
                </motion.p>
              </div>

              {/* Luxury Progress Bar Indicator */}
              <div className="w-56 h-[2px] bg-neutral-800 rounded-full mx-auto overflow-hidden relative">
                <motion.div
                  initial={{ left: '-100%' }}
                  animate={{ left: '100%' }}
                  transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
                  className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-gold-400 to-transparent"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
        cartCount={cart.reduce((total, item) => total + item.quantity, 0)}
        onOpenCart={() => setCartOpen(true)}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        storeName={storeName}
        whatsappNumber={whatsappNumber}
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
                        className="flex flex-col sm:flex-row gap-3 mt-6 sm:mt-8 w-full sm:w-auto"
                      >
                        <button
                          onClick={() => {
                            setActiveCategory('all');
                            setCurrentView('shop');
                          }}
                          className="bg-gold-500 hover:bg-gold-600 font-bold text-emerald-950 py-3 px-5 sm:py-3.5 sm:px-8 rounded-none text-[11px] sm:text-xs tracking-[0.2em] sm:tracking-[0.25em] uppercase transition-all select-none cursor-pointer text-center w-full sm:w-auto"
                        >
                          Explore Brand
                        </button>
                        <button
                          onClick={() => {
                            setActiveCategory('party-wear');
                            setCurrentView('shop');
                          }}
                          className="bg-transparent hover:bg-[#fff]/10 border border-[#fff] font-bold text-[#fff] py-3 px-5 sm:py-3.5 sm:px-8 rounded-none text-[11px] sm:text-xs tracking-[0.2em] sm:tracking-[0.25em] uppercase transition-all select-none cursor-pointer text-center w-full sm:w-auto"
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

            {/* FEATURED CATEGORIES EDITORIAL INDEX SLIDER */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
              <div className="flex items-center justify-between mb-8 select-none">
                <div className="w-1/3 h-[1px] bg-gradient-to-r from-transparent to-gold-400" />
                <h3 className="text-[12px] font-bold tracking-[0.35em] text-gold-700 uppercase text-center font-sans shrink-0 px-2">
                  Featured Boutique Divisions
                </h3>
                <div className="w-1/3 h-[1px] bg-gradient-to-l from-transparent to-gold-400" />
              </div>
              
              <div className="relative group/carousel">
                {/* Desktop navigation arrows */}
                <button
                  onClick={() => categoryTrackRef.current?.scrollBy({ left: -240, behavior: 'smooth' })}
                  className="absolute -left-5 top-1/2 transform -translate-y-1/2 bg-[#fff]/95 border border-cream-200 hover:border-gold-500 text-emerald-950 w-10 h-10 rounded-full shadow-md z-30 opacity-0 group-hover/carousel:opacity-100 focus:opacity-100 hover:scale-105 transition-all duration-300 cursor-pointer hidden md:flex items-center justify-center hover:bg-cream-50"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-5 h-5 text-gold-600" />
                </button>
                
                <button
                  onClick={() => categoryTrackRef.current?.scrollBy({ left: 240, behavior: 'smooth' })}
                  className="absolute -right-5 top-1/2 transform -translate-y-1/2 bg-[#fff]/95 border border-cream-200 hover:border-gold-500 text-emerald-950 w-10 h-10 rounded-full shadow-md z-30 opacity-0 group-hover/carousel:opacity-100 focus:opacity-100 hover:scale-105 transition-all duration-300 cursor-pointer hidden md:flex items-center justify-center hover:bg-cream-50"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-5 h-5 text-gold-600" />
                </button>

                {/* Horizontal scrollable row wrapper */}
                <div
                  ref={categoryTrackRef}
                  className="flex gap-4 overflow-x-auto snap-x snap-mandatory py-3 px-1.5 scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                  {categories.map((cat, idx) => (
                    <div
                      key={cat.id}
                      onClick={() => {
                        setActiveCategory(cat.slug);
                        setCurrentView('shop');
                      }}
                      className="flex-shrink-0 w-[180px] md:w-[220px] snap-start bg-[#fff] border border-cream-150 rounded-xl overflow-hidden shadow-xs hover:shadow-md hover:border-gold-300 transition-all duration-300 p-5 cursor-pointer flex flex-col justify-between min-h-[190px] group relative"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] text-[#064e3b]/40 tracking-wider font-mono font-bold">0{idx + 1}</span>
                        <div className="w-12 h-12 border border-cream-150 overflow-hidden rounded-full shadow-xs opacity-90 group-hover:opacity-100 group-hover:border-gold-500 transition-all">
                          <img
                            src={cat.image}
                            alt={cat.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-6 flex flex-col">
                        <h4 className="font-serif text-[14px] text-emerald-950 font-bold group-hover:text-gold-600 transition-colors uppercase tracking-wide">
                          {cat.name}
                        </h4>
                        <span className="text-[10px] text-neutral-400 mt-1 uppercase font-semibold font-sans tracking-wider opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-1 animate-in fade-in slide-in-from-bottom-1 duration-150">
                          <span>Browse Closet</span>
                          <span>→</span>
                        </span>
                      </div>
                      
                      {/* Premium card corner decorations */}
                      <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-transparent group-hover:border-gold-300/30 rounded-tr-xl transition-all" />
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-transparent group-hover:border-gold-300/30 rounded-bl-xl transition-all" />
                    </div>
                  ))}
                </div>
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
                  {reviews.filter(r => r.verified).slice(0, 6).map((rev) => (
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
                        <span className="bg-emerald-50 text-emerald-800 text-[9px] font-bold px-2.5 py-1 rounded flex items-center gap-1.5 font-mono select-none">
                          <Check className="w-3 h-3 text-emerald-700 font-extrabold" />
                          <span>Verified Buyer</span>
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
                  Connect directly with {storeName}’s elite in-house boutique tailors. Request custom arm lengths, neckline modifications, custom shades, or seek advice on your size chart parameters live via WhatsApp!
                </p>
                <a
                  href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`}
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
                  <div className="flex md:flex-col overflow-x-auto md:overflow-x-visible -mx-2 px-2 md:mx-0 md:px-0 gap-2 pb-2 md:pb-0 scrollbar-none select-none">
                    <button
                      onClick={() => setActiveCategory('all')}
                      className={`text-center md:text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap shrink-0 px-3.5 py-2 md:py-1 md:px-0 md:bg-transparent md:border-l-2 rounded-full md:rounded-none transition-all ${
                        activeCategory === 'all' 
                          ? 'bg-emerald-950 text-[#fff] border-emerald-950 md:border-[#ab8215] md:text-[#ab8215] font-bold' 
                          : 'bg-cream-100/80 border-transparent text-neutral-700 hover:text-gold-600 md:bg-transparent'
                      }`}
                    >
                      ✨ All Closets
                    </button>
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setActiveCategory(c.slug)}
                        className={`text-center md:text-left text-xs font-semibold whitespace-nowrap shrink-0 px-3.5 py-2 md:py-1 md:px-0 md:bg-transparent md:border-l-2 rounded-full md:rounded-none transition-all ${
                          activeCategory === c.slug 
                            ? 'bg-emerald-950 text-[#fff] border-emerald-950 md:border-[#ab8215] md:text-[#ab8215] font-bold' 
                            : 'bg-cream-100/80 border-transparent text-neutral-600 hover:text-gold-600 md:bg-transparent'
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
            onAddToCart={handleAddToCart}
            reviews={reviews}
            onAddReview={async (newReview) => {
              await addReview(newReview);
              await refreshDatabase();
            }}
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
          
          <div className="fixed inset-y-0 right-0 max-w-full pl-3 sm:pl-10 flex">
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
                    Review your curated vault items. Select custom sizing options, custom lengths, and verify your selections directly with our design concierge on WhatsApp.
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

      {/* SLA INTERACTIVE MOBILE NAVIGATION DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[9999] flex justify-start">
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-[#000]/60 backdrop-blur-xs transition-opacity duration-300 cursor-pointer" 
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Main off-canvas sheet panel */}
          <div className="relative flex flex-col w-[85%] sm:w-[80%] max-w-sm bg-[#faf9f5] h-full shadow-2xl border-r border-cream-150 overflow-hidden pointer-events-auto z-10 transition-all duration-300 animate-in slide-in-from-left">
            
            {/* Pinned top block info */}
            <div className="p-6 pb-4 border-b border-cream-100 flex justify-between items-center bg-[#faf9f5] shrink-0">
              <div 
                className="flex flex-col select-none cursor-pointer" 
                onClick={() => {
                  setActiveCategory('all');
                  setCurrentView('home');
                  setMobileMenuOpen(false);
                }}
              >
                <span className="text-xl font-serif font-bold tracking-[0.16em] text-emerald-950">MUSHQ</span>
                <span className="text-[8px] tracking-[0.4em] text-gold-600 font-bold uppercase -mt-0.5">OUTFITS</span>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)} 
                className="p-2.5 text-emerald-950 bg-cream-100/80 hover:bg-cream-150 rounded-full cursor-pointer focus:outline-none transition-all active:scale-90 flex items-center justify-center"
                aria-label="Close menu"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Pinned Search bar block */}
            <div className="px-6 py-4 border-b border-cream-100/50 bg-[#faf9f5] shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 text-emerald-800 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Search outfits..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (currentView !== 'shop') {
                      setCurrentView('shop');
                    }
                  }}
                  className="w-full bg-[#fff] border border-cream-200 rounded-lg pl-10 pr-4 py-3 text-xs text-emerald-950 focus:outline-none focus:ring-1 focus:ring-gold-400 font-sans shadow-xs"
                />
              </div>
            </div>

            {/* Smooth momentum scrolling collections content area */}
            <div className="flex-grow overflow-y-auto overscroll-behavior-contain scroll-smooth p-6 space-y-6 scrollbar-none">
              
              {/* Core Links section */}
              <div>
                <span className="text-[9.5px] tracking-[0.25em] font-extrabold text-gold-600 uppercase mb-3 block">Collections</span>
                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() => {
                      setCurrentView('home');
                      setMobileMenuOpen(false);
                    }}
                    className={`text-left text-xs font-bold uppercase tracking-wider py-3 px-3.5 h-11 rounded-md transition-all flex items-center gap-2.5 ${currentView === 'home' ? 'bg-gold-500/10 text-gold-700' : 'text-emerald-950 hover:bg-cream-100/50'}`}
                  >
                    <span>🏡</span>
                    <span>Home Page</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setActiveCategory('all');
                      setCurrentView('shop');
                      setMobileMenuOpen(false);
                    }}
                    className={`text-left text-xs font-bold uppercase tracking-wider py-3 px-3.5 h-11 rounded-md transition-all flex items-center gap-2.5 ${currentView === 'shop' && activeCategory === 'all' ? 'bg-gold-500/10 text-gold-700' : 'text-emerald-950 hover:bg-cream-100/50'}`}
                  >
                    <span>👜</span>
                    <span>View All Outfits</span>
                  </button>
                </div>
              </div>

              {/* Collections classification block lists */}
              <div className="pt-2">
                <span className="text-[9.5px] tracking-[0.25em] font-extrabold text-gold-600 uppercase mb-3 block">Filter by Fabric & Collection</span>
                <div className="flex flex-col gap-1 border-l border-cream-150 pl-1 ml-1">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setActiveCategory(cat.slug);
                        setCurrentView('shop');
                        setMobileMenuOpen(false);
                      }}
                      className={`text-left text-xs font-semibold tracking-wide py-3 px-4 h-11 rounded-md transition-all flex items-center justify-between ${
                        activeCategory === cat.slug && currentView === 'shop' 
                          ? 'bg-gold-500/10 text-gold-700 font-bold' 
                          : 'text-neutral-700 hover:bg-cream-100/30'
                      }`}
                    >
                      <span className="truncate">✦ {cat.name}</span>
                      <span className="text-[9.5px] font-mono text-neutral-400 shrink-0 ml-2">→</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact panel supporting quick action */}
              <div className="border-t border-cream-150 pt-6 flex flex-col gap-3 pb-4">
                <div className="flex items-center gap-2.5 text-xs text-neutral-600 font-medium bg-[#fff] border border-cream-100 p-3 h-12 rounded-lg shadow-2xs">
                  <MessageSquare className="w-4 h-4 text-emerald-800 shrink-0" />
                  <span className="font-semibold text-[11px] font-mono">+92 302 0038010</span>
                </div>
                <p className="text-[9.5px] text-neutral-400 font-sans leading-relaxed select-none">
                  Contact our customer support team live on WhatsApp for boutique consultation or direct order issues.
                </p>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* SLA INTERACTIVE CART DRAWER SIDEBAR */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-transparent">
          {/* Backdrop screen */}
          <div className="fixed inset-0 bg-[#000]/40 backdrop-blur-sm transition-opacity" onClick={() => setCartOpen(false)} />
          
          <div className="fixed inset-y-0 right-0 max-w-full pl-3 sm:pl-10 flex text-xs">
            <div className="w-screen max-w-md bg-[#faf9f5] shadow-2xl relative flex flex-col h-full border-l border-cream-100 animate-in slide-in-from-right duration-300">
              <div className="px-6 py-5 bg-emerald-950 text-[#fff] flex items-center justify-between shadow-md">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-gold-400" />
                  <span className="font-serif font-bold text-md tracking-wider uppercase select-none">My Luxury Bag ({cart.reduce((t, i) => t + i.quantity, 0)})</span>
                </div>
                <button onClick={() => setCartOpen(false)} className="p-2 bg-emerald-900 rounded-full cursor-pointer text-[#fff] font-mono hover:bg-emerald-800 transition-all select-none">✕</button>
              </div>

              {/* Cart items list scrollable */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scroll">
                {cart.length === 0 ? (
                  <div className="text-center text-neutral-400 py-16 space-y-4">
                    <ShoppingBag className="w-12 h-12 text-cream-250 mx-auto" />
                    <p className="font-medium font-serif text-sm text-neutral-600 select-none">Your shopping bag is empty</p>
                    <p className="text-[11px] max-w-xs mx-auto text-neutral-400 leading-relaxed select-none">
                      Explore our premium embroidered lawns and royal party wear to add your first selection!
                    </p>
                    <button 
                      onClick={() => {
                        setCurrentView('shop');
                        setCartOpen(false);
                      }}
                      className="mt-4 px-6 py-2.5 bg-emerald-950 text-cream-50 uppercase tracking-widest text-[10px] font-bold transition-all hover:bg-emerald-900 shadow cursor-pointer select-none"
                    >
                      Shop Collections
                    </button>
                  </div>
                ) : (
                  cart.map((item) => {
                    const price = item.product.salePrice || item.product.price;
                    return (
                      <div key={item.id} className="bg-[#fff] border border-cream-100 p-3.5 rounded-lg shadow-xs flex gap-3.5 group relative animate-in zoom-in-95 duration-200">
                        <img 
                          src={item.product.images[0]} 
                          alt={item.product.title} 
                          referrerPolicy="no-referrer" 
                          className="w-16 aspect-[3/4] object-cover rounded border border-cream-100 shadow-sm shrink-0" 
                        />
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="font-bold text-neutral-800 line-clamp-1 font-serif text-xs">{item.product.title}</h4>
                              <button
                                onClick={() => handleRemoveFromCart(item.id)}
                                className="text-rose-500 hover:text-rose-700 cursor-pointer p-0.5"
                                title="Remove item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <span className="text-[9px] text-neutral-400 block mt-0.5 uppercase tracking-wide font-mono">SKU: {item.product.sku}</span>
                            <div className="mt-1 flex flex-wrap gap-1.5 items-center">
                              <span className="text-[10px] bg-cream-100 text-[#ab8215] font-bold px-1.5 py-0.5 rounded font-mono">
                                Size: {item.selectedSize}
                              </span>
                              {item.customMeasurements && (
                                <span className="text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-100 px-1 py-0.5 rounded max-w-full truncate font-serif italic" title="Custom stitch measurements provided">
                                  ✂️ Bespoke stitching
                                </span>
                              )}
                            </div>
                            
                            {item.customMeasurements && (
                              <div className="mt-1.5 p-1.5 bg-cream-50/50 rounded text-[9.5px] text-neutral-500 font-mono grid grid-cols-2 gap-x-2 border border-cream-100">
                                <span>Bust: {item.customMeasurements.bust}"</span>
                                <span>Shirt: {item.customMeasurements.shirtLength}"</span>
                                <span>Waist: {item.customMeasurements.waist}"</span>
                                <span>Trouser: {item.customMeasurements.trouserLength}"</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between border-t border-cream-50 pt-2 mt-2">
                            <span className="font-mono font-bold text-emerald-950 text-xs">Rs. {(price * item.quantity).toLocaleString()}</span>
                            
                            {/* Quantity buttons */}
                            <div className="flex items-center border border-cream-150 bg-cream-50/50 rounded overflow-hidden">
                              <button 
                                onClick={() => handleUpdateCartQty(item.id, item.quantity - 1)}
                                className="px-2 py-1 text-neutral-500 hover:bg-cream-100 font-bold transition-all select-none cursor-pointer"
                              >
                                -
                              </button>
                              <span className="px-2 bg-white font-mono font-bold text-neutral-800 text-[11px] text-center w-6">
                                {item.quantity}
                              </span>
                              <button 
                                onClick={() => handleUpdateCartQty(item.id, item.quantity + 1)}
                                className="px-2 py-1 text-neutral-500 hover:bg-cream-100 font-bold transition-all select-none cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Cart Drawer Checkout Footer section */}
              {cart.length > 0 && (
                <div className="bg-cream-100/60 p-5 border-t border-cream-200">
                  <div className="flex justify-between items-center mb-4 text-xs font-serif font-bold text-emerald-950 border-b border-cream-150 pb-3">
                    <span className="uppercase tracking-widest text-[10px]">Estimated Cart Subtotal:</span>
                    <span className="text-sm font-mono tracking-normal">
                      Rs. {cart.reduce((total, item) => total + ((item.product.salePrice || item.product.price) * item.quantity), 0).toLocaleString()}
                    </span>
                  </div>

                  {/* Checkout Form */}
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!cartName.trim()) {
                        alert('Please fill in your name to initialize custom checkout.');
                        return;
                      }

                      // Build grand message
                      const totalCartValue = cart.reduce((total, item) => total + ((item.product.salePrice || item.product.price) * item.quantity), 0);
                      
                      let message = `Assalamualaikum ${storeName} Karachi,\n\nI would like to place an order from my shopping cart.\n\n*Customer Details:*\n- Name: ${cartName}`;
                      if (cartPhone) {
                        message += `\n- WhatsApp Contact: ${cartPhone}`;
                      }
                      if (cartAddress) {
                        message += `\n- Shipping Address: ${cartAddress}`;
                      }
                      
                      message += `\n\n*Ordered Items:*\n=============================`;
                      
                      cart.forEach((item, index) => {
                        const price = item.product.salePrice || item.product.price;
                        message += `\n\n${index + 1}. *${item.product.title}*`;
                        message += `\n   - SKU: ${item.product.sku}`;
                        message += `\n   - Sizing: ${item.selectedSize}`;
                        if (item.customMeasurements) {
                          message += `\n   - Measurements: Bust: ${item.customMeasurements.bust}", Shirt: ${item.customMeasurements.shirtLength}", Waist: ${item.customMeasurements.waist}", Trouser: ${item.customMeasurements.trouserLength}"`;
                        }
                        message += `\n   - Qty: ${item.quantity}`;
                        message += `\n   - Item Price: Rs. ${price.toLocaleString()}`;
                        message += `\n   - Link: https://outfitsbymushq.netlify.app/product/${item.product.id}`;
                      });
                      
                      message += `\n\n=============================\n\n*Grand Subtotal:* Rs. ${totalCartValue.toLocaleString()}\n\nThank you!`;

                      // Encode message
                      const encodedText = encodeURIComponent(message);
                      const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodedText}`;

                      // Register each item in backend db inquiries
                      Promise.all(cart.map(item => 
                        addInquiry({
                          customerName: cartName,
                          customerPhone: cartPhone || 'WhatsApp Client',
                          productTitle: `${item.product.title} (Size: ${item.selectedSize})`,
                          price: `Rs. ${(item.product.salePrice || item.product.price).toLocaleString()} x ${item.quantity}`,
                          sku: item.product.sku,
                          productLink: `https://outfitsbymushq.netlify.app/product/${item.product.id}`
                        })
                      )).finally(() => {
                        refreshDatabase();
                      });

                      // Reset cart
                      setCart([]);
                      localStorage.removeItem('mushq_cart');
                      setCartOpen(false);

                      // Open WhatsApp
                      window.open(whatsappUrl, '_blank');
                    }}
                    className="space-y-3.5 pt-1.5"
                  >
                    <span className="block text-[11px] font-bold text-gold-600 tracking-widest uppercase mb-1 flex items-center gap-1.5 select-none font-serif">
                      <ShoppingBag className="w-3.5 h-3.5 text-gold-500" />
                      <span>Direct WhatsApp Checkout Service</span>
                    </span>

                    <div>
                      <input
                        type="text"
                        placeholder="Your Full Name *"
                        required
                        value={cartName}
                        onChange={(e) => setCartName(e.target.value)}
                        className="w-full bg-[#fff] border border-cream-200 rounded px-3 py-2.5 text-xs text-neutral-800 focus:outline-none focus:border-emerald-800"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="tel"
                        placeholder="WhatsApp Number"
                        value={cartPhone}
                        onChange={(e) => setCartPhone(e.target.value)}
                        className="w-full bg-[#fff] border border-cream-200 rounded px-3 py-2.5 text-xs text-neutral-800 focus:outline-none focus:border-emerald-800 font-mono"
                      />
                      <input
                        type="text"
                        placeholder="Shipping Address / City"
                        required
                        value={cartAddress}
                        onChange={(e) => setCartAddress(e.target.value)}
                        className="w-full bg-[#fff] border border-cream-200 rounded px-3 py-2.5 text-xs text-neutral-800 focus:outline-none focus:border-emerald-800"
                      />
                    </div>

                    <p className="text-[9.5px] text-neutral-400 leading-tight select-none">
                      * Cart orders compile inside your back-office registry. A secure booking sheet launches on WhatsApp automatically.
                    </p>

                    <button
                      type="submit"
                      className="w-full bg-emerald-950 text-cream-50 font-bold tracking-widest text-[11px] py-4 uppercase rounded shadow hover:bg-emerald-900 transition-colors cursor-pointer flex items-center justify-center gap-2 select-none"
                    >
                      <MessageSquare className="w-4 h-4 text-gold-400" />
                      <span>ORDER CART ON WHATSAPP SECURELY</span>
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Custom operational bottom assurance band */}
      <Footer 
        onSelectCategory={setActiveCategory} 
        onChangeView={setCurrentView} 
        storeName={storeName}
        whatsappNumber={whatsappNumber}
        facebookLink={facebookLink}
      />
    </div>
  );
}
