'use client';

import { useState } from 'react';
import { DenseProductCard } from '@/components/products/dense-product-card';
import { PRODUCTS, CATEGORY_FILTERS } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
] as const;

const PAGE_SIZE = 12;

/**
 * Dark-themed shop page with category filter pills, sorting, and product grid.
 */
export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = PRODUCTS.filter((p) => {
    if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'newest') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
    return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
  });

  const visible = sorted.slice(0, visibleCount);
  const hasMore = visibleCount < sorted.length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-text-primary md:text-3xl">Shop</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Showing {visible.length} of {sorted.length} pieces
          </p>
        </div>

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

      {/* Category filter pills */}
      <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
        {CATEGORY_FILTERS.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat);
              setVisibleCount(PAGE_SIZE);
            }}
            className={cn(
              'shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-colors',
              selectedCategory === cat
                ? 'bg-gold text-bg-primary'
                : 'border border-border-dark bg-bg-surface text-text-secondary hover:border-gold/40 hover:text-gold',
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {visible.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-lg text-text-secondary">No products found.</p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setVisibleCount(PAGE_SIZE);
            }}
            className="mt-4 rounded-lg border border-gold px-6 py-2 text-sm font-medium text-gold transition-colors hover:bg-gold hover:text-bg-primary"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
            {visible.map((product) => (
              <DenseProductCard key={product.id} product={product} />
            ))}
          </div>

          {hasMore && (
            <div className="mt-10 text-center">
              <button
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                className="inline-flex h-11 items-center rounded-lg border border-gold px-8 text-sm font-semibold text-gold transition-colors hover:bg-gold hover:text-bg-primary"
              >
                Load More
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
