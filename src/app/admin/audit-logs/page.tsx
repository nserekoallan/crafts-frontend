'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AuditLogUser {
  id: string;
  email: string | null;
  role: string;
  profile: { firstName: string; lastName: string } | null;
}

interface AuditLog {
  id: string;
  action: string;
  resource: string;
  resourceId: string | null;
  userId: string | null;
  ip: string | null;
  changes: unknown;
  createdAt: string;
  user: AuditLogUser | null;
}

interface AuditLogResponse {
  data: AuditLog[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  UPDATE: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  DELETE: 'bg-red-500/15 text-red-400 border-red-500/20',
  APPROVE: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  REJECT: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
};

function actionColor(action: string): string {
  const key = Object.keys(ACTION_COLORS).find((k) => action.toUpperCase().includes(k));
  return key
    ? ACTION_COLORS[key]
    : 'bg-zinc-500/15 text-zinc-400 border-zinc-500/20';
}

function formatUser(log: AuditLog): string {
  if (!log.user) return log.userId ?? 'System';
  const { profile } = log.user;
  if (profile?.firstName || profile?.lastName) {
    return `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim();
  }
  return log.user.email ?? log.userId ?? 'Unknown';
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const RESOURCE_OPTIONS = [
  '', 'user', 'artisan', 'product', 'order', 'coupon', 'category', 'collection', 'payment',
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'audit-logs', page, actionFilter, resourceFilter],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), limit: '50' });
      if (actionFilter.trim()) params.set('action', actionFilter.trim());
      if (resourceFilter) params.set('resource', resourceFilter);
      return api.get<AuditLogResponse>(`/admin/audit-logs?${params}`);
    },
  });

  const logs = data?.data ?? [];
  const meta = data?.meta;

  function handleFilterChange() {
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Audit Logs</h1>
        <p className="mt-1 text-sm text-text-secondary">Platform activity history</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Filter by action…"
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); handleFilterChange(); }}
          className="rounded-lg border border-border-dark bg-bg-elevated px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-gold focus:outline-none w-48"
        />
        <select
          value={resourceFilter}
          onChange={(e) => { setResourceFilter(e.target.value); handleFilterChange(); }}
          className="rounded-lg border border-border-dark bg-bg-elevated px-3 py-2 text-sm text-text-primary focus:border-gold focus:outline-none"
        >
          <option value="">All resources</option>
          {RESOURCE_OPTIONS.filter(Boolean).map((r) => (
            <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-xl bg-bg-surface/60" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl bg-red-500/10 p-4 text-sm text-red-400">
          Failed to load audit logs.
        </div>
      ) : logs.length === 0 ? (
        <div className="rounded-xl border border-border-dark bg-bg-elevated p-12 text-center">
          <p className="text-text-secondary">No audit logs found.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border-dark bg-bg-elevated overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-dark bg-bg-surface/40">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-tertiary">Time</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-tertiary">Action</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-tertiary">Resource</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-tertiary">Resource ID</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-tertiary">User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dark">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3 text-text-tertiary whitespace-nowrap" title={new Date(log.createdAt).toISOString()}>
                    {timeAgo(log.createdAt)}
                  </td>
                  <td className="px-5 py-3">
                    <span className={cn('inline-flex rounded-full border px-2 py-0.5 text-xs font-medium', actionColor(log.action))}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-flex rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-400">
                      {log.resource}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-text-tertiary">
                    {log.resourceId ? log.resourceId.slice(0, 8) + '…' : '—'}
                  </td>
                  <td className="px-5 py-3 text-text-secondary">
                    {formatUser(log)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-tertiary">
            Page {page} of {meta.totalPages} · {meta.total} entries
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-border-dark px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary disabled:opacity-40"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              disabled={page === meta.totalPages}
              className="rounded-lg border border-border-dark px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
