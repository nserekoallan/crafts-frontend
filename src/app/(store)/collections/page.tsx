'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Layers } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ApiCollection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  productCount: number;
}

interface CollectionsResponse {
  data: ApiCollection[];
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function CollectionSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="relative overflow-hidden rounded-2xl border border-border-dark"
        >
          <div className="aspect-[4/3] animate-pulse bg-bg-surface" />
          <div className="absolute inset-x-0 bottom-0 space-y-2 p-5">
            <div className="h-4 w-40 animate-pulse rounded bg-bg-surface" />
            <div className="h-3 w-full animate-pulse rounded bg-bg-surface" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

/**
 * Collections grid page — fetches active collections from the API.
 */
export default function CollectionsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['collections'],
    queryFn: () => api.get<CollectionsResponse>('/collections'),
    staleTime: 60_000,
  });

  const collections: ApiCollection[] = data?.data ?? [];

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

      <div className="mt-8">
        {/* Loading */}
        {isLoading && <CollectionSkeleton />}

        {/* Error */}
        {isError && (
          <div className="rounded-xl bg-red-500/10 p-4 text-center text-sm text-red-400">
            Failed to load collections. Please refresh the page.
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && collections.length === 0 && (
          <div className="flex flex-col items-center py-20 text-center">
            <Layers className="h-12 w-12 text-text-tertiary" />
            <h2 className="mt-4 font-heading text-lg font-bold text-text-primary">
              No collections yet
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              Check back soon — curated collections are coming.
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-flex h-11 items-center rounded-xl bg-gold px-8 text-sm font-bold text-bg-primary transition-colors hover:bg-gold-light"
            >
              Browse all products
            </Link>
          </div>
        )}

        {/* Collections grid */}
        {!isLoading && !isError && collections.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {collections.map((collection) => (
              <Link
                key={collection.id}
                href={`/collections/${collection.slug}`}
                className="group relative overflow-hidden rounded-2xl border border-border-dark"
              >
                {/* Image */}
                <div className="aspect-[4/3] overflow-hidden bg-bg-surface">
                  {collection.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={collection.image}
                      alt={collection.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Layers className="h-12 w-12 text-text-tertiary" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/80 via-bg-primary/30 to-transparent" />
                </div>

                {/* Info overlay */}
                <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                  <h2 className="font-heading text-lg font-bold text-text-primary md:text-xl">
                    {collection.name}
                  </h2>
                  {collection.description && (
                    <p className="mt-1 text-sm text-text-secondary line-clamp-2">
                      {collection.description}
                    </p>
                  )}
                  <p className="mt-2 text-xs font-semibold text-gold">
                    {collection.productCount}{' '}
                    {collection.productCount === 1 ? 'piece' : 'pieces'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
