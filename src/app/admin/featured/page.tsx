'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

type StatusFilter = 'all' | 'PENDING' | 'APPROVED' | 'REJECTED';

interface FeaturedRequest {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  message: string | null;
  adminNote: string | null;
  createdAt: string;
  product: {
    id: string;
    name: string;
    images: { url: string; variants?: Record<string, string> }[];
  };
  artisan: {
    businessName: string;
    user: {
      profile: { firstName: string; lastName: string } | null;
    };
  };
}

interface FeaturedResponse {
  data: FeaturedRequest[];
  meta: { total: number; page: number; limit: number };
}

const STATUS_FILTERS: StatusFilter[] = ['all', 'PENDING', 'APPROVED', 'REJECTED'];

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-500/15 text-amber-400',
  APPROVED: 'bg-emerald-500/15 text-emerald-400',
  REJECTED: 'bg-red-500/15 text-red-400',
};

function RejectDialog({ id, onClose }: { id: string; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [note, setNote] = useState('');

  const { mutate, isPending } = useMutation({
    mutationFn: () => api.patch(`/featured-requests/${id}/reject`, { adminNote: note.trim() || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'featured-requests'] });
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl bg-bg-surface p-6 shadow-xl">
        <h2 className="text-base font-bold text-text-primary">Reject Feature Request</h2>
        <div className="mt-4 space-y-3">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional reason for the artisan…"
            rows={3}
            className="w-full resize-none rounded-lg border border-border-dark bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-gold focus:outline-none"
          />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border border-border-dark px-4 py-2 text-sm text-text-secondary hover:border-white/30">
            Cancel
          </button>
          <button
            onClick={() => mutate()}
            disabled={isPending}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {isPending ? 'Rejecting…' : 'Reject'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FeaturedRequestsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<StatusFilter>('PENDING');
  const [rejectId, setRejectId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'featured-requests', filter],
    queryFn: () =>
      api.get<FeaturedResponse>(`/featured-requests${filter !== 'all' ? `?status=${filter}` : ''}`),
  });

  const { mutate: approve } = useMutation({
    mutationFn: (id: string) => api.patch(`/featured-requests/${id}/approve`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'featured-requests'] }),
  });

  const requests = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Featured Requests</h1>
        <p className="mt-1 text-text-secondary">Approve or reject artisan requests for featured product placement</p>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2 rounded-xl border border-border-dark bg-bg-elevated p-4">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              filter === s ? 'bg-hunter-green text-white' : 'bg-white/[0.05] text-text-secondary hover:bg-white/[0.08]',
            )}
          >
            {s === 'all' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="rounded-xl border border-border-dark bg-bg-elevated p-8 text-center text-sm text-text-secondary">
            Loading…
          </div>
        ) : error ? (
          <div className="rounded-xl bg-red-500/10 p-4 text-sm text-red-400">Failed to load requests.</div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-border-dark bg-bg-elevated py-16 text-center">
            <Sparkles className="h-10 w-10 text-light-gray" />
            <p className="text-sm text-text-secondary">No {filter !== 'all' ? filter.toLowerCase() : ''} requests.</p>
          </div>
        ) : (
          requests.map((req) => {
            const artisanName = req.artisan.user.profile
              ? `${req.artisan.user.profile.firstName} ${req.artisan.user.profile.lastName}`
              : req.artisan.businessName;
            const thumb = req.product.images[0]?.variants?.['thumb'] ?? req.product.images[0]?.url;
            const date = new Date(req.createdAt).toLocaleDateString('en-UG', { year: 'numeric', month: 'short', day: 'numeric' });

            return (
              <div
                key={req.id}
                className="flex items-center gap-4 rounded-xl border border-border-dark bg-bg-elevated p-4 shadow-sm"
              >
                {/* Thumbnail */}
                {thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumb} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
                ) : (
                  <div className="h-14 w-14 shrink-0 rounded-lg bg-bg-surface/60" />
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text-primary truncate">{req.product.name}</p>
                  <p className="text-xs text-text-secondary">
                    {artisanName} · {req.artisan.businessName} · {date}
                  </p>
                  {req.message && (
                    <p className="mt-1 text-sm text-text-secondary italic">"{req.message}"</p>
                  )}
                  {req.adminNote && (
                    <p className="mt-1 text-xs text-red-500">Note: {req.adminNote}</p>
                  )}
                </div>

                {/* Status badge */}
                <span className={cn('shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold', STATUS_COLORS[req.status])}>
                  {req.status.charAt(0) + req.status.slice(1).toLowerCase()}
                </span>

                {/* Actions */}
                {req.status === 'PENDING' && (
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => approve(req.id)}
                      className="rounded-md border border-hunter-green px-3 py-1.5 text-xs font-medium text-hunter-green hover:bg-hunter-green hover:text-white transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setRejectId(req.id)}
                      className="rounded-md border border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {rejectId && <RejectDialog id={rejectId} onClose={() => setRejectId(null)} />}
    </div>
  );
}
