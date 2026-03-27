'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Heart, Plus, Star } from 'lucide-react';
import { useCart } from '@/lib/cart';
import { useWishlist } from '@/lib/wishlist';
import { useCurrency } from '@/lib/currency';
import { cn } from '@/lib/utils';
import { DiscountBadge } from '@/components/ui/discount-badge';
import { StockBadge } from '@/components/ui/stock-badge';
import type { Product } from '@/lib/mock-data';
import { SOCIAL_PROOF_COUNTS } from '@/lib/mock-data';

interface DenseProductCardProps {
  product: Product;
  className?: string;
  /** Animation delay for staggered grid entry (ms). */
  animationDelay?: number;
}

/**
 * Dense, dark-themed product card with cart + wishlist integration.
 * Subtle hover effects, gold accents, mobile-optimised touch targets.
 */
export function DenseProductCard({ product, className, animationDelay = 0 }: DenseProductCardProps) {
  const { formatPrice } = useCurrency();
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [isAdded, setIsAdded] = useState(false);
  const [heartBounce, setHeartBounce] = useState(false);

  const hasDiscount = !!product.originalPrice && product.originalPrice > product.price;
  const isUnavailable = product.stockStatus === 'out_of_stock';
  const wishlisted = isWishlisted(product.id);
  const loveCount = SOCIAL_PROOF_COUNTS[product.id] ?? 0;

  const handleAddToCart = () => {
    if (isUnavailable || isAdded) return;
    addItem(product, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleToggleWishlist = () => {
    toggleWishlist(product.id);
    setHeartBounce(true);
    setTimeout(() => setHeartBounce(false), 500);
  };

  return (
    <div
      className={cn(
        'group overflow-hidden rounded-xl border border-border-dark bg-bg-elevated transition-all duration-300 hover:border-gold/40 hover:gold-glow card-tilt animate-grid-item',
        className,
      )}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* Image */}
      <Link
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

        {/* New badge */}
        {product.isNew && !hasDiscount && (
          <span className="new-badge-pulse absolute left-2.5 top-2.5 rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-bg-primary">
            NEW
          </span>
        )}

        {/* Wishlist — top right */}
        <button
          onClick={(e) => {
            e.preventDefault();
            handleToggleWishlist();
          }}
          className={cn(
            'absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-sm transition-colors',
            wishlisted
              ? 'bg-gold/20 text-gold'
              : 'bg-bg-primary/60 text-text-secondary hover:text-gold',
            heartBounce && 'animate-heart-pulse',
          )}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={cn('h-4 w-4', wishlisted && 'fill-gold')} />
        </button>

        {/* Stock badge — bottom left */}
        {product.stockStatus !== 'in_stock' && (
          <StockBadge
            status={product.stockStatus}
            count={product.stockCount}
            className="absolute bottom-2.5 left-2.5"
          />
        )}
      </Link>

      {/* Info */}
      <div className="p-3 md:p-3.5">
        {/* Category */}
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gold md:text-[11px]">
          {product.category}
        </p>

        {/* Name */}
        <Link href={`/shop/${product.slug}`}>
          <h3 className="mt-0.5 text-[13px] font-semibold text-text-primary line-clamp-1 md:mt-1 md:text-sm">
            {product.name}
          </h3>
        </Link>

        {/* Social proof */}
        {loveCount > 0 && (
          <p className="mt-0.5 text-[10px] text-text-tertiary">
            {loveCount} people love this
          </p>
        )}

        {/* Rating */}
        <div className="mt-1 flex items-center gap-1 md:mt-1.5">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'h-2.5 w-2.5 md:h-3 md:w-3',
                  i < Math.round(product.rating)
                    ? 'fill-gold text-gold'
                    : 'fill-none text-text-tertiary',
                )}
              />
            ))}
          </div>
          <span className="text-[10px] text-text-tertiary md:text-[11px]">
            ({product.reviewCount})
          </span>
        </div>

        {/* Price */}
        <div className="mt-1.5 md:mt-2">
          {hasDiscount && (
            <span className="text-[11px] text-text-tertiary line-through md:text-xs">
              {formatPrice(product.originalPrice!)}
            </span>
          )}
          <p className="text-sm font-bold text-gold md:text-base">
            {formatPrice(product.price)}
          </p>
        </div>

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={isUnavailable}
          className={cn(
            'mt-2.5 flex h-9 w-full items-center justify-center gap-1.5 rounded-lg text-xs font-semibold transition-all duration-200 md:mt-3',
            isAdded
              ? 'border border-success bg-success/10 text-success'
              : isUnavailable
                ? 'cursor-not-allowed border border-border-dark text-text-tertiary opacity-40'
                : 'border border-gold text-gold hover:bg-gold hover:text-bg-primary active:scale-[0.97]',
          )}
        >
          {isAdded ? (
            <>
              <Check className="h-3.5 w-3.5 animate-check-pop" />
              Added
            </>
          ) : isUnavailable ? (
            'Sold Out'
          ) : (
            <>
              <Plus className="h-3.5 w-3.5" />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}
