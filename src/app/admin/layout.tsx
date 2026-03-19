'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Box,
  ShoppingCart,
  ClipboardCheck,
  Wallet,
  FileBarChart,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Admin navigation link configuration
 */
const ADMIN_LINKS = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/artisans', label: 'Artisans', icon: UserCheck },
  { href: '/admin/products', label: 'Products', icon: Box },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/qc', label: 'QC Queue', icon: ClipboardCheck },
  { href: '/admin/payouts', label: 'Payouts', icon: Wallet },
  { href: '/admin/reports', label: 'Reports', icon: FileBarChart },
] as const;

/**
 * AdminLayout - Layout component for admin console with sidebar navigation
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  /**
   * Check if a link is currently active
   * @param {string} href - Link href to check
   */
  const isActive = (href: string): boolean => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-off-white">
      {/* Mobile Navigation */}
      <div className="lg:hidden sticky top-[72px] z-30 bg-white border-b border-light-gray overflow-x-auto">
        <nav className="flex gap-1 p-2 min-w-max">
          {ADMIN_LINKS.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                  active
                    ? 'bg-hunter-green text-white'
                    : 'text-charcoal hover:bg-light-gray'
                )}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24">
              {/* Admin Badge */}
              <div className="mb-6">
                <div className="inline-block px-3 py-1 bg-satin-gold/10 text-satin-gold text-xs font-semibold rounded-full">
                  ADMIN
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-1">
                {ADMIN_LINKS.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.href);

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors',
                        active
                          ? 'bg-hunter-green text-white'
                          : 'text-charcoal hover:bg-light-gray'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
