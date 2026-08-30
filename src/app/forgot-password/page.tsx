'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { apiErrorMessage } from '@/lib/api-error-message';
import { PasswordRequirements, isPasswordValid } from '@/components/ui/password-requirements';

/**
 * Password recovery.
 *
 * Two steps rather than an emailed link: customers and artisans have no email
 * address at all, so recovery has to run over SMS. Step one requests a code,
 * step two exchanges it for a new password.
 */
export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [identifier, setIdentifier] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function requestCode(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { identifier: identifier.trim() });
      setStep('verify');
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not send the code. Please try again.'));
    } finally {
      setLoading(false);
    }
  }

  async function submitNewPassword(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        identifier: identifier.trim(),
        code: code.trim(),
        newPassword: password,
      });
      router.replace('/login?reset=1');
    } catch (err) {
      setError(apiErrorMessage(err, 'That code is not valid or has expired.'));
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

        {step === 'request' ? (
          <>
            <h1 className="mt-4 text-center text-2xl font-bold text-text-primary">
              Forgot your password?
            </h1>
            <p className="mt-1 text-center text-sm text-text-secondary">
              Enter your phone number and we&apos;ll text you a code.
            </p>

            {error && (
              <div
                className="mt-4 rounded-lg bg-red-900/20 px-4 py-3 text-sm text-red-400"
                role="alert"
              >
                {error}
              </div>
            )}

            <form onSubmit={requestCode} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="fp-identifier"
                  className="block text-sm font-medium text-text-secondary"
                >
                  Phone number
                </label>
                <input
                  id="fp-identifier"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="0700 000 000"
                  className="mt-1.5 w-full rounded-lg border border-border-dark bg-bg-elevated px-4 py-3 text-sm text-text-primary placeholder-text-tertiary focus:border-gold focus:outline-none"
                />
                <p className="mt-1.5 text-xs text-text-tertiary">
                  Any format works — 0700…, +256…, or 256….
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-gold px-4 py-3 text-sm font-bold text-bg-primary transition-colors hover:bg-gold-light disabled:opacity-60"
              >
                {loading ? 'Sending…' : 'Send me a code'}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="mt-4 text-center text-2xl font-bold text-text-primary">
              Enter your code
            </h1>
            <p className="mt-1 text-center text-sm text-text-secondary">
              If that account exists, we&apos;ve sent a 6-digit code to{' '}
              <span className="font-medium text-text-primary">{identifier}</span>.
            </p>
            <p className="mt-1 text-center text-xs text-text-tertiary">
              It expires in 15 minutes.
            </p>

            {error && (
              <div
                className="mt-4 rounded-lg bg-red-900/20 px-4 py-3 text-sm text-red-400"
                role="alert"
              >
                {error}
              </div>
            )}

            <form onSubmit={submitNewPassword} className="mt-6 space-y-4">
              <div>
                <label htmlFor="fp-code" className="block text-sm font-medium text-text-secondary">
                  6-digit code
                </label>
                <input
                  id="fp-code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="mt-1.5 w-full rounded-lg border border-border-dark bg-bg-elevated px-4 py-3 text-center text-lg tracking-[0.5em] text-text-primary placeholder-text-tertiary focus:border-gold focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="fp-password" className="block text-sm font-medium text-text-secondary">
                  New password
                </label>
                <input
                  id="fp-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="mt-1.5 w-full rounded-lg border border-border-dark bg-bg-elevated px-4 py-3 text-sm text-text-primary placeholder-text-tertiary focus:border-gold focus:outline-none"
                />
                <PasswordRequirements value={password} show={password.length > 0} />
              </div>

              <button
                type="submit"
                disabled={loading || code.length !== 6 || !isPasswordValid(password)}
                className="w-full rounded-lg bg-gold px-4 py-3 text-sm font-bold text-bg-primary transition-colors hover:bg-gold-light disabled:opacity-60"
              >
                {loading ? 'Saving…' : 'Set new password'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('request');
                  setCode('');
                  setError('');
                }}
                className="w-full text-center text-xs text-text-tertiary hover:text-text-secondary"
              >
                Didn&apos;t get it? Send another code
              </button>
            </form>
          </>
        )}

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1 text-sm font-medium text-text-secondary hover:text-text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
