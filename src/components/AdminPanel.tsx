import React, { useState, useEffect } from 'react';
import { 
  Building, LayoutDashboard, ShoppingBag, FolderHeart, Image, 
  Users, Search, ShieldCheck, Sparkles, Plus, Trash2, Edit3, 
  Check, Save, ArrowRight, Eye, RefreshCw, LogOut, Terminal, 
  FileText, ArrowUpRight, HelpCircle, Video, Palette, Info, 
  CheckCircle2, AlertTriangle, AlertCircle, PlayCircle, Loader2, Play, Star, Globe
} from 'lucide-react';
import { Product, Category, Banner, Inquiry, SEOMetadata, Review } from '../types';
import { 
  getProducts, saveProduct, deleteProduct,
  getCategories, saveCategory, deleteCategory,
  getBanners, saveBanner, deleteBanner,
  getInquiries, addInquiry, deleteInquiry, updateInquiryStatus,
  getSEO, saveSEO, getReviews, getVisitors,
  getWebsiteSettings, saveWebsiteSettings, uploadImage,
  updateReviewStatus, deleteReview,
  getCustomWebsiteConfigs, saveCustomWebsiteConfigs,
  CustomWebsiteConfigs, CustomMenuItem
} from '../storage';
import { supabase } from '../supabaseClient';

interface AdminPanelProps {
  onDatabaseUpdate: () => void;
  onLogoutAdmin: () => void;
}

const DEFAULT_PRODUCT_DESCRIPTION = `[Fabric Details]
Premium authentic high-grade Eastern luxury lawn fabric, embroidered meticulously with luxury silk threads and zari crafting. Intricate traditional designs and luxurious soft feel.

[Measurement / Size Chart]
Standard Sizing Reference (Inches):
- S  : Chest: 36" | Waist: 30" | Shoulder: 14.0" | Shirt Length: 39"
- M  : Chest: 40" | Waist: 34" | Shoulder: 15.0" | Shirt Length: 40"
- L  : Chest: 44" | Waist: 38" | Shoulder: 16.0" | Shirt Length: 41"
- XL : Chest: 48" | Waist: 42" | Shoulder: 17.5" | Shirt Length: 42"
- Custom: Hand-tailored to your exact requested dimensions.

[Care Instructions]
- Dry clean highly recommended to preserve rich embellishments.
- Wash delicate fabrics inside out using cold water and mild liquid detergent.
- Iron on low heat settings; avoid direct steam on thread ornaments.

[Disclaimer Detail]
Actual product color may slightly vary due to lighting conditions, photography, and screen display settings.`;

export default function AdminPanel({ onDatabaseUpdate, onLogoutAdmin }: AdminPanelProps) {
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Active Tab - Completely hide 'supabase' SQL tab
  const [activeTab, setActiveTab ] = useState<'overview' | 'products' | 'categories' | 'banners' | 'inquiries' | 'reviews' | 'seo' | 'website_customization' | 'global_product_info'>('overview');

  // Website Customization and Global Product Info state
  const [menuItems, setMenuItems] = useState<CustomMenuItem[]>([]);
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementEnabled, setAnnouncementEnabled] = useState(true);
  const [promo1Image, setPromo1Image] = useState('');
  const [promo1Heading, setPromo1Heading] = useState('');
  const [promo1Description, setPromo1Description] = useState('');
  const [promo1ButtonText, setPromo1ButtonText] = useState('');
  const [promo1FontColor, setPromo1FontColor] = useState('');
  const [promo1TextPosition, setPromo1TextPosition] = useState<'left' | 'center' | 'right'>('left');
  
  const [promo2Image, setPromo2Image] = useState('');
  const [promo2Heading, setPromo2Heading] = useState('');
  const [promo2Description, setPromo2Description] = useState('');
  const [promo2ButtonText, setPromo2ButtonText] = useState('');
  const [promo2FontColor, setPromo2FontColor] = useState('');
  const [promo2TextPosition, setPromo2TextPosition] = useState<'left' | 'center' | 'right'>('left');

  const [bannerHeadingColor, setBannerHeadingColor] = useState('');
  const [bannerDescColor, setBannerDescColor] = useState('');
  const [categoriesHeadingColor, setCategoriesHeadingColor] = useState('');
  const [categoriesDescColor, setCategoriesDescColor] = useState('');

  const [globalFabricDetails, setGlobalFabricDetails] = useState('');
  const [globalSizingCharts, setGlobalSizingCharts] = useState('');
  const [globalDeliveryInfo, setGlobalDeliveryInfo] = useState('');

  // Database lists
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [seo, setSeo] = useState<SEOMetadata>({
    metaTitle: '', metaDescription: '', ogTitle: '', ogDescription: '', ogImage: '', sitemap: ''
  });
  const [reviewsCount, setReviewsCount] = useState(0);
  const [visitorsCount, setVisitorsCount] = useState(0);

  // Expanded Website Settings
  const [storeName, setStoreName] = useState('Mushq Outfits');
  const [whatsappNumber, setWhatsappNumber] = useState('+92 302 0038010');
  const [facebookLink, setFacebookLink] = useState('https://facebook.com/mushqpk');
  const [isUploading, setIsUploading] = useState<string | null>(null);

  // Form states - Products
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodTitle, setProdTitle] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState(0);
  const [prodSalePrice, setProdSalePrice] = useState('');
  const [prodCategory, setProdCategory] = useState('');
  const [prodImages, setProdImages] = useState<string[]>(['', '', '']); // EXACT 3 IMAGES
  const [prodStock, setProdStock] = useState<'instock' | 'outofstock'>('instock');
  const [prodSku, setProdSku] = useState('');
  const [prodId, setProdId] = useState('');
  const [prodFabric, setProdFabric] = useState('');
  const [prodSizes, setProdSizes] = useState<string[]>(['S', 'M', 'L', 'XL']);
  const [prodVideoUrl, setProdVideoUrl] = useState('');
  const [prodColors, setProdColors] = useState<string[]>([]);
  const [newColorInput, setNewColorInput] = useState('');
  const [prodFeatured, setProdFeatured] = useState(false);
  
  // UX Enhancement states
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Custom Toast State
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>>([]);
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Custom Confirmation Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const triggerConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmDialog(p => ({ ...p, isOpen: false }));
      }
    });
  };
  
  // Generating description with AI Gemini helper
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiError, setAiError] = useState('');

  // Form states - Categories
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catImage, setCatImage] = useState('');

  // Form states - Banners
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerSubtitle, setBannerSubtitle] = useState('');
  const [bannerImage, setBannerImage] = useState('');
  const [bannerLink, setBannerLink] = useState('');
  const [bannerActive, setBannerActive] = useState(true);

  const loadCustomConfigs = () => {
    const configs = getCustomWebsiteConfigs();
    setMenuItems(configs.menuItems || []);
    setAnnouncementText(configs.announcementText || '');
    setAnnouncementEnabled(configs.announcementEnabled !== false);
    setPromo1Image(configs.promo1?.image || '');
    setPromo1Heading(configs.promo1?.heading || '');
    setPromo1Description(configs.promo1?.description || '');
    setPromo1ButtonText(configs.promo1?.buttonText || '');
    setPromo1FontColor(configs.promo1?.fontColor || '#ffffff');
    setPromo1TextPosition(configs.promo1?.textPosition || 'left');

    setPromo2Image(configs.promo2?.image || '');
    setPromo2Heading(configs.promo2?.heading || '');
    setPromo2Description(configs.promo2?.description || '');
    setPromo2ButtonText(configs.promo2?.buttonText || '');
    setPromo2FontColor(configs.promo2?.fontColor || '#ffffff');
    setPromo2TextPosition(configs.promo2?.textPosition || 'left');

    setBannerHeadingColor(configs.bannerHeadingColor || '#ffffff');
    setBannerDescColor(configs.bannerDescColor || '#d1d5db');
    setCategoriesHeadingColor(configs.categoriesHeadingColor || '#ab8215');
    setCategoriesDescColor(configs.categoriesDescColor || '#6b7280');

    setGlobalFabricDetails(configs.globalFabricDetails || '');
    setGlobalSizingCharts(configs.globalSizingCharts || '');
    setGlobalDeliveryInfo(configs.globalDeliveryInfo || '');
  };

  // Load and refresh state
  const loadDatabase = async () => {
    try {
      const prods = await getProducts();
      setProducts(prods);
      const cats = await getCategories();
      setCategories(cats);
      const bans = await getBanners();
      setBanners(bans);
      const inqs = await getInquiries();
      setInquiries(inqs);
      const s = await getSEO();
      setSeo(s);

      const setts = await getWebsiteSettings();
      setStoreName(setts.storeName);
      setWhatsappNumber(setts.whatsappNumber);
      setFacebookLink(setts.facebookLink);

      const revs = await getReviews();
      setReviewsCount(revs.length);
      setReviews(revs);
      const v = await getVisitors();
      setVisitorsCount(v);
      
      loadCustomConfigs();
    } catch (e) {
      console.error('Failed loading database in Admin:', e);
    }
  };

  const handleSaveCustomConfigs = async () => {
    setIsActionLoading(true);
    try {
      const payload: CustomWebsiteConfigs = {
        menuItems,
        announcementText,
        announcementEnabled,
        promo1: {
          image: promo1Image,
          heading: promo1Heading,
          description: promo1Description,
          buttonText: promo1ButtonText,
          fontColor: promo1FontColor,
          textPosition: promo1TextPosition
        },
        promo2: {
          image: promo2Image,
          heading: promo2Heading,
          description: promo2Description,
          buttonText: promo2ButtonText,
          fontColor: promo2FontColor,
          textPosition: promo2TextPosition
        },
        bannerHeadingColor,
        bannerDescColor,
        categoriesHeadingColor,
        categoriesDescColor,
        globalFabricDetails,
        globalSizingCharts,
        globalDeliveryInfo
      };
      saveCustomWebsiteConfigs(payload);
      showToast('Website Configuration saved successfully!', 'success');
      onDatabaseUpdate(); // Refresh components in App.tsx
    } catch {
      showToast('Error saving configuration.', 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  useEffect(() => {
    // Check if user is already authenticated in Supabase session
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        setIsAuthenticated(true);
        loadDatabase();
      } else {
        setIsAuthenticated(false);
      }
    };
    checkUser();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) {
        // Auto-signup option for seamless out of the box credentials experience
        if (error.message.toLowerCase().includes('invalid login credentials') || error.status === 400) {
          const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
            email,
            password
          });
          if (signUpErr) {
            setAuthError(`Supabase Auth credentials error: ${error.message}`);
            return;
          }
          if (signUpData?.user) {
            // Re-attempt sign in on successful provision
            const { data: retryData, error: retryErr } = await supabase.auth.signInWithPassword({ email, password });
            if (retryErr) {
              setAuthError(retryErr.message);
            } else {
              setIsAuthenticated(true);
              await loadDatabase();
            }
            return;
          }
        }
        setAuthError(error.message);
      } else if (data?.user) {
        setIsAuthenticated(true);
        await loadDatabase();
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed.');
    }
  };

  const handleQuickLogin = async () => {
    const adminEmail = 'admin@mushq.pk';
    const adminPassword = 'mushq-luxury';
    setEmail(adminEmail);
    setPassword(adminPassword);
    setAuthError('');
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword
      });
      if (error) {
        // If they don't exist yet, auto-provision
        const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
          email: adminEmail,
          password: adminPassword
        });
        if (signUpErr) {
          setAuthError(`Auto-provision failed: ${signUpErr.message}`);
          return;
        }
        const { data: retryData, error: retryErr } = await supabase.auth.signInWithPassword({
          email: adminEmail,
          password: adminPassword
        });
        if (retryErr) {
          setAuthError(retryErr.message);
        } else {
          setIsAuthenticated(true);
          await loadDatabase();
        }
      } else {
        setIsAuthenticated(true);
        await loadDatabase();
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Quick login failed.');
    }
  };

  // PRODUCTS MANAGER SAVE/DELETE
  const handleOpenProductAdd = () => {
    setEditingProduct(null);
    setProdTitle('');
    // Use the professional default product template containing Sizing, Fabric details, Care, and Disclaimer
    setProdDesc(DEFAULT_PRODUCT_DESCRIPTION);
    setProdPrice(10000);
    setProdSalePrice('');
    setProdCategory(categories[0]?.slug || 'luxury-lawn');
    setProdImages(['https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800', '', '']);
    setProdStock('instock');
    
    // Automatically Generated SKU
    const randCode = Math.floor(1000 + Math.random() * 8999);
    const skuString = `MQ-${(categories[0]?.slug || 'LAWN').toUpperCase().replace(/[^A-Z]/g, '').substring(0, 5)}-${randCode}`;
    setProdSku(skuString);

    // Automatically Generated Product Display ID
    const displayIdString = `PROD-${randCode}`;
    setProdId(displayIdString);

    setProdFabric('Cotton Lawn');
    setProdSizes(['S', 'M', 'L', 'XL', 'Custom']);
    setProdColors(['Classic Black', 'Rose Wood', 'Gold Zari']);
    setProdVideoUrl('');
    setProdFeatured(false);
    setIsProductModalOpen(true);
  };

  const handleOpenProductEdit = (p: Product) => {
    setEditingProduct(p);
    setProdTitle(p.title);
    setProdDesc(p.description);
    setProdPrice(p.price);
    setProdSalePrice(p.salePrice ? p.salePrice.toString() : '');
    setProdCategory(p.category);
    
    // Ensure we handle exactly 3 product photos
    const imgArr = [...p.images];
    while (imgArr.length < 3) imgArr.push('');
    setProdImages(imgArr.slice(0, 3));
    
    setProdStock(p.stockStatus);
    setProdSku(p.sku);
    setProdId(p.productId);
    setProdFabric(p.fabric);
    setProdSizes(p.sizeInfo || ['S', 'M', 'L', 'XL']);
    setProdColors(p.colors || []);
    setProdVideoUrl(p.videoUrl || '');
    setProdFeatured(p.isFeatured);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodTitle.trim()) {
      showToast('Product title cannot be empty.', 'error');
      return;
    }
    if (!prodSku.trim() || !prodId.trim()) {
      showToast('SKU and Product Display ID are required.', 'error');
      return;
    }

    setIsActionLoading(true);
    try {
      const filteredImages = prodImages.map(img => img.trim()).filter(Boolean);
      if (filteredImages.length === 0) {
        showToast('Please provide at least a primary product picture.', 'error');
        setIsActionLoading(false);
        return;
      }

      const newProduct: Product = {
        id: editingProduct ? editingProduct.id : 'pro_' + Date.now(),
        title: prodTitle,
        description: prodDesc,
        price: Number(prodPrice),
        salePrice: prodSalePrice ? Number(prodSalePrice) : undefined,
        category: prodCategory,
        images: filteredImages,
        stockStatus: prodStock,
        sku: prodSku,
        productId: prodId,
        fabric: prodFabric,
        sizeInfo: prodSizes,
        colors: prodColors,
        videoUrl: prodVideoUrl,
        isFeatured: prodFeatured,
        createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString()
      };

      await saveProduct(newProduct);
      await loadDatabase();
      onDatabaseUpdate();
      setIsProductModalOpen(false);
      showToast(editingProduct ? 'Premium outfit saved successfully!' : 'Stunning new outfit added successfully!', 'success');
    } catch (err: any) {
      showToast(`Failed to save outfit: ${err.message || err}`, 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    triggerConfirm(
      'Remove Premium Outfit',
      'Are you sure you want to permanently delete this outfit from the website?',
      async () => {
        setIsActionLoading(true);
        try {
          await deleteProduct(id);
          await loadDatabase();
          onDatabaseUpdate();
          showToast('Product outfit removed from boutique archive.', 'success');
        } catch (err: any) {
          showToast(`Deletion failed: ${err.message || err}`, 'error');
        } finally {
          setIsActionLoading(false);
        }
      }
    );
  };

  const handleToggleProductFeatured = async (p: Product) => {
    setIsActionLoading(true);
    try {
      const updated = { ...p, isFeatured: !p.isFeatured };
      await saveProduct(updated);
      await loadDatabase();
      onDatabaseUpdate();
      showToast(p.isFeatured ? 'Removed from homepage showcase tabs.' : 'Successfully pinned to premium showcase tabs!', 'success');
    } catch (err: any) {
      showToast(`Failed to pin outfit: ${err.message || err}`, 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  // AI GEMINI LUXURY DESCRIPTION GENERATOR
  const generateAIDescription = async () => {
    if (!prodTitle) {
      alert('Please fill the Product Title first to let Gemini generate descriptions.');
      return;
    }
    setIsAiGenerating(true);
    setAiError('');

    try {
      const response = await fetch('/api/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: prodTitle, 
          category: prodCategory, 
          fabric: prodFabric 
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.description) {
          setProdDesc(data.description);
        } else {
          fallbackLocalDescription();
        }
      } else {
        fallbackLocalDescription();
      }
    } catch (err) {
      console.warn('Failed connecting to Express Gemini endpoint, using luxury local builder');
      fallbackLocalDescription();
    } finally {
      setIsAiGenerating(false);
    }
  };

  const fallbackLocalDescription = () => {
    // Elegant eastern clothing description template generator
    const descriptors = [
      "A magnificent illustration of timeless Eastern allure,",
      "Designed specifically for the contemporary Pakistani woman,",
      "Exhibiting opulent hand-crafted threadwork and stellar motifs,"
    ];
    const fabricText = `meticulously loomed from premium ${prodFabric || 'pure boutique fabrics'}.`;
    const details = `Comes equipped with highly detailed scalloped borders, contrasting customized dupatta with gold stamp accents, and bespoke trousers. Ideal for high-profile weddings, intimate mehndi gatherings, and semi-formal soirées. It defines pure luxury.`;
    
    setProdDesc(`${descriptors[Math.floor(Math.random() * descriptors.length)]} ${fabricText} ${details}`);
    setAiError('Loaded luxury custom fallback blueprint (Gemini server key pending!).');
  };

  // CATEGORIES MANAGER CRUDS
  const handleOpenCategoryAdd = () => {
    setEditingCategory(null);
    setCatName('');
    setCatSlug('');
    setCatDesc('');
    setCatImage('https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400');
    setIsCategoryModalOpen(true);
  };

  const handleOpenCategoryEdit = (c: Category) => {
    setEditingCategory(c);
    setCatName(c.name);
    setCatSlug(c.slug);
    setCatDesc(c.description || '');
    setCatImage(c.image || '');
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) {
      showToast('Category name is required.', 'error');
      return;
    }
    setIsActionLoading(true);
    try {
      const newCat: Category = {
        id: editingCategory ? editingCategory.id : 'cat_' + Date.now(),
        name: catName,
        slug: catSlug || catName.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, ''),
        description: catDesc,
        image: catImage
      };
      await saveCategory(newCat);
      await loadDatabase();
      onDatabaseUpdate();
      setIsCategoryModalOpen(false);
      showToast('Category saved successfully!', 'success');
    } catch (err: any) {
      showToast(`Failed to save category: ${err.message || err}`, 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    triggerConfirm(
      'Delete Category',
      'Are you sure you want to delete this category? Associated products may lose indexing.',
      async () => {
        setIsActionLoading(true);
        try {
          await deleteCategory(id);
          await loadDatabase();
          onDatabaseUpdate();
          showToast('Category deleted successfully.', 'success');
        } catch (err: any) {
          showToast(`Deletion failed: ${err.message || err}`, 'error');
        } finally {
          setIsActionLoading(false);
        }
      }
    );
  };

  // BANNER CRUDS
  const handleOpenBannerAdd = () => {
    setEditingBanner(null);
    setBannerTitle('');
    setBannerSubtitle('');
    setBannerImage('https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1600');
    setBannerLink('/category/new-arrivals');
    setBannerActive(true);
    setIsBannerModalOpen(true);
  };

  const handleOpenBannerEdit = (b: Banner) => {
    setEditingBanner(b);
    setBannerTitle(b.title);
    setBannerSubtitle(b.subtitle || '');
    setBannerImage(b.image);
    setBannerLink(b.link);
    setBannerActive(b.isActive);
    setIsBannerModalOpen(true);
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerTitle.trim()) {
      showToast('Banner title is required.', 'error');
      return;
    }
    setIsActionLoading(true);
    try {
      const newBanner: Banner = {
        id: editingBanner ? editingBanner.id : 'banner_' + Date.now(),
        title: bannerTitle,
        subtitle: bannerSubtitle,
        image: bannerImage,
        link: bannerLink,
        isActive: bannerActive
      };
      await saveBanner(newBanner);
      await loadDatabase();
      onDatabaseUpdate();
      setIsBannerModalOpen(false);
      showToast('Boutique banner updated successfully!', 'success');
    } catch (err: any) {
      showToast(`Failed to save banner: ${err.message || err}`, 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    triggerConfirm(
      'Remove Boutique Banner',
      'Are you sure you want to delete this home styling banner from the website?',
      async () => {
        setIsActionLoading(true);
        try {
          await deleteBanner(id);
          await loadDatabase();
          onDatabaseUpdate();
          showToast('Banner removed from home slide.', 'success');
        } catch (err: any) {
          showToast(`Deletion failed: ${err.message || err}`, 'error');
        } finally {
          setIsActionLoading(false);
        }
      }
    );
  };

  // SEO SAVE & WEBSITE SETTINGS
  const handleSaveSEOConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsActionLoading(true);
    try {
      await saveSEO(seo);
      await saveWebsiteSettings({
        storeName,
        whatsappNumber,
        facebookLink
      });
      await loadDatabase();
      showToast('Website configurations & SEO metadata saved successfully!', 'success');
    } catch (err: any) {
      showToast(`Failed to commit configuration: ${err.message || err}`, 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  // INQUIRIES DELETE
  const handleDeleteInquiryLog = async (id: string) => {
    triggerConfirm(
      'Dismiss Order Inquiry',
      'Are you sure you want to dismiss and delete this customer inquiry from logs?',
      async () => {
        setIsActionLoading(true);
        try {
          await deleteInquiry(id);
          await loadDatabase();
          showToast('Inquiry log pruned successfully.', 'success');
        } catch (err: any) {
          showToast(`Dismissal failed: ${err.message || err}`, 'error');
        } finally {
          setIsActionLoading(false);
        }
      }
    );
  };

  const handleUpdateInquiryStatus = async (id: string, status: 'New Order' | 'Contacted' | 'Confirmed' | 'Processing' | 'Delivered' | 'Cancelled') => {
    setIsActionLoading(true);
    try {
      await updateInquiryStatus(id, status);
      await loadDatabase();
      showToast(`Order status successfully updated to: ${status}`, 'success');
    } catch (err: any) {
      showToast(`Status update failed: ${err.message || err}`, 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  // REVIEWS ACTIONS
  const handleToggleReviewStatus = async (id: string, currentStatus: boolean) => {
    setIsActionLoading(true);
    try {
      await updateReviewStatus(id, !currentStatus);
      await loadDatabase();
      showToast(
        !currentStatus 
          ? 'Patron review successfully approved and published live!' 
          : 'Patron review successfully hidden from public storefront.', 
        'success'
      );
    } catch (err: any) {
      showToast(`Review status alteration failed: ${err.message || err}`, 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteReviewLog = async (id: string) => {
    triggerConfirm(
      'Purge Patron Review',
      'Are you absolutely sure you want to permanently delete this review? This action is completely irreversible.',
      async () => {
        setIsActionLoading(true);
        try {
          await deleteReview(id);
          await loadDatabase();
          showToast('Patron review successfully purged from the database.', 'success');
        } catch (err: any) {
          showToast(`Deletion of review failed: ${err.message || err}`, 'error');
        } finally {
          setIsActionLoading(false);
        }
      }
    );
  };

  // LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div id="admin-login-screen" className="max-w-md mx-auto my-20 p-8 bg-[#fff] border border-cream-200 rounded-2xl shadow-xl">
        <div className="text-center flex flex-col items-center justify-center mb-8">
          <Building className="w-10 h-10 text-emerald-900 mb-2" />
          <h2 className="text-2xl font-serif font-bold text-emerald-950 tracking-wide">Mushq Outfits</h2>
          <span className="text-xs uppercase tracking-widest text-gold-600 font-semibold mt-1">Admin Management Center</span>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-widest mb-1">
              Admin Username
            </label>
            <input
              type="email"
              placeholder="admin@mushq.pk"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-cream-50 border border-cream-200 rounded-lg p-3 text-xs text-neutral-800 focus:outline-none focus:border-emerald-800 font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-widest mb-1">
              Secret Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-cream-50 border border-cream-200 rounded-lg p-3 text-xs text-neutral-800 focus:outline-none focus:border-emerald-800 font-sans"
            />
          </div>

          {authError && (
            <p className="text-[11px] text-rose-700 font-bold bg-rose-50 p-2 rounded border border-rose-200">
              ⚠ {authError}
            </p>
          )}

          <button
            type="submit"
            id="btn-admin-submit"
            className="w-full bg-emerald-900 hover:bg-emerald-950 text-cream-50 font-bold py-3 rounded-lg text-xs tracking-widest uppercase shadow transition-all cursor-pointer"
          >
            Authenticate Suite
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-cream-100 flex flex-col items-center justify-center">
          <span className="text-[10px] text-neutral-400 font-medium mb-2 uppercase">Developer / Review Sandbox:</span>
          <button
            onClick={handleQuickLogin}
            id="btn-quick-autologin"
            className="flex items-center gap-1.5 px-4 py-2 bg-gold-200/40 hover:bg-gold-200 border border-gold-300 text-gold-900 rounded-full text-[11px] font-bold tracking-wider uppercase transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#ab8215]" />
            <span>Instant Autologin Credentials</span>
          </button>
        </div>
      </div>
    );
  }

  // DASHBOARD WORKSPACE STATE
  return (
    <div id="admin-dashboard-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
      
      {/* -------------------- DYNAMIC PREMIUM NOTIFICATIONS (TOASTS) -------------------- */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`p-4 rounded-xl border shadow-xl flex items-start gap-3 pointer-events-auto animate-in slide-in-from-right-10 duration-300 ${
            t.type === 'success' 
              ? 'bg-[#f0fdf4] border-emerald-200 text-emerald-950' 
              : t.type === 'error' 
                ? 'bg-[#fef2f2] border-red-200 text-red-950' 
                : 'bg-[#f0f9ff] border-blue-200 text-blue-950'
          }`}>
            <div className="flex-shrink-0 mt-0.5">
              {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              {t.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
              {t.type === 'info' && <Info className="w-5 h-5 text-blue-600" />}
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold leading-relaxed">{t.message}</p>
            </div>
            <button 
              onClick={() => setToasts(prev => prev.filter(item => item.id !== t.id))}
              className="text-neutral-400 hover:text-neutral-700 cursor-pointer pointer-events-auto ml-1 font-bold"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* -------------------- DYNAMIC ACTION LOADING SPINNER OVERLAY -------------------- */}
      {isActionLoading && (
        <div className="fixed inset-0 bg-[#000]/40 backdrop-blur-xs flex items-center justify-center z-[100] animate-in fade-in duration-200">
          <div className="bg-[#fff] border border-cream-100 p-6 rounded-2xl shadow-2xl flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-emerald-950 animate-spin" />
            <p className="text-xs font-bold tracking-widest text-[#ab8215] uppercase animate-pulse">Syncing Boutique Database...</p>
          </div>
        </div>
      )}

      {/* -------------------- CUSTOM CONFIRMATION DIALOG MODAL -------------------- */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-[#000]/50 backdrop-blur-xs flex items-center justify-center p-4 z-[90] animate-in fade-in duration-200">
          <div className="bg-[#fff] rounded-xl border border-cream-100 shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200 text-center">
            <div className="mx-auto w-12 h-12 bg-cream-50 rounded-full flex items-center justify-center text-red-600 mb-4 border border-cream-100">
              <AlertTriangle className="w-6 h-6 animate-bounce" />
            </div>
            <h4 className="text-sm font-serif font-bold text-neutral-900 tracking-wide mb-1 uppercase tracking-wider">{confirmDialog.title}</h4>
            <p className="text-xs text-neutral-500 leading-relaxed mb-6">{confirmDialog.message}</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setConfirmDialog(p => ({ ...p, isOpen: false }))}
                className="px-4 py-2 text-xs font-bold text-neutral-600 uppercase tracking-widest hover:bg-neutral-100 rounded-lg cursor-pointer"
              >
                No, Cancel
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className="px-4 py-2 text-xs font-bold text-cream-50 uppercase tracking-widest bg-red-600 hover:bg-red-700 rounded-lg cursor-pointer shadow"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upper Brand panel & Admin details */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-emerald-950 text-[#fff] p-6 rounded-2xl border border-emerald-900 shadow-lg mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-900 rounded-xl text-gold-400 border border-emerald-800 shadow-inner">
            <Building className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold tracking-wide">Mushq Outfits Back-Office</h1>
            <p className="text-xs text-neutral-300">Logged in as admin@mushq.pk | Karachi HQ Live Control Node</p>
          </div>
        </div>

        <button
          onClick={() => {
            setIsAuthenticated(false);
            onLogoutAdmin();
          }}
          id="btn-admin-logout"
          className="flex items-center gap-1.5 px-4 font-bold py-2 bg-[#9c1c1c] hover:bg-red-800 text-[#fff] rounded-lg text-xs tracking-wider uppercase transition-colors pointer-events-auto cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit Suite</span>
        </button>
      </div>

      {/* Grid workspace routing with Sidebar Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Navigation Sidebar Drawer */}
        <div className="space-y-2 bg-[#fff] border border-cream-100 rounded-xl p-4 shadow-sm h-fit">
          <span className="text-[10px] font-bold text-gold-600 uppercase tracking-widest pl-3 block mb-2">Back-office Services</span>
          
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3.5 px-4 py-3 text-xs font-semibold tracking-wider uppercase rounded-lg cursor-pointer transition-all ${
              activeTab === 'overview' ? 'bg-emerald-900 text-cream-50 shadow-md' : 'text-neutral-700 hover:bg-cream-50'
            }`}
          >
            <LayoutDashboard className="w-4.5 h-4.5" />
            <span>Overview Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-3.5 px-4 py-3 text-xs font-semibold tracking-wider uppercase rounded-lg cursor-pointer transition-all ${
              activeTab === 'products' ? 'bg-emerald-900 text-cream-50 shadow-md' : 'text-neutral-700 hover:bg-cream-50'
            }`}
          >
            <ShoppingBag className="w-4.5 h-4.5" />
            <span>Product Catalog</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`w-full flex items-center gap-3.5 px-4 py-3 text-xs font-semibold tracking-wider uppercase rounded-lg cursor-pointer transition-all ${
              activeTab === 'categories' ? 'bg-emerald-900 text-cream-50 shadow-md' : 'text-neutral-700 hover:bg-cream-50'
            }`}
          >
            <FolderHeart className="w-4.5 h-4.5" />
            <span>Category Manager</span>
          </button>

          <button
            onClick={() => setActiveTab('banners')}
            className={`w-full flex items-center gap-3.5 px-4 py-3 text-xs font-semibold tracking-wider uppercase rounded-lg cursor-pointer transition-all ${
              activeTab === 'banners' ? 'bg-emerald-900 text-cream-50 shadow-md' : 'text-neutral-700 hover:bg-cream-50'
            }`}
          >
            <Image className="w-4.5 h-4.5" />
            <span>Banner Slivers</span>
          </button>

          <button
            onClick={() => setActiveTab('inquiries')}
            className={`w-full flex items-center justify-between px-4 py-3 text-xs font-semibold tracking-wider uppercase rounded-lg cursor-pointer transition-all ${
              activeTab === 'inquiries' ? 'bg-emerald-900 text-cream-50 shadow-md' : 'text-neutral-700 hover:bg-cream-50'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <Users className="w-4.5 h-4.5" />
              <span>Inquiry Register</span>
            </div>
            {inquiries.length > 0 && (
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === 'inquiries' ? 'bg-gold-500 text-emerald-950' : 'bg-gold-200 text-gold-900'}`}>
                {inquiries.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('seo')}
            className={`w-full flex items-center gap-3.5 px-4 py-3 text-xs font-semibold tracking-wider uppercase rounded-lg cursor-pointer transition-all ${
              activeTab === 'seo' ? 'bg-emerald-900 text-cream-50 shadow-md' : 'text-neutral-700 hover:bg-cream-50'
            }`}
          >
            <Sparkles className="w-4.5 h-4.5" />
            <span>Website Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('website_customization')}
            className={`w-full flex items-center gap-3.5 px-4 py-3 text-xs font-semibold tracking-wider uppercase rounded-lg cursor-pointer transition-all ${
              activeTab === 'website_customization' ? 'bg-emerald-900 text-cream-50 shadow-md' : 'text-neutral-700 hover:bg-cream-50'
            }`}
          >
            <Palette className="w-4.5 h-4.5" />
            <span>Website Customization</span>
          </button>

          <button
            onClick={() => setActiveTab('global_product_info')}
            className={`w-full flex items-center gap-3.5 px-4 py-3 text-xs font-semibold tracking-wider uppercase rounded-lg cursor-pointer transition-all ${
              activeTab === 'global_product_info' ? 'bg-emerald-900 text-cream-50 shadow-md' : 'text-neutral-700 hover:bg-cream-50'
            }`}
          >
            <FileText className="w-4.5 h-4.5" />
            <span>Global Product Info</span>
          </button>
        </div>

        {/* Dynamic Display Workspace (3 cols on lg) */}
        <div className="lg:col-span-3">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* Four Bento metric cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#fff] border border-cream-100 p-5 rounded-xl shadow-sm text-center">
                  <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider block mb-1">Products</span>
                  <span className="text-3xl font-bold text-emerald-950 font-serif block">{products.length}</span>
                  <span className="text-[10px] text-green-700 font-semibold block mt-1">100% catalog live</span>
                </div>
                <div className="bg-[#fff] border border-cream-100 p-5 rounded-xl shadow-sm text-center">
                  <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider block mb-1">Categories</span>
                  <span className="text-3xl font-bold text-emerald-950 font-serif block">{categories.length}</span>
                  <span className="text-[10px] text-neutral-500 font-semibold block mt-1">Structured taxonomies</span>
                </div>
                <div className="bg-[#fff] border border-cream-100 p-5 rounded-xl shadow-sm text-center">
                  <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider block mb-1">WhatsApp Orders</span>
                  <span className="text-3xl font-bold text-[#b99326] font-serif block">{inquiries.length}</span>
                  <span className="text-[10px] text-[#ab8215] font-semibold block mt-1">Pending logs tracked</span>
                </div>
                <div className="bg-[#fff] border border-cream-100 p-5 rounded-xl shadow-sm text-center">
                  <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider block mb-1">Visits logged</span>
                  <span className="text-3xl font-bold text-emerald-950 font-serif block">{visitorsCount}</span>
                  <span className="text-[10px] text-emerald-700 font-semibold block mt-1">Lighthouse 95+ responsive</span>
                </div>
              </div>

              {/* Weekly traffic analytics simulated chart */}
              <div className="bg-[#fff] border border-cream-100 p-6 rounded-xl shadow-sm">
                <div className="flex justify-between items-center border-b border-cream-100 pb-4 mb-4">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-800">Operational visitor footprint</h3>
                    <p className="text-xs text-neutral-400">Weekly trend indicators aligned with nationwide marketing campaigns</p>
                  </div>
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded">Live simulation active</span>
                </div>

                <div className="pt-2 h-40 flex items-end gap-3 md:gap-6 border-b border-cream-200 justify-around select-none">
                  {[
                    { day: 'Mon', count: 180, active: 40 },
                    { day: 'Tue', count: 210, active: 55 },
                    { day: 'Wed', count: 240, active: 70 },
                    { day: 'Thu', count: 290, active: 85 },
                    { day: 'Fri', count: 320, active: 90 },
                    { day: 'Sat', count: 380, active: 110 },
                    { day: 'Sun', count: 124, active: 62 }
                  ].map((data, idx) => (
                    <div key={idx} className="flex flex-col items-center flex-1 max-w-[40px] group">
                      <div className="w-full bg-emerald-100 rounded-t-md relative flex items-end" style={{ height: `${(data.count / 400) * 110}px` }}>
                        <div className="w-full bg-emerald-900 rounded-t-md relative shimmer" style={{ height: `${(data.active / data.count) * 100}%` }} />
                        <span className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-emerald-950 text-[#fff] text-[10px] px-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none font-mono">
                          {data.count}
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-500 font-bold uppercase mt-2">{data.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent WhatsApp inquires queue */}
              <div className="bg-[#fff] border border-cream-100 rounded-xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 bg-cream-50/50 border-b border-cream-100">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-800">Recent customer inquiries feed</h3>
                </div>
                {inquiries.length === 0 ? (
                  <div className="p-8 text-center text-sm text-neutral-400">
                    No order inquiries logged yet.
                  </div>
                ) : (
                  <div className="divide-y divide-cream-100/60 overflow-x-auto text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-cream-50 text-neutral-500 uppercase tracking-widest text-[9px] font-bold">
                          <th className="p-4">Customer Name</th>
                          <th className="p-4">Fabric / Product Interested</th>
                          <th className="p-4">Est. price</th>
                          <th className="p-4">Date logged</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inquiries.slice(0, 5).map((inq) => (
                          <tr key={inq.id} className="hover:bg-cream-50/30">
                            <td className="p-4 font-semibold text-neutral-800">{inq.customerName}</td>
                            <td className="p-4 font-semibold text-neutral-600">
                              <span className="block">{inq.productTitle}</span>
                              <span className="block text-[10px] text-neutral-400 font-normal">SKU: {inq.sku}</span>
                            </td>
                            <td className="p-4 font-mono text-emerald-950 font-bold">{inq.price}</td>
                            <td className="p-4 text-neutral-400">{inq.date}</td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => handleDeleteInquiryLog(inq.id)}
                                className="text-rose-600 hover:text-rose-800 font-extrabold cursor-pointer transition-colors p-1"
                                title="Dismiss inquiry"
                              >
                                Dismiss
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS CATALOG */}
          {activeTab === 'products' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex justify-between items-center bg-[#fff] border border-cream-100 p-4 rounded-xl shadow-sm">
                <div>
                  <h2 className="text-md font-serif font-bold text-emerald-950 uppercase tracking-wider">Product Catalog Registry</h2>
                  <p className="text-xs text-neutral-400">Total of {products.length} live catalog models indexed in database</p>
                </div>
                <button
                  onClick={handleOpenProductAdd}
                  id="btn-add-product-modal"
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-900 hover:bg-emerald-950 text-cream-50 rounded-lg text-xs font-bold tracking-wider uppercase transition-colors pointer-events-auto cursor-pointer shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Product</span>
                </button>
              </div>

              {/* Products table */}
              <div className="bg-[#fff] border border-cream-100 rounded-xl shadow-sm overflow-hidden text-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-cream-50 text-neutral-500 uppercase tracking-widest text-[9px] font-bold">
                        <th className="p-4">Visual</th>
                        <th className="p-4">Product Outline</th>
                        <th className="p-4">Pricing</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Featured</th>
                        <th className="p-4">Stock Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cream-100">
                      {products.map((p) => {
                        const hasSale = !!p.salePrice && p.salePrice < p.price;
                        return (
                          <tr key={p.id} className="hover:bg-cream-50/20">
                            <td className="p-4 max-w-[60px]">
                              <img src={p.images[0]} alt={p.title} referrerPolicy="no-referrer" className="w-12 aspect-[3/4] object-cover rounded-md border border-cream-100" />
                            </td>
                            <td className="p-4">
                              <span className="block font-bold text-neutral-800 text-sm font-serif">{p.title}</span>
                              <span className="block text-[9px] text-neutral-400 tracking-wider">SKU: {p.sku} | ID: {p.productId}</span>
                              <span className="block text-[9px] text-gold-700 italic font-semibold">{p.fabric}</span>
                            </td>
                            <td className="p-4 font-mono font-semibold">
                              {hasSale ? (
                                <>
                                  <span className="block text-rose-800">Rs. {p.salePrice?.toLocaleString()}</span>
                                  <span className="block text-[9px] text-neutral-400 line-through">Rs. {p.price.toLocaleString()}</span>
                                </>
                              ) : (
                                <span className="block text-emerald-950">Rs. {p.price.toLocaleString()}</span>
                              )}
                            </td>
                            <td className="p-4 uppercase tracking-wider text-[10px] font-bold text-neutral-500">
                              {p.category.replace('-', ' ')}
                            </td>
                            <td className="p-4">
                              <button
                                onClick={() => handleToggleProductFeatured(p)}
                                className={`px-2 py-1 rounded text-[9px] font-extrabold cursor-pointer tracking-wider uppercase transition-colors ${
                                  p.isFeatured ? 'bg-gold-100 text-[#ab8215] border border-gold-300' : 'bg-neutral-100 text-neutral-400'
                                }`}
                              >
                                {p.isFeatured ? '★ Featured' : '☆ Standard'}
                              </button>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                p.stockStatus === 'instock' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                              }`}>
                                {p.stockStatus === 'instock' ? 'In Stock' : 'Sold Out'}
                              </span>
                            </td>
                            <td className="p-4 text-right space-x-2 whitespace-nowrap">
                              <button
                                onClick={() => handleOpenProductEdit(p)}
                                className="text-emerald-950 hover:text-emerald-800 font-bold cursor-pointer transition-colors p-1"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                className="text-rose-700 hover:text-rose-950 font-extrabold cursor-pointer transition-colors p-1"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* PRODUCT DIALOG modal (Add / Edit) */}
              {isProductModalOpen && (
                <div className="fixed inset-0 bg-[#000]/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
                  <div className="bg-[#fff] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl border border-cream-100 animate-in zoom-in-95 duration-200">
                    <div className="px-6 py-4 bg-emerald-950 text-[#fff] flex items-center justify-between border-b border-cream-200">
                      <h3 className="font-serif font-bold text-lg tracking-wide">
                        {editingProduct ? `Edit Outfit: ${editingProduct.title}` : 'Introduce Premium New Outfit'}
                      </h3>
                      <button 
                        onClick={() => setIsProductModalOpen(false)}
                        className="text-neutral-300 hover:text-[#fff] bg-emerald-900/60 p-2 rounded-full cursor-pointer transition-colors"
                      >
                        ✕
                      </button>
                    </div>

                    <form onSubmit={handleSaveProduct} className="p-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* 1. Title */}
                        <div>
                          <label className="block text-xs font-bold text-neutral-700 uppercase tracking-widest mb-1">Product Title *</label>
                          <input
                            type="text"
                            required
                            value={prodTitle}
                            onChange={(e) => setProdTitle(e.target.value)}
                            placeholder="e.g. Isfahan Silk Tassel"
                            className="w-full bg-cream-50 border border-cream-200 rounded-lg p-2.5 text-xs text-neutral-800 focus:outline-none focus:ring-1 focus:ring-gold-500"
                          />
                        </div>

                        {/* 2. Fabric detail */}
                        <div>
                          <label className="block text-xs font-bold text-neutral-700 uppercase tracking-widest mb-1">Fabric Info *</label>
                          <input
                            type="text"
                            required
                            value={prodFabric}
                            onChange={(e) => setProdFabric(e.target.value)}
                            placeholder="e.g. Pure Tissue Silk / Luxury Lawn"
                            className="w-full bg-cream-50 border border-cream-200 rounded-lg p-2.5 text-xs text-neutral-800 focus:outline-none focus:ring-1 focus:ring-gold-500"
                          />
                        </div>

                        {/* 3. Category Dropdown */}
                        <div>
                          <label className="block text-xs font-bold text-neutral-700 uppercase tracking-widest mb-1">Collection / Category *</label>
                          <select
                            value={prodCategory}
                            onChange={(e) => setProdCategory(e.target.value)}
                            className="w-full bg-cream-50 border border-cream-200 rounded-lg p-2.5 text-xs text-neutral-800 focus:outline-none focus:ring-1 focus:ring-gold-500 cursor-pointer"
                          >
                            {categories.map(c => (
                              <option key={c.id} value={c.slug}>{c.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* 4. Stock status */}
                        <div>
                          <label className="block text-xs font-bold text-neutral-700 uppercase tracking-widest mb-1">Stock Status *</label>
                          <select
                            value={prodStock}
                            onChange={(e) => setProdStock(e.target.value as 'instock' | 'outofstock')}
                            className="w-full bg-cream-50 border border-cream-200 rounded-lg p-2.5 text-xs text-neutral-800 focus:outline-none focus:ring-1 focus:ring-gold-500 cursor-pointer"
                          >
                            <option value="instock">In Stock</option>
                            <option value="outofstock">Sold Out (Out of Stock)</option>
                          </select>
                        </div>

                        {/* 5. Pricing (PKR) */}
                        <div>
                          <label className="block text-xs font-bold text-neutral-700 uppercase tracking-widest mb-1">Price (PKR) *</label>
                          <input
                            type="number"
                            required
                            value={prodPrice}
                            onChange={(e) => setProdPrice(Number(e.target.value))}
                            placeholder="e.g. 14500"
                            className="w-full bg-cream-50 border border-cream-200 rounded-lg p-2.5 text-xs text-neutral-800 focus:outline-none focus:ring-1 focus:ring-gold-500"
                          />
                        </div>

                        {/* 6. Sale price */}
                        <div>
                          <label className="block text-xs font-bold text-neutral-700 uppercase tracking-widest mb-1">Sale Discount Price (PKR, Optional)</label>
                          <input
                            type="number"
                            value={prodSalePrice}
                            onChange={(e) => setProdSalePrice(e.target.value)}
                            placeholder="e.g. 11000"
                            className="w-full bg-cream-50 border border-cream-200 rounded-lg p-2.5 text-xs text-neutral-800 focus:outline-none focus:ring-1 focus:ring-gold-500"
                          />
                        </div>

                        {/* 7. Auto Generated SKU */}
                        <div>
                          <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-1">SKU (Auto-Generated)</label>
                          <input
                            type="text"
                            disabled
                            value={prodSku}
                            className="w-full bg-neutral-100 border border-neutral-200 rounded-lg p-2.5 text-xs text-neutral-500 font-mono focus:outline-none cursor-not-allowed"
                          />
                        </div>

                        {/* 8. Auto Generated Display ID */}
                        <div>
                          <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Product Display ID (Auto-Generated)</label>
                          <input
                            type="text"
                            disabled
                            value={prodId}
                            className="w-full bg-neutral-100 border border-neutral-200 rounded-lg p-2.5 text-xs text-neutral-500 font-mono focus:outline-none cursor-not-allowed"
                          />
                        </div>

                        {/* 9. Interactive Sizes List (S, M, L, XL, Custom) */}
                        <div className="col-span-1 md:col-span-2">
                          <label className="block text-xs font-bold text-neutral-700 uppercase tracking-widest mb-2">Product Size Variations</label>
                          <div className="flex flex-wrap gap-2">
                            {['S', 'M', 'L', 'XL', 'Custom'].map((sz) => {
                              const isChecked = prodSizes.includes(sz);
                              return (
                                <label key={sz} className={`flex items-center gap-1.5 px-4 py-2 border rounded-lg text-xs font-semibold cursor-pointer transition-all select-none ${
                                  isChecked ? 'bg-emerald-950 border-emerald-950 text-cream-50 shadow-sm' : 'bg-[#fff] border-cream-200 text-neutral-700 hover:bg-cream-50'
                                }`}>
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {
                                      if (isChecked) {
                                        setProdSizes(prodSizes.filter(s => s !== sz));
                                      } else {
                                        setProdSizes([...prodSizes, sz]);
                                      }
                                    }}
                                    className="hidden"
                                  />
                                  <span>{sz}</span>
                                </label>
                              );
                            })}
                          </div>
                          {prodSizes.length === 0 && (
                            <p className="text-[10px] text-emerald-800 font-semibold mt-1">⚠ Select at least one size variation!</p>
                          )}
                        </div>

                        {/* 10. Dynamic Custom Color Registry */}
                        <div className="col-span-1 md:col-span-2">
                          <label className="block text-xs font-bold text-neutral-700 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                            <Palette className="w-3.5 h-3.5 text-gold-600" />
                            <span>Product Color Variations</span>
                          </label>
                          
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newColorInput}
                              onChange={(e) => setNewColorInput(e.target.value)}
                              placeholder="Type custom color (e.g. Classic Crimson, Emerald Breeze, Lilac Dew)"
                              className="bg-cream-50 border border-cream-200 rounded-lg p-2.5 text-xs text-neutral-800 flex-1 focus:outline-none"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  if (newColorInput.trim() && !prodColors.includes(newColorInput.trim())) {
                                    setProdColors([...prodColors, newColorInput.trim()]);
                                    setNewColorInput('');
                                  }
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (newColorInput.trim() && !prodColors.includes(newColorInput.trim())) {
                                  setProdColors([...prodColors, newColorInput.trim()]);
                                  setNewColorInput('');
                                }
                              }}
                              className="px-4 py-2 bg-emerald-950 text-cream-50 rounded-lg hover:bg-emerald-900 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer pointer-events-auto"
                            >
                              Add Color
                            </button>
                          </div>

                          {prodColors.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5 mt-2.5">
                              {prodColors.map((color) => (
                                <span key={color} className="inline-flex items-center gap-1 px-3 py-1 bg-cream-100 text-neutral-800 rounded-full text-xs font-medium border border-cream-200 shadow-sm animate-in fade-in duration-200">
                                  <span>{color}</span>
                                  <button
                                    type="button"
                                    onClick={() => setProdColors(prodColors.filter(c => c !== color))}
                                    className="text-neutral-400 hover:text-emerald-900 transition-all cursor-pointer font-bold ml-1 w-4 h-4 rounded-full flex items-center justify-center hover:bg-cream-200"
                                  >
                                    ✕
                                  </button>
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[10px] text-neutral-400 mt-1.5">No custom colors specified. Customers will see classic boutique swatches.</p>
                          )}
                        </div>

                        {/* 11. Multi-Media upload block (1 primary + 2 secondary + video) */}
                        <div className="col-span-1 md:col-span-2 space-y-3">
                          <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-widest border-b border-cream-100 pb-1 flex items-center gap-1.5 font-serif">
                            <Image className="w-4 h-4 text-emerald-950" />
                            <span>Product Media & Video Showcase</span>
                          </h4>

                          <div className="bg-[#faf9f5] border border-cream-100 rounded-xl p-4 space-y-4">
                            
                            {/* YouTube Video URL */}
                            <div>
                              <label className="block text-[10px] font-bold text-[#ab8215] uppercase tracking-widest mb-1 flex items-center gap-1">
                                <Video className="w-3.5 h-3.5" />
                                <span>YouTube Video Link</span>
                              </label>
                              <input
                                type="url"
                                value={prodVideoUrl}
                                onChange={(e) => setProdVideoUrl(e.target.value)}
                                placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                                className="w-full bg-[#fff] border border-cream-200 rounded-lg p-2.5 text-xs text-neutral-800 focus:outline-none"
                              />
                            </div>

                            {/* Main image */}
                            <div>
                              <label className="block text-[10px] font-bold text-neutral-600 uppercase tracking-widest mb-1">Primary Product Picture * (Main Gallery Image)</label>
                              <div className="flex gap-2">
                                <input
                                  type="url"
                                  required
                                  value={prodImages[0] || ''}
                                  onChange={(e) => {
                                    const updated = [...prodImages];
                                    updated[0] = e.target.value;
                                    setProdImages(updated);
                                  }}
                                  placeholder="Primary image asset URL"
                                  className="w-full bg-[#fff] border border-cream-200 rounded-lg p-2.5 text-xs text-neutral-800 focus:outline-none"
                                />
                                <label className="flex items-center justify-center px-4 bg-emerald-950 hover:bg-emerald-900 border border-emerald-905 text-cream-50 text-[10px] font-bold tracking-wider uppercase rounded-lg cursor-pointer whitespace-nowrap transition-colors select-none">
                                  <span>{isUploading === 'prod_primary' ? 'Uploading...' : 'Upload File'}</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        setIsUploading('prod_primary');
                                        try {
                                          const url = await uploadImage('product_images', file);
                                          const updated = [...prodImages];
                                          updated[0] = url;
                                          setProdImages(updated);
                                          showToast('Primary picture uploaded successfully!', 'info');
                                        } catch (err: any) {
                                          showToast(`Primary pic upload failed: ${err.message || err}`, 'error');
                                        } finally {
                                          setIsUploading(null);
                                        }
                                      }
                                    }}
                                    className="hidden"
                                  />
                                </label>
                              </div>
                            </div>

                            {/* Additional image 1 */}
                            <div>
                              <label className="block text-[10px] font-bold text-neutral-600 uppercase tracking-widest mb-1">Additional Product Picture 1 (Details / Styling)</label>
                              <div className="flex gap-2">
                                <input
                                  type="url"
                                  value={prodImages[1] || ''}
                                  onChange={(e) => {
                                    const updated = [...prodImages];
                                    updated[1] = e.target.value;
                                    setProdImages(updated);
                                  }}
                                  placeholder="Supplementary detail image URL"
                                  className="w-full bg-[#fff] border border-cream-200 rounded-lg p-2.5 text-xs text-neutral-800 focus:outline-none"
                                />
                                <label className="flex items-center justify-center px-4 bg-emerald-950 hover:bg-emerald-900 border border-emerald-905 text-cream-50 text-[10px] font-bold tracking-wider uppercase rounded-lg cursor-pointer whitespace-nowrap transition-colors select-none">
                                  <span>{isUploading === 'prod_sec_one' ? 'Uploading...' : 'Upload File'}</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        setIsUploading('prod_sec_one');
                                        try {
                                          const url = await uploadImage('product_images', file);
                                          const updated = [...prodImages];
                                          updated[1] = url;
                                          setProdImages(updated);
                                          showToast('Supplementary image 1 uploaded!', 'info');
                                        } catch (err: any) {
                                          showToast(`Upload 1 failed: ${err.message || err}`, 'error');
                                        } finally {
                                          setIsUploading(null);
                                        }
                                      }
                                    }}
                                    className="hidden"
                                  />
                                </label>
                              </div>
                            </div>

                            {/* Additional image 2 */}
                            <div>
                              <label className="block text-[10px] font-bold text-neutral-600 uppercase tracking-widest mb-1">Additional Product Picture 2 (Outfit / Material close-up)</label>
                              <div className="flex gap-2">
                                <input
                                  type="url"
                                  value={prodImages[2] || ''}
                                  onChange={(e) => {
                                    const updated = [...prodImages];
                                    updated[2] = e.target.value;
                                    setProdImages(updated);
                                  }}
                                  placeholder="Secondary detail view image URL"
                                  className="w-full bg-[#fff] border border-cream-200 rounded-lg p-2.5 text-xs text-neutral-800 focus:outline-none"
                                />
                                <label className="flex items-center justify-center px-4 bg-emerald-950 hover:bg-emerald-900 border border-emerald-905 text-cream-50 text-[10px] font-bold tracking-wider uppercase rounded-lg cursor-pointer whitespace-nowrap transition-colors select-none">
                                  <span>{isUploading === 'prod_sec_two' ? 'Uploading...' : 'Upload File'}</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        setIsUploading('prod_sec_two');
                                        try {
                                          const url = await uploadImage('product_images', file);
                                          const updated = [...prodImages];
                                          updated[2] = url;
                                          setProdImages(updated);
                                          showToast('Supplementary image 2 uploaded!', 'info');
                                        } catch (err: any) {
                                          showToast(`Upload 2 failed: ${err.message || err}`, 'error');
                                        } finally {
                                          setIsUploading(null);
                                        }
                                      }
                                    }}
                                    className="hidden"
                                  />
                                </label>
                              </div>
                            </div>

                          </div>
                        </div>

                      </div>

                      {/* Description System Text Area */}
                      <div className="border border-cream-202 bg-[#fff] rounded-xl p-4 space-y-3">
                        <label className="block text-xs font-bold text-emerald-950 uppercase tracking-widest font-serif">
                          <span>Product Description</span>
                        </label>
                        
                        <textarea
                          rows={5}
                          required
                          value={prodDesc}
                          onChange={(e) => setProdDesc(e.target.value)}
                          placeholder="A detailed Eastern ensemble decorated meticulously in pure threadwork..."
                          className="w-full bg-[#fff] border border-cream-200 rounded-lg p-3 text-xs text-neutral-800 focus:outline-none focus:ring-1 focus:ring-gold-500 font-sans leading-relaxed"
                        ></textarea>
                      </div>

                      {/* Featured Promote Toggle */}
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="chk-prod-featured"
                          checked={prodFeatured}
                          onChange={(e) => setProdFeatured(e.target.checked)}
                          className="w-4 h-4 rounded text-emerald-900 border-cream-300 focus:ring-emerald-800 cursor-pointer pointer-events-auto"
                        />
                        <label htmlFor="chk-prod-featured" className="text-xs font-bold text-neutral-700 uppercase tracking-widest select-none cursor-pointer">
                          Promote This Outfit in Homepage Featured Showcase Tabs
                        </label>
                      </div>

                      {/* Modal footer submit */}
                      <div className="flex justify-end gap-3 pt-4 border-t border-cream-100">
                        <button
                          type="button"
                          onClick={() => setIsProductModalOpen(false)}
                          className="px-4 py-2 bg-cream-100 hover:bg-cream-200 text-neutral-700 rounded-lg text-xs font-bold tracking-wider uppercase transition-colors pointer-events-auto cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          id="btn-save-outfit"
                          className="px-5 py-2 bg-emerald-950 hover:bg-emerald-900 text-cream-50 rounded-lg text-xs font-bold tracking-wider uppercase transition-colors pointer-events-auto cursor-pointer shadow flex items-center gap-1.5"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Save Outfit</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CATEGORIES MANAGER */}
          {activeTab === 'categories' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex justify-between items-center bg-[#fff] border border-cream-100 p-4 rounded-xl shadow-sm">
                <div>
                  <h2 className="text-md font-serif font-bold text-emerald-950 uppercase tracking-wider">Category Management</h2>
                  <p className="text-xs text-neutral-400">Add or edit collections shown in navbar dropdowns</p>
                </div>
                <button
                  onClick={handleOpenCategoryAdd}
                  id="btn-add-category-modal"
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-900 hover:bg-emerald-950 text-cream-50 rounded-lg text-xs font-bold tracking-wider uppercase transition-colors pointer-events-auto cursor-pointer shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Category</span>
                </button>
              </div>

              {/* Categories block grid */}
              <div className="bg-[#fff] border border-cream-100 rounded-xl shadow-sm overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-cream-50 text-neutral-500 uppercase tracking-widest text-[9px] font-bold">
                      <th className="p-4">Visual cover</th>
                      <th className="p-4">Collection Name</th>
                      <th className="p-4">Slug Index</th>
                      <th className="p-4">Description Text</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream-100">
                    {categories.map((c) => (
                      <tr key={c.id} className="hover:bg-cream-50/20">
                        <td className="p-4 max-w-[60px]">
                          <img src={c.image} alt={c.name} referrerPolicy="no-referrer" className="w-10 h-10 object-cover rounded border" />
                        </td>
                        <td className="p-4 font-bold text-emerald-950 font-serif text-sm">{c.name}</td>
                        <td className="p-4 font-mono text-neutral-500">{c.slug}</td>
                        <td className="p-4 text-neutral-600 max-w-xs truncate">{c.description}</td>
                        <td className="p-4 text-right space-x-2 whitespace-nowrap">
                          <button
                            onClick={() => handleOpenCategoryEdit(c)}
                            className="text-emerald-900 hover:text-emerald-700 font-bold cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(c.id)}
                            className="text-rose-700 hover:text-rose-950 font-semibold cursor-pointer"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Category form modal */}
              {isCategoryModalOpen && (
                <div className="fixed inset-0 bg-[#000]/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                  <div className="bg-[#fff] rounded-xl w-full max-w-md shadow-2xl border border-cream-100 overflow-hidden animate-in zoom-in-95 duration-200">
                    <div className="px-5 py-4 bg-emerald-950 text-[#fff] flex items-center justify-between">
                      <h3 className="font-serif font-bold text-sm uppercase tracking-wider">{editingCategory ? 'Edit Collection Category' : 'Create Collection Category'}</h3>
                      <button onClick={() => setIsCategoryModalOpen(false)} className="text-[#fff] cursor-pointer">✕</button>
                    </div>

                    <form onSubmit={handleSaveCategory} className="p-5 space-y-4">
                      <div>
                        <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-widest mb-1">Category Title</label>
                        <input
                          type="text"
                          required
                          value={catName}
                          onChange={(e) => {
                            setCatName(e.target.value);
                            setCatSlug(e.target.value.toLowerCase().replace(/ /g, '-'));
                          }}
                          className="w-full bg-cream-50 border border-cream-200 rounded p-2.5 text-xs text-neutral-800"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-widest mb-1">Slug Identifier</label>
                        <input
                          type="text"
                          required
                          value={catSlug}
                          onChange={(e) => setCatSlug(e.target.value)}
                          className="w-full bg-cream-50 border border-cream-200 rounded p-2.5 text-xs text-neutral-800"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-widest mb-1">Visual cover URL</label>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            required
                            value={catImage}
                            onChange={(e) => setCatImage(e.target.value)}
                            className="w-full bg-cream-50 border border-cream-200 rounded p-2.5 text-xs text-neutral-800"
                          />
                          {/* File image uploader for Category Image */}
                          <label className="flex items-center justify-center px-3 bg-emerald-950 hover:bg-emerald-900 border border-emerald-900 text-cream-50 text-[10px] font-bold tracking-wider uppercase rounded cursor-pointer whitespace-nowrap">
                            <span>{isUploading === 'cat_img' ? 'Uploading...' : 'Upload Link'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setIsUploading('cat_img');
                                  try {
                                    const url = await uploadImage('category_images', file);
                                    setCatImage(url);
                                  } catch (err: any) {
                                    alert(`Upload failed: ${err.message || err}`);
                                  } finally {
                                    setIsUploading(null);
                                  }
                                }
                              }}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-widest mb-1">Brief Description</label>
                        <textarea
                          rows={3}
                          value={catDesc}
                          onChange={(e) => setCatDesc(e.target.value)}
                          className="w-full bg-cream-50 border border-cream-200 rounded p-2.5 text-xs text-neutral-800"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="px-4 py-2 bg-cream-100 text-neutral-700 rounded text-xs">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-emerald-900 hover:bg-emerald-950 text-cream-50 rounded text-xs select-none">Save Category</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: BANNERS EXECUTIVE */}
          {activeTab === 'banners' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex justify-between items-center bg-[#fff] border border-cream-100 p-4 rounded-xl shadow-sm">
                <div>
                  <h2 className="text-md font-serif font-bold text-emerald-950 uppercase tracking-wider">Promotional slide layouts</h2>
                  <p className="text-xs text-neutral-400">Control hero sliders on home display nodes</p>
                </div>
                <button
                  onClick={handleOpenBannerAdd}
                  id="btn-add-banner-modal"
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-900 hover:bg-emerald-950 text-cream-50 rounded-lg text-xs font-bold tracking-wider uppercase transition-colors pointer-events-auto cursor-pointer shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Banner</span>
                </button>
              </div>

              {/* Banners grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {banners.map((b) => (
                  <div key={b.id} className="bg-[#fff] border border-cream-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                    <div className="aspect-video bg-cream-50 relative">
                      <img src={b.image} alt={b.title} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-emerald-950/20" />
                      <div className="absolute inset-x-4 bottom-4 text-[#fff]">
                        <h4 className="font-serif font-bold text-md leading-tight">{b.title}</h4>
                        <p className="text-[10px] text-neutral-200 mt-1">{b.subtitle}</p>
                      </div>
                    </div>
                    <div className="p-4 flex items-center justify-between text-xs bg-[#fff]">
                      <div className="flex flex-col gap-1">
                        <span className="font-mono text-[9px] text-neutral-400">Link: {b.link}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase w-fit ${b.isActive ? 'bg-emerald-50 text-emerald-800' : 'bg-neutral-100 text-neutral-400'}`}>
                          {b.isActive ? 'Active live' : 'Deactivated'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleOpenBannerEdit(b)} className="text-emerald-950 hover:underline font-bold">Edit</button>
                        <button onClick={() => handleDeleteBanner(b.id)} className="text-rose-700 hover:underline">Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Banner form modal */}
              {isBannerModalOpen && (
                <div className="fixed inset-0 bg-[#000]/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                  <div className="bg-[#fff] rounded-xl w-full max-w-md shadow-2xl border border-cream-100 overflow-hidden animate-in zoom-in-95 duration-200">
                    <div className="px-5 py-4 bg-emerald-950 text-[#fff] flex items-center justify-between">
                      <h3 className="font-serif font-bold text-sm uppercase tracking-wider">{editingBanner ? 'Edit Slider Banner' : 'Introduce New Promo Banner'}</h3>
                      <button onClick={() => setIsBannerModalOpen(false)} className="text-[#fff] cursor-pointer">✕</button>
                    </div>

                    <form onSubmit={handleSaveBanner} className="p-5 space-y-4 text-xs">
                      <div>
                        <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-widest mb-1">Banner Large Image URL</label>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            required
                            value={bannerImage}
                            onChange={(e) => setBannerImage(e.target.value)}
                            className="w-full bg-cream-50 border border-cream-200 rounded p-2.5 text-xs text-neutral-800 font-sans"
                          />
                          {/* File image uploader for Banner Image */}
                          <label className="flex items-center justify-center px-3 bg-emerald-950 hover:bg-emerald-900 border border-emerald-900 text-cream-50 text-[10px] font-bold tracking-wider uppercase rounded cursor-pointer whitespace-nowrap">
                            <span>{isUploading === 'banner_img' ? 'Uploading...' : 'Upload Link'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setIsUploading('banner_img');
                                  try {
                                    const url = await uploadImage('banner_images', file);
                                    setBannerImage(url);
                                  } catch (err: any) {
                                    alert(`Upload failed: ${err.message || err}`);
                                  } finally {
                                    setIsUploading(null);
                                  }
                                }
                              }}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-widest mb-1">Bold Display Title</label>
                        <input
                          type="text"
                          required
                          value={bannerTitle}
                          onChange={(e) => setBannerTitle(e.target.value)}
                          className="w-full bg-cream-50 border border-cream-200 rounded p-2.5 text-xs text-neutral-800"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-widest mb-1">Supporting Subheading</label>
                        <input
                          type="text"
                          value={bannerSubtitle}
                          onChange={(e) => setBannerSubtitle(e.target.value)}
                          className="w-full bg-cream-50 border border-cream-200 rounded p-2.5 text-xs text-neutral-800"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-widest mb-1">Button link path</label>
                        <input
                          type="text"
                          required
                          value={bannerLink}
                          onChange={(e) => setBannerLink(e.target.value)}
                          placeholder="/category/party-wear"
                          className="w-full bg-cream-50 border border-cream-200 rounded p-2.5 text-xs text-neutral-800 font-mono"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="chk-banner-active"
                          checked={bannerActive}
                          onChange={(e) => setBannerActive(e.target.checked)}
                          className="rounded text-emerald-900"
                        />
                        <label htmlFor="chk-banner-active" className="text-xs font-bold text-neutral-700 uppercase select-none cursor-pointer">
                          Activate banner in home slider carousel on save
                        </label>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setIsBannerModalOpen(false)} className="px-4 py-2 bg-cream-100 text-neutral-700 rounded text-xs">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-emerald-900 text-cream-50 rounded text-xs select-none">Save Banner</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: INQUIRIES REGISTER (ORDER MANAGEMENT) */}
          {activeTab === 'inquiries' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-[#fff] border border-cream-100 p-6 rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-lg font-serif font-bold text-emerald-950 uppercase tracking-wide">Bespoke Order Management System</h2>
                  <p className="text-xs text-neutral-400 mt-1">Track pending orders, update delivery status pipelines, and coordinate WhatsApp followups. Total orders: {inquiries.length}</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold border border-emerald-100 px-3 py-1.5 uppercase tracking-wide">
                    24/7 Active Logs
                  </span>
                </div>
              </div>

              <div className="bg-[#fff] border border-cream-100 rounded-xl shadow-sm overflow-hidden text-xs">
                {inquiries.length === 0 ? (
                  <div className="p-12 text-center text-sm text-neutral-400 font-medium">
                    No orders or checkout inquiries compiled in this sandbox instance yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-cream-50 text-neutral-500 uppercase tracking-widest text-[9px] font-bold border-b border-cream-100">
                          <th className="p-4">Order ID & Date</th>
                          <th className="p-4">Customer Name</th>
                          <th className="p-4">WhatsApp Contact</th>
                          <th className="p-4">Ordered Product</th>
                          <th className="p-4">Fabric SKU & Price</th>
                          <th className="p-4">Product URL Link</th>
                          <th className="p-4">Order Status</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-cream-100">
                        {inquiries.map((inq) => {
                          const status = inq.status || 'New Order';
                          
                          // Badge styling mapping
                          let badgeClass = 'bg-blue-50 text-blue-700 border-blue-200';
                          if (status === 'Contacted') badgeClass = 'bg-amber-50 text-amber-700 border-amber-200';
                          if (status === 'Confirmed') badgeClass = 'bg-purple-50 text-purple-700 border-purple-200';
                          if (status === 'Processing') badgeClass = 'bg-indigo-50 text-indigo-700 border-indigo-200';
                          if (status === 'Delivered') badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                          if (status === 'Cancelled') badgeClass = 'bg-rose-50 text-rose-700 border-rose-200';

                          const displayLink = inq.productLink || `https://outfitsbymushq.netlify.app/product/${inq.sku}`;

                          return (
                            <tr key={inq.id} className="hover:bg-cream-50/15 transition-colors">
                              <td className="p-4 font-mono text-[10px] text-neutral-400">
                                <span className="block font-bold text-neutral-700">#{inq.id.replace('inq_', '')}</span>
                                <span className="block mt-1 font-sans">{inq.date}</span>
                              </td>
                              <td className="p-4 font-bold text-emerald-950 font-serif text-sm">
                                {inq.customerName}
                              </td>
                              <td className="p-4 font-mono select-all font-semibold text-neutral-700">
                                <a 
                                  href={`https://wa.me/${inq.customerPhone?.replace(/[^0-9]/g, '') || '923020038010'}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-emerald-800 hover:underline flex items-center gap-1"
                                >
                                  <span>{inq.customerPhone || 'N/A'}</span>
                                  <span className="text-[9px] bg-emerald-50 text-emerald-800 px-1 font-sans font-normal border border-emerald-100 rounded">Chat</span>
                                </a>
                              </td>
                              <td className="p-4 font-semibold text-neutral-800">
                                {inq.productTitle}
                              </td>
                              <td className="p-4">
                                <span className="block font-mono text-emerald-950 font-bold">{inq.price}</span>
                                <span className="block text-[10px] text-neutral-400">SKU: {inq.sku}</span>
                              </td>
                              <td className="p-4">
                                <a 
                                  href={displayLink} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-gold-700 hover:text-gold-950 font-bold underline underline-offset-2 flex items-center gap-1 tracking-wider uppercase text-[10px]"
                                >
                                  <span>View Item</span>
                                  <span>↗</span>
                                </a>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-1.5">
                                  <select
                                    value={status}
                                    onChange={(e) => handleUpdateInquiryStatus(inq.id, e.target.value as any)}
                                    className={`px-2 py-1.5 rounded-none font-bold text-[11px] border cursor-pointer focus:outline-none transition-all ${badgeClass}`}
                                  >
                                    <option value="New Order">New Order</option>
                                    <option value="Contacted">Contacted</option>
                                    <option value="Confirmed">Confirmed</option>
                                    <option value="Processing">Processing</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Cancelled">Cancelled</option>
                                  </select>
                                </div>
                              </td>
                              <td className="p-4 text-right">
                                <button
                                  onClick={() => handleDeleteInquiryLog(inq.id)}
                                  className="text-rose-700 hover:text-rose-950 font-bold cursor-pointer hover:underline"
                                  title="Remove log entry"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* TAB 6: WEBSITE SETTINGS & SEO */}
          {activeTab === 'seo' && (
            <div className="bg-[#fff] border border-cream-100 rounded-xl p-6 shadow-sm space-y-6 animate-in fade-in duration-300">
              <div>
                <h2 className="text-md font-serif font-bold text-emerald-950 uppercase tracking-wider">Website General Configurations & SEO</h2>
                <p className="text-xs text-neutral-400">Configure global shop identity coordinates, social media links, search engine optimization targets, and assets.</p>
              </div>

              <form onSubmit={handleSaveSEOConfig} className="space-y-6 text-xs">
                {/* Section A: General Settings */}
                <div className="border-b border-cream-100 pb-5 space-y-4">
                  <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-widest">General Corporate Identity</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-widest mb-1">Store / Business Name *</label>
                      <input
                        type="text"
                        required
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        className="w-full bg-cream-50 border border-cream-200 rounded p-2.5 text-xs text-neutral-800 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-widest mb-1">WhatsApp Order Helpline *</label>
                      <input
                        type="text"
                        required
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        className="w-full bg-cream-50 border border-cream-200 rounded p-2.5 text-xs text-neutral-800 font-mono"
                      />
                      <span className="text-[10px] text-neutral-400 mt-1 block">Specify prefix (e.g., +923020038010)</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-widest mb-1">Facebook Brand Link</label>
                      <input
                        type="url"
                        value={facebookLink}
                        onChange={(e) => setFacebookLink(e.target.value)}
                        className="w-full bg-cream-50 border border-cream-200 rounded p-2.5 text-xs text-neutral-800 font-sans"
                        placeholder="https://facebook.com/..."
                      />
                    </div>
                  </div>
                </div>

                {/* Section B: Search Optimization */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-widest">Search Engine Optimization (SEO) & Shares</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-widest mb-1">Global Meta Title Option</label>
                      <input
                        type="text"
                        value={seo.metaTitle}
                        onChange={(e) => setSeo({ ...seo, metaTitle: e.target.value })}
                        className="w-full bg-cream-50 border border-cream-200 rounded p-2.5 text-xs text-neutral-800"
                        placeholder="Outfits by Mushq - Luxury Lawn, Chiffon & Silk Collections"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-widest mb-1">Open Graph Title (Facebook share)</label>
                      <input
                        type="text"
                        value={seo.ogTitle}
                        onChange={(e) => setSeo({ ...seo, ogTitle: e.target.value })}
                        className="w-full bg-cream-50 border border-cream-200 rounded p-2.5 text-xs text-neutral-800"
                        placeholder="Explore the Mushq Luxury Lawn Collection Online"
                      />
                    </div>

                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-widest mb-1">SEO Description Snippet *</label>
                      <textarea
                        rows={3}
                        value={seo.metaDescription}
                        onChange={(e) => setSeo({ ...seo, metaDescription: e.target.value })}
                        className="w-full bg-cream-50 border border-cream-200 rounded p-2.5 text-xs text-neutral-800"
                        placeholder="Discover premium designs and luxury lawn crafted beyond perfection at Mushq Outfits Karachi. Fast nationwide delivery options."
                      />
                    </div>

                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-widest mb-1">Open Graph / Social Share Card Cover Image URL</label>
                      <input
                        type="url"
                        value={seo.ogImage}
                        onChange={(e) => setSeo({ ...seo, ogImage: e.target.value })}
                        className="w-full bg-cream-50 border border-cream-200 rounded p-2.5 text-xs text-neutral-800 font-sans"
                        placeholder="https://images.unsplash.com/... or upload below"
                      />

                      {/* File image uploader for SEO Card */}
                      <div className="mt-2 p-3 bg-cream-50/50 border border-dashed border-cream-200 rounded flex flex-col md:flex-row items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-bold text-neutral-700 uppercase block">Upload Social Card Cover to Supabase Storage</span>
                          <span className="text-[9px] text-neutral-400">Replaces current social share image preview live</span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setIsUploading('seo');
                              try {
                                const url = await uploadImage('website_assets', file);
                                setSeo((prev) => ({ ...prev, ogImage: url }));
                                alert('SEO card image successfully uploaded to Supabase Storage!');
                              } catch (err: any) {
                                alert(`Upload failed: ${err.message || err}`);
                              } finally {
                                setIsUploading(null);
                              }
                            }
                          }}
                          className="text-[10px] text-neutral-600 font-semibold max-w-xs"
                        />
                        {isUploading === 'seo' && <span className="text-[10px] text-[#ab8215] font-bold animate-pulse">Uploading asset...</span>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-widest mb-1">Root XML Sitemap Path</label>
                      <input
                        type="text"
                        value={seo.sitemap}
                        onChange={(e) => setSeo({ ...seo, sitemap: e.target.value })}
                        className="w-full bg-cream-50 border border-cream-200 rounded p-2.5 text-xs text-neutral-800 font-mono"
                        placeholder="/sitemap.xml"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-cream-100">
                  <button
                    type="submit"
                    id="btn-save-seo"
                    className="px-6 py-3 bg-[#ab8215] hover:bg-[#937318] text-[#fff] font-bold rounded-lg text-xs tracking-wider uppercase transition-colors pointer-events-auto cursor-pointer"
                  >
                    Commit Settings & SEO Tags to Supabase
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB: WEBSITE CUSTOMIZATION */}
          {activeTab === 'website_customization' && (
            <div className="bg-[#fff] border border-cream-100 rounded-xl p-6 shadow-sm space-y-8 animate-in fade-in duration-300">
              <div>
                <h2 className="text-md font-serif font-bold text-emerald-950 uppercase tracking-wider">Website View Customization Studio</h2>
                <p className="text-xs text-neutral-400">Add or edit header links, update the announcement bar ticker, and style homepage promotional collections.</p>
              </div>

              {/* 1. Header Navigation Menu Links Builder */}
              <div className="border border-cream-150 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-widest flex items-center gap-2">
                    <Palette className="w-4 h-4 text-gold-600" />
                    <span>Navigation Menu Management</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      const newId = 'menu_' + Math.random().toString(36).substring(2, 9);
                      const newItem: CustomMenuItem = {
                        id: newId,
                        name: 'New Collection',
                        type: 'category',
                        categorySlug: 'all'
                      };
                      setMenuItems([...menuItems, newItem]);
                    }}
                    className="px-2.5 py-1.5 bg-emerald-950 hover:bg-emerald-900 text-cream-50 text-[10px] font-bold tracking-wider uppercase rounded transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Menu Link</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {menuItems.map((item, index) => (
                    <div key={item.id} className="flex flex-col md:flex-row items-center gap-3 p-3 bg-cream-50/50 border border-cream-100 rounded-lg text-xs">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2 w-full">
                        <div>
                          <label className="block text-[9px] font-bold text-neutral-500 uppercase mb-0.5">Link Text</label>
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => {
                              const updated = [...menuItems];
                              updated[index].name = e.target.value;
                              setMenuItems(updated);
                            }}
                            className="w-full bg-[#fff] border border-cream-200 rounded px-2.5 py-1.5 text-xs text-neutral-800"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-neutral-500 uppercase mb-0.5">Link Target Type</label>
                          <select
                            value={item.type}
                            onChange={(e) => {
                              const updated = [...menuItems];
                              updated[index].type = e.target.value as any;
                              if (updated[index].type !== 'category') {
                                delete updated[index].categorySlug;
                              } else {
                                updated[index].categorySlug = 'all';
                              }
                              setMenuItems(updated);
                            }}
                            className="w-full bg-[#fff] border border-cream-200 rounded px-2.5 py-1.5 text-xs text-neutral-800"
                          >
                            <option value="home">Home Page View</option>
                            <option value="all_collections">All Collections (Shop)</option>
                            <option value="category">Specific Category Collection</option>
                          </select>
                        </div>
                        {item.type === 'category' && (
                          <div>
                            <label className="block text-[9px] font-bold text-neutral-500 uppercase mb-0.5">Target Category</label>
                            <select
                              value={item.categorySlug || 'all'}
                              onChange={(e) => {
                                const updated = [...menuItems];
                                updated[index].categorySlug = e.target.value;
                                setMenuItems(updated);
                              }}
                              className="w-full bg-[#fff] border border-cream-200 rounded px-2.5 py-1.5 text-xs text-neutral-800"
                            >
                              <option value="all">All Category Products</option>
                              {categories.map(cat => (
                                <option key={cat.id} value={cat.slug}>{cat.name}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 self-end md:self-center">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => {
                            if (index === 0) return;
                            const updated = [...menuItems];
                            const temp = updated[index];
                            updated[index] = updated[index - 1];
                            updated[index - 1] = temp;
                            setMenuItems(updated);
                          }}
                          className="p-1 px-2 border border-cream-200 bg-[#fff] hover:bg-cream-50 rounded disabled:opacity-30 text-neutral-600 font-extrabold cursor-pointer text-[10px]"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          disabled={index === menuItems.length - 1}
                          onClick={() => {
                            if (index === menuItems.length - 1) return;
                            const updated = [...menuItems];
                            const temp = updated[index];
                            updated[index] = updated[index + 1];
                            updated[index + 1] = temp;
                            setMenuItems(updated);
                          }}
                          className="p-1 px-2 border border-cream-200 bg-[#fff] hover:bg-cream-50 rounded disabled:opacity-30 text-neutral-600 font-extrabold cursor-pointer text-[10px]"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMenuItems(menuItems.filter((_, i) => i !== index));
                          }}
                          className="p-1 text-[#9c1c1c] hover:bg-red-50 hover:text-red-700 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {menuItems.length === 0 && (
                    <div className="text-center py-6 text-neutral-400">
                      <p>Custom navigation menu has no links. Default header menu (Home | All Collections) will be displayed.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Announcement Bar settings */}
              <div className="border border-cream-150 rounded-xl p-5 space-y-4">
                <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-widest flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-800" />
                  <span>Announcement Ticker settings</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center text-xs">
                  <div className="md:col-span-1">
                    <label className="block text-[10px] font-bold text-neutral-600 uppercase tracking-wider mb-1">Status</label>
                    <button
                      type="button"
                      onClick={() => setAnnouncementEnabled(!announcementEnabled)}
                      className={`px-3 py-1.5 font-bold uppercase tracking-wider text-[10px] rounded transition-all cursor-pointer ${
                        announcementEnabled ? 'bg-emerald-900 text-cream-50' : 'bg-neutral-200 text-neutral-700'
                      }`}
                    >
                      {announcementEnabled ? 'Enabled (Showing)' : 'Disabled (Hidden)'}
                    </button>
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-[10px] font-bold text-[#444] uppercase tracking-wider mb-1">Ticker Announcement Message</label>
                    <input
                      type="text"
                      value={announcementText}
                      onChange={(e) => setAnnouncementText(e.target.value)}
                      className="w-full bg-cream-50 border border-cream-200 rounded p-2.5 text-xs text-neutral-800"
                      placeholder="LUXURY FESTIVE STITCHING & NATIONWIDE FREE SHIPPING ON INQUIRIES"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Aesthetic Color parameters */}
              <div className="border border-cream-150 rounded-xl p-5 space-y-4">
                <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-widest flex items-center gap-2">
                  <Palette className="w-4 h-4 text-gold-600" />
                  <span>Interactive Brand Aesthetics & Text Color Keys</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-cream-50/50 rounded-lg space-y-3">
                    <h4 className="font-bold text-neutral-700 uppercase tracking-wider">Homepage Carousel Banner Text</h4>
                    <div>
                      <label className="block text-[10px] text-neutral-500 uppercase mb-0.5">Heading Color (e.g. #ffffff)</label>
                      <input
                        type="text"
                        value={bannerHeadingColor}
                        onChange={(e) => setBannerHeadingColor(e.target.value)}
                        className="w-full bg-[#fff] border border-cream-200 rounded px-2.5 py-1.5 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-neutral-500 uppercase mb-0.5">Description Color (e.g. #d1d5db)</label>
                      <input
                        type="text"
                        value={bannerDescColor}
                        onChange={(e) => setBannerDescColor(e.target.value)}
                        className="w-full bg-[#fff] border border-cream-200 rounded px-2.5 py-1.5 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-cream-50/50 rounded-lg space-y-3">
                    <h4 className="font-bold text-neutral-700 uppercase tracking-wider">Homepage Grid Divisions Heading Text</h4>
                    <div>
                      <label className="block text-[10px] text-neutral-500 uppercase mb-0.5">Title/Heading Color (e.g. #111827)</label>
                      <input
                        type="text"
                        value={categoriesHeadingColor}
                        onChange={(e) => setCategoriesHeadingColor(e.target.value)}
                        className="w-full bg-[#fff] border border-cream-200 rounded px-2.5 py-1.5 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-neutral-500 uppercase mb-0.5">Subtitle/Description Color (e.g. #6b7280)</label>
                      <input
                        type="text"
                        value={categoriesDescColor}
                        onChange={(e) => setCategoriesDescColor(e.target.value)}
                        className="w-full bg-[#fff] border border-cream-200 rounded px-2.5 py-1.5 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Homepage Featured Promo Stations Settings (Promo 1 & Promo 2) */}
              <div className="border border-cream-150 rounded-xl p-5 space-y-6">
                <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-widest flex items-center gap-2">
                  <Image className="w-4 h-4 text-emerald-800" />
                  <span>Homepage Promotional Collections (Featured Stations Grid)</span>
                </h3>

                {/* Promo Station 1 (Left) */}
                <div className="p-4 border border-cream-200 bg-cream-50/30 rounded-lg space-y-3 text-xs">
                  <h4 className="font-bold text-emerald-900 uppercase tracking-wider">Promotional Card 1 (E.g. Summer Jacquards)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-neutral-500 uppercase mb-0.5">Image URL</label>
                      <input
                        type="url"
                        value={promo1Image}
                        onChange={(e) => setPromo1Image(e.target.value)}
                        className="w-full bg-[#fff] border border-cream-200 rounded px-2.5 py-1.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-neutral-500 uppercase mb-0.5">Card Heading</label>
                      <input
                        type="text"
                        value={promo1Heading}
                        onChange={(e) => setPromo1Heading(e.target.value)}
                        className="w-full bg-[#fff] border border-[#d6cfb3] rounded px-2.5 py-1.5 text-xs"
                      />
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-[10px] text-neutral-500 uppercase mb-0.5">Brief Narrative description</label>
                      <input
                        type="text"
                        value={promo1Description}
                        onChange={(e) => setPromo1Description(e.target.value)}
                        className="w-full bg-[#fff] border border-[#d6cfb3] rounded px-2.5 py-1.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-neutral-500 uppercase mb-0.5">Overlay Button Text (Optional)</label>
                      <input
                        type="text"
                        value={promo1ButtonText}
                        onChange={(e) => setPromo1ButtonText(e.target.value)}
                        className="w-full bg-[#fff] border border-[#d6cfb3] rounded px-3 py-1.5 text-xs"
                        placeholder="E.g. Explore Now"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-neutral-500 uppercase mb-0.5">Text Font Color (hex)</label>
                      <input
                        type="text"
                        value={promo1FontColor}
                        onChange={(e) => setPromo1FontColor(e.target.value)}
                        className="w-full bg-[#fff] border border-[#d6cfb3] rounded px-3 py-1.5 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-neutral-500 uppercase mb-0.5">Text Position Alignment</label>
                      <select
                        value={promo1TextPosition}
                        onChange={(e) => setPromo1TextPosition(e.target.value as any)}
                        className="w-full bg-[#fff] border border-[#d6cfb3] rounded px-3 py-1.5 text-xs"
                      >
                        <option value="left">Left Align</option>
                        <option value="center">Center Align</option>
                        <option value="right">Right Align</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Promo Station 2 (Right) */}
                <div className="p-4 border border-cream-200 bg-cream-50/30 rounded-lg space-y-3 text-xs">
                  <h4 className="font-bold text-emerald-900 uppercase tracking-wider">Promotional Card 2 (E.g. Karandi & Velvets)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-neutral-500 uppercase mb-0.5">Image URL</label>
                      <input
                        type="url"
                        value={promo2Image}
                        onChange={(e) => setPromo2Image(e.target.value)}
                        className="w-full bg-[#fff] border border-cream-200 rounded px-2.5 py-1.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-neutral-500 uppercase mb-0.5">Card Heading</label>
                      <input
                        type="text"
                        value={promo2Heading}
                        onChange={(e) => setPromo2Heading(e.target.value)}
                        className="w-full bg-[#fff] border border-cream-200 rounded px-2.5 py-1.5 text-xs"
                      />
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-[10px] text-neutral-500 uppercase mb-0.5">Brief Narrative description</label>
                      <input
                        type="text"
                        value={promo2Description}
                        onChange={(e) => setPromo2Description(e.target.value)}
                        className="w-full bg-[#fff] border border-cream-200 rounded px-2.5 py-1.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-neutral-500 uppercase mb-0.5">Overlay Button Text (Optional)</label>
                      <input
                        type="text"
                        value={promo2ButtonText}
                        onChange={(e) => setPromo2ButtonText(e.target.value)}
                        className="w-full bg-[#fff] border border-cream-200 rounded px-3 py-1.5 text-xs"
                        placeholder="E.g. Get Stitched"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-neutral-500 uppercase mb-0.5">Text Font Color (hex)</label>
                      <input
                        type="text"
                        value={promo2FontColor}
                        onChange={(e) => setPromo2FontColor(e.target.value)}
                        className="w-full bg-[#fff] border border-cream-200 rounded px-3 py-1.5 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-neutral-500 uppercase mb-0.5">Text Position Alignment</label>
                      <select
                        value={promo2TextPosition}
                        onChange={(e) => setPromo2TextPosition(e.target.value as any)}
                        className="w-full bg-[#fff] border border-cream-200 rounded px-3 py-1.5 text-xs"
                      >
                        <option value="left">Left Align</option>
                        <option value="center">Center Align</option>
                        <option value="right">Right Align</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-cream-100">
                  <button
                    type="button"
                    onClick={handleSaveCustomConfigs}
                    disabled={isActionLoading}
                    className="px-6 py-3 bg-[#ab8215] hover:bg-[#937318] disabled:bg-[#ccc] text-[#fff] font-bold rounded-lg text-xs tracking-wider uppercase transition-colors pointer-events-auto cursor-pointer flex items-center gap-1.5 animate-pulse"
                  >
                    {isActionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>Save Website Layout Configurations</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: GLOBAL PRODUCT INFO */}
          {activeTab === 'global_product_info' && (
            <div className="bg-[#fff] border border-cream-100 rounded-xl p-6 shadow-sm space-y-6 animate-in fade-in duration-300">
              <div>
                <h2 className="text-md font-serif font-bold text-emerald-950 uppercase tracking-wider">Global Product Page Information</h2>
                <p className="text-xs text-neutral-400">Configure global notes on fabrics craftsmanship, standardized sizing guides, and courier/stitching timelines shown live on product detail tabs.</p>
              </div>

              <div className="space-y-6 text-xs bg-cream-50/20 p-4 rounded-xl border border-cream-100">
                {/* 1. Global Fabric craft */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-emerald-950 uppercase tracking-widest flex items-center gap-1.5 font-serif">
                    <FileText className="w-4 h-4 text-gold-550 shrink-0" />
                    <span>Standardized Fabric Craftsmanship Details</span>
                  </label>
                  <p className="text-[10px] text-neutral-400">Automatically visible on product details tabs under "Fabric & Details" context if the custom configuration persists.</p>
                  <textarea
                    rows={6}
                    value={globalFabricDetails}
                    onChange={(e) => setGlobalFabricDetails(e.target.value)}
                    placeholder="Primary Fabric: Lawn...&#10;&#10;Thread Craftsmanship:&#10;Fine quality embroidery..."
                    className="w-full bg-[#fff] border border-cream-200 rounded p-3 text-xs text-neutral-800 font-sans"
                  />
                </div>

                {/* 2. Global Sizing chart */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-emerald-950 uppercase tracking-widest flex items-center gap-1.5 font-serif">
                    <Palette className="w-4 h-4 text-emerald-800 shrink-0" />
                    <span>Global Standardized Sizing Chart Specifications</span>
                  </label>
                  <p className="text-[10px] text-neutral-400 font-sans">Used to show the standard measurements reference grid on every designer dress page.</p>
                  <textarea
                    rows={6}
                    value={globalSizingCharts}
                    onChange={(e) => setGlobalSizingCharts(e.target.value)}
                    placeholder="S  : Chest: 36&quot; | Waist: 30&quot; | Shoulder: 14.0&quot; | Shirt Length: 39&quot;&#10;M  : Chest: 40&quot; | Waist: 34&quot; | Shoulder: 15.0&quot; | Shirt Length: 40&quot;&#10;L  : Chest: 44&quot; | Waist: 38&quot; | Shoulder: 16.0&quot; | Shirt Length: 41&quot;&#10;XL : Chest: 48&quot; | Waist: 42&quot; | Shoulder: 17.5&quot; | Shirt Length: 42&quot;"
                    className="w-full bg-[#fff] border border-cream-200 rounded p-3 text-xs text-neutral-800 font-mono"
                  />
                </div>

                {/* 3. Global Delivery timelines */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-emerald-950 uppercase tracking-widest flex items-center gap-1.5 font-serif">
                    <Info className="w-4 h-4 text-gold-550 shrink-0" />
                    <span>Standardized Courier Transit & Packing Details</span>
                  </label>
                  <p className="text-[10px] text-neutral-400">Specify expected stitching completion timelines, packing premium experience detail, and parcel carrier services.</p>
                  <textarea
                    rows={6}
                    value={globalDeliveryInfo}
                    onChange={(e) => setGlobalDeliveryInfo(e.target.value)}
                    placeholder="Premium Shipping:&#10;Secured high-speed courier dispatch...&#10;&#10;stitching completion timeline:&#10;Unstitched 2-3 working days. Customized tailored dress requires 10-14 business days."
                    className="w-full bg-[#fff] border border-cream-200 rounded p-3 text-xs text-neutral-800 font-sans"
                  />
                </div>

                <div className="flex justify-end pt-2 border-t border-cream-100">
                  <button
                    type="button"
                    onClick={handleSaveCustomConfigs}
                    disabled={isActionLoading}
                    className="px-6 py-3 bg-[#ab8215] hover:bg-[#937318] disabled:bg-[#ccc] text-[#fff] font-bold rounded-lg text-xs tracking-wider uppercase transition-colors pointer-events-auto cursor-pointer flex items-center gap-1.5"
                  >
                    {isActionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>Commit Global Product Disclosures</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
