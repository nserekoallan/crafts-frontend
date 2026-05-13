'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Image from 'next/image';
import { Instagram, Menu, Music, Search, ShoppingBag, Twitter, User, Heart, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { CurrencyToggle } from '@/components/ui/currency-toggle';
import { AnnouncementBar } from '@/components/ui/announcement-bar';
import { MainNavBar, MobileMenu } from '@/components/layout/main-nav-bar';
import { CategoryNavBar } from '@/components/layout/category-nav-bar';
import { useCart } from '@/lib/cart';
import { useWishlist } from '@/lib/wishlist';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useSocialLinks } from '@/hooks/use-site-content';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AutocompleteProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  displayPrice: number | null;
  currency: string;
  images: Array<{ url: string; isDefault: boolean }>;
}

interface AutocompleteResponse {
  data: AutocompleteProduct[];
}

// ---------------------------------------------------------------------------
// useDebounce
// ---------------------------------------------------------------------------

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

/** Renders the user icon — links to /account when authenticated, /login otherwise. */
function AccountLink() {
  const { isAuthenticated } = useAuth();
  return (
    <Link
      href={isAuthenticated ? '/account' : '/login'}
      className="p-2 text-text-secondary transition-colors hover:text-gold"
      aria-label={isAuthenticated ? 'My account' : 'Sign in'}
    >
      <User className="h-5 w-5" />
    </Link>
  );
}

/**
 * Search form with autocomplete dropdown.
 * Used in both desktop and mobile header slots.
 */
function SearchInput({
  value,
  onChange,
  onSubmit,
  onClear,
  className,
  inputClassName,
  iconSize = 'h-4 w-4',
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  className?: string;
  inputClassName?: string;
  iconSize?: string;
}) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(value, 300);

  const { data, isFetching } = useQuery<AutocompleteResponse>({
    queryKey: ['autocomplete', debouncedQuery],
    queryFn: () =>
      api.get<AutocompleteResponse>(`/products?search=${encodeURIComponent(debouncedQuery)}&limit=5`),
    enabled: debouncedQuery.length >= 2,
    staleTime: 30_000,
  });

  const results = data?.data ?? [];

  // Open dropdown when we have a query and results (or are fetching)
  useEffect(() => {
    setDropdownOpen(value.length >= 2);
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleResultClick = (slug: string) => {
    router.push(`/shop/${slug}`);
    setDropdownOpen(false);
    onClear();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setDropdownOpen(false);
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setDropdownOpen(false);
          onSubmit();
        }}
        className="relative"
      >
        <Search className={cn('absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary', iconSize)} />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (value.length >= 2) setDropdownOpen(true); }}
          placeholder="What are you looking for?"
          autoComplete="off"
          className={cn(
            'w-full rounded-full border border-border-dark bg-bg-surface pl-10 pr-9 text-sm text-text-primary placeholder:text-text-tertiary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20',
            inputClassName,
          )}
        />
        {value.length > 0 && (
          <button
            type="button"
            onClick={() => { onClear(); setDropdownOpen(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary transition-colors hover:text-text-primary"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {/* Autocomplete dropdown */}
      {dropdownOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-border-dark bg-bg-elevated shadow-xl">
          {isFetching && results.length === 0 ? (
            <div className="space-y-2 p-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-8 w-8 shrink-0 animate-pulse rounded-lg bg-bg-surface" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-3/4 animate-pulse rounded bg-bg-surface" />
                    <div className="h-2.5 w-1/4 animate-pulse rounded bg-bg-surface" />
                  </div>
                </div>
              ))}
            </div>
          ) : results.length === 0 && !isFetching ? (
            <p className="px-4 py-3 text-sm text-text-tertiary">
              No results for &ldquo;{debouncedQuery}&rdquo;
            </p>
          ) : (
            <ul>
              {results.map((product) => {
                const thumb = product.images.find((i) => i.isDefault)?.url ?? product.images[0]?.url;
                const displayedPrice = product.displayPrice ?? product.price;
                return (
                  <li key={product.id}>
                    <button
                      type="button"
                      onClick={() => handleResultClick(product.slug)}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-white/[0.05]"
                    >
                      {thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={thumb}
                          alt={product.name}
                          className="h-8 w-8 shrink-0 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 shrink-0 rounded-lg bg-bg-surface" />
                      )}
                      <span className="min-w-0 flex-1 truncate text-sm text-text-primary">
                        {product.name}
                      </span>
                      <span className="shrink-0 text-xs font-semibold text-gold">
                        {product.currency} {Number(displayedPrice).toLocaleString()}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Dark, premium site-wide header.
 * Announcement bar -> Main header -> Category strip (desktop).
 */
function HeaderInner() {
  const { itemCount, setDrawerOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const { data: socialLinks } = useSocialLinks();
  const [badgeBounce, setBadgeBounce] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const prevCount = useRef(itemCount);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') ?? '');

  // Keep search input in sync when URL changes (e.g. back/forward nav)
  useEffect(() => {
    const urlSearch = searchParams.get('search') ?? '';
    setSearchQuery(urlSearch);
  }, [searchParams]);

  const handleSearchSubmit = useCallback(() => {
    const trimmed = searchQuery.trim();
    if (trimmed) {
      router.push(`/shop?search=${encodeURIComponent(trimmed)}`);
    } else if (pathname === '/shop') {
      router.push('/shop');
    }
  }, [searchQuery, router, pathname]);

  const handleSearchClear = useCallback(() => {
    setSearchQuery('');
    if (pathname === '/shop') {
      router.push('/shop');
    }
  }, [router, pathname]);

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
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <Image
              src="/logo.jpg"
              alt="Crafts Continent"
              width={48}
              height={48}
              className="h-10 w-10 rounded-lg object-cover md:h-12 md:w-12"
            />
            <span className="font-heading text-base font-bold uppercase tracking-[0.12em] text-gold md:text-xl md:tracking-[0.15em]">
              Crafts Continent
            </span>
          </Link>

          {/* Search — desktop */}
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            onSubmit={handleSearchSubmit}
            onClear={handleSearchClear}
            className="hidden flex-1 md:block md:max-w-[50%]"
            inputClassName="h-10"
          />

          {/* Right actions */}
          <div className="flex items-center gap-1.5 md:gap-3">
            <CurrencyToggle />

            {/* Social icons — desktop only */}
            <div className="hidden items-center gap-1 border-l border-border-dark pl-3 md:flex">
              {socialLinks.instagram && (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="p-1.5 text-text-tertiary transition-colors hover:text-gold"
                >
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {socialLinks.twitter && (
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X (Twitter)"
                  className="p-1.5 text-text-tertiary transition-colors hover:text-gold"
                >
                  <Twitter className="h-4 w-4" />
                </a>
              )}
              {socialLinks.tiktok && (
                <a
                  href={socialLinks.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className="p-1.5 text-text-tertiary transition-colors hover:text-gold"
                >
                  <Music className="h-4 w-4" />
                </a>
              )}
            </div>

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

            {/* Hamburger menu — mobile only */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-text-secondary transition-colors hover:text-gold md:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

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

            <AccountLink />
          </div>
        </div>

        {/* Search — mobile (below main row) */}
        <div className="border-t border-border-dark px-4 py-2 md:hidden">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            onSubmit={handleSearchSubmit}
            onClear={handleSearchClear}
            inputClassName="h-9"
            iconSize="h-4 w-4"
          />
        </div>
      </div>

      {/* Main nav — desktop */}
      <MainNavBar />

      {/* Category nav strip — desktop */}
      <Suspense>
        <CategoryNavBar />
      </Suspense>

      {/* Mobile nav drawer */}
      <MobileMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </header>
  );
}

/**
 * Header wrapped in Suspense for useSearchParams.
 */
export function Header() {
  return (
    <Suspense>
      <HeaderInner />
    </Suspense>
  );
}
