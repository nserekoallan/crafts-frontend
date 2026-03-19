'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, Search, ShoppingBag, User, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/shop', label: 'Shop' },
  { href: '/artisans', label: 'Artisans' },
  { href: '/about', label: 'About' },
  { href: '/dashboard', label: 'My Shop' },
  { href: '/admin', label: 'Admin' },
] as const;

/**
 * Site-wide header with logo, navigation, search, cart and user menu.
 */
export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const cartCount = 0;

  return (
    <header className="sticky top-0 z-50 border-b border-light-gray bg-off-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="font-heading text-xl font-bold tracking-tight text-hunter-green">
            CC <span className="text-satin-gold">Crafts Continent</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-charcoal transition-colors hover:text-hunter-green"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-4">
          {/* Search (desktop) */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-medium-gray" />
            <input
              type="text"
              placeholder="Search crafts..."
              className="h-9 w-56 rounded-full border border-light-gray bg-white pl-9 pr-4 text-sm text-charcoal placeholder:text-medium-gray focus:border-hunter-green focus:outline-none focus:ring-2 focus:ring-hunter-green/20"
            />
          </div>

          {/* Cart */}
          <Link href="/cart" className="relative p-2 text-charcoal hover:text-hunter-green">
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-satin-gold text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User */}
          <Link href="/login" className="p-2 text-charcoal hover:text-hunter-green">
            <User className="h-5 w-5" />
          </Link>

          {/* Mobile menu toggle */}
          <button
            className="p-2 text-charcoal md:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <div
        className={cn(
          'overflow-hidden border-t border-light-gray transition-all duration-200 md:hidden',
          mobileOpen ? 'max-h-64' : 'max-h-0 border-t-0',
        )}
      >
        <nav className="flex flex-col gap-1 px-4 py-3">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-charcoal hover:bg-light-gray"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
