'use client';

import { useMemo } from 'react';
import { MapPin, Sparkles } from 'lucide-react';
import { DenseProductCard } from '@/components/products/dense-product-card';
import { PRODUCTS } from '@/lib/mock-data';

/** Craft process stories keyed by category. */
const CRAFT_STORIES: Record<string, string> = {
  'Heritage Wall Art':
    'Each plate begins as hand-harvested sisal and raffia fibres, sun-dried and naturally dyed with local pigments. The weaver coils them tightly over 3-5 days using a bone needle, embedding ancestral patterns that tell stories of community, harvest, and celebration.',
  'Artisan Baskets':
    'Woven from sweetgrass and elephant grass gathered from riverbanks, each basket is coiled by hand using techniques passed down through generations. Natural dyes from bark and clay create the rich earth tones, and no two pieces are ever exactly alike.',
  'Shell & Bead Jewelry':
    'Cowrie shells — treasured across Africa for millennia — are hand-selected, polished, and combined with glass seed beads in traditional Maasai colour patterns. Each piece is strung on durable cord with brass findings crafted by local metalworkers.',
  'African Fashion':
    'Starting with bold Ankara wax-print fabric sourced from West African mills, each accessory is hand-cut and sewn in a Kampala studio. The vibrant geometric prints carry cultural symbolism, and every piece is finished with careful attention to colour harmony.',
};

/**
 * Daily featured product — rotates based on date seed.
 * Focuses on craft technique and origin region, not artisan identity.
 */
export function DailyDiscovery() {
  const product = useMemo(() => {
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    return PRODUCTS[seed % PRODUCTS.length];
  }, []);

  const story = CRAFT_STORIES[product.category] ?? CRAFT_STORIES['Heritage Wall Art'];

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
