'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Star, UserCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreateArtisanDialog } from '@/components/admin/create-artisan-dialog';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Inline star rating widget
// ---------------------------------------------------------------------------

function InlineStarRating({ artisanId, initialRating }: { artisanId: string; initialRating: number | null }) {
  const queryClient = useQueryClient();
  const [optimisticRating, setOptimisticRating] = useState<number | null>(initialRating);
  const [hovered, setHovered] = useState(0);

  const { mutate } = useMutation({
    mutationFn: (rating: number) => api.patch(`/artisans/${artisanId}/rating`, { rating }),
    onMutate: (rating) => {
      const previous = optimisticRating;
      setOptimisticRating(rating);
      return { previous };
    },
    onError: (_err, _rating, context) => {
      setOptimisticRating(context?.previous ?? null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'artisans'] });
    },
  });

  const displayed = hovered || optimisticRating || 0;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => mutate(i)}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(0)}
          aria-label={`Rate ${i} star${i !== 1 ? 's' : ''}`}
          className="p-0.5 transition-transform hover:scale-110"
        >
          <Star
            className={cn(
              'h-4 w-4 transition-colors',
              i <= displayed ? 'fill-satin-gold text-satin-gold' : 'fill-none text-text-tertiary',
            )}
          />
        </button>
      ))}
    </div>
  );
}

type StatusFilter = 'all' | 'VERIFIED' | 'PENDING' | 'SUSPENDED';

interface ArtisanRow {
  id: string;
  businessName: string;
  region: string | null;
  status: 'VERIFIED' | 'PENDING' | 'SUSPENDED';
  adminRating: number | null;
  adminRatingNote: string | null;
  _count: { products: number };
  user: {
    email: string;
    profile: { firstName: string; lastName: string } | null;
  };
}

interface ArtisansResponse {
  data: ArtisanRow[];
  meta: { total: number; page: number; limit: number };
}

const STATUS_FILTERS: StatusFilter[] = ['all', 'VERIFIED', 'PENDING', 'SUSPENDED'];

const STATUS_LABELS: Record<StatusFilter, string> = {
  all: 'All',
  VERIFIED: 'Verified',
  PENDING: 'Pending',
  SUSPENDED: 'Suspended',
};

function getStatusVariant(status: string): 'default' | 'pending' | 'cancelled' {
  if (status === 'VERIFIED') return 'default';
  if (status === 'PENDING') return 'pending';
  return 'cancelled';
}

// ---------------------------------------------------------------------------
// Rating dialog
// ---------------------------------------------------------------------------

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            'h-7 w-7 cursor-pointer transition-colors',
            i <= (hovered || value) ? 'fill-satin-gold text-satin-gold' : 'fill-none text-text-tertiary',
          )}
          onClick={() => onChange(i)}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(0)}
        />
      ))}
    </div>
  );
}

function RateDialog({
  artisan,
  onClose,
}: {
  artisan: ArtisanRow;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(artisan.adminRating ?? 0);
  const [note, setNote] = useState(artisan.adminRatingNote ?? '');

  const { mutate, isPending } = useMutation({
    mutationFn: () => api.patch(`/artisans/${artisan.id}/rating`, { rating, note: note.trim() || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'artisans'] });
      onClose();
    },
  });

  const name = artisan.user.profile
    ? `${artisan.user.profile.firstName} ${artisan.user.profile.lastName}`
    : artisan.businessName;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-bg-surface p-6 shadow-xl">
        <h2 className="text-lg font-bold text-text-primary">Rate Artisan</h2>
        <p className="mt-1 text-sm text-text-secondary">{name} · {artisan.businessName}</p>

        <div className="mt-6 space-y-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-secondary">Quality Rating</p>
            <StarPicker value={rating} onChange={setRating} />
            {rating > 0 && (
              <p className="mt-1 text-xs text-text-secondary">
                {['', 'Poor', 'Below Average', 'Average', 'Good', 'Excellent'][rating]}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Internal Note (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note for internal reference…"
              rows={3}
              className="w-full resize-none rounded-lg border border-border-dark bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-gold focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-border-dark px-4 py-2 text-sm text-text-secondary hover:border-white/30"
          >
            Cancel
          </button>
          <button
            onClick={() => mutate()}
            disabled={rating === 0 || isPending}
            className="rounded-lg bg-hunter-green px-4 py-2 text-sm font-semibold text-white hover:bg-hunter-green/90 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
          >
            {isPending ? 'Saving…' : 'Save Rating'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ArtisansPage() {
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [ratingTarget, setRatingTarget] = useState<ArtisanRow | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'artisans'],
    queryFn: () => api.get<ArtisansResponse>('/artisans/admin').then((r) => r),
  });

  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/artisans/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'artisans'] }),
  });

  const artisans = data?.data ?? [];

  const filtered = useMemo(() => {
    if (filter === 'all') return artisans;
    return artisans.filter((a) => a.status === filter);
  }, [artisans, filter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Artisans</h1>
          <p className="mt-1 text-text-secondary">Manage artisan accounts and verifications</p>
        </div>
        <Button variant="primary" onClick={() => setDialogOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Artisan
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 rounded-xl border border-border-dark bg-bg-elevated p-4">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              filter === s
                ? 'bg-hunter-green text-white'
                : 'bg-white/[0.05] text-text-secondary hover:bg-white/[0.08]',
            )}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      <div className="text-sm text-text-secondary">
        Showing {filtered.length} artisan{filtered.length !== 1 ? 's' : ''}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border-dark bg-bg-elevated">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-text-secondary">Loading artisans…</div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-500">Failed to load artisans.</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 p-12 text-center">
            <UserCheck className="h-10 w-10 text-light-gray" />
            <p className="text-sm text-text-secondary">
              {artisans.length === 0 ? 'No artisans yet.' : 'No artisans match this filter.'}
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-bg-surface/60">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">Artisan</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">Region</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">Products</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">Status</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">Rating</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dark">
              {filtered.map((artisan) => {
                const name = artisan.user.profile
                  ? `${artisan.user.profile.firstName} ${artisan.user.profile.lastName}`
                  : artisan.user.email;

                return (
                  <tr key={artisan.id} className="transition-colors hover:bg-white/[0.03]">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-text-primary">{name}</p>
                        <p className="text-xs text-text-secondary">{artisan.businessName}</p>
                        <p className="text-xs text-text-secondary">{artisan.user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">{artisan.region ?? '—'}</td>
                    <td className="px-6 py-4 text-text-secondary">{artisan._count.products}</td>
                    <td className="px-6 py-4">
                      <Badge variant={getStatusVariant(artisan.status)}>
                        {STATUS_LABELS[artisan.status as StatusFilter] ?? artisan.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <InlineStarRating
                        artisanId={artisan.id}
                        initialRating={artisan.adminRating}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setRatingTarget(artisan)}
                          className="rounded-md border border-satin-gold/40 px-3 py-1 text-xs font-medium text-satin-gold hover:bg-satin-gold/10"
                        >
                          Rate
                        </button>
                        {artisan.status !== 'VERIFIED' && (
                          <button
                            onClick={() => updateStatus({ id: artisan.id, status: 'VERIFIED' })}
                            className="rounded-md border border-hunter-green px-3 py-1 text-xs font-medium text-hunter-green hover:bg-hunter-green hover:text-white"
                          >
                            Verify
                          </button>
                        )}
                        {artisan.status !== 'SUSPENDED' && (
                          <button
                            onClick={() => updateStatus({ id: artisan.id, status: 'SUSPENDED' })}
                            className="rounded-md border border-red-500/30 px-3 py-1 text-xs font-medium text-red-400 hover:bg-red-500/10"
                          >
                            Suspend
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <CreateArtisanDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['admin', 'artisans'] })}
      />

      {ratingTarget && (
        <RateDialog artisan={ratingTarget} onClose={() => setRatingTarget(null)} />
      )}
    </div>
  );
}
