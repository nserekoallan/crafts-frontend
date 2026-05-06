'use client';

import { useState, useRef, type FormEvent } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ImagePlus, X } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { api, ApiError } from '@/lib/api';
import { track } from '@/lib/analytics';

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
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [materials, setMaterials] = useState('');
  const [tags, setTags] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageError, setImageError] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  function handleNameChange(value: string) {
    setName(value);
    setSlug(slugify(value));
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const MAX_SIZE = 5 * 1024 * 1024;
    const MIN_DIM = 800;

    const validFiles: File[] = [];
    let pendingChecks = files.length;

    const finalize = () => {
      if (validFiles.length > 0) {
        setImageError('');
        const combined = [...imageFiles, ...validFiles].slice(0, 5);
        setImageFiles(combined);
        setImagePreviews(combined.map((f) => URL.createObjectURL(f)));
      }
    };

    files.forEach((file) => {
      if (file.size > MAX_SIZE) {
        setImageError(`"${file.name}" exceeds 5 MB limit and was not added.`);
        pendingChecks -= 1;
        if (pendingChecks === 0) finalize();
        return;
      }

      const objectUrl = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        if (img.naturalWidth < MIN_DIM || img.naturalHeight < MIN_DIM) {
          setImageError(`"${file.name}" must be at least ${MIN_DIM}×${MIN_DIM} px and was not added.`);
        } else {
          setImageError('');
          validFiles.push(file);
        }
        pendingChecks -= 1;
        if (pendingChecks === 0) finalize();
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        setImageError(`"${file.name}" could not be read.`);
        pendingChecks -= 1;
        if (pendingChecks === 0) finalize();
      };
      img.src = objectUrl;
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function removeImage(index: number) {
    URL.revokeObjectURL(imagePreviews[index]);
    const files = imageFiles.filter((_, i) => i !== index);
    const previews = imagePreviews.filter((_, i) => i !== index);
    setImageFiles(files);
    setImagePreviews(previews);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function reset() {
    setName(''); setSlug('');
    setDescription(''); setPrice(''); setStock('');
    setCategoryId(''); setMaterials(''); setTags('');
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setImageFiles([]); setImagePreviews([]);
    setError(''); setImageError(''); setSubmitting(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
      const created = await api.post<{ data: { id: string } }>('/products', {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim(),
        price: parseFloat(price),
        currency: 'UGX',
        stock: parseInt(stock, 10),
        categoryId,
        materials: materials.trim() || undefined,
        tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      });

      if (imageFiles.length > 0) {
        const productId = created.data.id;
        const token = typeof window !== 'undefined' ? localStorage.getItem('cc_token') : null;
        const base = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.craftcontinent.com/api/v1';
        for (let i = 0; i < imageFiles.length; i++) {
          const fd = new FormData();
          fd.append('file', imageFiles[i]);
          if (i === 0) fd.append('isDefault', 'true');
          const res = await fetch(`${base}/products/${productId}/images`, {
            method: 'POST',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: fd,
          });
          if (!res.ok) {
            const errBody = await res.json().catch(() => null);
            const msg = errBody?.error?.message ?? `Image ${i + 1} failed to upload.`;
            throw new Error(msg);
          }
        }
      }

      track('product_created', { product_name: name.trim(), price: parseFloat(price) });
      queryClient.invalidateQueries({ queryKey: ['artisan', 'products'] });
      reset();
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        const details = err.body.error?.details?.[0]?.message;
        setError(details ?? err.body.error?.message ?? 'Failed to create product.');
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
    <Dialog open={open} onClose={handleClose} title="Add Product" className="max-w-xl">
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary" htmlFor="cp-name">
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
          <label className="block text-sm font-medium text-text-secondary" htmlFor="cp-desc">
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

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-text-secondary" htmlFor="cp-price">
              Your Price (UGX) <span className="text-red-400">*</span>
            </label>
            <Input
              id="cp-price"
              type="number"
              min="100"
              step="100"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="mt-1"
              placeholder="0"
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
            <label className="block text-sm font-medium text-text-secondary" htmlFor="cp-stock">
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
          <label className="block text-sm font-medium text-text-secondary" htmlFor="cp-category">
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
          <label className="block text-sm font-medium text-text-secondary" htmlFor="cp-materials">
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
          <label className="block text-sm font-medium text-text-secondary" htmlFor="cp-tags">
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

        <div>
          <label className="block text-sm font-medium text-text-secondary">
            Images <span className="text-xs text-medium-gray">(up to 5)</span>
          </label>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {imagePreviews.map((url, i) => (
              <div key={i} className="relative h-16 w-16 overflow-hidden rounded-lg border border-white/10">
                <img src={url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </div>
            ))}
            {imageFiles.length < 5 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-white/20 text-text-tertiary hover:border-hunter-green hover:text-hunter-green"
              >
                <ImagePlus className="h-5 w-5" />
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageSelect}
          />
          {imageError && (
            <p className="mt-1.5 text-xs text-red-500" role="alert">{imageError}</p>
          )}
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400" role="alert">
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
