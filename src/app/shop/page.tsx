'use client';

import { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, Search, SlidersHorizontal, X } from 'lucide-react';
import { DenseProductCard } from '@/components/products/dense-product-card';
import { FilterSidebar, DEFAULT_FILTERS } from '@/components/shop/filter-sidebar';
import { FilterBottomSheet } from '@/components/shop/filter-bottom-sheet';
import { ActiveFilters } from '@/components/shop/active-filters';
import { useProducts } from '@/hooks/use-products';
import { cn } from '@/lib/utils';
import type { ShopFilters } from '@/components/shop/filter-sidebar';

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
] as const;

const PAGE_SIZE = 12;

// ---------------------------------------------------------------------------
// Price helpers
// ---------------------------------------------------------------------------

/**
 * Parse price range filter to min/max values for the API.
 */
function parsePriceRange(range: string): { min: number | undefined; max: number | undefined } {
  switch (range) {
    case 'under-100k': return { min: 0, max: 100_000 };
    case '100k-300k': return { min: 100_000, max: 300_000 };
    case '300k-500k': return { min: 300_000, max: 500_000 };
    case '500k-plus': return { min: 500_000, max: undefined };
    default: return { min: undefined, max: undefined };
  }
}

/**
 * Check if any filters are active.
 */
function hasActiveFilters(filters: ShopFilters): boolean {
  return (
    filters.categories.length > 0 ||
    filters.priceRange !== 'all' ||
    filters.regions.length > 0 ||
    filters.minRating > 0 ||
    filters.hideOutOfStock
  );
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

/**
 * Skeleton card matching DenseProductCard layout to prevent CLS.
 */
function ProductCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border border-border-dark bg-bg-surface">
      <div className="aspect-[3/4] bg-bg-elevated" />
      <div className="space-y-2 p-3">
        <div className="h-3 w-3/4 rounded bg-bg-elevated" />
        <div className="h-3 w-1/2 rounded bg-bg-elevated" />
        <div className="h-4 w-1/3 rounded bg-bg-elevated" />
        <div className="mt-2 h-9 w-full rounded-lg bg-bg-elevated" />
      </div>
    </div>
  );
}

/**
 * Grid of skeleton cards shown while loading.
 */
function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inner page component (needs useSearchParams)
// ---------------------------------------------------------------------------

function ShopPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const searchTerm = searchParams.get('search') ?? '';
  const urlPage = Number(searchParams.get('page')) || 1;

  const [filters, setFilters] = useState<ShopFilters>(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState('featured');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Build API params from URL + filter state
  const { min: minPrice, max: maxPrice } = parsePriceRange(filters.priceRange);

  const { products, total, totalPages, isLoading, isError, error } = useProducts({
    search: searchTerm || undefined,
    region: filters.regions.length === 1 ? filters.regions[0] : undefined,
    minPrice,
    maxPrice,
    page: urlPage,
    limit: PAGE_SIZE,
  });

  // Client-side post-filters (category name, rating, availability — not in API)
  const postFiltered = useMemo(() => {
    return products.filter((p) => {
      if (filters.categories.length > 0 && !filters.categories.includes(p.category)) return false;
      if (filters.minRating > 0 && p.rating < filters.minRating) return false;
      if (filters.hideOutOfStock && p.stockStatus === 'out_of_stock') return false;
      return true;
    });
  }, [products, filters]);

  // Client-side sort (API doesn't support all sort fields yet)
  const sorted = useMemo(() => {
    return [...postFiltered].sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'newest') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      if (sortBy === 'rating') return b.rating - a.rating;
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [postFiltered, sortBy]);

  /**
   * Clears the search param from the URL.
   */
  const clearSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('search');
    params.delete('page');
    router.push(`/shop${params.toString() ? `?${params.toString()}` : ''}`);
  };

  /**
   * Navigates to a specific page.
   */
  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page > 1) {
      params.set('page', String(page));
    } else {
      params.delete('page');
    }
    router.push(`/shop?${params.toString()}`);
  };

  const handleFilterChange = (newFilters: ShopFilters) => {
    setFilters(newFilters);
  };

  const activeFilterCount =
    filters.categories.length +
    (filters.priceRange !== 'all' ? 1 : 0) +
    filters.regions.length +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.hideOutOfStock ? 1 : 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-8 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-text-primary md:text-3xl">
            Shop
          </h1>
          {!isLoading && (
            <p className="mt-0.5 text-sm text-text-secondary">
              {total} handcrafted {total === 1 ? 'piece' : 'pieces'}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile filter button */}
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className={cn(
              'flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors md:hidden',
              activeFilterCount > 0
                ? 'border-gold/40 bg-gold-muted text-gold'
                : 'border-border-dark bg-bg-surface text-text-secondary',
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-bg-primary">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-9 rounded-lg border border-border-dark bg-bg-surface px-3 text-sm text-text-primary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Search pill */}
      {searchTerm && (
        <div className="mt-4 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold-muted px-3 py-1 text-xs font-semibold text-gold">
            <Search className="h-3 w-3" />
            Results for &ldquo;{searchTerm}&rdquo;
            <button
              onClick={clearSearch}
              className="ml-0.5 text-gold/70 transition-colors hover:text-gold"
              aria-label="Clear search"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        </div>
      )}

      {/* Active filter pills */}
      {hasActiveFilters(filters) && (
        <div className="mt-4">
          <ActiveFilters filters={filters} onChange={handleFilterChange} />
        </div>
      )}

      {/* Layout: sidebar + grid */}
      <div className="mt-6 flex gap-8">
        {/* Desktop sidebar */}
        <FilterSidebar filters={filters} onChange={handleFilterChange} />

        {/* Product grid */}
        <div className="flex-1">
          {isLoading ? (
            <ProductGridSkeleton />
          ) : isError ? (
            <div className="flex flex-col items-center py-16 text-center">
              <AlertCircle className="mb-3 h-10 w-10 text-text-tertiary" />
              <p className="text-lg text-text-secondary">Something went wrong</p>
              <p className="mt-1 text-sm text-text-tertiary">
                {error?.message ?? 'Failed to load products. Please try again.'}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 rounded-lg border border-gold px-6 py-2 text-sm font-medium text-gold transition-colors hover:bg-gold hover:text-bg-primary"
              >
                Try Again
              </button>
            </div>
          ) : sorted.length === 0 && searchTerm ? (
            <div className="flex flex-col items-center py-16 text-center">
              <Search className="mb-3 h-10 w-10 text-text-tertiary" />
              <p className="text-lg text-text-secondary">
                No results for &ldquo;{searchTerm}&rdquo;
              </p>
              <p className="mt-1 text-sm text-text-tertiary">
                Try different keywords or browse all products
              </p>
              <button
                onClick={clearSearch}
                className="mt-4 rounded-lg border border-gold px-6 py-2 text-sm font-medium text-gold transition-colors hover:bg-gold hover:text-bg-primary"
              >
                Browse All
              </button>
            </div>
          ) : sorted.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <p className="text-lg text-text-secondary">No pieces match your filters.</p>
              <button
                onClick={() => handleFilterChange(DEFAULT_FILTERS)}
                className="mt-4 rounded-lg border border-gold px-6 py-2 text-sm font-medium text-gold transition-colors hover:bg-gold hover:text-bg-primary"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
                {sorted.map((product, i) => (
                  <DenseProductCard
                    key={product.id}
                    product={product}
                    animationDelay={i * 40}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2 md:mt-10">
                  <button
                    disabled={urlPage <= 1}
                    onClick={() => goToPage(urlPage - 1)}
                    className="h-9 rounded-lg border border-border-dark px-4 text-sm font-medium text-text-secondary transition-colors hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span className="px-3 text-sm text-text-secondary">
                    Page {urlPage} of {totalPages}
                  </span>
                  <button
                    disabled={urlPage >= totalPages}
                    onClick={() => goToPage(urlPage + 1)}
                    className="h-9 rounded-lg border border-border-dark px-4 text-sm font-medium text-text-secondary transition-colors hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile filter bottom sheet */}
      <FilterBottomSheet
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        filters={filters}
        onChange={handleFilterChange}
        resultCount={sorted.length}
      />
    </div>
  );
}

/**
 * Shop page wrapped in Suspense for useSearchParams.
 */
export default function ShopPage() {
  return (
    <Suspense>
      <ShopPageInner />
    </Suspense>
  );
}
