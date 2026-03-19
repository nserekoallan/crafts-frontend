import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

/**
 * Styled textarea component with label and error display.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={props.id} className="mb-1.5 block text-sm font-medium text-charcoal">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            'min-h-[100px] w-full rounded-lg border bg-white px-4 py-3 text-sm text-charcoal transition-colors',
            'focus:border-hunter-green focus:outline-none focus:ring-2 focus:ring-hunter-green/20',
            'placeholder:text-medium-gray',
            error ? 'border-red-500' : 'border-light-gray',
            props.disabled && 'cursor-not-allowed opacity-50',
            className,
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
