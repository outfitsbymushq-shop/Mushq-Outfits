import React, { useState } from 'react';
import { ChevronLeft, MessageSquare, ShieldCheck, Sparkles, MapPin, Ruler, HelpCircle, Check, ShoppingBag, Video, Palette, Star, Globe } from 'lucide-react';
import { Product, Inquiry, Review } from '../types';
import { getCustomWebsiteConfigs } from '../storage';
import { useCurrency } from '../currencyContext';

// Universal parser to extract video ID from standard YouTube links, Shorts, and Share links
function getYouTubeId(url: string | undefined | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  
  // 1. YouTube Shorts link
  if (trimmed.includes('/shorts/')) {
    const parts = trimmed.split('/shorts/');
    if (parts[1]) {
      return parts[1].split(/[?#&]/)[0];
    }
  }
  
  // 2. Standard watch URL (watch?v=) Or mobile (m.youtube.com)
  if (trimmed.includes('v=')) {
    const parts = trimmed.split('v=');
    if (parts[1]) {
      return parts[1].split(/[?#&]/)[0];
    }
  }
  
  // 3. Short Share link (youtu.be/)
  if (trimmed.includes('youtu.be/')) {
    const parts = trimmed.split('youtu.be/');
    if (parts[1]) {
      return parts[1].split(/[?#&]/)[0];
    }
  }
  
  // 4. Embed link
  if (trimmed.includes('/embed/')) {
    const parts = trimmed.split('/embed/');
    if (parts[1]) {
      return parts[1].split(/[?#&]/)[0];
    }
  }

  // Fallback RegExp to capture 11-char ID from generic links
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = trimmed.match(regExp);
  if (match && match[2] && match[2].length === 11) {
    return match[2];
  }
  
  return null;
}

// Custom parser to split string-oriented sizing configurations into structured row objects for HTML table representation
function parseSizingChart(text: string) {
  try {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const rows: Array<{ size: string; chest?: string; waist?: string; shoulder?: string; length?: string }> = [];
    
    for (const line of lines) {
      if (!line.includes(':')) continue;
      const parts = line.split(':');
      const size = parts[0].trim();
      const rest = parts.slice(1).join(':');
      
      const measurements = rest.split('|');
      let chest = '';
      let waist = '';
      let shoulder = '';
      let length = '';
      
      for (const m of measurements) {
        const mParts = m.split(':');
        if (mParts.length === 2) {
          const key = mParts[0].trim().toLowerCase();
          const val = mParts[1].trim();
          if (key.includes('chest')) chest = val;
          else if (key.includes('waist')) waist = val;
          else if (key.includes('shoulder')) shoulder = val;
          else if (key.includes('length')) length = val;
        }
      }
      
      if (size && (chest || waist || shoulder || length)) {
        rows.push({ size, chest, waist, shoulder, length });
      }
    }
    
    return rows.length > 0 ? rows : null;
  } catch (error) {
    return null;
  }
}

interface ProductDetailsProps {
  product: Product;
  onGoBack: () => void;
  onAddInquiry: (inquiry: Omit<Inquiry, 'id' | 'date'>) => void;
  onAddToCart: (product: Product, quantity: number, size: string, customMeasurements?: any) => void;
  reviews: Review[];
  onAddReview: (review: Review) => Promise<void>;
}

export default function ProductDetails({
  product,
  onGoBack,
  onAddInquiry,
  onAddToCart,
  reviews,
  onAddReview
}: ProductDetailsProps) {
  const { formatPrice } = useCurrency();
  const webConfigs = getCustomWebsiteConfigs();
  const [activeImage, setActiveImage] = useState(product.images[0]);
  const [selectedSize, setSelectedSize] = useState<string>(product.sizeInfo?.[0] || 'Unstitched');
  const [selectedColor, setSelectedColor] = useState<string>(product.colors?.[0] || '');
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isInlineVideoPlaying, setIsInlineVideoPlaying] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  
  // New review form states
  const [revName, setRevName] = useState('');
  const [revLocation, setRevLocation] = useState('');
  const [revRating, setRevRating] = useState(5);
  const [revComment, setRevComment] = useState('');
  const [revSubmitted, setRevSubmitted] = useState(false);
  const [revSubmitting, setRevSubmitting] = useState(false);
  
  // Custom stitching parameters
  const [bustSize, setBustSize] = useState('');
  const [shirtLength, setShirtLength] = useState('');
  const [waistSize, setWaistSize] = useState('');
  const [trouserLength, setTrouserLength] = useState('');
  const [showStitchingForm, setShowStitchingForm] = useState(false);
  
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Accordion triggers
  const [activeTab, setActiveTab] = useState<'fabric' | 'sizing' | 'delivery'>('fabric');

  const hasSale = !!product.salePrice && product.salePrice < product.price;
  const currentPrice = hasSale ? product.salePrice! : product.price;

  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
    if (size.toLowerCase().includes('custom') || size.toLowerCase().includes('stitch')) {
      setShowStitchingForm(true);
    } else {
      setShowStitchingForm(false);
    }
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      alert('Please fill in your name to generate the WhatsApp order.');
      return;
    }
    if (!customerAddress.trim()) {
      alert('Please fill in your complete shipping address to generate the WhatsApp order.');
      return;
    }

    const priceText = formatPrice(currentPrice);
    const productUrl = `https://outfitsbymushq.netlify.app/product/${product.id}`;
    
    // Construct WhatsApp message content precisely in the requested template
    let message = `Assalamualaikum,
 
I would like to order this product.
 
Product Name:
${product.title}
 
Price:
${priceText}
 
Product ID:
${product.sku}
 
Product Link:
${productUrl}`;

    if (showStitchingForm) {
      message += `\n\nMeasurements (Custom Stitching):\n- Bust: ${bustSize || 'Standard'} in\n- Shirt Length: ${shirtLength || 'Standard'} in\n- Waist: ${waistSize || 'Standard'} in\n- Trouser Length: ${trouserLength || 'Standard'} in`;
    } else {
      message += `\n\nSelected Size: ${selectedSize}`;
    }

    if (selectedColor) {
      message += `\nSelected Color Variation: ${selectedColor}`;
    }

    message += `\n\nCustomer Details:\n- Name: ${customerName}`;
    if (customerPhone) {
      message += `\n- WhatsApp Contact: ${customerPhone}`;
    }
    message += `\n- Shipping Address: ${customerAddress}`;

    // Encode text
    const encodedText = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/923020038010?text=${encodedText}`;

    // Add Inquiry to Database Log
    onAddInquiry({
      customerName: customerName,
      customerPhone: customerPhone || 'WhatsApp Client',
      productTitle: product.title,
      price: priceText,
      sku: product.sku,
      productLink: productUrl
    });

    setOrderPlaced(true);

    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
  };

  const handleAddToCartBtn = () => {
    let customMeasurements = undefined;
    if (showStitchingForm) {
      customMeasurements = {
        bust: bustSize || 'Standard',
        shirtLength: shirtLength || 'Standard',
        waist: waistSize || 'Standard',
        trouserLength: trouserLength || 'Standard'
      };
    }
    onAddToCart(product, 1, selectedSize, customMeasurements);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revName.trim() || !revComment.trim()) {
      alert('Please write your name and a comment before submitting.');
      return;
    }
    setRevSubmitting(true);
    try {
      await onAddReview({
        id: 'rev_' + Math.random().toString(36).substring(2, 11),
        name: revName,
        location: revLocation || 'Karachi, Pakistan',
        rating: revRating,
        comment: revComment,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        verified: false // Must be verified by admin before public viewing
      });
      setRevSubmitted(true);
      setRevName('');
      setRevLocation('');
      setRevComment('');
      setRevRating(5);
    } catch (err) {
      console.error('Failed submitting review:', err);
    } finally {
      setRevSubmitting(false);
    }
  };

  return (
    <div id="product-detail-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Back to Shop Nav bar */}
      <button
        onClick={onGoBack}
        id="btn-back-to-shop"
        className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-950 hover:text-gold-600 mb-8 cursor-pointer select-none transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to All Collections</span>
      </button>

      {/* Main showcase card columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-[#fff] border border-cream-100 rounded-2xl p-6 md:p-10 shadow-sm">
        
        {/* LEFT COLUMN: Gallery View (5 cols on lg) */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          {/* Active Primary Showcase image */}
          <div className="relative aspect-[3/4] bg-cream-50 rounded-xl overflow-hidden border border-cream-100 group">
            <img
              src={activeImage}
              alt={product.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
            {hasSale && (
              <span className="absolute top-4 left-4 bg-rose-700 text-[#fff] text-[10px] font-extrabold tracking-widest px-3 py-1.5 rounded uppercase">
                SALE ACTIVED
              </span>
            )}
            {product.videoUrl && (
              <button 
                type="button"
                onClick={() => setIsVideoPlaying(true)}
                title="Watch outfit walk-through video"
                className="absolute top-4 right-4 bg-[#000]/60 backdrop-blur-md hover:bg-emerald-950 text-gold-400 p-3 rounded-full hover:shadow-lg transition-all hover:scale-105 cursor-pointer border border-[#fff]/10 flex items-center gap-2 overflow-hidden max-w-[44px] hover:max-w-[150px] transition-all duration-300 group"
              >
                <Video className="w-4 h-4 text-gold-400 shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-cream-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Play Video</span>
              </button>
            )}
            <span className="absolute bottom-4 right-4 bg-emerald-950/80 backdrop-blur-sm text-cream-50 text-[10px] tracking-wide px-3 py-1 bg-opacity-70 rounded-full font-mono">
              SKU: {product.sku}
            </span>
          </div>

          {/* Thumbnails grid */}
          <div className="flex gap-3 overflow-x-auto py-1">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(img)}
                className={`relative aspect-[3/4] w-20 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                  activeImage === img ? 'border-gold-500 scale-95 shadow-md' : 'border-cream-100 hover:border-gold-300'
                }`}
              >
                <img src={img} alt={`${product.title} thumb ${idx}`} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Details (6 cols on lg) */}
        <div className="lg:col-span-6 flex flex-col gap-5 justify-between">
          <div>
            {/* 1. Title */}
            <h1 className="text-xl md:text-2xl font-bold uppercase tracking-wide text-neutral-900 mt-2 mb-1 font-sans">
              {product.title.toUpperCase()}
            </h1>

            {/* 2. Price / Sale Price */}
            <div className="flex items-center gap-3 mb-1 select-none text-sm md:text-base font-sans font-semibold text-emerald-950">
              {hasSale ? (
                <>
                  <span className="text-neutral-500 line-through text-xs font-normal">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-rose-700 font-bold">
                    {formatPrice(product.salePrice!)}
                  </span>
                </>
              ) : (
                <span className="text-neutral-900 font-bold">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            {/* SKU Tag inline below price matching mockup image */}
            <div className="text-[11px] text-neutral-400 font-sans tracking-wide uppercase mb-3.5">
              SKU: {product.sku || 'N/A'}
            </div>

            {/* 3. Worldwide Delivery Label */}
            <div className="flex items-center gap-2 mb-4 bg-emerald-50/50 border border-emerald-100/60 px-3 py-2 rounded-xl max-w-fit shadow-2xs">
              <Globe className="w-4 h-4 text-emerald-800 shrink-0" />
              <span className="text-[10.5px] font-bold text-emerald-900 uppercase tracking-widest font-sans flex items-center gap-1.5 leading-none">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse inline-block font-sans"></span>
                Worldwide Express Courier Delivery Available
              </span>
            </div>

            {/* 4. Product Video (Compact Beautiful Supporting Inline Section) */}
            {product.videoUrl && (() => {
              const videoId = getYouTubeId(product.videoUrl);
              return videoId ? (
                <div className="my-4.5 border border-cream-200 bg-[#fbfbfa] rounded-xl overflow-hidden shadow-3xs transition-all duration-300">
                  {!isInlineVideoPlaying ? (
                    <button
                      type="button"
                      onClick={() => setIsInlineVideoPlaying(true)}
                      className="w-full flex items-center justify-between p-2 text-left group cursor-pointer transition-all hover:bg-cream-50/45 animate-in fade-in duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative w-15 h-9.5 rounded-md overflow-hidden bg-neutral-100 border border-cream-150 shrink-0 shadow-3xs">
                          <img 
                            src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`} 
                            alt="Walkthrough Preview" 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <div className="absolute inset-0 bg-neutral-900/15 flex items-center justify-center group-hover:bg-neutral-900/25 transition-all w-full h-full">
                            <div className="bg-emerald-900 text-gold-400 p-1.5 rounded-full shadow-xs group-hover:scale-110 transition-transform duration-300 text-center">
                              <svg className="w-2.5 h-2.5 fill-current mx-auto" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" stroke="currentColor" fill="currentColor" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] font-extrabold text-gold-600 uppercase tracking-wider block font-sans mb-0.5 animate-pulse">
                            Boutique Video Walkthrough
                          </span>
                          <span className="text-[11px] font-bold text-emerald-950 font-serif leading-tight">
                            View Fabric & Quality Walkthrough
                          </span>
                        </div>
                      </div>
                      <div className="mr-1 py-1 px-3 bg-emerald-950 text-gold-400 font-sans text-[9px] font-bold uppercase tracking-wider rounded-full hover:bg-emerald-900 transition-colors hidden sm:block shadow-3xs select-none">
                        Play Video
                      </div>
                    </button>
                  ) : (
                    <div className="p-3.5 animate-in fade-in duration-300">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-cream-155">
                        <span className="text-[9.5px] font-extrabold text-gold-600 uppercase tracking-widest flex items-center gap-1 font-sans">
                          <Video className="w-3.5 h-3.5" /> Boutique Walks Video
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsInlineVideoPlaying(false)}
                          className="text-[9.5px] font-bold text-neutral-400 hover:text-rose-600 uppercase tracking-wider cursor-pointer"
                        >
                          ✕ Hide Player
                        </button>
                      </div>
                      <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-cream-150 bg-[#000] shadow-sm max-h-[195px] sm:max-h-[225px]">
                        <iframe
                          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                          title="Boutique Walkthrough Video Player"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          className="absolute inset-0 w-full h-full"
                        ></iframe>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="my-4 p-3 bg-neutral-50/70 border border-neutral-200/55 rounded-xl flex items-center gap-2 text-xs text-neutral-500">
                  <Video className="w-3.5 h-3.5 text-neutral-450 shrink-0" />
                  <span>Walkthrough Link: </span>
                  <a href={product.videoUrl} target="_blank" rel="noopener noreferrer" className="text-gold-600 underline font-semibold hover:text-gold-700 truncate max-w-xs">{product.videoUrl}</a>
                </div>
              );
            })()}
          </div>

          {/* WHATSAPP ORDER SHEET FORM */}
          <form onSubmit={handlePlaceOrder} className="bg-[#faf9f5] border border-gold-200/50 rounded-xl p-5 shadow-inner">
            <h3 className="text-sm font-serif font-bold text-emerald-950 uppercase tracking-widest flex items-center gap-2 mb-4 border-b border-cream-100 pb-2">
              <Sparkles className="w-4 h-4 text-gold-500" />
              <span>Instant WhatsApp Checkout</span>
            </h3>

            {/* Color Variations selected block */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-4 animate-in fade-in duration-200">
                <label className="block text-xs font-bold text-neutral-700 tracking-wide uppercase mb-2 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-gold-600" />
                  <span>Choose Color Variation *</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => {
                    const isSelected = selectedColor === color;
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`px-3 py-2 rounded text-xs font-semibold tracking-wide border cursor-pointer select-none transition-all ${
                          isSelected
                            ? 'bg-emerald-950 border-emerald-950 text-cream-50 shadow-md scale-[1.02]'
                            : 'bg-[#fff] border-cream-200 text-neutral-700 hover:border-gold-300'
                        }`}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size checklist */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-neutral-700 tracking-wide uppercase mb-2">
                1. Select Size *
              </label>
              <div className="flex flex-wrap gap-2">
                {(product.sizeInfo || ['Unstitched', 'S', 'M', 'L', 'XL', 'Custom Stitching']).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handleSizeChange(size)}
                    className={`px-3 py-2 rounded text-xs font-semibold tracking-wide border cursor-pointer transition-all ${
                      selectedSize === size
                        ? 'bg-emerald-950 border-emerald-950 text-cream-50 shadow'
                        : 'bg-[#fff] border-cream-200 text-neutral-700 hover:border-gold-300'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Sizing Measurement Form */}
            {showStitchingForm && (
              <div className="bg-[#fff] border border-gold-300/40 rounded-lg p-4 mb-4 grid grid-cols-2 gap-3.5 animate-in slide-in-from-top-4 duration-300">
                <div className="col-span-2 flex items-center gap-2 mb-1 border-b border-cream-100 pb-1">
                  <Ruler className="w-3.5 h-3.5 text-[#ab8215]" />
                  <span className="text-[11px] font-bold text-gold-700 uppercase tracking-wider">Stitching Measurements (Inches)</span>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-neutral-500 mb-1">Bust Circumference</label>
                  <input
                    type="text"
                    placeholder='e.g. 36"'
                    value={bustSize}
                    onChange={(e) => setBustSize(e.target.value)}
                    className="w-full bg-cream-50 border border-cream-200 rounded px-2.5 py-1.5 text-xs text-neutral-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-neutral-500 mb-1">Kameez/Shirt Length</label>
                  <input
                    type="text"
                    placeholder='e.g. 42"'
                    value={shirtLength}
                    onChange={(e) => setShirtLength(e.target.value)}
                    className="w-full bg-cream-50 border border-cream-200 rounded px-2.5 py-1.5 text-xs text-neutral-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-neutral-500 mb-1">Waist Sizing</label>
                  <input
                    type="text"
                    placeholder='e.g. 30"'
                    value={waistSize}
                    onChange={(e) => setWaistSize(e.target.value)}
                    className="w-full bg-cream-50 border border-cream-200 rounded px-2.5 py-1.5 text-xs text-neutral-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-neutral-500 mb-1">Trouser Sizing Length</label>
                  <input
                    type="text"
                    placeholder='e.g. 38"'
                    value={trouserLength}
                    onChange={(e) => setTrouserLength(e.target.value)}
                    className="w-full bg-cream-50 border border-cream-200 rounded px-2.5 py-1.5 text-xs text-neutral-800"
                  />
                </div>
              </div>
            )}

            {/* Customer Details */}
            <div className="space-y-3.5 mb-6">
              <div>
                <label className="block text-xs font-bold text-neutral-700 tracking-wide uppercase mb-1.5 flex items-center gap-1.5">
                  <span>2. Full Name</span>
                  <span className="text-rose-600 font-extrabold">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Amna Shah"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-[#fff] border border-cream-200 rounded-lg px-3.5 py-3 text-xs text-neutral-800 focus:outline-none focus:border-emerald-800 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 tracking-wide uppercase mb-1.5">
                  3. Phone Number / WhatsApp (Optional)
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +92 300 1234567"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-[#fff] border border-cream-200 rounded-lg px-3.5 py-3 text-xs text-neutral-800 focus:outline-none focus:border-emerald-800 font-sans font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 tracking-wide uppercase mb-1.5 flex items-center gap-1.5 font-sans">
                  <span>4. Complete Shipping Address</span>
                  <span className="text-rose-600 font-extrabold">*</span>
                </label>
                <textarea
                  placeholder="e.g. House No 42-B, Street 15, Block 5, Clifton, Karachi"
                  required
                  rows={2}
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full bg-[#fff] border border-cream-200 rounded-lg px-3.5 py-3 text-xs text-neutral-800 focus:outline-none focus:border-emerald-800 resize-none font-sans font-medium"
                />
              </div>
            </div>

            {/* ORDER SUBMIT BUTTON */}
            {product.stockStatus === 'outofstock' ? (
              <button
                type="button"
                disabled
                className="w-full bg-neutral-400 text-cream-50 font-bold uppercase py-3.5 rounded-lg text-xs tracking-widest cursor-not-allowed text-center transition-all"
              >
                PRODUCT TEMPORARILY SOLD OUT
              </button>
            ) : (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleAddToCartBtn}
                  className="w-full min-h-[46px] bg-[#fff] hover:bg-cream-50 active:scale-[0.98] border-2 border-emerald-950 text-emerald-950 font-bold uppercase py-3.5 px-4 rounded-lg text-[11px] sm:text-xs tracking-wider sm:tracking-[0.18em] flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer leading-tight select-none"
                >
                  <ShoppingBag className="w-4 h-4 text-emerald-900 shrink-0" />
                  <span>ADD TO LUXURY BAG</span>
                </button>

                <button
                  type="submit"
                  id="btn-whatsapp-order"
                  className="w-full min-h-[46px] bg-emerald-900 hover:bg-emerald-950 active:scale-[0.98] text-[#fff] font-bold uppercase py-3.5 px-4 rounded-lg text-[11px] sm:text-xs tracking-wider sm:tracking-[0.18em] flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer leading-tight select-none"
                >
                  <MessageSquare className="w-4 h-4 text-gold-400 shrink-0" />
                  <span>ORDER ON WHATSAPP SECURELY</span>
                </button>
              </div>
            )}

            {orderPlaced && (
              <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2.5 text-emerald-800 text-xs py-2 animated slideInFromBottom">
                <Check className="w-4 h-4 text-emerald-600 font-extrabold" />
                <span>Bespoke Order chat initialized on WhatsApp. Logs tracked inside client history!</span>
              </div>
            )}
          </form>

          {/* 6. Product Description narrative & tabs at bottom */}
          <div className="mt-4 border-t border-cream-100 pt-4">
            <p className="text-sm text-neutral-600 leading-relaxed mb-4 font-sans">
              {product.description}
            </p>

            {/* Interactive Sizing, Fabric, and Delivery tabs */}
            <div className="border-t border-b border-cream-100 py-1 my-5">
              <div className="flex gap-4 border-b border-[#faf9f5] pb-2 mb-3 text-xs font-bold tracking-wider uppercase text-neutral-400">
                <button
                  onClick={() => setActiveTab('fabric')}
                  className={`pb-1 cursor-pointer hover:text-emerald-950 ${activeTab === 'fabric' ? 'text-emerald-950 border-b-2 border-gold-500 font-extrabold' : ''}`}
                  type="button"
                >
                  🧵 Fabric Details
                </button>
                <button
                  onClick={() => setActiveTab('sizing')}
                  className={`pb-1 cursor-pointer hover:text-emerald-950 ${activeTab === 'sizing' ? 'text-emerald-950 border-b-2 border-gold-500 font-extrabold' : ''}`}
                  type="button"
                >
                  📐 Sizing Charts
                </button>
                <button
                  onClick={() => setActiveTab('delivery')}
                  className={`pb-1 cursor-pointer hover:text-emerald-950 ${activeTab === 'delivery' ? 'text-emerald-950 border-b-2 border-gold-500 font-extrabold' : ''}`}
                  type="button"
                >
                  📦 Delivery Info
                </button>
              </div>

              {activeTab === 'fabric' && (
                <div className="text-xs text-neutral-605 space-y-2 py-1 animated fadeIn whitespace-pre-line font-medium leading-relaxed font-sans">
                  {webConfigs.globalFabricDetails || `Primary Fabric: ${product.fabric}\n\nThread Craftsmanship:\nFine quality handcraft, zari embellishments, tilla borders, gota work, and matching sequins.\n\nComponents:\n3-piece complete dress including matching trousers and premium dupatta.`}
                </div>
              )}

              {activeTab === 'sizing' && (() => {
                const sizingText = webConfigs.globalSizingCharts || `S  : Chest: 36" | Waist: 30" | Shoulder: 14.0" | Shirt Length: 39"\nM  : Chest: 40" | Waist: 34" | Shoulder: 15.0" | Shirt Length: 40"\nL  : Chest: 44" | Waist: 38" | Shoulder: 16.0" | Shirt Length: 41"\nXL : Chest: 48" | Waist: 42" | Shoulder: 17.5" | Shirt Length: 42"`;
                const parsedRows = parseSizingChart(sizingText) || [
                  { size: 'S', chest: '36"', waist: '30"', shoulder: '14.0"', length: '39"' },
                  { size: 'M', chest: '40"', waist: '34"', shoulder: '15.0"', length: '40"' },
                  { size: 'L', chest: '44"', waist: '38"', shoulder: '16.0"', length: '41"' },
                  { size: 'XL', chest: '48"', waist: '42"', shoulder: '17.5"', length: '42"' },
                ];

                return (
                  <div className="space-y-4 py-2 animated fadeIn font-sans text-xs">
                    {/* Visual Tabular Sizing Chart */}
                    <div className="overflow-x-auto rounded-xl border border-cream-200 shadow-3xs bg-white">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-cream-50/70 border-b border-cream-150 text-emerald-950 font-extrabold uppercase tracking-widest text-[10px] md:text-xs">
                            <th className="py-2.5 px-3 md:px-4 text-center w-14">Size</th>
                            <th className="py-2.5 px-3 md:px-4">Chest</th>
                            <th className="py-2.5 px-3 md:px-4">Waist</th>
                            <th className="py-2.5 px-3 md:px-4">Shoulder</th>
                            <th className="py-2.5 px-3 md:px-4">Length</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-cream-100 text-neutral-700 font-medium text-[11px] md:text-xs">
                          {parsedRows.map((row, idx) => (
                            <tr key={idx} className="hover:bg-cream-50/20 transition-colors">
                              <td className="py-2.5 px-3 md:px-4 text-center font-extrabold text-emerald-900 bg-cream-50/25 font-mono text-[12px]">
                                {row.size}
                              </td>
                              <td className="py-2.5 px-3 md:px-4">{row.chest || '—'}</td>
                              <td className="py-2.5 px-3 md:px-4">{row.waist || '—'}</td>
                              <td className="py-2.5 px-3 md:px-4">{row.shoulder || '—'}</td>
                              <td className="py-2.5 px-3 md:px-4">{row.length || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Sizing description list/text below */}
                    <div className="pt-1.5 border-t border-cream-100/50">
                      <span className="text-[9.5px] font-bold text-neutral-400 uppercase tracking-widest block mb-2">
                        Sizing Guides & Reference Text
                      </span>
                      <div className="text-[11px] text-neutral-600 font-medium leading-relaxed bg-[#fbfbfa] p-3 rounded-xl border border-cream-150 whitespace-pre-line">
                        {sizingText}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {activeTab === 'delivery' && (
                <div className="text-xs text-neutral-605 space-y-2 py-1 animated fadeIn whitespace-pre-line font-medium leading-relaxed font-sans">
                  {webConfigs.globalDeliveryInfo || `Premium Delivery Service:\nStandard transit requires 2-4 working days across Pakistan. International shipping is dispatched via high-speed premium FedEx/DHL routing (5-8 business days).\n\nTailoring Completion:\nStitched garments have an artisan crafting queue of 12-14 business days from confirmation.`}
                </div>
              )}
            </div>
          </div>

          {/* Customer Trust indicator */}
          <div className="flex justify-around items-center text-neutral-400 text-[10px] uppercase font-bold tracking-widest mt-4">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-800" />
              <span>100% SECURE DIRECT INQUIRY</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-gold-500" />
              <span>AUTHENTIC LAWNS & EMBROIDERIES</span>
            </span>
          </div>
        </div>

      </div>

      {/* -------------------- BOUTIQUE VIDEO PATH LIGHTBOX (FALLBACK) -------------------- */}
      {isVideoPlaying && product.videoUrl && (
        <div className="fixed inset-0 bg-[#000]/80 backdrop-blur-md flex items-center justify-center p-4 z-[95] animate-in fade-in duration-200">
          <div className="bg-[#111] rounded-2xl w-full max-w-3xl overflow-hidden border border-neutral-800 shadow-2xl relative animate-in zoom-in-95 duration-200">
            {/* Lightbox header with close */}
            <div className="px-5 py-3 bg-[#1e1e1e] text-neutral-300 flex items-center justify-between border-b border-neutral-800">
              <span className="text-xs font-bold uppercase tracking-widest text-gold-400 flex items-center gap-1.5 font-serif">
                <Video className="w-4 h-4 text-gold-400" />
                <span>Boutique Video Walkthrough: {product.title}</span>
              </span>
              <button
                onClick={() => setIsVideoPlaying(false)}
                className="text-neutral-400 hover:text-[#fff] px-3 py-1.5 bg-neutral-800/60 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer hover:bg-neutral-800"
              >
                ✕ Close Player
              </button>
            </div>
            {/* Video iframe content */}
            <div className="relative aspect-video bg-[#000]">
              {(() => {
                let id = '';
                const url = product.videoUrl;
                if (url.includes('youtu.be/')) {
                  id = url.split('youtu.be/')[1]?.split('?')[0] || '';
                } else if (url.includes('youtube.com/watch')) {
                  id = url.split('v=')[1]?.split('&')[0] || '';
                } else if (url.includes('youtube.com/embed/')) {
                  id = url.split('embed/')[1]?.split('?')[0] || '';
                }
                const embedUrl = id ? `https://www.youtube.com/embed/${id}` : null;
                
                return embedUrl ? (
                  <iframe
                    src={`${embedUrl}?autoplay=1&rel=0`}
                    title="Boutique Walkthrough Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  ></iframe>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center">
                    <Video className="w-10 h-10 text-neutral-650 animate-pulse" />
                    <p className="text-xs font-semibold text-neutral-400">Playable video feed available at:</p>
                    <a 
                      href={product.videoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-gold-500 hover:underline break-all"
                    >
                      {product.videoUrl}
                    </a>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
