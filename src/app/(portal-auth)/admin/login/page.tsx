'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Eye, EyeOff } from 'lucide-react';

export default function AdminLoginPage() {
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
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        setError('This portal is restricted to administrators.');
        return;
      }
      router.replace('/admin');
    } catch {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel — brand */}
      <div
        className="hidden lg:flex lg:w-5/12 flex-col relative overflow-hidden"
        style={{ background: '#0C0A09' }}
      >
        {/* Geometric grid pattern */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(to right, #D4A853 1px, transparent 1px),
              linear-gradient(to bottom, #D4A853 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
          }}
        />

        {/* Diagonal accent lines */}
        <div aria-hidden className="absolute inset-0 opacity-[0.025]" style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            #D4A853,
            #D4A853 1px,
            transparent 1px,
            transparent 60px
          )`,
        }} />

        <div className="relative flex flex-col justify-between h-full p-10">
          {/* Logo + wordmark */}
          <div className="flex items-center gap-3">
            <Image
              src="/logo.jpg"
              alt="Crafts Continent"
              width={36}
              height={36}
              className="rounded-lg object-cover opacity-90"
            />
            <span
              className="text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ color: 'rgba(255,255,255,0.5)', fontFamily: "'Hanken Grotesk', sans-serif" }}
            >
              Crafts Continent
            </span>
          </div>

          {/* Center content */}
          <div>
            <div
              className="mb-3 text-xs font-medium uppercase tracking-[0.3em]"
              style={{ color: '#D4A853', fontFamily: "'Hanken Grotesk', sans-serif" }}
            >
              Admin Console
            </div>

            <h1
              className="mb-6 leading-[1.05]"
              style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
                fontWeight: 800,
                color: '#F5F5F0',
                letterSpacing: '-0.02em',
              }}
            >
              Platform<br />Management
            </h1>

            {/* Gold rule */}
            <div className="mb-6 h-px w-16" style={{ background: '#D4A853' }} />

            <p
              className="max-w-xs leading-relaxed"
              style={{
                fontFamily: "'Hanken Grotesk', sans-serif",
                fontSize: '0.9375rem',
                color: 'rgba(255,255,255,0.38)',
              }}
            >
              Centralized oversight for Africa&apos;s premier
              artisan marketplace. Manage artisans, orders,
              quality control, and platform operations.
            </p>
          </div>

          {/* Bottom attribution */}
          <div
            className="text-xs"
            style={{
              fontFamily: "'Hanken Grotesk', sans-serif",
              color: 'rgba(255,255,255,0.2)',
            }}
          >
            Crafts Continent &copy; {new Date().getFullYear()}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div
        className="flex flex-1 flex-col items-center justify-center px-6 py-12"
        style={{ background: '#131110' }}
      >
        {/* Mobile logo (hidden on lg) */}
        <div className="mb-10 flex items-center gap-3 lg:hidden">
          <Image
            src="/logo.jpg"
            alt="Crafts Continent"
            width={32}
            height={32}
            className="rounded-lg object-cover"
          />
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: 'rgba(255,255,255,0.5)', fontFamily: "'Hanken Grotesk', sans-serif" }}
          >
            Admin Console
          </span>
        </div>

        <div className="w-full max-w-md">
          <h2
            className="mb-2"
            style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontSize: '1.875rem',
              fontWeight: 700,
              color: '#F5F5F0',
              letterSpacing: '-0.02em',
            }}
          >
            Welcome back
          </h2>
          <p
            className="mb-8"
            style={{
              fontFamily: "'Hanken Grotesk', sans-serif",
              fontSize: '0.9375rem',
              color: 'rgba(255,255,255,0.4)',
            }}
          >
            Sign in to your administrator account
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Identifier */}
            <div>
              <label
                htmlFor="identifier"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wider"
                style={{ color: 'rgba(255,255,255,0.4)', fontFamily: "'Hanken Grotesk', sans-serif" }}
              >
                Email
              </label>
              <input
                id="identifier"
                type="text"
                autoComplete="username"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="admin@craftcontinent.com"
                className="w-full rounded-lg px-4 py-3 text-sm outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#F5F5F0',
                  fontFamily: "'Hanken Grotesk', sans-serif",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(212,168,83,0.6)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wider"
                style={{ color: 'rgba(255,255,255,0.4)', fontFamily: "'Hanken Grotesk', sans-serif" }}
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
                  className="w-full rounded-lg px-4 py-3 pr-11 text-sm outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#F5F5F0',
                    fontFamily: "'Hanken Grotesk', sans-serif",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(212,168,83,0.6)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 transition-opacity hover:opacity-70"
                  style={{ color: 'rgba(255,255,255,0.35)' }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p
                className="rounded-lg px-4 py-3 text-sm"
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

            {/* Forgot password */}
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-xs transition-colors"
                style={{ color: 'rgba(255,255,255,0.3)', fontFamily: "'Hanken Grotesk', sans-serif" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(212,168,83,0.8)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-lg px-4 py-3.5 text-sm font-semibold tracking-wide transition-all disabled:opacity-50"
              style={{
                background: '#D4A853',
                color: '#0C0A09',
                fontFamily: "'Hanken Grotesk', sans-serif",
                letterSpacing: '0.03em',
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#E8C97A'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#D4A853'; }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {/* Footer note */}
          <p
            className="mt-8 text-center text-xs"
            style={{
              color: 'rgba(255,255,255,0.2)',
              fontFamily: "'Hanken Grotesk', sans-serif",
            }}
          >
            Authorized personnel only. Unauthorized access is prohibited.
          </p>
        </div>
      </div>
    </div>
  );
}
