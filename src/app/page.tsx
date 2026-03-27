'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Gem, HandHelping, ShieldCheck, Truck } from 'lucide-react';
import { HeroBannerCarousel } from '@/components/home/hero-banner-carousel';
import { DealTile } from '@/components/home/deal-tile';
import { DenseProductCard } from '@/components/products/dense-product-card';
import { DailyDiscovery } from '@/components/home/daily-discovery';
import { FlashDeals } from '@/components/home/flash-deals';
import { CollectionsStrip } from '@/components/home/collections-strip';
import { SurpriseMe } from '@/components/home/surprise-me';
import { RecentlyViewedStrip } from '@/components/products/recently-viewed-strip';
import { PRODUCTS, DEAL_ZONES } from '@/lib/mock-data';

const TRENDING = PRODUCTS.filter((p) => p.featured).slice(0, 8);
const NEW_ARRIVALS = PRODUCTS.filter((p) => p.isNew).slice(0, 8);

const TRUST_POINTS = [
  {
    icon: Gem,
    title: 'Authentically Handcrafted',
    description: 'Every piece is made by hand using traditional techniques passed down through generations.',
  },
  {
    icon: ShieldCheck,
    title: 'Quality Guaranteed',
    description: 'Each item passes our quality inspection before reaching you.',
  },
  {
    icon: HandHelping,
    title: 'Empowering Communities',
    description: 'Your purchase directly supports artisan cooperatives across Africa.',
  },
  {
    icon: Truck,
    title: 'Worldwide Shipping',
    description: 'Free shipping on orders over UGX 300,000. Tracked delivery to your door.',
  },
];

/**
 * Dark, immersive homepage — shop-first design with hero carousel,
 * daily discovery, flash deals, collections, surprise me and trust section.
 */
export default function HomePage() {
  return (
    <div>
      {/* 1. Hero Banner Carousel */}
      <HeroBannerCarousel />

      {/* 2. Deal Zones Strip */}
      <section className="mx-auto max-w-7xl px-4 py-8 md:py-10 lg:px-8">
        <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:overflow-visible md:gap-4">
          {DEAL_ZONES.map((deal) => (
            <DealTile key={deal.id} deal={deal} />
          ))}
        </div>
      </section>

      {/* 3. Daily Discovery */}
      <DailyDiscovery />

      {/* 4. Flash Deals */}
      <FlashDeals />

      {/* 5. Trending Now */}
      <section className="mx-auto max-w-7xl px-4 pb-10 md:pb-12 lg:px-8">
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
        <div className="mt-5 grid grid-cols-2 gap-3 md:mt-6 md:grid-cols-4 md:gap-5">
          {TRENDING.map((product, i) => (
            <DenseProductCard key={product.id} product={product} animationDelay={i * 50} />
          ))}
        </div>
      </section>

      {/* 6. Collections Strip */}
      <CollectionsStrip />

      {/* 7. Full-Width Lifestyle Banner */}
      <section className="relative h-56 w-full overflow-hidden md:h-80 lg:h-96">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/products/product-17.jpg"
          alt="Wall art lifestyle"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-bg-primary/60" />
        <div className="absolute inset-0 flex items-center justify-center px-4 text-center">
          <div>
            <Image
              src="/logo.jpg"
              alt=""
              width={64}
              height={64}
              className="mx-auto mb-4 h-14 w-14 rounded-xl object-cover md:h-16 md:w-16"
            />
            <p className="font-heading text-xl font-bold text-text-primary md:text-3xl lg:text-4xl">
              Every piece tells a story
            </p>
            <Link
              href="/shop"
              className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-gold transition-colors hover:text-gold-light md:mt-4"
            >
              Explore Our Collections <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 8. Just Arrived */}
      <section className="mx-auto max-w-7xl px-4 py-10 md:py-12 lg:px-8">
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
        <div className="mt-5 grid grid-cols-2 gap-3 md:mt-6 md:grid-cols-4 md:gap-5">
          {NEW_ARRIVALS.map((product, i) => (
            <DenseProductCard key={product.id} product={product} animationDelay={i * 50} />
          ))}
        </div>
      </section>

      {/* 9. Surprise Me */}
      <SurpriseMe />

      {/* 10. Why Crafts Continent — trust/brand section */}
      <section className="mx-auto max-w-7xl px-4 py-10 md:py-12 lg:px-8">
        <h2 className="text-center text-xs font-bold uppercase tracking-[0.2em] text-gold md:text-sm">
          Why Crafts Continent
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-4 md:mt-8 md:grid-cols-4 md:gap-6">
          {TRUST_POINTS.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-xl border border-border-dark bg-bg-elevated p-4 text-center md:p-6"
            >
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gold-muted md:h-12 md:w-12">
                <Icon className="h-5 w-5 text-gold md:h-6 md:w-6" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-text-primary">{title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-text-secondary md:text-sm">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 11. Recently Viewed */}
      <RecentlyViewedStrip />
    </div>
  );
}
