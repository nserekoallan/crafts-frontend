'use client';

import { useMotionValue, useSpring, useReducedMotion, type MotionStyle } from 'motion/react';

/**
 * Pointer-driven 3D tilt for cards. Returns pointer handlers + a motion style
 * (spring rotateX/rotateY). No-op on touch and under reduced motion.
 */
export function useTilt(maxDeg = 7) {
  const reduced = useReducedMotion();
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const config = { stiffness: 220, damping: 18, mass: 0.4 };
  const springX = useSpring(rotateX, config);
  const springY = useSpring(rotateY, config);

  function onPointerMove(e: React.PointerEvent<HTMLElement>) {
    if (reduced || e.pointerType === 'touch') return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    rotateY.set(px * maxDeg * 2);
    rotateX.set(-py * maxDeg * 2);
  }

  function onPointerLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  const style: MotionStyle = reduced
    ? {}
    : { rotateX: springX, rotateY: springY, transformPerspective: 900 };

  return { onPointerMove, onPointerLeave, style };
}
