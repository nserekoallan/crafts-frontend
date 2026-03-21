'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Search, ShoppingBag, User, Heart } from 'lucide-react';
import { CurrencyToggle } from '@/components/ui/currency-toggle';
import { AnnouncementBar } from '@/components/ui/announcement-bar';
import { CategoryNavBar } from '@/components/layout/category-nav-bar';
import { useCart } from '@/lib/cart';
import { useWishlist } from '@/lib/wishlist';
import { cn } from '@/lib/utils';

/**
 * Dark, premium site-wide header.
 * Announcement bar -> Main header -> Category strip (desktop).
 */
export function Header() {
  const { itemCount, setDrawerOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const [badgeBounce, setBadgeBounce] = useState(false);
  const prevCount = useRef(itemCount);

  // Bounce badge when cart count changes
  useEffect(() => {
    if (itemCount !== prevCount.current && itemCount > 0) {
      setBadgeBounce(true);
      const timer = setTimeout(() => setBadgeBounce(false), 400);
      prevCount.current = itemCount;
      return () => clearTimeout(timer);
    }
    prevCount.current = itemCount;
  }, [itemCount]);

  return (
    <header className="sticky top-0 z-50">
      {/* Announcement bar */}
      <AnnouncementBar />

      {/* Main header */}
      <div className="border-b border-border-dark bg-bg-primary/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 md:h-[72px] md:gap-4 lg:px-8">
          {/* Logo */}
          <Link href="/" className="shrink-0">
            <span className="font-heading text-base font-bold uppercase tracking-[0.12em] text-gold md:text-xl md:tracking-[0.15em]">
              Crafts Continent
            </span>
          </Link>

          {/* Search — desktop */}
          <div className="relative hidden flex-1 md:block md:max-w-[50%]">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              placeholder="What are you looking for?"
              className="h-10 w-full rounded-full border border-border-dark bg-bg-surface pl-10 pr-4 text-sm text-text-primary placeholder:text-text-tertiary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
            />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1.5 md:gap-3">
            <CurrencyToggle />

            {/* Wishlist — desktop only */}
            <Link
              href="/wishlist"
              className="relative hidden p-2 text-text-secondary transition-colors hover:text-gold md:block"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-terracotta text-[10px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="relative p-2 text-text-secondary transition-colors hover:text-gold"
              aria-label="Open cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span
                  className={cn(
                    'absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-bg-primary',
                    badgeBounce && 'animate-cart-bounce',
                  )}
                >
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>

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
              placeholder="What are you looking for?"
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
