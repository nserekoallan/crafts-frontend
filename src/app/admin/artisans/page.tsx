'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, UserCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreateArtisanDialog } from '@/components/admin/create-artisan-dialog';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

type StatusFilter = 'all' | 'VERIFIED' | 'PENDING' | 'SUSPENDED';

interface ArtisanRow {
  id: string;
  businessName: string;
  region: string | null;
  status: 'VERIFIED' | 'PENDING' | 'SUSPENDED';
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

export default function ArtisansPage() {
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
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
          <h1 className="text-3xl font-bold text-charcoal">Artisans</h1>
          <p className="mt-1 text-medium-gray">Manage artisan accounts and verifications</p>
        </div>
        <Button variant="primary" onClick={() => setDialogOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Artisan
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 rounded-xl border border-light-gray bg-white p-4">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              filter === s
                ? 'bg-hunter-green text-white'
                : 'bg-light-gray text-charcoal hover:bg-medium-gray/20',
            )}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      <div className="text-sm text-medium-gray">
        Showing {filtered.length} artisan{filtered.length !== 1 ? 's' : ''}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-light-gray bg-white">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-medium-gray">Loading artisans…</div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-500">Failed to load artisans.</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 p-12 text-center">
            <UserCheck className="h-10 w-10 text-light-gray" />
            <p className="text-sm text-medium-gray">
              {artisans.length === 0 ? 'No artisans yet.' : 'No artisans match this filter.'}
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-light-gray/50">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-medium-gray">Artisan</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-medium-gray">Region</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-medium-gray">Products</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-medium-gray">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-medium-gray">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-gray">
              {filtered.map((artisan) => {
                const name = artisan.user.profile
                  ? `${artisan.user.profile.firstName} ${artisan.user.profile.lastName}`
                  : artisan.user.email;

                return (
                  <tr key={artisan.id} className="transition-colors hover:bg-light-gray/30">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-charcoal">{name}</p>
                        <p className="text-xs text-medium-gray">{artisan.businessName}</p>
                        <p className="text-xs text-medium-gray">{artisan.user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-medium-gray">{artisan.region ?? '—'}</td>
                    <td className="px-6 py-4 text-medium-gray">{artisan._count.products}</td>
                    <td className="px-6 py-4">
                      <Badge variant={getStatusVariant(artisan.status)}>
                        {STATUS_LABELS[artisan.status as StatusFilter] ?? artisan.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
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
                            className="rounded-md border border-red-300 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
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
    </div>
  );
}
