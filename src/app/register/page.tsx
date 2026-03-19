'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';

type Role = 'customer' | 'artisan';

/**
 * Registration page with name, email, password and role selector.
 */
export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('customer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({ firstName, lastName, email, password, role });
      router.push('/');
    } catch {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-xl border border-light-gray bg-white p-8 shadow-sm">
        <h1 className="text-center text-2xl font-bold">Create Account</h1>
        <p className="mt-1 text-center text-sm text-medium-gray">Join Crafts Continent today</p>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Role selector */}
          <div>
            <label className="block text-sm font-medium text-charcoal">I am a</label>
            <div className="mt-1.5 grid grid-cols-2 gap-3">
              {(['customer', 'artisan'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={cn(
                    'rounded-lg border-2 px-4 py-2.5 text-sm font-medium capitalize transition-colors',
                    role === r ? 'border-hunter-green bg-hunter-green/5 text-hunter-green' : 'border-light-gray text-charcoal hover:border-medium-gray',
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="First Name" name="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            <Input label="Last Name" name="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </div>
          <Input label="Email" type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          <Input label="Password" type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters" required minLength={8} />

          <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={loading}>
            Create Account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-medium-gray">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-hunter-green hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
