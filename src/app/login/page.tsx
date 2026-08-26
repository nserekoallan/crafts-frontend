'use client';

import { useState, type FormEvent } from 'react';
import { apiErrorMessage } from '@/lib/api-error-message';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth';

function redirectPathForRole(role: string): string {
  if (role === 'artisan') return '/dashboard';
  if (role === 'admin' || role === 'super_admin') return '/admin';
  return '/';
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const loggedInUser = await login({ identifier, password });
      router.push(redirectPathForRole(loggedInUser.role));
    } catch (err) {
      setError(apiErrorMessage(err, 'Invalid phone/email or password. Please try again.'));
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
        <h1 className="mt-4 text-center text-2xl font-bold text-text-primary">Welcome back</h1>
        <p className="mt-1 text-center text-sm text-text-secondary">Sign in to keep shopping.</p>

        {error && (
          <div className="mt-4 rounded-lg bg-red-900/20 px-4 py-3 text-sm text-red-400" role="alert">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input
            label="Phone or email"
            type="text"
            name="identifier"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="0700 000 000 or you@example.com"
            required
          />
          <div>
            <Input
              label="Password"
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
            <div className="mt-1.5 flex justify-end">
              <Link href="/forgot-password" className="text-xs text-text-tertiary hover:text-gold transition-colors">
                Forgot password?
              </Link>
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={loading}>
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-text-secondary">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-medium text-gold hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
