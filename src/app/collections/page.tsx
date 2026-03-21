'use client';

import Link from 'next/link';
import { COLLECTIONS } from '@/lib/mock-data';

/**
 * Collections grid page — themed collection cards linking to filtered shop views.
 */
export default function CollectionsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-8 lg:px-8">
      <div className="text-center">
        <h1 className="font-heading text-2xl font-bold text-text-primary md:text-3xl">
          Our Collections
        </h1>
        <p className="mt-2 text-sm text-text-secondary md:text-base">
          Curated groups of handcrafted pieces for every occasion and space
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
        {COLLECTIONS.map((collection) => (
          <Link
            key={collection.id}
            href={`/shop?collection=${collection.slug}`}
            className="group relative overflow-hidden rounded-2xl border border-border-dark"
          >
            {/* Image */}
            <div className="aspect-[4/3] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={collection.imageUrl}
                alt={collection.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/80 via-bg-primary/30 to-transparent" />
            </div>

            {/* Info overlay */}
            <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
              <h2 className="font-heading text-lg font-bold text-text-primary md:text-xl">
                {collection.title}
              </h2>
              <p className="mt-1 text-sm text-text-secondary line-clamp-2">
                {collection.description}
              </p>
              <p className="mt-2 text-xs font-semibold text-gold">
                {collection.itemCount} pieces
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
