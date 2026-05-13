'use client';

import Link from 'next/link';
import { Heart, Loader2, ShoppingCart, Trash2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useWishlist } from '@/lib/wishlist';
import { useAuth } from '@/lib/auth';
import { useCart } from '@/lib/cart';
import { useCurrency } from '@/lib/currency';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

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

// ---------------------------------------------------------------------------
// Product card for wishlist (server-data compatible)
// ---------------------------------------------------------------------------

function WishlistProductCard({ item }: { item: WishlistItem }) {
  const { toggleWishlist } = useWishlist();
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();

  const p = item.product;
  const isOutOfStock = p.stockCount === 0 || p.status !== 'ACTIVE';

  return (
    <div className="group relative overflow-hidden rounded-xl border border-border-dark bg-bg-elevated transition-all hover:border-gold/40">
      {/* Image */}
      <Link href={`/shop/${p.slug}`} className="relative block aspect-[3/4] overflow-hidden bg-bg-surface">
        {p.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.imageUrl}
            alt={p.name}
            className={cn(
              'h-full w-full object-cover transition-transform duration-500 group-hover:scale-105',
              isOutOfStock && 'opacity-50',
            )}
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-bg-surface">
            <Heart className="h-8 w-8 text-text-tertiary" />
          </div>
        )}

        {/* Remove from wishlist */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(p.id);
          }}
          className="absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-gold/20 text-gold backdrop-blur-sm transition-colors hover:bg-red-500/20 hover:text-red-400"
          aria-label="Remove from wishlist"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </Link>

      {/* Info */}
      <div className="p-3 md:p-3.5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gold">
          {p.category}
        </p>
        <Link href={`/shop/${p.slug}`}>
          <h3 className="mt-0.5 line-clamp-1 text-[13px] font-semibold text-text-primary transition-colors hover:text-gold md:text-sm">
            {p.name}
          </h3>
        </Link>

        <div className="mt-1.5">
          {p.originalPrice && p.originalPrice > p.price && (
            <span className="text-[11px] text-text-tertiary line-through md:text-xs">
              {formatPrice(p.originalPrice)}
            </span>
          )}
          <p className="text-sm font-bold text-gold md:text-base">
            {formatPrice(p.price)}
          </p>
        </div>

        <button
          onClick={() => {
            if (!isOutOfStock) {
              // Cart expects a mock-typed Product but addItem just needs id/price — cast to any
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              addItem({ id: p.id, name: p.name, price: p.price, currency: p.currency, imageUrl: p.imageUrl ?? '' } as any, 1);
            }
          }}
          disabled={isOutOfStock}
          className={cn(
            'mt-2.5 flex h-9 w-full items-center justify-center gap-1.5 rounded-lg text-xs font-semibold transition-all md:mt-3',
            isOutOfStock
              ? 'cursor-not-allowed border border-border-dark text-text-tertiary opacity-40'
              : 'border border-gold text-gold hover:bg-gold hover:text-bg-primary active:scale-[0.97]',
          )}
        >
          {isOutOfStock ? (
            'Unavailable'
          ) : (
            <>
              <ShoppingCart className="h-3.5 w-3.5" />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function WishlistSkeleton() {
  return (
    <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-border-dark bg-bg-elevated">
          <div className="aspect-[3/4] animate-pulse bg-bg-surface" />
          <div className="space-y-2 p-3">
            <div className="h-2 w-16 animate-pulse rounded bg-bg-surface" />
            <div className="h-3 w-full animate-pulse rounded bg-bg-surface" />
            <div className="h-4 w-20 animate-pulse rounded bg-bg-surface" />
            <div className="h-9 w-full animate-pulse rounded-lg bg-bg-surface" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

/**
 * Wishlist page.
 * - Authenticated: fetches from server, shows real wishlisted products.
 * - Guest: derives from localStorage via useWishlist context.
 */
export default function WishlistPage() {
  const { isAuthenticated } = useAuth();
  const { wishlistCount } = useWishlist();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => api.get<WishlistResponse>('/wishlist'),
    enabled: isAuthenticated,
    staleTime: 30_000,
  });

  const items: WishlistItem[] = data?.data?.items ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-8 lg:px-8">
      <div>
        <h1 className="font-heading text-2xl font-bold text-text-primary md:text-3xl">
          Wishlist
        </h1>
        {wishlistCount > 0 && (
          <p className="mt-1 text-sm text-text-secondary">
            {wishlistCount} saved {wishlistCount === 1 ? 'piece' : 'pieces'}
          </p>
        )}
      </div>

      {/* Loading */}
      {isAuthenticated && isLoading && <WishlistSkeleton />}

      {/* Error */}
      {isAuthenticated && isError && (
        <div className="mt-8 rounded-xl bg-red-500/10 p-4 text-sm text-red-400">
          Failed to load wishlist. Please refresh the page.
        </div>
      )}

      {/* Guest: prompt to log in */}
      {!isAuthenticated && wishlistCount === 0 && (
        <div className="flex flex-col items-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-bg-surface md:h-20 md:w-20">
            <Heart className="h-8 w-8 text-text-tertiary md:h-10 md:w-10" />
          </div>
          <h2 className="mt-4 font-heading text-lg font-bold text-text-primary">
            Save the things you love
          </h2>
          <p className="mt-1 max-w-sm text-sm text-text-secondary">
            Tap the heart on any product to save it here.{' '}
            <Link href="/login" className="text-gold hover:underline">
              Sign in
            </Link>{' '}
            to sync your wishlist across devices.
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-flex h-11 items-center rounded-xl bg-gold px-8 text-sm font-bold text-bg-primary transition-colors hover:bg-gold-light active:scale-[0.98]"
          >
            Explore Products
          </Link>
        </div>
      )}

      {/* Authenticated empty state */}
      {isAuthenticated && !isLoading && !isError && items.length === 0 && (
        <div className="flex flex-col items-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-bg-surface md:h-20 md:w-20">
            <Heart className="h-8 w-8 text-text-tertiary md:h-10 md:w-10" />
          </div>
          <h2 className="mt-4 font-heading text-lg font-bold text-text-primary">
            No saved items yet
          </h2>
          <p className="mt-1 max-w-sm text-sm text-text-secondary">
            Tap the heart on any product to save it here. Your wishlist will be waiting for you.
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-flex h-11 items-center rounded-xl bg-gold px-8 text-sm font-bold text-bg-primary transition-colors hover:bg-gold-light active:scale-[0.98]"
          >
            Explore Products
          </Link>
        </div>
      )}

      {/* Authenticated product grid */}
      {isAuthenticated && !isLoading && !isError && items.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {items.map((item) => (
            <WishlistProductCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
