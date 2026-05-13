'use client';

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { DollarSign, ShoppingCart, Users, TrendingUp, Download } from 'lucide-react';
import { api } from '@/lib/api';

// ─── Types ───────────────────────────────────────────────────────────────────

interface TopArtisan {
  artisanId: string;
  businessName: string;
  revenue: number;
  orderCount: number;
}

interface TopCategory {
  category: string;
  orderCount: number;
}

interface RevenueDay {
  date: string;
  revenue: number;
}

interface ReportSummary {
  revenue: number;
  platformFees: number;
  orderCount: number;
  newCustomers: number;
  topArtisans: TopArtisan[];
  topCategories: TopCategory[];
  revenueByDay: RevenueDay[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'UGX',
    maximumFractionDigits: 0,
  }).format(value);
}

function offsetDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-bg-elevated rounded-xl border border-border-dark p-5 flex items-center gap-4">
      <div className={`rounded-xl p-3 ${color}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-sm text-text-secondary">{label}</p>
        <p className="text-xl font-bold text-text-primary">{value}</p>
      </div>
    </div>
  );
}

function KpiSkeleton() {
  return <div className="h-24 animate-pulse rounded-xl border border-border-dark bg-bg-surface/60" />;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary mb-4">
      {children}
    </h2>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type Preset = '7d' | '30d' | '90d' | 'custom';

export default function ReportsPage() {
  const [preset, setPreset] = useState<Preset>('30d');
  const [from, setFrom] = useState(offsetDate(30));
  const [to, setTo] = useState(todayStr());

  const applyPreset = useCallback(
    (p: Preset) => {
      setPreset(p);
      if (p === '7d') { setFrom(offsetDate(7)); setTo(todayStr()); }
      if (p === '30d') { setFrom(offsetDate(30)); setTo(todayStr()); }
      if (p === '90d') { setFrom(offsetDate(90)); setTo(todayStr()); }
    },
    [],
  );

  const { data, isLoading, isError } = useQuery<{ data: ReportSummary }>({
    queryKey: ['admin', 'reports', 'summary', from, to],
    queryFn: () => api.get(`/admin/reports/summary?from=${from}&to=${to}`),
    staleTime: 5 * 60 * 1000,
  });

  const summary = data?.data;

  function handleExportCsv() {
    if (!summary) return;
    const rows = [
      ['Date', 'Revenue', 'Platform Fees', 'Orders'],
      ...summary.revenueByDay.map((d) => [d.date, String(d.revenue), '', '']),
      ['TOTAL', String(summary.revenue), String(summary.platformFees), String(summary.orderCount)],
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crafts-report-${from}-${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const PRESETS: { key: Preset; label: string }[] = [
    { key: '7d', label: 'Last 7 days' },
    { key: '30d', label: 'Last 30 days' },
    { key: '90d', label: 'Last 90 days' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-1">Reports</h1>
          <p className="text-text-secondary">Platform analytics and revenue breakdown</p>
        </div>
        <button
          onClick={handleExportCsv}
          disabled={!summary}
          className="flex items-center gap-2 rounded-lg border border-gold/40 px-4 py-2 text-sm font-medium text-gold hover:bg-gold/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Date range controls */}
      <div className="flex flex-wrap items-center gap-3">
        {PRESETS.map((p) => (
          <button
            key={p.key}
            onClick={() => applyPreset(p.key)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              preset === p.key
                ? 'bg-gold text-bg-primary'
                : 'border border-border-dark text-text-secondary hover:border-gold/40 hover:text-text-primary'
            }`}
          >
            {p.label}
          </button>
        ))}
        <div className="flex items-center gap-2 ml-auto flex-wrap">
          <input
            type="date"
            value={from}
            max={to}
            onChange={(e) => { setFrom(e.target.value); setPreset('custom'); }}
            className="h-9 rounded-lg border border-border-dark bg-bg-elevated px-3 text-sm text-text-primary focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/20"
          />
          <span className="text-text-tertiary text-sm">to</span>
          <input
            type="date"
            value={to}
            min={from}
            max={todayStr()}
            onChange={(e) => { setTo(e.target.value); setPreset('custom'); }}
            className="h-9 rounded-lg border border-border-dark bg-bg-elevated px-3 text-sm text-text-primary focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/20"
          />
        </div>
      </div>

      {/* KPI Row */}
      <div>
        <SectionTitle>Key Metrics</SectionTitle>
        {isError ? (
          <p className="text-red-400 text-sm">Failed to load report data.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)
            ) : summary ? (
              <>
                <KpiCard label="Total Revenue" value={formatCurrency(summary.revenue)} icon={DollarSign} color="bg-hunter-green" />
                <KpiCard label="Platform Fees" value={formatCurrency(summary.platformFees)} icon={TrendingUp} color="bg-satin-gold" />
                <KpiCard label="Orders" value={summary.orderCount.toLocaleString()} icon={ShoppingCart} color="bg-blue-600" />
                <KpiCard label="New Customers" value={summary.newCustomers.toLocaleString()} icon={Users} color="bg-violet-600" />
              </>
            ) : null}
          </div>
        )}
      </div>

      {/* Revenue over time */}
      {!isLoading && summary && summary.revenueByDay.length > 0 && (
        <div>
          <SectionTitle>Revenue Over Time</SectionTitle>
          <div className="bg-bg-elevated rounded-xl border border-border-dark p-6">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={summary.revenueByDay} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#C9A84C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#888', fontSize: 11 }}
                  tickFormatter={(v: string) => v.slice(5)}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fill: '#888', fontSize: 11 }} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a18', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                  labelStyle={{ color: '#ccc' }}
                  formatter={(value) => [formatCurrency(Number(value ?? 0)), 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#C9A84C" strokeWidth={2} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Artisans */}
        {!isLoading && summary && (
          <div>
            <SectionTitle>Top Artisans</SectionTitle>
            <div className="bg-bg-elevated rounded-xl border border-border-dark overflow-hidden">
              {summary.topArtisans.length === 0 ? (
                <p className="p-6 text-sm text-text-secondary">No data for this period.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border-dark">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">#</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">Artisan</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-secondary">Revenue</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-secondary">Orders</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-dark">
                    {summary.topArtisans.map((a, i) => (
                      <tr key={a.artisanId} className="hover:bg-white/[0.02]">
                        <td className="px-4 py-3 text-text-tertiary font-mono">{i + 1}</td>
                        <td className="px-4 py-3 font-medium text-text-primary">{a.businessName}</td>
                        <td className="px-4 py-3 text-right text-gold font-medium">{formatCurrency(a.revenue)}</td>
                        <td className="px-4 py-3 text-right text-text-secondary">{a.orderCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Top Categories */}
        {!isLoading && summary && summary.topCategories.length > 0 && (
          <div>
            <SectionTitle>Top Categories</SectionTitle>
            <div className="bg-bg-elevated rounded-xl border border-border-dark p-6">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={summary.topCategories}
                  layout="vertical"
                  margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#888', fontSize: 11 }} />
                  <YAxis type="category" dataKey="category" tick={{ fill: '#ccc', fontSize: 12 }} width={100} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1a18', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                    formatter={(value) => [Number(value ?? 0), 'Orders']}
                  />
                  <Bar dataKey="orderCount" fill="#C9A84C" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
