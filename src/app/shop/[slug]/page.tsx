'use client';

import { use, useState } from 'react';
import { Heart, Minus, Plus, ShoppingBag, Star, Truck } from 'lucide-react';
import { useCurrency } from '@/lib/currency';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DiscountBadge } from '@/components/ui/discount-badge';
import { StockBadge } from '@/components/ui/stock-badge';
import { WhatsAppButton } from '@/components/ui/whatsapp-button';
import { findProductBySlug, findArtisan, PRODUCTS } from '@/lib/mock-data';

/**
 * Product detail page — dark theme with currency-aware pricing,
 * stock badges, discount badges and WhatsApp ordering.
 */
export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { formatPrice } = useCurrency();

  const product = findProductBySlug(slug) ?? PRODUCTS[0];
  const artisan = findArtisan(product.artisanId);
  const hasDiscount = !!product.originalPrice && product.originalPrice > product.price;
  const isUnavailable = product.stockStatus === 'out_of_stock';

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      {/* Breadcrumb */}
      <p className="mb-6 text-sm text-text-tertiary">
        <a href="/shop" className="transition-colors hover:text-gold">Shop</a>
        {' / '}
        <span className="text-text-secondary">{product.name}</span>
      </p>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Image gallery */}
        <div>
          <div className="relative aspect-square overflow-hidden rounded-xl bg-bg-surface">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.images[selectedImage]}
              alt={product.name}
              className="h-full w-full object-cover"
            />
            {hasDiscount && (
              <DiscountBadge
                originalPrice={product.originalPrice!}
                currentPrice={product.price}
                className="absolute left-3 top-3"
              />
            )}
            {product.stockStatus !== 'in_stock' && (
              <StockBadge
                status={product.stockStatus}
                count={product.stockCount}
                className="absolute bottom-3 left-3"
              />
            )}
          </div>
          <div className="mt-4 flex gap-3">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={cn(
                  'h-20 w-20 overflow-hidden rounded-lg border-2 transition-colors',
                  selectedImage === i ? 'border-gold' : 'border-border-dark hover:border-border-dark-hover',
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-gold">
            {product.category}
          </span>
          <h1 className="mt-2 text-2xl font-bold text-text-primary md:text-3xl">{product.name}</h1>

          {/* Rating */}
          <div className="mt-2 flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'h-4 w-4',
                    i < Math.round(product.rating) ? 'fill-gold text-gold' : 'fill-none text-text-tertiary',
                  )}
                />
              ))}
            </div>
            <span className="text-sm text-text-secondary">({product.reviewCount} reviews)</span>
          </div>

          {/* Price */}
          <div className="mt-4">
            {hasDiscount && (
              <span className="text-sm text-text-tertiary line-through">
                {formatPrice(product.originalPrice!)}
              </span>
            )}
            <p className="font-heading text-3xl font-bold text-gold">
              {formatPrice(product.price)}
            </p>
          </div>

          <p className="mt-4 leading-relaxed text-text-secondary">{product.description}</p>

          {/* Quantity + Add to Cart */}
          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center rounded-lg border border-border-dark">
              <button
                className="flex h-10 w-10 items-center justify-center text-text-secondary transition-colors hover:text-text-primary"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center font-medium text-text-primary">{quantity}</span>
              <button
                className="flex h-10 w-10 items-center justify-center text-text-secondary transition-colors hover:text-text-primary"
                onClick={() => setQuantity((q) => q + 1)}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <Button
              variant="gold"
              size="lg"
              className="flex-1"
              disabled={isUnavailable}
            >
              <ShoppingBag className="h-5 w-5" />
              {isUnavailable ? 'Sold Out' : 'Add to Cart'}
            </Button>
            <button
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border-dark text-text-secondary transition-colors hover:border-gold hover:text-gold"
              aria-label="Add to wishlist"
            >
              <Heart className="h-5 w-5" />
            </button>
          </div>

          {/* WhatsApp */}
          <WhatsAppButton productName={product.name} className="mt-3 w-full" />

          <div className="mt-4 flex items-center gap-2 text-sm text-text-secondary">
            <Truck className="h-4 w-4 text-gold" /> Free shipping on orders over UGX 300,000
          </div>

          {/* Artisan card */}
          {artisan && (
            <div className="mt-8 rounded-xl border border-border-dark bg-bg-surface p-5">
              <h3 className="text-[11px] font-semibold uppercase tracking-widest text-gold">
                Meet the Artisan
              </h3>
              <div className="mt-3 flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={artisan.avatarUrl}
                  alt={artisan.name}
                  className="h-14 w-14 rounded-full border border-gold/30 object-cover"
                />
                <div>
                  <p className="font-semibold text-text-primary">{artisan.name}</p>
                  <p className="text-sm text-text-secondary">{artisan.region}, {artisan.country}</p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">{artisan.bio}</p>
              <p className="mt-2 text-xs text-text-tertiary">
                {artisan.yearsExperience} years of experience &middot; {artisan.products} products
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
