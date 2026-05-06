'use client';

import { useCurrency, type CurrencyCode } from '@/lib/currency';
import { cn } from '@/lib/utils';

const OPTIONS: CurrencyCode[] = ['UGX', 'USD'];

/**
 * Compact pill toggle for switching between UGX and USD.
 * Tooltip surfaces the live FX rate so customers know it's not made up.
 */
export function CurrencyToggle() {
  const { currency, setCurrency, usdToUgx, rateUpdatedAt } = useCurrency();

  const formattedRate = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(
    Math.round(usdToUgx),
  );
  const updatedLabel = rateUpdatedAt
    ? new Date(rateUpdatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;
  const tooltip = updatedLabel
    ? `1 USD ≈ ${formattedRate} UGX · updated ${updatedLabel}`
    : `1 USD ≈ ${formattedRate} UGX`;

  return (
    <div
      className="flex h-8 items-center rounded-full border border-border-dark bg-bg-surface p-0.5"
      title={tooltip}
    >
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
