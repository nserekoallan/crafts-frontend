'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Heart, ShoppingBag, Store, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/lib/cart';
import { useWishlist } from '@/lib/wishlist';

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/shop', label: 'Shop', icon: Store },
  { href: '/wishlist', label: 'Wishlist', icon: Heart },
  { href: '/cart', label: 'Cart', icon: ShoppingBag },
  { href: '/login', label: 'Account', icon: User },
] as const;

/**
 * Fixed bottom navigation bar for mobile.
 * Dark background with gold active indicator and live badges.
 */
export function BottomNav() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border-dark bg-bg-elevated/95 backdrop-blur-sm md:hidden">
      <div className="mx-auto flex h-14 max-w-md items-center justify-around">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
          const badge =
            label === 'Cart' && itemCount > 0
              ? itemCount
              : label === 'Wishlist' && wishlistCount > 0
                ? wishlistCount
                : null;

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'relative flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium transition-colors',
                isActive ? 'text-gold' : 'text-text-tertiary',
              )}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {badge !== null && (
                  <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-gold px-1 text-[9px] font-bold text-bg-primary">
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </div>
              {label}
            </Link>
          );
        })}
      </div>
      {/* Safe area inset for phones with home indicator */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
