'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useWishlist } from '@/lib/wishlist';
import { DenseProductCard } from '@/components/products/dense-product-card';
import { PRODUCTS } from '@/lib/mock-data';

/**
 * Wishlist page — grid of wishlisted products with empty state.
 */
export default function WishlistPage() {
  const { wishlistedIds, wishlistCount } = useWishlist();

  const wishlisted = PRODUCTS.filter((p) => wishlistedIds.has(p.id));

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

      {wishlisted.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-bg-surface md:h-20 md:w-20">
            <Heart className="h-8 w-8 text-text-tertiary md:h-10 md:w-10" />
          </div>
          <h2 className="mt-4 font-heading text-lg font-bold text-text-primary">
            Save the things you love
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

          {/* Trending suggestions */}
          <div className="mt-12 w-full">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-text-tertiary">
              Trending right now
            </h3>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              {PRODUCTS.filter((p) => p.featured).slice(0, 4).map((product, i) => (
                <DenseProductCard key={product.id} product={product} animationDelay={i * 50} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {wishlisted.map((product, i) => (
            <DenseProductCard key={product.id} product={product} animationDelay={i * 40} />
          ))}
        </div>
      )}
    </div>
  );
}
