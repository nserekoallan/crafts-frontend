'use client';

import { useState, type FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth';

/**
 * Login page with email/password form.
 */
export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email, password });
      router.push('/');
    } catch {
      setError('Invalid email or password. Please try again.');
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
        <h1 className="mt-4 text-center text-2xl font-bold text-text-primary">Welcome Back</h1>
        <p className="mt-1 text-center text-sm text-text-secondary">Sign in to your Crafts Continent account</p>

        {error && (
          <div className="mt-4 rounded-lg bg-red-900/20 px-4 py-3 text-sm text-red-400" role="alert">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input label="Email" type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          <Input label="Password" type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required />

          <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={loading}>
            Sign In
          </Button>
        </form>

        <div className="mt-6 space-y-2 text-center text-sm">
          <Link href="/forgot-password" className="text-gold hover:underline">Forgot your password?</Link>
          <p className="text-text-secondary">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-medium text-gold hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
