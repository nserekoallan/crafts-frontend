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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WishlistContextValue {
  /** Set of wishlisted product IDs. */
  wishlistedIds: Set<string>;
  /** Total wishlisted count. */
  wishlistCount: number;
  /** Toggle a product in/out of the wishlist. */
  toggleWishlist: (productId: string) => void;
  /** Check if a product is wishlisted. */
  isWishlisted: (productId: string) => boolean;
  /** Clear entire wishlist. */
  clearWishlist: () => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'crafts-wishlist';

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const WishlistContext = createContext<WishlistContextValue | null>(null);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function loadWishlist(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed as string[]);
  } catch {
    return new Set();
  }
}

function saveWishlist(ids: Set<string>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // silently fail
  }
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

/**
 * Provides wishlist state and actions to the app.
 * Persists to localStorage.
 */
export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(new Set());
  const hydrated = useRef(false);

  useEffect(() => {
    setWishlistedIds(loadWishlist());
  }, []);

  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true;
      return;
    }
    saveWishlist(wishlistedIds);
  }, [wishlistedIds]);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlistedIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  }, []);

  const isWishlisted = useCallback(
    (productId: string) => wishlistedIds.has(productId),
    [wishlistedIds],
  );

  const clearWishlist = useCallback(() => {
    setWishlistedIds(new Set());
  }, []);

  const wishlistCount = wishlistedIds.size;

  const value = useMemo<WishlistContextValue>(
    () => ({
      wishlistedIds,
      wishlistCount,
      toggleWishlist,
      isWishlisted,
      clearWishlist,
    }),
    [wishlistedIds, wishlistCount, toggleWishlist, isWishlisted, clearWishlist],
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

/**
 * Hook to access wishlist state and actions.
 * Must be used within a WishlistProvider.
 */
export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return ctx;
}
