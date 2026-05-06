'use client';

import { useState, type FormEvent } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { api, ApiError } from '@/lib/api';
import type { ApiProduct } from '@/lib/types/product';

interface Category {
  id: string;
  name: string;
}

interface Props {
  product: ApiProduct;
  open: boolean;
  onClose: () => void;
}

export function EditProductDialog({ product, open, onClose }: Props) {
  const queryClient = useQueryClient();

  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description);
  const [price, setPrice] = useState(String(product.price));
  const [stock, setStock] = useState(String(product.stock));
  const [categoryId, setCategoryId] = useState(product.category.id);
  const [materials, setMaterials] = useState(
    Array.isArray(product.materials) ? product.materials.join(', ') : (product.materials ?? '')
  );
  const [tags, setTags] = useState(product.tags?.join(', ') ?? '');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  return (
    <Dialog open={open} onClose={onClose} title="Edit Product" className="max-w-xl">
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-charcoal" htmlFor="ep-name">
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
          <label className="block text-sm font-medium text-charcoal" htmlFor="ep-desc">
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
            <label className="block text-sm font-medium text-charcoal" htmlFor="ep-price">
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
            <label className="block text-sm font-medium text-charcoal" htmlFor="ep-stock">
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
          <label className="block text-sm font-medium text-charcoal" htmlFor="ep-category">
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

        <div>
          <label className="block text-sm font-medium text-charcoal" htmlFor="ep-materials">Materials</label>
          <Input
            id="ep-materials"
            value={materials}
            onChange={(e) => setMaterials(e.target.value)}
            className="mt-1"
            placeholder="e.g. Cotton, Silk blend"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal" htmlFor="ep-tags">
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

        {error && (
          <div className="rounded-lg bg-red-900/10 px-4 py-3 text-sm text-red-600" role="alert">
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
