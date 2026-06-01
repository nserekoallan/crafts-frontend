'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, m, useReducedMotion } from 'motion/react';
import { HOMEPAGE_BANNERS } from '@/lib/mock-data';
import { useSiteContent } from '@/hooks/use-site-content';
import { cn } from '@/lib/utils';
import { easeOutExpo, heroTextContainer, heroTextItem } from '@/lib/motion';

/**
 * Full-width hero carousel: cross-fades between slides with a slow Ken-Burns
 * zoom and staggered headline → subtitle → CTA. First paint is instant
 * (no entrance animation on load) to protect LCP; motion plays on rotation.
 */
export function HeroBannerCarousel() {
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();
  const { data: banners } = useSiteContent('homepage.banners', HOMEPAGE_BANNERS);

  const next = useCallback(() => {
    setActive((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    const id = setInterval(next, 6000);
    return () => clearInterval(id);
  }, [next]);

  const safeActive = banners.length > 0 ? active % banners.length : 0;
  const banner = banners[safeActive];
  if (!banner) return null;

  return (
    <section className="relative h-[300px] w-full overflow-hidden sm:h-[360px] lg:h-[440px]">
      <AnimatePresence initial={false}>
        <m.div
          key={banner.id}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.8, ease: easeOutExpo }}
        >
          {/* Background image with slow Ken-Burns zoom */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <m.img
            src={banner.imageUrl}
            alt=""
            className="h-full w-full object-cover"
            initial={reduced ? false : { scale: 1.08 }}
            animate={reduced ? undefined : { scale: 1 }}
            transition={{ duration: 7, ease: 'linear' }}
          />

          {/* Gradient overlay — left-heavy for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/90 via-bg-primary/60 to-transparent" />

          {/* Content */}
          <div className="absolute inset-0 flex items-center">
            <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
              <m.div
                className="max-w-lg"
                variants={heroTextContainer}
                initial={reduced ? false : 'hidden'}
                animate="visible"
              >
                <m.div variants={heroTextItem}>
                  <Image
                    src="/logo.jpg"
                    alt=""
                    width={80}
                    height={80}
                    className="mb-4 h-16 w-16 rounded-xl object-cover opacity-90 md:h-20 md:w-20"
                  />
                </m.div>
                <m.h1
                  variants={heroTextItem}
                  className="font-heading text-3xl font-bold leading-tight text-text-primary md:text-5xl lg:text-6xl"
                >
                  {banner.title}
                </m.h1>
                <m.p variants={heroTextItem} className="mt-3 text-base text-text-secondary md:text-lg">
                  {banner.subtitle}
                </m.p>
                <m.div variants={heroTextItem}>
                  <Link
                    href={banner.ctaHref}
                    className="mt-6 inline-flex h-12 items-center rounded-lg bg-gold px-8 font-semibold text-bg-primary transition-colors hover:bg-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
                  >
                    {banner.ctaLabel}
                  </Link>
                </m.div>
              </m.div>
            </div>
          </div>
        </m.div>
      </AnimatePresence>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={cn(
              'h-2 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50',
              i === safeActive ? 'w-6 bg-gold' : 'w-2 bg-text-tertiary',
            )}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
