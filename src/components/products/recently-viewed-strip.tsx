'use client';

import Link from 'next/link';
import { Clock } from 'lucide-react';
import { useRecentlyViewed } from '@/lib/recently-viewed';
import { useCurrency } from '@/lib/currency';

/**
 * Horizontal strip of recently viewed product thumbnails.
 * Shown on homepage (bottom) and product detail pages.
 */
export function RecentlyViewedStrip() {
  const { recentItems } = useRecentlyViewed();
  const { formatPrice } = useCurrency();

  if (recentItems.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <div className="flex items-center gap-2">
        <Clock className="h-3.5 w-3.5 text-text-tertiary" />
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-text-secondary md:text-sm">
          Recently Viewed
        </h2>
      </div>

      <div className="scrollbar-hide mt-4 flex gap-3 overflow-x-auto pb-2">
        {recentItems.map((item) => (
          <Link
            key={item.id}
            href={`/shop/${item.slug}`}
            className="group w-24 shrink-0 md:w-32"
          >
            <div className="aspect-square overflow-hidden rounded-lg border border-border-dark bg-bg-surface transition-colors group-hover:border-gold/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.imageUrl}
                alt={item.name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <p className="mt-1.5 text-[11px] font-medium text-text-primary line-clamp-1 md:text-xs">
              {item.name}
            </p>
            <p className="text-[10px] font-semibold text-gold md:text-[11px]">
              {formatPrice(item.price)}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
