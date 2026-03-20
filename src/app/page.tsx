'use client';

import Link from 'next/link';
import { ArrowRight, Gem, HandHelping, ShieldCheck, Truck } from 'lucide-react';
import { HeroBannerCarousel } from '@/components/home/hero-banner-carousel';
import { DealTile } from '@/components/home/deal-tile';
import { DenseProductCard } from '@/components/products/dense-product-card';
import { PRODUCTS, DEAL_ZONES, ARTISANS } from '@/lib/mock-data';

const TRENDING = PRODUCTS.filter((p) => p.featured).slice(0, 8);
const NEW_ARRIVALS = PRODUCTS.filter((p) => p.isNew).slice(0, 8);
const SPOTLIGHT_ARTISAN = ARTISANS[0];
const ARTISAN_PRODUCTS = PRODUCTS.filter((p) => p.artisanId === SPOTLIGHT_ARTISAN.id).slice(0, 4);

/**
 * Dark, immersive homepage — shop-first design with hero carousel,
 * deal zones, product grids, lifestyle banner and artisan spotlight.
 */
export default function HomePage() {
  return (
    <div>
      {/* 1. Hero Banner Carousel */}
      <HeroBannerCarousel />

      {/* 2. Deal Zones Strip */}
      <section className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <div className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:overflow-visible">
          {DEAL_ZONES.map((deal) => (
            <DealTile key={deal.id} deal={deal} />
          ))}
        </div>
      </section>

      {/* 3. Trending Now */}
      <section className="mx-auto max-w-7xl px-4 pb-12 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gold md:text-sm">
            Trending Now
          </h2>
          <Link
            href="/shop"
            className="flex items-center gap-1 text-xs font-medium text-text-secondary transition-colors hover:text-gold"
          >
            View All <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {TRENDING.map((product) => (
            <DenseProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. Full-Width Lifestyle Banner */}
      <section className="relative h-64 w-full overflow-hidden md:h-96">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/products/product-17.jpg"
          alt="Wall art lifestyle"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-bg-primary/60" />
        <div className="absolute inset-0 flex items-center justify-center text-center">
          <div>
            <p className="font-heading text-2xl font-bold text-text-primary md:text-4xl">
              Every piece tells a story
            </p>
            <Link
              href="/artisans"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-gold transition-colors hover:text-gold-light"
            >
              Meet Our Artisans <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Just Arrived */}
      <section className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gold md:text-sm">
            Just Arrived
          </h2>
          <Link
            href="/shop?sort=newest"
            className="flex items-center gap-1 text-xs font-medium text-text-secondary transition-colors hover:text-gold"
          >
            View All <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {NEW_ARRIVALS.map((product) => (
            <DenseProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 6. Artisan Spotlight */}
      <section className="mx-auto max-w-7xl px-4 pb-12 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-gold/20 bg-bg-elevated p-6 md:p-10">
          <div className="flex flex-col gap-8 md:flex-row md:items-start">
            <div className="shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={SPOTLIGHT_ARTISAN.avatarUrl}
                alt={SPOTLIGHT_ARTISAN.name}
                className="h-20 w-20 rounded-full border-2 border-gold object-cover md:h-24 md:w-24"
              />
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gold">
                Artisan Spotlight
              </p>
              <h3 className="mt-1 text-xl font-bold text-text-primary">
                {SPOTLIGHT_ARTISAN.name}
              </h3>
              <p className="text-sm text-text-secondary">
                {SPOTLIGHT_ARTISAN.region}, {SPOTLIGHT_ARTISAN.country} &middot; {SPOTLIGHT_ARTISAN.yearsExperience} years experience
              </p>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                {SPOTLIGHT_ARTISAN.bio}
              </p>
              <Link
                href="/artisans"
                className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-gold transition-colors hover:text-gold-light"
              >
                View Artisan Profile <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Artisan products */}
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
            {ARTISAN_PRODUCTS.map((product) => (
              <DenseProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
