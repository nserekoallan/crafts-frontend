import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
}

/**
 * Dashboard stat card component with icon, value, label and optional change indicator.
 */
export function StatCard({ icon: Icon, label, value, change, changeType = 'neutral' }: StatCardProps) {
  return (
    <div className="rounded-xl border border-light-gray bg-white p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-2xl font-bold text-charcoal">{value}</p>
          <p className="mt-1 text-sm text-medium-gray">{label}</p>
          {change && (
            <p
              className={cn(
                'mt-2 text-xs font-medium',
                changeType === 'positive' && 'text-green-600',
                changeType === 'negative' && 'text-red-600',
                changeType === 'neutral' && 'text-medium-gray',
              )}
            >
              {change}
            </p>
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-hunter-green/10">
          <Icon className="h-5 w-5 text-hunter-green" />
        </div>
      </div>
    </div>
  );
}
