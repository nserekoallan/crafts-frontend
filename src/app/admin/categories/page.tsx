'use client';

import { useState, type FormEvent } from 'react';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '@/lib/api';
import { Dialog } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  sortOrder: number;
  isActive: boolean;
  _count?: { products: number };
}

interface CategoriesResponse {
  data: Category[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function parentName(parentId: string | null, categories: Category[]): string {
  if (!parentId) return '—';
  return categories.find((c) => c.id === parentId)?.name ?? '—';
}

// ---------------------------------------------------------------------------
// Create / Edit Dialog
// ---------------------------------------------------------------------------

interface CategoryFormProps {
  open: boolean;
  onClose: () => void;
  existing?: Category;
  categories: Category[];
}

function CategoryDialog({ open, onClose, existing, categories }: CategoryFormProps) {
  const queryClient = useQueryClient();
  const isEdit = !!existing;

  const [name, setName] = useState(existing?.name ?? '');
  const [slug, setSlug] = useState(existing?.slug ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [parentId, setParentId] = useState(existing?.parentId ?? '');
  const [sortOrder, setSortOrder] = useState(String(existing?.sortOrder ?? 0));
  const [isActive, setIsActive] = useState(existing?.isActive ?? true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // When editing, keep fields in sync if dialog re-opens with different item
  // (handled by key on the parent)

  function handleNameBlur() {
    if (!isEdit) {
      setSlug(slugify(name));
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!name.trim()) { setError('Name is required.'); return; }
    if (!slug.trim()) { setError('Slug is required.'); return; }

    const payload = {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim() || undefined,
      parentId: parentId || undefined,
      sortOrder: parseInt(sortOrder, 10) || 0,
      isActive,
    };

    setSubmitting(true);
    try {
      if (isEdit) {
        await api.patch(`/categories/${existing!.id}`, payload);
      } else {
        await api.post('/categories', payload);
      }
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save category.');
    } finally {
      setSubmitting(false);
    }
  }

  // Exclude self from parent dropdown when editing
  const parentOptions = categories.filter((c) => !isEdit || c.id !== existing?.id);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Category' : 'Add Category'}
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
            placeholder="Handwoven Baskets"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">
            Slug <span className="text-red-400">*</span>
          </label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full rounded-lg border border-border-dark bg-bg-surface px-3.5 py-2.5 font-mono text-sm text-text-primary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
            placeholder="handwoven-baskets"
          />
          <p className="mt-1 text-xs text-text-tertiary">
            Auto-generated from name on blur. Lowercase letters, numbers, and hyphens only.
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
            rows={3}
            className="w-full resize-none rounded-lg border border-border-dark bg-bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
            placeholder="Optional description…"
          />
        </div>

        {/* Parent */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">
            Parent category
          </label>
          <select
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            className="w-full rounded-lg border border-border-dark bg-bg-surface px-3.5 py-2.5 text-sm text-text-primary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
          >
            <option value="">— None (top level) —</option>
            {parentOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort order + Active row */}
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

        <div className="flex justify-end gap-3 pt-2">
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
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Delete confirm dialog
// ---------------------------------------------------------------------------

function DeleteDialog({
  open,
  onClose,
  category,
}: {
  open: boolean;
  onClose: () => void;
  category: Category;
}) {
  const queryClient = useQueryClient();
  const [error, setError] = useState('');

  const { mutate: deleteCategory, isPending } = useMutation({
    mutationFn: () => api.delete(`/categories/${category.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      onClose();
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : 'Failed to delete category.');
    },
  });

  return (
    <Dialog open={open} onClose={onClose} title="Delete Category">
      <div className="space-y-4">
        <p className="text-sm text-text-secondary">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-text-primary">{category.name}</span>? This
          action will soft-deactivate it and cannot be undone easily.
        </p>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary"
          >
            Cancel
          </button>
          <button
            onClick={() => deleteCategory()}
            disabled={isPending}
            className="flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/20 disabled:opacity-50"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () =>
      api.get<CategoriesResponse>('/categories').then((r) => r),
  });

  const { mutate: toggleActive } = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.patch(`/categories/${id}`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
    },
  });

  const categories: Category[] = Array.isArray(data?.data) ? data!.data : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Categories</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Manage product categories and hierarchy
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-lg bg-hunter-green px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add Category
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
          Failed to load categories.
        </div>
      )}

      {/* Desktop table */}
      {!isLoading && !error && categories.length > 0 && (
        <div className="hidden overflow-hidden rounded-xl border border-border-dark bg-bg-elevated md:block">
          <table className="w-full">
            <thead className="bg-bg-surface/60">
              <tr>
                {['Name', 'Slug', 'Parent', 'Sort', 'Products', 'Active', 'Actions'].map(
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
              {categories.map((cat) => {
                const hasProducts = (cat._count?.products ?? 0) > 0;
                return (
                  <tr key={cat.id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="px-5 py-3 font-medium text-text-primary">{cat.name}</td>
                    <td className="px-5 py-3 font-mono text-xs text-text-tertiary">
                      {cat.slug}
                    </td>
                    <td className="px-5 py-3 text-sm text-text-secondary">
                      {parentName(cat.parentId, categories)}
                    </td>
                    <td className="px-5 py-3 text-sm text-text-secondary">{cat.sortOrder}</td>
                    <td className="px-5 py-3 text-sm text-text-secondary">
                      {cat._count?.products ?? '—'}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        role="switch"
                        aria-checked={cat.isActive}
                        onClick={() => toggleActive({ id: cat.id, isActive: !cat.isActive })}
                        className={cn(
                          'relative h-6 w-11 rounded-full border transition-colors',
                          cat.isActive
                            ? 'border-hunter-green bg-hunter-green'
                            : 'border-border-dark bg-bg-surface',
                        )}
                      >
                        <span
                          className={cn(
                            'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                            cat.isActive ? 'translate-x-5' : 'translate-x-0.5',
                          )}
                        />
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditTarget(cat)}
                          className="rounded p-1.5 text-text-tertiary transition-colors hover:bg-white/[0.05] hover:text-text-primary"
                          aria-label="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <div className="group relative">
                          <button
                            disabled={hasProducts}
                            onClick={() => !hasProducts && setDeleteTarget(cat)}
                            className="rounded p-1.5 text-text-tertiary transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          {hasProducts && (
                            <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-bg-primary px-2 py-1 text-[10px] text-text-secondary opacity-0 transition-opacity group-hover:opacity-100">
                              Has products
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile cards */}
      {!isLoading && !error && categories.length > 0 && (
        <div className="space-y-3 md:hidden">
          {categories.map((cat) => {
            const hasProducts = (cat._count?.products ?? 0) > 0;
            return (
              <div
                key={cat.id}
                className="rounded-xl border border-border-dark bg-bg-elevated p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-text-primary">{cat.name}</p>
                    <p className="mt-0.5 font-mono text-xs text-text-tertiary">{cat.slug}</p>
                    {cat.parentId && (
                      <p className="mt-1 text-xs text-text-secondary">
                        Under: {parentName(cat.parentId, categories)}
                      </p>
                    )}
                  </div>
                  <button
                    role="switch"
                    aria-checked={cat.isActive}
                    onClick={() => toggleActive({ id: cat.id, isActive: !cat.isActive })}
                    className={cn(
                      'relative h-6 w-11 shrink-0 rounded-full border transition-colors',
                      cat.isActive
                        ? 'border-hunter-green bg-hunter-green'
                        : 'border-border-dark bg-bg-surface',
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                        cat.isActive ? 'translate-x-5' : 'translate-x-0.5',
                      )}
                    />
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-text-tertiary">
                    {cat._count?.products ?? 0} products · sort {cat.sortOrder}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditTarget(cat)}
                      className="rounded p-1.5 text-text-tertiary hover:text-text-primary"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      disabled={hasProducts}
                      onClick={() => !hasProducts && setDeleteTarget(cat)}
                      className="rounded p-1.5 text-text-tertiary hover:text-red-400 disabled:opacity-40"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && categories.length === 0 && (
        <div className="rounded-xl border border-border-dark bg-bg-elevated p-12 text-center">
          <p className="text-text-secondary">No categories yet.</p>
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
        <CategoryDialog
          key="create"
          open={showCreate}
          onClose={() => setShowCreate(false)}
          categories={categories}
        />
      )}

      {editTarget && (
        <CategoryDialog
          key={`edit-${editTarget.id}`}
          open={!!editTarget}
          onClose={() => setEditTarget(null)}
          existing={editTarget}
          categories={categories}
        />
      )}

      {deleteTarget && (
        <DeleteDialog
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          category={deleteTarget}
        />
      )}
    </div>
  );
}
