'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useCart } from '@/lib/cart';
import { useCurrency } from '@/lib/currency';
import { cn } from '@/lib/utils';

/**
 * Slide-out cart drawer from the right.
 * Full-width bottom sheet on mobile, side panel on desktop.
 */
export function CartDrawer() {
  const { items, itemCount, subtotal, isDrawerOpen, setDrawerOpen, removeItem, updateQuantity } =
    useCart();
  const { formatPrice } = useCurrency();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Focus trap + escape to close
  useEffect(() => {
    if (!isDrawerOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen, setDrawerOpen]);

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-[70]">
      {/* Backdrop */}
      <div
        className="animate-fade-in absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer panel — bottom sheet on mobile, right panel on desktop */}
      <div
        ref={drawerRef}
        className={cn(
          'absolute bg-bg-elevated shadow-2xl',
          // Mobile: bottom sheet
          'inset-x-0 bottom-0 max-h-[85vh] rounded-t-2xl animate-sheet-up',
          // Desktop: right side panel
          'md:inset-y-0 md:right-0 md:left-auto md:w-[420px] md:max-h-none md:rounded-t-none md:rounded-l-2xl md:animate-drawer-in',
        )}
        role="dialog"
        aria-label="Shopping cart"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-dark px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-gold" />
            <h2 className="font-heading text-lg font-bold text-text-primary">
              Your Cart
            </h2>
            {itemCount > 0 && (
              <span className="rounded-full bg-gold px-2 py-0.5 text-[11px] font-bold text-bg-primary">
                {itemCount}
              </span>
            )}
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-bg-surface hover:text-text-primary"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mobile drag handle */}
        <div className="flex justify-center py-1 md:hidden">
          <div className="h-1 w-10 rounded-full bg-text-tertiary/30" />
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4" style={{ maxHeight: 'calc(85vh - 180px)' }}>
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingBag className="h-12 w-12 text-text-tertiary" />
              <p className="mt-3 text-sm font-medium text-text-secondary">
                Your cart is empty
              </p>
              <button
                onClick={() => setDrawerOpen(false)}
                className="mt-4 rounded-lg border border-gold px-6 py-2 text-sm font-semibold text-gold transition-colors hover:bg-gold hover:text-bg-primary"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="animate-grid-item flex gap-3 rounded-xl border border-border-dark bg-bg-surface p-3"
                >
                  {/* Thumbnail */}
                  <Link href={`/shop/${item.slug}`} onClick={() => setDrawerOpen(false)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-16 w-16 shrink-0 rounded-lg object-cover md:h-20 md:w-20"
                    />
                  </Link>

                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/shop/${item.slug}`}
                      onClick={() => setDrawerOpen(false)}
                      className="text-sm font-semibold text-text-primary line-clamp-1 hover:text-gold"
                    >
                      {item.name}
                    </Link>
                    <p className="text-[11px] text-text-tertiary">{item.category}</p>
                    <p className="mt-1 text-sm font-bold text-gold">
                      {formatPrice(item.price)}
                    </p>

                    {/* Qty controls */}
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex items-center rounded-lg border border-border-dark">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="flex h-7 w-7 items-center justify-center text-text-secondary transition-colors hover:text-text-primary"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-7 text-center text-xs font-semibold text-text-primary">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="flex h-7 w-7 items-center justify-center text-text-secondary transition-colors hover:text-text-primary"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-text-tertiary transition-colors hover:bg-error/10 hover:text-error"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Line total */}
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-text-primary">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer — subtotal + checkout */}
        {items.length > 0 && (
          <div className="border-t border-border-dark px-5 py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Subtotal</span>
              <span className="animate-count-up font-heading text-lg font-bold text-gold" key={subtotal}>
                {formatPrice(subtotal)}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-text-tertiary">
              Shipping calculated at checkout
            </p>

            <Link
              href="/cart"
              onClick={() => setDrawerOpen(false)}
              className="mt-3 flex h-12 w-full items-center justify-center rounded-xl bg-gold text-sm font-bold text-bg-primary transition-colors hover:bg-gold-light active:scale-[0.98]"
            >
              View Cart & Checkout
            </Link>

            <button
              onClick={() => setDrawerOpen(false)}
              className="mt-2 w-full py-2 text-center text-xs font-medium text-text-secondary transition-colors hover:text-gold"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
