'use client';

import { useState, useMemo } from 'react';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useArtisanProducts } from '@/hooks/use-artisan';
import type { ApiProduct } from '@/lib/types/product';
import { CreateProductDialog } from '@/components/dashboard/create-product-dialog';
import { EditProductDialog } from '@/components/dashboard/edit-product-dialog';
import { formatPrice, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';

type StatusFilter = 'all' | 'ACTIVE' | 'DRAFT' | 'PENDING_QC' | 'SUSPENDED';

const STATUS_FILTERS: StatusFilter[] = ['all', 'ACTIVE', 'DRAFT', 'PENDING_QC', 'SUSPENDED'];

const STATUS_LABELS: Record<string, string> = {
  all: 'All',
  ACTIVE: 'Active',
  DRAFT: 'Draft',
  PENDING_QC: 'Pending QC',
  SUSPENDED: 'Suspended',
};

function getStatusVariant(status: string): 'default' | 'pending' | 'cancelled' {
  if (status === 'ACTIVE') return 'default';
  if (status === 'DRAFT' || status === 'PENDING_QC') return 'pending';
  return 'cancelled';
}

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<ApiProduct | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data, isLoading, error } = useArtisanProducts();
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

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="mt-1 text-sm text-medium-gray">Manage your product listings</p>
        </div>
        <Button variant="primary" onClick={() => setCreateOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-medium-gray" />
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
                  : 'border border-light-gray text-medium-gray hover:border-charcoal',
              )}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="mt-6 overflow-x-auto rounded-xl border border-light-gray bg-white">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-medium-gray">Loading products…</div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-500">Failed to load products.</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-medium-gray">
            {products.length === 0 ? 'No products yet. Add your first product.' : 'No products match your filters.'}
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-light-gray text-xs font-semibold uppercase tracking-wider text-medium-gray">
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Stock</th>
                <th className="px-5 py-3 text-right">Price</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-gray">
              {filtered.map((product) => (
                <tr key={product.id} className="hover:bg-light-gray/30">
                  <td className="px-5 py-3 font-medium">{product.name}</td>
                  <td className="px-5 py-3">
                    <Badge variant={getStatusVariant(product.status)}>
                      {STATUS_LABELS[product.status] ?? product.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-medium-gray">{product.stock}</td>
                  <td className="px-5 py-3 text-right font-medium">{formatPrice(Number(product.price))}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditProduct(product)}
                        className="rounded p-1.5 hover:bg-light-gray transition-colors text-medium-gray hover:text-charcoal"
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
                            className="rounded px-2 py-1 text-xs font-medium text-medium-gray hover:text-charcoal"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(product.id)}
                          className="rounded p-1.5 hover:bg-red-50 transition-colors text-medium-gray hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
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
