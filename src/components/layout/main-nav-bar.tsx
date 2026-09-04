'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, User, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const NAV_LINKS = [
  { href: '/shop', label: 'Shop' },
  { href: '/videos', label: 'Watch' },
  { href: '/artisans', label: 'Artisans' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
] as const;

// ---------------------------------------------------------------------------
// Desktop nav bar
// ---------------------------------------------------------------------------

/**
 * Horizontal nav strip rendered below the main header bar (desktop only).
 * Gold underline on active/hover, mirrors CategoryNavBar pattern.
 */
export function MainNavBar() {
  const pathname = usePathname();

  return (
    <nav className="hidden border-b border-border-dark bg-bg-primary md:block">
      <div className="mx-auto flex h-10 max-w-7xl items-center justify-center gap-8 px-4 lg:px-8">
        {NAV_LINKS.map(({ href, label }) => {
          const isActive =
            pathname === href || pathname.startsWith(href + '/');

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'group relative flex items-center text-xs font-semibold uppercase tracking-widest transition-colors',
                isActive
                  ? 'text-gold'
                  : 'text-text-secondary hover:text-gold',
              )}
            >
              {label}
              <span
                className={cn(
                  'absolute -bottom-[12px] left-0 right-0 h-0.5 origin-left bg-gold transition-transform duration-200',
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

// ---------------------------------------------------------------------------
// Mobile menu drawer
// ---------------------------------------------------------------------------

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Slide-down mobile menu with site nav links.
 * Renders as an overlay below the header.
 */
export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();

  function handleLogout() {
    logout();
    onClose();
    router.replace('/');
  }

  // Close on Escape key
  useEffect(() => {
    if (!open) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  // Close when route changes
  useEffect(() => {
    if (open) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] md:hidden">
      {/* Backdrop */}
      <div
        className="animate-fade-in absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="animate-sheet-down absolute inset-x-0 top-0 border-b border-border-dark bg-bg-elevated">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-dark px-5 py-4">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.jpg"
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 rounded-md object-cover"
            />
            <span className="font-heading text-sm font-bold uppercase tracking-widest text-gold">
              Menu
            </span>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary hover:bg-bg-surface"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Links */}
        <nav className="px-5 py-2">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive =
              pathname === href || pathname.startsWith(href + '/');

            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={cn(
                  'flex h-12 items-center text-base font-semibold transition-colors',
                  isActive ? 'text-gold' : 'text-text-primary',
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Account / auth actions */}
        <div className="border-t border-border-dark px-5 py-2">
          {isAuthenticated ? (
            <>
              <Link
                href="/account"
                onClick={onClose}
                className="flex h-12 items-center gap-2 text-base font-semibold text-text-primary transition-colors hover:text-gold"
              >
                <User className="h-5 w-5" />
                My Account
              </Link>
              <button
                onClick={handleLogout}
                className="flex h-12 w-full items-center gap-2 rounded-md text-base font-semibold text-error transition-colors hover:text-error/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error/40"
              >
                <LogOut className="h-5 w-5" />
                Log out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={onClose}
              className="flex h-12 items-center gap-2 text-base font-semibold text-text-primary transition-colors hover:text-gold"
            >
              <User className="h-5 w-5" />
              Sign in
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
