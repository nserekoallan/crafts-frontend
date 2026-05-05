'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BarChart3, Box, LayoutDashboard, ShoppingCart, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { PortalHeader } from '@/components/layout/portal-header';

const SIDEBAR_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/products', label: 'Products', icon: Box },
  { href: '/dashboard/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/dashboard/earnings', label: 'Earnings', icon: Wallet },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
] as const;

/**
 * Artisan dashboard layout with dark portal header + dark sidebar.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (pathname === '/dashboard/login') return;
    if (isLoading) return;
    if (!isAuthenticated) { router.replace('/dashboard/login'); return; }
    if (user?.role !== 'artisan') { router.replace('/'); }
  }, [pathname, isLoading, isAuthenticated, user, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0D0D0D]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-hunter-green border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#111110]">
      <PortalHeader label="Artisan Studio" accentClass="text-hunter-green-light" loginPath="/dashboard/login" />

      <div className="flex flex-1">
        {/* Dark sidebar — desktop */}
        <aside className="hidden w-52 shrink-0 lg:flex lg:flex-col border-r border-white/[0.06] bg-[#0D0D0D]">
          <nav className="flex flex-col gap-0.5 p-3 pt-4">
            {SIDEBAR_LINKS.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-hunter-green/20 text-hunter-green-light'
                      : 'text-white/50 hover:bg-white/[0.05] hover:text-white/80',
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile nav strip */}
        <div className="lg:hidden sticky top-14 z-30 w-full border-b border-white/[0.06] bg-[#0D0D0D] overflow-x-auto">
          <nav className="flex gap-1 p-2 min-w-max">
            {SIDEBAR_LINKS.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors',
                    active
                      ? 'bg-hunter-green/20 text-hunter-green-light'
                      : 'text-white/50 hover:bg-white/[0.05] hover:text-white/80',
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main content */}
        <main className="flex-1 min-w-0 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
