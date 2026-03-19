import Link from 'next/link';
import { ProductCard } from '@/components/products/product-card';
import { CategoryCard } from '@/components/products/category-card';
import { CATEGORIES, PRODUCTS, ARTISANS } from '@/lib/mock-data';

const FEATURED_PRODUCTS = PRODUCTS.slice(0, 8);
const SPOTLIGHT_ARTISANS = ARTISANS.slice(0, 3);

/**
 * Homepage with hero, category grid, featured products and artisan spotlight.
 */
export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative bg-hunter-green px-4 py-24 text-center text-white lg:py-36">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-heading text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
            Discover Authentic African Craftsmanship
          </h1>
          <p className="mt-4 text-lg text-white/80">
            Shop unique handcrafted goods directly from artisans across the continent. Every purchase supports local communities and preserves cultural heritage.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/shop"
              className="inline-flex h-12 items-center rounded-lg bg-satin-gold px-8 font-semibold text-white transition-colors hover:bg-satin-gold-dark"
            >
              Shop Now
            </Link>
            <Link
              href="/artisans"
              className="inline-flex h-12 items-center rounded-lg border-2 border-white px-8 font-semibold text-white transition-colors hover:bg-white/10"
            >
              View Stories
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <h2 className="text-center text-2xl font-bold md:text-3xl">Browse Categories</h2>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {CATEGORIES.map((cat) => (
            <CategoryCard key={cat.slug} {...cat} />
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="mx-auto max-w-7xl px-4 pb-16 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold md:text-3xl">Featured Products</h2>
          <Link href="/shop" className="text-sm font-medium text-hunter-green hover:underline">
            View All
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {FEATURED_PRODUCTS.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </section>

      {/* Artisan Spotlight */}
      <section className="bg-light-gray px-4 py-16">
        <div className="mx-auto max-w-7xl lg:px-8">
          <h2 className="text-center text-2xl font-bold md:text-3xl">Artisan Spotlight</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-medium-gray">
            Meet the talented artisans preserving centuries-old traditions while creating beautiful contemporary pieces.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {SPOTLIGHT_ARTISANS.map((artisan) => (
              <div key={artisan.id} className="rounded-xl bg-white p-6 text-center shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={artisan.avatarUrl}
                  alt={artisan.name}
                  className="mx-auto h-20 w-20 rounded-full object-cover"
                />
                <h3 className="mt-4 text-lg font-semibold">{artisan.name}</h3>
                <p className="text-sm text-medium-gray">{artisan.region}, {artisan.country}</p>
                <p className="mt-1 text-sm text-satin-gold">{artisan.craft}</p>
                <p className="mt-2 text-xs text-medium-gray">{artisan.products} products</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
