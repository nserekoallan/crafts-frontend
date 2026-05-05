import Image from 'next/image';
import Link from 'next/link';

/**
 * Custom 404 page with branded logo and navigation CTAs.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <Image
        src="/logo.jpg"
        alt="Crafts Continent"
        width={128}
        height={128}
        className="h-24 w-24 rounded-2xl object-cover md:h-32 md:w-32"
      />

      <h1 className="mt-6 font-heading text-3xl font-bold text-text-primary md:text-4xl">
        Page Not Found
      </h1>
      <p className="mt-2 max-w-md text-base text-text-secondary">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
        Let&apos;s get you back on track.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex h-11 items-center rounded-lg bg-gold px-6 text-sm font-bold text-bg-primary transition-colors hover:bg-gold/90 active:scale-[0.98]"
        >
          Go Home
        </Link>
        <Link
          href="/shop"
          className="inline-flex h-11 items-center rounded-lg border border-gold px-6 text-sm font-bold text-gold transition-colors hover:bg-gold hover:text-bg-primary active:scale-[0.98]"
        >
          Browse Shop
        </Link>
      </div>
    </div>
  );
}
