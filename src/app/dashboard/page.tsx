'use client';

import { DollarSign, Package, ShoppingCart, TrendingUp } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { DASHBOARD_STATS, RECENT_DASHBOARD_ORDERS } from '@/lib/mock-data';

const STAT_ICONS = [DollarSign, ShoppingCart, Package, TrendingUp] as const;

/**
 * Artisan dashboard home with summary stat cards.
 */
export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-1 text-medium-gray">Welcome back! Here&apos;s an overview of your shop.</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {DASHBOARD_STATS.map((stat, idx) => {
          const Icon = STAT_ICONS[idx];
          return (
            <div key={stat.label} className="rounded-xl border border-light-gray bg-white p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-medium-gray">{stat.label}</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-hunter-green/10 text-hunter-green">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 font-heading text-2xl font-bold">{stat.value}</p>
              <p className="mt-1 text-xs text-emerald-600">{stat.change} from last month</p>
            </div>
          );
        })}
      </div>

      {/* Recent orders */}
      <div className="mt-10">
        <h2 className="text-xl font-bold">Recent Orders</h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-light-gray bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-light-gray text-xs font-semibold uppercase tracking-wider text-medium-gray">
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-gray">
              {RECENT_DASHBOARD_ORDERS.map((row) => (
                <tr key={row.order} className="hover:bg-light-gray/30">
                  <td className="px-5 py-3 font-medium">{row.order}</td>
                  <td className="px-5 py-3">{row.customer}</td>
                  <td className="px-5 py-3">
                    <span className="rounded-full bg-hunter-green/10 px-2.5 py-0.5 text-xs font-semibold text-hunter-green">
                      {row.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right font-medium">{formatPrice(row.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
