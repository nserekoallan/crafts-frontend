'use client';

import Link from 'next/link';
import { useQueries } from '@tanstack/react-query';
import {
  ShoppingCart,
  UserCheck,
  Package,
  ClipboardCheck,
  DollarSign,
  ArrowRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/lib/currency';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
}

interface Artisan {
  id: string;
  businessName: string;
  status: string;
  region: string;
  createdAt: string;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number };
}

type BadgeVariant = 'default' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

const ORDER_STATUS_VARIANT: Record<string, BadgeVariant> = {
  DELIVERED: 'delivered',
  SHIPPED: 'shipped',
  PROCESSING: 'processing',
  QC_PASSED: 'processing',
  PAID: 'processing',
  PENDING: 'pending',
  CANCELLED: 'cancelled',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AdminOverviewPage() {
  const { formatPrice } = useCurrency();

  const [
    ordersQuery,
    recentOrdersQuery,
    artisansQuery,
    pendingArtisansQuery,
    productsTotalQuery,
    qcPendingQuery,
    featuredPendingQuery,
    payoutsPendingQuery,
  ] = useQueries({
    queries: [
      {
        queryKey: ['admin', 'orders-total'],
        queryFn: () => api.get<PaginatedResponse<Order>>('/orders?limit=1'),
      },
      {
        queryKey: ['admin', 'orders-recent'],
        queryFn: () => api.get<PaginatedResponse<Order>>('/orders?limit=5'),
      },
      {
        queryKey: ['admin', 'artisans-total'],
        queryFn: () => api.get<PaginatedResponse<Artisan>>('/artisans/admin?limit=1'),
      },
      {
        queryKey: ['admin', 'artisans-pending'],
        queryFn: () =>
          api.get<PaginatedResponse<Artisan>>('/artisans/admin?status=PENDING&limit=5'),
      },
      {
        queryKey: ['admin', 'products-total'],
        queryFn: () => api.get<PaginatedResponse<unknown>>('/products?limit=1'),
      },
      {
        queryKey: ['admin', 'qc-pending'],
        queryFn: () => api.get<PaginatedResponse<unknown>>('/products?status=PENDING_QC&limit=1'),
      },
      {
        queryKey: ['admin', 'featured-pending'],
        queryFn: () =>
          api.get<PaginatedResponse<unknown>>('/featured-requests?status=PENDING&limit=1'),
      },
      {
        queryKey: ['admin', 'payouts-pending'],
        queryFn: () =>
          api.get<PaginatedResponse<unknown>>('/artisans/payouts/admin?status=PENDING&limit=1'),
      },
    ],
  });

  const totalOrders = ordersQuery.data?.meta.total ?? 0;
  const recentOrders = recentOrdersQuery.data?.data ?? [];
  const totalArtisans = artisansQuery.data?.meta.total ?? 0;
  const pendingArtisans = pendingArtisansQuery.data?.data ?? [];
  const pendingArtisansCount = pendingArtisansQuery.data?.meta.total ?? 0;
  const totalProducts = productsTotalQuery.data?.meta.total ?? 0;
  const qcCount = qcPendingQuery.data?.meta.total ?? 0;
  const featuredCount = featuredPendingQuery.data?.meta.total ?? 0;
  const payoutsCount = payoutsPendingQuery.data?.meta.total ?? 0;

  const stats = [
    {
      label: 'Total Orders',
      value: totalOrders.toLocaleString(),
      icon: ShoppingCart,
      color: 'text-blue-400 bg-blue-500/10',
      loading: ordersQuery.isLoading,
    },
    {
      label: 'Total Artisans',
      value: totalArtisans.toLocaleString(),
      icon: UserCheck,
      color: 'text-satin-gold bg-satin-gold/10',
      loading: artisansQuery.isLoading,
    },
    {
      label: 'Total Products',
      value: totalProducts.toLocaleString(),
      icon: Package,
      color: 'text-hunter-green bg-hunter-green/10',
      loading: productsTotalQuery.isLoading,
    },
    {
      label: 'Pending Verification',
      value: pendingArtisansCount.toLocaleString(),
      icon: ClipboardCheck,
      color: 'text-saddle-brown bg-saddle-brown/10',
      loading: pendingArtisansQuery.isLoading,
    },
  ];

  const actionItems = [
    {
      label: 'QC Queue',
      sublabel: 'pending reviews',
      count: qcCount,
      href: '/admin/qc',
      loading: qcPendingQuery.isLoading,
    },
    {
      label: 'Featured Requests',
      sublabel: 'pending',
      count: featuredCount,
      href: '/admin/featured',
      loading: featuredPendingQuery.isLoading,
    },
    {
      label: 'Artisan Verifications',
      sublabel: 'pending',
      count: pendingArtisansCount,
      href: '/admin/artisans',
      loading: pendingArtisansQuery.isLoading,
    },
    {
      label: 'Pending Payouts',
      sublabel: 'pending',
      count: payoutsCount,
      href: '/admin/payouts',
      loading: payoutsPendingQuery.isLoading,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Platform Overview</h1>
        <p className="text-text-secondary">What needs attention right now</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-bg-elevated rounded-xl border border-border-dark p-5 relative"
            >
              <div
                className={cn(
                  'absolute top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center',
                  stat.color,
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
              {stat.loading ? (
                <div className="h-9 w-24 animate-pulse rounded bg-bg-surface/60 mb-1" />
              ) : (
                <div className="text-3xl font-bold text-text-primary mb-1">{stat.value}</div>
              )}
              <div className="text-sm text-text-secondary">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Action Queue */}
      <div className="bg-bg-elevated rounded-xl border border-border-dark overflow-hidden">
        <div className="p-6 border-b border-border-dark">
          <h2 className="text-xl font-bold text-text-primary">Action Queue</h2>
          <p className="text-sm text-text-secondary mt-1">Items that need your attention now</p>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          {actionItems.map((item) => {
            const hasItems = item.count > 0;
            return (
              <Link key={item.label} href={item.href}>
                <div
                  className={cn(
                    'rounded-lg border p-5 transition-colors hover:bg-white/[0.03] cursor-pointer h-full',
                    hasItems
                      ? 'bg-amber-500/10 border-amber-500/30 ring-1 ring-amber-500/40'
                      : 'bg-bg-surface/30 border-border-dark',
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      {item.loading ? (
                        <div className="h-8 w-12 animate-pulse rounded bg-bg-surface/60 mb-2" />
                      ) : (
                        <div
                          className={cn(
                            'text-3xl font-bold mb-1',
                            hasItems ? 'text-amber-400' : 'text-text-secondary',
                          )}
                        >
                          {item.count.toLocaleString()}
                        </div>
                      )}
                      <div className="text-sm font-medium text-text-primary">{item.label}</div>
                      <div className="text-xs text-text-secondary">{item.sublabel}</div>
                    </div>
                    <ArrowRight
                      className={cn(
                        'w-4 h-4 mt-1 shrink-0',
                        hasItems ? 'text-amber-400' : 'text-text-secondary',
                      )}
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-bg-elevated rounded-xl border border-border-dark overflow-hidden">
        <div className="p-6 border-b border-border-dark flex items-center justify-between">
          <h2 className="text-xl font-bold text-text-primary">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm font-medium text-hunter-green hover:underline">
            View all
          </Link>
        </div>

        {recentOrdersQuery.isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded bg-bg-surface/60" />
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="p-8 text-center text-sm text-text-secondary">No orders yet.</div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-bg-elevated/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Order #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-dark">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-text-primary">
                        {order.orderNumber}
                      </td>
                      <td className="px-6 py-4 text-sm text-text-secondary">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={ORDER_STATUS_VARIANT[order.status] ?? 'default'}>
                          {order.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-text-primary text-right">
                        {formatPrice(order.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile */}
            <div className="md:hidden divide-y divide-border-dark">
              {recentOrders.map((order) => (
                <div key={order.id} className="p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-text-primary text-sm">
                      {order.orderNumber}
                    </span>
                    <Badge variant={ORDER_STATUS_VARIANT[order.status] ?? 'default'}>
                      {order.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="text-sm font-semibold text-text-primary">
                    {formatPrice(order.total)}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pending Verifications & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Verifications */}
        <div className="lg:col-span-2 bg-bg-elevated rounded-xl border border-border-dark overflow-hidden">
          <div className="p-6 border-b border-border-dark flex items-center justify-between">
            <h2 className="text-xl font-bold text-text-primary">Pending Verifications</h2>
            <Link
              href="/admin/artisans"
              className="text-sm font-medium text-hunter-green hover:underline"
            >
              View all
            </Link>
          </div>
          {pendingArtisansQuery.isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded bg-bg-surface/60" />
              ))}
            </div>
          ) : pendingArtisans.length === 0 ? (
            <div className="p-8 text-center text-sm text-text-secondary">
              No pending verifications.
            </div>
          ) : (
            <div className="divide-y divide-border-dark">
              {pendingArtisans.map((artisan) => (
                <div key={artisan.id} className="p-6 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-text-primary">{artisan.businessName}</p>
                    {artisan.region && (
                      <p className="text-sm text-text-secondary">{artisan.region}</p>
                    )}
                    <p className="text-xs text-text-secondary mt-1">
                      Submitted: {new Date(artisan.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Link href="/admin/artisans">
                    <Button variant="primary" size="sm">
                      Review
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-bg-elevated rounded-xl border border-border-dark p-6">
          <h2 className="text-xl font-bold text-text-primary mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <Link href="/admin/payouts" className="block">
              <Button variant="primary" className="w-full justify-start">
                <DollarSign className="w-4 h-4 mr-2" />
                Process Payouts
              </Button>
            </Link>
            <Link href="/admin/artisans" className="block">
              <Button variant="secondary" className="w-full justify-start">
                <UserCheck className="w-4 h-4 mr-2" />
                Manage Artisans
              </Button>
            </Link>
            <Link href="/admin/orders" className="block">
              <Button variant="secondary" className="w-full justify-start">
                <ShoppingCart className="w-4 h-4 mr-2" />
                View Orders
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
