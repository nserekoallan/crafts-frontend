'use client';

import { useState, useRef, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ChevronUp, ImagePlus, Loader2, Plus, Trash2, X } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { api, ApiError } from '@/lib/api';
import type { ApiProduct, ApiProductVariant } from '@/lib/types/product';

interface Category {
  id: string;
  name: string;
}

interface Props {
  product: ApiProduct;
  open: boolean;
  onClose: () => void;
}

interface NewVariantRow {
  name: string;
  size: string;
  color: string;
  material: string;
  price: string;
  stock: string;
  sku: string;
}

const EMPTY_VARIANT_ROW: NewVariantRow = {
  name: '',
  size: '',
  color: '',
  material: '',
  price: '',
  stock: '0',
  sku: '',
};

export function EditProductDialog({ product, open, onClose }: Props) {
  const queryClient = useQueryClient();

  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description);
  const [price, setPrice] = useState(String(product.price));
  const [stock, setStock] = useState(String(product.stock));
  const [categoryId, setCategoryId] = useState(product.category.id);
  const [additionalCategoryIds, setAdditionalCategoryIds] = useState<Set<string>>(
    new Set((product.additionalCategories ?? []).map((ac) => ac.categoryId)),
  );
  const [materials, setMaterials] = useState(
    Array.isArray(product.materials) ? product.materials.join(', ') : (product.materials ?? '')
  );
  const [tags, setTags] = useState(product.tags?.join(', ') ?? '');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Images section
  const [showImages, setShowImages] = useState(false);
  const [isDefaultUpload, setIsDefaultUpload] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Variants section
  const [showVariants, setShowVariants] = useState(false);
  const [newVariants, setNewVariants] = useState<NewVariantRow[]>([]);
  const [variantError, setVariantError] = useState('');

  const { data: imagesData, refetch: refetchImages } = useQuery<{
    data: { id: string; url: string; isDefault: boolean; position: number }[];
  }>({
    queryKey: ['product', product.id, 'images'],
    queryFn: () =>
      api.get<{ data: { images: { id: string; url: string; isDefault: boolean; position: number }[] } }>(
        `/products/${product.id}`,
      ).then((r) => ({ data: r.data.images ?? [] })),
    // Seed from the product prop so thumbnails render immediately without a fetch
    initialData: { data: product.images ?? [] },
    enabled: open,
  });
  const existingImages = imagesData?.data ?? [];

  function toggleAdditionalCategory(id: string) {
    setAdditionalCategoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleImageUpload(file: File) {
    setUploadError('');
    setIsUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      if (isDefaultUpload) form.append('isDefault', 'true');
      await api.postForm(`/products/${product.id}/images`, form);
      await refetchImages();
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch {
      setUploadError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }

  async function handleImageDelete(imageId: string) {
    if (!confirm('Remove this image?')) return;
    setDeletingImageId(imageId);
    try {
      await api.delete(`/products/${product.id}/images/${imageId}`);
      await refetchImages();
      queryClient.invalidateQueries({ queryKey: ['artisan', 'products'] });
    } catch {
      setUploadError('Failed to remove image. Please try again.');
    } finally {
      setDeletingImageId(null);
    }
  }

  const { data: variantsData, refetch: refetchVariants } = useQuery<{ data: ApiProductVariant[] }>({
    queryKey: ['product', product.id, 'variants'],
    queryFn: () => api.get<{ data: ApiProductVariant[] }>(`/products/${product.id}/variants`),
    enabled: open && showVariants,
  });
  const existingVariants = variantsData?.data ?? [];

  const { mutate: deleteVariant, isPending: isDeletingVariant } = useMutation({
    mutationFn: (variantId: string) => api.delete(`/products/${product.id}/variants/${variantId}`),
    onSuccess: () => refetchVariants(),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get<{ data: Category[] }>('/categories').then((r) => r.data),
    enabled: open,
  });

  const { data: markupData } = useQuery({
    queryKey: ['platform', 'markup'],
    queryFn: () => api.get<{ data: { markupPercent: number } }>('/admin/settings/markup').then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const markupPercent = markupData?.markupPercent ?? 25;
  const priceNum = parseFloat(price);
  const displayPrice = !isNaN(priceNum) && priceNum > 0
    ? Math.round(priceNum * (1 + markupPercent / 100) * 100) / 100
    : null;

  const categories = categoriesData ?? [];

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setVariantError('');
    setSubmitting(true);
    try {
      await api.patch(`/products/${product.id}`, {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        categoryId,
        materials: materials.trim() || undefined,
        tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      });

      // Sync additional categories
      const originalIds = new Set((product.additionalCategories ?? []).map((ac) => ac.categoryId));
      const toAdd = [...additionalCategoryIds].filter((id) => !originalIds.has(id) && id !== categoryId);
      const toRemove = [...originalIds].filter((id) => !additionalCategoryIds.has(id) && id !== categoryId);
      await Promise.all([
        ...toAdd.map((id) => api.post(`/products/${product.id}/categories`, { categoryId: id })),
        ...toRemove.map((id) => api.delete(`/products/${product.id}/categories/${id}`)),
      ]);

      // Save new variants sequentially
      for (const v of newVariants) {
        if (!v.name.trim()) continue;
        const options: Record<string, string> = {};
        if (v.size.trim()) options.size = v.size.trim();
        if (v.color.trim()) options.color = v.color.trim();
        if (v.material.trim()) options.material = v.material.trim();
        await api.post(`/products/${product.id}/variants`, {
          name: v.name.trim(),
          options,
          price: v.price ? parseFloat(v.price) : undefined,
          stock: parseInt(v.stock) || 0,
          sku: v.sku.trim() || undefined,
        });
      }

      queryClient.invalidateQueries({ queryKey: ['artisan', 'products'] });
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        const details = err.body.error?.details?.[0]?.message;
        setError(details ?? err.body.error?.message ?? 'Failed to update product.');
      } else if (err instanceof Error) {
        setError(err.message || 'Something went wrong. Please try again.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  function addVariantRow() {
    setNewVariants((prev) => [...prev, { ...EMPTY_VARIANT_ROW }]);
  }

  function removeVariantRow(idx: number) {
    setNewVariants((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateVariantRow(idx: number, field: keyof NewVariantRow, value: string) {
    setNewVariants((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [field]: value } : row)),
    );
  }

  return (
    <Dialog open={open} onClose={onClose} title="Edit Product" className="max-w-xl">
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        {product.status === 'ACTIVE' && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-300">
            Editing the name, description, or category will pull this product from the shop until an admin re-approves it. Price, stock and tags can be changed without re-review.
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-text-secondary" htmlFor="ep-name">
            Product Name <span className="text-red-400">*</span>
          </label>
          <Input
            id="ep-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary" htmlFor="ep-desc">
            Description <span className="text-red-400">*</span>
          </label>
          <Textarea
            id="ep-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="mt-1"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-text-secondary" htmlFor="ep-price">
              Your Price (UGX) <span className="text-red-400">*</span>
            </label>
            <Input
              id="ep-price"
              type="number"
              min="100"
              step="100"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="mt-1"
            />
            {displayPrice !== null && (
              <p className="mt-1 text-xs text-medium-gray">
                Customer sees:{' '}
                <span className="font-semibold text-hunter-green">
                  UGX {Math.round(displayPrice).toLocaleString()}
                </span>
                {' '}(+{markupPercent}% platform fee)
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary" htmlFor="ep-stock">
              Stock <span className="text-red-400">*</span>
            </label>
            <Input
              id="ep-stock"
              type="number"
              min="0"
              step="1"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary" htmlFor="ep-category">
            Category <span className="text-red-400">*</span>
          </label>
          <Select
            id="ep-category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className="mt-1"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </div>

        {categories.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-text-secondary">
              Additional Categories <span className="text-xs text-medium-gray">(optional)</span>
            </label>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {categories
                .filter((c) => c.id !== categoryId)
                .map((c) => {
                  const checked = additionalCategoryIds.has(c.id);
                  return (
                    <label
                      key={c.id}
                      className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                        checked
                          ? 'border-hunter-green bg-hunter-green/10 text-hunter-green'
                          : 'border-border-dark bg-bg-surface text-text-secondary hover:border-gold/40'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={checked}
                        onChange={() => toggleAdditionalCategory(c.id)}
                      />
                      {c.name}
                    </label>
                  );
                })}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-text-secondary" htmlFor="ep-materials">Materials</label>
          <Input
            id="ep-materials"
            value={materials}
            onChange={(e) => setMaterials(e.target.value)}
            className="mt-1"
            placeholder="e.g. Cotton, Silk blend"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary" htmlFor="ep-tags">
            Tags <span className="text-xs text-medium-gray">(comma-separated)</span>
          </label>
          <Input
            id="ep-tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="mt-1"
            placeholder="e.g. kente, handwoven"
          />
        </div>

        {/* Images section */}
        <div className="rounded-xl border border-border-dark">
          <button
            type="button"
            onClick={() => setShowImages((v) => !v)}
            className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-text-secondary hover:text-text-primary"
          >
            <span>
              Images
              {existingImages.length > 0 && (
                <span className="ml-2 rounded-full bg-white/10 px-1.5 py-0.5 text-xs font-normal text-text-tertiary">
                  {existingImages.length}
                </span>
              )}
            </span>
            {showImages ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {showImages && (
            <div className="border-t border-border-dark px-4 pb-4 pt-3 space-y-3">
              {/* Current images */}
              {existingImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {existingImages.map((img) => (
                    <div key={img.id} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt=""
                        className="h-20 w-full rounded-lg object-cover"
                      />
                      {img.isDefault && (
                        <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1 py-0.5 text-[9px] font-semibold text-white">
                          Default
                        </span>
                      )}
                      <button
                        type="button"
                        title="Remove image"
                        disabled={deletingImageId === img.id}
                        onClick={() => handleImageDelete(img.id)}
                        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-red-600/80 disabled:opacity-50"
                      >
                        {deletingImageId === img.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <X className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {existingImages.length === 0 && (
                <p className="text-xs text-text-tertiary">No images uploaded yet.</p>
              )}

              {/* Upload new image */}
              <div className="space-y-2 rounded-lg border border-dashed border-border-dark p-3">
                <p className="text-xs font-medium text-text-secondary">Add Image</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                  disabled={isUploading}
                  className="block w-full text-xs text-text-secondary file:mr-3 file:cursor-pointer file:rounded file:border-0 file:bg-white/10 file:px-2 file:py-1 file:text-xs file:font-medium file:text-text-secondary hover:file:bg-white/15"
                />
                <label className="flex cursor-pointer items-center gap-2 text-xs text-text-tertiary">
                  <input
                    type="checkbox"
                    checked={isDefaultUpload}
                    onChange={(e) => setIsDefaultUpload(e.target.checked)}
                    className="rounded"
                  />
                  Set as default image
                </label>
                {isUploading && (
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Uploading…
                  </div>
                )}
                {uploadError && (
                  <p className="text-xs text-red-400">{uploadError}</p>
                )}
              </div>

              <p className="text-[10px] text-text-tertiary">
                JPEG, PNG, or WebP. Max 5MB.
              </p>
            </div>
          )}
        </div>

        {/* Variants section */}
        <div className="rounded-xl border border-border-dark">
          <button
            type="button"
            onClick={() => setShowVariants((v) => !v)}
            className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-text-secondary hover:text-text-primary"
          >
            <span>
              Variants
              {existingVariants.length > 0 && (
                <span className="ml-2 rounded-full bg-white/10 px-1.5 py-0.5 text-xs font-normal text-text-tertiary">
                  {existingVariants.length}
                </span>
              )}
            </span>
            {showVariants ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {showVariants && (
            <div className="border-t border-border-dark px-4 pb-4 pt-3 space-y-3">
              {/* Existing variants */}
              {existingVariants.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-text-tertiary uppercase tracking-wider">Existing</p>
                  {existingVariants.map((v) => (
                    <div key={v.id} className="flex items-center justify-between rounded-lg border border-border-dark bg-bg-primary px-3 py-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-text-primary">{v.name}</p>
                        <p className="text-xs text-text-tertiary">
                          {Object.entries(v.options).map(([k, val]) => `${k}: ${val}`).join(' · ')}
                          {v.price != null && ` · UGX ${Number(v.price).toLocaleString()}`}
                          {` · Stock: ${v.stock}`}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteVariant(v.id)}
                        disabled={isDeletingVariant}
                        className="ml-3 shrink-0 rounded p-1 text-text-tertiary hover:text-red-400"
                      >
                        {isDeletingVariant ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* New variant rows */}
              {newVariants.map((row, idx) => (
                <div key={idx} className="rounded-lg border border-border-dark bg-bg-primary p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-text-secondary">New Variant {idx + 1}</p>
                    <button type="button" onClick={() => removeVariantRow(idx)} className="text-text-tertiary hover:text-red-400">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-text-tertiary">Name *</label>
                      <Input
                        value={row.name}
                        onChange={(e) => updateVariantRow(idx, 'name', e.target.value)}
                        placeholder="e.g. Small / Red"
                        className="mt-0.5 h-8 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-text-tertiary">Price (optional)</label>
                      <Input
                        type="number"
                        value={row.price}
                        onChange={(e) => updateVariantRow(idx, 'price', e.target.value)}
                        placeholder="Same as product"
                        className="mt-0.5 h-8 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-text-tertiary">Size</label>
                      <Input
                        value={row.size}
                        onChange={(e) => updateVariantRow(idx, 'size', e.target.value)}
                        placeholder="e.g. Small"
                        className="mt-0.5 h-8 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-text-tertiary">Color</label>
                      <Input
                        value={row.color}
                        onChange={(e) => updateVariantRow(idx, 'color', e.target.value)}
                        placeholder="e.g. Red"
                        className="mt-0.5 h-8 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-text-tertiary">Material</label>
                      <Input
                        value={row.material}
                        onChange={(e) => updateVariantRow(idx, 'material', e.target.value)}
                        placeholder="e.g. Cotton"
                        className="mt-0.5 h-8 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-text-tertiary">Stock</label>
                      <Input
                        type="number"
                        value={row.stock}
                        onChange={(e) => updateVariantRow(idx, 'stock', e.target.value)}
                        className="mt-0.5 h-8 text-xs"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[11px] text-text-tertiary">SKU (optional)</label>
                      <Input
                        value={row.sku}
                        onChange={(e) => updateVariantRow(idx, 'sku', e.target.value)}
                        placeholder="e.g. SKU-001"
                        className="mt-0.5 h-8 text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addVariantRow}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border-dark py-2 text-xs font-medium text-text-secondary hover:border-gold/40 hover:text-gold"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Variant
              </button>

              {variantError && (
                <p className="text-xs text-red-400">{variantError}</p>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400" role="alert">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
