'use client';

import { useEffect } from 'react';
import { ChevronDown, Star, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { CATEGORIES } from '@/lib/mock-data';
import type { ShopFilters } from '@/components/shop/filter-sidebar';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PRICE_TIERS = [
  { value: 'all', label: 'All Prices' },
  { value: 'under-100k', label: 'Under 100K' },
  { value: '100k-300k', label: '100K \u2013 300K' },
  { value: '300k-500k', label: '300K \u2013 500K' },
  { value: '500k-plus', label: '500K+' },
];

const REGIONS = ['Uganda', 'Kenya'];

interface FilterBottomSheetProps {
  open: boolean;
  onClose: () => void;
  filters: ShopFilters;
  onChange: (filters: ShopFilters) => void;
  resultCount: number;
}

// ---------------------------------------------------------------------------
// Section
// ---------------------------------------------------------------------------

function Section({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border-dark py-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-sm font-semibold text-text-primary"
      >
        {title}
        <ChevronDown
          className={cn(
            'h-4 w-4 text-text-tertiary transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>
      {open && <div className="mt-3 space-y-3">{children}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Mobile filter bottom sheet with all shop filters.
 */
export function FilterBottomSheet({
  open,
  onClose,
  filters,
  onChange,
  resultCount,
}: FilterBottomSheetProps) {
  useEffect(() => {
    if (!open) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const toggleCategory = (cat: string) => {
    const next = filters.categories.includes(cat)
      ? filters.categories.filter((c) => c !== cat)
      : [...filters.categories, cat];
    onChange({ ...filters, categories: next });
  };

  const toggleRegion = (region: string) => {
    const next = filters.regions.includes(region)
      ? filters.regions.filter((r) => r !== region)
      : [...filters.regions, region];
    onChange({ ...filters, regions: next });
  };

  return (
    <div className="fixed inset-0 z-[70] md:hidden">
      {/* Backdrop */}
      <div
        className="animate-fade-in absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div className="animate-sheet-up absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-bg-elevated">
        {/* Handle */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border-dark bg-bg-elevated px-5 py-4">
          <div className="flex items-center gap-2">
            <h3 className="font-heading text-lg font-bold text-text-primary">Filters</h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary hover:bg-bg-surface"
            aria-label="Close filters"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 pb-32">
          {/* Category */}
          <Section title="Category">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => toggleCategory(cat.name)}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
                    filters.categories.includes(cat.name)
                      ? 'bg-gold text-bg-primary'
                      : 'border border-border-dark bg-bg-surface text-text-secondary',
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </Section>

          {/* Price */}
          <Section title="Price Range">
            <div className="flex flex-wrap gap-2">
              {PRICE_TIERS.map((tier) => (
                <button
                  key={tier.value}
                  onClick={() => onChange({ ...filters, priceRange: tier.value })}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
                    filters.priceRange === tier.value
                      ? 'bg-gold text-bg-primary'
                      : 'border border-border-dark bg-bg-surface text-text-secondary',
                  )}
                >
                  {tier.label}
                </button>
              ))}
            </div>
          </Section>

          {/* Origin */}
          <Section title="Origin">
            <div className="flex flex-wrap gap-2">
              {REGIONS.map((region) => (
                <button
                  key={region}
                  onClick={() => toggleRegion(region)}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
                    filters.regions.includes(region)
                      ? 'bg-gold text-bg-primary'
                      : 'border border-border-dark bg-bg-surface text-text-secondary',
                  )}
                >
                  {region}
                </button>
              ))}
            </div>
          </Section>

          {/* Rating */}
          <Section title="Rating" defaultOpen={false}>
            <div className="flex flex-wrap gap-2">
              {[4, 3, 2].map((rating) => (
                <button
                  key={rating}
                  onClick={() =>
                    onChange({ ...filters, minRating: filters.minRating === rating ? 0 : rating })
                  }
                  className={cn(
                    'flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
                    filters.minRating === rating
                      ? 'bg-gold text-bg-primary'
                      : 'border border-border-dark bg-bg-surface text-text-secondary',
                  )}
                >
                  <Star className="h-3 w-3 fill-current" />
                  {rating}+
                </button>
              ))}
            </div>
          </Section>

          {/* Availability */}
          <Section title="Availability" defaultOpen={false}>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={filters.hideOutOfStock}
                onChange={() => onChange({ ...filters, hideOutOfStock: !filters.hideOutOfStock })}
                className="h-4 w-4 rounded border-border-dark bg-bg-surface text-gold accent-gold"
              />
              <span className="text-sm text-text-secondary">Hide sold-out items</span>
            </label>
          </Section>
        </div>

        {/* Sticky bottom CTA */}
        <div className="fixed inset-x-0 bottom-0 border-t border-border-dark bg-bg-elevated px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <button
            onClick={onClose}
            className="flex h-12 w-full items-center justify-center rounded-xl bg-gold text-sm font-bold text-bg-primary active:scale-[0.98]"
          >
            Show {resultCount} {resultCount === 1 ? 'piece' : 'pieces'}
          </button>
        </div>
      </div>
    </div>
  );
}
