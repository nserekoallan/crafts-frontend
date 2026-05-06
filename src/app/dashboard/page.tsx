'use client';

import Link from 'next/link';
import { AlertTriangle, DollarSign, Eye, ShoppingCart, Star, TrendingUp, Wallet } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import {
  useArtisanAnalytics,
  useArtisanEarnings,
  useArtisanOrders,
  useArtisanProducts,
} from '@/hooks/use-artisan';
import { useCurrency } from '@/lib/currency';
import { Badge } from '@/components/ui/badge';

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

function StatSkeleton() {
  return <div className="h-28 animate-pulse rounded-xl border border-border-dark bg-bg-surface/60" />;
}

function StarRating({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${i < full ? 'fill-amber-400 text-amber-400' : 'text-border-dark'}`}
        />
      ))}
      <span className="ml-1 text-xs text-text-secondary">{rating.toFixed(1)}</span>
    </span>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();

  const { data: earnings, isLoading: earningsLoading } = useArtisanEarnings();
  const { data: analyticsData, isLoading: analyticsLoading } = useArtisanAnalytics();
  const { data: ordersData, isLoading: ordersLoading } = useArtisanOrders();
  const { data: productsData } = useArtisanProducts();

  const balance = earnings ? Number(earnings.balance) : 0;
  const totals = analyticsData?.totals;

  const pendingQcCount =
    productsData?.data?.filter((p) => p.status === 'PENDING_QC').length ?? 0;
  const suspendedCount =
    productsData?.data?.filter((p) => p.status === 'SUSPENDED').length ?? 0;
  const hasAlerts = pendingQcCount > 0 || suspendedCount > 0;

  const topProducts = [...(analyticsData?.products ?? [])]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const recentOrders = ordersData?.data?.slice(0, 5) ?? [];

  const stats = [
    {
      label: 'Available Balance',
      value: formatPrice(balance),
      icon: Wallet,
      loading: earningsLoading,
    },
    {
      label: 'Total Revenue',
      value: totals ? formatPrice(totals.revenue) : '—',
      icon: DollarSign,
      loading: analyticsLoading,
    },
    {
      label: 'Total Views',
      value: totals ? totals.views.toLocaleString() : '—',
      icon: Eye,
      loading: analyticsLoading,
    },
    {
      label: 'Total Orders',
      value: totals ? totals.orders.toLocaleString() : '—',
      icon: ShoppingCart,
      loading: analyticsLoading,
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
      <p className="mt-1 text-text-secondary">
        Welcome back, {user?.firstName}. Here&apos;s how your shop is performing.
      </p>

      {/* Stats row */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          if (stat.loading) return <StatSkeleton key={stat.label} />;
          return (
            <div
              key={stat.label}
              className="rounded-xl border border-border-dark bg-bg-elevated p-5"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-secondary">{stat.label}</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-hunter-green/10 text-hunter-green">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 font-heading text-2xl font-bold text-text-primary">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Alert strip */}
      {hasAlerts && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-border-dark bg-bg-elevated px-4 py-3">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
          <span className="text-sm font-medium text-text-secondary">Shop alerts:</span>
          {pendingQcCount > 0 && (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
              {pendingQcCount} awaiting QC
            </span>
          )}
          {suspendedCount > 0 && (
            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">
              {suspendedCount} suspended
            </span>
          )}
          <Link
            href="/dashboard/products"
            className="ml-auto text-xs font-medium text-hunter-green hover:underline"
          >
            View products →
          </Link>
        </div>
      )}

      {/* Top products by revenue */}
      <div className="mt-10">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-hunter-green" />
          <h2 className="text-xl font-bold text-text-primary">Top Products</h2>
        </div>
        <div className="mt-4 overflow-x-auto rounded-xl border border-border-dark bg-bg-elevated">
          {analyticsLoading ? (
            <div className="p-8 text-center text-sm text-text-secondary">Loading analytics…</div>
          ) : topProducts.length === 0 ? (
            <div className="p-8 text-center text-sm text-text-secondary">
              No sales data yet. Create products to get started.
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border-dark text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3 text-right">Views</th>
                  <th className="px-5 py-3 text-right">Orders</th>
                  <th className="px-5 py-3 text-right">Revenue</th>
                  <th className="px-5 py-3">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dark">
                {topProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-white/[0.03]">
                    <td className="px-5 py-3 font-medium text-text-primary">{product.name}</td>
                    <td className="px-5 py-3 text-right text-text-secondary">
                      {product.viewCount.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-right text-text-secondary">
                      {product.purchaseCount.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-right font-medium text-text-primary">
                      {formatPrice(product.revenue)}
                    </td>
                    <td className="px-5 py-3">
                      {product.avgRating !== null ? (
                        <StarRating rating={product.avgRating} />
                      ) : (
                        <span className="text-text-secondary">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div className="mt-10">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-hunter-green" />
          <h2 className="text-xl font-bold text-text-primary">Recent Orders</h2>
        </div>
        <div className="mt-4 overflow-x-auto rounded-xl border border-border-dark bg-bg-elevated">
          {ordersLoading ? (
            <div className="p-8 text-center text-sm text-text-secondary">Loading orders…</div>
          ) : recentOrders.length === 0 ? (
            <div className="p-8 text-center text-sm text-text-secondary">No orders yet.</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border-dark text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  <th className="px-5 py-3">Order</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dark">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/[0.03]">
                    <td className="px-5 py-3 font-medium text-text-primary">{order.orderNumber}</td>
                    <td className="px-5 py-3">
                      <Badge variant={ORDER_STATUS_VARIANT[order.status] ?? 'default'}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-right font-medium text-text-primary">
                      {formatPrice(order.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
