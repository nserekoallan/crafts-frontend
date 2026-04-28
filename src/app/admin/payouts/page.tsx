'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Clock, DollarSign, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { formatPrice, cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PayoutArtisan {
  businessName: string;
  user: { email: string; profile: { firstName: string; lastName: string } | null };
}

interface Payout {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  artisan: PayoutArtisan;
}

interface PayoutsResponse {
  data: Payout[];
  meta: { total: number; page: number; limit: number };
}

type BadgeVariant = 'default' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  PENDING: 'pending',
  APPROVED: 'processing',
  PROCESSING: 'processing',
  COMPLETED: 'delivered',
  FAILED: 'cancelled',
};

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'FAILED', label: 'Failed' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AdminPayoutsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'payouts', statusFilter],
    queryFn: () => {
      const params = new URLSearchParams({ limit: '50' });
      if (statusFilter !== 'all') params.set('status', statusFilter);
      return api.get<PayoutsResponse>(`/artisans/payouts/admin?${params}`);
    },
  });

  const { mutate: updateStatus, variables: pendingVars } = useMutation({
    mutationFn: ({ payoutId, status }: { payoutId: string; status: string }) =>
      api.patch(`/artisans/payouts/admin/${payoutId}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'payouts'] });
    },
  });

  const payouts = data?.data ?? [];

  const pendingTotal = payouts.filter((p) => p.status === 'PENDING').reduce((s, p) => s + p.amount, 0);
  const processingTotal = payouts.filter((p) => p.status === 'PROCESSING' || p.status === 'APPROVED').reduce((s, p) => s + p.amount, 0);
  const completedTotal = payouts.filter((p) => p.status === 'COMPLETED').reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-charcoal mb-2">Payouts</h1>
        <p className="text-medium-gray">Manage artisan payout requests</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-light-gray p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-medium-gray mb-1">Total Pending</p>
            <p className="text-2xl font-bold text-charcoal">{formatPrice(pendingTotal)}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-light-gray p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-medium-gray mb-1">Processing</p>
            <p className="text-2xl font-bold text-charcoal">{formatPrice(processingTotal)}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-light-gray p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-medium-gray mb-1">Completed</p>
            <p className="text-2xl font-bold text-charcoal">{formatPrice(completedTotal)}</p>
          </div>
        </div>
      </div>

      {/* Status Filter */}
      <div className="bg-white rounded-xl border border-light-gray p-2">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                statusFilter === f.value
                  ? 'bg-hunter-green text-white'
                  : 'bg-transparent text-charcoal hover:bg-light-gray'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-light-gray/60" />
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">Failed to load payouts.</div>
      )}

      {/* Desktop Table */}
      {!isLoading && !error && payouts.length > 0 && (
        <div className="hidden md:block bg-white rounded-xl border border-light-gray overflow-hidden">
          <table className="w-full">
            <thead className="bg-light-gray/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-medium-gray uppercase tracking-wider">Artisan</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-medium-gray uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-medium-gray uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-medium-gray uppercase tracking-wider">Requested</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-medium-gray uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-gray">
              {payouts.map((payout) => {
                const isUpdating = pendingVars?.payoutId === payout.id;
                const artisanName = payout.artisan.businessName;
                return (
                  <tr key={payout.id} className="hover:bg-light-gray/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-charcoal">{artisanName}</p>
                      <p className="text-xs text-medium-gray">{payout.artisan.user.email}</p>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-charcoal">{formatPrice(payout.amount)}</td>
                    <td className="px-6 py-4">
                      <Badge variant={STATUS_VARIANT[payout.status] ?? 'default'}>
                        {payout.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-medium-gray">
                      {new Date(payout.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {payout.status === 'PENDING' && (
                        <button
                          disabled={isUpdating}
                          onClick={() => updateStatus({ payoutId: payout.id, status: 'APPROVED' })}
                          className="rounded px-3 py-1 text-xs font-medium bg-hunter-green text-white hover:bg-hunter-green/90 disabled:opacity-50 transition-colors"
                        >
                          Approve
                        </button>
                      )}
                      {payout.status === 'APPROVED' && (
                        <>
                          <button
                            disabled={isUpdating}
                            onClick={() => updateStatus({ payoutId: payout.id, status: 'PROCESSING' })}
                            className="rounded px-3 py-1 text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                          >
                            Mark Processing
                          </button>
                          <button
                            disabled={isUpdating}
                            onClick={() => updateStatus({ payoutId: payout.id, status: 'FAILED' })}
                            className="rounded px-3 py-1 text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50 transition-colors"
                          >
                            Fail
                          </button>
                        </>
                      )}
                      {payout.status === 'PROCESSING' && (
                        <button
                          disabled={isUpdating}
                          onClick={() => updateStatus({ payoutId: payout.id, status: 'COMPLETED' })}
                          className="rounded px-3 py-1 text-xs font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                          Mark Completed
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile Cards */}
      {!isLoading && !error && payouts.length > 0 && (
        <div className="md:hidden space-y-4">
          {payouts.map((payout) => {
            const isUpdating = pendingVars?.payoutId === payout.id;
            return (
              <div key={payout.id} className="bg-white rounded-xl border border-light-gray p-4 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-charcoal">{payout.artisan.businessName}</p>
                    <p className="text-xs text-medium-gray">{payout.artisan.user.email}</p>
                    <p className="text-lg font-bold text-charcoal mt-1">{formatPrice(payout.amount)}</p>
                  </div>
                  <Badge variant={STATUS_VARIANT[payout.status] ?? 'default'}>{payout.status}</Badge>
                </div>
                <p className="text-xs text-medium-gray">{new Date(payout.createdAt).toLocaleDateString()}</p>
                <div className="flex gap-2">
                  {payout.status === 'PENDING' && (
                    <button
                      disabled={isUpdating}
                      onClick={() => updateStatus({ payoutId: payout.id, status: 'APPROVED' })}
                      className="flex-1 rounded px-3 py-2 text-xs font-medium bg-hunter-green text-white disabled:opacity-50"
                    >
                      Approve
                    </button>
                  )}
                  {payout.status === 'APPROVED' && (
                    <>
                      <button
                        disabled={isUpdating}
                        onClick={() => updateStatus({ payoutId: payout.id, status: 'PROCESSING' })}
                        className="flex-1 rounded px-3 py-2 text-xs font-medium bg-blue-600 text-white disabled:opacity-50"
                      >
                        Processing
                      </button>
                      <button
                        disabled={isUpdating}
                        onClick={() => updateStatus({ payoutId: payout.id, status: 'FAILED' })}
                        className="flex-1 rounded px-3 py-2 text-xs font-medium bg-red-100 text-red-700 disabled:opacity-50"
                      >
                        Fail
                      </button>
                    </>
                  )}
                  {payout.status === 'PROCESSING' && (
                    <button
                      disabled={isUpdating}
                      onClick={() => updateStatus({ payoutId: payout.id, status: 'COMPLETED' })}
                      className="flex-1 rounded px-3 py-2 text-xs font-medium bg-green-600 text-white disabled:opacity-50"
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && payouts.length === 0 && (
        <div className="bg-white rounded-xl border border-light-gray p-12 text-center">
          <p className="text-medium-gray">No payout requests found</p>
        </div>
      )}
    </div>
  );
}
