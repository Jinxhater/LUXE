// Static data store - works everywhere without database
// This simulates a database with in-memory storage

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAt: number | null;
  categoryId: string;
  images: string[];
  material: string | null;
  careInfo: string | null;
  featured: boolean;
  active: boolean;
  category?: Category;
  variants: ProductVariant[];
  avgRating?: number;
  reviewCount?: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  size: string;
  color: string;
  colorHex: string | null;
  stock: number;
  price: number | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'USER' | 'ADMIN';
}

export interface CartItem {
  variantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  size: string;
  color: string;
  colorHex: string | null;
  price: number;
  image: string;
  quantity: number;
  stock: number;
}

// Categories
export const categories: Category[] = [
  { id: 'cat1', name: 'Men', slug: 'men', description: "Men's clothing collection", image: null },
  { id: 'cat2', name: 'Women', slug: 'women', description: "Women's clothing collection", image: null },
  { id: 'cat3', name: 'Accessories', slug: 'accessories', description: 'Accessories collection', image: null },
  { id: 'cat4', name: 'New Arrivals', slug: 'new-arrivals', description: 'Latest arrivals', image: null },
];

// Products with variants
export const products: Product[] = [
  // MEN'S TOPS
  {
    id: 'p1',
    name: 'Classic White T-Shirt',
    slug: 'classic-white-t-shirt',
    description: 'Premium cotton white t-shirt with a relaxed fit. Perfect for everyday wear.',
    price: 29.99,
    compareAt: 39.99,
    categoryId: 'cat1',
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800'],
    material: '100% Organic Cotton',
    careInfo: 'Machine wash cold, tumble dry low',
    featured: true,
    active: true,
    category: categories[0],
    variants: [
      { id: 'v1', productId: 'p1', sku: 'CWT-S-WHT', size: 'S', color: 'White', colorHex: '#FFFFFF', stock: 50, price: null },
      { id: 'v2', productId: 'p1', sku: 'CWT-M-WHT', size: 'M', color: 'White', colorHex: '#FFFFFF', stock: 75, price: null },
      { id: 'v3', productId: 'p1', sku: 'CWT-L-WHT', size: 'L', color: 'White', colorHex: '#FFFFFF', stock: 60, price: null },
      { id: 'v4', productId: 'p1', sku: 'CWT-M-BLK', size: 'M', color: 'Black', colorHex: '#000000', stock: 45, price: null },
    ],
  },
  {
    id: 'p2',
    name: 'Oversized Hoodie',
    slug: 'oversized-hoodie',
    description: 'Cozy oversized hoodie with kangaroo pocket. Perfect for layering.',
    price: 59.99,
    compareAt: null,
    categoryId: 'cat1',
    images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800'],
    material: '80% Cotton, 20% Polyester',
    careInfo: 'Machine wash cold, tumble dry low',
    featured: true,
    active: true,
    category: categories[0],
    variants: [
      { id: 'v5', productId: 'p2', sku: 'OH-S-GRY', size: 'S', color: 'Grey', colorHex: '#808080', stock: 40, price: null },
      { id: 'v6', productId: 'p2', sku: 'OH-M-GRY', size: 'M', color: 'Grey', colorHex: '#808080', stock: 55, price: null },
      { id: 'v7', productId: 'p2', sku: 'OH-L-GRY', size: 'L', color: 'Grey', colorHex: '#808080', stock: 45, price: null },
      { id: 'v8', productId: 'p2', sku: 'OH-M-BLK', size: 'M', color: 'Black', colorHex: '#000000', stock: 30, price: null },
    ],
  },
  {
    id: 'p3',
    name: 'Leather Bomber Jacket',
    slug: 'leather-bomber-jacket',
    description: 'Classic leather bomber jacket with ribbed cuffs. Timeless cool.',
    price: 249.99,
    compareAt: 299.99,
    categoryId: 'cat1',
    images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800'],
    material: 'Genuine Leather',
    careInfo: 'Professional leather clean',
    featured: true,
    active: true,
    category: categories[0],
    variants: [
      { id: 'v9', productId: 'p3', sku: 'LBJ-S-BLK', size: 'S', color: 'Black', colorHex: '#000000', stock: 15, price: null },
      { id: 'v10', productId: 'p3', sku: 'LBJ-M-BLK', size: 'M', color: 'Black', colorHex: '#000000', stock: 20, price: null },
      { id: 'v11', productId: 'p3', sku: 'LBJ-L-BLK', size: 'L', color: 'Black', colorHex: '#000000', stock: 18, price: null },
    ],
  },
  {
    id: 'p4',
    name: 'Slim Fit Black Jeans',
    slug: 'slim-fit-black-jeans',
    description: 'Modern slim fit black jeans with stretch comfort. A wardrobe essential.',
    price: 79.99,
    compareAt: 99.99,
    categoryId: 'cat1',
    images: ['https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=800'],
    material: '98% Cotton, 2% Elastane',
    careInfo: 'Machine wash cold, hang to dry',
    featured: true,
    active: true,
    category: categories[0],
    variants: [
      { id: 'v12', productId: 'p4', sku: 'SFB-30-BLK', size: '30', color: 'Black', colorHex: '#000000', stock: 30, price: null },
      { id: 'v13', productId: 'p4', sku: 'SFB-32-BLK', size: '32', color: 'Black', colorHex: '#000000', stock: 45, price: null },
      { id: 'v14', productId: 'p4', sku: 'SFB-34-BLK', size: '34', color: 'Black', colorHex: '#000000', stock: 35, price: null },
    ],
  },
  {
    id: 'p5',
    name: 'Polo Shirt',
    slug: 'polo-shirt',
    description: 'Classic polo shirt with ribbed collar and cuffs. Timeless style.',
    price: 44.99,
    compareAt: 54.99,
    categoryId: 'cat1',
    images: ['https://images.unsplash.com/photo-1625910513413-5fc28e44362e?w=800'],
    material: '100% Pique Cotton',
    careInfo: 'Machine wash cold, tumble dry low',
    featured: false,
    active: true,
    category: categories[0],
    variants: [
      { id: 'v15', productId: 'p5', sku: 'PS-S-NVY', size: 'S', color: 'Navy', colorHex: '#000080', stock: 35, price: null },
      { id: 'v16', productId: 'p5', sku: 'PS-M-NVY', size: 'M', color: 'Navy', colorHex: '#000080', stock: 50, price: null },
      { id: 'v17', productId: 'p5', sku: 'PS-L-NVY', size: 'L', color: 'Navy', colorHex: '#000080', stock: 40, price: null },
    ],
  },
  {
    id: 'p6',
    name: 'Denim Jacket',
    slug: 'denim-jacket-men',
    description: 'Classic denim jacket with vintage wash. Goes with everything.',
    price: 89.99,
    compareAt: null,
    categoryId: 'cat1',
    images: ['https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800'],
    material: '100% Cotton Denim',
    careInfo: 'Machine wash cold, tumble dry low',
    featured: false,
    active: true,
    category: categories[0],
    variants: [
      { id: 'v18', productId: 'p6', sku: 'DJ-S-IND', size: 'S', color: 'Indigo', colorHex: '#4B0082', stock: 25, price: null },
      { id: 'v19', productId: 'p6', sku: 'DJ-M-IND', size: 'M', color: 'Indigo', colorHex: '#4B0082', stock: 35, price: null },
      { id: 'v20', productId: 'p6', sku: 'DJ-L-IND', size: 'L', color: 'Indigo', colorHex: '#4B0082', stock: 30, price: null },
    ],
  },
  // WOMEN'S
  {
    id: 'p7',
    name: 'Floral Summer Dress',
    slug: 'floral-summer-dress',
    description: 'Elegant floral print summer dress with flowing silhouette.',
    price: 89.99,
    compareAt: 119.99,
    categoryId: 'cat2',
    images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800'],
    material: '100% Viscose',
    careInfo: 'Hand wash cold, line dry',
    featured: true,
    active: true,
    category: categories[1],
    variants: [
      { id: 'v21', productId: 'p7', sku: 'FSD-S-MUL', size: 'S', color: 'Multi', colorHex: '#E8B4B8', stock: 25, price: null },
      { id: 'v22', productId: 'p7', sku: 'FSD-M-MUL', size: 'M', color: 'Multi', colorHex: '#E8B4B8', stock: 35, price: null },
      { id: 'v23', productId: 'p7', sku: 'FSD-L-MUL', size: 'L', color: 'Multi', colorHex: '#E8B4B8', stock: 30, price: null },
    ],
  },
  {
    id: 'p8',
    name: 'Cashmere Sweater',
    slug: 'cashmere-sweater',
    description: 'Luxuriously soft cashmere sweater. Timeless elegance.',
    price: 149.99,
    compareAt: 179.99,
    categoryId: 'cat2',
    images: ['https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=800'],
    material: '100% Cashmere',
    careInfo: 'Dry clean or hand wash cold',
    featured: true,
    active: true,
    category: categories[1],
    variants: [
      { id: 'v24', productId: 'p8', sku: 'CSW-S-CRM', size: 'S', color: 'Cream', colorHex: '#FFFDD0', stock: 20, price: null },
      { id: 'v25', productId: 'p8', sku: 'CSW-M-CRM', size: 'M', color: 'Cream', colorHex: '#FFFDD0', stock: 30, price: null },
      { id: 'v26', productId: 'p8', sku: 'CSW-L-CRM', size: 'L', color: 'Cream', colorHex: '#FFFDD0', stock: 25, price: null },
    ],
  },
  {
    id: 'p9',
    name: 'Silk Blouse',
    slug: 'silk-blouse',
    description: 'Luxurious silk blouse with elegant draping. Perfect for work or evening.',
    price: 99.99,
    compareAt: null,
    categoryId: 'cat2',
    images: ['https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=800'],
    material: '100% Silk',
    careInfo: 'Dry clean or hand wash cold',
    featured: false,
    active: true,
    category: categories[1],
    variants: [
      { id: 'v27', productId: 'p9', sku: 'SB-S-IVR', size: 'S', color: 'Ivory', colorHex: '#FFFFF0', stock: 20, price: null },
      { id: 'v28', productId: 'p9', sku: 'SB-M-IVR', size: 'M', color: 'Ivory', colorHex: '#FFFFF0', stock: 25, price: null },
      { id: 'v29', productId: 'p9', sku: 'SB-L-IVR', size: 'L', color: 'Ivory', colorHex: '#FFFFF0', stock: 18, price: null },
    ],
  },
  {
    id: 'p10',
    name: 'Little Black Dress',
    slug: 'little-black-dress',
    description: 'Classic LBD perfect for any occasion. Timeless elegance.',
    price: 129.99,
    compareAt: null,
    categoryId: 'cat2',
    images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800'],
    material: '95% Polyester, 5% Elastane',
    careInfo: 'Machine wash cold, hang dry',
    featured: true,
    active: true,
    category: categories[1],
    variants: [
      { id: 'v30', productId: 'p10', sku: 'LBD-S-BLK', size: 'S', color: 'Black', colorHex: '#000000', stock: 25, price: null },
      { id: 'v31', productId: 'p10', sku: 'LBD-M-BLK', size: 'M', color: 'Black', colorHex: '#000000', stock: 35, price: null },
      { id: 'v32', productId: 'p10', sku: 'LBD-L-BLK', size: 'L', color: 'Black', colorHex: '#000000', stock: 30, price: null },
    ],
  },
  {
    id: 'p11',
    name: 'High-Waist Yoga Pants',
    slug: 'high-waist-yoga-pants',
    description: 'Comfortable high-waist yoga pants with moisture-wicking fabric.',
    price: 49.99,
    compareAt: null,
    categoryId: 'cat2',
    images: ['https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800'],
    material: '88% Nylon, 12% Spandex',
    careInfo: 'Machine wash cold, tumble dry low',
    featured: true,
    active: true,
    category: categories[1],
    variants: [
      { id: 'v33', productId: 'p11', sku: 'HYP-S-BLK', size: 'S', color: 'Black', colorHex: '#000000', stock: 60, price: null },
      { id: 'v34', productId: 'p11', sku: 'HYP-M-BLK', size: 'M', color: 'Black', colorHex: '#000000', stock: 80, price: null },
      { id: 'v35', productId: 'p11', sku: 'HYP-L-BLK', size: 'L', color: 'Black', colorHex: '#000000', stock: 55, price: null },
    ],
  },
  {
    id: 'p12',
    name: 'Trench Coat',
    slug: 'trench-coat',
    description: 'Classic trench coat with belt. Timeless outerwear essential.',
    price: 149.99,
    compareAt: 189.99,
    categoryId: 'cat2',
    images: ['https://images.unsplash.com/photo-1539533018447-63fcce2678e4?w=800'],
    material: '100% Cotton',
    careInfo: 'Dry clean only',
    featured: true,
    active: true,
    category: categories[1],
    variants: [
      { id: 'v36', productId: 'p12', sku: 'TC-S-BGE', size: 'S', color: 'Beige', colorHex: '#F5F5DC', stock: 20, price: null },
      { id: 'v37', productId: 'p12', sku: 'TC-M-BGE', size: 'M', color: 'Beige', colorHex: '#F5F5DC', stock: 30, price: null },
      { id: 'v38', productId: 'p12', sku: 'TC-L-BGE', size: 'L', color: 'Beige', colorHex: '#F5F5DC', stock: 25, price: null },
    ],
  },
  {
    id: 'p13',
    name: 'Maxi Dress',
    slug: 'maxi-dress',
    description: 'Bohemian maxi dress with flowing fabric. Perfect for beach days.',
    price: 79.99,
    compareAt: null,
    categoryId: 'cat2',
    images: ['https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800'],
    material: '100% Rayon',
    careInfo: 'Hand wash cold, line dry',
    featured: false,
    active: true,
    category: categories[1],
    variants: [
      { id: 'v39', productId: 'p13', sku: 'MD-S-TQL', size: 'S', color: 'Teal', colorHex: '#008080', stock: 30, price: null },
      { id: 'v40', productId: 'p13', sku: 'MD-M-TQL', size: 'M', color: 'Teal', colorHex: '#008080', stock: 40, price: null },
      { id: 'v41', productId: 'p13', sku: 'MD-L-TQL', size: 'L', color: 'Teal', colorHex: '#008080', stock: 35, price: null },
    ],
  },
  // ACCESSORIES
  {
    id: 'p14',
    name: 'Leather Crossbody Bag',
    slug: 'leather-crossbody-bag',
    description: 'Premium leather crossbody bag with adjustable strap and multiple compartments.',
    price: 129.99,
    compareAt: 159.99,
    categoryId: 'cat3',
    images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800'],
    material: 'Genuine Leather',
    careInfo: 'Wipe with damp cloth',
    featured: true,
    active: true,
    category: categories[2],
    variants: [
      { id: 'v42', productId: 'p14', sku: 'LCB-TAN', size: 'One Size', color: 'Tan', colorHex: '#D2B48C', stock: 30, price: null },
      { id: 'v43', productId: 'p14', sku: 'LCB-BLK', size: 'One Size', color: 'Black', colorHex: '#000000', stock: 45, price: null },
    ],
  },
  {
    id: 'p15',
    name: 'Canvas Sneakers',
    slug: 'canvas-sneakers',
    description: 'Classic canvas sneakers with cushioned insole for all-day comfort.',
    price: 69.99,
    compareAt: null,
    categoryId: 'cat3',
    images: ['https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800'],
    material: 'Canvas, Rubber',
    careInfo: 'Machine washable',
    featured: true,
    active: true,
    category: categories[2],
    variants: [
      { id: 'v44', productId: 'p15', sku: 'CS-7-WHT', size: '7', color: 'White', colorHex: '#FFFFFF', stock: 40, price: null },
      { id: 'v45', productId: 'p15', sku: 'CS-8-WHT', size: '8', color: 'White', colorHex: '#FFFFFF', stock: 50, price: null },
      { id: 'v46', productId: 'p15', sku: 'CS-9-WHT', size: '9', color: 'White', colorHex: '#FFFFFF', stock: 45, price: null },
      { id: 'v47', productId: 'p15', sku: 'CS-9-BLK', size: '9', color: 'Black', colorHex: '#000000', stock: 30, price: null },
    ],
  },
  {
    id: 'p16',
    name: 'Minimalist Watch',
    slug: 'minimalist-watch',
    description: 'Sleek minimalist watch with genuine leather strap and water resistance.',
    price: 149.99,
    compareAt: null,
    categoryId: 'cat3',
    images: ['https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800'],
    material: 'Stainless Steel, Leather',
    careInfo: 'Water resistant to 30m',
    featured: false,
    active: true,
    category: categories[2],
    variants: [
      { id: 'v48', productId: 'p16', sku: 'MW-SLV-BRN', size: 'One Size', color: 'Silver/Brown', colorHex: '#C0C0C0', stock: 25, price: null },
      { id: 'v49', productId: 'p16', sku: 'MW-GLD-BLK', size: 'One Size', color: 'Gold/Black', colorHex: '#FFD700', stock: 20, price: null },
    ],
  },
  {
    id: 'p17',
    name: 'Sunglasses',
    slug: 'sunglasses',
    description: 'Classic sunglasses with UV protection. Timeless style.',
    price: 89.99,
    compareAt: null,
    categoryId: 'cat3',
    images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800'],
    material: 'Acetate, Polycarbonate Lenses',
    careInfo: 'Clean with microfiber cloth',
    featured: true,
    active: true,
    category: categories[2],
    variants: [
      { id: 'v50', productId: 'p17', sku: 'SG-BLK', size: 'One Size', color: 'Black', colorHex: '#000000', stock: 35, price: null },
      { id: 'v51', productId: 'p17', sku: 'SG-TOR', size: 'One Size', color: 'Tortoise', colorHex: '#8B4513', stock: 30, price: null },
    ],
  },
  {
    id: 'p18',
    name: 'Ankle Boots',
    slug: 'ankle-boots',
    description: 'Versatile ankle boots with comfortable heel. Goes with everything.',
    price: 129.99,
    compareAt: 159.99,
    categoryId: 'cat3',
    images: ['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800'],
    material: 'Genuine Leather',
    careInfo: 'Wipe with damp cloth',
    featured: true,
    active: true,
    category: categories[2],
    variants: [
      { id: 'v52', productId: 'p18', sku: 'AB-6-BLK', size: '6', color: 'Black', colorHex: '#000000', stock: 20, price: null },
      { id: 'v53', productId: 'p18', sku: 'AB-7-BLK', size: '7', color: 'Black', colorHex: '#000000', stock: 30, price: null },
      { id: 'v54', productId: 'p18', sku: 'AB-8-BLK', size: '8', color: 'Black', colorHex: '#000000', stock: 25, price: null },
    ],
  },
  // MORE PRODUCTS
  {
    id: 'p19',
    name: 'Wool Peacoat',
    slug: 'wool-peacoat',
    description: 'Classic wool peacoat for sophisticated style. Double-breasted.',
    price: 199.99,
    compareAt: 249.99,
    categoryId: 'cat1',
    images: ['https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800'],
    material: '80% Wool, 20% Polyester',
    careInfo: 'Dry clean only',
    featured: false,
    active: true,
    category: categories[0],
    variants: [
      { id: 'v55', productId: 'p19', sku: 'WP-S-BLK', size: 'S', color: 'Black', colorHex: '#000000', stock: 15, price: null },
      { id: 'v56', productId: 'p19', sku: 'WP-M-BLK', size: 'M', color: 'Black', colorHex: '#000000', stock: 20, price: null },
      { id: 'v57', productId: 'p19', sku: 'WP-L-BLK', size: 'L', color: 'Black', colorHex: '#000000', stock: 18, price: null },
    ],
  },
  {
    id: 'p20',
    name: 'Faux Fur Coat',
    slug: 'faux-fur-coat',
    description: 'Luxurious faux fur coat for glamorous winter style.',
    price: 179.99,
    compareAt: null,
    categoryId: 'cat2',
    images: ['https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=800'],
    material: '100% Polyester',
    careInfo: 'Dry clean only',
    featured: false,
    active: true,
    category: categories[1],
    variants: [
      { id: 'v58', productId: 'p20', sku: 'FFC-S-BRN', size: 'S', color: 'Brown', colorHex: '#8B4513', stock: 15, price: null },
      { id: 'v59', productId: 'p20', sku: 'FFC-M-BRN', size: 'M', color: 'Brown', colorHex: '#8B4513', stock: 20, price: null },
      { id: 'v60', productId: 'p20', sku: 'FFC-L-BRN', size: 'L', color: 'Brown', colorHex: '#8B4513', stock: 18, price: null },
    ],
  },
];

// Helper functions
export function getProductBySlug(slug: string): Product | undefined {
  return products.find(p => p.slug === slug);
}

export function getProductsByCategory(categorySlug: string): Product[] {
  return products.filter(p => p.category?.slug === categorySlug && p.active);
}

export function getFeaturedProducts(): Product[] {
  return products.filter(p => p.featured && p.active);
}

export function getVariantById(variantId: string): ProductVariant | undefined {
  for (const product of products) {
    const variant = product.variants.find(v => v.id === variantId);
    if (variant) return variant;
  }
  return undefined;
}

export function getProductByVariantId(variantId: string): Product | undefined {
  for (const product of products) {
    if (product.variants.some(v => v.id === variantId)) {
      return product;
    }
  }
  return undefined;
}

// Coupons
export const coupons = [
  { code: 'WELCOME10', type: 'PERCENT' as const, value: 10, minOrder: 50, maxDiscount: null },
  { code: 'SAVE20', type: 'FIXED' as const, value: 20, minOrder: 100, maxDiscount: 20 },
  { code: 'SUMMER25', type: 'PERCENT' as const, value: 25, minOrder: 150, maxDiscount: 50 },
];

export function validateCoupon(code: string, subtotal: number): { valid: boolean; discount: number; error?: string } {
  const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase());
  
  if (!coupon) {
    return { valid: false, discount: 0, error: 'Invalid coupon code' };
  }
  
  if (subtotal < coupon.minOrder) {
    return { valid: false, discount: 0, error: `Minimum order amount is $${coupon.minOrder}` };
  }
  
  let discount = 0;
  if (coupon.type === 'PERCENT') {
    discount = subtotal * (coupon.value / 100);
    if (coupon.maxDiscount) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
  } else {
    discount = coupon.value;
  }
  
  return { valid: true, discount: Math.round(discount * 100) / 100 };
}
