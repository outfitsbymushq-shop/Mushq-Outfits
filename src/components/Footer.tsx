import React from 'react';
import { MapPin, Phone, MessageSquare, Facebook, Instagram, ShieldCheck, Truck, RefreshCw, Sparkles } from 'lucide-react';

interface FooterProps {
  onSelectCategory: (categorySlug: string) => void;
  onChangeView: (view: 'home' | 'shop' | 'admin') => void;
}

export default function Footer({ onSelectCategory, onChangeView }: FooterProps) {
  const handleNav = (slug: string) => {
    onSelectCategory(slug);
    onChangeView('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="site-footer" className="bg-cream-50 text-emerald-950 pt-16 pb-8 border-t border-cream-150">
      
      {/* Brand assurance milestones */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-cream-150">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-[#fff] border border-cream-150 rounded-none text-gold-600">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#064e3b]">Fast National Shipping</h4>
            <p className="text-xs text-neutral-600 mt-1">Prompt Cash-On-Delivery across Pakistan. Express orders within Karachi in 24-48 hrs.</p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="p-3 bg-[#fff] border border-cream-150 rounded-none text-gold-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#064e3b]">Premium Fabric Quality</h4>
            <p className="text-xs text-neutral-600 mt-1">100% genuine threads, micro-velvet, pure silks, and premium cotton self-jacquard.</p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="p-3 bg-[#fff] border border-cream-150 rounded-none text-gold-600">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#064e3b]">Bespoke Sizing Stitching</h4>
            <p className="text-xs text-neutral-600 mt-1">Tailored perfectly to your precise size specifications by professional master artisans.</p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="p-3 bg-[#fff] border border-cream-150 rounded-none text-gold-600">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#064e3b]">24/7 WhatsApp Support</h4>
            <p className="text-xs text-neutral-600 mt-1">Order assistance, color matching recommendations, and custom sizing via Chat.</p>
          </div>
        </div>
      </div>

      {/* Main footer grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* Brand identity column */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-col">
            <span className="text-2xl font-serif font-bold tracking-[0.2em] text-emerald-950">Mushq</span>
            <span className="text-[9px] tracking-[0.4em] text-gold-500 font-bold uppercase -mt-0.5">Luxury Outfits</span>
          </div>
          <p className="text-xs text-neutral-500 leading-relaxed font-sans mt-2">
            Immerse yourself in authentic haute couture with premium Pakistani handcrafting, traditional zari thread-work, opulent festive colors, and flawless bespoke stitching.
          </p>
          <div className="flex items-center gap-3 mt-4">
            <a 
              href="https://www.facebook.com/share/1bpvozkJBQ/" 
              target="_blank" 
              rel="noreferrer noopener"
              id="footer-facebook"
              className="w-9 h-9 border border-cream-150 flex items-center justify-center text-emerald-950 hover:text-gold-600 hover:border-gold-500 transition-all cursor-pointer bg-white"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a 
              href="https://wa.me/923020038010" 
              target="_blank" 
              rel="noreferrer noopener"
              id="footer-whatsapp"
              className="w-9 h-9 border border-cream-150 flex items-center justify-center text-emerald-950 hover:text-gold-600 hover:border-gold-500 transition-all cursor-pointer bg-white"
            >
              <MessageSquare className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Collections index column */}
        <div>
          <h3 className="text-xs uppercase tracking-[0.25em] text-[#064e3b] font-bold mb-6">Collections</h3>
          <ul className="flex flex-col gap-3 text-xs text-neutral-600 font-medium">
            <li>
              <button onClick={() => handleNav('all')} className="hover:text-gold-600 transition-colors text-left cursor-pointer">
                View All Collections
              </button>
            </li>
            <li>
              <button onClick={() => handleNav('new-arrivals')} className="hover:text-gold-600 transition-colors text-left cursor-pointer">
                New Arrivals
              </button>
            </li>
            <li>
              <button onClick={() => handleNav('luxury-lawn')} className="hover:text-gold-600 transition-colors text-left cursor-pointer">
                Luxury Lawn Collection
              </button>
            </li>
            <li>
              <button onClick={() => handleNav('party-wear')} className="hover:text-gold-600 transition-colors text-left cursor-pointer">
                Royal Party Wear
              </button>
            </li>
            <li>
              <button onClick={() => handleNav('stitches')} className="hover:text-gold-600 transition-colors text-left cursor-pointer">
                Stitched Ready-to-wear
              </button>
            </li>
            <li>
              <button onClick={() => handleNav('unstitched')} className="hover:text-gold-600 transition-colors text-left cursor-pointer">
                Unstitched Fabrics
              </button>
            </li>
          </ul>
        </div>

        {/* Store operations detail column */}
        <div>
          <h3 className="text-xs uppercase tracking-[0.25em] text-[#064e3b] font-bold mb-6">The Boutique</h3>
          <ul className="flex flex-col gap-4 text-xs text-neutral-600">
            <li className="flex gap-3 leading-relaxed">
              <MapPin className="w-4.5 h-4.5 text-gold-600 shrink-0" />
              <span>
                <strong className="text-emerald-950">Mushq Flagship Boutique</strong><br />
                Clifton, Marine Drive Area,<br />
                Karachi, Sindh, Pakistan
              </span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-gold-600" />
              <span>+92 302 0038 010</span>
            </li>
            <li className="flex items-center gap-3">
              <MessageSquare className="w-4 h-4 text-gold-600" />
              <span className="font-semibold text-emerald-950">WhatsApp Store Active</span>
            </li>
          </ul>
        </div>

        {/* Operating assurances column */}
        <div>
          <h3 className="text-xs uppercase tracking-[0.25em] text-[#064e3b] font-bold mb-6">Store Hours</h3>
          <p className="text-xs text-neutral-500 leading-relaxed font-light">
            Our online WhatsApp sales agents are active 24/7 to accept orders and reply to styling requests.
          </p>
          <div className="mt-4 p-4 rounded-none bg-white border border-cream-150 text-xs text-neutral-600">
            <span className="text-gold-600 font-bold block mb-1">Karachi Boutique:</span>
            <span className="text-emerald-950 font-semibold">Mon - Sat: 11:00 AM - 9:00 PM PKT</span>
            <span className="text-neutral-400 block mt-1 text-[11px]">Sunday Closed</span>
          </div>
        </div>

      </div>

      {/* Deep footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-cream-150 flex flex-col md:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
        <p>© 2026 Mushq Outfits Karachi. All Rights Reserved. Custom Eastern Haute Couture.</p>
        <div className="flex gap-6">
          <button onClick={() => onChangeView('admin')} className="hover:text-gold-600 transition-colors font-semibold cursor-pointer">
            Admin Suite
          </button>
          <span>|</span>
          <span className="text-neutral-400 font-medium">Bespoke WhatsApp Luxury Portal</span>
        </div>
      </div>
    </footer>
  );
}
