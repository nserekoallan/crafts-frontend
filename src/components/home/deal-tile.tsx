import Link from 'next/link';
import type { DealZone } from '@/lib/mock-data';

interface DealTileProps {
  deal: DealZone;
}

/**
 * Deal zone tile with product image background, dark gradient overlay, and gold text.
 */
export function DealTile({ deal }: DealTileProps) {
  return (
    <Link
      href={deal.href}
      className="group relative flex h-40 min-w-[200px] flex-1 overflow-hidden rounded-xl md:h-48"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={deal.imageUrl}
        alt=""
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/90 via-bg-primary/40 to-transparent" />
      <div className="relative flex h-full w-full flex-col justify-end p-4">
        <h3 className="text-sm font-bold text-gold md:text-base">{deal.title}</h3>
        <p className="mt-0.5 text-xs text-text-secondary">{deal.itemCount} pieces</p>
      </div>
    </Link>
  );
}
