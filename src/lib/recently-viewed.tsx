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

interface RecentlyViewedItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string;
  category: string;
}

interface RecentlyViewedContextValue {
  /** Last 10 viewed products, most recent first. */
  recentItems: RecentlyViewedItem[];
  /** Record a product view. */
  recordView: (item: RecentlyViewedItem) => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'crafts-recently-viewed';
const MAX_ITEMS = 10;

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const RecentlyViewedContext = createContext<RecentlyViewedContextValue | null>(null);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function loadRecent(): RecentlyViewedItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as RecentlyViewedItem[];
  } catch {
    return [];
  }
}

function saveRecent(items: RecentlyViewedItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // silently fail
  }
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

/**
 * Tracks the last 10 products the user has viewed.
 * Persists to localStorage.
 */
export function RecentlyViewedProvider({ children }: { children: ReactNode }) {
  const [recentItems, setRecentItems] = useState<RecentlyViewedItem[]>([]);
  const hydrated = useRef(false);

  useEffect(() => {
    setRecentItems(loadRecent());
  }, []);

  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true;
      return;
    }
    saveRecent(recentItems);
  }, [recentItems]);

  const recordView = useCallback((item: RecentlyViewedItem) => {
    setRecentItems((prev) => {
      const filtered = prev.filter((i) => i.id !== item.id);
      return [item, ...filtered].slice(0, MAX_ITEMS);
    });
  }, []);

  const value = useMemo<RecentlyViewedContextValue>(
    () => ({ recentItems, recordView }),
    [recentItems, recordView],
  );

  return (
    <RecentlyViewedContext.Provider value={value}>
      {children}
    </RecentlyViewedContext.Provider>
  );
}

/**
 * Hook to access recently viewed products.
 * Must be used within a RecentlyViewedProvider.
 */
export function useRecentlyViewed(): RecentlyViewedContextValue {
  const ctx = useContext(RecentlyViewedContext);
  if (!ctx) {
    throw new Error('useRecentlyViewed must be used within a RecentlyViewedProvider');
  }
  return ctx;
}
