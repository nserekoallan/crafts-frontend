import type { Variants } from 'motion/react';

/**
 * Shared motion language for the storefront — refined, premium, buttery.
 * Exponential easing (natural deceleration), transform + opacity only, no bounce.
 */
export const easeOutExpo = [0.16, 1, 0.3, 1] as const;
export const easeOutQuint = [0.22, 1, 0.36, 1] as const;

export const duration = {
  fast: 0.25,
  base: 0.5,
  slow: 0.65,
} as const;

/** Fade up into place — the default scroll-reveal. */
export const fadeRise: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: duration.slow, ease: easeOutExpo } },
};

/** Gentle scale-in for media/cards. */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: duration.base, ease: easeOutExpo } },
};

/** Container that cascades its children in. */
export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};

/** Child item for a stagger container (grids, lists). */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: duration.base, ease: easeOutExpo } },
};

/** Hero text lines: stagger headline → subtitle → CTA. */
export const heroTextContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

export const heroTextItem: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: duration.slow, ease: easeOutExpo } },
};
