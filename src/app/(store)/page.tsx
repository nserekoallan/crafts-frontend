'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { m } from 'motion/react';
import { ArrowRight, Gem, HandHelping, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import { HeroBannerCarousel } from '@/components/home/hero-banner-carousel';
import { DealTile } from '@/components/home/deal-tile';
import { DenseProductCard } from '@/components/products/dense-product-card';
import { DailyDiscovery } from '@/components/home/daily-discovery';
import { FlashDeals } from '@/components/home/flash-deals';
import { CollectionsStrip } from '@/components/home/collections-strip';
import { SurpriseMe } from '@/components/home/surprise-me';
import { RecentlyViewedStrip } from '@/components/products/recently-viewed-strip';
import { Stagger, StaggerItem } from '@/components/motion/stagger';
import { Reveal } from '@/components/motion/reveal';
import { useParallax } from '@/hooks/use-parallax';
import { useProducts } from '@/hooks/use-products';
import { useCategories } from '@/hooks/use-categories';
import { useSiteContent } from '@/hooks/use-site-content';
import { DEAL_ZONES, type DealZone } from '@/lib/mock-data';

// Icon map for trust points received from the API
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  gem: Gem,
  'shield-check': ShieldCheck,
  'hand-helping': HandHelping,
  truck: Truck,
};

const DEFAULT_TRUST_POINTS = [
  {
    id: 1,
    icon: 'gem',
    title: 'Authentically Handcrafted',
    description: 'Every piece is made by hand using traditional techniques passed down through generations.',
  },
  {
    id: 2,
    icon: 'shield-check',
    title: 'Quality Guaranteed',
    description: 'Each item passes our quality inspection before reaching you.',
  },
  {
    id: 3,
    icon: 'hand-helping',
    title: 'Empowering Communities',
    description: 'Your purchase directly supports artisan cooperatives across Africa.',
  },
  {
    id: 4,
    icon: 'truck',
    title: 'Worldwide Shipping',
    description: 'Free shipping on orders over UGX 300,000. Tracked delivery to your door.',
  },
];

const DEFAULT_LIFESTYLE_BANNER = {
  imageUrl: '/products/product-17.jpg',
  headline: 'Every piece tells a story',
  ctaLabel: 'Discover More',
  ctaHref: '/about',
};

const DEAL_ZONE_SKELETON = [1, 2, 3, 4];

export default function HomePage() {
  const { products: trendingProducts } = useProducts({ limit: 8 });
  const { products: newArrivals } = useProducts({ limit: 8, page: 2 });
  const { products: featuredProducts } = useProducts({ limit: 6, featured: true });
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { data: trustPoints } = useSiteContent('homepage.trustPoints', DEFAULT_TRUST_POINTS);
  const { data: lifestyleBanner } = useSiteContent('homepage.lifestyleBanner', DEFAULT_LIFESTYLE_BANNER);
  const lifestyleRef = useRef<HTMLDivElement>(null);
  const lifestyleY = useParallax(lifestyleRef, 40);

  const dealZones: DealZone[] = categories.length > 0
    ? categories.slice(0, 4).map((cat) => ({
        id: cat.id,
        title: cat.name,
        imageUrl: DEAL_ZONES[0]?.imageUrl ?? '',
        itemCount: 0,
        href: `/shop?category=${cat.slug}`,
      }))
    : DEAL_ZONES;

  return (
    <div>
      {/* 1. Hero Banner Carousel */}
      <HeroBannerCarousel />

      {/* 2. Deal Zones Strip */}
      <section className="mx-auto max-w-7xl px-4 py-8 md:py-10 lg:px-8">
        <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:overflow-visible md:gap-4">
          {categoriesLoading
            ? DEAL_ZONE_SKELETON.map((i) => (
                <div
                  key={i}
                  className="h-40 min-w-[200px] flex-1 animate-pulse rounded-xl bg-bg-surface md:h-48"
                />
              ))
            : dealZones.map((deal) => (
                <DealTile key={deal.id} deal={deal} />
              ))}
        </div>
      </section>

      {/* 3. Daily Discovery */}
      <DailyDiscovery />

      {/* 4. Featured Products (only rendered when there are active featured products) */}
      {featuredProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-8 md:pb-10 lg:px-8">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-gold md:text-sm">
              <Sparkles className="h-4 w-4" />
              Featured Picks
            </h2>
          </div>
          <Stagger className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:mt-6 lg:grid-cols-4 lg:gap-5 xl:grid-cols-5">
            {featuredProducts.map((product) => (
              <StaggerItem key={product.id}>
                <DenseProductCard product={product} />
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      )}

      {/* 5. Flash Deals */}
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
        <Stagger className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:mt-6 lg:grid-cols-4 lg:gap-5 xl:grid-cols-5">
          {trendingProducts.map((product) => (
            <StaggerItem key={product.id}>
              <DenseProductCard product={product} />
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* 6. Collections Strip */}
      <CollectionsStrip />

      {/* 7. Full-Width Lifestyle Banner */}
      <section ref={lifestyleRef} className="relative h-52 w-full overflow-hidden sm:h-64 md:h-80">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <m.img
          src={lifestyleBanner.imageUrl}
          alt="Wall art lifestyle"
          style={{ y: lifestyleY }}
          className="absolute inset-x-0 -top-[12%] h-[124%] w-full object-cover"
        />
        <div className="absolute inset-0 bg-bg-primary/60" />
        <div className="absolute inset-0 flex items-center justify-center px-4 text-center">
          <Reveal>
            <Image
              src="/logo.jpg"
              alt=""
              width={64}
              height={64}
              className="mx-auto mb-4 h-14 w-14 rounded-xl object-cover md:h-16 md:w-16"
            />
            <p className="font-heading text-xl font-bold text-text-primary md:text-3xl lg:text-4xl">
              {lifestyleBanner.headline}
            </p>
            <Link
              href={lifestyleBanner.ctaHref}
              className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-gold transition-colors hover:text-gold-light md:mt-4"
            >
              {lifestyleBanner.ctaLabel} <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
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
        <Stagger className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:mt-6 lg:grid-cols-4 lg:gap-5 xl:grid-cols-5">
          {newArrivals.map((product) => (
            <StaggerItem key={product.id}>
              <DenseProductCard product={product} />
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* 9. Surprise Me */}
      <SurpriseMe />

      {/* 10. Why Crafts Continent — trust/brand section */}
      <section className="mx-auto max-w-7xl px-4 py-10 md:py-12 lg:px-8">
        <h2 className="text-center text-xs font-bold uppercase tracking-[0.2em] text-gold md:text-sm">
          Why Crafts Continent
        </h2>
        <Stagger className="mt-6 grid grid-cols-2 gap-4 md:mt-8 md:grid-cols-4 md:gap-6">
          {trustPoints.map((point) => {
            const Icon = ICON_MAP[point.icon] ?? Gem;
            return (
              <StaggerItem
                key={point.id}
                className="rounded-xl border border-border-dark bg-bg-elevated p-4 text-center md:p-6"
              >
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gold-muted md:h-12 md:w-12">
                  <Icon className="h-5 w-5 text-gold md:h-6 md:w-6" />
                </div>
                <h3 className="mt-3 text-sm font-bold text-text-primary">{point.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-text-secondary md:text-sm">
                  {point.description}
                </p>
              </StaggerItem>
            );
          })}
        </Stagger>
      </section>

      {/* 11. Recently Viewed */}
      <RecentlyViewedStrip />
    </div>
  );
}
