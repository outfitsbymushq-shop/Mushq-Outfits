-- =================================================================
-- MUSHQ OUTFITS - COMPLETE PRODUCTION-READY DATABASE SCHEMA
-- Target Database: Supabase PostgreSQL (lxtecfpylliyrjgmuvjk)
-- Includes: Row-Level Security, Storage Buckets, and Initial Seeds
-- =================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. THE CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. THE PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price INT NOT NULL, -- PKr base
    sale_price INT, -- Optional sale price
    category VARCHAR(120) REFERENCES public.categories(slug) ON UPDATE CASCADE ON DELETE SET NULL,
    images JSONB DEFAULT '[]'::jsonb, -- Array of image URLs
    stock_status VARCHAR(20) DEFAULT 'instock' CHECK (stock_status IN ('instock', 'outofstock')),
    sku VARCHAR(120) UNIQUE NOT NULL,
    product_id VARCHAR(120) NOT NULL, -- internal tracking ID
    is_featured BOOLEAN DEFAULT false,
    fabric VARCHAR(150),
    sizes TEXT[] DEFAULT ARRAY['S', 'M', 'L', 'XL'],
    delivery_info TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. THE ORDERS/INQUIRIES TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name VARCHAR(255) NOT NULL,
    whatsapp_number VARCHAR(100) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_link TEXT,
    sku VARCHAR(120),
    price VARCHAR(100),
    order_date DATE DEFAULT CURRENT_DATE,
    order_status VARCHAR(50) DEFAULT 'New Order' CHECK (order_status IN ('New Order', 'Contacted', 'Confirmed', 'Processing', 'Delivered', 'Cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. THE BANNERS TABLE
CREATE TABLE IF NOT EXISTS public.banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url TEXT NOT NULL,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    button_text VARCHAR(100) DEFAULT 'Explore Brand',
    link_url VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. HOMEPAGE SECTIONS CONFIGURATION
CREATE TABLE IF NOT EXISTS public.homepage_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_name VARCHAR(100) NOT NULL UNIQUE, -- e.g. 'Featured Products', 'Best Sellers', 'New Arrivals', 'Collections'
    product_ids UUID[] DEFAULT '{}'::UUID[], -- Array of product UUIDs
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. WEBSITE SETTINGS SINGLE ROW TABLE
CREATE TABLE IF NOT EXISTS public.website_settings (
    id INT PRIMARY KEY DEFAULT 1,
    store_name VARCHAR(100) DEFAULT 'Mushq Outfits',
    whatsapp_number VARCHAR(100) DEFAULT '+92 302 0038010',
    facebook_link VARCHAR(255) DEFAULT 'https://facebook.com',
    seo_title VARCHAR(255) DEFAULT 'Mushq Outfits | Luxury Pakistani Women Fashion Brand',
    seo_description TEXT DEFAULT 'Shop exquisite luxury unstitched lawn, velvet peshwas, organza tunics, premium party wear and stitched formal wear at Mushq Outfits Karachi.',
    seo_keywords VARCHAR(255) DEFAULT 'pakistani fashion, boutique, lawn, party wear, luxury dresses',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_single_row CHECK (id = 1)
);

-- 7. REVIEWS TABLE (Optional support for testimonials)
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    location VARCHAR(120),
    rating INT DEFAULT 5 NOT NULL,
    comment TEXT,
    date VARCHAR(50),
    verified BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. VISITORS LOG
CREATE TABLE IF NOT EXISTS public.visitors (
    id INT PRIMARY KEY DEFAULT 1,
    count INT DEFAULT 1248 NOT NULL,
    CONSTRAINT check_single_visitor_row CHECK (id = 1)
);

-- =================================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- =================================================================

-- Enable RLS on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;

-- 1. Read access for anyone (public)
CREATE POLICY "Allow public select categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow public select products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public select banners" ON public.banners FOR SELECT USING (true);
CREATE POLICY "Allow public select homepage_sections" ON public.homepage_sections FOR SELECT USING (true);
CREATE POLICY "Allow public select website_settings" ON public.website_settings FOR SELECT USING (true);
CREATE POLICY "Allow public select reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Allow public select visitors" ON public.visitors FOR SELECT USING (true);

-- 2. Insert access for orders/inquiries (anyone can submit an order)
CREATE POLICY "Allow public order placements" ON public.orders FOR INSERT WITH CHECK (true);
-- 3. Insert reviews (anyone can leave review)
CREATE POLICY "Allow public review submissions" ON public.reviews FOR INSERT WITH CHECK (true);

-- 4. Full access to admins (authenticated roles)
CREATE POLICY "Allow full operations to categories for admins" ON public.categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow full operations to products for admins" ON public.products FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow full operations to orders for admins" ON public.orders FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow full operations to banners for admins" ON public.banners FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow full operations to homepage_sections for admins" ON public.homepage_sections FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow full operations to website_settings for admins" ON public.website_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow full operations to reviews for admins" ON public.reviews FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow full operations to visitors for admins" ON public.visitors FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- =================================================================
-- SUPABASE STORAGE CONFIGURATIONS
-- =================================================================

-- Create folders & buckets inside storage schema if they don't exist
INSERT INTO storage.buckets (id, name, public) VALUES ('product_images', 'product_images', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('category_images', 'category_images', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('banner_images', 'banner_images', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('website_assets', 'website_assets', true) ON CONFLICT DO NOTHING;

-- RLS policies for public file streaming
CREATE POLICY "Allow public read product_images" ON storage.objects FOR SELECT USING (bucket_id = 'product_images');
CREATE POLICY "Allow public read category_images" ON storage.objects FOR SELECT USING (bucket_id = 'category_images');
CREATE POLICY "Allow public read banner_images" ON storage.objects FOR SELECT USING (bucket_id = 'banner_images');
CREATE POLICY "Allow public read website_assets" ON storage.objects FOR SELECT USING (bucket_id = 'website_assets');

-- RLS write policies for authenticated admin users
CREATE POLICY "Allow admin write product_images" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'product_images') WITH CHECK (bucket_id = 'product_images');
CREATE POLICY "Allow admin write category_images" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'category_images') WITH CHECK (bucket_id = 'category_images');
CREATE POLICY "Allow admin write banner_images" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'banner_images') WITH CHECK (bucket_id = 'banner_images');
CREATE POLICY "Allow admin write website_assets" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'website_assets') WITH CHECK (bucket_id = 'website_assets');


-- =================================================================
-- SEEDS INITIAL DATA (IF EMPTY ON BOOTSTRAP)
-- =================================================================

-- Categories Seed
INSERT INTO public.categories (name, slug, description, image_url, status) VALUES
('New Arrivals', 'new-arrivals', 'Unveiling our latest premium handcrafts and bespoke styles.', 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80', 'active'),
('Luxury Lawn', 'luxury-lawn', 'Breathtaking airy cotton canvas decorated with sophisticated threadwork.', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80', 'active'),
('Party Wear', 'party-wear', 'Make an unforgettable statement in royal organza and pure silks.', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80', 'active'),
('Summer Collection', 'summer-collection', 'Lightweight drapes with a gold finish designed for hot Pakistani summers.', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80', 'active'),
('Winter Collection', 'winter-collection', 'Cozy Karandi, absolute premium velvet, soft Pashmina duppatas.', 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?auto=format&fit=crop&w=800&q=80', 'active'),
('Stitched Luxury', 'stitched', 'Bespoke tailoring with impeccable hand finishes and boutique sizing.', 'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&w=800&q=80', 'active'),
('Unstitched', 'unstitched', 'Design it your way with premium fabrics, bordered panels and custom patchworks.', 'https://images.unsplash.com/photo-1590075865003-e48277afd558?auto=format&fit=crop&w=800&q=80', 'active')
ON CONFLICT (slug) DO NOTHING;

-- Products Seed
INSERT INTO public.products (title, description, price, sale_price, category, images, stock_status, sku, product_id, is_featured, fabric, sizes, delivery_info) VALUES
('Zari Emerald Velvet Peshwas', 'Step into royal grandeur with this breathtaking emerald green micro-velvet kalidaar. The shirt features an elegantly structured high collar with elaborate gold tilla embroidery and delicate handcrafted pearl bead detailing along the flare and sleeves. Paired with a pure jamawar trouser and a matching gold metallic tissue dupatta with hand-finished scallops.', 26500, 22500, 'party-wear', '["https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1590075865003-e48277afd558?auto=format&fit=crop&w=800&q=80"]'::jsonb, 'instock', 'MQ-NUR-EMERALD-01', 'MQ-EV-01', true, 'Micro-Velvet & Pure Tissue', ARRAY['S', 'M', 'L', 'XL', 'Custom Stitching'], 'Bespoke orders require 10-14 working days for stitching. Standard delivery within Pakistan takes 2-3 working days.'),
('Nur Jahan Rose Gold Silk Set', 'An ethereal pastel peach and rose gold luxury semi-formal attire. Intricately crinkled pure crêpe chiffon shirt detailed with floral bouquet embroidery on front panels using premium zardozi and kora work. Features structured sheer sleeves and raw silk straight trousers decorated with block-printed margins.', 18500, NULL, 'party-wear', '["https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?auto=format&fit=crop&w=800&q=80"]'::jsonb, 'instock', 'MQ-NUR-RG-02', 'MQ-RG-02', true, 'Pure Crêpe Chiffon & Silk', ARRAY['S', 'M', 'L', 'Custom Stitching'], 'Ready to ship in S, M, L. Custom stitching takes 7 additional days.'),
('Sorbet Peach Cotton Jacquard', 'Make absolute peace with summer heat in this gorgeous pastel peach cotton lawn suit. Tailored meticulously with floral woven self-jacquard texturing. Handcraft includes delicate white cotton lace patchings on side seams, organza detailed neckline, with a light organza block printed dupatta.', 9500, NULL, 'luxury-lawn', '["https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80"]'::jsonb, 'instock', 'MQ-LAWN-SORBET-03', 'MQ-SL-03', true, 'Cotton Self-Jacquard & Organza', ARRAY['S', 'M', 'L', 'Unstitched'], 'Unstitched delivery within 48 hours in Karachi. Stitched variants shipped in 5-6 days.'),
('Royal Crimson Brocade Kurta', 'A traditional loose-cut crimson kurta styled with beautiful woven patterns in gold zari threads. Features deep maroon silk borders with exquisite hand-anchored Gota-Patti embroidery. Perfect styling option for intimate nikkah and dholki pre-wedding festivities.', 13500, 11000, 'stitched', '["https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1564859228273-274232fdb516?auto=format&fit=crop&w=800&q=80"]'::jsonb, 'instock', 'MQ-SEMI-CRIMSON-04', 'MQ-RC-04', false, 'Art Brocade & Raw Silk', ARRAY['M', 'L', 'XL'], 'Limited stock ready-to-wear kurta.'),
('Ivory Pearl Embroidered Organza', 'Enchant in our premium absolute classic ivory organza tunic. The yoking exhibits immaculate ivory resham handcraft with a luxurious placement of real freshwater pearls, matching cut-work borders, and soft silver gotta embroidery. Paired perfectly with double layered raw silk pants.', 24500, NULL, 'new-arrivals', '["https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1590075865003-e48277afd558?auto=format&fit=crop&w=800&q=80"]'::jsonb, 'instock', 'MQ-FORM-IVORY-05', 'MQ-IP-05', true, 'Premium Pure Silk Organza', ARRAY['S', 'M', 'L', 'XL'], 'Includes stitched inner lining and trouser. Delivered premium-boxed.')
ON CONFLICT (sku) DO NOTHING;

-- Banners Seed
INSERT INTO public.banners (image_url, title, subtitle, button_text, link_url, is_active) VALUES
('https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1600&q=90', 'NUR JAHAN COLLECTION', 'Exquisite Pure Silk & Hand-Woven Velvet Formals', 'Explore Collection', '/category/party-wear', true),
('https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?auto=format&fit=crop&w=1600&q=90', 'FESTIVE LAWN ‘26', 'Breathable Cotton Jacquard with Gold Lurex Panels', 'Shop Fabric', '/category/luxury-lawn', true),
('https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=90', 'THE BESPOKE RETREAT', 'Tailored luxury ready-to-wear with premium hand-finishing', 'Examine Stitched', '/category/stitched', true);

-- Homepage Sections Seeds
INSERT INTO public.homepage_sections (section_name, product_ids) VALUES
('Featured Products', '{}'::UUID[]),
('Best Sellers', '{}'::UUID[]),
('New Arrivals', '{}'::UUID[]),
('Collections', '{}'::UUID[])
ON CONFLICT (section_name) DO NOTHING;

-- Website Settings Seed
INSERT INTO public.website_settings (id, store_name, whatsapp_number, facebook_link, seo_title, seo_description, seo_keywords) VALUES
(1, 'Mushq Outfits', '+92 302 0038010', 'https://facebook.com/mushqpk', 'Mushq Outfits | Luxury Pakistani Women Fashion Brand', 'Shop exquisite luxury unstitched lawn, velvet peshwas, organza tunics, premium party wear and stitched formal wear at Mushq Outfits Karachi. Fast nationwide cash on delivery.', 'pakistani fashion, boutique, lawn, party wear, luxury dresses')
ON CONFLICT (id) DO NOTHING;

-- Visitors Seed
INSERT INTO public.visitors (id, count) VALUES (1, 1248) ON CONFLICT (id) DO NOTHING;

-- Reviews Seeds
INSERT INTO public.reviews (name, location, rating, comment, date, verified) VALUES
('Amna Shah', 'Lahore, Punjab', 5, 'The stitching on the Emerald Velvet Peshwas is flawless! The gold tilla is extremely intricate, and there was no compromise on quality. Will definitely order again!', 'May 12, 2026', true),
('Zara Khan', 'Karachi, Sindh', 5, 'Ordered via WhatsApp and the response was so fast! They customized my sleeves exactly as I wanted and guided me on the size. Highly recommend Mushq Outfits!', 'May 20, 2026', true),
('Mariam Malik', 'Islamabad, ICT', 5, 'Exquisite designs and premium customer packaging. The Ivory Pearl Organza fabric feels luxurious and comfortable. Perfect on-time delivery.', 'May 28, 2026', true);
