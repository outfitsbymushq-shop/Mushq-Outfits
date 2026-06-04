import { supabase } from './supabaseClient';
import { Product, Category, Banner, Inquiry, Review, SEOMetadata } from './types';
import { DEFAULT_PRODUCTS, DEFAULT_CATEGORIES, DEFAULT_BANNERS, DEFAULT_REVIEWS } from './data';

// Auto seedling of tables if Supabase starts clean
export const seedIfEmpty = async () => {
  try {
    // 1. Categories
    const { data: cats, error: catErr } = await supabase.from('categories').select('slug');
    if (!catErr) {
      const existingSlugs = new Set((cats || []).map(c => c.slug));
      for (const cat of DEFAULT_CATEGORIES) {
        if (!existingSlugs.has(cat.slug)) {
          console.log(`Seeding missing category: ${cat.name}`);
          await supabase.from('categories').insert({
            name: cat.name,
            slug: cat.slug,
            description: cat.description || '',
            image_url: cat.image || '',
            status: 'active'
          });
        }
      }
    }

    // 2. Products
    const { data: prods, error: prodErr } = await supabase.from('products').select('id');
    if (!prodErr && (!prods || prods.length === 0)) {
      console.log('Products empty in Supabase, seeding defaults...');
      for (const prod of DEFAULT_PRODUCTS) {
        await supabase.from('products').insert({
          title: prod.title,
          description: prod.description,
          price: prod.price,
          sale_price: prod.salePrice || null,
          category: prod.category,
          images: JSON.stringify(prod.images),
          stock_status: prod.stockStatus,
          sku: prod.sku,
          product_id: prod.productId,
          is_featured: prod.isFeatured,
          fabric: prod.fabric,
          sizes: prod.sizeInfo || ['S', 'M', 'L', 'XL'],
          delivery_info: prod.deliveryInfo || ''
        });
      }
    }

    // 3. Banners
    const { data: bans, error: banErr } = await supabase.from('banners').select('id');
    if (!banErr && (!bans || bans.length === 0)) {
      console.log('Banners empty in Supabase, seeding defaults...');
      for (const ban of DEFAULT_BANNERS) {
        await supabase.from('banners').insert({
          image_url: ban.image,
          title: ban.title,
          subtitle: ban.subtitle || '',
          button_text: 'Explore Brand',
          link_url: ban.link,
          is_active: ban.isActive
        });
      }
    }

    // 4. Settings single record
    const { data: sSet, error: setErr } = await supabase.from('website_settings').select('id');
    if (!setErr && (!sSet || sSet.length === 0)) {
      await supabase.from('website_settings').insert({
        id: 1,
        store_name: 'Outfits by Mushq',
        whatsapp_number: '+92 302 0038010',
        facebook_link: 'https://facebook.com/mushqpk',
        seo_title: 'Outfits by Mushq | Luxury Pakistani Women Fashion Brand',
        seo_description: 'Shop exquisite luxury unstitched lawn, velvet peshwas, organza tunics, premium party wear and stitched formal wear at Outfits by Mushq.',
        seo_keywords: 'pakistani fashion, boutique, lawn, party wear, luxury dresses'
      });
    }

    // 5. Reviews
    const { data: revs, error: revsErr } = await supabase.from('reviews').select('id');
    if (!revsErr && (!revs || revs.length === 0)) {
      for (const rev of DEFAULT_REVIEWS) {
        await supabase.from('reviews').insert({
          name: rev.name,
          location: rev.location,
          rating: rev.rating,
          comment: rev.comment,
          date: rev.date,
          verified: rev.verified
        });
      }
    }
  } catch (error) {
    console.warn('Silent seeding error (this is normal if schema hasn\'t been executed yet):', error);
  }
};

// Converters inside storage layer
const mapProductFromDB = (p: any): Product => {
  let deliveryText = p.delivery_info || undefined;
  let videoUrl: string | undefined = undefined;
  let colors: string[] | undefined = undefined;

  if (p.delivery_info && p.delivery_info.trim().startsWith('{')) {
    try {
      const extra = JSON.parse(p.delivery_info);
      deliveryText = extra.deliveryInfo || undefined;
      videoUrl = extra.videoUrl || undefined;
      colors = extra.colors || undefined;
    } catch (e) {
      console.warn('Failed parsing json delivery_info:', e);
    }
  }

  return {
    id: p.id,
    title: p.title,
    description: p.description,
    price: p.price,
    salePrice: p.sale_price || undefined,
    category: p.category,
    images: Array.isArray(p.images) ? p.images : (typeof p.images === 'string' ? JSON.parse(p.images) : []),
    stockStatus: p.stock_status,
    sku: p.sku,
    productId: p.product_id,
    isFeatured: p.is_featured,
    fabric: p.fabric || '',
    sizeInfo: p.sizes || [],
    deliveryInfo: deliveryText,
    videoUrl,
    colors,
    createdAt: p.created_at
  };
};

const mapCategoryFromDB = (c: any): Category => ({
  id: c.id,
  name: c.name,
  slug: c.slug,
  description: c.description,
  image: c.image_url
});

const mapBannerFromDB = (b: any): Banner => ({
  id: b.id,
  image: b.image_url,
  title: b.title,
  subtitle: b.subtitle,
  link: b.link_url,
  isActive: b.is_active
});

const mapInquiryFromDB = (o: any): Inquiry => ({
  id: o.id,
  customerName: o.customer_name,
  customerPhone: o.whatsapp_number,
  productTitle: o.product_name,
  productLink: o.product_link,
  sku: o.sku,
  price: o.price,
  date: o.order_date,
  status: o.order_status
});

// Increments visitor metrics via single row upsert logic
export const incrementVisitors = async (): Promise<number> => {
  try {
    const { data } = await supabase.from('visitors').select('count').eq('id', 1).single();
    const count = data ? data.count + 1 : 1249;
    await supabase.from('visitors').upsert({ id: 1, count });
    return count;
  } catch {
    return 1249;
  }
};

export const getVisitors = async (): Promise<number> => {
  try {
    const { data } = await supabase.from('visitors').select('count').eq('id', 1).single();
    return data ? data.count : 1248;
  } catch {
    return 1248;
  }
};

// Products API Async and connected to Supabase
export const getProducts = async (): Promise<Product[]> => {
  await seedIfEmpty();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error || !data) return [];
  return data.map(mapProductFromDB);
};

export const saveProduct = async (product: Product): Promise<Product[]> => {
  const deliveryPayload = JSON.stringify({
    deliveryInfo: product.deliveryInfo || '',
    videoUrl: product.videoUrl || '',
    colors: product.colors || []
  });

  const dbPayload = {
    title: product.title,
    description: product.description,
    price: product.price,
    sale_price: product.salePrice || null,
    category: product.category,
    images: product.images,
    stock_status: product.stockStatus,
    sku: product.sku,
    product_id: product.productId,
    is_featured: product.isFeatured || false,
    fabric: product.fabric,
    sizes: product.sizeInfo || ['S', 'M', 'L', 'XL'],
    delivery_info: deliveryPayload
  };

  if (product.id && !product.id.startsWith('pro_')) {
    // Update
    await supabase.from('products').update(dbPayload).eq('id', product.id);
  } else {
    // Insert
    await supabase.from('products').insert(dbPayload);
  }
  return getProducts();
};

export const deleteProduct = async (id: string): Promise<Product[]> => {
  await supabase.from('products').delete().eq('id', id);
  return getProducts();
};

// Categories API Async
export const getCategories = async (): Promise<Category[]> => {
  await seedIfEmpty();
  const { data, error } = await supabase.from('categories').select('*').order('name', { ascending: true });
  if (error || !data) return [];
  return data.map(mapCategoryFromDB);
};

export const saveCategory = async (category: Category): Promise<Category[]> => {
  const dbPayload = {
    name: category.name,
    slug: category.slug,
    description: category.description || null,
    image_url: category.image || null,
    status: 'active'
  };

  if (category.id && !category.id.startsWith('cat_')) {
    await supabase.from('categories').update(dbPayload).eq('id', category.id);
  } else {
    await supabase.from('categories').insert(dbPayload);
  }
  return getCategories();
};

export const deleteCategory = async (id: string): Promise<Category[]> => {
  await supabase.from('categories').delete().eq('id', id);
  return getCategories();
};

// Banners API Async
export const getBanners = async (): Promise<Banner[]> => {
  await seedIfEmpty();
  const { data, error } = await supabase.from('banners').select('*').order('created_at', { ascending: true });
  if (error || !data) return [];
  return data.map(mapBannerFromDB);
};

export const saveBanner = async (banner: Banner): Promise<Banner[]> => {
  const dbPayload = {
    image_url: banner.image,
    title: banner.title,
    subtitle: banner.subtitle || null,
    link_url: banner.link,
    is_active: banner.isActive
  };

  if (banner.id && !banner.id.startsWith('banner_')) {
    await supabase.from('banners').update(dbPayload).eq('id', banner.id);
  } else {
    await supabase.from('banners').insert(dbPayload);
  }
  return getBanners();
};

export const deleteBanner = async (id: string): Promise<Banner[]> => {
  await supabase.from('banners').delete().eq('id', id);
  return getBanners();
};

// Inquiries (mapped to orders table on Supabase!)
export const getInquiries = async (): Promise<Inquiry[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data.map(mapInquiryFromDB);
};

export const addInquiry = async (inquiry: Omit<Inquiry, 'id' | 'date'>): Promise<Inquiry[]> => {
  await supabase.from('orders').insert({
    customer_name: inquiry.customerName,
    whatsapp_number: inquiry.customerPhone || '',
    product_name: inquiry.productTitle,
    product_link: inquiry.productLink || null,
    sku: inquiry.sku,
    price: inquiry.price,
    order_status: inquiry.status || 'New Order'
  });
  return getInquiries();
};

export const updateInquiryStatus = async (
  id: string, 
  status: 'New Order' | 'Contacted' | 'Confirmed' | 'Processing' | 'Delivered' | 'Cancelled'
): Promise<Inquiry[]> => {
  await supabase.from('orders').update({ order_status: status }).eq('id', id);
  return getInquiries();
};

export const deleteInquiry = async (id: string): Promise<Inquiry[]> => {
  await supabase.from('orders').delete().eq('id', id);
  return getInquiries();
};

// Site Reviews API Async
export const getReviews = async (): Promise<Review[]> => {
  await seedIfEmpty();
  let dbReviews: Review[] = [];
  try {
    const { data } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
    if (data && data.length > 0) {
      dbReviews = data.map(r => ({
        id: r.id,
        name: r.name,
        location: r.location || '',
        rating: r.rating,
        comment: r.comment || '',
        date: r.date || 'Just now',
        verified: r.verified
      }));
    }
  } catch (err) {
    console.warn("Silent reviews loading error:", err);
  }

  // Ensure high quality default reviews exist as fallback/starting base if missing
  const existingNames = new Set(dbReviews.map(r => r.name.toLowerCase()));
  const missingDefaults = DEFAULT_REVIEWS.filter(dr => !existingNames.has(dr.name.toLowerCase()));
  return [...dbReviews, ...missingDefaults];
};

export const addReview = async (review: Review): Promise<Review[]> => {
  await supabase.from('reviews').insert({
    name: review.name,
    location: review.location,
    rating: review.rating,
    comment: review.comment,
    date: review.date,
    verified: review.verified
  });
  return getReviews();
};

export const updateReviewStatus = async (id: string, approved: boolean): Promise<Review[]> => {
  await supabase.from('reviews').update({ verified: approved }).eq('id', id);
  return getReviews();
};

export const deleteReview = async (id: string): Promise<Review[]> => {
  await supabase.from('reviews').delete().eq('id', id);
  return getReviews();
};

// SEOMetadata API Async - Stored in website_settings table
export const getSEO = async (): Promise<SEOMetadata> => {
  try {
    const { data } = await supabase.from('website_settings').select('*').eq('id', 1).single();
    if (data) {
      return {
        metaTitle: data.seo_title || '',
        metaDescription: data.seo_description || '',
        ogTitle: data.seo_title || '',
        ogDescription: data.seo_description || '',
        ogImage: data.facebook_link || '', // using fb_link or custom
        sitemap: 'https://mushqoutfits.pk/sitemap.xml'
      };
    }
  } catch {}
  return {
    metaTitle: 'Outfits by Mushq | Luxury Pakistani Women Fashion Brand',
    metaDescription: 'Shop exquisite luxury unstitched lawn, velvet peshwas, organza tunics, premium party wear and stitched formal wear at Outfits by Mushq. Secure custom stitching available with upscale courier services worldwide.',
    ogTitle: 'Outfits by Mushq - Timeless Premium Pakistani Boutique',
    ogDescription: 'Experience pure chiffon, cotton jacquard, micro-velvets crafted in intricate Pakistani embroidery motifs. Orders directly on WhatsApp!',
    ogImage: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=80',
    sitemap: 'https://mushqoutfits.pk/sitemap.xml'
  };
}

export const saveSEO = async (metadata: SEOMetadata): Promise<SEOMetadata> => {
  try {
    await supabase.from('website_settings').upsert({
      id: 1,
      seo_title: metadata.metaTitle,
      seo_description: metadata.metaDescription,
    });
  } catch (err) {
    console.warn(err);
  }
  return getSEO();
};

// Website Settings Custom API
export interface WebsiteSettings {
  storeName: string;
  whatsappNumber: string;
  facebookLink: string;
}

export const getWebsiteSettings = async (): Promise<WebsiteSettings> => {
  try {
    const { data, error } = await supabase.from('website_settings').select('*').eq('id', 1).single();
    if (data) {
      return {
        storeName: data.store_name,
        whatsappNumber: data.whatsapp_number,
        facebookLink: data.facebook_link
      };
    }
  } catch {}
  return {
    storeName: 'Outfits by Mushq',
    whatsappNumber: '+92 302 0038010',
    facebookLink: 'https://facebook.com/mushqpk'
  };
};

export const saveWebsiteSettings = async (settings: WebsiteSettings): Promise<WebsiteSettings> => {
  await supabase.from('website_settings').upsert({
    id: 1,
    store_name: settings.storeName,
    whatsapp_number: settings.whatsappNumber,
    facebook_link: settings.facebookLink
  });
  return getWebsiteSettings();
};

export interface CustomMenuItem {
  id: string;
  name: string;
  type: 'home' | 'all_collections' | 'category';
  categorySlug?: string;
}

export interface CustomWebsiteConfigs {
  menuItems: CustomMenuItem[];
  announcementText: string;
  announcementEnabled: boolean;
  promo1: {
    image: string;
    heading: string;
    description: string;
    buttonText: string;
    fontColor: string;
    textPosition: 'left' | 'center' | 'right';
  };
  promo2: {
    image: string;
    heading: string;
    description: string;
    buttonText: string;
    fontColor: string;
    textPosition: 'left' | 'center' | 'right';
  };
  bannerHeadingColor: string;
  bannerDescColor: string;
  categoriesHeadingColor: string;
  categoriesDescColor: string;
  globalFabricDetails: string;
  globalSizingCharts: string;
  globalDeliveryInfo: string;
}

const DEFAULT_CUSTOM_CONFIGS: CustomWebsiteConfigs = {
  menuItems: [
    { id: 'menu_home', name: 'Home', type: 'home' },
    { id: 'menu_all', name: 'All Collections', type: 'all_collections' },
    { id: 'menu_bridal', name: 'Bridal Collection', type: 'category', categorySlug: 'bridal-collection' },
    { id: 'menu_casual', name: 'Casual Wear', type: 'category', categorySlug: 'casual-wear' },
    { id: 'menu_pret', name: 'Luxury Pret', type: 'category', categorySlug: 'luxury-pret' },
    { id: 'menu_summer', name: 'Summer Collection', type: 'category', categorySlug: 'summer-collection' }
  ],
  announcementText: 'LUXURY FESTIVE STITCHING & NATIONWIDE FREE SHIPPING ON INQUIRIES',
  announcementEnabled: true,
  promo1: {
    image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80',
    heading: 'The Summer Jacquards',
    description: 'Fine cotton woven threads with organza patchings and airy silk borders.',
    buttonText: 'Discover Summer',
    fontColor: '#ffffff',
    textPosition: 'left'
  },
  promo2: {
    image: 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?auto=format&fit=crop&w=800&q=80',
    heading: 'Bespoke Karandi & Velvets',
    description: 'Earthy shades, micro-spun fibers, heavy Kashmiri-style wool duppatas.',
    buttonText: 'Discover Winter',
    fontColor: '#ffffff',
    textPosition: 'left'
  },
  bannerHeadingColor: '#ffffff',
  bannerDescColor: '#d1d5db',
  categoriesHeadingColor: '#ab8215',
  categoriesDescColor: '#6b7280',
  globalFabricDetails: `Primary Fabric: Cotton Lawn\n\nThread Craftsmanship:\nFine quality handcraft, zari embellishments, tilla borders, gota work, and matching sequins.\n\nComponents:\n3-piece complete dress including matching trousers and premium dupatta.`,
  globalSizingCharts: `Standard Sizing Reference (Inches):\n- S  : Chest: 36" | Waist: 30" | Shoulder: 14.0" | Shirt Length: 39"\n- M  : Chest: 40" | Waist: 34" | Shoulder: 15.0" | Shirt Length: 40"\n- L  : Chest: 44" | Waist: 38" | Shoulder: 16.0" | Shirt Length: 41"\n- XL : Chest: 48" | Waist: 42" | Shoulder: 17.5" | Shirt Length: 42"\n- Custom: Hand-tailored to your exact requested dimensions.`,
  globalDeliveryInfo: `Premium Shipping:\nSecured high-speed courier dispatch with full insurance and real-time transit tracking across Pakistan and worldwide.\n\nFulfillment Duration:\n2-3 working days for unstitched fabrics. Tailoring orders require 10-14 working days for premium hand-finishing stitching.\n\nBoutique Packaging:\nDelivered inside premium Outfits by Mushq custom-lined luxury hardbound boxes.`
};

export const getCustomWebsiteConfigs = (): CustomWebsiteConfigs => {
  try {
    const saved = localStorage.getItem('mushq_custom_web_configs');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure all keys are populated
      return {
        ...DEFAULT_CUSTOM_CONFIGS,
        ...parsed,
        promo1: { ...DEFAULT_CUSTOM_CONFIGS.promo1, ...(parsed.promo1 || {}) },
        promo2: { ...DEFAULT_CUSTOM_CONFIGS.promo2, ...(parsed.promo2 || {}) }
      };
    }
  } catch (e) {
    console.warn('Failed to parse custom website configs:', e);
  }
  return DEFAULT_CUSTOM_CONFIGS;
};

export const saveCustomWebsiteConfigs = (configs: CustomWebsiteConfigs): CustomWebsiteConfigs => {
  try {
    localStorage.setItem('mushq_custom_web_configs', JSON.stringify(configs));
  } catch (e) {
    console.warn('Failed to save custom website configs:', e);
  }
  return getCustomWebsiteConfigs();
};

// Storage file uploader wrapper function
export const uploadImage = async (
  bucket: 'product_images' | 'category_images' | 'banner_images' | 'website_assets',
  file: File
): Promise<string> => {
  // Ensure bucket name matches
  const fileExt = file.name.split('.').pop();
  const uniqName = `${Math.random().toString(36).substring(2, 11)}_${Date.now()}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(uniqName, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) {
    console.error(`Submitting output to bucket ${bucket} failed:`, error);
    throw error;
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(uniqName);

  return publicUrl;
};
