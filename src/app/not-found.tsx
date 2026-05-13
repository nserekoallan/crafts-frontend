import Image from 'next/image';
import Link from 'next/link';

/**
 * Root 404 — rendered inside the root layout when no route matches.
 * Server component — no 'use client'.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg-primary px-4 text-center">
      <Image
        src="/logo.jpg"
        alt="Crafts Continent"
        width={96}
        height={96}
        className="h-20 w-20 rounded-2xl object-cover"
      />

      <p className="mt-8 text-8xl font-bold text-gold/20 select-none leading-none">404</p>

      <h1 className="mt-4 text-2xl font-bold text-text-primary md:text-3xl">
        Page Not Found
      </h1>
      <p className="mt-2 max-w-sm text-sm text-text-secondary">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex h-10 items-center rounded-lg bg-gold px-6 text-sm font-bold text-bg-primary transition-colors hover:bg-gold/90"
        >
          Go Home
        </Link>
        <Link
          href="/shop"
          className="inline-flex h-10 items-center rounded-lg border border-gold px-6 text-sm font-bold text-gold transition-colors hover:bg-gold hover:text-bg-primary"
        >
          Browse Shop
        </Link>
      </div>
    </div>
  );
}
