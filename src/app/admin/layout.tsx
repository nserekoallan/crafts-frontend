'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Box,
  ShoppingCart,
  ClipboardCheck,
  Sparkles,
  Wallet,
  FileBarChart,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PortalHeader } from '@/components/layout/portal-header';

const ADMIN_LINKS = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/artisans', label: 'Artisans', icon: UserCheck },
  { href: '/admin/products', label: 'Products', icon: Box },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/qc', label: 'QC Queue', icon: ClipboardCheck },
  { href: '/admin/featured', label: 'Featured', icon: Sparkles },
  { href: '/admin/payouts', label: 'Payouts', icon: Wallet },
  { href: '/admin/reports', label: 'Reports', icon: FileBarChart },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
] as const;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (pathname === '/admin/login') return;
    if (isLoading) return;
    if (!isAuthenticated) { router.replace('/admin/login'); return; }
    if (user?.role !== 'admin' && user?.role !== 'super_admin') { router.replace('/'); return; }
  }, [pathname, isLoading, isAuthenticated, user, router]);

  if (pathname === '/admin/login') return <>{children}</>;

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0D0D0D]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-satin-gold border-t-transparent" />
      </div>
    );
  }

  const isActive = (href: string): boolean => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#111110]">
      <PortalHeader label="Admin Console" accentClass="text-satin-gold" loginPath="/admin/login" />

      <div className="flex flex-1">
        {/* Dark sidebar — desktop */}
        <aside className="hidden w-56 shrink-0 lg:flex lg:flex-col border-r border-white/[0.06] bg-[#0D0D0D]">
          <nav className="flex flex-col gap-0.5 p-3 pt-4">
            {ADMIN_LINKS.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-satin-gold/10 text-satin-gold'
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
            {ADMIN_LINKS.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors',
                    active
                      ? 'bg-satin-gold/10 text-satin-gold'
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
