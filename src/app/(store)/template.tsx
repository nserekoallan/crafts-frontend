'use client';

import { m, useReducedMotion } from 'motion/react';
import { easeOutExpo } from '@/lib/motion';

/**
 * Route enter-transition: each storefront navigation fades and rises into place
 * for visual continuity. (App Router unmounts the old route first, so this is
 * enter-only — reliable, no exit-animation hacks.)
 */
export default function StoreTemplate({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();

  if (reduced) return <>{children}</>;

  return (
    <m.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: easeOutExpo }}
    >
      {children}
    </m.div>
  );
}
