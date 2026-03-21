'use client';

import { use, useEffect, useState } from 'react';
import { Check, Copy, Heart, MapPin, Minus, Plus, Share2, ShoppingBag, Star, Truck } from 'lucide-react';
import { useCart } from '@/lib/cart';
import { useWishlist } from '@/lib/wishlist';
import { useRecentlyViewed } from '@/lib/recently-viewed';
import { useCurrency } from '@/lib/currency';
import { cn } from '@/lib/utils';
import { DiscountBadge } from '@/components/ui/discount-badge';
import { StockBadge } from '@/components/ui/stock-badge';
import { WhatsAppButton } from '@/components/ui/whatsapp-button';
import { RecentlyViewedStrip } from '@/components/products/recently-viewed-strip';
import { findProductBySlug, PRODUCTS } from '@/lib/mock-data';

/**
 * Product detail page — dark theme with cart, wishlist, share, and provenance.
 */
export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const { formatPrice } = useCurrency();
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { recordView } = useRecentlyViewed();

  const product = findProductBySlug(slug) ?? PRODUCTS[0];
  const hasDiscount = !!product.originalPrice && product.originalPrice > product.price;
  const isUnavailable = product.stockStatus === 'out_of_stock';
  const wishlisted = isWishlisted(product.id);

  // Record view
  useEffect(() => {
    recordView({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      imageUrl: product.imageUrl,
      category: product.category,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  const handleAddToCart = () => {
    if (isUnavailable || isAdded) return;
    addItem(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  };

  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(
    `Check out this: ${product.name} - ${formatPrice(product.price)}\n${typeof window !== 'undefined' ? window.location.href : ''}`,
  )}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-8 lg:px-8">
      {/* Breadcrumb */}
      <p className="mb-4 text-sm text-text-tertiary md:mb-6">
        <a href="/shop" className="transition-colors hover:text-gold">Shop</a>
        {' / '}
        <span className="text-text-secondary">{product.name}</span>
      </p>

      <div className="grid gap-6 md:gap-10 lg:grid-cols-2">
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
          <div className="scrollbar-hide mt-3 flex gap-2 overflow-x-auto md:mt-4 md:gap-3">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={cn(
                  'h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors md:h-20 md:w-20',
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
          <h1 className="mt-1.5 text-xl font-bold text-text-primary md:mt-2 md:text-2xl lg:text-3xl">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="mt-2 flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'h-3.5 w-3.5 md:h-4 md:w-4',
                    i < Math.round(product.rating) ? 'fill-gold text-gold' : 'fill-none text-text-tertiary',
                  )}
                />
              ))}
            </div>
            <span className="text-sm text-text-secondary">({product.reviewCount} reviews)</span>
          </div>

          {/* Price */}
          <div className="mt-3 md:mt-4">
            {hasDiscount && (
              <span className="text-sm text-text-tertiary line-through">
                {formatPrice(product.originalPrice!)}
              </span>
            )}
            <p className="font-heading text-2xl font-bold text-gold md:text-3xl">
              {formatPrice(product.price)}
            </p>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-text-secondary md:mt-4 md:text-base">
            {product.description}
          </p>

          {/* Quantity + Add to Cart */}
          <div className="mt-5 flex items-center gap-3 md:mt-6 md:gap-4">
            <div className="flex items-center rounded-lg border border-border-dark">
              <button
                className="flex h-10 w-10 items-center justify-center text-text-secondary transition-colors hover:text-text-primary md:h-12 md:w-12"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center font-medium text-text-primary md:w-10">
                {quantity}
              </span>
              <button
                className="flex h-10 w-10 items-center justify-center text-text-secondary transition-colors hover:text-text-primary md:h-12 md:w-12"
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isUnavailable}
              className={cn(
                'flex h-10 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all md:h-12',
                isAdded
                  ? 'bg-success/20 text-success'
                  : isUnavailable
                    ? 'cursor-not-allowed bg-bg-surface text-text-tertiary'
                    : 'bg-gold text-bg-primary hover:bg-gold-light active:scale-[0.98]',
              )}
            >
              {isAdded ? (
                <>
                  <Check className="h-5 w-5 animate-check-pop" />
                  Added to Cart
                </>
              ) : isUnavailable ? (
                'Sold Out'
              ) : (
                <>
                  <ShoppingBag className="h-5 w-5" />
                  Add to Cart
                </>
              )}
            </button>

            <button
              onClick={() => toggleWishlist(product.id)}
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors md:h-12 md:w-12',
                wishlisted
                  ? 'border-gold/40 bg-gold/10 text-gold'
                  : 'border-border-dark text-text-secondary hover:border-gold hover:text-gold',
              )}
              aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart className={cn('h-5 w-5', wishlisted && 'fill-gold')} />
            </button>
          </div>

          {/* WhatsApp + Share */}
          <div className="mt-3 flex gap-2">
            <WhatsAppButton productName={product.name} className="flex-1" />

            <div className="relative">
              <button
                onClick={() => setShowShare(!showShare)}
                className="flex h-10 items-center gap-1.5 rounded-lg border border-border-dark px-3 text-sm text-text-secondary transition-colors hover:border-gold hover:text-gold"
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Share</span>
              </button>

              {showShare && (
                <div className="absolute right-0 top-12 z-20 w-48 rounded-xl border border-border-dark bg-bg-elevated p-2 shadow-xl animate-modal-in">
                  <a
                    href={whatsappShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-bg-surface hover:text-text-primary"
                  >
                    WhatsApp
                  </a>
                  <button
                    onClick={handleCopyLink}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-bg-surface hover:text-text-primary"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-success" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy Link
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Shipping info */}
          <div className="mt-4 flex items-center gap-2 text-sm text-text-secondary">
            <Truck className="h-4 w-4 text-gold" /> Free shipping on orders over UGX 300,000
          </div>

          {/* Provenance card — replaces artisan card */}
          <div className="mt-6 rounded-xl border border-border-dark bg-bg-surface p-4 md:mt-8 md:p-5">
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-gold">
              Provenance
            </h3>
            <div className="mt-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-terracotta" />
              <p className="text-sm font-medium text-text-primary">
                Handcrafted in {product.region}
              </p>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              This piece is handmade using traditional techniques and locally sourced materials.
              Each item is unique — slight variations in colour and texture are a hallmark of authentic craftsmanship.
            </p>
          </div>
        </div>
      </div>

      {/* Recently Viewed */}
      <div className="mt-12">
        <RecentlyViewedStrip />
      </div>
    </div>
  );
}
