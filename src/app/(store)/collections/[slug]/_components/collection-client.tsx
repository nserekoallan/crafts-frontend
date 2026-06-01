'use client';

import Link from 'next/link';
import { ArrowLeft, Heart, Layers, ShoppingCart } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useWishlist } from '@/lib/wishlist';
import { useCart } from '@/lib/cart';
import { useCurrency } from '@/lib/currency';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CollectionProduct {
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

interface ApiCollection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  productCount: number;
  products: CollectionProduct[];
}

interface CollectionResponse {
  data: ApiCollection;
}

// ---------------------------------------------------------------------------
// Product card
// ---------------------------------------------------------------------------

function CollectionProductCard({ product }: { product: CollectionProduct }) {
  const { formatPrice } = useCurrency();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addItem } = useCart();

  const wishlisted = isWishlisted(product.id);
  const isOutOfStock = product.stockCount === 0 || product.status !== 'ACTIVE';
  const hasDiscount = product.originalPrice !== null && product.originalPrice > product.price;

  return (
    <div className="group overflow-hidden rounded-xl border border-border-dark bg-bg-elevated transition-all hover:border-gold/40">
      {/* Image */}
      <Link
        href={`/shop/${product.slug}`}
        className="relative block aspect-[3/4] overflow-hidden bg-bg-surface"
      >
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className={cn(
              'h-full w-full object-cover transition-transform duration-500 group-hover:scale-105',
              isOutOfStock && 'opacity-50',
            )}
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-bg-surface">
            <Layers className="h-8 w-8 text-text-tertiary" />
          </div>
        )}

        {/* Wishlist toggle */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
          }}
          className={cn(
            'absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-sm transition-colors',
            wishlisted
              ? 'bg-gold/20 text-gold'
              : 'bg-bg-primary/60 text-text-secondary hover:text-gold',
          )}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={cn('h-4 w-4', wishlisted && 'fill-gold')} />
        </button>
      </Link>

      {/* Info */}
      <div className="p-3 md:p-3.5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gold">
          {product.category}
        </p>
        <Link href={`/shop/${product.slug}`}>
          <h3 className="mt-0.5 line-clamp-1 text-[13px] font-semibold text-text-primary md:text-sm">
            {product.name}
          </h3>
        </Link>

        <div className="mt-1.5">
          {hasDiscount && (
            <span className="text-[11px] text-text-tertiary line-through md:text-xs">
              {formatPrice(product.originalPrice!)}
            </span>
          )}
          <p className="text-sm font-bold text-gold md:text-base">
            {formatPrice(product.price)}
          </p>
        </div>

        <button
          onClick={() => {
            if (!isOutOfStock) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              addItem({ id: product.id, name: product.name, price: product.price, currency: product.currency, imageUrl: product.imageUrl ?? '' } as any, 1);
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
            'Sold Out'
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

function CollectionSkeleton() {
  return (
    <>
      <div className="space-y-3">
        <div className="h-8 w-64 animate-pulse rounded bg-bg-surface" />
        <div className="h-4 w-96 animate-pulse rounded bg-bg-surface" />
        <div className="h-3 w-24 animate-pulse rounded bg-bg-surface" />
      </div>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5 xl:grid-cols-5">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
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
    </>
  );
}

// ---------------------------------------------------------------------------
// Client component
// ---------------------------------------------------------------------------

interface CollectionClientProps {
  slug: string;
}

export function CollectionClient({ slug }: CollectionClientProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['collection', slug],
    queryFn: () => api.get<CollectionResponse>(`/collections/${slug}`),
    staleTime: 60_000,
  });

  const collection = data?.data;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-8 lg:px-8">
      {/* Back link */}
      <Link
        href="/collections"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        All collections
      </Link>

      {/* Loading */}
      {isLoading && <CollectionSkeleton />}

      {/* Error */}
      {isError && (
        <div className="rounded-xl bg-red-500/10 p-6 text-center text-sm text-red-400">
          Collection not found or unavailable.{' '}
          <Link href="/collections" className="underline hover:no-underline">
            View all collections
          </Link>
        </div>
      )}

      {/* Collection content */}
      {!isLoading && !isError && collection && (
        <>
          {/* Header */}
          <div className="mb-8">
            {collection.image && (
              <div className="mb-6 aspect-[16/5] overflow-hidden rounded-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={collection.image}
                  alt={collection.name}
                  className="h-full w-full object-cover"
                  loading="eager"
                />
              </div>
            )}
            <h1 className="font-heading text-2xl font-bold text-text-primary md:text-3xl">
              {collection.name}
            </h1>
            {collection.description && (
              <p className="mt-2 max-w-2xl text-text-secondary">
                {collection.description}
              </p>
            )}
            <p className="mt-1 text-sm font-semibold text-gold">
              {collection.productCount}{' '}
              {collection.productCount === 1 ? 'piece' : 'pieces'}
            </p>
          </div>

          {/* Empty products state */}
          {collection.products.length === 0 && (
            <div className="flex flex-col items-center py-16 text-center">
              <Layers className="h-12 w-12 text-text-tertiary" />
              <h2 className="mt-4 font-heading text-lg font-bold text-text-primary">
                No products in this collection yet
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                Check back soon or browse all products.
              </p>
              <Link
                href="/shop"
                className="mt-6 inline-flex h-11 items-center rounded-xl bg-gold px-8 text-sm font-bold text-bg-primary transition-colors hover:bg-gold-light"
              >
                Browse all products
              </Link>
            </div>
          )}

          {/* Product grid */}
          {collection.products.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5 xl:grid-cols-5">
              {collection.products.map((product) => (
                <CollectionProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
