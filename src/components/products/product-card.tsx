'use client';

import { Heart, Plus } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  currency?: string;
  imageUrl: string;
  artisanName: string;
  region: string;
}

/**
 * Product card displaying image, artisan info, price and quick-add action.
 */
export function ProductCard({
  name,
  slug,
  price,
  currency = 'USD',
  imageUrl,
  artisanName,
  region,
}: ProductCardProps) {
  return (
    <div className="group overflow-hidden rounded-xl border border-light-gray bg-white transition-shadow hover:shadow-md">
      {/* Image */}
      <a href={`/shop/${slug}`} className="relative block aspect-square overflow-hidden bg-light-gray">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <button
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-charcoal backdrop-blur-sm transition-colors hover:bg-white hover:text-red-500"
          aria-label="Add to wishlist"
        >
          <Heart className="h-4 w-4" />
        </button>
        <span className="absolute left-3 top-3 rounded-full bg-hunter-green/90 px-2.5 py-0.5 text-[11px] font-semibold text-white">
          {region}
        </span>
      </a>

      {/* Info */}
      <div className="p-4">
        <a href={`/shop/${slug}`}>
          <h3 className="text-sm font-semibold text-charcoal line-clamp-1">{name}</h3>
        </a>
        <p className="mt-0.5 text-xs text-medium-gray">by {artisanName}</p>

        <div className="mt-3 flex items-center justify-between">
          <span className="font-heading text-base font-bold text-hunter-green">
            {formatPrice(price, currency)}
          </span>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-full bg-satin-gold text-white transition-colors hover:bg-satin-gold-dark"
            aria-label="Add to cart"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
