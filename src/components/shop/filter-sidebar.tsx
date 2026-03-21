'use client';

import { ChevronDown, Star } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { CATEGORIES } from '@/lib/mock-data';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ShopFilters {
  categories: string[];
  priceRange: string;
  regions: string[];
  minRating: number;
  hideOutOfStock: boolean;
}

export const DEFAULT_FILTERS: ShopFilters = {
  categories: [],
  priceRange: 'all',
  regions: [],
  minRating: 0,
  hideOutOfStock: false,
};

interface FilterSidebarProps {
  filters: ShopFilters;
  onChange: (filters: ShopFilters) => void;
}

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

const RATING_OPTIONS = [4, 3, 2];

// ---------------------------------------------------------------------------
// Collapsible Section
// ---------------------------------------------------------------------------

function FilterSection({
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
            'h-4 w-4 text-text-tertiary transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>
      {open && <div className="mt-3 space-y-2">{children}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Desktop collapsible filter sidebar for the shop page.
 */
export function FilterSidebar({ filters, onChange }: FilterSidebarProps) {
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
    <aside className="hidden w-60 shrink-0 md:block">
      <h3 className="text-xs font-bold uppercase tracking-widest text-gold">Filters</h3>

      {/* Category */}
      <FilterSection title="Category">
        {CATEGORIES.map((cat) => (
          <label key={cat.slug} className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={filters.categories.includes(cat.name)}
              onChange={() => toggleCategory(cat.name)}
              className="h-4 w-4 rounded border-border-dark bg-bg-surface text-gold accent-gold focus:ring-gold/20"
            />
            <span className="text-sm text-text-secondary">{cat.name}</span>
            <span className="ml-auto text-[11px] text-text-tertiary">{cat.itemCount}</span>
          </label>
        ))}
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Price Range">
        {PRICE_TIERS.map((tier) => (
          <label key={tier.value} className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="price"
              checked={filters.priceRange === tier.value}
              onChange={() => onChange({ ...filters, priceRange: tier.value })}
              className="h-4 w-4 border-border-dark bg-bg-surface text-gold accent-gold focus:ring-gold/20"
            />
            <span className="text-sm text-text-secondary">{tier.label}</span>
          </label>
        ))}
      </FilterSection>

      {/* Origin */}
      <FilterSection title="Origin">
        {REGIONS.map((region) => (
          <label key={region} className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={filters.regions.includes(region)}
              onChange={() => toggleRegion(region)}
              className="h-4 w-4 rounded border-border-dark bg-bg-surface text-gold accent-gold focus:ring-gold/20"
            />
            <span className="text-sm text-text-secondary">{region}</span>
          </label>
        ))}
      </FilterSection>

      {/* Rating */}
      <FilterSection title="Rating" defaultOpen={false}>
        {RATING_OPTIONS.map((rating) => (
          <button
            key={rating}
            onClick={() =>
              onChange({ ...filters, minRating: filters.minRating === rating ? 0 : rating })
            }
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm transition-colors',
              filters.minRating === rating
                ? 'bg-gold/10 text-gold'
                : 'text-text-secondary hover:text-gold',
            )}
          >
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'h-3 w-3',
                    i < rating ? 'fill-gold text-gold' : 'fill-none text-text-tertiary',
                  )}
                />
              ))}
            </div>
            <span>& up</span>
          </button>
        ))}
      </FilterSection>

      {/* Availability */}
      <FilterSection title="Availability" defaultOpen={false}>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={filters.hideOutOfStock}
            onChange={() => onChange({ ...filters, hideOutOfStock: !filters.hideOutOfStock })}
            className="h-4 w-4 rounded border-border-dark bg-bg-surface text-gold accent-gold focus:ring-gold/20"
          />
          <span className="text-sm text-text-secondary">Hide sold-out items</span>
        </label>
      </FilterSection>
    </aside>
  );
}
