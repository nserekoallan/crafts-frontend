'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Eye, Loader2, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ApiProduct } from '@/lib/types/product';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const PLACEHOLDER = 'https://placehold.co/400x400/e8e6e1/9ca3af?text=No+Image';

interface ProductsResponse {
  data: ApiProduct[];
  meta: { total: number; page: number; limit: number };
}

export default function QcPage() {
  const queryClient = useQueryClient();
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [viewing, setViewing] = useState<ApiProduct | null>(null);

  useEffect(() => {
    if (!viewing) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setViewing(null); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [viewing]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'qc'],
    queryFn: () => api.get<ProductsResponse>('/products?status=PENDING_QC&limit=50'),
  });

  const { mutate: approve, isPending: isApproving } = useMutation({
    mutationFn: (productId: string) => api.patch(`/products/${productId}/approve`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'qc'] }),
  });

  const { mutate: reject, isPending: isRejecting } = useMutation({
    mutationFn: ({ productId, reason }: { productId: string; reason: string }) =>
      api.patch(`/products/${productId}/reject`, { reason }),
    onSuccess: () => {
      setRejecting(null);
      setRejectReason('');
      queryClient.invalidateQueries({ queryKey: ['admin', 'qc'] });
    },
  });

  const products = data?.data ?? [];
  const total = data?.meta?.total ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Quality Control Queue</h1>
        <p className="text-text-secondary">Review and approve products before listing</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-hunter-green" />
        </div>
      ) : error ? (
        <div className="bg-bg-elevated rounded-xl border border-border-dark p-8 text-center text-text-secondary">
          Failed to load QC queue.
        </div>
      ) : (
        <>
          <div className="text-sm text-text-secondary">
            {total} product{total !== 1 ? 's' : ''} pending review
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {products.map((product) => {
              const mainImage =
                product.images.find((img) => img.isDefault)?.url ??
                product.images[0]?.url ??
                PLACEHOLDER;

              return (
                <div
                  key={product.id}
                  className="bg-bg-elevated rounded-xl border border-border-dark p-6 space-y-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-text-primary mb-1 truncate">{product.name}</h3>
                      <p className="text-sm text-text-secondary">
                        by {product.artisan.businessName}
                      </p>
                    </div>
                    <Badge variant="pending">PENDING QC</Badge>
                  </div>

                  <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-bg-surface">
                    <Image
                      src={mainImage}
                      alt={product.name}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = PLACEHOLDER;
                      }}
                    />
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-text-secondary">Price:</span>
                      <span className="font-medium text-text-primary">
                        {product.currency} {Number(product.displayPrice ?? product.price).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-secondary">Stock:</span>
                      <span className="font-medium text-text-primary">{product.stock}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-secondary">Category:</span>
                      <span className="font-medium text-text-primary">{product.category.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-secondary">Submitted:</span>
                      <span className="font-medium text-text-primary">
                        {new Date(product.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-secondary">Region:</span>
                      <span className="font-medium text-text-primary">{product.artisan.region}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setViewing(product)}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-border-dark py-2 text-sm font-medium text-text-secondary transition-colors hover:border-gold hover:text-gold"
                  >
                    <Eye className="h-4 w-4" /> View full details
                  </button>

                  {/* Reject reason input */}
                  {rejecting === product.id && (
                    <div className="space-y-2">
                      <textarea
                        className="w-full rounded-lg border border-border-dark bg-bg-primary text-text-primary px-3 py-2 text-sm placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-gold"
                        rows={2}
                        placeholder="Reason for rejection (required)"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-1 text-red-400 hover:bg-red-500/10"
                          disabled={!rejectReason.trim() || isRejecting}
                          onClick={() => reject({ productId: product.id, reason: rejectReason })}
                        >
                          {isRejecting ? 'Rejecting…' : 'Confirm Reject'}
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => { setRejecting(null); setRejectReason(''); }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {rejecting !== product.id && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="primary"
                        size="sm"
                        className={cn('flex-1 bg-green-600 hover:bg-green-700 text-white border-green-600', isApproving && 'opacity-50')}
                        disabled={isApproving}
                        onClick={() => approve(product.id)}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                        onClick={() => setRejecting(product.id)}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {products.length === 0 && (
            <div className="bg-bg-elevated rounded-xl border border-border-dark p-12 text-center">
              <p className="font-medium text-text-primary mb-1">Queue is clear</p>
              <p className="text-sm text-text-secondary">No products pending QC review</p>
            </div>
          )}
        </>
      )}

      {/* Full product detail modal — review everything before approving */}
      {viewing && (
        <div
          className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/70 p-4 md:p-8"
          onClick={() => setViewing(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-3xl rounded-xl border border-border-dark bg-bg-elevated p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setViewing(null)}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-bg-surface"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="pr-10 text-xl font-bold text-text-primary">{viewing.name}</h2>
            <p className="mt-0.5 text-sm text-text-secondary">by {viewing.artisan.businessName}</p>

            {/* Image gallery */}
            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {viewing.images.map((img, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-lg bg-bg-surface">
                  <Image
                    src={img.url}
                    alt={`${viewing.name} ${i + 1}`}
                    fill
                    className="object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = PLACEHOLDER; }}
                  />
                </div>
              ))}
            </div>

            {/* Facts */}
            <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
              <Fact label="Display price" value={`${viewing.currency} ${Number(viewing.displayPrice ?? viewing.price).toLocaleString()}`} />
              <Fact label="Artisan price" value={`${viewing.currency} ${Number(viewing.price).toLocaleString()}`} />
              <Fact label="Stock" value={String(viewing.stock)} />
              <Fact label="Category" value={viewing.category.name} />
              <Fact label="Region" value={viewing.artisan.region ?? '—'} />
              <Fact label="Dimensions" value={viewing.dimensions ?? '—'} />
            </div>

            {/* Description */}
            <div className="mt-5">
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-text-tertiary">Description</p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
                {viewing.description || 'No description provided.'}
              </p>
            </div>

            {viewing.revertedFromActive && (
              <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-400">
                This product was edited while live and sent back for review.
              </p>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="primary"
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white border-green-600"
                disabled={isApproving}
                onClick={() => { approve(viewing.id); setViewing(null); }}
              >
                Approve
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setViewing(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">{label}</p>
      <p className="mt-0.5 font-medium text-text-primary">{value}</p>
    </div>
  );
}
