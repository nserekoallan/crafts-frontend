'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

/**
 * Newsletter signup form — used inside the storefront footer.
 */
export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    setErrorMsg('');

    try {
      await api.post('/newsletter/subscribe', { email: email.trim() });
      setStatus('success');
    } catch {
      setStatus('error');
      setErrorMsg('Something went wrong. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <p className="text-sm font-semibold text-gold">
        You&apos;re subscribed! ✓
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-2">
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="h-10 flex-1 rounded-lg border border-border-dark bg-bg-surface px-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="h-10 rounded-lg bg-gold px-4 text-sm font-semibold text-bg-primary transition-colors hover:bg-gold-light disabled:opacity-60"
        >
          {status === 'loading' ? (
            <span className="flex items-center gap-1.5">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-bg-primary/40 border-t-bg-primary" />
              <span>Subscribing</span>
            </span>
          ) : (
            'Subscribe'
          )}
        </button>
      </div>
      {status === 'error' && (
        <p className="text-xs text-red-400">{errorMsg}</p>
      )}
    </form>
  );
}
