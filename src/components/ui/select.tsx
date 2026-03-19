import { forwardRef, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

/**
 * Styled select dropdown component with label and error display.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className, children, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={props.id} className="mb-1.5 block text-sm font-medium text-charcoal">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={cn(
              'h-11 w-full appearance-none rounded-lg border bg-white px-4 pr-10 text-sm text-charcoal transition-colors',
              'focus:border-hunter-green focus:outline-none focus:ring-2 focus:ring-hunter-green/20',
              error ? 'border-red-500' : 'border-light-gray',
              props.disabled && 'cursor-not-allowed opacity-50',
              className,
            )}
            {...props}
          >
            {children}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-medium-gray" />
        </div>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  },
);

Select.displayName = 'Select';
