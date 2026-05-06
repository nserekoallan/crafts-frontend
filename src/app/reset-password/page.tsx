'use client';

import { Suspense, useState, type FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Eye, EyeOff } from 'lucide-react';
import { api, ApiError } from '@/lib/api';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div className="text-center">
        <p className="text-sm text-text-secondary">Invalid or missing reset link.</p>
        <Link
          href="/forgot-password"
          className="mt-4 inline-block text-sm font-medium text-gold hover:underline"
        >
          Request a new link →
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword: password });
      setDone(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.body.error?.message ?? 'Reset failed. The link may have expired.');
      } else {
        setError('Reset failed. The link may have expired.');
      }
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="mt-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
          <CheckCircle className="h-6 w-6 text-emerald-400" />
        </div>
        <h1 className="mt-4 text-xl font-bold text-text-primary">Password updated</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Your password has been reset. Redirecting to sign in…
        </p>
      </div>
    );
  }

  return (
    <>
      <h1 className="mt-4 text-center text-2xl font-bold text-text-primary">Set new password</h1>
      <p className="mt-1 text-center text-sm text-text-secondary">
        Choose a strong password for your account.
      </p>

      {error && (
        <div className="mt-4 rounded-lg bg-red-900/20 px-4 py-3 text-sm text-red-400" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="rp-password" className="block text-sm font-medium text-text-secondary">
            New password
          </label>
          <div className="relative mt-1">
            <input
              id="rp-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 chars"
              className="w-full rounded-lg border border-border-dark bg-bg-primary px-4 py-3 pr-11 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-gold/40"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="mt-1 text-xs text-text-tertiary">
            Must include uppercase, lowercase, a number, and a special character.
          </p>
        </div>

        <div>
          <label htmlFor="rp-confirm" className="block text-sm font-medium text-text-secondary">
            Confirm password
          </label>
          <input
            id="rp-confirm"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repeat your new password"
            className="mt-1 w-full rounded-lg border border-border-dark bg-bg-primary px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-gold/40"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-gold px-4 py-3 text-sm font-bold text-bg-primary transition-colors hover:bg-gold-light disabled:opacity-60"
        >
          {loading ? 'Updating…' : 'Reset password'}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
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
        <Suspense
          fallback={
            <div className="mt-8 flex justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-gold border-t-transparent" />
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
