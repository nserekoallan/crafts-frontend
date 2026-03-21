'use client';

import Link from 'next/link';
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '@/lib/cart';
import { useCurrency } from '@/lib/currency';
import { cn } from '@/lib/utils';

/**
 * Full cart page — dark themed, currency-aware, with quantity controls.
 */
export default function CartPage() {
  const { items, subtotal, removeItem, updateQuantity, clearCart } = useCart();
  const { formatPrice } = useCurrency();

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:py-8 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-text-primary md:text-3xl">
            Your Cart
          </h1>
          {items.length > 0 && (
            <p className="mt-1 text-sm text-text-secondary">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </p>
          )}
        </div>
        <Link
          href="/shop"
          className="flex items-center gap-1 text-sm font-medium text-text-secondary transition-colors hover:text-gold"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Continue Shopping</span>
        </Link>
      </div>

      {items.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-bg-surface md:h-20 md:w-20">
            <ShoppingBag className="h-8 w-8 text-text-tertiary md:h-10 md:w-10" />
          </div>
          <h2 className="mt-4 font-heading text-lg font-bold text-text-primary">
            Your cart is empty
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Discover beautiful handcrafted pieces from across Africa
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-flex h-11 items-center rounded-xl bg-gold px-8 text-sm font-bold text-bg-primary transition-colors hover:bg-gold-light active:scale-[0.98]"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3 md:mt-8 md:space-y-4">
          {/* Cart items */}
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-3 rounded-xl border border-border-dark bg-bg-elevated p-3 md:gap-4 md:p-4"
            >
              {/* Image */}
              <Link href={`/shop/${item.slug}`} className="shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-20 w-20 rounded-lg object-cover md:h-24 md:w-24"
                />
              </Link>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <Link href={`/shop/${item.slug}`}>
                  <h3 className="text-sm font-semibold text-text-primary line-clamp-1 hover:text-gold md:text-base">
                    {item.name}
                  </h3>
                </Link>
                <p className="text-[11px] uppercase tracking-wider text-gold">
                  {item.category}
                </p>
                <p className="mt-1 font-heading text-sm font-bold text-gold md:text-base">
                  {formatPrice(item.price)}
                </p>

                {/* Mobile: qty controls inline */}
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex items-center rounded-lg border border-border-dark">
                    <button
                      className="flex h-8 w-8 items-center justify-center text-text-secondary transition-colors hover:text-text-primary"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold text-text-primary">
                      {item.quantity}
                    </span>
                    <button
                      className="flex h-8 w-8 items-center justify-center text-text-secondary transition-colors hover:text-text-primary"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <button
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-text-tertiary transition-colors hover:bg-error/10 hover:text-error"
                    onClick={() => removeItem(item.id)}
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Line total — right side on desktop */}
              <div className="hidden shrink-0 text-right md:block">
                <p className="font-heading text-base font-bold text-text-primary">
                  {formatPrice(item.price * item.quantity)}
                </p>
                {item.quantity > 1 && (
                  <p className="text-xs text-text-tertiary">
                    {item.quantity} x {formatPrice(item.price)}
                  </p>
                )}
              </div>
            </div>
          ))}

          {/* Summary */}
          <div className="rounded-xl border border-border-dark bg-bg-elevated p-5 md:p-6">
            <div className="flex items-center justify-between text-base md:text-lg">
              <span className="font-medium text-text-secondary">Subtotal</span>
              <span className="animate-count-up font-heading font-bold text-gold" key={subtotal}>
                {formatPrice(subtotal)}
              </span>
            </div>
            <p className="mt-1 text-xs text-text-tertiary md:text-sm">
              Shipping and taxes calculated at checkout.
            </p>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <button className="flex h-12 flex-1 items-center justify-center rounded-xl bg-gold text-sm font-bold text-bg-primary transition-colors hover:bg-gold-light active:scale-[0.98]">
                Proceed to Checkout
              </button>
              <button
                onClick={clearCart}
                className="flex h-12 items-center justify-center rounded-xl border border-border-dark px-6 text-sm font-medium text-text-secondary transition-colors hover:border-error/40 hover:text-error sm:w-auto"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
