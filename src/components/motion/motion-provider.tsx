'use client';

import { LazyMotion, domAnimation } from 'motion/react';

/**
 * Loads only the DOM animation feature set (~18kb) and enables `m.*` components
 * across the storefront. `strict` forbids the heavy `motion.*` import so the
 * lean bundle is enforced.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}
