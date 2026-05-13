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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WishlistProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice: number | null;
  currency: string;
  stockCount: number;
  status: string;
  category: string;
  imageUrl: string | null;
}

interface WishlistItem {
  id: string;
  product: WishlistProduct;
}

interface WishlistResponse {
  data: { items: WishlistItem[] };
}

interface WishlistContextValue {
  wishlistedIds: Set<string>;
  wishlistCount: number;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  clearWishlist: () => void;
}

// ---------------------------------------------------------------------------
// localStorage helpers (guest path)
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'crafts-wishlist';

function loadLocalWishlist(): Set<string> {
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

function saveLocalWishlist(ids: Set<string>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // silently fail — localStorage may be unavailable
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const WishlistContext = createContext<WishlistContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

/**
 * Provides wishlist state to the app.
 *
 * When the user is authenticated, wishlist state is managed server-side via
 * React Query (GET/POST/DELETE /wishlist). When the user is a guest the
 * previous localStorage behaviour is preserved so the heart toggle still works
 * on product cards without an account.
 */
export function WishlistProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // ── Guest state (localStorage) ──────────────────────────────────────────
  const [guestIds, setGuestIds] = useState<Set<string>>(new Set());
  const guestHydrated = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setGuestIds(loadLocalWishlist());
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) return;
    if (!guestHydrated.current) {
      guestHydrated.current = true;
      return;
    }
    saveLocalWishlist(guestIds);
  }, [guestIds, isAuthenticated]);

  // ── Server state (authenticated) ────────────────────────────────────────
  const { data: serverData } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => api.get<WishlistResponse>('/wishlist'),
    enabled: isAuthenticated,
    staleTime: 30_000,
  });

  const serverIds = useMemo<Set<string>>(() => {
    if (!serverData?.data?.items) return new Set();
    return new Set(serverData.data.items.map((item) => item.product.id));
  }, [serverData]);

  const { mutate: addMutation } = useMutation({
    mutationFn: (productId: string) =>
      api.post('/wishlist/items', { productId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wishlist'] }),
  });

  const { mutate: removeMutation } = useMutation({
    mutationFn: (productId: string) =>
      api.delete(`/wishlist/items/${productId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wishlist'] }),
  });

  // ── Unified actions ──────────────────────────────────────────────────────
  const toggleWishlist = useCallback(
    (productId: string) => {
      if (isAuthenticated) {
        if (serverIds.has(productId)) {
          removeMutation(productId);
        } else {
          addMutation(productId);
        }
      } else {
        setGuestIds((prev) => {
          const next = new Set(prev);
          if (next.has(productId)) {
            next.delete(productId);
          } else {
            next.add(productId);
          }
          return next;
        });
      }
    },
    [isAuthenticated, serverIds, addMutation, removeMutation],
  );

  const clearWishlist = useCallback(() => {
    if (isAuthenticated) {
      // No bulk-clear endpoint — invalidate to refetch
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    } else {
      setGuestIds(new Set());
    }
  }, [isAuthenticated, queryClient]);

  const wishlistedIds = isAuthenticated ? serverIds : guestIds;

  const isWishlisted = useCallback(
    (productId: string) => wishlistedIds.has(productId),
    [wishlistedIds],
  );

  const value = useMemo<WishlistContextValue>(
    () => ({
      wishlistedIds,
      wishlistCount: wishlistedIds.size,
      toggleWishlist,
      isWishlisted,
      clearWishlist,
    }),
    [wishlistedIds, toggleWishlist, isWishlisted, clearWishlist],
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
