'use client';

import Link from 'next/link';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Admin area error boundary.
 */
export default function AdminError({ error, reset }: Props) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-bold text-white md:text-3xl">
        Dashboard error
      </h1>

      {process.env.NODE_ENV === 'development' && error.message && (
        <p className="mt-3 max-w-md rounded-lg bg-white/5 px-4 py-2 font-mono text-xs text-red-400">
          {error.message}
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={reset}
          className="inline-flex h-10 items-center rounded-lg bg-satin-gold px-6 text-sm font-bold text-bg-primary transition-colors hover:bg-satin-gold/90"
        >
          Try again
        </button>
        <Link
          href="/admin"
          className="inline-flex h-10 items-center rounded-lg border border-satin-gold px-6 text-sm font-bold text-satin-gold transition-colors hover:bg-satin-gold hover:text-bg-primary"
        >
          Back to admin
        </Link>
      </div>
    </div>
  );
}
