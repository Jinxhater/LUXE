import { create } from 'zustand';

interface UIStore {
  // Mobile navigation
  isMobileMenuOpen: boolean;
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
  toggleMobileMenu: () => void;

  // Cart drawer
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  // Auth modal
  authModalMode: 'login' | 'register' | null;
  openLoginModal: () => void;
  openRegisterModal: () => void;
  closeAuthModal: () => void;

  // Filters
  isFilterOpen: boolean;
  openFilter: () => void;
  closeFilter: () => void;
  toggleFilter: () => void;

  // Search
  isSearchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  toggleSearch: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  // Mobile navigation
  isMobileMenuOpen: false,
  openMobileMenu: () => set({ isMobileMenuOpen: true }),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),

  // Cart drawer
  isCartOpen: false,
  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

  // Auth modal
  authModalMode: null,
  openLoginModal: () => set({ authModalMode: 'login' }),
  openRegisterModal: () => set({ authModalMode: 'register' }),
  closeAuthModal: () => set({ authModalMode: null }),

  // Filters
  isFilterOpen: false,
  openFilter: () => set({ isFilterOpen: true }),
  closeFilter: () => set({ isFilterOpen: false }),
  toggleFilter: () => set((state) => ({ isFilterOpen: !state.isFilterOpen })),

  // Search
  isSearchOpen: false,
  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),
  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
}));
