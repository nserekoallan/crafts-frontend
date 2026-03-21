'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Product } from '@/lib/mock-data';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CartItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  imageUrl: string;
  category: string;
  region: string;
}

interface CartContextValue {
  /** Current cart items. */
  items: CartItem[];
  /** Total number of individual items (sum of quantities). */
  itemCount: number;
  /** Cart subtotal in UGX. */
  subtotal: number;
  /** The last item that was added — drives toast feedback. */
  lastAddedItem: CartItem | null;
  /** Whether the feedback toast should be visible. */
  showFeedback: boolean;
  /** Whether the cart drawer is open. */
  isDrawerOpen: boolean;
  /** Open / close the cart drawer. */
  setDrawerOpen: (open: boolean) => void;
  /** Add a product to the cart. Merges duplicates. */
  addItem: (product: Product, qty?: number) => void;
  /** Remove an item entirely by id. */
  removeItem: (id: string) => void;
  /** Set the quantity for a specific item. Removes if qty <= 0. */
  updateQuantity: (id: string, qty: number) => void;
  /** Clear the entire cart. */
  clearCart: () => void;
  /** Dismiss the feedback toast manually. */
  dismissFeedback: () => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'crafts-cart';
const FEEDBACK_DURATION_MS = 3000;

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const CartContext = createContext<CartContextValue | null>(null);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Safely read cart from localStorage. */
function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as CartItem[];
  } catch {
    return [];
  }
}

/** Persist cart to localStorage. */
function saveCart(items: CartItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage full or unavailable — silently fail
  }
}

/** Convert a Product to a CartItem. */
function productToCartItem(product: Product, qty: number): CartItem {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    originalPrice: product.originalPrice,
    quantity: qty,
    imageUrl: product.imageUrl,
    category: product.category,
    region: product.region,
  };
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

/**
 * Provides cart state and actions to the entire app.
 * Persists to localStorage and hydrates on mount.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [lastAddedItem, setLastAddedItem] = useState<CartItem | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setItems(loadCart());
  }, []);

  // Persist on every change (skip initial empty state before hydration)
  const hydrated = useRef(false);
  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true;
      return;
    }
    saveCart(items);
  }, [items]);

  const triggerFeedback = useCallback((item: CartItem) => {
    setLastAddedItem(item);
    setShowFeedback(true);
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    feedbackTimer.current = setTimeout(() => {
      setShowFeedback(false);
    }, FEEDBACK_DURATION_MS);
  }, []);

  const addItem = useCallback(
    (product: Product, qty = 1) => {
      if (qty < 1) return;
      const newItem = productToCartItem(product, qty);

      setItems((prev) => {
        const existing = prev.find((i) => i.id === product.id);
        if (existing) {
          return prev.map((i) =>
            i.id === product.id
              ? { ...i, quantity: i.quantity + qty }
              : i,
          );
        }
        return [...prev, newItem];
      });

      triggerFeedback(newItem);
      setDrawerOpen(true);
    },
    [triggerFeedback],
  );

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, qty: number) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i)),
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const dismissFeedback = useCallback(() => {
    setShowFeedback(false);
  }, []);

  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  );

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      itemCount,
      subtotal,
      lastAddedItem,
      showFeedback,
      isDrawerOpen,
      setDrawerOpen,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      dismissFeedback,
    }),
    [
      items,
      itemCount,
      subtotal,
      lastAddedItem,
      showFeedback,
      isDrawerOpen,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      dismissFeedback,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/**
 * Hook to access cart state and actions.
 * Must be used within a CartProvider.
 */
export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
}
