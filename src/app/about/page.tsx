import Image from 'next/image';
import Link from 'next/link';
import { Heart, Globe, ShieldCheck, Users } from 'lucide-react';

const VALUES = [
  {
    icon: Heart,
    title: 'Authentic Craftsmanship',
    description:
      'Every piece on our marketplace is handcrafted by skilled artisans using traditional techniques passed down through generations.',
  },
  {
    icon: Users,
    title: 'Empowering Artisans',
    description:
      'We ensure fair compensation and direct market access for artisans, helping them sustain their livelihoods and communities.',
  },
  {
    icon: Globe,
    title: 'Celebrating Heritage',
    description:
      'We connect the world to the rich cultural heritage of Africa by making authentic artisan products accessible globally.',
  },
  {
    icon: ShieldCheck,
    title: 'Quality Guaranteed',
    description:
      'Each product is verified for quality and authenticity before it reaches your hands, so you can buy with confidence.',
  },
] as const;

/**
 * About page — brand story, mission, and values.
 */
export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:py-20 lg:px-8">
      {/* Hero */}
      <div className="text-center">
        <Image
          src="/logo.jpg"
          alt="Crafts Continent"
          width={96}
          height={96}
          className="mx-auto mb-6 h-20 w-20 rounded-2xl object-cover md:h-24 md:w-24"
        />
        <h1 className="font-heading text-3xl font-bold text-text-primary md:text-4xl">
          About Crafts Continent
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-text-secondary">
          Crafts Continent is an online marketplace dedicated to bringing authentic African
          artisan products to the world. We bridge the gap between talented makers and
          conscious consumers who value quality, heritage, and fair trade.
        </p>
      </div>

      {/* Mission */}
      <div className="mt-16 rounded-2xl border border-border-dark bg-bg-surface p-8 text-center md:p-12">
        <h2 className="font-heading text-xl font-bold text-gold md:text-2xl">
          Our Mission
        </h2>
        <p className="mt-4 text-base leading-relaxed text-text-secondary">
          To preserve and promote African craftsmanship by providing artisans with a
          global platform, fair compensation, and the tools they need to thrive &mdash;
          while offering customers unique, handcrafted products with a story.
        </p>
      </div>

      {/* Values */}
      <div className="mt-16">
        <h2 className="text-center font-heading text-xl font-bold text-text-primary md:text-2xl">
          What We Stand For
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {VALUES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-xl border border-border-dark bg-bg-surface p-6"
            >
              <Icon className="h-6 w-6 text-gold" />
              <h3 className="mt-3 text-sm font-bold text-text-primary">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-16 text-center">
        <p className="text-base text-text-secondary">
          Discover unique, handcrafted pieces from across the continent.
        </p>
        <Link
          href="/shop"
          className="mt-4 inline-flex h-11 items-center rounded-lg bg-gold px-8 text-sm font-bold text-bg-primary transition-colors hover:bg-gold/90 active:scale-[0.98]"
        >
          Explore the Shop
        </Link>
      </div>
    </div>
  );
}
