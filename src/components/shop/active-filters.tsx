'use client';

import { X } from 'lucide-react';
import type { ShopFilters } from '@/components/shop/filter-sidebar';
import { DEFAULT_FILTERS } from '@/components/shop/filter-sidebar';

interface ActiveFiltersProps {
  filters: ShopFilters;
  onChange: (filters: ShopFilters) => void;
}

/**
 * Removable gold filter pills displayed above the product grid.
 */
export function ActiveFilters({ filters, onChange }: ActiveFiltersProps) {
  const pills: { label: string; onRemove: () => void }[] = [];

  for (const cat of filters.categories) {
    pills.push({
      label: cat,
      onRemove: () =>
        onChange({ ...filters, categories: filters.categories.filter((c) => c !== cat) }),
    });
  }

  if (filters.priceRange !== 'all') {
    const labels: Record<string, string> = {
      'under-100k': 'Under 100K',
      '100k-300k': '100K \u2013 300K',
      '300k-500k': '300K \u2013 500K',
      '500k-plus': '500K+',
    };
    pills.push({
      label: labels[filters.priceRange] ?? filters.priceRange,
      onRemove: () => onChange({ ...filters, priceRange: 'all' }),
    });
  }

  for (const region of filters.regions) {
    pills.push({
      label: region,
      onRemove: () =>
        onChange({ ...filters, regions: filters.regions.filter((r) => r !== region) }),
    });
  }

  if (filters.minRating > 0) {
    pills.push({
      label: `${filters.minRating}+ stars`,
      onRemove: () => onChange({ ...filters, minRating: 0 }),
    });
  }

  if (filters.hideOutOfStock) {
    pills.push({
      label: 'In stock only',
      onRemove: () => onChange({ ...filters, hideOutOfStock: false }),
    });
  }

  if (pills.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {pills.map((pill) => (
        <span
          key={pill.label}
          className="inline-flex items-center gap-1 rounded-full border border-gold/30 bg-gold-muted px-3 py-1 text-xs font-semibold text-gold"
        >
          {pill.label}
          <button
            onClick={pill.onRemove}
            className="ml-0.5 text-gold/70 transition-colors hover:text-gold"
            aria-label={`Remove ${pill.label} filter`}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}

      <button
        onClick={() => onChange(DEFAULT_FILTERS)}
        className="text-xs font-medium text-text-tertiary transition-colors hover:text-gold"
      >
        Clear All
      </button>
    </div>
  );
}
