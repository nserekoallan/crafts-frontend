'use client';

import { useEffect, useState } from 'react';
import { Check, Heart, Minus, Plus, ShoppingBag, Star, X } from 'lucide-react';
import { useCart } from '@/lib/cart';
import { useWishlist } from '@/lib/wishlist';
import { useCurrency } from '@/lib/currency';
import { cn } from '@/lib/utils';
import type { Product } from '@/lib/mock-data';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

/**
 * Product quick view modal with large image, details, and one-click add to cart.
 * Responsive: full-screen on mobile, centered modal on desktop.
 */
export function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const { formatPrice } = useCurrency();
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    if (!product) return;

    setQuantity(1);
    setIsAdded(false);

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [product, onClose]);

  if (!product) return null;

  const isUnavailable = product.stockStatus === 'out_of_stock';
  const wishlisted = isWishlisted(product.id);
  const hasDiscount = !!product.originalPrice && product.originalPrice > product.price;

  const handleAdd = () => {
    if (isUnavailable || isAdded) return;
    addItem(product, quantity);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[80]">
      {/* Backdrop */}
      <div
        className="animate-fade-in absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="flex h-full items-end justify-center md:items-center md:p-6">
        <div className="animate-modal-in relative w-full max-h-[90vh] overflow-y-auto rounded-t-2xl bg-bg-elevated md:max-w-3xl md:rounded-2xl">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-bg-primary/60 text-text-secondary backdrop-blur-sm transition-colors hover:text-text-primary"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex flex-col md:flex-row">
            {/* Image */}
            <div className="relative aspect-square w-full shrink-0 bg-bg-surface md:w-1/2 md:rounded-l-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-full w-full object-cover md:rounded-l-2xl"
              />
            </div>

            {/* Details */}
            <div className="flex flex-col p-5 md:w-1/2 md:p-6">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-gold">
                {product.category}
              </span>
              <h3 className="mt-1 text-lg font-bold text-text-primary md:text-xl">
                {product.name}
              </h3>

              {/* Rating */}
              <div className="mt-2 flex items-center gap-1.5">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'h-3.5 w-3.5',
                        i < Math.round(product.rating)
                          ? 'fill-gold text-gold'
                          : 'fill-none text-text-tertiary',
                      )}
                    />
                  ))}
                </div>
                <span className="text-xs text-text-secondary">
                  ({product.reviewCount})
                </span>
              </div>

              {/* Price */}
              <div className="mt-3">
                {hasDiscount && (
                  <span className="text-sm text-text-tertiary line-through">
                    {formatPrice(product.originalPrice!)}
                  </span>
                )}
                <p className="font-heading text-2xl font-bold text-gold">
                  {formatPrice(product.price)}
                </p>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-text-secondary line-clamp-3">
                {product.description}
              </p>

              {/* Quantity + Add to Cart */}
              <div className="mt-6 flex items-center gap-3">
                <div className="flex items-center rounded-lg border border-border-dark">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="flex h-10 w-10 items-center justify-center text-text-secondary hover:text-text-primary"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center text-sm font-semibold text-text-primary">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="flex h-10 w-10 items-center justify-center text-text-secondary hover:text-text-primary"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <button
                  onClick={handleAdd}
                  disabled={isUnavailable}
                  className={cn(
                    'flex h-10 flex-1 items-center justify-center gap-2 rounded-lg text-sm font-bold transition-all',
                    isAdded
                      ? 'bg-success/20 text-success'
                      : isUnavailable
                        ? 'cursor-not-allowed bg-bg-surface text-text-tertiary'
                        : 'bg-gold text-bg-primary hover:bg-gold-light active:scale-[0.98]',
                  )}
                >
                  {isAdded ? (
                    <>
                      <Check className="h-4 w-4 animate-check-pop" />
                      Added
                    </>
                  ) : isUnavailable ? (
                    'Sold Out'
                  ) : (
                    <>
                      <ShoppingBag className="h-4 w-4" />
                      Add to Cart
                    </>
                  )}
                </button>

                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-colors',
                    wishlisted
                      ? 'border-gold/40 bg-gold/10 text-gold'
                      : 'border-border-dark text-text-secondary hover:border-gold hover:text-gold',
                  )}
                  aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart className={cn('h-4 w-4', wishlisted && 'fill-gold')} />
                </button>
              </div>

              {/* View full details link */}
              <a
                href={`/shop/${product.slug}`}
                className="mt-4 text-center text-xs font-medium text-text-secondary transition-colors hover:text-gold"
              >
                View Full Details
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
