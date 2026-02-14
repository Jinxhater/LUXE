// Product Types
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
  createdAt: string;
  updatedAt: string;
  category?: Category;
  variants: ProductVariant[];
  reviews?: Review[];
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
  parentId: string | null;
  products?: Product[];
}

// Cart Types
export interface CartItem {
  id: string;
  variantId: string;
  quantity: number;
  variant: ProductVariant & { product: Product };
}

export interface Cart {
  id: string;
  items: CartItem[];
}

// Order Types
export type OrderStatus = 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  shippingAddress: Address;
  billingAddress?: Address;
  notes?: string;
  paidAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  createdAt: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  variantId: string;
  quantity: number;
  price: number;
  productName: string;
  size: string;
  color: string;
  image?: string;
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'USER' | 'ADMIN';
  image: string | null;
}

export interface Address {
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// Review Types
export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  title: string | null;
  comment: string | null;
  verified: boolean;
  createdAt: string;
  user?: { name: string | null };
}

// Coupon Types
export type DiscountType = 'PERCENT' | 'FIXED';

export interface Coupon {
  id: string;
  code: string;
  type: DiscountType;
  value: number;
  minOrder?: number;
  maxDiscount?: number;
  expiresAt?: string;
}

// Filter Types
export interface ProductFilters {
  category?: string;
  sizes?: string[];
  colors?: string[];
  minPrice?: number;
  maxPrice?: number;
  sort?: 'newest' | 'price-asc' | 'price-desc' | 'bestselling';
  page?: number;
  limit?: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
