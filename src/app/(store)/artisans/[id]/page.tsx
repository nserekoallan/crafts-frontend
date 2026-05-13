'use client';

import { use, useEffect } from 'react';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { mapApiProductToProduct, type ApiProduct, type ApiProductsResponse } from '@/lib/types/product';
import { DenseProductCard } from '@/components/products/dense-product-card';
import { track } from '@/lib/analytics';

interface ArtisanDetail {
  id: string;
  businessName: string;
  bio: string | null;
  region: string | null;
  status: string;
  createdAt: string;
  user?: {
    profile?: { firstName: string; lastName: string } | null;
  };
}

export default function ArtisanProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data: artisan, isLoading: artisanLoading, isError: artisanError } = useQuery({
    queryKey: ['artisan', id],
    queryFn: () => api.get<{ data: ArtisanDetail }>(`/artisans/${id}`).then((r) => r.data),
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['artisan', id, 'products'],
    queryFn: () =>
      api
        .get<ApiProductsResponse>(`/products?artisanId=${id}&status=ACTIVE`)
        .then((r) => r.data.map((p: ApiProduct) => mapApiProductToProduct(p))),
    enabled: !!artisan,
  });

  useEffect(() => {
    if (!artisan) return;
    track('artisan_profile_viewed', {
      artisan_id: artisan.id,
      artisan_name: artisan.businessName,
    });
  }, [artisan]);

  if (artisanLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      </div>
    );
  }

  if (artisanError || !artisan) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
        <p className="text-lg text-text-secondary">Artisan not found</p>
        <Link
          href="/shop"
          className="mt-4 rounded-lg border border-gold px-6 py-2 text-sm font-medium text-gold transition-colors hover:bg-gold hover:text-bg-primary"
        >
          Browse Shop
        </Link>
      </div>
    );
  }

  const memberSinceYear = new Date(artisan.createdAt).getFullYear();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-10 lg:px-8">
      {/* Breadcrumb */}
      <p className="mb-6 text-sm text-text-tertiary">
        <Link href="/shop" className="transition-colors hover:text-gold">Shop</Link>
        {' / '}
        <span className="text-text-secondary">{artisan.businessName}</span>
      </p>

      {/* Artisan header */}
      <div className="rounded-xl border border-border-dark bg-bg-elevated p-6 md:p-8">
        <h1 className="text-xl font-bold text-text-primary md:text-2xl lg:text-3xl">
          {artisan.businessName}
        </h1>
        {artisan.region && (
          <div className="mt-2 flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-terracotta" />
            <span className="text-sm text-text-secondary">{artisan.region}</span>
          </div>
        )}
        <p className="mt-1 text-xs text-text-tertiary">Member since {memberSinceYear}</p>
        {artisan.bio && (
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-text-secondary">
            {artisan.bio}
          </p>
        )}
      </div>

      {/* Products */}
      <section className="mt-10">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gold md:text-sm">
          Products
        </h2>

        {productsLoading ? (
          <div className="mt-6 flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gold border-t-transparent" />
          </div>
        ) : !products || products.length === 0 ? (
          <div className="mt-6 rounded-xl border border-border-dark bg-bg-surface py-12 text-center">
            <p className="text-sm text-text-tertiary">No active products listed yet.</p>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
            {products.map((p, i) => (
              <DenseProductCard key={p.id} product={p} animationDelay={i * 50} />
            ))}
          </div>
        )}
      </section>

      {/* Story */}
      {artisan.bio && (
        <section className="mt-14">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-border-dark" />
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gold md:text-sm">
              Story
            </h2>
            <div className="h-px flex-1 bg-border-dark" />
          </div>
          <blockquote className="mx-auto mt-6 max-w-2xl pl-5 border-l-2 border-gold/40">
            <p className="text-sm italic leading-relaxed text-text-secondary md:text-base">
              {artisan.bio}
            </p>
            <footer className="mt-3 text-xs text-text-tertiary not-italic">
              — {artisan.businessName}
            </footer>
          </blockquote>
        </section>
      )}
    </div>
  );
}
