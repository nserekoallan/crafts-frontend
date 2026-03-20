'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { HOMEPAGE_BANNERS } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

/**
 * Full-width hero banner carousel with auto-rotate and dot navigation.
 * Images with dark gradient overlay and gold CTA.
 */
export function HeroBannerCarousel() {
  const [active, setActive] = useState(0);

  const next = useCallback(() => {
    setActive((prev) => (prev + 1) % HOMEPAGE_BANNERS.length);
  }, []);

  useEffect(() => {
    const id = setInterval(next, 6000);
    return () => clearInterval(id);
  }, [next]);

  return (
    <section className="relative h-[320px] w-full overflow-hidden md:h-[500px]">
      {HOMEPAGE_BANNERS.map((banner, i) => (
        <div
          key={banner.id}
          className={cn(
            'absolute inset-0 transition-opacity duration-700',
            i === active ? 'opacity-100' : 'pointer-events-none opacity-0',
          )}
        >
          {/* Background image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={banner.imageUrl}
            alt=""
            className="h-full w-full object-cover"
          />

          {/* Gradient overlay — left-heavy for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/90 via-bg-primary/60 to-transparent" />

          {/* Content */}
          <div className="absolute inset-0 flex items-center">
            <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
              <div className="max-w-lg">
                <h1 className="font-heading text-3xl font-bold leading-tight text-text-primary md:text-5xl lg:text-6xl">
                  {banner.title}
                </h1>
                <p className="mt-3 text-base text-text-secondary md:text-lg">
                  {banner.subtitle}
                </p>
                <Link
                  href={banner.ctaHref}
                  className="mt-6 inline-flex h-12 items-center rounded-lg bg-gold px-8 font-semibold text-bg-primary transition-colors hover:bg-gold-light"
                >
                  {banner.ctaLabel}
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {HOMEPAGE_BANNERS.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={cn(
              'h-2 rounded-full transition-all',
              i === active ? 'w-6 bg-gold' : 'w-2 bg-text-tertiary',
            )}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
