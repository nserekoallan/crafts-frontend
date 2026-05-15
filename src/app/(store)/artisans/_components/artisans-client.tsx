'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ArtisanCard {
  id: string;
  businessName: string;
  region: string | null;
  bio: string | null;
  storyStatus: string;
  adminRating: number | null;
  _count: { products: number };
  user: { profile: { avatar: string | null } | null } | null;
}

interface ArtisansResponse {
  data: ArtisanCard[];
  meta: { total: number; page: number; limit: number };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

function StarRating({ rating }: { rating: number }) {
  const filled = Math.round(rating);
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            'h-3 w-3',
            i < filled ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-border-dark',
          )}
        />
      ))}
      <span className="ml-1 text-xs text-text-secondary">{rating.toFixed(1)}</span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function ArtisanCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-border-dark bg-bg-surface p-5">
      <div className="flex flex-col items-center text-center">
        <div className="h-16 w-16 rounded-full bg-bg-elevated" />
        <div className="mt-3 h-4 w-3/4 rounded bg-bg-elevated" />
        <div className="mt-2 h-3 w-1/2 rounded bg-bg-elevated" />
        <div className="mt-3 h-3 w-full rounded bg-bg-elevated" />
        <div className="mt-1 h-3 w-5/6 rounded bg-bg-elevated" />
        <div className="mt-4 h-3 w-1/3 rounded bg-bg-elevated" />
      </div>
    </div>
  );
}

function ArtisanGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <ArtisanCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------

function ArtisanCardItem({ artisan }: { artisan: ArtisanCard }) {
  const avatar = artisan.user?.profile?.avatar;
  const initials = getInitials(artisan.businessName);
  const bioSnippet =
    artisan.storyStatus === 'APPROVED' && artisan.bio
      ? artisan.bio.slice(0, 80) + (artisan.bio.length > 80 ? '…' : '')
      : null;

  return (
    <Link
      href={`/artisans/${artisan.id}`}
      className="group flex flex-col items-center rounded-2xl border border-border-dark bg-bg-surface p-5 text-center transition-colors hover:border-gold/40 hover:bg-bg-elevated"
    >
      {/* Avatar */}
      {avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatar}
          alt={artisan.businessName}
          className="h-16 w-16 rounded-full object-cover ring-2 ring-gold/20"
        />
      ) : (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold text-lg font-bold text-bg-primary ring-2 ring-gold/20">
          {initials}
        </div>
      )}

      {/* Business name */}
      <p className="mt-3 font-semibold text-text-primary group-hover:text-gold transition-colors">
        {artisan.businessName}
      </p>

      {/* Region badge */}
      {artisan.region && (
        <span className="mt-1.5 inline-block rounded-full bg-bg-elevated px-2.5 py-0.5 text-xs font-medium text-text-secondary border border-border-dark">
          {artisan.region}
        </span>
      )}

      {/* Rating */}
      {artisan.adminRating != null && artisan.adminRating > 0 && (
        <div className="mt-2 flex justify-center">
          <StarRating rating={artisan.adminRating} />
        </div>
      )}

      {/* Bio snippet */}
      {bioSnippet && (
        <p className="mt-2 text-xs text-text-tertiary leading-relaxed">{bioSnippet}</p>
      )}

      {/* Product count */}
      <p className="mt-3 text-xs font-medium text-text-secondary">
        {artisan._count.products} {artisan._count.products === 1 ? 'product' : 'products'}
      </p>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Page client
// ---------------------------------------------------------------------------

export function ArtisansClient() {
  const [searchInput, setSearchInput] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');

  const debouncedSearch = useDebounce(searchInput, 300);

  const { data, isLoading, isError } = useQuery<ArtisansResponse>({
    queryKey: ['artisans', 'public', debouncedSearch, selectedRegion],
    queryFn: () => {
      const params = new URLSearchParams({ limit: '80' });
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (selectedRegion) params.set('region', selectedRegion);
      return api.get<ArtisansResponse>(`/artisans?${params.toString()}`);
    },
    staleTime: 5 * 60 * 1000,
  });

  const artisans = data?.data ?? [];

  // Derive unique regions from the full unfiltered list for the dropdown.
  // We fetch with the region filter applied on the server, but populate the
  // dropdown from whatever regions appear in the current result set plus any
  // we've already seen. Simple approach: fetch once without filters for the
  // dropdown population.
  const { data: allData } = useQuery<ArtisansResponse>({
    queryKey: ['artisans', 'public', '', ''],
    queryFn: () => api.get<ArtisansResponse>('/artisans?limit=200'),
    staleTime: 10 * 60 * 1000,
  });

  const regions = useMemo(() => {
    const all = allData?.data ?? [];
    const set = new Set(all.map((a) => a.region).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [allData]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="font-heading text-3xl font-bold text-text-primary md:text-4xl">
          Meet Our Artisans
        </h1>
        <p className="mt-2 text-text-secondary">
          Discover the skilled craftspeople behind every piece
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search artisans…"
            className="w-full rounded-lg border border-border-dark bg-bg-surface pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
          />
        </div>

        {/* Region dropdown */}
        <select
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          aria-label="Filter by region"
          className="h-[42px] rounded-lg border border-border-dark bg-bg-surface px-3.5 text-sm text-text-primary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 sm:w-48"
        >
          <option value="">All regions</option>
          {regions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {isLoading ? (
        <ArtisanGridSkeleton />
      ) : isError ? (
        <div className="py-20 text-center text-text-secondary">
          Failed to load artisans. Please try again.
        </div>
      ) : artisans.length === 0 ? (
        <div className="py-20 text-center text-text-secondary">No artisans found.</div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
          {artisans.map((artisan) => (
            <ArtisanCardItem key={artisan.id} artisan={artisan} />
          ))}
        </div>
      )}
    </div>
  );
}
