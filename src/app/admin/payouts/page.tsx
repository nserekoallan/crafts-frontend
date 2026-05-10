'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, Clock, DollarSign, X, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { api, ApiError } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/lib/currency';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PayoutArtisan {
  businessName: string;
  user: {
    email?: string | null;
    phone?: string | null;
    profile?: { firstName?: string; lastName?: string } | null;
  };
}

interface Payout {
  id: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  approvedAt?: string | null;
  completedAt?: string | null;
  providerReference?: string | null;
  failureReason?: string | null;
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
  COMPLETED: 'delivered',
  FAILED: 'cancelled',
};

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'FAILED', label: 'Failed' },
];

// ---------------------------------------------------------------------------
// Action dialog (reason or reference)
// ---------------------------------------------------------------------------

function ActionDialog({
  title,
  artisanName,
  amount,
  currency,
  fieldLabel,
  fieldType,
  ctaLabel,
  pendingLabel,
  placeholder,
  minLength,
  onConfirm,
  onCancel,
  isPending,
}: {
  title: string;
  artisanName: string;
  amount: number;
  currency: string;
  fieldLabel: string;
  fieldType: 'reason' | 'reference';
  ctaLabel: string;
  pendingLabel: string;
  placeholder: string;
  minLength: number;
  onConfirm: (value: string) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [value, setValue] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-bg-surface p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
          <button onClick={onCancel} className="text-text-secondary hover:text-text-primary">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mb-4 text-sm text-text-secondary">
          <span className="font-medium text-text-primary">{artisanName}</span> · {currency}{' '}
          {Math.round(amount).toLocaleString('en-US')}
        </p>
        <label className="mb-1 block text-sm font-medium text-text-primary">{fieldLabel}</label>
        {fieldType === 'reason' ? (
          <Textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            rows={3}
          />
        ) : (
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
          />
        )}
        <div className="mt-4 flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => onConfirm(value.trim())}
            disabled={isPending || value.trim().length < minLength}
          >
            {isPending ? pendingLabel : ctaLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

type DialogTarget =
  | { kind: 'reject'; payout: Payout }
  | { kind: 'mark-sent'; payout: Payout }
  | { kind: 'mark-failed'; payout: Payout }
  | null;

export default function AdminPayoutsPage() {
  const queryClient = useQueryClient();
  const { formatPrice } = useCurrency();
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialog, setDialog] = useState<DialogTarget>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'payouts', statusFilter],
    queryFn: () => {
      const params = new URLSearchParams({ limit: '50' });
      if (statusFilter !== 'all') params.set('status', statusFilter);
      return api.get<PayoutsResponse>(`/artisans/payouts/admin?${params}`);
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'payouts'] });
    setActionError(null);
  };
  const onActionError = (err: unknown) => {
    setActionError(
      err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Action failed',
    );
  };

  const { mutate: approvePayout, variables: approvingId, isPending: isApproving } = useMutation({
    mutationFn: (payoutId: string) => api.patch(`/artisans/payouts/admin/${payoutId}/approve`, {}),
    onSuccess: invalidate,
    onError: onActionError,
  });

  const { mutate: rejectPayout, isPending: isRejecting } = useMutation({
    mutationFn: ({ payoutId, reason }: { payoutId: string; reason: string }) =>
      api.patch(`/artisans/payouts/admin/${payoutId}/reject`, { reason }),
    onSuccess: () => {
      setDialog(null);
      invalidate();
    },
    onError: onActionError,
  });

  const { mutate: markSent, isPending: isMarkingSent } = useMutation({
    mutationFn: ({ payoutId, providerReference }: { payoutId: string; providerReference: string }) =>
      api.patch(`/artisans/payouts/admin/${payoutId}/mark-sent`, { providerReference }),
    onSuccess: () => {
      setDialog(null);
      invalidate();
    },
    onError: onActionError,
  });

  const { mutate: markFailed, isPending: isMarkingFailed } = useMutation({
    mutationFn: ({ payoutId, reason }: { payoutId: string; reason: string }) =>
      api.patch(`/artisans/payouts/admin/${payoutId}/mark-failed`, { reason }),
    onSuccess: () => {
      setDialog(null);
      invalidate();
    },
    onError: onActionError,
  });

  const payouts = data?.data ?? [];
  const pendingTotal = payouts.filter((p) => p.status === 'PENDING').reduce((s, p) => s + p.amount, 0);
  const approvedTotal = payouts.filter((p) => p.status === 'APPROVED').reduce((s, p) => s + p.amount, 0);
  const completedTotal = payouts.filter((p) => p.status === 'COMPLETED').reduce((s, p) => s + p.amount, 0);

  return (
    <>
      {dialog?.kind === 'reject' && (
        <ActionDialog
          title="Reject payout request"
          artisanName={dialog.payout.artisan.businessName}
          amount={dialog.payout.amount}
          currency={dialog.payout.currency}
          fieldLabel="Reason"
          fieldType="reason"
          placeholder="Why is this being rejected?"
          ctaLabel="Reject"
          pendingLabel="Rejecting…"
          minLength={5}
          isPending={isRejecting}
          onConfirm={(reason) => rejectPayout({ payoutId: dialog.payout.id, reason })}
          onCancel={() => setDialog(null)}
        />
      )}
      {dialog?.kind === 'mark-sent' && (
        <ActionDialog
          title="Mark payout as sent"
          artisanName={dialog.payout.artisan.businessName}
          amount={dialog.payout.amount}
          currency={dialog.payout.currency}
          fieldLabel="Provider reference"
          fieldType="reference"
          placeholder="MoMo TX ID or bank reference"
          ctaLabel="Mark sent"
          pendingLabel="Marking…"
          minLength={3}
          isPending={isMarkingSent}
          onConfirm={(providerReference) =>
            markSent({ payoutId: dialog.payout.id, providerReference })
          }
          onCancel={() => setDialog(null)}
        />
      )}
      {dialog?.kind === 'mark-failed' && (
        <ActionDialog
          title="Mark payout failed"
          artisanName={dialog.payout.artisan.businessName}
          amount={dialog.payout.amount}
          currency={dialog.payout.currency}
          fieldLabel="Reason"
          fieldType="reason"
          placeholder="Provider error or reason"
          ctaLabel="Mark failed"
          pendingLabel="Marking…"
          minLength={5}
          isPending={isMarkingFailed}
          onConfirm={(reason) => markFailed({ payoutId: dialog.payout.id, reason })}
          onCancel={() => setDialog(null)}
        />
      )}

      <div className="space-y-6">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-text-primary">Payouts</h1>
          <p className="text-text-secondary">
            Approve, reject, or mark artisan payout requests. Money only moves on Mark Sent.
          </p>
        </div>

        {actionError && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400" role="alert">
            {actionError}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="flex items-center gap-4 rounded-xl border border-border-dark bg-bg-elevated p-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-500/15">
              <Clock className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <p className="mb-1 text-sm text-text-secondary">Pending</p>
              <p className="text-2xl font-bold text-text-primary">{formatPrice(pendingTotal)}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-border-dark bg-bg-elevated p-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-500/15">
              <DollarSign className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="mb-1 text-sm text-text-secondary">Approved (awaiting send)</p>
              <p className="text-2xl font-bold text-text-primary">{formatPrice(approvedTotal)}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-border-dark bg-bg-elevated p-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-500/15">
              <CheckCircle className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="mb-1 text-sm text-text-secondary">Completed</p>
              <p className="text-2xl font-bold text-text-primary">{formatPrice(completedTotal)}</p>
            </div>
          </div>
        </div>

        {/* Status Filter */}
        <div className="rounded-xl border border-border-dark bg-bg-elevated p-2">
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={cn(
                  'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                  statusFilter === f.value
                    ? 'bg-hunter-green text-white'
                    : 'bg-transparent text-text-primary hover:bg-white/[0.05]',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-bg-surface/60" />
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-red-500/10 p-4 text-sm text-red-400">Failed to load payouts.</div>
        )}

        {/* Table */}
        {!isLoading && !error && payouts.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-border-dark bg-bg-elevated">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-bg-surface/60">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">Artisan</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">Requested</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-secondary">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-dark">
                  {payouts.map((p) => {
                    const acting = approvingId === p.id;
                    return (
                      <tr key={p.id} className="hover:bg-white/[0.03]">
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-text-primary">{p.artisan.businessName}</p>
                          <p className="text-xs text-text-secondary">
                            {p.artisan.user.phone ?? p.artisan.user.email ?? '—'}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-text-primary">
                          {formatPrice(p.amount)}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={STATUS_VARIANT[p.status] ?? 'default'}>{p.status}</Badge>
                          {p.status === 'COMPLETED' && p.providerReference && (
                            <p className="mt-1 font-mono text-[10px] text-text-secondary">
                              ref: {p.providerReference.slice(0, 16)}…
                            </p>
                          )}
                          {p.status === 'FAILED' && p.failureReason && (
                            <p className="mt-1 text-[10px] text-red-400">{p.failureReason}</p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-text-secondary">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </td>
                        <td className="space-x-2 px-6 py-4 text-right">
                          {p.status === 'PENDING' && (
                            <>
                              <button
                                disabled={acting && isApproving}
                                onClick={() => approvePayout(p.id)}
                                className="rounded bg-green-500/15 px-3 py-1 text-xs font-medium text-green-400 transition-colors hover:bg-green-500/20 disabled:opacity-50"
                              >
                                {acting && isApproving ? 'Approving…' : 'Approve'}
                              </button>
                              <button
                                onClick={() => setDialog({ kind: 'reject', payout: p })}
                                className="rounded bg-red-500/15 px-3 py-1 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {p.status === 'APPROVED' && (
                            <>
                              <button
                                onClick={() => setDialog({ kind: 'mark-sent', payout: p })}
                                className="rounded bg-green-500/15 px-3 py-1 text-xs font-medium text-green-400 transition-colors hover:bg-green-500/20"
                              >
                                <span className="inline-flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3" /> Mark Sent
                                </span>
                              </button>
                              <button
                                onClick={() => setDialog({ kind: 'mark-failed', payout: p })}
                                className="rounded bg-red-500/15 px-3 py-1 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20"
                              >
                                <span className="inline-flex items-center gap-1">
                                  <XCircle className="h-3 w-3" /> Failed
                                </span>
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!isLoading && !error && payouts.length === 0 && (
          <div className="rounded-xl border border-border-dark bg-bg-elevated p-12 text-center">
            <p className="text-text-secondary">No payout requests in this state.</p>
          </div>
        )}
      </div>
    </>
  );
}
