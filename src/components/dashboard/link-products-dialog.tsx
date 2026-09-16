'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, Loader2, Package } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useArtisanProducts } from '@/hooks/use-artisan';
import { api } from '@/lib/api';
import { apiErrorMessage } from '@/lib/api-error-message';
import type { ApiVideo } from '@/lib/types/video';

/** Matches ArrayMaxSize(20) on the API's LinkProductsDto. */
const MAX_LINKED_PRODUCTS = 20;

/** The API caps page size at 100 (pagination.dto.ts). */
const PRODUCT_FETCH_LIMIT = 100;

interface LinkProductsDialogProps {
  open: boolean;
  onClose: () => void;
  video: ApiVideo;
}

/**
 * Picks which of the artisan's products a video sells.
 *
 * `PUT /videos/:id/products` replaces the whole set rather than adding to it,
 * so this dialog always submits the full selection, not a delta.
 */
export function LinkProductsDialog({ open, onClose, video }: LinkProductsDialogProps) {
  const queryClient = useQueryClient();
  // 100 is the API's max page size. Only 20 can be linked, so one page covers
  // any realistic catalogue; the notice below covers the rest.
  const { data, isLoading } = useArtisanProducts(1, PRODUCT_FETCH_LIMIT);
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState('');

  // Seed from the server's current set when the dialog opens, so a cancelled
  // edit does not leak into the next one.
  //
  // Depends on `open` alone, deliberately. `video.products` is a fresh array on
  // every refetch, and saving invalidates the videos query — keeping it in the
  // dependency list would re-run this mid-edit and discard the user's changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!open) return;
    setSelected((video.products ?? []).map((p) => p.productId));
    setError('');
  }, [open]);

  const save = useMutation({
    mutationFn: () =>
      api.put<{ data: ApiVideo }>(`/videos/${video.id}/products`, { productIds: selected }),
    onSuccess: () => {
      // Must match useMyVideos' key (use-videos.ts:53) or the card never refreshes.
      queryClient.invalidateQueries({ queryKey: ['videos', 'mine'] });
      onClose();
    },
    onError: (err) => setError(apiErrorMessage(err, 'Could not save the linked products.')),
  });

  const products = data?.data ?? [];
  const total = data?.meta?.total ?? products.length;
  const hasMore = total > products.length;
  const atLimit = selected.length >= MAX_LINKED_PRODUCTS;

  function toggle(productId: string) {
    setError('');
    setSelected((prev) => {
      if (prev.includes(productId)) return prev.filter((id) => id !== productId);
      if (prev.length >= MAX_LINKED_PRODUCTS) return prev;
      return [...prev, productId];
    });
  }

  return (
    <Dialog open={open} onClose={onClose} title="Link products">
      <p className="text-xs text-text-secondary">
        Choose the products this video sells. Shoppers see them beside the video.
      </p>

      {isLoading ? (
        <div className="flex items-center gap-2 py-8 text-sm text-text-secondary">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading your products…
        </div>
      ) : products.length === 0 ? (
        <p className="py-8 text-sm text-text-secondary">
          You have no products yet. Add one first, then link it here.
        </p>
      ) : (
        <ul className="mt-3 max-h-80 space-y-1 overflow-y-auto">
          {products.map((product) => {
            const isSelected = selected.includes(product.id);
            const image = product.images?.[0]?.url;

            return (
              <li key={product.id}>
                <button
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => toggle(product.id)}
                  // Only block the ones that would exceed the cap — never the
                  // already-selected ones, or the set could not be reduced.
                  disabled={!isSelected && atLimit}
                  className={`flex w-full items-center gap-3 rounded-lg border p-2 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                    isSelected
                      ? 'border-hunter-green bg-hunter-green/10'
                      : 'border-border-dark hover:border-white/20'
                  }`}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded bg-bg-surface">
                    {image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={image} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Package className="h-4 w-4 text-text-tertiary" />
                    )}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-text-primary">{product.name}</span>
                  </span>

                  {isSelected && <Check className="h-4 w-4 shrink-0 text-hunter-green-light" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {hasMore && (
        <p className="mt-2 text-xs text-text-tertiary">
          Showing the first {products.length} of {total} products.
        </p>
      )}

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="text-xs text-text-tertiary">
          {selected.length} of {MAX_LINKED_PRODUCTS} selected
        </span>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={save.isPending}>
            Cancel
          </Button>
          <Button size="sm" onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Save'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
