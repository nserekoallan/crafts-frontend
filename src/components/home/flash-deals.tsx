'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Zap } from 'lucide-react';
import { DenseProductCard } from '@/components/products/dense-product-card';
import { PRODUCTS } from '@/lib/mock-data';

/** Products on sale (have originalPrice). */
const DEAL_PRODUCTS = PRODUCTS.filter(
  (p) => p.originalPrice && p.originalPrice > p.price,
);

/**
 * Returns time remaining until midnight (end of "deal").
 */
function getTimeRemaining(): { hours: number; minutes: number; seconds: number } {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(23, 59, 59, 999);
  const diff = Math.max(0, midnight.getTime() - now.getTime());
  return {
    hours: Math.floor(diff / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1_000),
  };
}

/**
 * Flash deals section with countdown timer and horizontal product scroll.
 */
export function FlashDeals() {
  const [time, setTime] = useState(getTimeRemaining);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getTimeRemaining());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (DEAL_PRODUCTS.length === 0) return null;

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      {/* Header with countdown */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-gold" />
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gold md:text-sm">
            Flash Deals
          </h2>
        </div>

        {/* Countdown */}
        <div className="flex items-center gap-1.5 text-sm">
          <span className="text-text-secondary">Ends in</span>
          <div className="flex items-center gap-1">
            <span className="inline-flex h-7 w-8 items-center justify-center rounded-md bg-bg-surface font-heading text-sm font-bold text-gold">
              {pad(time.hours)}
            </span>
            <span className="text-gold">:</span>
            <span className="inline-flex h-7 w-8 items-center justify-center rounded-md bg-bg-surface font-heading text-sm font-bold text-gold">
              {pad(time.minutes)}
            </span>
            <span className="text-gold">:</span>
            <span className="inline-flex h-7 w-8 items-center justify-center rounded-md bg-bg-surface font-heading text-sm font-bold text-gold">
              {pad(time.seconds)}
            </span>
          </div>
        </div>
      </div>

      {/* Horizontal scroll strip */}
      <div className="scrollbar-hide mt-5 flex gap-3 overflow-x-auto pb-2 md:gap-4">
        {DEAL_PRODUCTS.map((product) => (
          <div key={product.id} className="w-44 shrink-0 md:w-56">
            <DenseProductCard product={product} />
          </div>
        ))}

        {/* See All Deals link card */}
        <Link
          href="/shop?sale=true"
          className="flex w-44 shrink-0 flex-col items-center justify-center rounded-xl border border-border-dark bg-bg-elevated transition-colors hover:border-gold/40 md:w-56"
        >
          <ArrowRight className="h-6 w-6 text-gold" />
          <span className="mt-2 text-sm font-semibold text-gold">See All Deals</span>
        </Link>
      </div>
    </section>
  );
}
