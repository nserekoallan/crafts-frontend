'use client';

import { useMemo, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { DenseProductCard } from '@/components/products/dense-product-card';
import { FilterSidebar, DEFAULT_FILTERS } from '@/components/shop/filter-sidebar';
import { FilterBottomSheet } from '@/components/shop/filter-bottom-sheet';
import { ActiveFilters } from '@/components/shop/active-filters';
import { PRODUCTS } from '@/lib/mock-data';
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

/**
 * Parse price range filter to min/max UGX values.
 */
function parsePriceRange(range: string): { min: number; max: number } {
  switch (range) {
    case 'under-100k': return { min: 0, max: 100_000 };
    case '100k-300k': return { min: 100_000, max: 300_000 };
    case '300k-500k': return { min: 300_000, max: 500_000 };
    case '500k-plus': return { min: 500_000, max: Infinity };
    default: return { min: 0, max: Infinity };
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

/**
 * Dark-themed shop page with desktop sidebar filters, mobile bottom sheet,
 * active filter pills, sorting, and responsive product grid.
 */
export default function ShopPage() {
  const [filters, setFilters] = useState<ShopFilters>(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState('featured');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    const { min, max } = parsePriceRange(filters.priceRange);

    return PRODUCTS.filter((p) => {
      if (filters.categories.length > 0 && !filters.categories.includes(p.category)) return false;
      if (p.price < min || p.price > max) return false;
      if (filters.regions.length > 0 && !filters.regions.includes(p.region)) return false;
      if (filters.minRating > 0 && p.rating < filters.minRating) return false;
      if (filters.hideOutOfStock && p.stockStatus === 'out_of_stock') return false;
      return true;
    });
  }, [filters]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'newest') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      if (sortBy === 'rating') return b.rating - a.rating;
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [filtered, sortBy]);

  const visible = sorted.slice(0, visibleCount);
  const hasMore = visibleCount < sorted.length;

  const handleFilterChange = (newFilters: ShopFilters) => {
    setFilters(newFilters);
    setVisibleCount(PAGE_SIZE);
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
          <p className="mt-0.5 text-sm text-text-secondary">
            {sorted.length} handcrafted {sorted.length === 1 ? 'piece' : 'pieces'}
          </p>
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
          {visible.length === 0 ? (
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
                {visible.map((product, i) => (
                  <DenseProductCard
                    key={product.id}
                    product={product}
                    animationDelay={i * 40}
                  />
                ))}
              </div>

              {hasMore && (
                <div className="mt-8 text-center md:mt-10">
                  <button
                    onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                    className="inline-flex h-11 items-center rounded-lg border border-gold px-8 text-sm font-semibold text-gold transition-colors hover:bg-gold hover:text-bg-primary active:scale-[0.98]"
                  >
                    Load More
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
