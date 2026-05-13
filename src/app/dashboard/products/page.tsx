'use client';

import { useState, useMemo } from 'react';
import { Plus, Search, Pencil, Sparkles, Trash2, Eye, Send, AlertCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { useArtisanProducts, useArtisanFeaturedRequests, useRequestFeatured, useSubmitProduct } from '@/hooks/use-artisan';
import type { ApiProduct } from '@/lib/types/product';
import { CreateProductDialog } from '@/components/dashboard/create-product-dialog';
import { EditProductDialog } from '@/components/dashboard/edit-product-dialog';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/lib/currency';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { track } from '@/lib/analytics';

type StatusFilter = 'all' | 'ACTIVE' | 'DRAFT' | 'PENDING_QC' | 'REJECTED' | 'SUSPENDED';

const STATUS_FILTERS: StatusFilter[] = ['all', 'ACTIVE', 'DRAFT', 'PENDING_QC', 'REJECTED', 'SUSPENDED'];

const STATUS_LABELS: Record<string, string> = {
  all: 'All',
  ACTIVE: 'Active',
  DRAFT: 'Draft',
  PENDING_QC: 'Pending QC',
  REJECTED: 'Rejected',
  SUSPENDED: 'Suspended',
};

function getStatusVariant(status: string): 'default' | 'pending' | 'cancelled' {
  if (status === 'ACTIVE') return 'default';
  if (status === 'DRAFT' || status === 'PENDING_QC') return 'pending';
  return 'cancelled';
}

function isSubmittable(p: ApiProduct): boolean {
  if (p.status !== 'DRAFT' && p.status !== 'REJECTED') return false;
  if ((p.images?.length ?? 0) < 1) return false;
  if (Number(p.price) <= 0) return false;
  return true;
}

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const { formatPrice } = useCurrency();
  const { user } = useAuth();
  const artisanVerified = user?.artisan?.status === 'VERIFIED';
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<ApiProduct | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data, isLoading, error } = useArtisanProducts();
  const { data: featuredRequests } = useArtisanFeaturedRequests();
  const { mutate: requestFeatured } = useRequestFeatured();
  const { mutate: submitProduct, isPending: isSubmitting, variables: submittingId } = useSubmitProduct();

  const featuredStatusMap = useMemo(() => {
    const map = new Map<string, 'PENDING' | 'APPROVED' | 'REJECTED'>();
    (featuredRequests ?? []).forEach((r) => map.set(r.productId, r.status));
    return map;
  }, [featuredRequests]);
  const products = (data?.data ?? []) as ApiProduct[];

  const { mutate: deleteProduct, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artisan', 'products'] });
      setDeleteConfirm(null);
    },
  });

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [products, searchTerm, statusFilter]);

  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 3).length;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="mt-1 text-sm text-text-secondary">Manage your product listings</p>
        </div>
        <Button variant="primary" onClick={() => setCreateOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {!artisanVerified && (
        <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-400">
          Your account has not been verified. Please contact the admin to get verified.
        </div>
      )}

      {lowStockCount > 0 && (
        <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-400">
          {lowStockCount} of your product{lowStockCount !== 1 ? 's are' : ' is'} running low on stock. Restock soon to avoid missed orders.
        </div>
      )}

      {submitError && (
        <div
          className="mt-4 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
          role="alert"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <Input
            placeholder="Search products…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                statusFilter === s
                  ? 'bg-hunter-green text-white'
                  : 'border border-border-dark text-text-secondary hover:border-white/30',
              )}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="mt-6 overflow-x-auto rounded-xl border border-border-dark bg-bg-elevated">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-text-secondary">Loading products…</div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-500">Failed to load products.</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-text-secondary">
            {products.length === 0 ? 'No products yet. Add your first product.' : 'No products match your filters.'}
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border-dark text-xs font-semibold uppercase tracking-wider text-text-secondary">
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Stock</th>
                <th className="px-5 py-3 text-right">Price</th>
                <th className="px-5 py-3 text-right">Views</th>
                <th className="px-5 py-3 text-right">Actions</th>
                <th className="px-5 py-3 text-right">Featured</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dark">
              {filtered.map((product) => (
                <tr key={product.id} className="hover:bg-white/[0.03]">
                  <td className="px-5 py-3 font-medium">
                    {product.name}
                    {product.isFeatured && product.featuredUntil && (() => {
                      const expires = new Date(product.featuredUntil);
                      const isFuture = expires > new Date();
                      const dateStr = expires.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                      return isFuture ? (
                        <span className="ml-2 inline-flex items-center rounded-full border border-gold/25 bg-gold/10 px-2 py-0.5 text-[10px] font-medium text-gold">
                          Featured until {dateStr}
                        </span>
                      ) : (
                        <span className="ml-2 inline-flex items-center rounded-full border border-zinc-500/20 bg-zinc-500/10 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
                          Featured (expired)
                        </span>
                      );
                    })()}
                    {product.status === 'REJECTED' && product.rejectionReason && (
                      <p className="mt-1 inline-flex items-start gap-1 text-[11px] text-red-400">
                        <AlertCircle className="mt-px h-3 w-3 shrink-0" />
                        <span>Rejected: {product.rejectionReason}</span>
                      </p>
                    )}
                    {product.status === 'SUSPENDED' && product.suspensionReason && (
                      <p className="mt-1 inline-flex items-start gap-1 text-[11px] text-red-400">
                        <AlertCircle className="mt-px h-3 w-3 shrink-0" />
                        <span>Suspended: {product.suspensionReason}</span>
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant={getStatusVariant(product.status)}>
                      {STATUS_LABELS[product.status] ?? product.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-text-secondary">{product.stock}</span>
                      {product.stock === 0 ? (
                        <span className="rounded-full border border-red-500/20 bg-red-500/15 px-2 py-0.5 text-[10px] font-semibold text-red-400">
                          Out of Stock
                        </span>
                      ) : product.stock <= 3 ? (
                        <span className="rounded-full border border-amber-500/20 bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                          Low Stock
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className="font-medium">{formatPrice(Number(product.price))}</span>
                    {product.displayPrice != null && product.displayPrice !== Number(product.price) && (
                      <p className="mt-0.5 text-[11px] text-text-secondary">
                        Customer sees: {formatPrice(product.displayPrice)}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className="inline-flex items-center gap-1 text-sm text-text-secondary">
                      <Eye className="h-3.5 w-3.5" />
                      {(product.viewCount ?? 0).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {(product.status === 'DRAFT' || product.status === 'REJECTED') &&
                        (() => {
                          const submittable = isSubmittable(product) && artisanVerified;
                          const reason = !artisanVerified
                            ? 'Your account has not been verified. Please contact the admin to get verified.'
                            : (product.images?.length ?? 0) < 1
                              ? 'Add at least one image'
                              : Number(product.price) <= 0
                                ? 'Price must be greater than 0'
                                : '';
                          return (
                            <button
                              onClick={() => {
                                setSubmitError(null);
                                submitProduct(product.id, {
                                  onError: (err) => {
                                    const msg =
                                      err && typeof err === 'object' && 'message' in err
                                        ? String((err as { message: unknown }).message)
                                        : 'Failed to submit product';
                                    setSubmitError(msg);
                                  },
                                });
                              }}
                              disabled={!submittable || (isSubmitting && submittingId === product.id)}
                              className={cn(
                                'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40',
                                product.status === 'DRAFT'
                                  ? 'bg-gold text-bg-primary hover:bg-gold/90'
                                  : 'border border-gold/50 text-gold hover:bg-gold/10',
                              )}
                              title={submittable ? 'Submit for admin review' : reason}
                            >
                              <Send className="h-3 w-3" />
                              {isSubmitting && submittingId === product.id ? 'Submitting…' : 'Submit for Review'}
                            </button>
                          );
                        })()}
                      <button
                        onClick={() => setEditProduct(product)}
                        className="rounded p-1.5 hover:bg-white/[0.06] transition-colors text-text-secondary hover:text-text-primary"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      {deleteConfirm === product.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => deleteProduct(product.id)}
                            disabled={isDeleting}
                            className="rounded px-2 py-1 text-xs font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="rounded px-2 py-1 text-xs font-medium text-text-secondary hover:text-text-primary"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(product.id)}
                          className="rounded p-1.5 hover:bg-red-500/10 transition-colors text-text-secondary hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right">
                    {(() => {
                      const fs = featuredStatusMap.get(product.id);
                      if (product.isFeatured) {
                        return <span className="text-xs font-medium text-satin-gold">Featured</span>;
                      }
                      if (fs === 'PENDING') {
                        return <span className="text-xs text-amber-400">Pending review</span>;
                      }
                      if (fs === 'APPROVED') {
                        return <span className="text-xs font-medium text-emerald-400">Approved</span>;
                      }
                      if (product.status === 'ACTIVE') {
                        const isRejected = fs === 'REJECTED';
                        return (
                          <div className="flex flex-col items-end gap-1">
                            {isRejected && (
                              <span className="text-[10px] text-red-400">Rejected</span>
                            )}
                            <button
                              onClick={() => {
                                track('featured_requested', { product_id: product.id, product_name: product.name });
                                requestFeatured({ productId: product.id });
                              }}
                              className="inline-flex items-center gap-1 rounded-md border border-satin-gold/50 px-2 py-1 text-xs font-medium text-satin-gold hover:bg-satin-gold/10 transition-colors"
                              title={isRejected ? 'Request feature placement again' : 'Request featured spot'}
                            >
                              <Sparkles className="h-3 w-3" />
                              {isRejected ? 'Request Again' : 'Feature This Product'}
                            </button>
                          </div>
                        );
                      }
                      return <span className="text-xs text-text-secondary">—</span>;
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <CreateProductDialog open={createOpen} onClose={() => setCreateOpen(false)} />

      {editProduct && (
        <EditProductDialog
          product={editProduct}
          open={true}
          onClose={() => setEditProduct(null)}
        />
      )}
    </div>
  );
}
