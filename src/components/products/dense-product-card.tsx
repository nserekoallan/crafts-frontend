'use client';

import { Heart, Plus, Star } from 'lucide-react';
import { useCurrency } from '@/lib/currency';
import { cn } from '@/lib/utils';
import { DiscountBadge } from '@/components/ui/discount-badge';
import { StockBadge } from '@/components/ui/stock-badge';
import type { Product } from '@/lib/mock-data';

interface DenseProductCardProps {
  product: Product;
  className?: string;
}

/**
 * Dense, dark-themed product card.
 * Product images glow against the dark background.
 */
export function DenseProductCard({ product, className }: DenseProductCardProps) {
  const { formatPrice } = useCurrency();
  const hasDiscount = !!product.originalPrice && product.originalPrice > product.price;
  const isUnavailable = product.stockStatus === 'out_of_stock';

  return (
    <div
      className={cn(
        'group overflow-hidden rounded-xl border border-border-dark bg-bg-elevated transition-all duration-300 hover:border-gold/40 hover:gold-glow',
        className,
      )}
    >
      {/* Image */}
      <a
        href={`/shop/${product.slug}`}
        className="relative block aspect-[3/4] overflow-hidden bg-bg-surface"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.imageUrl}
          alt={product.name}
          className={cn(
            'h-full w-full object-cover transition-transform duration-500 group-hover:scale-103',
            isUnavailable && 'opacity-50',
          )}
          loading="lazy"
        />

        {/* Discount badge — top left */}
        {hasDiscount && (
          <DiscountBadge
            originalPrice={product.originalPrice!}
            currentPrice={product.price}
            className="absolute left-2.5 top-2.5"
          />
        )}

        {/* Wishlist — top right */}
        <button
          className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-bg-primary/60 text-text-secondary backdrop-blur-sm transition-colors hover:text-gold"
          aria-label="Add to wishlist"
        >
          <Heart className="h-4 w-4" />
        </button>

        {/* Stock badge — bottom left */}
        {product.stockStatus !== 'in_stock' && (
          <StockBadge
            status={product.stockStatus}
            count={product.stockCount}
            className="absolute bottom-2.5 left-2.5"
          />
        )}
      </a>

      {/* Info */}
      <div className="p-3.5">
        {/* Category */}
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gold">
          {product.category}
        </p>

        {/* Name */}
        <a href={`/shop/${product.slug}`}>
          <h3 className="mt-1 text-sm font-semibold text-text-primary line-clamp-1">
            {product.name}
          </h3>
        </a>

        {/* Artisan */}
        <p className="mt-0.5 text-xs text-text-secondary">
          by {product.artisanName}
        </p>

        {/* Rating */}
        <div className="mt-1.5 flex items-center gap-1">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'h-3 w-3',
                  i < Math.round(product.rating)
                    ? 'fill-gold text-gold'
                    : 'fill-none text-text-tertiary',
                )}
              />
            ))}
          </div>
          <span className="text-[11px] text-text-tertiary">
            ({product.reviewCount})
          </span>
        </div>

        {/* Price */}
        <div className="mt-2">
          {hasDiscount && (
            <span className="text-xs text-text-tertiary line-through">
              {formatPrice(product.originalPrice!)}
            </span>
          )}
          <p className="text-base font-bold text-gold">
            {formatPrice(product.price)}
          </p>
        </div>

        {/* Add to Cart */}
        <button
          disabled={isUnavailable}
          className={cn(
            'mt-3 flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-gold text-xs font-semibold text-gold transition-colors',
            isUnavailable
              ? 'cursor-not-allowed opacity-40'
              : 'hover:bg-gold hover:text-bg-primary',
          )}
        >
          <Plus className="h-3.5 w-3.5" />
          {isUnavailable ? 'Sold Out' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}
