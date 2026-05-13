'use client';

import Link from 'next/link';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Root error boundary — catches unhandled errors in the root layout's children.
 */
export default function RootError({ error, reset }: Props) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg-primary px-4 text-center">
      <h1 className="text-2xl font-bold text-text-primary md:text-3xl">
        Something went wrong
      </h1>

      {process.env.NODE_ENV === 'development' && error.message && (
        <p className="mt-3 max-w-md rounded-lg bg-white/5 px-4 py-2 font-mono text-xs text-red-400">
          {error.message}
        </p>
      )}

      {error.digest && (
        <p className="mt-2 text-xs text-text-secondary">Error ID: {error.digest}</p>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={reset}
          className="inline-flex h-10 items-center rounded-lg bg-gold px-6 text-sm font-bold text-bg-primary transition-colors hover:bg-gold/90"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex h-10 items-center rounded-lg border border-gold px-6 text-sm font-bold text-gold transition-colors hover:bg-gold hover:text-bg-primary"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
