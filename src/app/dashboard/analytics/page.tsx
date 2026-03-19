'use client';

import { useMemo } from 'react';
import { Eye, TrendingUp, Award, Users } from 'lucide-react';
import { ARTISAN_ANALYTICS } from '@/lib/mock-data';
import { formatPrice, cn } from '@/lib/utils';

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  iconColor: string;
}

/**
 * Analytics stat card with icon, value, and label.
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
 * Formats number with thousands separator.
 */
function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

/**
 * Artisan analytics dashboard with performance metrics and insights.
 */
export default function AnalyticsPage() {
  // Calculate max revenue for chart scaling
  const maxMonthlySales = useMemo(() => {
    return Math.max(...ARTISAN_ANALYTICS.monthlySales.map((s) => s.revenue));
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-charcoal md:text-3xl">Analytics</h1>
        <p className="mt-1 text-sm text-medium-gray">Performance insights and metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Eye}
          label="Total Views"
          value={formatNumber(ARTISAN_ANALYTICS.totalViews)}
          iconColor="bg-blue-600"
        />
        <StatCard
          icon={TrendingUp}
          label="Conversion Rate"
          value={`${ARTISAN_ANALYTICS.conversionRate}%`}
          iconColor="bg-emerald-600"
        />
        <StatCard
          icon={Award}
          label="Top Product"
          value={ARTISAN_ANALYTICS.topProducts[0].name}
          iconColor="bg-satin-gold"
        />
        <StatCard
          icon={Users}
          label="Repeat Customers"
          value={formatNumber(ARTISAN_ANALYTICS.repeatCustomers)}
          iconColor="bg-hunter-green"
        />
      </div>

      {/* Top Products Table */}
      <div className="rounded-lg border border-light-gray bg-white shadow-sm">
        <div className="border-b border-light-gray px-6 py-4">
          <h2 className="text-lg font-semibold text-charcoal">Top Products</h2>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block">
          <table className="w-full">
            <thead className="bg-light-gray/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal">
                  Units Sold
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-gray">
              {ARTISAN_ANALYTICS.topProducts.map((product, index) => (
                <tr key={product.name} className="transition-colors hover:bg-light-gray/30">
                  <td className="px-6 py-4 text-charcoal">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-light-gray font-semibold">
                      {index + 1}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-charcoal">{product.name}</td>
                  <td className="px-6 py-4 text-charcoal">{product.unitsSold}</td>
                  <td className="px-6 py-4 font-medium text-charcoal">{formatPrice(product.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="divide-y divide-light-gray lg:hidden">
          {ARTISAN_ANALYTICS.topProducts.map((product, index) => (
            <div key={product.name} className="flex items-start gap-4 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-light-gray font-semibold text-charcoal">
                {index + 1}
              </div>
              <div className="flex-1 space-y-1">
                <p className="font-semibold text-charcoal">{product.name}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-medium-gray">{product.unitsSold} sold</span>
                  <span className="font-medium text-charcoal">{formatPrice(product.revenue)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Sales Trend */}
      <div className="rounded-lg border border-light-gray bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-semibold text-charcoal">Monthly Sales Trend</h2>
        <div className="flex items-end justify-around gap-4 h-64">
          {ARTISAN_ANALYTICS.monthlySales.map((sale) => {
            const heightPercentage = (sale.revenue / maxMonthlySales) * 100;
            const heightPx = (heightPercentage / 100) * 200; // 200px max height
            return (
              <div key={sale.month} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-52 w-full items-end justify-center">
                  <div
                    className="w-full max-w-[60px] rounded-t-lg bg-emerald-600 transition-all hover:bg-emerald-700"
                    style={{ height: `${heightPx}px` }}
                    title={`${sale.month}: ${formatPrice(sale.revenue)}`}
                  />
                </div>
                <p className="text-xs text-medium-gray whitespace-nowrap">{sale.month}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Traffic Sources */}
      <div className="rounded-lg border border-light-gray bg-white shadow-sm">
        <div className="border-b border-light-gray px-6 py-4">
          <h2 className="text-lg font-semibold text-charcoal">Traffic Sources</h2>
        </div>
        <div className="divide-y divide-light-gray">
          {ARTISAN_ANALYTICS.trafficSources.map((source) => (
            <div key={source.source} className="px-6 py-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium text-charcoal">{source.source}</span>
                <span className="text-sm font-semibold text-charcoal">{source.percentage}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-light-gray">
                <div
                  className="h-full rounded-full bg-hunter-green transition-all"
                  style={{ width: `${source.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
