'use client';

import Link from 'next/link';
import { AlertTriangle, Star } from 'lucide-react';
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

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-bold text-text-primary">{user?.firstName}&apos;s Studio</h1>
        <p className="text-xs text-text-tertiary">
          {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Balance hero + supporting metrics */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Balance — 3 of 5 cols */}
        <div className="lg:col-span-3 rounded-xl border border-border-dark bg-bg-elevated p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">
            Available Balance
          </p>
          {earningsLoading ? (
            <div className="mt-3 h-14 w-48 animate-pulse rounded bg-bg-surface/60" />
          ) : (
            <p className="mt-3 font-heading text-5xl font-bold text-text-primary">
              {formatPrice(balance)}
            </p>
          )}
          <p className="mt-2 text-sm text-text-tertiary">Ready to transfer</p>
          <Link
            href="/dashboard/earnings"
            className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-gold hover:underline"
          >
            Manage earnings →
          </Link>
        </div>

        {/* Supporting metrics — 2 of 5 cols */}
        <div className="lg:col-span-2 rounded-xl border border-border-dark bg-bg-elevated divide-y divide-border-dark">
          {[
            { label: 'Total Revenue', value: totals ? formatPrice(totals.revenue) : '—', loading: analyticsLoading },
            { label: 'Product Views', value: totals ? totals.views.toLocaleString() : '—', loading: analyticsLoading },
            { label: 'Total Orders',  value: totals ? totals.orders.toLocaleString() : '—', loading: analyticsLoading },
          ].map((m) => (
            <div key={m.label} className="px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">
                {m.label}
              </p>
              {m.loading ? (
                <div className="mt-1.5 h-7 w-24 animate-pulse rounded bg-bg-surface/60" />
              ) : (
                <p className="mt-1.5 text-2xl font-bold text-text-primary">{m.value}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Alert strip */}
      {hasAlerts && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-border-dark bg-bg-elevated px-4 py-3">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
          <span className="text-sm font-medium text-text-secondary">Shop alerts:</span>
          {pendingQcCount > 0 && (
            <span className="rounded-full bg-amber-500/15 border border-amber-500/20 px-3 py-1 text-xs font-medium text-amber-400">
              {pendingQcCount} awaiting QC
            </span>
          )}
          {suspendedCount > 0 && (
            <span className="rounded-full bg-red-500/15 border border-red-500/20 px-3 py-1 text-xs font-medium text-red-400">
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
        <p className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">Top Performers</p>
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
                  <th className="px-5 py-3 w-10">#</th>
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3 text-right">Views</th>
                  <th className="px-5 py-3 text-right">Orders</th>
                  <th className="px-5 py-3 text-right">Revenue</th>
                  <th className="px-5 py-3">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dark">
                {topProducts.map((product, index) => (
                  <tr key={product.id} className="hover:bg-white/[0.03]">
                    <td className="px-5 py-3 text-xs font-bold text-text-tertiary tabular-nums">
                      {String(index + 1).padStart(2, '0')}
                    </td>
                    <td className="px-5 py-3 font-medium text-text-primary">{product.name}</td>
                    <td className="px-5 py-3 text-right text-text-secondary">
                      {product.viewCount.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-right text-text-secondary">
                      {product.purchaseCount.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-gold">
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
        <p className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">Recent Orders</p>
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
