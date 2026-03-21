'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Gem, Frame, ShoppingBasket, Shirt } from 'lucide-react';
import { CATEGORIES } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

/** Map category slugs to icons. */
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  'heritage-wall-art': Frame,
  'artisan-baskets': ShoppingBasket,
  'shell-bead-jewelry': Gem,
  'african-fashion': Shirt,
};

/**
 * Horizontal category strip with icons and gold underline on active/hover.
 * Desktop only — hidden on mobile.
 */
export function CategoryNavBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category');

  return (
    <nav className="hidden border-b border-border-dark bg-bg-primary md:block">
      <div className="mx-auto flex h-11 max-w-7xl items-center justify-center gap-8 px-4 lg:px-8">
        {CATEGORIES.map((cat) => {
          const isActive =
            pathname === '/shop' && activeCategory === cat.name;
          const Icon = CATEGORY_ICONS[cat.slug];

          return (
            <Link
              key={cat.slug}
              href={`/shop?category=${encodeURIComponent(cat.name)}`}
              className={cn(
                'group relative flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest transition-colors',
                isActive
                  ? 'text-gold'
                  : 'text-text-secondary hover:text-gold',
              )}
            >
              {Icon && <Icon className="h-3.5 w-3.5" />}
              {cat.name}
              {/* Gold underline — active or on hover */}
              <span
                className={cn(
                  'absolute -bottom-[13px] left-0 right-0 h-0.5 origin-left bg-gold transition-transform duration-200',
                  isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
                )}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
