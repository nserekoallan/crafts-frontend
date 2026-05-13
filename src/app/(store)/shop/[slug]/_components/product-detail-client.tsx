'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, Copy, Heart, MapPin, Minus, Plus, Share2, ShoppingBag, Star, Truck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { DenseProductCard } from '@/components/products/dense-product-card';
import { useCart } from '@/lib/cart';
import { useWishlist } from '@/lib/wishlist';
import { useRecentlyViewed } from '@/lib/recently-viewed';
import { useCurrency } from '@/lib/currency';
import { cn } from '@/lib/utils';
import { DiscountBadge } from '@/components/ui/discount-badge';
import { StockBadge } from '@/components/ui/stock-badge';
import { WhatsAppButton } from '@/components/ui/whatsapp-button';
import { RecentlyViewedStrip } from '@/components/products/recently-viewed-strip';
import { ProductReviews } from '@/components/products/product-reviews';
import { api } from '@/lib/api';
import { mapApiProductToProduct, type ApiProduct, type ApiProductsResponse, type ApiProductVariant } from '@/lib/types/product';
import { track } from '@/lib/analytics';

interface ProductDetailClientProps {
  slug: string;
}

/**
 * Product detail page — interactive client component.
 * Receives the slug and fetches its own data client-side for hydration.
 */
export function ProductDetailClient({ slug }: ProductDetailClientProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const { formatPrice } = useCurrency();
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { recordView } = useRecentlyViewed();

  const { data: productData, isLoading, isError } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => api.get<{ data: ApiProduct }>(`/products/slug/${slug}`).then((r) => r.data),
  });

  const product = productData ? mapApiProductToProduct(productData) : null;

  const { data: relatedData } = useQuery({
    queryKey: ['products', 'related', productData?.category?.id],
    queryFn: () =>
      api
        .get<ApiProductsResponse>(`/products?categoryId=${productData!.category.id}&limit=5`)
        .then((r) => r.data.filter((p) => p.id !== productData!.id).slice(0, 4).map(mapApiProductToProduct)),
    enabled: !!productData?.category?.id,
  });

  const relatedProducts = relatedData ?? [];

  useEffect(() => {
    if (!product) return;
    recordView({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      imageUrl: product.imageUrl,
      category: product.category,
    });
    track('product_viewed', {
      product_id: product.id,
      product_name: product.name,
      artisan_id: product.artisanId,
      price: product.price,
      category: product.category,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
        <p className="text-lg text-text-secondary">Product not found</p>
        <Link
          href="/shop"
          className="mt-4 rounded-lg border border-gold px-6 py-2 text-sm font-medium text-gold transition-colors hover:bg-gold hover:text-bg-primary"
        >
          Browse Shop
        </Link>
      </div>
    );
  }

  const hasDiscount = !!product.originalPrice && product.originalPrice > product.price;
  const wishlisted = isWishlisted(product.id);

  const variants = (productData?.variants ?? []) as ApiProductVariant[];
  const hasVariants = variants.length > 0;

  const optionDimensions = hasVariants
    ? (Array.from(
        new Set(variants.flatMap((v) => Object.keys(v.options))),
      ) as Array<'size' | 'color' | 'material'>)
    : [];

  const selectedVariant =
    hasVariants && optionDimensions.length > 0 && optionDimensions.every((dim) => selectedOptions[dim])
      ? variants.find((v) =>
          optionDimensions.every((dim) => v.options[dim] === selectedOptions[dim]),
        ) ?? null
      : null;

  const allOptionsSelected =
    !hasVariants || (optionDimensions.length > 0 && optionDimensions.every((dim) => selectedOptions[dim]));

  const effectivePrice =
    selectedVariant?.price != null ? Number(selectedVariant.price) : product.price;

  const effectiveStock = selectedVariant != null ? selectedVariant.stock : (product.stockCount ?? 0);
  const isUnavailable = effectiveStock <= 0;

  const handleAddToCart = () => {
    if (isUnavailable || isAdded || !allOptionsSelected) return;
    const itemProduct = effectivePrice !== product.price
      ? { ...product, price: effectivePrice }
      : product;
    addItem(itemProduct, quantity, selectedVariant?.id);
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
        <Link href="/shop" className="transition-colors hover:text-gold">Shop</Link>
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
        <div className="lg:sticky lg:top-[200px] lg:self-start">
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
            {hasDiscount && effectivePrice === product.price && (
              <span className="text-sm text-text-tertiary line-through">
                {formatPrice(product.originalPrice!)}
              </span>
            )}
            <p className="font-heading text-2xl font-bold text-gold md:text-3xl">
              {formatPrice(effectivePrice)}
            </p>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-text-secondary md:mt-4 md:text-base">
            {product.description}
          </p>

          {/* Variant Selector */}
          {hasVariants && optionDimensions.length > 0 && (
            <div className="mt-4 space-y-3 md:mt-5">
              {optionDimensions.map((dim) => {
                const dimValues = Array.from(
                  new Set(variants.map((v) => v.options[dim]).filter(Boolean)),
                ) as string[];
                return (
                  <div key={dim}>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary">
                      {dim.charAt(0).toUpperCase() + dim.slice(1)}
                      {selectedOptions[dim] && (
                        <span className="ml-2 normal-case font-normal text-text-tertiary">
                          — {selectedOptions[dim]}
                        </span>
                      )}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {dimValues.map((val) => (
                        <button
                          key={val}
                          onClick={() =>
                            setSelectedOptions((prev) => ({ ...prev, [dim]: val }))
                          }
                          className={cn(
                            'rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
                            selectedOptions[dim] === val
                              ? 'border-gold bg-gold/10 text-gold'
                              : 'border-border-dark text-text-secondary hover:border-gold/50 hover:text-text-primary',
                          )}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

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
              disabled={isUnavailable || !allOptionsSelected}
              className={cn(
                'flex h-10 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all md:h-12',
                isAdded
                  ? 'bg-success/20 text-success'
                  : isUnavailable
                    ? 'cursor-not-allowed bg-bg-surface text-text-tertiary'
                    : !allOptionsSelected
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
              ) : !allOptionsSelected ? (
                'Select options to add to cart'
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

          {/* Artisan card */}
          <div className="mt-6 rounded-xl border border-border-dark bg-bg-surface p-4 md:mt-8 md:p-5">
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-gold">
              Artisan
            </h3>
            <div className="mt-3">
              <Link
                href={`/artisans/${product.artisanId}`}
                className="text-sm font-semibold text-text-primary transition-colors hover:text-gold"
              >
                {product.artisanName}
              </Link>
              {product.region && (
                <div className="mt-1.5 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-terracotta" />
                  <span className="text-sm text-text-secondary">{product.region}</span>
                </div>
              )}
              {product.rating > 0 && (
                <div className="mt-2 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'h-3 w-3',
                        i < Math.round(product.rating) ? 'fill-gold text-gold' : 'fill-none text-text-tertiary',
                      )}
                    />
                  ))}
                  <span className="ml-1 text-xs text-text-tertiary">
                    ({product.reviewCount} reviews)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      {productData && <ProductReviews productId={productData.id} />}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gold md:text-sm">
            You May Also Like
          </h2>
          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
            {relatedProducts.map((p, i) => (
              <DenseProductCard key={p.id} product={p} animationDelay={i * 50} />
            ))}
          </div>
        </section>
      )}

      {/* Recently Viewed */}
      <div className="mt-12">
        <RecentlyViewedStrip />
      </div>
    </div>
  );
}
