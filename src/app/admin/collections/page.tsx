'use client';

import { useState, type FormEvent } from 'react';
import { Layers, Loader2, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '@/lib/api';
import { Dialog } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
  sortOrder: number;
  productCount: number;
}

interface CollectionProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  category: string;
  imageUrl: string | null;
  status: string;
}

interface CollectionsResponse {
  data: Collection[];
}

interface SearchProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  status: string;
  category: { name: string };
  images: { url: string }[];
}

interface SearchResponse {
  data: SearchProduct[];
}

interface CollectionDetailResponse {
  data: Collection & { products: CollectionProduct[] };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// ---------------------------------------------------------------------------
// Collection form dialog
// ---------------------------------------------------------------------------

interface CollectionDialogProps {
  open: boolean;
  onClose: () => void;
  existing?: Collection;
}

function CollectionDialog({ open, onClose, existing }: CollectionDialogProps) {
  const queryClient = useQueryClient();
  const isEdit = !!existing;

  const [name, setName] = useState(existing?.name ?? '');
  const [slug, setSlug] = useState(existing?.slug ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [image, setImage] = useState(existing?.image ?? '');
  const [sortOrder, setSortOrder] = useState(String(existing?.sortOrder ?? 0));
  const [isActive, setIsActive] = useState(existing?.isActive ?? true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Product management (edit mode only)
  const [productSearch, setProductSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const { data: collectionDetail } = useQuery({
    queryKey: ['admin', 'collection-detail', existing?.id],
    queryFn: () =>
      api.get<CollectionDetailResponse>(`/collections/${existing!.slug}`),
    enabled: isEdit && open,
    staleTime: 10_000,
  });

  const collectionProducts: CollectionProduct[] =
    collectionDetail?.data?.products ?? [];

  const { data: searchData } = useQuery({
    queryKey: ['admin', 'product-search', productSearch],
    queryFn: () =>
      api.get<SearchResponse>(
        `/products?search=${encodeURIComponent(productSearch)}&limit=10`,
      ),
    enabled: productSearch.length > 1,
    staleTime: 10_000,
  });

  const searchResults: SearchProduct[] = searchData?.data ?? [];

  const { mutate: addProduct, isPending: addingProduct } = useMutation({
    mutationFn: (productId: string) =>
      api.post(`/collections/${existing!.id}/products`, {
        productIds: [productId],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'collection-detail', existing?.id],
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'collections'] });
    },
  });

  const { mutate: removeProduct } = useMutation({
    mutationFn: (productId: string) =>
      api.delete(`/collections/${existing!.id}/products/${productId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'collection-detail', existing?.id],
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'collections'] });
    },
  });

  function handleNameBlur() {
    if (!isEdit && !slug) {
      setSlug(slugify(name));
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }

    const payload = {
      name: name.trim(),
      slug: slug.trim() || undefined,
      description: description.trim() || undefined,
      image: image.trim() || undefined,
      isActive,
      sortOrder: parseInt(sortOrder, 10) || 0,
    };

    setSubmitting(true);
    try {
      if (isEdit) {
        await api.patch(`/collections/${existing!.id}`, payload);
      } else {
        await api.post('/collections', payload);
      }
      queryClient.invalidateQueries({ queryKey: ['admin', 'collections'] });
      onClose();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Failed to save collection.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  const inCollectionIds = new Set(collectionProducts.map((p) => p.id));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Collection' : 'New Collection'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">
            Name <span className="text-red-400">*</span>
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleNameBlur}
            className="w-full rounded-lg border border-border-dark bg-bg-surface px-3.5 py-2.5 text-sm text-text-primary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
            placeholder="African Baskets"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">
            Slug
          </label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full rounded-lg border border-border-dark bg-bg-surface px-3.5 py-2.5 font-mono text-sm text-text-primary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
            placeholder="african-baskets"
          />
          <p className="mt-1 text-xs text-text-tertiary">
            Auto-generated from name. Leave empty to auto-generate.
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full resize-none rounded-lg border border-border-dark bg-bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
            placeholder="Optional description…"
          />
        </div>

        {/* Image URL */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">
            Image URL
          </label>
          <input
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="w-full rounded-lg border border-border-dark bg-bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
            placeholder="https://…"
          />
        </div>

        {/* Sort order + Active */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">
              Sort order
            </label>
            <input
              type="number"
              min={0}
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full rounded-lg border border-border-dark bg-bg-surface px-3.5 py-2.5 text-sm text-text-primary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
            />
          </div>
          <div className="flex flex-col justify-end pb-0.5">
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">
              Active
            </label>
            <button
              type="button"
              role="switch"
              aria-checked={isActive}
              onClick={() => setIsActive(!isActive)}
              className={cn(
                'relative h-6 w-11 rounded-full border transition-colors',
                isActive
                  ? 'border-hunter-green bg-hunter-green'
                  : 'border-border-dark bg-bg-surface',
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                  isActive ? 'translate-x-5' : 'translate-x-0.5',
                )}
              />
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 rounded-lg bg-hunter-green px-5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? 'Save changes' : 'Create'}
          </button>
        </div>
      </form>

      {/* Product management — edit mode only */}
      {isEdit && (
        <div className="mt-6 border-t border-border-dark pt-5">
          <h3 className="mb-3 text-sm font-semibold text-text-primary">
            Products in this collection ({collectionProducts.length})
          </h3>

          {/* Products list */}
          {collectionProducts.length > 0 && (
            <div className="mb-4 max-h-48 overflow-y-auto space-y-2 rounded-lg border border-border-dark bg-bg-surface p-2">
              {collectionProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm text-text-primary">{p.name}</p>
                    <p className="text-[11px] text-text-tertiary">{p.category}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeProduct(p.id)}
                    className="shrink-0 rounded p-1 text-text-tertiary hover:bg-red-500/10 hover:text-red-400"
                    aria-label={`Remove ${p.name}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Product search */}
          <div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
                <input
                  value={productSearch}
                  onChange={(e) => {
                    setProductSearch(e.target.value);
                    setSearchOpen(true);
                  }}
                  onFocus={() => setSearchOpen(true)}
                  className="w-full rounded-lg border border-border-dark bg-bg-surface py-2 pl-9 pr-3.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                  placeholder="Search products to add…"
                />
              </div>
            </div>

            {searchOpen && productSearch.length > 1 && searchResults.length > 0 && (
              <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-border-dark bg-bg-surface">
                {searchResults.map((p) => {
                  const already = inCollectionIds.has(p.id);
                  return (
                    <div
                      key={p.id}
                      className="flex items-center justify-between gap-2 px-3 py-2.5 hover:bg-white/[0.03]"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm text-text-primary">{p.name}</p>
                        <p className="text-[11px] text-text-tertiary">
                          {p.category?.name} · {p.status}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={already || addingProduct}
                        onClick={() => {
                          addProduct(p.id);
                          setProductSearch('');
                          setSearchOpen(false);
                        }}
                        className="shrink-0 rounded px-2.5 py-1 text-xs font-semibold text-gold border border-gold/40 hover:bg-gold/10 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {already ? 'Added' : 'Add'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Delete confirm dialog
// ---------------------------------------------------------------------------

function DeleteDialog({
  open,
  onClose,
  collection,
}: {
  open: boolean;
  onClose: () => void;
  collection: Collection;
}) {
  const queryClient = useQueryClient();
  const [error, setError] = useState('');

  const { mutate: deleteCollection, isPending } = useMutation({
    mutationFn: () => api.delete(`/collections/${collection.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'collections'] });
      onClose();
    },
    onError: (err) => {
      setError(
        err instanceof ApiError ? err.message : 'Failed to delete collection.',
      );
    },
  });

  const hasProducts = collection.productCount > 0;

  return (
    <Dialog open={open} onClose={onClose} title="Delete Collection">
      <div className="space-y-4">
        {hasProducts ? (
          <p className="text-sm text-text-secondary">
            <span className="font-semibold text-text-primary">
              {collection.name}
            </span>{' '}
            has {collection.productCount} product
            {collection.productCount !== 1 ? 's' : ''}. Remove all products
            from the collection before deleting it.
          </p>
        ) : (
          <p className="text-sm text-text-secondary">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-text-primary">
              {collection.name}
            </span>
            ? This cannot be undone.
          </p>
        )}
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary"
          >
            Cancel
          </button>
          <button
            onClick={() => !hasProducts && deleteCollection()}
            disabled={isPending || hasProducts}
            className="flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {hasProducts ? 'Remove products first' : 'Delete'}
          </button>
        </div>
      </div>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminCollectionsPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<Collection | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Collection | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'collections'],
    queryFn: () => api.get<CollectionsResponse>('/collections'),
  });

  const { mutate: toggleActive } = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.patch(`/collections/${id}`, { isActive }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['admin', 'collections'] }),
  });

  const collections: Collection[] = Array.isArray(data?.data) ? data!.data : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Collections</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Curated product groups shown on the storefront
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-lg bg-hunter-green px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          New Collection
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-bg-surface/60" />
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-red-500/10 p-4 text-sm text-red-400">
          Failed to load collections.
        </div>
      )}

      {/* Desktop table */}
      {!isLoading && !error && collections.length > 0 && (
        <div className="hidden overflow-hidden rounded-xl border border-border-dark bg-bg-elevated md:block">
          <table className="w-full">
            <thead className="bg-bg-surface/60">
              <tr>
                {['Name', 'Slug', 'Products', 'Sort', 'Active', 'Actions'].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dark">
              {collections.map((col) => (
                <tr key={col.id} className="transition-colors hover:bg-white/[0.02]">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 shrink-0 text-text-tertiary" />
                      <span className="font-medium text-text-primary">{col.name}</span>
                    </div>
                    {col.description && (
                      <p className="mt-0.5 truncate text-xs text-text-tertiary max-w-xs">
                        {col.description}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-text-tertiary">
                    {col.slug}
                  </td>
                  <td className="px-5 py-3 text-sm text-text-secondary">
                    {col.productCount}
                  </td>
                  <td className="px-5 py-3 text-sm text-text-secondary">
                    {col.sortOrder}
                  </td>
                  <td className="px-5 py-3">
                    <button
                      role="switch"
                      aria-checked={col.isActive}
                      onClick={() =>
                        toggleActive({ id: col.id, isActive: !col.isActive })
                      }
                      className={cn(
                        'relative h-6 w-11 rounded-full border transition-colors',
                        col.isActive
                          ? 'border-hunter-green bg-hunter-green'
                          : 'border-border-dark bg-bg-surface',
                      )}
                    >
                      <span
                        className={cn(
                          'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                          col.isActive ? 'translate-x-5' : 'translate-x-0.5',
                        )}
                      />
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditTarget(col)}
                        className="rounded p-1.5 text-text-tertiary transition-colors hover:bg-white/[0.05] hover:text-text-primary"
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <div className="group relative">
                        <button
                          onClick={() => setDeleteTarget(col)}
                          className="rounded p-1.5 text-text-tertiary transition-colors hover:bg-red-500/10 hover:text-red-400"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile cards */}
      {!isLoading && !error && collections.length > 0 && (
        <div className="space-y-3 md:hidden">
          {collections.map((col) => (
            <div
              key={col.id}
              className="rounded-xl border border-border-dark bg-bg-elevated p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-text-primary">{col.name}</p>
                  <p className="mt-0.5 font-mono text-xs text-text-tertiary">
                    {col.slug}
                  </p>
                  {col.description && (
                    <p className="mt-1 truncate text-xs text-text-secondary">
                      {col.description}
                    </p>
                  )}
                </div>
                <button
                  role="switch"
                  aria-checked={col.isActive}
                  onClick={() =>
                    toggleActive({ id: col.id, isActive: !col.isActive })
                  }
                  className={cn(
                    'relative h-6 w-11 shrink-0 rounded-full border transition-colors',
                    col.isActive
                      ? 'border-hunter-green bg-hunter-green'
                      : 'border-border-dark bg-bg-surface',
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                      col.isActive ? 'translate-x-5' : 'translate-x-0.5',
                    )}
                  />
                </button>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-text-tertiary">
                  {col.productCount} products · sort {col.sortOrder}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditTarget(col)}
                    className="rounded p-1.5 text-text-tertiary hover:text-text-primary"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(col)}
                    className="rounded p-1.5 text-text-tertiary hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && collections.length === 0 && (
        <div className="rounded-xl border border-border-dark bg-bg-elevated p-12 text-center">
          <Layers className="mx-auto h-10 w-10 text-text-tertiary" />
          <p className="mt-4 text-text-secondary">No collections yet.</p>
          <button
            onClick={() => setShowCreate(true)}
            className="mt-4 text-sm font-medium text-gold hover:underline"
          >
            Create the first one
          </button>
        </div>
      )}

      {/* Dialogs */}
      {showCreate && (
        <CollectionDialog
          key="create"
          open={showCreate}
          onClose={() => setShowCreate(false)}
        />
      )}

      {editTarget && (
        <CollectionDialog
          key={`edit-${editTarget.id}`}
          open={!!editTarget}
          onClose={() => setEditTarget(null)}
          existing={editTarget}
        />
      )}

      {deleteTarget && (
        <DeleteDialog
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          collection={deleteTarget}
        />
      )}
    </div>
  );
}
