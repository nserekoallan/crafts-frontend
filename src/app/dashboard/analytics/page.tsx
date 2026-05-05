'use client';

import { useQuery } from '@tanstack/react-query';
import { BarChart3, Eye, ShoppingBag, DollarSign, Star } from 'lucide-react';
import { api } from '@/lib/api';
import { formatPrice, cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProductAnalytic {
  id: string;
  name: string;
  viewCount: number;
  purchaseCount: number;
  revenue: number;
  avgRating: number | null;
  reviewCount: number;
}

interface AnalyticsResponse {
  products: ProductAnalytic[];
  totals: { revenue: number; orders: number; views: number };
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-light-gray bg-white p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className={cn('rounded-xl p-3', color)}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm text-medium-gray">{label}</p>
          <p className="mt-1 text-2xl font-bold text-charcoal">{value}</p>
        </div>
      </div>
    </div>
  );
}

function StatSkeleton() {
  return <div className="h-24 animate-pulse rounded-xl border border-light-gray bg-light-gray/40" />;
}

function Stars({ rating }: { rating: number | null }) {
  if (rating === null) return <span className="text-xs text-medium-gray">—</span>;
  return (
    <span className="flex items-center gap-1 text-sm">
      <Star className="h-3.5 w-3.5 fill-satin-gold text-satin-gold" />
      <span className="font-medium text-charcoal">{rating.toFixed(1)}</span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AnalyticsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['artisan', 'analytics'],
    queryFn: () => api.get<AnalyticsResponse>('/artisans/me/analytics'),
  });

  const totals = data?.totals;
  const products = data?.products ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-charcoal">Analytics</h1>
        <p className="mt-1 text-sm text-medium-gray">Insights about your shop&apos;s performance</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              icon={DollarSign}
              label="Total Revenue"
              value={formatPrice(totals?.revenue ?? 0)}
              color="bg-hunter-green"
            />
            <StatCard
              icon={ShoppingBag}
              label="Items Sold"
              value={String(totals?.orders ?? 0)}
              color="bg-satin-gold"
            />
            <StatCard
              icon={Eye}
              label="Total Views"
              value={String(totals?.views ?? 0)}
              color="bg-blue-500"
            />
            <StatCard
              icon={BarChart3}
              label="Products"
              value={String(products.length)}
              color="bg-purple-500"
            />
          </>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
          Failed to load analytics. Please try again.
        </div>
      )}

      {/* Per-product table */}
      {!isLoading && !error && products.length > 0 && (
        <div className="rounded-xl border border-light-gray bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-light-gray">
            <h2 className="text-base font-semibold text-charcoal">Product Breakdown</h2>
          </div>

          {/* Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-light-gray/40">
                <tr>
                  {['Product', 'Views', 'Sold', 'Revenue', 'Avg Rating', 'Reviews'].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-xs font-semibold text-medium-gray uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-light-gray">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-light-gray/20 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-charcoal max-w-[200px] truncate">
                      {p.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-medium-gray">{p.viewCount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-medium-gray">{p.purchaseCount}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-charcoal">
                      {formatPrice(p.revenue)}
                    </td>
                    <td className="px-6 py-4">
                      <Stars rating={p.avgRating} />
                    </td>
                    <td className="px-6 py-4 text-sm text-medium-gray">{p.reviewCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-light-gray">
            {products.map((p) => (
              <div key={p.id} className="px-4 py-4 space-y-2">
                <p className="font-medium text-charcoal text-sm">{p.name}</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-medium-gray">
                  <span>Views: <span className="font-medium text-charcoal">{p.viewCount.toLocaleString()}</span></span>
                  <span>Sold: <span className="font-medium text-charcoal">{p.purchaseCount}</span></span>
                  <span>Revenue: <span className="font-semibold text-hunter-green">{formatPrice(p.revenue)}</span></span>
                  <span className="flex items-center gap-1">Rating: <Stars rating={p.avgRating} /></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && products.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-hunter-green/10">
            <BarChart3 className="h-8 w-8 text-hunter-green" />
          </div>
          <p className="text-sm text-medium-gray max-w-xs">
            Add your first product to start tracking views, sales, and revenue here.
          </p>
        </div>
      )}
    </div>
  );
}
