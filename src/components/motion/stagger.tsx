'use client';

import { m, useReducedMotion } from 'motion/react';
import { staggerItem } from '@/lib/motion';

interface StaggerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Layout wrapper for a grid/list of <StaggerItem>s. Kept as a plain element so
 * reveal timing is owned by each item (robust when items mount asynchronously,
 * e.g. after a data fetch — container orchestration would otherwise leave
 * late-mounted children stuck hidden).
 */
export function Stagger({ children, className }: StaggerProps) {
  return <div className={className}>{children}</div>;
}

/**
 * Reveals itself with a fade-rise the first time it scrolls into view. Each item
 * is independent, so it works whether it mounts before or after the container is
 * already on screen. Plain element under reduced motion.
 */
export function StaggerItem({ children, className }: StaggerProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <m.div
      className={className}
      variants={staggerItem}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '0px 0px -40px 0px' }}
    >
      {children}
    </m.div>
  );
}
