'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { Search, ShoppingBag, User } from 'lucide-react';
import { CurrencyToggle } from '@/components/ui/currency-toggle';
import { AnnouncementBar } from '@/components/ui/announcement-bar';
import { CategoryNavBar } from '@/components/layout/category-nav-bar';

/**
 * Dark, premium site-wide header.
 * Announcement bar → Main header → Category strip (desktop).
 */
export function Header() {
  const cartCount = 3;

  return (
    <header className="sticky top-0 z-50">
      {/* Announcement bar */}
      <AnnouncementBar />

      {/* Main header */}
      <div className="border-b border-border-dark bg-bg-primary/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:h-[72px] lg:px-8">
          {/* Logo */}
          <Link href="/" className="shrink-0">
            <span className="font-heading text-lg font-bold uppercase tracking-[0.15em] text-gold md:text-xl">
              Crafts Continent
            </span>
          </Link>

          {/* Search — desktop */}
          <div className="relative hidden flex-1 md:block md:max-w-[50%]">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search crafts, artisans..."
              className="h-10 w-full rounded-full border border-border-dark bg-bg-surface pl-10 pr-4 text-sm text-text-primary placeholder:text-text-tertiary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
            />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <CurrencyToggle />

            <Link href="/cart" className="relative p-2 text-text-secondary transition-colors hover:text-gold">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-bg-primary">
                  {cartCount}
                </span>
              )}
            </Link>

            <Link href="/login" className="p-2 text-text-secondary transition-colors hover:text-gold">
              <User className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* Search — mobile (below main row) */}
        <div className="border-t border-border-dark px-4 py-2 md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search crafts, artisans..."
              className="h-9 w-full rounded-full border border-border-dark bg-bg-surface pl-9 pr-4 text-sm text-text-primary placeholder:text-text-tertiary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
            />
          </div>
        </div>
      </div>

      {/* Category nav strip — desktop */}
      <Suspense>
        <CategoryNavBar />
      </Suspense>
    </header>
  );
}
