'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, X, CheckSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/lib/currency';
import type { ApiProduct, ApiProductsResponse } from '@/lib/types/product';

// ---------------------------------------------------------------------------
// Types & constants
// ---------------------------------------------------------------------------

type BadgeVariant = 'default' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  ACTIVE: 'delivered',
  PENDING_QC: 'processing',
  DRAFT: 'default',
  REJECTED: 'cancelled',
  SUSPENDED: 'cancelled',
};

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PENDING_QC', label: 'Pending QC' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'SUSPENDED', label: 'Suspended' },
];

// ---------------------------------------------------------------------------
// Reject dialog
// ---------------------------------------------------------------------------

function ReasonDialog({
  title,
  productName,
  ctaLabel,
  pendingLabel,
  placeholder,
  onConfirm,
  onCancel,
  isPending,
}: {
  title: string;
  productName: string;
  ctaLabel: string;
  pendingLabel: string;
  placeholder: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [reason, setReason] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-bg-surface p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
          <button onClick={onCancel} className="text-text-secondary hover:text-text-primary">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-text-secondary mb-4">
          <span className="font-medium text-text-primary">{productName}</span> — the artisan will be notified with your reason.
        </p>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full"
        />
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="secondary" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => onConfirm(reason.trim())}
            disabled={isPending || !reason.trim()}
            className="bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isPending ? pendingLabel : ctaLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const { formatPrice } = useCurrency();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [rejectTarget, setRejectTarget] = useState<ApiProduct | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<ApiProduct | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkReasonOpen, setBulkReasonOpen] = useState<'reject' | 'suspend' | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'products', statusFilter, search],
    queryFn: () => {
      const params = new URLSearchParams({ limit: '50' });
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (search.trim()) params.set('search', search.trim());
      return api.get<ApiProductsResponse>(`/products?${params}`);
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    queryClient.invalidateQueries({ queryKey: ['admin', 'queue', 'pendingQC'] });
  };

  const { mutate: suspendProduct, isPending: isSuspending } = useMutation({
    mutationFn: ({ productId, reason }: { productId: string; reason: string }) =>
      api.patch(`/products/${productId}/suspend`, { reason }),
    onSuccess: () => {
      setSuspendTarget(null);
      invalidate();
    },
  });

  const { mutate: unsuspendProduct, variables: unsuspendingId } = useMutation({
    mutationFn: (productId: string) => api.patch(`/products/${productId}/unsuspend`, {}),
    onSuccess: invalidate,
  });

  const { mutate: approveProduct, variables: approvingId, isPending: isApproving } = useMutation({
    mutationFn: (productId: string) => api.patch(`/products/${productId}/approve`, {}),
    onSuccess: invalidate,
  });

  const { mutate: rejectProduct, isPending: isRejecting } = useMutation({
    mutationFn: ({ productId, reason }: { productId: string; reason: string }) =>
      api.patch(`/products/${productId}/reject`, { reason }),
    onSuccess: () => {
      setRejectTarget(null);
      invalidate();
    },
  });

  const { mutate: bulkAction, isPending: isBulkPending } = useMutation({
    mutationFn: ({ action, reason }: { action: 'approve' | 'reject' | 'suspend'; reason?: string }) =>
      api.patch('/products/bulk', { ids: Array.from(selected), action, reason }),
    onSuccess: () => {
      setSelected(new Set());
      setBulkReasonOpen(null);
      invalidate();
    },
  });

  const products = data?.data ?? [];

  const allVisibleIds = products.map((p: ApiProduct) => p.id);
  const allSelected = allVisibleIds.length > 0 && allVisibleIds.every((id: string) => selected.has(id));
  const someSelected = selected.size > 0;

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(allVisibleIds));
    }
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const ActionButtons = ({ product }: { product: ApiProduct }) => {
    const isPendingQC = product.status === 'PENDING_QC';
    const isActive = product.status === 'ACTIVE';
    const isSuspended = product.status === 'SUSPENDED';
    const isThisApproving = isApproving && approvingId === product.id;

    return (
      <div className="flex items-center justify-end gap-2">
        {isPendingQC && (
          <>
            <button
              disabled={isThisApproving}
              onClick={() => approveProduct(product.id)}
              className="rounded px-3 py-1 text-xs font-medium bg-green-500/15 text-green-400 hover:bg-green-500/20 disabled:opacity-50 transition-colors"
            >
              {isThisApproving ? 'Approving…' : 'Approve'}
            </button>
            <button
              onClick={() => setRejectTarget(product)}
              className="rounded px-3 py-1 text-xs font-medium bg-red-500/15 text-red-400 hover:bg-red-500/20 transition-colors"
            >
              Reject
            </button>
          </>
        )}
        {isActive && (
          <button
            onClick={() => setSuspendTarget(product)}
            className="rounded px-3 py-1 text-xs font-medium bg-red-500/15 text-red-400 hover:bg-red-500/20 transition-colors"
          >
            Suspend
          </button>
        )}
        {isSuspended && (
          <button
            disabled={unsuspendingId === product.id}
            onClick={() => unsuspendProduct(product.id)}
            className="rounded px-3 py-1 text-xs font-medium bg-green-500/15 text-green-400 hover:bg-green-500/20 disabled:opacity-50 transition-colors"
          >
            Unsuspend
          </button>
        )}
      </div>
    );
  };

  return (
    <>
      {bulkReasonOpen && (
        <ReasonDialog
          title={bulkReasonOpen === 'reject' ? 'Bulk Reject Products' : 'Bulk Suspend Products'}
          productName={`${selected.size} selected product${selected.size !== 1 ? 's' : ''}`}
          ctaLabel={bulkReasonOpen === 'reject' ? 'Reject All' : 'Suspend All'}
          pendingLabel={isBulkPending ? 'Processing…' : bulkReasonOpen === 'reject' ? 'Reject All' : 'Suspend All'}
          placeholder={`Reason for ${bulkReasonOpen}…`}
          isPending={isBulkPending}
          onConfirm={(reason) => bulkAction({ action: bulkReasonOpen, reason })}
          onCancel={() => setBulkReasonOpen(null)}
        />
      )}

      {rejectTarget && (
        <ReasonDialog
          title="Reject Product"
          productName={rejectTarget.name}
          ctaLabel="Reject"
          pendingLabel="Rejecting…"
          placeholder="Reason for rejection (required)…"
          isPending={isRejecting}
          onConfirm={(reason) => rejectProduct({ productId: rejectTarget.id, reason })}
          onCancel={() => setRejectTarget(null)}
        />
      )}

      {suspendTarget && (
        <ReasonDialog
          title="Suspend Product"
          productName={suspendTarget.name}
          ctaLabel="Suspend"
          pendingLabel="Suspending…"
          placeholder="Reason for suspension (required)…"
          isPending={isSuspending}
          onConfirm={(reason) => suspendProduct({ productId: suspendTarget.id, reason })}
          onCancel={() => setSuspendTarget(null)}
        />
      )}

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Products</h1>
          <p className="text-text-secondary">Review and manage all marketplace products</p>
        </div>

        {/* Filters */}
        <div className="bg-bg-elevated rounded-xl border border-border-dark p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <input
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-border-dark bg-bg-primary text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent placeholder:text-text-tertiary"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  statusFilter === f.value
                    ? 'bg-hunter-green text-white'
                    : 'bg-white/[0.05] text-text-secondary hover:bg-white/[0.08]'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Count + Bulk toolbar */}
        {!isLoading && (
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-text-secondary">
              Showing {products.length} product{products.length !== 1 ? 's' : ''}
              {someSelected && (
                <span className="ml-2 font-medium text-gold">({selected.size} selected)</span>
              )}
            </p>
            {someSelected && (
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs text-text-tertiary">
                  <CheckSquare className="h-4 w-4" />
                  Bulk:
                </span>
                <button
                  disabled={isBulkPending}
                  onClick={() => bulkAction({ action: 'approve' })}
                  className="rounded px-3 py-1 text-xs font-medium bg-green-500/15 text-green-400 hover:bg-green-500/20 disabled:opacity-50 transition-colors"
                >
                  Approve
                </button>
                <button
                  disabled={isBulkPending}
                  onClick={() => setBulkReasonOpen('reject')}
                  className="rounded px-3 py-1 text-xs font-medium bg-red-500/15 text-red-400 hover:bg-red-500/20 disabled:opacity-50 transition-colors"
                >
                  Reject
                </button>
                <button
                  disabled={isBulkPending}
                  onClick={() => setBulkReasonOpen('suspend')}
                  className="rounded px-3 py-1 text-xs font-medium bg-amber-500/15 text-amber-400 hover:bg-amber-500/20 disabled:opacity-50 transition-colors"
                >
                  Suspend
                </button>
                <button
                  onClick={() => setSelected(new Set())}
                  className="rounded p-1 text-text-tertiary hover:text-text-primary transition-colors"
                  title="Clear selection"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-bg-surface/60" />
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-500/10 p-4 text-sm text-red-400">Failed to load products.</div>
        )}

        {/* Desktop Table */}
        {!isLoading && !error && products.length > 0 && (
          <div className="hidden md:block bg-bg-elevated rounded-xl border border-border-dark overflow-hidden">
            <table className="w-full">
              <thead className="bg-bg-surface/60">
                <tr>
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      className="h-4 w-4 rounded accent-gold cursor-pointer"
                      title="Select all"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Artisan</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dark">
                {products.map((product: ApiProduct) => {
                  const thumb = product.images[0]?.url ?? '/products/product-01.jpg';
                  const isChecked = selected.has(product.id);
                  return (
                    <tr key={product.id} className={cn('transition-colors', isChecked ? 'bg-gold/[0.04]' : 'hover:bg-white/[0.03]')}>
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleOne(product.id)}
                          className="h-4 w-4 rounded accent-gold cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={thumb} alt={product.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                          <div>
                            <span className="text-sm font-medium text-text-primary line-clamp-2">{product.name}</span>
                            {product.variants && product.variants.length > 0 && (
                              <span className="ml-1.5 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-text-tertiary">
                                Variants: {product.variants.length}
                              </span>
                            )}
                            {product.isFeatured && product.featuredUntil && (() => {
                              const expires = new Date(product.featuredUntil);
                              const isFuture = expires > new Date();
                              const dateStr = expires.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                              return isFuture ? (
                                <span className="mt-0.5 inline-flex items-center rounded-full border border-gold/25 bg-gold/10 px-2 py-0.5 text-[10px] font-medium text-gold">
                                  Featured until {dateStr}
                                </span>
                              ) : (
                                <span className="mt-0.5 inline-flex items-center rounded-full border border-zinc-500/20 bg-zinc-500/10 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
                                  Featured (expired)
                                </span>
                              );
                            })()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-text-secondary">{product.artisan.businessName}</td>
                      <td className="px-6 py-4 text-sm text-text-primary">{product.category.name}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-text-primary">{formatPrice(Number(product.price))}</td>
                      <td className="px-6 py-4">
                        <Badge variant={STATUS_VARIANT[product.status] ?? 'default'}>
                          {product.status.replace('_', ' ')}
                        </Badge>
                        {product.status === 'PENDING_QC' && product.revertedFromActive && (
                          <p className="mt-1 text-[10px] uppercase tracking-wider text-amber-400">
                            Was live — re-review
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <ActionButtons product={product} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Mobile Cards */}
        {!isLoading && !error && products.length > 0 && (
          <div className="md:hidden space-y-4">
            {products.map((product: ApiProduct) => {
              const thumb = product.images[0]?.url ?? '/products/product-01.jpg';
              return (
                <div key={product.id} className="bg-bg-elevated rounded-xl border border-border-dark p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={thumb} alt={product.name} className="w-16 h-16 rounded-lg object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-text-primary line-clamp-2">{product.name}</p>
                      <p className="text-xs text-text-secondary mt-0.5">by {product.artisan.businessName}</p>
                      <div className="mt-1.5">
                        <Badge variant={STATUS_VARIANT[product.status] ?? 'default'}>
                          {product.status.replace('_', ' ')}
                        </Badge>
                        {product.status === 'PENDING_QC' && product.revertedFromActive && (
                          <p className="mt-1 text-[10px] uppercase tracking-wider text-amber-400">
                            Was live — re-review
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">{product.category.name}</span>
                    <span className="font-semibold text-text-primary">{formatPrice(Number(product.price))}</span>
                  </div>
                  <ActionButtons product={product} />
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && products.length === 0 && (
          <div className="bg-bg-elevated rounded-xl border border-border-dark p-12 text-center">
            <p className="text-text-secondary">No products found</p>
          </div>
        )}
      </div>
    </>
  );
}
