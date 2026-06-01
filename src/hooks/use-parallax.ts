'use client';

import { useScroll, useTransform, useReducedMotion, type MotionValue } from 'motion/react';
import type { RefObject } from 'react';

/**
 * Scroll-linked vertical parallax. Attach `ref` to the section; apply the
 * returned MotionValue to a child's `style={{ y }}`. Flat under reduced motion.
 */
export function useParallax(ref: RefObject<HTMLElement | null>, distance = 60): MotionValue<number> {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  return useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [-distance, distance]);
}
