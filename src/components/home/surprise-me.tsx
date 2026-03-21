'use client';

import { useCallback, useRef, useState } from 'react';
import { RefreshCw, Sparkles } from 'lucide-react';
import { DenseProductCard } from '@/components/products/dense-product-card';
import { PRODUCTS } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

/**
 * "Surprise Me" section — reveals a random product with a golden shimmer animation.
 * Tracks shown products in session to avoid repeats.
 */
export function SurpriseMe() {
  const [product, setProduct] = useState<typeof PRODUCTS[number] | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const shownIds = useRef<Set<string>>(new Set());

  const pickRandom = useCallback(() => {
    const available = PRODUCTS.filter((p) => !shownIds.current.has(p.id));
    const pool = available.length > 0 ? available : PRODUCTS;

    if (available.length === 0) {
      shownIds.current.clear();
    }

    const picked = pool[Math.floor(Math.random() * pool.length)];
    shownIds.current.add(picked.id);

    setIsRevealing(true);
    setTimeout(() => {
      setProduct(picked);
      setIsRevealing(false);
    }, 400);
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div className="overflow-hidden rounded-2xl border border-gold/20 bg-bg-elevated p-6 md:p-8">
        <div className="flex flex-col items-center text-center">
          <Sparkles className="h-6 w-6 text-gold animate-gold-pulse" />
          <h2 className="mt-2 font-heading text-xl font-bold text-text-primary md:text-2xl">
            Feeling Adventurous?
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Let us surprise you with a handpicked treasure
          </p>

          {!product ? (
            <button
              onClick={pickRandom}
              className="mt-5 inline-flex h-12 items-center gap-2 rounded-xl bg-gold px-8 text-sm font-bold text-bg-primary transition-all hover:bg-gold-light active:scale-[0.97]"
            >
              <Sparkles className="h-4 w-4" />
              Surprise Me
            </button>
          ) : (
            <div className="mt-6 w-full max-w-xs">
              <div
                className={cn(
                  'transition-all duration-400',
                  isRevealing ? 'scale-95 opacity-0' : 'animate-golden-reveal',
                )}
              >
                <DenseProductCard product={product} />
              </div>
              <button
                onClick={pickRandom}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-gold"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Not this one? Try again
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
