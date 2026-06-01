'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AnimatePresence, m, useReducedMotion } from 'motion/react';
import { easeOutExpo } from '@/lib/motion';

interface Flight {
  id: number;
  img: string;
  from: { x: number; y: number; size: number };
  to: { x: number; y: number };
}

interface FlyToCartValue {
  /** Animate a clone of `img` from `origin`'s position into the cart icon. */
  flyToCart: (origin: HTMLElement | null, img: string) => void;
  /** Ref callback the cart icon registers as the flight destination. */
  registerCart: (el: HTMLElement | null) => void;
}

const Ctx = createContext<FlyToCartValue | null>(null);

export function useFlyToCart(): FlyToCartValue {
  return useContext(Ctx) ?? { flyToCart: () => {}, registerCart: () => {} };
}

export function FlyToCartProvider({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  const cartRef = useRef<HTMLElement | null>(null);
  const idRef = useRef(0);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const registerCart = useCallback((el: HTMLElement | null) => {
    cartRef.current = el;
  }, []);

  const flyToCart = useCallback(
    (origin: HTMLElement | null, img: string) => {
      if (reduced || !origin || !cartRef.current || !img) return;
      const o = origin.getBoundingClientRect();
      const c = cartRef.current.getBoundingClientRect();
      const size = Math.min(o.width, o.height, 140);
      const from = {
        x: o.left + o.width / 2 - size / 2,
        y: o.top + o.height / 2 - size / 2,
        size,
      };
      const to = { x: c.left + c.width / 2 - size / 2, y: c.top + c.height / 2 - size / 2 };
      setFlights((f) => [...f, { id: ++idRef.current, img, from, to }]);
    },
    [reduced],
  );

  const remove = (id: number) => setFlights((f) => f.filter((x) => x.id !== id));

  return (
    <Ctx.Provider value={{ flyToCart, registerCart }}>
      {children}
      {mounted && (
        <div className="pointer-events-none fixed inset-0 z-[200]">
          <AnimatePresence>
            {flights.map((f) => {
              const dx = f.to.x - f.from.x;
              const dy = f.to.y - f.from.y;
              const arc = Math.min(180, Math.abs(dx) * 0.3 + 90);
              return (
                <m.img
                  key={f.id}
                  src={f.img}
                  alt=""
                  className="absolute rounded-xl object-cover shadow-2xl ring-1 ring-gold/40"
                  style={{ left: f.from.x, top: f.from.y, width: f.from.size, height: f.from.size }}
                  initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                  animate={{ x: dx, y: [0, -arc, dy], scale: 0.22, opacity: [1, 1, 0.15] }}
                  transition={{
                    duration: 0.8,
                    ease: easeOutExpo,
                    y: { duration: 0.8, times: [0, 0.35, 1], ease: easeOutExpo },
                    opacity: { duration: 0.8, times: [0, 0.7, 1] },
                  }}
                  onAnimationComplete={() => remove(f.id)}
                />
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </Ctx.Provider>
  );
}
