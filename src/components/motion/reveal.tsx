'use client';

import { m, useReducedMotion, type Variants } from 'motion/react';
import { fadeRise } from '@/lib/motion';

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Variant to animate with (default: fadeRise). */
  variant?: Variants;
  /** Extra delay (s) before this element animates in. */
  delay?: number;
}

/**
 * Reveals its children with a scroll-triggered fade-rise, once. Honours
 * prefers-reduced-motion by rendering the final state immediately.
 */
export function Reveal({ children, className, variant = fadeRise, delay = 0 }: RevealProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  const visible = variant.visible as { transition?: object };
  const withDelay: Variants = {
    ...variant,
    visible: { ...variant.visible, transition: { ...visible?.transition, delay } },
  };

  return (
    <m.div
      className={className}
      variants={withDelay}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-10% 0px' }}
    >
      {children}
    </m.div>
  );
}
