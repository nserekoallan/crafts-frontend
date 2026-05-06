'use client';

import Link from 'next/link';
import { useQueries } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
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
    { label: 'Total Orders',         value: totalOrders.toLocaleString(),          numValue: totalOrders,          loading: ordersQuery.isLoading },
    { label: 'Total Artisans',       value: totalArtisans.toLocaleString(),        numValue: totalArtisans,        loading: artisansQuery.isLoading },
    { label: 'Total Products',       value: totalProducts.toLocaleString(),        numValue: totalProducts,        loading: productsTotalQuery.isLoading },
    { label: 'Pending Verification', value: pendingArtisansCount.toLocaleString(), numValue: pendingArtisansCount, loading: pendingArtisansQuery.isLoading, alert: true },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">Admin Console</p>
        <p className="text-xs text-text-tertiary">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={cn(
              'rounded-xl border p-6 bg-bg-elevated',
              stat.alert && stat.numValue > 0
                ? 'border-amber-500/20 ring-1 ring-amber-500/10'
                : 'border-border-dark',
            )}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">
              {stat.label}
            </p>
            {stat.loading ? (
              <div className="mt-3 h-10 w-20 animate-pulse rounded bg-bg-surface/60" />
            ) : (
              <p
                className={cn(
                  'mt-3 text-4xl font-bold font-heading',
                  stat.alert && stat.numValue > 0 ? 'text-amber-400' : 'text-text-primary',
                )}
              >
                {stat.value}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Needs Attention */}
      <div className="flex items-center gap-4 flex-wrap">
        <p className="text-xs font-semibold uppercase tracking-widest text-text-tertiary shrink-0">
          Needs Attention
        </p>
        {(() => {
          const pills = [
            { label: 'QC Queue', count: qcCount, href: '/admin/qc' },
            { label: 'Featured', count: featuredCount, href: '/admin/featured' },
            { label: 'Artisans', count: pendingArtisansCount, href: '/admin/artisans' },
            { label: 'Payouts', count: payoutsCount, href: '/admin/payouts' },
          ].filter((p) => p.count > 0);

          if (pills.length === 0) {
            return (
              <p className="text-sm text-text-secondary">
                No pending actions — platform is healthy.
              </p>
            );
          }
          return pills.map((pill) => (
            <Link
              key={pill.href}
              href={pill.href}
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/15 transition-colors"
            >
              <span className="text-base font-bold tabular-nums">{pill.count}</span>
              {pill.label}
            </Link>
          ));
        })()}
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-widest">
                      Order #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-widest">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-widest">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-text-tertiary uppercase tracking-widest">
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

      {/* Pending Verifications */}
      <div>
        <div className="bg-bg-elevated rounded-xl border border-border-dark overflow-hidden">
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
                  <Link
                    href="/admin/artisans"
                    className="rounded-md border border-border-dark px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:border-white/20 transition-colors"
                  >
                    Review →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
