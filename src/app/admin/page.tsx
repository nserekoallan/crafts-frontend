'use client';

import Link from 'next/link';
import { DollarSign, ShoppingCart, UserCheck, ClipboardCheck, TrendingUp, TrendingDown } from 'lucide-react';
import { ADMIN_STATS, ADMIN_RECENT_ORDERS, PENDING_VERIFICATIONS } from '@/lib/mock-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPrice, cn } from '@/lib/utils';

/**
 * Stat icon mapping by title
 */
const STAT_ICONS = {
  'Total Revenue': { icon: DollarSign, color: 'text-hunter-green bg-hunter-green/10' },
  'Total Orders': { icon: ShoppingCart, color: 'text-blue-600 bg-blue-50' },
  'Active Artisans': { icon: UserCheck, color: 'text-satin-gold bg-satin-gold/10' },
  'QC Queue': { icon: ClipboardCheck, color: 'text-saddle-brown bg-saddle-brown/10' },
} as const;

/**
 * AdminOverviewPage - Platform overview dashboard for administrators
 */
export default function AdminOverviewPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-charcoal mb-2">Platform Overview</h1>
        <p className="text-medium-gray">Welcome to the admin console</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {ADMIN_STATS.map((stat) => {
          const iconConfig = STAT_ICONS[stat.label as keyof typeof STAT_ICONS];
          const Icon = iconConfig.icon;
          const isPositive = stat.change.startsWith('+');

          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-light-gray p-5 relative"
            >
              {/* Icon */}
              <div className={cn('absolute top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center', iconConfig.color)}>
                <Icon className="w-5 h-5" />
              </div>

              {/* Value */}
              <div className="text-3xl font-bold text-charcoal mb-1">
                {stat.value}
              </div>

              {/* Label */}
              <div className="text-sm text-medium-gray mb-3">
                {stat.label}
              </div>

              {/* Change Indicator */}
              <div className={cn('flex items-center gap-1 text-sm font-medium', isPositive ? 'text-green-600' : 'text-red-600')}>
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{stat.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-light-gray overflow-hidden">
        <div className="p-6 border-b border-light-gray">
          <h2 className="text-xl font-bold text-charcoal">Recent Orders</h2>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-light-gray/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-medium-gray uppercase tracking-wider">
                  Order #
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-medium-gray uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-medium-gray uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-medium-gray uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-gray">
              {ADMIN_RECENT_ORDERS.map((order) => (
                <tr key={order.order} className="hover:bg-light-gray/30 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-charcoal">
                    {order.order}
                  </td>
                  <td className="px-6 py-4 text-sm text-charcoal">
                    {order.customer}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Badge variant={order.status.toLowerCase() as 'pending' | 'processing' | 'shipped' | 'delivered'}>{order.status}</Badge>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-charcoal text-right">
                    {formatPrice(order.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-light-gray">
          {ADMIN_RECENT_ORDERS.map((order) => (
            <div key={order.order} className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-charcoal">{order.order}</span>
                <Badge variant={order.status.toLowerCase() as 'pending' | 'processing' | 'shipped' | 'delivered'}>{order.status}</Badge>
              </div>
              <div className="text-sm text-medium-gray">{order.customer}</div>
              <div className="text-lg font-semibold text-charcoal">
                {formatPrice(order.total)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Verifications & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Verifications */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-light-gray overflow-hidden">
          <div className="p-6 border-b border-light-gray">
            <h2 className="text-xl font-bold text-charcoal">Pending Verifications</h2>
          </div>
          <div className="divide-y divide-light-gray">
            {PENDING_VERIFICATIONS.map((verification) => (
              <div key={verification.id} className="p-6 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-charcoal mb-1">
                    {verification.artisanName}
                  </div>
                  <div className="text-sm text-medium-gray">
                    {verification.craft} • {verification.region}
                  </div>
                  <div className="text-xs text-medium-gray mt-1">
                    Submitted: {new Date(verification.submittedDate).toLocaleDateString()}
                  </div>
                </div>
                <Button variant="primary" size="sm">
                  Review
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-light-gray p-6">
          <h2 className="text-xl font-bold text-charcoal mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <Link href="/admin/qc" className="block">
              <Button variant="primary" className="w-full justify-start">
                <ClipboardCheck className="w-4 h-4 mr-2" />
                Review QC Queue
              </Button>
            </Link>
            <Link href="/admin/payouts" className="block">
              <Button variant="secondary" className="w-full justify-start">
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
          </div>
        </div>
      </div>
    </div>
  );
}
