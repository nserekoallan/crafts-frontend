'use client';

import { useState, type FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { api, ApiError } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: email.trim() });
      setSubmitted(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.body.error?.message ?? 'Something went wrong. Please try again.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-xl border border-border-dark bg-bg-surface p-8 shadow-sm">
        <Image
          src="/logo.jpg"
          alt="Crafts Continent"
          width={64}
          height={64}
          className="mx-auto h-16 w-16 rounded-xl object-cover"
        />

        {submitted ? (
          <div className="mt-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
              <CheckCircle className="h-6 w-6 text-emerald-400" />
            </div>
            <h1 className="mt-4 text-xl font-bold text-text-primary">Check your email</h1>
            <p className="mt-2 text-sm text-text-secondary">
              If an account with{' '}
              <span className="font-medium text-text-primary">{email}</span> exists,
              we&apos;ve sent a password reset link. Check your inbox.
            </p>
            <p className="mt-1 text-xs text-text-tertiary">The link expires in 30 minutes.</p>
            <Link
              href="/login"
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-gold hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <h1 className="mt-4 text-center text-2xl font-bold text-text-primary">Forgot password?</h1>
            <p className="mt-1 text-center text-sm text-text-secondary">
              Enter your email and we&apos;ll send you a reset link.
            </p>
            <p className="mt-1 text-center text-xs text-text-tertiary">
              Phone-only account?{' '}
              <a href="mailto:support@craftcontinent.com" className="text-gold hover:underline">
                Contact support
              </a>
            </p>

            {error && (
              <div className="mt-4 rounded-lg bg-red-900/20 px-4 py-3 text-sm text-red-400" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="fp-email" className="block text-sm font-medium text-text-secondary">
                  Email address
                </label>
                <input
                  id="fp-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1 w-full rounded-lg border border-border-dark bg-bg-primary px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-gold/40"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-gold px-4 py-3 text-sm font-bold text-bg-primary transition-colors hover:bg-gold-light disabled:opacity-60"
              >
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1 text-sm font-medium text-text-secondary hover:text-text-primary"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
