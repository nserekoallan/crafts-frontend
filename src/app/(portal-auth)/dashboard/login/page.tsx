'use client';

import { useState } from 'react';
import { apiErrorMessage } from '@/lib/api-error-message';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Eye, EyeOff } from 'lucide-react';

export default function ArtisanLoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login({ identifier, password });
      if (user.role !== 'artisan') {
        // Signed in successfully, wrong door. Say which door is theirs rather
        // than leaving them to guess — a QC inspector or admin landing here
        // otherwise sees a dead end with valid credentials.
        setError(
          user.role === 'customer'
            ? 'That account is a shopper account. Sign in at craftcontinent.com instead.'
            : 'That account is not an artisan account. Use the admin portal at admin.craftcontinent.com.',
        );
        return;
      }
      router.replace('/dashboard');
    } catch (err) {
      setError(apiErrorMessage(err, 'Invalid phone or email, or password. Please try again.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center px-6 py-16"
      style={{ background: '#1C1917' }}
    >
      {/* Dot grid texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(212,168,83,0.12) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Warm vignette edges */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(12,10,9,0.7) 100%)
          `,
        }}
      />

      <div className="relative w-full max-w-[440px]">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <Image
            src="/logo.jpg"
            alt="Crafts Continent"
            width={48}
            height={48}
            className="rounded-xl object-cover"
            style={{ boxShadow: '0 0 0 1px rgba(212,168,83,0.3)' }}
          />

          {/* Decorative diamond row */}
          <div className="flex items-center gap-2" aria-hidden>
            <div className="h-px w-12" style={{ background: 'rgba(212,168,83,0.25)' }} />
            <div
              className="h-1.5 w-1.5 rotate-45"
              style={{ background: '#D4A853', opacity: 0.6 }}
            />
            <div className="h-px w-12" style={{ background: 'rgba(212,168,83,0.25)' }} />
          </div>
        </div>

        {/* Headline */}
        <h1
          className="mb-2 text-center"
          style={{
            fontFamily: "'Piazzolla', serif",
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 700,
            lineHeight: 1.1,
            color: '#F5F5F0',
            letterSpacing: '-0.01em',
          }}
        >
          Your craft.<br />Your business.
        </h1>

        <p
          className="mb-10 text-center"
          style={{
            fontFamily: "'Hanken Grotesk', sans-serif",
            fontSize: '0.9375rem',
            color: 'rgba(255,255,255,0.38)',
            lineHeight: 1.6,
          }}
        >
          Sign in to manage your products, orders, and earnings.
        </p>

        {/* Form card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(212,168,83,0.18)',
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Phone / identifier */}
            <div>
              <label
                htmlFor="phone"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wider"
                style={{ color: 'rgba(255,255,255,0.38)', fontFamily: "'Hanken Grotesk', sans-serif" }}
              >
                Phone or email
              </label>
              <input
                id="phone"
                type="text"
                inputMode="text"
                autoComplete="username"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="0700 000 000 or you@example.com"
                className="w-full rounded-xl px-4 py-3.5 text-sm outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#F5F5F0',
                  fontFamily: "'Hanken Grotesk', sans-serif",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(212,168,83,0.5)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wider"
                style={{ color: 'rgba(255,255,255,0.38)', fontFamily: "'Hanken Grotesk', sans-serif" }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl px-4 py-3.5 pr-11 text-sm outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#F5F5F0',
                    fontFamily: "'Hanken Grotesk', sans-serif",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(212,168,83,0.5)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 transition-opacity hover:opacity-70"
                  style={{ color: 'rgba(255,255,255,0.3)' }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p
                className="rounded-xl px-4 py-3 text-sm"
                style={{
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  color: '#EF4444',
                  fontFamily: "'Hanken Grotesk', sans-serif",
                }}
              >
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl px-4 py-4 text-sm font-semibold tracking-wide transition-all disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #D4A853 0%, #C49840 100%)',
                color: '#1C1917',
                fontFamily: "'Hanken Grotesk', sans-serif",
                letterSpacing: '0.04em',
                boxShadow: '0 4px 24px rgba(212,168,83,0.25)',
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.boxShadow = '0 4px 32px rgba(212,168,83,0.4)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 24px rgba(212,168,83,0.25)'; }}
            >
              {loading ? 'Signing in…' : 'Sign in to your studio'}
            </button>
          </form>
        </div>
      </div>

      {/* Bottom copyright */}
      <p
        className="absolute bottom-6 text-xs"
        style={{
          color: 'rgba(255,255,255,0.18)',
          fontFamily: "'Hanken Grotesk', sans-serif",
        }}
      >
        &copy; {new Date().getFullYear()} Crafts Continent
      </p>
    </div>
  );
}
