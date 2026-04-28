'use client';

import { DollarSign, Package, ShoppingCart, Wallet } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useArtisanEarnings, useArtisanOrders, useArtisanProducts } from '@/hooks/use-artisan';
import { formatPrice } from '@/lib/utils';

function StatSkeleton() {
  return <div className="h-28 animate-pulse rounded-xl border border-light-gray bg-light-gray/50" />;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: earnings, isLoading: earningsLoading } = useArtisanEarnings();
  const { data: ordersData, isLoading: ordersLoading } = useArtisanOrders();
  const { data: productsData, isLoading: productsLoading } = useArtisanProducts();

  const balance = earnings ? Number(earnings.balance) : 0;
  const payoutCount = earnings?.payouts?.length ?? 0;
  const orderCount = ordersData?.meta?.total ?? 0;
  const productCount = productsData?.meta?.total ?? 0;

  const stats = [
    { label: 'Available Balance', value: formatPrice(balance), icon: DollarSign, loading: earningsLoading },
    { label: 'Total Orders', value: orderCount, icon: ShoppingCart, loading: ordersLoading },
    { label: 'Products Listed', value: productCount, icon: Package, loading: productsLoading },
    { label: 'Payouts Made', value: payoutCount, icon: Wallet, loading: earningsLoading },
  ];

  const recentOrders = ordersData?.data?.slice(0, 5) ?? [];

  return (
    <div>
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-1 text-medium-gray">
        Welcome back, {user?.firstName}! Here&apos;s an overview of your shop.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          if (stat.loading) return <StatSkeleton key={stat.label} />;
          return (
            <div key={stat.label} className="rounded-xl border border-light-gray bg-white p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-medium-gray">{stat.label}</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-hunter-green/10 text-hunter-green">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 font-heading text-2xl font-bold">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-bold">Recent Orders</h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-light-gray bg-white">
          {ordersLoading ? (
            <div className="p-8 text-center text-sm text-medium-gray">Loading orders…</div>
          ) : recentOrders.length === 0 ? (
            <div className="p-8 text-center text-sm text-medium-gray">No orders yet.</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-light-gray text-xs font-semibold uppercase tracking-wider text-medium-gray">
                  <th className="px-5 py-3">Order</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-gray">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-light-gray/30">
                    <td className="px-5 py-3 font-medium">{order.orderNumber}</td>
                    <td className="px-5 py-3">
                      <span className="rounded-full bg-hunter-green/10 px-2.5 py-0.5 text-xs font-semibold text-hunter-green">
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-medium">{formatPrice(order.total)}</td>
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
