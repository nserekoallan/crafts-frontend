'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { COLLECTIONS } from '@/lib/mock-data';

/**
 * Horizontal scrollable strip of themed collection cards on the homepage.
 */
export function CollectionsStrip() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gold md:text-sm">
          Explore Collections
        </h2>
        <Link
          href="/collections"
          className="flex items-center gap-1 text-xs font-medium text-text-secondary transition-colors hover:text-gold"
        >
          View All <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="scrollbar-hide mt-5 flex gap-3 overflow-x-auto pb-2 md:gap-4">
        {COLLECTIONS.map((collection) => (
          <Link
            key={collection.id}
            href={`/collections?collection=${collection.slug}`}
            className="group relative w-40 shrink-0 overflow-hidden rounded-xl border border-border-dark md:w-56"
          >
            {/* Image */}
            <div className="aspect-[4/5] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={collection.imageUrl}
                alt={collection.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/80 via-bg-primary/20 to-transparent" />
            </div>

            {/* Info overlay */}
            <div className="absolute inset-x-0 bottom-0 p-3 md:p-4">
              <h3 className="font-heading text-sm font-bold text-text-primary md:text-base">
                {collection.title}
              </h3>
              <p className="mt-0.5 text-[11px] text-text-secondary">
                {collection.itemCount} pieces
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
