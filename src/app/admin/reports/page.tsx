'use client';

import { BarChart3, Users, PieChart, MapPin, Loader2, Package, ShoppingCart } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface CountMeta { total: number }

function StatCard({ label, value, icon: Icon, color }: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-bg-elevated rounded-xl border border-border-dark p-6 flex items-center gap-4">
      <div className={`rounded-xl p-3 ${color}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-sm text-text-secondary">{label}</p>
        <p className="text-2xl font-bold text-text-primary">{value}</p>
      </div>
    </div>
  );
}

function StatSkeleton() {
  return <div className="h-24 animate-pulse rounded-xl border border-border-dark bg-bg-surface/60" />;
}

const REPORTS = [
  {
    id: 'sales',
    icon: BarChart3,
    title: 'Sales Report',
    description: 'Comprehensive sales data across all channels',
    color: 'text-gold bg-gold/10',
  },
  {
    id: 'artisan-performance',
    icon: Users,
    title: 'Artisan Performance',
    description: 'Individual artisan metrics and rankings',
    color: 'text-blue-400 bg-blue-500/15',
  },
  {
    id: 'category-analytics',
    icon: PieChart,
    title: 'Category Analytics',
    description: 'Product category performance breakdown',
    color: 'text-satin-gold bg-satin-gold/10',
  },
  {
    id: 'revenue-by-region',
    icon: MapPin,
    title: 'Revenue by Region',
    description: 'Geographic revenue distribution',
    color: 'text-saddle-brown bg-saddle-brown/10',
  },
] as const;

export default function ReportsPage() {
  const { data: artisanData, isLoading: artisansLoading } = useQuery({
    queryKey: ['admin', 'artisans-count'],
    queryFn: () => api.get<{ meta: CountMeta }>('/artisans/admin?limit=1'),
  });

  const { data: productData, isLoading: productsLoading } = useQuery({
    queryKey: ['admin', 'products-count'],
    queryFn: () => api.get<{ meta: CountMeta }>('/products?limit=1'),
  });

  const { data: pendingData, isLoading: pendingLoading } = useQuery({
    queryKey: ['admin', 'pending-count'],
    queryFn: () => api.get<{ meta: CountMeta }>('/products?status=PENDING_QC&limit=1'),
  });

  const { data: userData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin', 'users-count'],
    queryFn: () => api.get<{ meta: CountMeta }>('/users?limit=1'),
  });

  const isLoading = artisansLoading || productsLoading || pendingLoading || usersLoading;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Reports</h1>
        <p className="text-text-secondary">Platform overview and analytics</p>
      </div>

      {/* Live platform stats */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary mb-4">
          Live Platform Stats
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
          ) : (
            <>
              <StatCard
                label="Total Artisans"
                value={artisanData?.meta?.total ?? '—'}
                icon={Users}
                color="bg-hunter-green"
              />
              <StatCard
                label="Total Products"
                value={productData?.meta?.total ?? '—'}
                icon={Package}
                color="bg-satin-gold"
              />
              <StatCard
                label="Pending QC"
                value={pendingData?.meta?.total ?? '—'}
                icon={ShoppingCart}
                color="bg-terracotta"
              />
              <StatCard
                label="Platform Users"
                value={userData?.meta?.total ?? '—'}
                icon={Users}
                color="bg-white/10"
              />
            </>
          )}
        </div>
      </div>

      {/* Report Cards */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary mb-4">
          Generate Reports
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {REPORTS.map((report) => {
            const Icon = report.icon;
            return (
              <div
                key={report.id}
                className="bg-bg-elevated rounded-xl border border-border-dark p-6 space-y-4"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${report.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-text-primary mb-1">{report.title}</h3>
                    <p className="text-sm text-text-secondary">{report.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-text-secondary bg-bg-surface rounded px-2.5 py-1">
                    Coming soon
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
