'use client';

import Link from 'next/link';
import { useQueries } from '@tanstack/react-query';
import { DollarSign, ShoppingCart, UserCheck, ClipboardCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { formatPrice, cn } from '@/lib/utils';

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

interface OrdersResponse {
  data: Order[];
  meta: { total: number };
}

interface Artisan {
  id: string;
  businessName: string;
  status: string;
  region: string;
  createdAt: string;
}

interface ArtisansResponse {
  data: Artisan[];
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
  const [ordersQuery, recentOrdersQuery, artisansQuery, pendingArtisansQuery] = useQueries({
    queries: [
      {
        queryKey: ['admin', 'orders-total'],
        queryFn: () => api.get<OrdersResponse>('/orders?limit=1'),
      },
      {
        queryKey: ['admin', 'orders-recent'],
        queryFn: () => api.get<OrdersResponse>('/orders?limit=5'),
      },
      {
        queryKey: ['admin', 'artisans-total'],
        queryFn: () => api.get<ArtisansResponse>('/artisans/admin?limit=1'),
      },
      {
        queryKey: ['admin', 'artisans-pending'],
        queryFn: () => api.get<ArtisansResponse>('/artisans/admin?status=PENDING&limit=5'),
      },
    ],
  });

  const totalOrders = ordersQuery.data?.meta.total ?? 0;
  const recentOrders = recentOrdersQuery.data?.data ?? [];
  const totalArtisans = artisansQuery.data?.meta.total ?? 0;
  const pendingArtisans = pendingArtisansQuery.data?.data ?? [];

  const stats = [
    {
      label: 'Total Orders',
      value: totalOrders.toLocaleString(),
      icon: ShoppingCart,
      color: 'text-blue-600 bg-blue-50',
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
      label: 'Pending Verification',
      value: (pendingArtisansQuery.data?.meta.total ?? 0).toLocaleString(),
      icon: ClipboardCheck,
      color: 'text-saddle-brown bg-saddle-brown/10',
      loading: pendingArtisansQuery.isLoading,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-charcoal mb-2">Platform Overview</h1>
        <p className="text-medium-gray">Welcome to the admin console</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-bg-elevated rounded-xl border border-border-dark p-5 relative">
              <div className={cn('absolute top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center', stat.color)}>
                <Icon className="w-5 h-5" />
              </div>
              {stat.loading ? (
                <div className="h-9 w-24 animate-pulse rounded bg-bg-surface/60 mb-1" />
              ) : (
                <div className="text-3xl font-bold text-charcoal mb-1">{stat.value}</div>
              )}
              <div className="text-sm text-medium-gray">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="bg-bg-elevated rounded-xl border border-border-dark overflow-hidden">
        <div className="p-6 border-b border-border-dark flex items-center justify-between">
          <h2 className="text-xl font-bold text-charcoal">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm font-medium text-hunter-green hover:underline">
            View all
          </Link>
        </div>

        {recentOrdersQuery.isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-12 animate-pulse rounded bg-bg-surface/60/60" />)}
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="p-8 text-center text-sm text-medium-gray">No orders yet.</div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-bg-surface/60">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-medium-gray uppercase tracking-wider">Order #</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-medium-gray uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-medium-gray uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-medium-gray uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-dark">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-charcoal">{order.orderNumber}</td>
                      <td className="px-6 py-4 text-sm text-medium-gray">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={ORDER_STATUS_VARIANT[order.status] ?? 'default'}>
                          {order.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-charcoal text-right">{formatPrice(order.total)}</td>
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
                    <span className="font-medium text-charcoal text-sm">{order.orderNumber}</span>
                    <Badge variant={ORDER_STATUS_VARIANT[order.status] ?? 'default'}>
                      {order.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="text-sm font-semibold text-charcoal">{formatPrice(order.total)}</div>
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
            <h2 className="text-xl font-bold text-charcoal">Pending Verifications</h2>
            <Link href="/admin/artisans" className="text-sm font-medium text-hunter-green hover:underline">
              View all
            </Link>
          </div>
          {pendingArtisansQuery.isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2].map((i) => <div key={i} className="h-14 animate-pulse rounded bg-bg-surface/60/60" />)}
            </div>
          ) : pendingArtisans.length === 0 ? (
            <div className="p-8 text-center text-sm text-medium-gray">No pending verifications.</div>
          ) : (
            <div className="divide-y divide-border-dark">
              {pendingArtisans.map((artisan) => (
                <div key={artisan.id} className="p-6 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-charcoal">{artisan.businessName}</p>
                    {artisan.region && (
                      <p className="text-sm text-medium-gray">{artisan.region}</p>
                    )}
                    <p className="text-xs text-medium-gray mt-1">
                      Submitted: {new Date(artisan.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Link href="/admin/artisans">
                    <Button variant="primary" size="sm">Review</Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-bg-elevated rounded-xl border border-border-dark p-6">
          <h2 className="text-xl font-bold text-charcoal mb-6">Quick Actions</h2>
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
