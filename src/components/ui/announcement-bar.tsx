'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { ANNOUNCEMENT_MESSAGES } from '@/lib/mock-data';
import type { AnnouncementMessage } from '@/lib/mock-data';

/**
 * Renders a single announcement message — plain text, internal link, or external link.
 */
function MessageContent({ message }: { message: AnnouncementMessage }) {
  const className = 'text-xs font-medium tracking-wide text-gold';
  const underline = message.href ? 'underline underline-offset-2 decoration-gold/40' : '';

  if (message.external && message.href) {
    return (
      <a
        href={message.href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${className} ${underline}`}
      >
        {message.text}
      </a>
    );
  }

  if (message.href) {
    return (
      <Link href={message.href} className={`${className} ${underline}`}>
        {message.text}
      </Link>
    );
  }

  return <p className={className}>{message.text}</p>;
}

/**
 * Top-of-page announcement bar with rotating messages.
 * Gold shimmer gradient on dark background. Supports plain text and linked messages.
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
      <MessageContent message={ANNOUNCEMENT_MESSAGES[index]} />
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
