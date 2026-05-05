'use client';

import { useState, type FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({ firstName, lastName, phone, password });
      router.push('/');
    } catch {
      setError('Registration failed. Please check your details and try again.');
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
        <h1 className="mt-4 text-center text-2xl font-bold text-text-primary">Create Account</h1>
        <p className="mt-1 text-center text-sm text-text-secondary">Join Crafts Continent today</p>

        {error && (
          <div className="mt-4 rounded-lg bg-red-900/20 px-4 py-3 text-sm text-red-400" role="alert">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-text-primary" htmlFor="firstName">First Name</label>
              <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="mt-1.5" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary" htmlFor="lastName">Last Name</label>
              <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="mt-1.5" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary" htmlFor="phone">Phone Number</label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+256700111222"
              required
              className="mt-1.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary" htmlFor="password">Password</label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 chars, include A-Z, 0-9, symbol"
              required
              className="mt-1.5"
            />
          </div>

          <Button type="submit" disabled={loading} className="mt-2 w-full bg-hunter-green text-white hover:bg-hunter-green/90 disabled:opacity-50">
            {loading ? 'Creating account…' : 'Create Account'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-secondary">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-gold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
