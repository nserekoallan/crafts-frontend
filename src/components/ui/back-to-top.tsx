'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const SCROLL_THRESHOLD = 600;

/**
 * Floating back-to-top button. Appears after scrolling past threshold.
 * Positioned above the mobile bottom nav.
 */
export function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > SCROLL_THRESHOLD);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      className={cn(
        'fixed bottom-20 right-4 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-gold/40 bg-bg-elevated/90 text-gold shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-gold hover:text-bg-primary md:bottom-6 md:right-6',
        show
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-4 opacity-0',
      )}
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
