import { cn } from '@/lib/utils';

interface DiscountBadgeProps {
  originalPrice: number;
  currentPrice: number;
  className?: string;
}

/**
 * Red pill badge showing discount percentage.
 */
export function DiscountBadge({ originalPrice, currentPrice, className }: DiscountBadgeProps) {
  const pct = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  if (pct <= 0) return null;

  return (
    <span
      className={cn(
        'rounded-full bg-discount-bg px-2 py-0.5 text-[11px] font-bold text-error',
        className,
      )}
    >
      -{pct}%
    </span>
  );
}
