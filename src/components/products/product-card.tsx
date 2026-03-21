'use client';

import { useState } from 'react';
import { Check, Heart, Plus } from 'lucide-react';
import { useCart } from '@/lib/cart';
import { useWishlist } from '@/lib/wishlist';
import { useCurrency } from '@/lib/currency';
import { cn } from '@/lib/utils';
import type { Product } from '@/lib/mock-data';

interface ProductCardProps {
  product: Product;
  className?: string;
}

/**
 * Product card with dark theme, cart + wishlist integration.
 */
export function ProductCard({ product, className }: ProductCardProps) {
  const { formatPrice } = useCurrency();
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [isAdded, setIsAdded] = useState(false);

  const isUnavailable = product.stockStatus === 'out_of_stock';
  const wishlisted = isWishlisted(product.id);

  const handleAddToCart = () => {
    if (isUnavailable || isAdded) return;
    addItem(product, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <div
      className={cn(
        'group overflow-hidden rounded-xl border border-border-dark bg-bg-elevated transition-shadow hover:gold-glow',
        className,
      )}
    >
      {/* Image */}
      <a href={`/shop/${product.slug}`} className="relative block aspect-square overflow-hidden bg-bg-surface">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.imageUrl}
          alt={product.name}
          className={cn(
            'h-full w-full object-cover transition-transform duration-300 group-hover:scale-105',
            isUnavailable && 'opacity-50',
          )}
          loading="lazy"
        />
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
          }}
          className={cn(
            'absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-sm transition-colors',
            wishlisted
              ? 'bg-gold/20 text-gold'
              : 'bg-bg-primary/60 text-text-secondary hover:text-gold',
          )}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={cn('h-4 w-4', wishlisted && 'fill-gold')} />
        </button>
        <span className="absolute left-3 top-3 rounded-full bg-bg-primary/80 px-2.5 py-0.5 text-[11px] font-semibold text-gold backdrop-blur-sm">
          {product.region}
        </span>
      </a>

      {/* Info */}
      <div className="p-3 md:p-4">
        <a href={`/shop/${product.slug}`}>
          <h3 className="text-sm font-semibold text-text-primary line-clamp-1">{product.name}</h3>
        </a>
        <p className="mt-0.5 text-[11px] uppercase tracking-wider text-gold">
          {product.category}
        </p>

        <div className="mt-3 flex items-center justify-between">
          <span className="font-heading text-base font-bold text-gold">
            {formatPrice(product.price)}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={isUnavailable}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full transition-colors',
              isAdded
                ? 'bg-success/20 text-success'
                : isUnavailable
                  ? 'cursor-not-allowed bg-bg-surface text-text-tertiary opacity-40'
                  : 'bg-gold text-bg-primary hover:bg-gold-light active:scale-95',
            )}
            aria-label={isAdded ? 'Added to cart' : 'Add to cart'}
          >
            {isAdded ? (
              <Check className="h-4 w-4 animate-check-pop" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
