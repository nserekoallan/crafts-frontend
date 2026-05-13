'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, X, Check, Loader2 } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderAmount: number | null;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
}

interface CouponsResponse {
  data: Coupon[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

interface CouponFormState {
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: string;
  minOrderAmount: string;
  maxUses: string;
  isActive: boolean;
  expiresAt: string;
}

const EMPTY_FORM: CouponFormState = {
  code: '',
  description: '',
  discountType: 'PERCENTAGE',
  discountValue: '',
  minOrderAmount: '',
  maxUses: '',
  isActive: true,
  expiresAt: '',
};

// ---------------------------------------------------------------------------
// CouponFormDialog
// ---------------------------------------------------------------------------

function CouponFormDialog({
  initial,
  onClose,
  onSave,
  isPending,
  error,
}: {
  initial: CouponFormState;
  onClose: () => void;
  onSave: (form: CouponFormState) => void;
  isPending: boolean;
  error: string | null;
}) {
  const [form, setForm] = useState<CouponFormState>(initial);
  const set = (key: keyof CouponFormState, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl bg-bg-surface border border-border-dark p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-text-primary">
            {initial.code ? 'Edit Coupon' : 'Create Coupon'}
          </h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Code *</label>
            <input
              value={form.code}
              onChange={(e) => set('code', e.target.value.toUpperCase())}
              placeholder="SAVE10"
              className="w-full rounded-lg border border-border-dark bg-bg-elevated px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-gold focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Description</label>
            <input
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="10% off your order"
              className="w-full rounded-lg border border-border-dark bg-bg-elevated px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-gold focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Type *</label>
              <select
                value={form.discountType}
                onChange={(e) => set('discountType', e.target.value)}
                className="w-full rounded-lg border border-border-dark bg-bg-elevated px-3 py-2 text-sm text-text-primary focus:border-gold focus:outline-none"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Value * {form.discountType === 'PERCENTAGE' ? '(%)' : '(UGX)'}
              </label>
              <input
                type="number"
                min="0"
                value={form.discountValue}
                onChange={(e) => set('discountValue', e.target.value)}
                placeholder={form.discountType === 'PERCENTAGE' ? '10' : '5000'}
                className="w-full rounded-lg border border-border-dark bg-bg-elevated px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-gold focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Min Order (UGX)</label>
              <input
                type="number"
                min="0"
                value={form.minOrderAmount}
                onChange={(e) => set('minOrderAmount', e.target.value)}
                placeholder="Optional"
                className="w-full rounded-lg border border-border-dark bg-bg-elevated px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-gold focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Max Uses</label>
              <input
                type="number"
                min="1"
                value={form.maxUses}
                onChange={(e) => set('maxUses', e.target.value)}
                placeholder="Unlimited"
                className="w-full rounded-lg border border-border-dark bg-bg-elevated px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-gold focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Expires At</label>
            <input
              type="datetime-local"
              value={form.expiresAt}
              onChange={(e) => set('expiresAt', e.target.value)}
              className="w-full rounded-lg border border-border-dark bg-bg-elevated px-3 py-2 text-sm text-text-primary focus:border-gold focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              role="switch"
              aria-checked={form.isActive}
              onClick={() => set('isActive', !form.isActive)}
              className={cn(
                'relative h-6 w-11 rounded-full border transition-colors focus:outline-none',
                form.isActive ? 'border-hunter-green bg-hunter-green' : 'border-border-dark bg-bg-surface',
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                  form.isActive ? 'translate-x-5' : 'translate-x-0.5',
                )}
              />
            </button>
            <span className="text-sm text-text-secondary">
              {form.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-400">{error}</p>
        )}

        <div className="mt-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-border-dark px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={isPending || !form.code || !form.discountValue}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-hunter-green px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {initial.code ? 'Save Changes' : 'Create Coupon'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CouponsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Coupon | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'coupons', page],
    queryFn: () => api.get<CouponsResponse>(`/coupons?page=${page}&limit=20`),
  });

  const coupons = data?.data ?? [];
  const meta = data?.meta;

  const { mutate: createCoupon, isPending: isCreating } = useMutation({
    mutationFn: (form: CouponFormState) =>
      api.post('/coupons', {
        code: form.code,
        description: form.description || undefined,
        discountType: form.discountType,
        discountValue: parseFloat(form.discountValue),
        minOrderAmount: form.minOrderAmount ? parseFloat(form.minOrderAmount) : undefined,
        maxUses: form.maxUses ? parseInt(form.maxUses, 10) : undefined,
        isActive: form.isActive,
        expiresAt: form.expiresAt || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
      setFormOpen(false);
      setFormError(null);
    },
    onError: (err) => {
      setFormError(err instanceof ApiError ? err.message : 'Failed to create coupon');
    },
  });

  const { mutate: updateCoupon, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, form }: { id: string; form: CouponFormState }) =>
      api.patch(`/coupons/${id}`, {
        code: form.code,
        description: form.description || undefined,
        discountType: form.discountType,
        discountValue: parseFloat(form.discountValue),
        minOrderAmount: form.minOrderAmount ? parseFloat(form.minOrderAmount) : null,
        maxUses: form.maxUses ? parseInt(form.maxUses, 10) : null,
        isActive: form.isActive,
        expiresAt: form.expiresAt || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
      setEditTarget(null);
      setFormError(null);
    },
    onError: (err) => {
      setFormError(err instanceof ApiError ? err.message : 'Failed to update coupon');
    },
  });

  const { mutate: deleteCoupon, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => api.delete(`/coupons/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
      setDeleteTarget(null);
    },
  });

  function openCreate() {
    setFormError(null);
    setFormOpen(true);
  }

  function openEdit(c: Coupon) {
    setFormError(null);
    setEditTarget(c);
  }

  function handleSave(form: CouponFormState) {
    if (editTarget) {
      updateCoupon({ id: editTarget.id, form });
    } else {
      createCoupon(form);
    }
  }

  const editInitial: CouponFormState = editTarget
    ? {
        code: editTarget.code,
        description: editTarget.description ?? '',
        discountType: editTarget.discountType,
        discountValue: String(editTarget.discountValue),
        minOrderAmount: editTarget.minOrderAmount ? String(editTarget.minOrderAmount) : '',
        maxUses: editTarget.maxUses ? String(editTarget.maxUses) : '',
        isActive: editTarget.isActive,
        expiresAt: editTarget.expiresAt
          ? new Date(editTarget.expiresAt).toISOString().slice(0, 16)
          : '',
      }
    : EMPTY_FORM;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Coupons</h1>
          <p className="mt-1 text-sm text-text-secondary">Create and manage discount codes</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-hunter-green px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          New Coupon
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-bg-surface/60" />
          ))}
        </div>
      ) : coupons.length === 0 ? (
        <div className="rounded-xl border border-border-dark bg-bg-elevated p-12 text-center">
          <p className="text-text-secondary">No coupons yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border-dark bg-bg-elevated overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-dark bg-bg-surface/40">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-tertiary">Code</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-tertiary">Discount</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-tertiary">Uses</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-tertiary">Expires</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-tertiary">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dark">
              {coupons.map((c) => {
                const expired = c.expiresAt && new Date(c.expiresAt) < new Date();
                return (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-sm font-semibold text-text-primary">{c.code}</span>
                      {c.description && (
                        <p className="text-xs text-text-tertiary mt-0.5">{c.description}</p>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-text-primary">
                      {c.discountType === 'PERCENTAGE'
                        ? `${c.discountValue}% off`
                        : `UGX ${Number(c.discountValue).toLocaleString()} off`}
                      {c.minOrderAmount && (
                        <span className="ml-1 text-xs text-text-tertiary">
                          (min UGX {Number(c.minOrderAmount).toLocaleString()})
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-text-secondary">
                      {c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ''}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-text-secondary">
                      {c.expiresAt
                        ? new Date(c.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      {expired ? (
                        <span className="inline-flex items-center rounded-full border border-orange-500/20 bg-orange-500/15 px-2 py-0.5 text-xs font-medium text-orange-400">
                          Expired
                        </span>
                      ) : c.isActive ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-400">
                          <Check className="h-3 w-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-zinc-500/20 bg-zinc-500/15 px-2 py-0.5 text-xs font-medium text-zinc-400">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(c)}
                          className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/[0.05] transition-colors"
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(c.id)}
                          className="p-1.5 rounded-lg text-text-secondary hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-tertiary">
            {meta.total} coupon{meta.total !== 1 ? 's' : ''}
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

      {/* Form dialog */}
      {(formOpen || editTarget) && (
        <CouponFormDialog
          initial={editInitial}
          onClose={() => {
            setFormOpen(false);
            setEditTarget(null);
            setFormError(null);
          }}
          onSave={handleSave}
          isPending={isCreating || isUpdating}
          error={formError}
        />
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-bg-surface border border-border-dark p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-text-primary">Delete Coupon?</h2>
            <p className="mt-2 text-sm text-text-secondary">This action cannot be undone.</p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-lg border border-border-dark px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteCoupon(deleteTarget)}
                disabled={isDeleting}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
