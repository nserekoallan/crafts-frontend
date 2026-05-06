'use client';

import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Modal dialog with backdrop, close button, scroll-locked body, and a
 * scrollable inner panel so long forms remain fully reachable on small
 * screens. Centers on tablet/desktop, pins to the bottom on mobile.
 */
export function Dialog({ open, onClose, title, children, className }: DialogProps) {
  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      {/* Dialog panel — flex-col + max-h so the inner body scrolls */}
      <div
        className={cn(
          'relative z-10 flex w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-bg-elevated shadow-xl border border-border-dark',
          'max-h-[92dvh] sm:max-h-[calc(100dvh-2rem)] sm:rounded-2xl',
          className,
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'dialog-title' : undefined}
      >
        {/* Close button — pinned, stays visible while body scrolls */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-lg p-1.5 text-text-tertiary transition-colors hover:bg-white/[0.06] hover:text-text-primary sm:right-4 sm:top-4"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Scrollable body */}
        <div className="overflow-y-auto overscroll-contain p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:p-6">
          {title && (
            <h2 id="dialog-title" className="pr-10 text-lg font-bold text-text-primary sm:text-xl">
              {title}
            </h2>
          )}
          <div className={cn(title && 'mt-4')}>{children}</div>
        </div>
      </div>
    </div>
  );
}
