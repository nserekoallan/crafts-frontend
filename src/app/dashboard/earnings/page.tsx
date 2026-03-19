'use client';

import { useMemo } from 'react';
import { DollarSign, Wallet, Clock, CheckCircle } from 'lucide-react';
import { ARTISAN_EARNINGS } from '@/lib/mock-data';
import { formatPrice, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  iconColor: string;
}

/**
 * Summary stat card with icon, value, and label.
 */
function StatCard({ icon: Icon, label, value, iconColor }: StatCardProps) {
  return (
    <div className="rounded-lg border border-light-gray bg-white p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className={cn('rounded-lg p-3', iconColor)}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-medium-gray">{label}</p>
          <p className="mt-1 text-2xl font-bold text-charcoal">{value}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Artisan earnings overview with stats, revenue chart, and transaction history.
 */
export default function EarningsPage() {
  // Calculate total earned from all months
  const totalEarned = useMemo(() => {
    return ARTISAN_EARNINGS.reduce((sum, earning) => sum + earning.revenue, 0);
  }, []);

  // Calculate max revenue for chart scaling
  const maxRevenue = useMemo(() => {
    return Math.max(...ARTISAN_EARNINGS.map((e) => e.revenue));
  }, []);

  /**
   * Handles the Request Payout button click.
   */
  function handleRequestPayout() {
    alert('Request Payout functionality coming soon!');
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal md:text-3xl">Earnings</h1>
          <p className="mt-1 text-sm text-medium-gray">Track your revenue and payouts</p>
        </div>
        <Button variant="primary" onClick={handleRequestPayout} className="w-full md:w-auto">
          Request Payout
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={DollarSign}
          label="Total Earned"
          value={formatPrice(totalEarned)}
          iconColor="bg-hunter-green"
        />
        <StatCard
          icon={Wallet}
          label="Available Balance"
          value={formatPrice(5490000)}
          iconColor="bg-emerald-600"
        />
        <StatCard
          icon={Clock}
          label="Pending Payout"
          value={formatPrice(4680000)}
          iconColor="bg-amber-600"
        />
        <StatCard
          icon={CheckCircle}
          label="Last Payout"
          value={formatPrice(5220000)}
          iconColor="bg-blue-600"
        />
      </div>

      {/* Revenue Chart */}
      <div className="rounded-lg border border-light-gray bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-semibold text-charcoal">Revenue Trend</h2>
        <div className="flex items-end justify-around gap-4 h-64">
          {ARTISAN_EARNINGS.map((earning) => {
            const heightPercentage = (earning.revenue / maxRevenue) * 100;
            const heightPx = (heightPercentage / 100) * 200; // 200px max height
            return (
              <div key={earning.month} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-52 w-full items-end justify-center">
                  <div
                    className="w-full max-w-[60px] rounded-t-lg bg-hunter-green transition-all hover:bg-hunter-green-dark"
                    style={{ height: `${heightPx}px` }}
                    title={`${earning.month}: ${formatPrice(earning.revenue)}`}
                  />
                </div>
                <p className="text-xs text-medium-gray whitespace-nowrap">{earning.month}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transaction History */}
      <div className="rounded-lg border border-light-gray bg-white shadow-sm">
        <div className="border-b border-light-gray px-6 py-4">
          <h2 className="text-lg font-semibold text-charcoal">Transaction History</h2>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block">
          <table className="w-full">
            <thead className="bg-light-gray/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal">
                  Payout
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-gray">
              {ARTISAN_EARNINGS.map((earning) => (
                <tr key={earning.month} className="transition-colors hover:bg-light-gray/30">
                  <td className="px-6 py-4 font-medium text-charcoal">{earning.month} 2026</td>
                  <td className="px-6 py-4 text-charcoal">{earning.orders}</td>
                  <td className="px-6 py-4 font-medium text-charcoal">{formatPrice(earning.revenue)}</td>
                  <td className="px-6 py-4 font-medium text-emerald-600">{formatPrice(earning.payout)}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                      Completed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="divide-y divide-light-gray lg:hidden">
          {ARTISAN_EARNINGS.map((earning) => (
            <div key={earning.month} className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-charcoal">{earning.month} 2026</p>
                <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                  Completed
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-medium-gray">Orders</p>
                  <p className="font-medium text-charcoal">{earning.orders}</p>
                </div>
                <div>
                  <p className="text-medium-gray">Revenue</p>
                  <p className="font-medium text-charcoal">{formatPrice(earning.revenue)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-medium-gray">Payout</p>
                  <p className="font-medium text-emerald-600">{formatPrice(earning.payout)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
