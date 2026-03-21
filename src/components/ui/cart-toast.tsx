'use client';

import { useEffect } from 'react';
import { Check, ShoppingBag } from 'lucide-react';
import { useCart } from '@/lib/cart';
import { useCurrency } from '@/lib/currency';

/**
 * Fixed toast notification shown when an item is added to the cart.
 * Auto-dismisses after 3 seconds.
 */
export function CartToast() {
  const { showFeedback, lastAddedItem, dismissFeedback, setDrawerOpen } = useCart();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    if (!showFeedback) return;
    const timer = setTimeout(dismissFeedback, 3000);
    return () => clearTimeout(timer);
  }, [showFeedback, dismissFeedback]);

  if (!showFeedback || !lastAddedItem) return null;

  return (
    <div className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 md:bottom-6 md:left-auto md:right-6 md:translate-x-0">
      <div className="flex items-center gap-3 rounded-xl border border-border-dark bg-bg-elevated px-4 py-3 shadow-xl animate-slide-up-fade">
        {/* Thumbnail */}
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-bg-surface">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lastAddedItem.imageUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>

        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-sm font-medium text-text-primary">
            <Check className="h-4 w-4 text-success" />
            Added to cart
          </p>
          <p className="truncate text-xs text-text-secondary">
            {lastAddedItem.name} &middot; {formatPrice(lastAddedItem.price)}
          </p>
        </div>

        <button
          onClick={() => {
            dismissFeedback();
            setDrawerOpen(true);
          }}
          className="ml-2 shrink-0 rounded-lg bg-gold/10 px-3 py-1.5 text-xs font-semibold text-gold transition-colors hover:bg-gold/20"
        >
          <ShoppingBag className="mr-1 inline h-3.5 w-3.5" />
          View Cart
        </button>
      </div>
    </div>
  );
}
