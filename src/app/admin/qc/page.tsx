'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
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
        <h1 className="text-3xl font-bold text-charcoal mb-2">Quality Control Queue</h1>
        <p className="text-medium-gray">Review and approve products before listing</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-hunter-green" />
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl border border-light-gray p-8 text-center text-medium-gray">
          Failed to load QC queue.
        </div>
      ) : (
        <>
          <div className="text-sm text-medium-gray">
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
                  className="bg-white rounded-xl border border-light-gray p-6 space-y-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-charcoal mb-1 truncate">{product.name}</h3>
                      <p className="text-sm text-medium-gray">
                        by {product.artisan.businessName}
                      </p>
                    </div>
                    <Badge variant="pending">PENDING QC</Badge>
                  </div>

                  <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-light-gray">
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
                      <span className="text-medium-gray">Category:</span>
                      <span className="font-medium text-charcoal">{product.category.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-medium-gray">Submitted:</span>
                      <span className="font-medium text-charcoal">
                        {new Date(product.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-medium-gray">Region:</span>
                      <span className="font-medium text-charcoal">{product.artisan.region}</span>
                    </div>
                  </div>

                  {/* Reject reason input */}
                  {rejecting === product.id && (
                    <div className="space-y-2">
                      <textarea
                        className="w-full rounded-lg border border-light-gray px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-hunter-green"
                        rows={2}
                        placeholder="Reason for rejection (required)"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-1 text-red-600 hover:bg-red-50"
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
                        className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700"
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
            <div className="bg-white rounded-xl border border-light-gray p-12 text-center">
              <p className="font-medium text-charcoal mb-1">Queue is clear</p>
              <p className="text-sm text-medium-gray">No products pending QC review</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
