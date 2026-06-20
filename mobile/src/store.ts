import { create } from 'zustand';

// ── Auth Store ─────────────────────────────────
interface AuthState {
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: any | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));

// ── Cart Store ─────────────────────────────────
interface CartState {
  items: any[];
  total: number;
  itemCount: number;
  promoCode: string | null;
  promoDiscount: number;
  setCart: (cart: any) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  total: 0,
  itemCount: 0,
  promoCode: null,
  promoDiscount: 0,
  setCart: (cart) =>
    set({
      items: cart.items || [],
      total: cart.total || 0,
      itemCount: (cart.items || []).reduce((sum: number, i: any) => sum + i.quantity, 0),
      promoCode: cart.promo_code || null,
      promoDiscount: cart.promo_discount || 0,
    }),
  clearCart: () => set({ items: [], total: 0, itemCount: 0, promoCode: null, promoDiscount: 0 }),
}));
