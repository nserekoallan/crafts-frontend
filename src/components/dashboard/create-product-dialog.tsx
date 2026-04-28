'use client';

import { useState, type FormEvent } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { api, ApiError } from '@/lib/api';

interface Category {
  id: string;
  name: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function CreateProductDialog({ open, onClose }: Props) {
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [materials, setMaterials] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get<{ data: Category[] }>('/categories').then((r) => r.data),
    enabled: open,
  });

  const categories = categoriesData ?? [];

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function reset() {
    setName(''); setSlug(''); setSlugTouched(false);
    setDescription(''); setPrice(''); setStock('');
    setCategoryId(''); setMaterials(''); setTags('');
    setError(''); setSubmitting(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.post('/products', {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim(),
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        categoryId,
        materials: materials.trim() || undefined,
        tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      });
      queryClient.invalidateQueries({ queryKey: ['artisan', 'products'] });
      reset();
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        const msg = (err.body as { message?: string | string[] })?.message;
        setError(Array.isArray(msg) ? msg[0] : (msg ?? 'Failed to create product.'));
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} title="Add Product" className="max-w-xl">
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-charcoal" htmlFor="cp-name">
            Product Name <span className="text-red-400">*</span>
          </label>
          <Input
            id="cp-name"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
            className="mt-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal" htmlFor="cp-slug">
            Slug <span className="text-red-400">*</span>
          </label>
          <Input
            id="cp-slug"
            value={slug}
            onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }}
            required
            className="mt-1 font-mono text-sm"
            placeholder="auto-generated-from-name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal" htmlFor="cp-desc">
            Description <span className="text-red-400">*</span>
          </label>
          <Textarea
            id="cp-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="mt-1"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-charcoal" htmlFor="cp-price">
              Price (USD) <span className="text-red-400">*</span>
            </label>
            <Input
              id="cp-price"
              type="number"
              min="0.01"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="mt-1"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal" htmlFor="cp-stock">
              Stock <span className="text-red-400">*</span>
            </label>
            <Input
              id="cp-stock"
              type="number"
              min="0"
              step="1"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
              className="mt-1"
              placeholder="0"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal" htmlFor="cp-category">
            Category <span className="text-red-400">*</span>
          </label>
          <Select
            id="cp-category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className="mt-1"
          >
            <option value="">Select category…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal" htmlFor="cp-materials">
            Materials
          </label>
          <Input
            id="cp-materials"
            value={materials}
            onChange={(e) => setMaterials(e.target.value)}
            className="mt-1"
            placeholder="e.g. Cotton, Silk blend"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal" htmlFor="cp-tags">
            Tags <span className="text-xs text-medium-gray">(comma-separated)</span>
          </label>
          <Input
            id="cp-tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="mt-1"
            placeholder="e.g. kente, handwoven, ghana"
          />
        </div>

        {error && (
          <div className="rounded-lg bg-red-900/10 px-4 py-3 text-sm text-red-600" role="alert">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create Product'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
