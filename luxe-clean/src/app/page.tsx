'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Search,
  User,
  Menu,
  X,
  Heart,
  ChevronRight,
  Star,
  Plus,
  Minus,
  Trash2,
  Truck,
  Shield,
  RefreshCw,
  CreditCard,
  Filter,
  Grid3X3,
  List,
  ArrowRight,
  Eye,
  Edit,
  Package,
  BarChart3,
  Settings,
  LogOut,
  CheckCircle,
  Clock,
  AlertCircle,
  Truck as TruckIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'sonner';
import type { Product, Category, Order, OrderStatus } from '@/types';

// Types for our app state
type View = 'home' | 'shop' | 'product' | 'cart' | 'checkout' | 'dashboard' | 'admin' | 'orders' | 'order-detail';

interface AppState {
  view: View;
  productId?: string;
  productSlug?: string;
  orderId?: string;
  filters: {
    category?: string;
    sizes: string[];
    colors: string[];
    minPrice?: number;
    maxPrice?: number;
    sort: string;
  };
}

// Constants
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const COLORS = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Grey', hex: '#808080' },
  { name: 'Navy', hex: '#000080' },
  { name: 'Beige', hex: '#F5F5DC' },
  { name: 'Brown', hex: '#8B4513' },
];

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-4 w-4" /> },
  PAID: { label: 'Paid', color: 'bg-blue-100 text-blue-800', icon: <CreditCard className="h-4 w-4" /> },
  PROCESSING: { label: 'Processing', color: 'bg-purple-100 text-purple-800', icon: <Package className="h-4 w-4" /> },
  SHIPPED: { label: 'Shipped', color: 'bg-indigo-100 text-indigo-800', icon: <TruckIcon className="h-4 w-4" /> },
  DELIVERED: { label: 'Delivered', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-4 w-4" /> },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: <X className="h-4 w-4" /> },
  REFUNDED: { label: 'Refunded', color: 'bg-gray-100 text-gray-800', icon: <RefreshCw className="h-4 w-4" /> },
};

export default function App() {
  // State
  const [appState, setAppState] = useState<AppState>({
    view: 'home',
    filters: { sizes: [], colors: [], sort: 'newest' },
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showFilters, setShowFilters] = useState(false);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  
  // Advanced Features State
  const [showExitIntent, setShowExitIntent] = useState(false);
  const [exitIntentShown, setExitIntentShown] = useState(false);
  const [viewersCount] = useState(() => Math.floor(Math.random() * 15) + 3);
  const [showStyleQuiz, setShowStyleQuiz] = useState(false);

  // Form states
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [checkoutForm, setCheckoutForm] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    notes: '',
    couponCode: '',
  });

  // Product variant selection
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  // Stores
  const cart = useCartStore();
  const auth = useAuthStore();
  
  // Free shipping threshold calculation
  const FREE_SHIPPING_THRESHOLD = 100;
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - cart.getSubtotal());
  const progressPercent = Math.min(100, (cart.getSubtotal() / FREE_SHIPPING_THRESHOLD) * 100);
  
  // Exit intent detection
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !exitIntentShown && cart.items.length > 0) {
        setShowExitIntent(true);
        setExitIntentShown(true);
      }
    };
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [exitIntentShown, cart.items.length]);

  // Fetch data
  const fetchProducts = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (appState.filters.category) params.append('category', appState.filters.category);
      if (appState.filters.sort) params.append('sort', appState.filters.sort);
      if (appState.filters.minPrice) params.append('minPrice', appState.filters.minPrice.toString());
      if (appState.filters.maxPrice) params.append('maxPrice', appState.filters.maxPrice.toString());
      if (appState.filters.sizes.length) params.append('sizes', appState.filters.sizes.join(','));
      if (appState.filters.colors.length) params.append('colors', appState.filters.colors.join(','));

      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  }, [appState.filters]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  }, []);

  const fetchProduct = useCallback(async (slug: string) => {
    try {
      const res = await fetch(`/api/products/${slug}`);
      const data = await res.json();
      if (data.success) {
        setSelectedProduct(data.data);
        // Set default selections
        if (data.data.variants?.length > 0) {
          setSelectedSize(data.data.variants[0].size);
          setSelectedColor(data.data.variants[0].color);
        }
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  }, []);

  const fetchAllOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success) {
        setAllOrders(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch all orders:', error);
    }
  }, []);

  // Seed database - defined before use
  const seedDatabase = async () => {
    try {
      await fetch('/api/seed', { method: 'POST' });
    } catch {
      // Ignore seeding errors
    }
  };

  // Initial load
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchCategories(),
        fetchProducts(),
        auth.checkAuth(),
        seedDatabase(),
      ]);
      setIsLoading(false);
    };
    init();
  }, []);

  // Refetch products when filters change
  useEffect(() => {
    if (!isLoading) {
      void Promise.resolve().then(() => fetchProducts());
    }
  }, [appState.filters, fetchProducts, isLoading]);

  // Fetch product when viewing product page
  useEffect(() => {
    if (appState.view === 'product' && appState.productSlug) {
      void Promise.resolve().then(() => fetchProduct(appState.productSlug));
    }
  }, [appState.view, appState.productSlug, fetchProduct]);

  // Fetch orders when viewing dashboard
  useEffect(() => {
    if (appState.view === 'dashboard' || appState.view === 'orders') {
      void Promise.resolve().then(() => fetchOrders());
    }
  }, [appState.view, fetchOrders]);

  // Fetch all orders when viewing admin
  useEffect(() => {
    if (appState.view === 'admin') {
      void Promise.resolve().then(() => fetchAllOrders());
    }
  }, [appState.view, fetchAllOrders]);

  // Navigation helpers
  const navigate = (view: View, params?: { productId?: string; productSlug?: string; orderId?: string }) => {
    setAppState(prev => ({ ...prev, view, ...params }));
    setShowMobileMenu(false);
    window.scrollTo(0, 0);
  };

  // Auth handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await auth.login(authForm.email, authForm.password);
    if (result.success) {
      toast.success('Welcome back!');
      setShowAuthModal(false);
      setAuthForm({ name: '', email: '', password: '' });
    } else {
      toast.error(result.error || 'Login failed');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await auth.register(authForm.name, authForm.email, authForm.password);
    if (result.success) {
      toast.success('Account created successfully!');
      setShowAuthModal(false);
      setAuthForm({ name: '', email: '', password: '' });
    } else {
      toast.error(result.error || 'Registration failed');
    }
  };

  const handleLogout = async () => {
    await auth.logout();
    toast.success('Logged out successfully');
    navigate('home');
  };

  // Cart handlers
  const addToCart = () => {
    if (!selectedProduct) return;
    
    const variant = selectedProduct.variants.find(
      v => v.size === selectedSize && v.color === selectedColor
    );
    
    if (!variant) {
      toast.error('Please select size and color');
      return;
    }

    if (variant.stock < 1) {
      toast.error('This variant is out of stock');
      return;
    }

    cart.addItem(selectedProduct, variant);
    toast.success('Added to cart!');
  };

  // Checkout handlers
  const applyCoupon = async () => {
    if (!checkoutForm.couponCode) return;
    
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: checkoutForm.couponCode,
          subtotal: cart.getSubtotal(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        cart.applyCoupon(data.data.code, data.data.discount);
        toast.success(`Coupon applied! You saved $${data.data.discount.toFixed(2)}`);
      } else {
        toast.error(data.error || 'Invalid coupon');
      }
    } catch (error) {
      toast.error('Failed to apply coupon');
    }
  };

  const placeOrder = async () => {
    if (!auth.isAuthenticated) {
      setShowAuthModal(true);
      setAuthMode('login');
      return;
    }

    if (cart.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // Validate form
    const required = ['name', 'email', 'phone', 'street', 'city', 'state', 'zipCode'];
    for (const field of required) {
      if (!checkoutForm[field as keyof typeof checkoutForm]) {
        toast.error('Please fill in all required fields');
        return;
      }
    }

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.items.map(item => ({
            variantId: item.variantId,
            quantity: item.quantity,
          })),
          shippingAddress: {
            name: checkoutForm.name,
            email: checkoutForm.email,
            phone: checkoutForm.phone,
            street: checkoutForm.street,
            city: checkoutForm.city,
            state: checkoutForm.state,
            zipCode: checkoutForm.zipCode,
            country: checkoutForm.country,
          },
          couponCode: cart.couponCode,
          notes: checkoutForm.notes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        cart.clearCart();
        toast.success('Order placed successfully!');
        navigate('orders');
      } else {
        toast.error(data.error || 'Failed to place order');
      }
    } catch (error) {
      toast.error('Failed to place order');
    }
  };

  // Filter handlers
  const toggleSize = (size: string) => {
    setAppState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        sizes: prev.filters.sizes.includes(size)
          ? prev.filters.sizes.filter(s => s !== size)
          : [...prev.filters.sizes, size],
      },
    }));
  };

  const toggleColor = (color: string) => {
    setAppState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        colors: prev.filters.colors.includes(color)
          ? prev.filters.colors.filter(c => c !== color)
          : [...prev.filters.colors, color],
      },
    }));
  };

  // Featured products - show 8 products on homepage
  const featuredProducts = useMemo(() => products.filter(p => p.featured).slice(0, 8), [products]);
  
  // All products for homepage grid
  const homeProducts = useMemo(() => products.slice(0, 12), [products]);

  // Admin stats
  const adminStats = useMemo(() => {
    const totalRevenue = allOrders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = allOrders.length;
    const pendingOrders = allOrders.filter(o => o.status === 'PENDING').length;
    return { totalRevenue, totalOrders, pendingOrders };
  }, [allOrders]);

  // Render helpers
  const renderHeader = () => (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={() => navigate('home')} className="text-2xl font-bold tracking-tight">
            LUXE
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => navigate('home')} className="text-sm font-medium hover:text-foreground/80">
              Home
            </button>
            <button onClick={() => navigate('shop')} className="text-sm font-medium hover:text-foreground/80">
              Shop
            </button>
            {categories.slice(0, 3).map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  setAppState(prev => ({ ...prev, filters: { ...prev.filters, category: cat.slug } }));
                  navigate('shop');
                }}
                className="text-sm font-medium hover:text-foreground/80"
              >
                {cat.name}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button className="hidden md:flex p-2 hover:bg-accent rounded-full">
              <Search className="h-5 w-5" />
            </button>
            <button className="hidden md:flex p-2 hover:bg-accent rounded-full">
              <Heart className="h-5 w-5" />
            </button>
            <button
              onClick={() => setShowCart(true)}
              className="relative p-2 hover:bg-accent rounded-full"
            >
              <ShoppingBag className="h-5 w-5" />
              {cart.getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-foreground text-background text-xs rounded-full flex items-center justify-center">
                  {cart.getTotalItems()}
                </span>
              )}
            </button>
            {auth.isAuthenticated ? (
              <div className="hidden md:flex items-center gap-2">
                {auth.user?.role === 'ADMIN' && (
                  <button
                    onClick={() => navigate('admin')}
                    className="text-sm font-medium hover:text-foreground/80"
                  >
                    Admin
                  </button>
                )}
                <button
                  onClick={() => navigate('dashboard')}
                  className="text-sm font-medium hover:text-foreground/80"
                >
                  Account
                </button>
                <button onClick={handleLogout} className="p-2 hover:bg-accent rounded-full">
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setShowAuthModal(true);
                  setAuthMode('login');
                }}
                className="hidden md:flex p-2 hover:bg-accent rounded-full"
              >
                <User className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={() => setShowMobileMenu(true)}
              className="md:hidden p-2 hover:bg-accent rounded-full"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );

  const renderFooter = () => (
    <footer className="bg-foreground text-background mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">LUXE</h3>
            <p className="text-sm text-background/70">
              Premium clothing and accessories for the modern lifestyle.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li><button className="hover:text-background">Men</button></li>
              <li><button className="hover:text-background">Women</button></li>
              <li><button className="hover:text-background">Accessories</button></li>
              <li><button className="hover:text-background">New Arrivals</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Help</h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li><button className="hover:text-background">Shipping</button></li>
              <li><button className="hover:text-background">Returns</button></li>
              <li><button className="hover:text-background">Size Guide</button></li>
              <li><button className="hover:text-background">Contact</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Newsletter</h4>
            <p className="text-sm text-background/70 mb-4">
              Subscribe for exclusive offers and updates.
            </p>
            <div className="flex gap-2">
              <Input placeholder="Email" className="bg-background/10 border-background/20 text-background placeholder:text-background/50" />
              <Button variant="secondary">Subscribe</Button>
            </div>
          </div>
        </div>
        <Separator className="my-8 bg-background/20" />
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-background/70">
          <p>&copy; 2024 LUXE. All rights reserved.</p>
          <div className="flex gap-6">
            <button className="hover:text-background">Privacy Policy</button>
            <button className="hover:text-background">Terms of Service</button>
          </div>
        </div>
      </div>
    </footer>
  );

  const renderMobileMenu = () => (
    <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle className="text-left text-2xl font-bold">LUXE</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 mt-8">
          <button onClick={() => navigate('home')} className="text-left py-2 font-medium">
            Home
          </button>
          <button onClick={() => navigate('shop')} className="text-left py-2 font-medium">
            Shop
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                setAppState(prev => ({ ...prev, filters: { ...prev.filters, category: cat.slug } }));
                navigate('shop');
              }}
              className="text-left py-2 font-medium"
            >
              {cat.name}
            </button>
          ))}
          <Separator />
          {auth.isAuthenticated ? (
            <>
              <button onClick={() => navigate('dashboard')} className="text-left py-2 font-medium">
                My Account
              </button>
              {auth.user?.role === 'ADMIN' && (
                <button onClick={() => navigate('admin')} className="text-left py-2 font-medium">
                  Admin Dashboard
                </button>
              )}
              <button onClick={handleLogout} className="text-left py-2 font-medium text-red-600">
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setShowMobileMenu(false);
                setShowAuthModal(true);
                setAuthMode('login');
              }}
              className="text-left py-2 font-medium"
            >
              Sign In
            </button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );

  const renderAuthModal = () => (
    <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</DialogTitle>
        </DialogHeader>
        <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as 'login' | 'register')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={authForm.email}
                  onChange={e => setAuthForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={authForm.password}
                  onChange={e => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>
              <Button type="submit" className="w-full">Sign In</Button>
            </form>
          </TabsContent>
          <TabsContent value="register" className="space-y-4">
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={authForm.name}
                  onChange={e => setAuthForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={authForm.email}
                  onChange={e => setAuthForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={authForm.password}
                  onChange={e => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full">Create Account</Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );

  const renderCartDrawer = () => (
    <Sheet open={showCart} onOpenChange={setShowCart}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Your Cart ({cart.getTotalItems()})</SheetTitle>
        </SheetHeader>
        {cart.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Your cart is empty</p>
            <Button onClick={() => { setShowCart(false); navigate('shop'); }}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4 py-4">
                {cart.items.map(item => (
                  <div key={item.variantId} className="flex gap-4">
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="h-24 w-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{item.productName}</h4>
                      <p className="text-sm text-muted-foreground">{item.size} / {item.color}</p>
                      <p className="font-medium">${item.price.toFixed(2)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => cart.updateQuantity(item.variantId, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => cart.updateQuantity(item.variantId, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 ml-auto text-red-500"
                          onClick={() => cart.removeItem(item.variantId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="border-t pt-4 space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${cart.getSubtotal().toFixed(2)}</span>
              </div>
              {cart.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-${cart.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{cart.getShipping() === 0 ? 'FREE' : `$${cart.getShipping().toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>${cart.getTotal().toFixed(2)}</span>
              </div>
              <Button
                className="w-full"
                onClick={() => { setShowCart(false); navigate('checkout'); }}
              >
                Proceed to Checkout
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );

  const renderProductCard = (product: Product, index: number = 0) => (
    <motion.div
      key={product.id}
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.08,
        ease: [0.21, 0.47, 0.32, 0.98]
      }}
      whileHover={{ 
        y: -8, 
        scale: 1.02,
        transition: { duration: 0.3 }
      }}
      className="group cursor-pointer"
      onClick={() => navigate('product', { productSlug: product.slug })}
    >
      <Card className="overflow-hidden border-0 shadow-none group-hover:shadow-xl transition-shadow duration-500">
        <CardContent className="p-0">
          <div className="relative aspect-[3/4] overflow-hidden bg-muted">
            <motion.img
              src={product.images[0]}
              alt={product.name}
              className="object-cover w-full h-full"
              whileHover={{ scale: 1.08 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
            {/* Animated overlay */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              initial={false}
            />
            {product.compareAt && (
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Badge className="absolute top-3 left-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white border-0" variant="destructive">
                  Sale
                </Badge>
              </motion.div>
            )}
            
            {/* Urgency Indicators */}
            {product.variants && product.variants.some(v => v.stock < 5 && v.stock > 0) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute top-3 left-3"
              >
                <Badge className="bg-red-500 text-white border-0 animate-pulse">
                  Low Stock
                </Badge>
              </motion.div>
            )}
            
            {/* Viewers count */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 + 0.3 }}
              className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                <Eye className="h-3 w-3" />
                <span>{viewersCount} viewing</span>
              </div>
            </motion.div>
            
            {/* Quick actions with slide-up animation */}
            <motion.div 
              className="absolute bottom-0 left-0 right-0 p-4"
              initial={{ y: 100, opacity: 0 }}
              whileHover={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
              style={{ transform: 'translateY(100%)' }}
            >
              <div className="transform translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-out">
                <Button 
                  className="w-full backdrop-blur-sm bg-white/90 text-black hover:bg-white" 
                  onClick={(e) => { e.stopPropagation(); navigate('product', { productSlug: product.slug }); }}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Quick View
                </Button>
              </div>
            </motion.div>
            {/* Wishlist button */}
            <motion.button
              className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => { e.stopPropagation(); toast.success('Added to wishlist!'); }}
            >
              <Heart className="h-4 w-4" />
            </motion.button>
          </div>
          <div className="pt-4">
            <motion.p 
              className="text-xs text-muted-foreground uppercase tracking-wide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.08 + 0.1 }}
            >
              {product.category?.name}
            </motion.p>
            <motion.h3 
              className="font-medium mt-1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 + 0.15 }}
            >
              {product.name}
            </motion.h3>
            <motion.div 
              className="flex items-center gap-2 mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.08 + 0.2 }}
            >
              <span className="font-semibold">${product.price.toFixed(2)}</span>
              {product.compareAt && (
                <span className="text-sm text-muted-foreground line-through">
                  ${product.compareAt.toFixed(2)}
                </span>
              )}
            </motion.div>
            {product.avgRating > 0 && (
              <motion.div 
                className="flex items-center gap-1 mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.08 + 0.25 }}
              >
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-muted-foreground">
                  {product.avgRating.toFixed(1)} ({product.reviewCount})
                </span>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderHomePage = () => (
    <main>
      {/* Hero Section with parallax effect */}
      <section className="relative h-[90vh] overflow-hidden">
        {/* Animated background with warm gradient */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-amber-100 via-rose-50 to-teal-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />
        <motion.div 
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920')] bg-cover bg-center"
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.12 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        
        {/* Floating colorful shapes */}
        <motion.div
          className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-amber-300/40 to-orange-300/40 rounded-full blur-3xl"
          animate={{ 
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-40 left-10 w-96 h-96 bg-gradient-to-br from-rose-300/30 to-pink-300/30 rounded-full blur-3xl"
          animate={{ 
            y: [0, -20, 0],
            x: [0, 20, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 right-1/4 w-48 h-48 bg-gradient-to-br from-teal-300/30 to-emerald-300/30 rounded-full blur-2xl"
          animate={{ 
            y: [0, -15, 0],
            x: [0, -10, 0],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.span 
                className="inline-block text-sm uppercase tracking-[0.3em] text-amber-700 mb-6 border border-amber-300 bg-amber-50/80 backdrop-blur-sm px-4 py-2 rounded-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                New Season Collection
              </motion.span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 leading-none"
            >
              <motion.span 
                className="block"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                Elevate
              </motion.span>
              <motion.span 
                className="block bg-gradient-to-r from-amber-600 via-rose-500 to-teal-500 bg-clip-text text-transparent"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                Your Style
              </motion.span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.7 }}
              className="text-lg md:text-xl text-slate-600 mb-10 max-w-lg"
            >
              Discover our curated selection of premium clothing and accessories designed for the modern lifestyle.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="flex flex-wrap gap-4"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button size="lg" className="gap-2 px-8 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25" onClick={() => navigate('shop')}>
                  Shop Now
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </motion.span>
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="px-8 border-amber-300 text-amber-700 hover:bg-amber-50"
                  onClick={() => {
                    setAppState(prev => ({ ...prev, filters: { ...prev.filters, category: 'new-arrivals' } }));
                    navigate('shop');
                  }}
                >
                  New Arrivals
                </Button>
              </motion.div>
            </motion.div>
          </div>
          
          {/* Floating product images */}
          <motion.div 
            className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <motion.div
              className="relative"
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <img 
                src="https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400" 
                alt="Fashion"
                className="w-80 h-96 object-cover rounded-2xl shadow-2xl"
              />
              <motion.div
                className="absolute -bottom-4 -left-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white p-4 rounded-xl shadow-lg"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2 }}
              >
                <p className="text-sm font-medium">Summer Collection</p>
                <p className="text-xs text-white/80">Up to 40% off</p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex flex-col items-center gap-2 text-amber-600"
          >
            <span className="text-xs uppercase tracking-widest">Scroll</span>
            <div className="w-px h-8 bg-gradient-to-b from-amber-400 to-transparent" />
          </motion.div>
        </motion.div>
      </section>

      {/* Features with stagger animation */}
      <section className="py-16 border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              visible: { transition: { staggerChildren: 0.1 } }
            }}
          >
            {[
              { icon: Truck, title: "Free Shipping", subtitle: "Orders over $100" },
              { icon: RefreshCw, title: "Easy Returns", subtitle: "30-day policy" },
              { icon: Shield, title: "Secure Payment", subtitle: "SSL encrypted" },
              { icon: CreditCard, title: "Flexible Payment", subtitle: "Pay your way" },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-4 group"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
                }}
                whileHover={{ x: 5 }}
              >
                <motion.div 
                  className="p-3 bg-stone-100 rounded-xl group-hover:bg-stone-200 transition-colors"
                  whileHover={{ rotate: 5 }}
                >
                  <feature.icon className="h-6 w-6 text-muted-foreground" />
                </motion.div>
                <div>
                  <p className="font-medium">{feature.title}</p>
                  <p className="text-sm text-muted-foreground">{feature.subtitle}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Categories with creative hover effects */}
      <section className="py-20 bg-gradient-to-b from-white via-amber-50/30 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex justify-between items-end mb-12"
          >
            <div>
              <motion.span 
                className="text-sm uppercase tracking-widest text-amber-700"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                Browse Collection
              </motion.span>
              <h2 className="text-4xl font-bold mt-2">Shop by Category</h2>
            </div>
            <Button variant="outline" className="hidden md:flex border-amber-200 hover:bg-amber-50 hover:border-amber-300" onClick={() => navigate('shop')}>
              View All <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </motion.div>
          
          {/* Category Cards with Images */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Men's Category */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: 0.1, duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
              whileHover={{ y: -12 }}
              className="relative aspect-[4/5] cursor-pointer group overflow-hidden rounded-3xl shadow-lg"
              onClick={() => {
                setAppState(prev => ({ ...prev, filters: { ...prev.filters, category: 'men' } }));
                navigate('shop');
              }}
            >
              <img 
                src="https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600" 
                alt="Men's Collection"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/90 via-emerald-900/40 to-transparent" />
              <motion.div 
                className="absolute bottom-0 left-0 right-0 p-8 text-white"
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
              >
                <span className="inline-block px-3 py-1 bg-emerald-500/80 text-xs uppercase tracking-wider rounded-full mb-3">
                  Collection
                </span>
                <h3 className="text-3xl font-bold mb-2">Men</h3>
                <p className="text-white/80 text-sm mb-4">Discover sophisticated styles for the modern man</p>
                <motion.div 
                  className="flex items-center gap-2 text-emerald-300 font-medium"
                  whileHover={{ x: 5 }}
                >
                  Shop Now 
                  <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1, repeat: Infinity }}>
                    <ArrowRight className="h-4 w-4" />
                  </motion.span>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Women's Category */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: 0.2, duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
              whileHover={{ y: -12 }}
              className="relative aspect-[4/5] cursor-pointer group overflow-hidden rounded-3xl shadow-lg"
              onClick={() => {
                setAppState(prev => ({ ...prev, filters: { ...prev.filters, category: 'women' } }));
                navigate('shop');
              }}
            >
              <img 
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600" 
                alt="Women's Collection"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-rose-900/90 via-rose-900/40 to-transparent" />
              <motion.div 
                className="absolute bottom-0 left-0 right-0 p-8 text-white"
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
              >
                <span className="inline-block px-3 py-1 bg-rose-500/80 text-xs uppercase tracking-wider rounded-full mb-3">
                  Collection
                </span>
                <h3 className="text-3xl font-bold mb-2">Women</h3>
                <p className="text-white/80 text-sm mb-4">Elegant pieces for every occasion</p>
                <motion.div 
                  className="flex items-center gap-2 text-rose-300 font-medium"
                  whileHover={{ x: 5 }}
                >
                  Shop Now 
                  <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1, repeat: Infinity }}>
                    <ArrowRight className="h-4 w-4" />
                  </motion.span>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Accessories Category */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: 0.3, duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
              whileHover={{ y: -12 }}
              className="relative aspect-[4/5] cursor-pointer group overflow-hidden rounded-3xl shadow-lg"
              onClick={() => {
                setAppState(prev => ({ ...prev, filters: { ...prev.filters, category: 'accessories' } }));
                navigate('shop');
              }}
            >
              <img 
                src="https://images.unsplash.com/photo-1523779105320-d1cd346ff52b?w=600" 
                alt="Accessories Collection"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-amber-900/90 via-amber-900/40 to-transparent" />
              <motion.div 
                className="absolute bottom-0 left-0 right-0 p-8 text-white"
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
              >
                <span className="inline-block px-3 py-1 bg-amber-500/80 text-xs uppercase tracking-wider rounded-full mb-3">
                  Collection
                </span>
                <h3 className="text-3xl font-bold mb-2">Accessories</h3>
                <p className="text-white/80 text-sm mb-4">Complete your look with our curated selection</p>
                <motion.div 
                  className="flex items-center gap-2 text-amber-300 font-medium"
                  whileHover={{ x: 5 }}
                >
                  Shop Now 
                  <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1, repeat: Infinity }}>
                    <ArrowRight className="h-4 w-4" />
                  </motion.span>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Products with section transition */}
      <section className="py-20 bg-gradient-to-b from-rose-50/50 via-amber-50/30 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <motion.span 
              className="inline-block text-sm uppercase tracking-widest text-rose-600 mb-4"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Handpicked for you
            </motion.span>
            <h2 className="text-4xl font-bold">Featured Products</h2>
          </motion.div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product, index) => renderProductCard(product, index))}
          </div>
          
          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <Button size="lg" className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white" onClick={() => navigate('shop')}>
              View All Products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* New Arrivals Banner */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-white overflow-hidden relative">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <motion.span 
                className="text-sm uppercase tracking-widest text-emerald-400"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                Just Dropped
              </motion.span>
              <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
                New Season<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-rose-400">Arrivals</span>
              </h2>
              <p className="text-white/70 mb-8 max-w-md">
                Explore our latest collection featuring contemporary designs crafted with premium materials for the modern wardrobe.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white gap-2" onClick={() => navigate('shop')}>
                  Explore Collection
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
            </motion.div>
            
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <img 
                  src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600" 
                  alt="New Arrivals"
                  className="w-full h-96 object-cover rounded-2xl shadow-2xl"
                />
              </motion.div>
              <motion.div
                className="absolute -bottom-6 -left-6 bg-gradient-to-br from-amber-500 to-orange-500 text-white p-6 rounded-xl shadow-xl"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-3xl font-bold">50+</p>
                <p className="text-sm text-white/80">New Styles</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* All Products Grid */}
      <section className="py-20 bg-gradient-to-b from-white via-slate-50/50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex justify-between items-center mb-12"
          >
            <div>
              <span className="text-sm uppercase tracking-widest text-teal-600">Our Collection</span>
              <h2 className="text-4xl font-bold mt-2">Shop All Products</h2>
            </div>
            <Button variant="outline" className="border-teal-200 hover:bg-teal-50 hover:border-teal-300" onClick={() => navigate('shop')}>
              View All <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </motion.div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {homeProducts.map((product, index) => renderProductCard(product, index))}
          </div>
        </div>
      </section>

      {/* Newsletter with animated gradient */}
      <section className="py-24 relative overflow-hidden">
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-violet-900 via-purple-900 to-fuchsia-900"
          animate={{ 
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] 
          }}
          transition={{ duration: 10, repeat: Infinity }}
          style={{ backgroundSize: "200% 200%" }}
        />
        <motion.div
          className="absolute inset-0 opacity-40"
          animate={{ 
            background: [
              "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 50%, rgba(255,255,255,0.15) 0%, transparent 50%)",
              "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 50%)",
            ]
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">Join the LUXE Community</h2>
            <p className="text-white/70 mb-8 max-w-md mx-auto">
              Subscribe to our newsletter for exclusive offers, style tips, and early access to new arrivals.
            </p>
            <motion.div 
              className="flex gap-3 max-w-md mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Input
                placeholder="Enter your email"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm focus:border-fuchsia-400"
              />
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Button className="bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:from-fuchsia-600 hover:to-pink-600 text-white" size="lg">Subscribe</Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  );

  const renderShopPage = () => (
    <main className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Shop All</h1>
            <p className="text-muted-foreground">{products.length} products</p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              className="md:hidden"
              onClick={() => setShowFilters(true)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Select
              value={appState.filters.sort}
              onValueChange={(v) => setAppState(prev => ({ ...prev, filters: { ...prev.filters, sort: v } }))}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="bestselling">Best Selling</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop Filters */}
          <aside className="hidden md:block w-64 shrink-0">
            <div className="space-y-6">
              {/* Categories */}
              <div>
                <h3 className="font-semibold mb-4">Categories</h3>
                <div className="space-y-2">
                  <button
                    className={`block w-full text-left py-1 ${!appState.filters.category ? 'font-medium' : 'text-muted-foreground'}`}
                    onClick={() => setAppState(prev => ({ ...prev, filters: { ...prev.filters, category: undefined } }))}
                  >
                    All Products
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      className={`block w-full text-left py-1 ${appState.filters.category === cat.slug ? 'font-medium' : 'text-muted-foreground'}`}
                      onClick={() => setAppState(prev => ({ ...prev, filters: { ...prev.filters, category: cat.slug } }))}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Sizes */}
              <div>
                <h3 className="font-semibold mb-4">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {SIZES.map(size => (
                    <Button
                      key={size}
                      variant={appState.filters.sizes.includes(size) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleSize(size)}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Colors */}
              <div>
                <h3 className="font-semibold mb-4">Color</h3>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map(color => (
                    <button
                      key={color.name}
                      onClick={() => toggleColor(color.name)}
                      className={`w-8 h-8 rounded-full border-2 ${appState.filters.colors.includes(color.name) ? 'border-foreground' : 'border-transparent'}`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((product, index) => renderProductCard(product, index))}
            </div>
            {products.length === 0 && (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No products found matching your criteria.</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setAppState(prev => ({ ...prev, filters: { sizes: [], colors: [], sort: 'newest' } }))}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Sheet */}
      <Sheet open={showFilters} onOpenChange={setShowFilters}>
        <SheetContent side="left" className="w-80">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="space-y-6 py-6">
            {/* Categories */}
            <div>
              <h3 className="font-semibold mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map(cat => (
                  <Button
                    key={cat.id}
                    variant={appState.filters.category === cat.slug ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setAppState(prev => ({ ...prev, filters: { ...prev.filters, category: cat.slug } }))}
                  >
                    {cat.name}
                  </Button>
                ))}
              </div>
            </div>
            <Separator />
            {/* Sizes */}
            <div>
              <h3 className="font-semibold mb-4">Size</h3>
              <div className="flex flex-wrap gap-2">
                {SIZES.map(size => (
                  <Button
                    key={size}
                    variant={appState.filters.sizes.includes(size) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleSize(size)}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </main>
  );

  const renderProductPage = () => {
    if (!selectedProduct) return null;

    const availableSizes = [...new Set(selectedProduct.variants.map(v => v.size))];
    const availableColors = [...new Set(selectedProduct.variants.filter(v => v.size === selectedSize).map(v => v.color))];
    const currentVariant = selectedProduct.variants.find(v => v.size === selectedSize && v.color === selectedColor);

    return (
      <main className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <button onClick={() => navigate('home')} className="hover:text-foreground">Home</button>
            <ChevronRight className="h-4 w-4" />
            <button onClick={() => navigate('shop')} className="hover:text-foreground">Shop</button>
            <ChevronRight className="h-4 w-4" />
            <span>{selectedProduct.name}</span>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Images */}
            <div className="space-y-4">
              <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden">
                <img
                  src={selectedProduct.images[0]}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-4 gap-4">
                {selectedProduct.images.map((img, i) => (
                  <button
                    key={i}
                    className="aspect-square bg-muted rounded-lg overflow-hidden border-2 border-transparent hover:border-foreground"
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Details */}
            <div>
              <p className="text-sm uppercase tracking-wide text-muted-foreground">
                {selectedProduct.category?.name}
              </p>
              <h1 className="text-3xl font-bold mt-2">{selectedProduct.name}</h1>
              
              <div className="flex items-center gap-4 mt-4">
                <span className="text-2xl font-semibold">${selectedProduct.price.toFixed(2)}</span>
                {selectedProduct.compareAt && (
                  <span className="text-lg text-muted-foreground line-through">
                    ${selectedProduct.compareAt.toFixed(2)}
                  </span>
                )}
              </div>

              {selectedProduct.avgRating > 0 && (
                <div className="flex items-center gap-2 mt-4">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i <= Math.round(selectedProduct.avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {selectedProduct.avgRating.toFixed(1)} ({selectedProduct.reviewCount} reviews)
                  </span>
                </div>
              )}

              <p className="mt-6 text-muted-foreground">{selectedProduct.description}</p>

              {/* Size Selector */}
              <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                  <Label>Size</Label>
                  <Button variant="link" className="p-0 h-auto">Size Guide</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map(size => {
                    const hasStock = selectedProduct.variants.some(v => v.size === size && v.stock > 0);
                    return (
                      <Button
                        key={size}
                        variant={selectedSize === size ? 'default' : 'outline'}
                        disabled={!hasStock}
                        onClick={() => {
                          setSelectedSize(size);
                          setSelectedColor('');
                        }}
                      >
                        {size}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Color Selector */}
              <div className="mt-6">
                <Label className="mb-4 block">Color: {selectedColor || 'Select'}</Label>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map(color => {
                    const variant = selectedProduct.variants.find(v => v.size === selectedSize && v.color === color);
                    return (
                      <Button
                        key={color}
                        variant={selectedColor === color ? 'default' : 'outline'}
                        disabled={!variant || variant.stock < 1}
                        onClick={() => setSelectedColor(color)}
                      >
                        {color}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Stock */}
              {currentVariant && (
                <p className={`mt-4 text-sm ${currentVariant.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {currentVariant.stock > 0 ? `${currentVariant.stock} in stock` : 'Out of stock'}
                </p>
              )}

              {/* Add to Cart */}
              <div className="mt-8 flex gap-4">
                <Button
                  size="lg"
                  className="flex-1"
                  disabled={!currentVariant || currentVariant.stock < 1}
                  onClick={addToCart}
                >
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
                <Button size="lg" variant="outline">
                  <Heart className="h-5 w-5" />
                </Button>
              </div>

              {/* Material & Care */}
              <div className="mt-8 space-y-4">
                {selectedProduct.material && (
                  <div>
                    <h4 className="font-medium">Material</h4>
                    <p className="text-sm text-muted-foreground">{selectedProduct.material}</p>
                  </div>
                )}
                {selectedProduct.careInfo && (
                  <div>
                    <h4 className="font-medium">Care</h4>
                    <p className="text-sm text-muted-foreground">{selectedProduct.careInfo}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Reviews */}
          {selectedProduct.reviews && selectedProduct.reviews.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold mb-8">Reviews</h2>
              <div className="space-y-6">
                {selectedProduct.reviews.map(review => (
                  <div key={review.id} className="border-b pb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map(i => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      {review.verified && (
                        <Badge variant="secondary" className="text-xs">Verified Purchase</Badge>
                      )}
                    </div>
                    {review.title && <h4 className="font-medium">{review.title}</h4>}
                    {review.comment && <p className="text-muted-foreground mt-2">{review.comment}</p>}
                    <p className="text-sm text-muted-foreground mt-2">
                      By {review.user?.name || 'Anonymous'} • {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    );
  };

  const renderCheckoutPage = () => (
    <main className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Form */}
          <div className="md:col-span-2 space-y-8">
            {/* Shipping Address */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-6">Shipping Address</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={checkoutForm.name}
                      onChange={e => setCheckoutForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={checkoutForm.email}
                      onChange={e => setCheckoutForm(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={checkoutForm.phone}
                      onChange={e => setCheckoutForm(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="street">Street Address</Label>
                    <Input
                      id="street"
                      value={checkoutForm.street}
                      onChange={e => setCheckoutForm(prev => ({ ...prev, street: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={checkoutForm.city}
                      onChange={e => setCheckoutForm(prev => ({ ...prev, city: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={checkoutForm.state}
                      onChange={e => setCheckoutForm(prev => ({ ...prev, state: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={checkoutForm.zipCode}
                      onChange={e => setCheckoutForm(prev => ({ ...prev, zipCode: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Select
                      value={checkoutForm.country}
                      onValueChange={v => setCheckoutForm(prev => ({ ...prev, country: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="United States">United States</SelectItem>
                        <SelectItem value="Canada">Canada</SelectItem>
                        <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="mt-4">
                  <Label htmlFor="notes">Order Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Special instructions for delivery..."
                    value={checkoutForm.notes}
                    onChange={e => setCheckoutForm(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Coupon */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Coupon Code</h2>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter coupon code"
                    value={checkoutForm.couponCode}
                    onChange={e => setCheckoutForm(prev => ({ ...prev, couponCode: e.target.value }))}
                  />
                  <Button variant="outline" onClick={applyCoupon}>Apply</Button>
                </div>
                {cart.couponCode && (
                  <p className="text-sm text-green-600 mt-2">
                    Coupon &quot;{cart.couponCode}&quot; applied - You save ${cart.discount.toFixed(2)}!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
                <div className="space-y-4">
                  {cart.items.map(item => (
                    <div key={item.variantId} className="flex gap-4">
                      <img src={item.image} alt={item.productName} className="w-16 h-16 object-cover rounded" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">{item.size} / {item.color}</p>
                        <p className="text-sm">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <Separator className="my-6" />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${cart.getSubtotal().toFixed(2)}</span>
                  </div>
                  {cart.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-${cart.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{cart.getShipping() === 0 ? 'FREE' : `$${cart.getShipping().toFixed(2)}`}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>${cart.getTotal().toFixed(2)}</span>
                  </div>
                </div>
                <Button className="w-full mt-6" size="lg" onClick={placeOrder}>
                  Place Order
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-4">
                  By placing this order, you agree to our Terms of Service.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );

  const renderDashboard = () => (
    <main className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">My Account</h1>

        <Tabs defaultValue="orders">
          <TabsList>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-6">
            {orders.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                  <p className="text-muted-foreground mb-4">Start shopping to see your orders here.</p>
                  <Button onClick={() => navigate('shop')}>Start Shopping</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <Card key={order.id} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => {
                      setSelectedOrder(order);
                      navigate('order-detail', { orderId: order.id });
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{order.orderNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className={STATUS_CONFIG[order.status].color}>
                            {STATUS_CONFIG[order.status].label}
                          </Badge>
                          <p className="font-semibold mt-2">${order.total.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        {order.items.slice(0, 3).map((item, i) => (
                          <img
                            key={i}
                            src={item.image}
                            alt={item.productName}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ))}
                        {order.items.length > 3 && (
                          <div className="w-12 h-12 bg-muted rounded flex items-center justify-center text-sm">
                            +{order.items.length - 3}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
                <div className="space-y-4 max-w-md">
                  <div>
                    <Label>Name</Label>
                    <Input defaultValue={auth.user?.name || ''} />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input defaultValue={auth.user?.email || ''} disabled />
                  </div>
                  <Button>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );

  const renderOrderDetail = () => {
    if (!selectedOrder) return null;

    return (
      <main className="min-h-screen py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('orders')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
            Back to Orders
          </button>

          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl font-bold">{selectedOrder.orderNumber}</h1>
              <p className="text-muted-foreground">
                Placed on {new Date(selectedOrder.createdAt).toLocaleDateString()}
              </p>
            </div>
            <Badge className={STATUS_CONFIG[selectedOrder.status].color}>
              {STATUS_CONFIG[selectedOrder.status].label}
            </Badge>
          </div>

          {/* Order Status Timeline */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex justify-between">
                {['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map((status, i) => {
                  const statusOrder = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'].indexOf(selectedOrder.status);
                  const isComplete = i <= statusOrder;
                  const isCurrent = status === selectedOrder.status;
                  return (
                    <div key={status} className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isComplete ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'}`}>
                        {isCurrent ? STATUS_CONFIG[status as OrderStatus].icon : (isComplete ? <CheckCircle className="h-4 w-4" /> : i + 1)}
                      </div>
                      <p className={`text-xs mt-2 ${isCurrent ? 'font-medium' : 'text-muted-foreground'}`}>
                        {status.charAt(0) + status.slice(1).toLowerCase()}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Items</h2>
              <div className="space-y-4">
                {selectedOrder.items.map(item => (
                  <div key={item.id} className="flex gap-4">
                    <img src={item.image} alt={item.productName} className="w-20 h-20 object-cover rounded" />
                    <div className="flex-1">
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">{item.size} / {item.color}</p>
                      <p className="text-sm">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
                <p>{selectedOrder.shippingAddress.name}</p>
                <p className="text-muted-foreground">{selectedOrder.shippingAddress.street}</p>
                <p className="text-muted-foreground">
                  {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}
                </p>
                <p className="text-muted-foreground">{selectedOrder.shippingAddress.country}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>${selectedOrder.shipping.toFixed(2)}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-${selectedOrder.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    );
  };

  const renderAdminDashboard = () => (
    <main className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">${adminStats.totalRevenue.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{adminStats.totalOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Orders</p>
                  <p className="text-2xl font-bold">{adminStats.pendingOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders Table */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Recent Orders</h2>
              <Button variant="outline" onClick={fetchAllOrders}>
                Refresh
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Order</th>
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-left py-3 px-4">Customer</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-right py-3 px-4">Total</th>
                    <th className="text-right py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allOrders.map(order => (
                    <tr key={order.id} className="border-b">
                      <td className="py-3 px-4 font-medium">{order.orderNumber}</td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">{order.shippingAddress.name}</td>
                      <td className="py-3 px-4">
                        <Select
                          value={order.status}
                          onValueChange={async (status) => {
                            try {
                              const res = await fetch(`/api/orders/${order.id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ status }),
                              });
                              if (res.ok) {
                                toast.success('Order status updated');
                                fetchAllOrders();
                              }
                            } catch {
                              toast.error('Failed to update order');
                            }
                          }}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="PAID">Paid</SelectItem>
                            <SelectItem value="PROCESSING">Processing</SelectItem>
                            <SelectItem value="SHIPPED">Shipped</SelectItem>
                            <SelectItem value="DELIVERED">Delivered</SelectItem>
                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-3 px-4 text-right font-medium">${order.total.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {allOrders.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No orders yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );

  // Main render
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-rose-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  // Free Shipping Progress Bar
  const renderFreeShippingBar = () => (
    <motion.div 
      initial={{ y: -50 }}
      animate={{ y: 0 }}
      className="sticky top-16 z-40 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-2 px-4"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <Truck className="h-5 w-5" />
          {amountToFreeShipping > 0 ? (
            <span className="text-sm">
              Add <strong>${amountToFreeShipping.toFixed(2)}</strong> more for FREE shipping!
            </span>
          ) : (
            <span className="text-sm font-medium">🎉 You've unlocked FREE shipping!</span>
          )}
        </div>
        <div className="hidden sm:block flex-1 max-w-xs">
          <div className="h-2 bg-white/30 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-white rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );

  // Exit Intent Popup
  const renderExitIntentPopup = () => (
    <AnimatePresence>
      {showExitIntent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowExitIntent(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-200 to-orange-200 rounded-full -translate-y-1/2 translate-x-1/2" />
            <button
              onClick={() => setShowExitIntent(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="relative">
              <div className="text-4xl mb-4">🎁</div>
              <h3 className="text-2xl font-bold mb-2">Wait! Don't Leave Empty-Handed</h3>
              <p className="text-gray-600 mb-6">
                Get an exclusive <span className="font-bold text-amber-600">10% OFF</span> your first order when you sign up!
              </p>
              <div className="space-y-3">
                <Input 
                  placeholder="Enter your email" 
                  className="bg-gray-50"
                />
                <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                  Claim My 10% Off
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-4 text-center">
                No spam, just exclusive offers. Unsubscribe anytime.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Loyalty Points Display
  const renderLoyaltyBanner = () => {
    if (!auth.isAuthenticated) return null;
    return (
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-violet-600 to-purple-600 text-white py-2 px-4 text-center text-sm"
      >
        <span className="font-medium">✨ You have <strong>{auth.user?.points || 0} points</strong></span>
        <span className="mx-2">•</span>
        <span>Earn 1 point per $1 spent</span>
        <span className="mx-2">•</span>
        <span className="font-medium">100 points = $5 off!</span>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      {renderLoyaltyBanner()}
      {renderHeader()}
      {cart.items.length > 0 && renderFreeShippingBar()}
      <AnimatePresence mode="wait">
        <motion.div
          key={appState.view}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {appState.view === 'home' && renderHomePage()}
          {appState.view === 'shop' && renderShopPage()}
          {appState.view === 'product' && renderProductPage()}
          {appState.view === 'checkout' && renderCheckoutPage()}
          {(appState.view === 'dashboard' || appState.view === 'orders') && renderDashboard()}
          {appState.view === 'order-detail' && renderOrderDetail()}
          {appState.view === 'admin' && renderAdminDashboard()}
        </motion.div>
      </AnimatePresence>
      {renderFooter()}
      {renderMobileMenu()}
      {renderAuthModal()}
      {renderCartDrawer()}
      {renderExitIntentPopup()}
    </div>
  );
}
