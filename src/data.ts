import { Product, Category, Banner, Review, SEOMetadata } from './types';

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'cat_new',
    name: 'New Arrivals',
    slug: 'new-arrivals',
    description: 'Unveiling our latest premium handcrafts and bespoke styles.',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'cat_lawn',
    name: 'Luxury Lawn',
    slug: 'luxury-lawn',
    description: 'Breathtaking airy cotton canvas decorated with sophisticated threadwork.',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'cat_party',
    name: 'Party Wear',
    slug: 'party-wear',
    description: 'Make an unforgettable statement in royal organza and pure silks.',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'cat_summer',
    name: 'Summer Collection',
    slug: 'summer-collection',
    description: 'Lightweight drapes with a gold finish designed for hot Pakistani summers.',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'cat_winter',
    name: 'Winter Collection',
    slug: 'winter-collection',
    description: 'Cozy Karandi, absolute premium velvet, soft Pashmina duppatas.',
    image: 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'cat_stitched',
    name: 'Stitched Luxury',
    slug: 'stitched',
    description: 'Bespoke tailoring with impeccable hand finishes and boutique sizing.',
    image: 'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'cat_unstitched',
    name: 'Unstitched',
    slug: 'unstitched',
    description: 'Design it your way with premium fabrics, bordered panels and custom patchworks.',
    image: 'https://images.unsplash.com/photo-1590075865003-e48277afd558?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'cat_pret',
    name: 'Luxury Pret',
    slug: 'luxury-pret',
    description: 'Contemporary, ready-to-wear luxury kurtas and matching formal separates.',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'cat_casual',
    name: 'Casual Wear',
    slug: 'casual-wear',
    description: 'Effortless, premium daily wear with delicate details and comfortable cottons.',
    image: 'https://images.unsplash.com/photo-1509319117193-57bab727e09d?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'cat_evening',
    name: 'Evening Wear',
    slug: 'evening-wear',
    description: 'Dramatic modern heights, custom drapes, and flowing luxury silhouettes.',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'cat_bridal',
    name: 'Bridal Collection',
    slug: 'bridal-collection',
    description: 'Bespoke handcrafted masterworks built with heritage tilla and panni embroideries.',
    image: 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'cat_exclusive',
    name: 'Exclusive Designs',
    slug: 'exclusive-designs',
    description: 'Extravagant creations, custom tailored in highly limited, numbered editions.',
    image: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'cat_velvet',
    name: 'Velvet Peshwas',
    slug: 'velvet-peshwas',
    description: 'Regal silhouette dresses handcrafted with exquisite borders and pearl handcrafting.',
    image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'cat_organza',
    name: 'Organza Tunics',
    slug: 'organza-tunics',
    description: 'Light translucent overlays of fine silk with intricate floral threadwork.',
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'cat_festive',
    name: 'Festive Stitched',
    slug: 'festive-stitched',
    description: 'Pre-stitched festive wear combinations designed for grand Eid events and dinners.',
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80'
  }
];

export const DEFAULT_BANNERS: Banner[] = [
  {
    id: 'banner_1',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1600&q=90',
    title: 'NUR JAHAN COLLECTION',
    subtitle: 'Exquisite Pure Silk & Hand-Woven Velvet Formals',
    link: '/category/party-wear',
    isActive: true
  },
  {
    id: 'banner_2',
    image: 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?auto=format&fit=crop&w=1600&q=90',
    title: 'FESTIVE LAWN ‘26',
    subtitle: 'Breathable Cotton Jacquard with Gold Lurex Panels',
    link: '/category/luxury-lawn',
    isActive: true
  },
  {
    id: 'banner_3',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=90',
    title: 'THE BESPOKE RETREAT',
    subtitle: 'Tailored luxury ready-to-wear with premium hand-finishing',
    link: '/category/stitched',
    isActive: true
  }
];

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'pro_1',
    title: 'Zari Emerald Velvet Peshwas',
    description: 'Step into royal grandeur with this breathtaking emerald green micro-velvet kalidaar. The shirt features an elegantly structured high collar with elaborate gold tilla embroidery and delicate handcrafted pearl bead detailing along the flare and sleeves. Paired with a pure jamawar trouser and a matching gold metallic tissue dupatta with hand-finished scallops.',
    price: 26500,
    salePrice: 22500,
    category: 'party-wear',
    images: [
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1590075865003-e48277afd558?auto=format&fit=crop&w=800&q=80'
    ],
    stockStatus: 'instock',
    sku: 'MQ-NUR-EMERALD-01',
    productId: 'MQ-EV-01',
    isFeatured: true,
    fabric: 'Micro-Velvet & Pure Tissue',
    sizeInfo: ['S', 'M', 'L', 'XL', 'Custom Stitching'],
    deliveryInfo: 'Bespoke orders require 10-14 working days for stitching. Standard delivery within Pakistan takes 2-3 working days.',
    createdAt: '2026-05-30T04:39:00Z'
  },
  {
    id: 'pro_2',
    title: 'Nur Jahan Rose Gold Silk Set',
    description: 'An ethereal pastel peach and rose gold luxury semi-formal attire. Intricately crinkled pure crêpe chiffon shirt detailed with floral bouquet embroidery on front panels using premium zardozi and kora work. Features structured sheer sleeves and raw silk straight trousers decorated with block-printed margins.',
    price: 18500,
    category: 'party-wear',
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?auto=format&fit=crop&w=800&q=80'
    ],
    stockStatus: 'instock',
    sku: 'MQ-NUR-RG-02',
    productId: 'MQ-RG-02',
    isFeatured: true,
    fabric: 'Pure Crêpe Chiffon & Silk',
    sizeInfo: ['S', 'M', 'L', 'Custom Stitching'],
    deliveryInfo: 'Ready to ship in S, M, L. Custom stitching takes 7 additional days.',
    createdAt: '2026-05-30T04:39:00Z'
  },
  {
    id: 'pro_3',
    title: 'Sorbet Peach Cotton Jacquard',
    description: 'Make absolute peace with summer heat in this gorgeous pastel peach cotton lawn suit. Tailored meticulously with floral woven self-jacquard texturing. Handcraft includes delicate white cotton lace patchings on side seams, organza detailed neckline, with a light organza block printed dupatta.',
    price: 9500,
    category: 'luxury-lawn',
    images: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80'
    ],
    stockStatus: 'instock',
    sku: 'MQ-LAWN-SORBET-03',
    productId: 'MQ-SL-03',
    isFeatured: true,
    fabric: 'Cotton Self-Jacquard & Organza',
    sizeInfo: ['S', 'M', 'L', 'Unstitched'],
    deliveryInfo: 'Unstitched delivery within 48 hours in Karachi. Stitched variants shipped in 5-6 days.',
    createdAt: '2026-05-30T04:39:00Z'
  },
  {
    id: 'pro_4',
    title: 'Royal Crimson Brocade Kurta',
    description: 'A traditional loose-cut crimson kurta styled with beautiful woven patterns in gold zari threads. Features deep maroon silk borders with exquisite hand-anchored Gota-Patti embroidery. Perfect styling option for intimate nikkah and dholki pre-wedding festivities.',
    price: 13500,
    salePrice: 11000,
    category: 'stitched',
    images: [
      'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1564859228273-274232fdb516?auto=format&fit=crop&w=800&q=80'
    ],
    stockStatus: 'instock',
    sku: 'MQ-SEMI-CRIMSON-04',
    productId: 'MQ-RC-04',
    isFeatured: false,
    fabric: 'Art Brocade & Raw Silk',
    sizeInfo: ['M', 'L', 'XL'],
    deliveryInfo: 'Limited stock ready-to-wear kurta.',
    createdAt: '2026-05-30T04:39:00Z'
  },
  {
    id: 'pro_5',
    title: 'Ivory Pearl Embroidered Organza',
    description: 'Enchant in our premium absolute classic ivory organza tunic. The yoking exhibits immaculate ivory resham handcraft with a luxurious placement of real freshwater pearls, matching cut-work borders, and soft silver gotta embroidery. Paired perfectly with double layered raw silk pants.',
    price: 24500,
    category: 'new-arrivals',
    images: [
      'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1590075865003-e48277afd558?auto=format&fit=crop&w=800&q=80'
    ],
    stockStatus: 'instock',
    sku: 'MQ-FORM-IVORY-05',
    productId: 'MQ-IP-05',
    isFeatured: true,
    fabric: 'Premium Pure Silk Organza',
    sizeInfo: ['S', 'M', 'L', 'XL'],
    deliveryInfo: 'Includes stitched inner lining and trouser. Delivered premium-boxed.',
    createdAt: '2026-05-30T04:39:00Z'
  },
  {
    id: 'pro_6',
    title: 'Deep Plum Woven Karandi Suit',
    description: 'A premium winter luxury suit made from cozy heavy-thread woven Karandi. Deep rich dark plum tone paired with a heavy wool-viscose blended multi-color woven Kashmiri style Shawl that provides high comfort and absolute luxury style statement on cold winter soirées.',
    price: 12500,
    category: 'winter-collection',
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'
    ],
    stockStatus: 'instock',
    sku: 'MQ-WINT-PLUM-06',
    productId: 'MQ-DP-06',
    isFeatured: false,
    fabric: 'Premium Karandi & Woven Shawl',
    sizeInfo: ['S', 'M', 'L', 'Unstitched'],
    deliveryInfo: 'Ships within 3 days. Premium high-quality Karandi fabric feels heavy and warm.',
    createdAt: '2026-05-30T04:39:00Z'
  },
  {
    id: 'pro_7',
    title: 'Sage Mint Silk Jacquard Top',
    description: 'Delightfully elegant pastel sage mint green silk jacquard straight shirt, featuring a delicate keyhole collar with pearl clasp and dainty floral tilla outlines. Soft georgette slip included with tailored straight-cut viscose trousers.',
    price: 11000,
    salePrice: 8500,
    category: 'summer-collection',
    images: [
      'https://images.unsplash.com/photo-1590075865003-e48277afd558?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80'
    ],
    stockStatus: 'instock',
    sku: 'MQ-SUM-SAGE-07',
    productId: 'MQ-SS-07',
    isFeatured: true,
    fabric: 'Boutique Silk Jacquard',
    sizeInfo: ['S', 'M', 'L'],
    deliveryInfo: 'Fast delivery. Karachi same-day possible for requests sent before 1 PM.',
    createdAt: '2026-05-30T04:39:00Z'
  },
  {
    id: 'pro_8',
    title: 'Sienna Terracotta Linen Shirt',
    description: 'Premium everyday staple terracotta shade, loomed beautifully from pure soft-breathable chambray linen. Tailored with a modest drop yoking, dual box pleats, detailed with subtle wooden buttons. The absolute best choice for active modern Pakistani women.',
    price: 6500,
    category: 'unstitched',
    images: [
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80'
    ],
    stockStatus: 'instock',
    sku: 'MQ-CAS-SIENNA-08',
    productId: 'MQ-ST-08',
    isFeatured: false,
    fabric: 'Chambray Cotton Linen',
    sizeInfo: ['S', 'M', 'L', 'XL'],
    deliveryInfo: 'In stock. Regular fits.',
    createdAt: '2026-05-30T04:39:00Z'
  }
];

export const DEFAULT_REVIEWS: Review[] = [
  {
    id: 'rev_1',
    name: 'Amna Shah',
    location: 'Lahore, Punjab',
    rating: 5,
    comment: 'The stitching on the Emerald Velvet Peshwas is flawless! The gold tilla is extremely intricate, and there was no compromise on quality. Will definitely order again!',
    date: 'May 12, 2026',
    verified: true
  },
  {
    id: 'rev_2',
    name: 'Zara Khan',
    location: 'Karachi, Sindh',
    rating: 5,
    comment: 'Ordered via WhatsApp and the response was so fast! They customized my sleeves exactly as I wanted and guided me on the size. Highly recommend Mushq Outfits!',
    date: 'May 20, 2026',
    verified: true
  },
  {
    id: 'rev_3',
    name: 'Mariam Malik',
    location: 'Islamabad, ICT',
    rating: 5,
    comment: 'Exquisite designs and premium customer packaging. The Ivory Pearl Organza fabric feels luxurious and comfortable. Perfect on-time delivery.',
    date: 'May 28, 2026',
    verified: true
  },
  {
    id: 'rev_4',
    name: 'Sana Ahmed',
    location: 'Peshawar, KPK',
    rating: 5,
    comment: 'Incredible craftsmanship! The embroidery and tilla detail on my luxury pret outfit is beyond my expectation. Beautiful custom packaging too.',
    date: 'May 30, 2026',
    verified: true
  },
  {
    id: 'rev_5',
    name: 'Ayesha Omer',
    location: 'Faisalabad, Punjab',
    rating: 5,
    comment: 'Simply beautiful! Extremely breathable fabric, and the sewing is perfect. Highly responsive helpline on WhatsApp.',
    date: 'June 02, 2026',
    verified: true
  },
  {
    id: 'rev_6',
    name: 'Fatima Lodhi',
    location: 'Multan, Punjab',
    rating: 5,
    comment: 'Highly professional service. The order arrived exactly as shown. Got so many compliments at the mehndi ceremony!',
    date: 'June 03, 2026',
    verified: true
  },
  {
    id: 'rev_7',
    name: 'Hina Jamil',
    location: 'Quetta, Balochistan',
    rating: 5,
    comment: 'Outfits by Mushq has become my favorite brand. The premium jacquard dupattas and details are exquisite, looking forward to the winter editions.',
    date: 'June 04, 2026',
    verified: true
  },
  {
    id: 'rev_8',
    name: 'Nida Yasir',
    location: 'Sialkot, Punjab',
    rating: 5,
    comment: 'Absolute masterpiece! The velvet peshwas stitching length is correct to the inch, and the premium box shipping keeps the outfit pristine.',
    date: 'June 04, 2026',
    verified: true
  }
];

export const DEFAULT_SEO_METADATA: SEOMetadata = {
  metaTitle: 'Outfits by Mushq | Luxury Pakistani Women Fashion Brand',
  metaDescription: 'Shop exquisite luxury unstitched lawn, velvet peshwas, organza tunics, premium party wear and stitched formal wear at Outfits by Mushq. Secure custom stitching and worldwide premium courier deliveries.',
  ogTitle: 'Mushq Outfits - Timeless Premium Pakistani Boutique',
  ogDescription: 'Experience pure chiffon, cotton jacquard, micro-velvets crafted in intricate Pakistani embroidery motifs. Orders directly on WhatsApp!',
  ogImage: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=80',
  sitemap: 'https://mushqoutfits.pk/sitemap.xml'
};
