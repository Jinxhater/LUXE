import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product, ProductVariant } from '@/types';

export interface CartItemData {
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

interface CartStore {
  items: CartItemData[];
  couponCode: string | null;
  discount: number;
  
  // Actions
  addItem: (product: Product, variant: ProductVariant, quantity?: number) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;
  
  // Computed
  getSubtotal: () => number;
  getTotalItems: () => number;
  getShipping: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: null,
      discount: 0,

      addItem: (product, variant, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.variantId === variant.id);
          
          if (existingItem) {
            const newQuantity = Math.min(existingItem.quantity + quantity, variant.stock);
            return {
              items: state.items.map((item) =>
                item.variantId === variant.id
                  ? { ...item, quantity: newQuantity }
                  : item
              ),
            };
          }

          const images = Array.isArray(product.images) ? product.images : JSON.parse(product.images || '[]');
          const newItem: CartItemData = {
            variantId: variant.id,
            productId: product.id,
            productName: product.name,
            productSlug: product.slug,
            size: variant.size,
            color: variant.color,
            colorHex: variant.colorHex,
            price: variant.price || product.price,
            image: images[0] || '',
            quantity: Math.min(quantity, variant.stock),
            stock: variant.stock,
          };

          return { items: [...state.items, newItem] };
        });
      },

      removeItem: (variantId) => {
        set((state) => ({
          items: state.items.filter((item) => item.variantId !== variantId),
        }));
      },

      updateQuantity: (variantId, quantity) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.variantId === variantId
              ? { ...item, quantity: Math.min(Math.max(quantity, 1), item.stock) }
              : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [], couponCode: null, discount: 0 });
      },

      applyCoupon: (code, discount) => {
        set({ couponCode: code, discount });
      },

      removeCoupon: () => {
        set({ couponCode: null, discount: 0 });
      },

      getSubtotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getShipping: () => {
        const subtotal = get().getSubtotal();
        return subtotal > 100 ? 0 : 9.99;
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const shipping = get().getShipping();
        const discount = get().discount;
        return Math.max(0, subtotal + shipping - discount);
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
