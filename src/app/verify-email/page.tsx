'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { apiErrorMessage } from '@/lib/api-error-message';
import { useAuth } from '@/lib/auth';

type State = 'working' | 'done' | 'failed' | 'needs-login';

function VerifyEmailInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const { isAuthenticated, isLoading, refreshUser } = useAuth();

  const [state, setState] = useState<State>('working');
  const [error, setError] = useState('');

  // The endpoint requires a session, so a double-submit would just 400 the
  // second time. Guard so React strict-mode's double effect does not surface
  // that as an error to the user.
  const submitted = useRef(false);

  const verify = useCallback(async () => {
    try {
      await api.post('/auth/verify-email', { token });
      await refreshUser();
      setState('done');
    } catch (err) {
      setError(apiErrorMessage(err, 'That confirmation link is invalid or has expired.'));
      setState('failed');
    }
  }, [token, refreshUser]);

  useEffect(() => {
    if (!token || isLoading || submitted.current) return;

    // Confirmation is deliberately session-gated: it proves *this account* owns
    // the address. Someone who was forwarded the link cannot use it.
    if (!isAuthenticated) {
      setState('needs-login');
      return;
    }

    submitted.current = true;
    void verify();
  }, [token, isAuthenticated, isLoading, verify]);

  if (!token) {
    return (
      <div className="mt-8 text-center">
        <p className="text-sm text-text-secondary">That confirmation link is incomplete.</p>
        <Link href="/account" className="mt-4 inline-block text-sm font-medium text-gold hover:underline">
          Go to your account →
        </Link>
      </div>
    );
  }

  if (state === 'needs-login') {
    return (
      <div className="mt-8 text-center">
        <h1 className="text-lg font-medium text-text-primary">Sign in to confirm</h1>
        <p className="mt-2 text-sm text-text-secondary">
          For your security, confirming an email address requires being signed in to the account
          it belongs to.
        </p>
        <p className="mt-2 text-sm text-text-secondary">
          Sign in, then open this link from your email again.
        </p>
        <button
          onClick={() => router.push('/login')}
          className="mt-6 w-full rounded-lg bg-gold px-4 py-3 text-sm font-medium text-bg-primary hover:bg-gold/90"
        >
          Sign in
        </button>
      </div>
    );
  }

  if (state === 'done') {
    return (
      <div className="mt-8 text-center">
        <CheckCircle className="mx-auto h-10 w-10 text-hunter-green-light" />
        <h1 className="mt-4 text-lg font-medium text-text-primary">Email confirmed</h1>
        <p className="mt-2 text-sm text-text-secondary">
          You can now sign in with it, and we&apos;ll send order updates there.
        </p>
        <Link href="/account" className="mt-6 inline-block text-sm font-medium text-gold hover:underline">
          Go to your account →
        </Link>
      </div>
    );
  }

  if (state === 'failed') {
    return (
      <div className="mt-8 text-center">
        <XCircle className="mx-auto h-10 w-10 text-red-400" />
        <h1 className="mt-4 text-lg font-medium text-text-primary">Could not confirm</h1>
        <p className="mt-2 text-sm text-text-secondary">{error}</p>
        <Link href="/account" className="mt-6 inline-block text-sm font-medium text-gold hover:underline">
          Request a new link →
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 flex justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-gold border-t-transparent" />
    </div>
  );
}

export default function VerifyEmailPage() {
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
          <VerifyEmailInner />
        </Suspense>
      </div>
    </div>
  );
}
