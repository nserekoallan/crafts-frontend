import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
  {
    variants: {
      variant: {
        default:    'bg-white/8 text-text-secondary border border-white/10',
        pending:    'bg-amber-500/15 text-amber-400 border border-amber-500/20',
        processing: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
        shipped:    'bg-violet-500/15 text-violet-400 border border-violet-500/20',
        delivered:  'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
        cancelled:  'bg-red-500/15 text-red-400 border border-red-500/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

interface BadgeProps extends VariantProps<typeof badgeVariants> {
  className?: string;
  children: React.ReactNode;
}

/**
 * Status badge with colour-coded variants for order lifecycle states.
 */
export function Badge({ className, variant, children }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))}>{children}</span>;
}
