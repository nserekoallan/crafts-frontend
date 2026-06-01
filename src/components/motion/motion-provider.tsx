'use client';

import { LazyMotion, domMax } from 'motion/react';

/**
 * Loads the full DOM feature set (layout, layoutId, drag, scroll-linked) and
 * enables `m.*` components across the storefront. `strict` forbids the heavy
 * `motion.*` import so the lean `m.*` form is enforced.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domMax} strict>
      {children}
    </LazyMotion>
  );
}
