'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import { formatPrice, cn } from '@/lib/utils';
import type { ApiProduct, ApiProductsResponse } from '@/lib/types/product';

// ---------------------------------------------------------------------------
// Types & constants
// ---------------------------------------------------------------------------

type BadgeVariant = 'default' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  ACTIVE: 'delivered',
  PENDING_QC: 'processing',
  DRAFT: 'default',
  SUSPENDED: 'cancelled',
};

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PENDING_QC', label: 'Pending QC' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SUSPENDED', label: 'Suspended' },
];

// ---------------------------------------------------------------------------
// Reject dialog
// ---------------------------------------------------------------------------

function RejectDialog({
  productName,
  onConfirm,
  onCancel,
  isPending,
}: {
  productName: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [reason, setReason] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-charcoal">Reject Product</h2>
          <button onClick={onCancel} className="text-medium-gray hover:text-charcoal">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-medium-gray mb-4">
          Rejecting <span className="font-medium text-charcoal">{productName}</span>. The artisan will be notified with your reason.
        </p>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for rejection (required)…"
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
            {isPending ? 'Rejecting…' : 'Reject'}
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
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [rejectTarget, setRejectTarget] = useState<ApiProduct | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'products', statusFilter, search],
    queryFn: () => {
      const params = new URLSearchParams({ limit: '50' });
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (search.trim()) params.set('search', search.trim());
      return api.get<ApiProductsResponse>(`/products?${params}`);
    },
  });

  const { mutate: suspendProduct, variables: suspendingId } = useMutation({
    mutationFn: (productId: string) =>
      api.patch(`/products/${productId}`, { status: 'SUSPENDED' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    },
  });

  const { mutate: approveProduct, variables: approvingId, isPending: isApproving } = useMutation({
    mutationFn: (productId: string) => api.patch(`/products/${productId}/approve`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    },
  });

  const { mutate: rejectProduct, isPending: isRejecting } = useMutation({
    mutationFn: ({ productId, reason }: { productId: string; reason: string }) =>
      api.patch(`/products/${productId}/reject`, { reason }),
    onSuccess: () => {
      setRejectTarget(null);
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    },
  });

  const products = data?.data ?? [];

  const ActionButtons = ({ product }: { product: ApiProduct }) => {
    const isPendingQC = product.status === 'PENDING_QC';
    const isThisApproving = isApproving && approvingId === product.id;

    return (
      <div className="flex items-center justify-end gap-2">
        {isPendingQC && (
          <>
            <button
              disabled={isThisApproving}
              onClick={() => approveProduct(product.id)}
              className="rounded px-3 py-1 text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50 transition-colors"
            >
              {isThisApproving ? 'Approving…' : 'Approve'}
            </button>
            <button
              onClick={() => setRejectTarget(product)}
              className="rounded px-3 py-1 text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
            >
              Reject
            </button>
          </>
        )}
        {!isPendingQC && product.status !== 'SUSPENDED' && (
          <button
            disabled={suspendingId === product.id}
            onClick={() => suspendProduct(product.id)}
            className="rounded px-3 py-1 text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50 transition-colors"
          >
            Suspend
          </button>
        )}
      </div>
    );
  };

  return (
    <>
      {rejectTarget && (
        <RejectDialog
          productName={rejectTarget.name}
          isPending={isRejecting}
          onConfirm={(reason) => rejectProduct({ productId: rejectTarget.id, reason })}
          onCancel={() => setRejectTarget(null)}
        />
      )}

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-charcoal mb-2">Products</h1>
          <p className="text-medium-gray">Review and manage all marketplace products</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-light-gray p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-medium-gray" />
            <input
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-hunter-green focus:border-transparent"
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
                    : 'bg-light-gray text-charcoal hover:bg-medium-gray/20'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        {!isLoading && (
          <p className="text-sm text-medium-gray">
            Showing {products.length} product{products.length !== 1 ? 's' : ''}
          </p>
        )}

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
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">Failed to load products.</div>
        )}

        {/* Desktop Table */}
        {!isLoading && !error && products.length > 0 && (
          <div className="hidden md:block bg-white rounded-xl border border-light-gray overflow-hidden">
            <table className="w-full">
              <thead className="bg-light-gray/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-medium-gray uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-medium-gray uppercase tracking-wider">Artisan</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-medium-gray uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-medium-gray uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-medium-gray uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-medium-gray uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-gray">
                {products.map((product: ApiProduct) => {
                  const thumb = product.images[0]?.url ?? '/products/product-01.jpg';
                  return (
                    <tr key={product.id} className="hover:bg-light-gray/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={thumb} alt={product.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                          <span className="text-sm font-medium text-charcoal line-clamp-2">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-medium-gray">{product.artisan.businessName}</td>
                      <td className="px-6 py-4 text-sm text-charcoal">{product.category.name}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-charcoal">{formatPrice(Number(product.price))}</td>
                      <td className="px-6 py-4">
                        <Badge variant={STATUS_VARIANT[product.status] ?? 'default'}>
                          {product.status.replace('_', ' ')}
                        </Badge>
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
                <div key={product.id} className="bg-white rounded-xl border border-light-gray p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={thumb} alt={product.name} className="w-16 h-16 rounded-lg object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-charcoal line-clamp-2">{product.name}</p>
                      <p className="text-xs text-medium-gray mt-0.5">by {product.artisan.businessName}</p>
                      <div className="mt-1.5">
                        <Badge variant={STATUS_VARIANT[product.status] ?? 'default'}>
                          {product.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-medium-gray">{product.category.name}</span>
                    <span className="font-semibold text-charcoal">{formatPrice(Number(product.price))}</span>
                  </div>
                  <ActionButtons product={product} />
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && products.length === 0 && (
          <div className="bg-white rounded-xl border border-light-gray p-12 text-center">
            <p className="text-medium-gray">No products found</p>
          </div>
        )}
      </div>
    </>
  );
}
