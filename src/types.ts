export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number; // Regular Price in PKR
  salePrice?: number; // Sale Price in PKR
  category: string; // Slug or Name
  images: string[];
  stockStatus: 'instock' | 'outofstock';
  sku: string;
  productId: string; // SKU or system ID
  isFeatured: boolean;
  fabric: string; // e.g. Chiffon, Cotton Lawn, Linen
  sizeInfo?: string[]; // e.g. ['S', 'M', 'L', 'XL', 'Custom']
  deliveryInfo?: string; // custom delivery text
  createdAt: string;
}

export interface Banner {
  id: string;
  image: string;
  title: string;
  subtitle?: string;
  link: string;
  isActive: boolean;
}

export interface Inquiry {
  id: string;
  customerName: string;
  customerPhone?: string;
  productTitle: string;
  price: string;
  sku: string;
  date: string;
  productLink?: string;
  status?: 'New Order' | 'Contacted' | 'Confirmed' | 'Processing' | 'Delivered' | 'Cancelled';
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedSize: string;
  customMeasurements?: {
    bust?: string;
    shirtLength?: string;
    waist?: string;
    trouserLength?: string;
  };
}

export interface Review {
  id: string;
  name: string;
  location: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

export interface SEOMetadata {
  metaTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  sitemap: string;
}
