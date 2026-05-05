'use client';

import { useMemo } from 'react';
import { MapPin, Sparkles } from 'lucide-react';
import { DenseProductCard } from '@/components/products/dense-product-card';
import { useProducts } from '@/hooks/use-products';

/** Craft process stories keyed by real category name. */
const CRAFT_STORIES: Record<string, string> = {
  'Heritage Home & Decor':
    'Each piece begins with hand-harvested natural fibres — elephant grass, sweetgrass, and raffia — sun-dried and dyed with local pigments. Weavers coil them tightly over several days using bone needles, embedding ancestral patterns that tell stories of community, harvest, and celebration.',
  'African Capsule Accessories':
    'Starting with bold Ankara wax-print fabric and hand-woven kente strips sourced from West African workshops, each accessory is hand-cut and sewn in a small studio. Vibrant geometric prints carry cultural symbolism passed down through generations.',
  'Waste-to-Wealth':
    'Reclaimed materials — crushed glass bottles, recycled rubber, salvaged metals — are transformed by skilled artisans into beautiful, purposeful objects. Every piece diverts waste from landfill while celebrating the ingenuity of African craft traditions.',
  'DIY Craft Kits':
    'Each kit is assembled by the same artisans who practise the technique professionally. You receive the same raw materials they use — natural fibres, authentic dyes, traditional tools — along with step-by-step guides so you can learn the craft at home.',
};

const FALLBACK_STORY = CRAFT_STORIES['Heritage Home & Decor'];

/**
 * Daily featured product — rotates based on date seed.
 * Focuses on craft technique and origin region, not artisan identity.
 */
export function DailyDiscovery() {
  const { products, isLoading } = useProducts({ limit: 20 });

  const product = useMemo(() => {
    if (products.length === 0) return null;
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    return products[seed % products.length];
  }, [products]);

  if (isLoading || !product) return null;

  const story = CRAFT_STORIES[product.category] ?? FALLBACK_STORY;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-gold animate-gold-pulse" />
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gold md:text-sm">
          {"Today's Discovery"}
        </h2>
      </div>

      <div className="mt-5 grid gap-6 md:grid-cols-2">
        {/* Product card */}
        <div className="max-w-xs md:max-w-none">
          <DenseProductCard product={product} />
        </div>

        {/* Craft story */}
        <div className="flex flex-col justify-center">
          <h3 className="font-heading text-lg font-bold text-text-primary md:text-xl">
            {product.name}
          </h3>
          <div className="mt-2 flex items-center gap-1.5 text-sm text-text-secondary">
            <MapPin className="h-3.5 w-3.5 text-terracotta" />
            Handcrafted in {product.region}
          </div>
          <p className="mt-4 text-sm leading-relaxed text-text-secondary">
            {story}
          </p>
          <a
            href={`/shop/${product.slug}`}
            className="mt-4 inline-flex w-fit items-center rounded-lg border border-gold px-5 py-2 text-sm font-semibold text-gold transition-colors hover:bg-gold hover:text-bg-primary"
          >
            Discover This Piece
          </a>
        </div>
      </div>
    </section>
  );
}
