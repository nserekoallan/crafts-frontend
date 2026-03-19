'use client';

import { use } from 'react';
import { Heart, Minus, Plus, ShoppingBag, Star, Truck } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { findProductBySlug, findArtisan, PRODUCTS } from '@/lib/mock-data';

/**
 * Product detail page with image gallery, info, and artisan card.
 */
export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const product = findProductBySlug(slug) ?? PRODUCTS[0];
  const artisan = findArtisan(product.artisanId);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <p className="mb-6 text-sm text-medium-gray">
        <a href="/shop" className="hover:text-hunter-green">Shop</a> / <span>{product.name}</span>
      </p>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Image gallery */}
        <div>
          <div className="aspect-square overflow-hidden rounded-xl bg-light-gray">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.images[selectedImage]} alt={product.name} className="h-full w-full object-cover" />
          </div>
          <div className="mt-4 flex gap-3">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`h-20 w-20 overflow-hidden rounded-lg border-2 transition-colors ${selectedImage === i ? 'border-hunter-green' : 'border-transparent'}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <span className="rounded-full bg-hunter-green/10 px-3 py-1 text-xs font-semibold text-hunter-green">
            {product.region}
          </span>
          <h1 className="mt-3 text-3xl font-bold">{product.name}</h1>

          <div className="mt-2 flex items-center gap-2">
            <div className="flex items-center gap-0.5 text-satin-gold">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < Math.round(product.rating) ? 'fill-current' : 'fill-none'}`} />
              ))}
            </div>
            <span className="text-sm text-medium-gray">({product.reviewCount} reviews)</span>
          </div>

          <p className="mt-4 font-heading text-3xl font-bold text-hunter-green">
            {formatPrice(product.price, product.currency)}
          </p>

          <p className="mt-4 leading-relaxed text-charcoal-light">{product.description}</p>

          {/* Quantity + Add to cart */}
          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center rounded-lg border border-light-gray">
              <button className="flex h-10 w-10 items-center justify-center text-charcoal hover:bg-light-gray" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center font-medium">{quantity}</span>
              <button className="flex h-10 w-10 items-center justify-center text-charcoal hover:bg-light-gray" onClick={() => setQuantity((q) => q + 1)}>
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <Button variant="primary" size="lg" className="flex-1">
              <ShoppingBag className="h-5 w-5" /> Add to Cart
            </Button>
            <button className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-light-gray text-charcoal hover:text-red-500" aria-label="Add to wishlist">
              <Heart className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm text-medium-gray">
            <Truck className="h-4 w-4" /> Free shipping on orders over UGX 300,000
          </div>

          {/* Artisan card */}
          {artisan && (
            <div className="mt-8 rounded-xl border border-light-gray bg-white p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-medium-gray">Meet the Artisan</h3>
              <div className="mt-3 flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={artisan.avatarUrl}
                  alt={artisan.name}
                  className="h-14 w-14 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-charcoal">{artisan.name}</p>
                  <p className="text-sm text-medium-gray">{artisan.region}, {artisan.country}</p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-charcoal-light">{artisan.bio}</p>
              <p className="mt-2 text-xs text-medium-gray">{artisan.yearsExperience} years of experience &middot; {artisan.products} products</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
