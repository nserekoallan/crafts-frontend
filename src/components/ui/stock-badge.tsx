import { cn } from '@/lib/utils';
import type { StockStatus } from '@/lib/mock-data';

interface StockBadgeProps {
  status: StockStatus;
  count?: number;
  className?: string;
}

/**
 * Stock status badge — shown on product cards and detail pages.
 */
export function StockBadge({ status, count, className }: StockBadgeProps) {
  if (status === 'in_stock') return null;

  if (status === 'out_of_stock') {
    return (
      <span className={cn('rounded-full bg-bg-surface/90 px-2.5 py-1 text-[11px] font-semibold text-text-secondary backdrop-blur-sm', className)}>
        Sold Out
      </span>
    );
  }

  return (
    <span className={cn('rounded-full bg-warning/20 px-2.5 py-1 text-[11px] font-semibold text-warning backdrop-blur-sm', className)}>
      Only {count} left
    </span>
  );
}
