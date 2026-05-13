'use client';

import Link from 'next/link';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Artisan dashboard error boundary.
 */
export default function DashboardError({ error, reset }: Props) {
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
          className="inline-flex h-10 items-center rounded-lg bg-hunter-green px-6 text-sm font-bold text-white transition-colors hover:bg-hunter-green/90"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="inline-flex h-10 items-center rounded-lg border border-hunter-green px-6 text-sm font-bold text-hunter-green-light transition-colors hover:bg-hunter-green hover:text-white"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
