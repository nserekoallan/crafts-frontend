'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { CATEGORIES } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

/**
 * Horizontal category strip with gold underline on active/hover.
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

          return (
            <Link
              key={cat.slug}
              href={`/shop?category=${encodeURIComponent(cat.name)}`}
              className={cn(
                'relative text-xs font-semibold uppercase tracking-widest transition-colors',
                isActive
                  ? 'text-gold'
                  : 'text-text-secondary hover:text-gold',
              )}
            >
              {cat.name}
              {isActive && (
                <span className="absolute -bottom-[13px] left-0 right-0 h-0.5 bg-gold" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
