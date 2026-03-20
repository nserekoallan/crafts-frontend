'use client';

import { useCallback, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { ANNOUNCEMENT_MESSAGES } from '@/lib/mock-data';

/**
 * Top-of-page announcement bar with rotating messages.
 * Gold shimmer gradient on dark background.
 */
export function AnnouncementBar() {
  const [visible, setVisible] = useState(true);
  const [index, setIndex] = useState(0);

  const rotate = useCallback(() => {
    setIndex((prev) => (prev + 1) % ANNOUNCEMENT_MESSAGES.length);
  }, []);

  useEffect(() => {
    const id = setInterval(rotate, 4000);
    return () => clearInterval(id);
  }, [rotate]);

  if (!visible) return null;

  return (
    <div className="gold-shimmer relative flex h-8 items-center justify-center border-b border-border-dark">
      <p className="text-xs font-medium tracking-wide text-gold">
        {ANNOUNCEMENT_MESSAGES[index]}
      </p>
      <button
        onClick={() => setVisible(false)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary transition-colors hover:text-text-primary"
        aria-label="Close announcement"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
