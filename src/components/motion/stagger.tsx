'use client';

import { m, useReducedMotion } from 'motion/react';
import { staggerContainer, staggerItem } from '@/lib/motion';

interface StaggerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Grid/list container whose children cascade in on scroll-in (once).
 * Wrap each child in <StaggerItem>. Reduced-motion → plain container.
 */
export function Stagger({ children, className }: StaggerProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <m.div
      className={className}
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-8% 0px' }}
    >
      {children}
    </m.div>
  );
}

export function StaggerItem({ children, className }: StaggerProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <m.div className={className} variants={staggerItem}>
      {children}
    </m.div>
  );
}
