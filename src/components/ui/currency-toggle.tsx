'use client';

import { useCurrency, type CurrencyCode } from '@/lib/currency';
import { cn } from '@/lib/utils';

const OPTIONS: CurrencyCode[] = ['UGX', 'USD'];

/**
 * Compact pill toggle for switching between UGX and USD.
 * Gold active indicator on dark background.
 */
export function CurrencyToggle() {
  const { currency, setCurrency } = useCurrency();

  return (
    <div className="flex h-8 items-center rounded-full border border-border-dark bg-bg-surface p-0.5">
      {OPTIONS.map((code) => (
        <button
          key={code}
          onClick={() => setCurrency(code)}
          className={cn(
            'relative z-10 rounded-full px-3 py-1 text-xs font-semibold transition-colors',
            currency === code
              ? 'bg-gold text-bg-primary'
              : 'text-text-secondary hover:text-text-primary',
          )}
          aria-label={`Switch to ${code}`}
        >
          {code}
        </button>
      ))}
    </div>
  );
}
