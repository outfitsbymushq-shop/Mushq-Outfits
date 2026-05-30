import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

export default function SupabaseCode() {
  const [copied, setCopied] = useState(false);

  const sqlSchema = `-- =========================================================
-- MUSHQ OUTFITS - COMPLETE LUXURY ECOMMERCE DATABASE SCHEMA
-- Target Database: Supabase PostgreSQL
-- Features: Row-Level Security, Auto-UUIDs, Optimizations
-- =========================================================

-- 1. ENABLE EXTENSIONS (If needed)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CREATE CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. CREATE PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price INT NOT NULL, -- Stored in PKR
    sale_price INT,
    category_slug VARCHAR(120) REFERENCES public.categories(slug) ON UPDATE CASCADE,
    stock_status VARCHAR(20) DEFAULT 'instock' CHECK (stock_status IN ('instock', 'outofstock')),
    sku VARCHAR(100) UNIQUE NOT NULL,
    product_id VARCHAR(100) NOT NULL,
    is_featured BOOLEAN DEFAULT false,
    fabric VARCHAR(150),
    sizes VARCHAR(50)[] DEFAULT ARRAY['S', 'M', 'L', 'XL'],
    delivery_info TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. CREATE PRODUCT IMAGES TABLE
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INT DEFAULT 0
);

-- 5. CREATE BANNERS TABLE
CREATE TABLE IF NOT EXISTS public.banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    image_url TEXT NOT NULL,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    link_url VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. CREATE INQUIRIES REGISTER
CREATE TABLE IF NOT EXISTS public.inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    product_title VARCHAR(255) NOT NULL,
    price_pkr VARCHAR(50) NOT NULL,
    sku VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. CREATE SITE ADMINS TABLE
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. CREATE SYSTEM SETTINGS TABLE (SEO & CONFIG)
CREATE TABLE IF NOT EXISTS public.settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================

-- Enable RLS on all sensitive tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Anonymous (Public) Read Access
CREATE POLICY "Allow public read access to categories" ON public.categories 
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to products" ON public.products 
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to banners" ON public.banners 
    FOR SELECT USING (true);

-- Authenticated (Admin) Modifying Access
CREATE POLICY "Allow write operations to categories for admins only" ON public.categories 
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow write operations to products for admins only" ON public.products 
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow write operations to banners for admins only" ON public.banners 
    FOR ALL USING (auth.role() = 'authenticated');

-- Customer Inquiry Policies (Anyone can write/insert, only admins can view)
CREATE POLICY "Allow public inserts on inquiries" ON public.inquiries 
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow view inquiries for admins only" ON public.inquiries 
    FOR SELECT USING (auth.role() = 'authenticated');

-- Seed first luxury categories and demo credential
INSERT INTO public.categories (name, slug, description, image_url) VALUES
('New Arrivals', 'new-arrivals', 'Unveiling our latest bespoke styles', 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=400'),
('Luxury Lawn', 'luxury-lawn', 'Premium cotton fabrics with festive thread work', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400');
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="supabase-code-tab" className="bg-[#111] text-[#faf9f5] rounded-xl overflow-hidden shadow-2xl border border-gray-800 font-mono text-sm">
      <div className="flex items-center justify-between px-5 py-4 bg-[#1a1a1a] border-b border-gray-800">
        <div className="flex items-center gap-3">
          <Terminal className="w-4 h-4 text-gold-400" />
          <span className="text-gray-300 font-semibold tracking-wide">supabase_schema.sql</span>
        </div>
        <button
          onClick={handleCopy}
          id="btn-copy-sql"
          className="flex items-center gap-2 px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-[#fff] text-xs font-semibold cursor-pointer transition-colors active:scale-95"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy SQL Code</span>
            </>
          )}
        </button>
      </div>
      <div className="p-5 max-h-[450px] overflow-y-auto custom-scroll text-xs leading-relaxed text-[#eee]">
        <pre className="whitespace-pre-wrap selection:bg-[#af8215]/30">{sqlSchema}</pre>
      </div>
    </div>
  );
}
