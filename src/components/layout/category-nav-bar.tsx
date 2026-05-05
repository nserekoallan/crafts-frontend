'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Home, Sparkles, Recycle, Scissors, Tag } from 'lucide-react';
import { useCategories } from '@/hooks/use-categories';
import { cn } from '@/lib/utils';

/** Map category slugs (from seed `icon` field) to Lucide icons. */
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  home: Home,
  sparkles: Sparkles,
  recycle: Recycle,
  scissors: Scissors,
};

/**
 * Horizontal category strip with icons and gold underline on active/hover.
 * Desktop only — hidden on mobile.
 */
export function CategoryNavBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategoryId = searchParams.get('categoryId');

  const { categories } = useCategories();

  return (
    <nav className="hidden border-b border-border-dark bg-bg-primary md:block">
      <div className="mx-auto flex h-11 max-w-7xl items-center justify-center gap-8 px-4 lg:px-8">
        {categories.map((cat) => {
          const isActive = pathname === '/shop' && activeCategoryId === cat.id;
          const Icon = CATEGORY_ICONS[cat.icon] ?? Tag;

          return (
            <Link
              key={cat.id}
              href={`/shop?categoryId=${cat.id}`}
              className={cn(
                'group relative flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest transition-colors',
                isActive
                  ? 'text-gold'
                  : 'text-text-secondary hover:text-gold',
              )}
            >
              <Icon className="h-3.5 w-3.5" />
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
