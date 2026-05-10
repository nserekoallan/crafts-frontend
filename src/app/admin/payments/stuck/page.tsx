'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2, X, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { api, ApiError } from '@/lib/api';
import { useCurrency } from '@/lib/currency';

interface StuckPayment {
  paymentId: string;
  merchantReference: string | null;
  providerReference: string | null;
  provider: string;
  amount: number;
  currency: string;
  createdAt: string;
  ageMinutes: number;
  order: { id: string; orderNumber: string; total: number; currency: string };
  customer: {
    phone: string | null;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
  };
}

interface StuckResponse {
  data: { data: StuckPayment[] };
}

const CUTOFF_OPTIONS = [
  { value: 10, label: '> 10 min' },
  { value: 30, label: '> 30 min' },
  { value: 120, label: '> 2 h' },
  { value: 1440, label: '> 24 h' },
];

function ReasonDialog({
  title,
  ctaLabel,
  pendingLabel,
  paymentRef,
  onConfirm,
  onCancel,
  isPending,
}: {
  title: string;
  ctaLabel: string;
  pendingLabel: string;
  paymentRef: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [reason, setReason] = useState('');
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
          Forcing payment <span className="font-mono text-text-primary">{paymentRef}</span>. The
          customer and artisan will be notified, and the order status will change. This action is
          recorded against your admin account.
        </p>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder='Reason for forcing this status (e.g. "Customer confirmed payment via MTN reference X12345")'
          rows={3}
          className="w-full"
        />
        <div className="mt-4 flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => onConfirm(reason.trim())}
            disabled={isPending || reason.trim().length < 10}
            className="bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isPending ? pendingLabel : ctaLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function StuckPaymentsPage() {
  const queryClient = useQueryClient();
  const { formatPrice } = useCurrency();
  const [olderThanMinutes, setOlderThanMinutes] = useState(30);
  const [confirmTarget, setConfirmTarget] = useState<StuckPayment | null>(null);
  const [failTarget, setFailTarget] = useState<StuckPayment | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'payments', 'stuck', olderThanMinutes],
    queryFn: () =>
      api.get<StuckResponse>(`/admin/payments/stuck?olderThanMinutes=${olderThanMinutes}`),
    refetchInterval: 30_000,
  });

  const rows = data?.data?.data ?? [];

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'payments', 'stuck'] });
    setError(null);
  };

  const { mutate: forceConfirm, isPending: confirming } = useMutation({
    mutationFn: ({ paymentId, reason }: { paymentId: string; reason: string }) =>
      api.patch(`/admin/payments/${paymentId}/force-confirm`, { reason }),
    onSuccess: () => {
      setConfirmTarget(null);
      invalidate();
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : 'Force-confirm failed'),
  });

  const { mutate: forceFail, isPending: failing } = useMutation({
    mutationFn: ({ paymentId, reason }: { paymentId: string; reason: string }) =>
      api.patch(`/admin/payments/${paymentId}/force-fail`, { reason }),
    onSuccess: () => {
      setFailTarget(null);
      invalidate();
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : 'Force-fail failed'),
  });

  return (
    <>
      {confirmTarget && (
        <ReasonDialog
          title="Force confirm payment"
          ctaLabel="Force confirm"
          pendingLabel="Confirming…"
          paymentRef={confirmTarget.merchantReference ?? confirmTarget.providerReference ?? ''}
          isPending={confirming}
          onConfirm={(reason) => forceConfirm({ paymentId: confirmTarget.paymentId, reason })}
          onCancel={() => setConfirmTarget(null)}
        />
      )}

      {failTarget && (
        <ReasonDialog
          title="Force fail payment"
          ctaLabel="Force fail"
          pendingLabel="Failing…"
          paymentRef={failTarget.merchantReference ?? failTarget.providerReference ?? ''}
          isPending={failing}
          onConfirm={(reason) => forceFail({ paymentId: failTarget.paymentId, reason })}
          onCancel={() => setFailTarget(null)}
        />
      )}

      <div className="space-y-6">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-text-primary">Stuck Payments</h1>
          <p className="text-text-secondary">
            Payments still in PENDING after their initiation window. The reconciliation cron checks
            DusuPay every 10 minutes; anything still here typically needs manual confirmation.
          </p>
        </div>

        {error && (
          <div
            className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
            role="alert"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {CUTOFF_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setOlderThanMinutes(opt.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                olderThanMinutes === opt.value
                  ? 'bg-satin-gold/20 text-satin-gold'
                  : 'border border-border-dark text-text-secondary hover:border-white/30'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-border-dark bg-bg-elevated">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-text-secondary">Loading…</div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-12 text-center">
              <CheckCircle2 className="h-8 w-8 text-green-400" />
              <p className="text-sm text-text-secondary">
                Nothing stuck older than {olderThanMinutes} min. Reconciliation is keeping up.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border-dark text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    <th className="px-5 py-3">Order</th>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Provider</th>
                    <th className="px-5 py-3">Reference</th>
                    <th className="px-5 py-3 text-right">Amount</th>
                    <th className="px-5 py-3 text-right">Age</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-dark">
                  {rows.map((p) => (
                    <tr key={p.paymentId} className="hover:bg-white/[0.03]">
                      <td className="px-5 py-3">
                        <div className="font-medium text-text-primary">{p.order.orderNumber}</div>
                        <div className="text-xs text-text-secondary">{p.order.id.slice(0, 8)}…</div>
                      </td>
                      <td className="px-5 py-3 text-text-secondary">
                        <div>
                          {p.customer.firstName ?? ''} {p.customer.lastName ?? ''}
                        </div>
                        <div className="text-xs">{p.customer.phone ?? p.customer.email ?? '—'}</div>
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant="default">{p.provider}</Badge>
                      </td>
                      <td className="px-5 py-3">
                        <div className="font-mono text-xs text-text-secondary" title={p.merchantReference ?? ''}>
                          {p.merchantReference?.slice(0, 12) ?? '—'}…
                        </div>
                        {!p.merchantReference && (
                          <div className="text-[10px] text-amber-400">no merchant ref</div>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right font-medium text-text-primary">
                        {formatPrice(p.amount)}
                      </td>
                      <td className="px-5 py-3 text-right text-text-secondary">
                        {p.ageMinutes < 60
                          ? `${p.ageMinutes}m`
                          : p.ageMinutes < 1440
                            ? `${Math.round(p.ageMinutes / 60)}h`
                            : `${Math.round(p.ageMinutes / 1440)}d`}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setConfirmTarget(p)}
                            className="rounded px-3 py-1 text-xs font-medium bg-green-500/15 text-green-400 hover:bg-green-500/20 transition-colors"
                          >
                            <span className="inline-flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Confirm
                            </span>
                          </button>
                          <button
                            onClick={() => setFailTarget(p)}
                            className="rounded px-3 py-1 text-xs font-medium bg-red-500/15 text-red-400 hover:bg-red-500/20 transition-colors"
                          >
                            <span className="inline-flex items-center gap-1">
                              <XCircle className="h-3 w-3" />
                              Fail
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
