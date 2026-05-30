import { Product, Category, Banner, Inquiry, Review, SEOMetadata } from './types';
import { DEFAULT_PRODUCTS, DEFAULT_CATEGORIES, DEFAULT_BANNERS, DEFAULT_REVIEWS, DEFAULT_SEO_METADATA } from './data';

const KEYS = {
  PRODUCTS: 'mushq_products_v1',
  CATEGORIES: 'mushq_categories_v1',
  BANNERS: 'mushq_banners_v1',
  INQUIRIES: 'mushq_inquiries_v1',
  SEO: 'mushq_seo_v1',
  VISITORS: 'mushq_visitors_v1',
  REVIEWS: 'mushq_reviews_v1'
};

export const initializeDatabase = () => {
  if (!localStorage.getItem(KEYS.PRODUCTS)) {
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
  }
  if (!localStorage.getItem(KEYS.CATEGORIES)) {
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
  }
  if (!localStorage.getItem(KEYS.BANNERS)) {
    localStorage.setItem(KEYS.BANNERS, JSON.stringify(DEFAULT_BANNERS));
  }
  if (!localStorage.getItem(KEYS.SEO)) {
    localStorage.setItem(KEYS.SEO, JSON.stringify(DEFAULT_SEO_METADATA));
  }
  if (!localStorage.getItem(KEYS.REVIEWS)) {
    localStorage.setItem(KEYS.REVIEWS, JSON.stringify(DEFAULT_REVIEWS));
  }
  if (!localStorage.getItem(KEYS.VISITORS)) {
    localStorage.setItem(KEYS.VISITORS, '1248');
  }
  if (!localStorage.getItem(KEYS.INQUIRIES)) {
    // Seed some initial realistic inquiries
    const initialInquiries: Inquiry[] = [
      {
        id: 'inq_1',
        customerName: 'Sobia Mughal',
        customerPhone: '+923331234567',
        productTitle: 'Zari Emerald Velvet Peshwas',
        price: 'Rs. 22,500',
        sku: 'MQ-NUR-EMERALD-01',
        date: '2026-05-29'
      },
      {
        id: 'inq_2',
        customerName: 'Hina Parvez',
        customerPhone: '+923009876543',
        productTitle: 'Sorbet Peach Cotton Jacquard',
        price: 'Rs. 9,500',
        sku: 'MQ-LAWN-SORBET-03',
        date: '2026-05-30'
      }
    ];
    localStorage.setItem(KEYS.INQUIRIES, JSON.stringify(initialInquiries));
  }
};

// Increment visitor count by 1
export const incrementVisitors = (): number => {
  initializeDatabase();
  const current = parseInt(localStorage.getItem(KEYS.VISITORS) || '1248', 10);
  const next = current + 1;
  localStorage.setItem(KEYS.VISITORS, next.toString());
  return next;
};

export const getVisitors = (): number => {
  initializeDatabase();
  return parseInt(localStorage.getItem(KEYS.VISITORS) || '1248', 10);
};

// Products API
export const getProducts = (): Product[] => {
  initializeDatabase();
  return JSON.parse(localStorage.getItem(KEYS.PRODUCTS) || '[]');
};

export const saveProduct = (product: Product): Product[] => {
  const products = getProducts();
  const index = products.findIndex(p => p.id === product.id);
  if (index > -1) {
    products[index] = product;
  } else {
    products.unshift(product);
  }
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
  return products;
};

export const deleteProduct = (id: string): Product[] => {
  const products = getProducts();
  const filtered = products.filter(p => p.id !== id);
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(filtered));
  return filtered;
};

// Categories API
export const getCategories = (): Category[] => {
  initializeDatabase();
  return JSON.parse(localStorage.getItem(KEYS.CATEGORIES) || '[]');
};

export const saveCategory = (category: Category): Category[] => {
  const categories = getCategories();
  const index = categories.findIndex(c => c.id === category.id);
  if (index > -1) {
    categories[index] = category;
  } else {
    categories.push(category);
  }
  localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories));
  return categories;
};

export const deleteCategory = (id: string): Category[] => {
  const categories = getCategories();
  const filtered = categories.filter(c => c.id !== id);
  localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(filtered));
  return filtered;
};

// Banners API
export const getBanners = (): Banner[] => {
  initializeDatabase();
  return JSON.parse(localStorage.getItem(KEYS.BANNERS) || '[]');
};

export const saveBanner = (banner: Banner): Banner[] => {
  const banners = getBanners();
  const index = banners.findIndex(b => b.id === banner.id);
  if (index > -1) {
    banners[index] = banner;
  } else {
    banners.push(banner);
  }
  localStorage.setItem(KEYS.BANNERS, JSON.stringify(banners));
  return banners;
};

export const deleteBanner = (id: string): Banner[] => {
  const banners = getBanners();
  const filtered = banners.filter(b => b.id !== id);
  localStorage.setItem(KEYS.BANNERS, JSON.stringify(filtered));
  return filtered;
};

// Inquiries API
export const getInquiries = (): Inquiry[] => {
  initializeDatabase();
  return JSON.parse(localStorage.getItem(KEYS.INQUIRIES) || '[]');
};

export const addInquiry = (inquiry: Omit<Inquiry, 'id' | 'date'>): Inquiry[] => {
  const inquiries = getInquiries();
  const newInquiry: Inquiry = {
    ...inquiry,
    id: 'inq_' + Date.now(),
    date: new Date().toISOString().split('T')[0]
  };
  inquiries.unshift(newInquiry);
  localStorage.setItem(KEYS.INQUIRIES, JSON.stringify(inquiries));
  return inquiries;
};

export const deleteInquiry = (id: string): Inquiry[] => {
  const inquiries = getInquiries();
  const filtered = inquiries.filter(i => i.id !== id);
  localStorage.setItem(KEYS.INQUIRIES, JSON.stringify(filtered));
  return filtered;
};

// Reviews API
export const getReviews = (): Review[] => {
  initializeDatabase();
  return JSON.parse(localStorage.getItem(KEYS.REVIEWS) || '[]');
};

export const addReview = (review: Review): Review[] => {
  const reviews = getReviews();
  reviews.unshift(review);
  localStorage.setItem(KEYS.REVIEWS, JSON.stringify(reviews));
  return reviews;
};

// SEO Metadata API
export const getSEO = (): SEOMetadata => {
  initializeDatabase();
  return JSON.parse(localStorage.getItem(KEYS.SEO) || JSON.stringify(DEFAULT_SEO_METADATA));
};

export const saveSEO = (metadata: SEOMetadata): SEOMetadata => {
  localStorage.setItem(KEYS.SEO, JSON.stringify(metadata));
  return metadata;
};
