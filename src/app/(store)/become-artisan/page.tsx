'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import { api, ApiError } from '@/lib/api';

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  craft: string;
  region: string;
  story: string;
  website: string; // honeypot
}

const EMPTY: FormState = {
  fullName: '',
  email: '',
  phone: '',
  craft: '',
  region: '',
  story: '',
  website: '',
};

const inputCls =
  'w-full rounded-lg border border-border-dark bg-bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20';

export default function BecomeArtisanPage() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  function update(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.post('/artisan-requests', form);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center lg:px-8">
        <CheckCircle2 className="mx-auto h-14 w-14 text-gold" />
        <h1 className="mt-4 font-heading text-2xl font-bold text-text-primary">Application received</h1>
        <p className="mt-3 text-text-secondary">
          Thank you, {form.fullName.split(' ')[0] || 'there'}. Our onboarding team will review your
          details and reach out to guide you through the next steps — verification, a short interview,
          and background checks — until you&apos;re fully onboarded.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-block rounded-lg bg-hunter-green px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Pitch */}
      <span className="text-xs font-semibold uppercase tracking-widest text-gold">Join us</span>
      <h1 className="mt-2 font-heading text-3xl font-bold text-text-primary md:text-4xl">
        Become an Artisan
      </h1>
      <p className="mt-3 text-text-secondary">
        Sell your handcrafted work to a continent-wide audience. Share your details below and our
        onboarding team will take it from there.
      </p>

      {/* Disclaimer */}
      <div className="mt-6 flex gap-3 rounded-xl border border-gold/30 bg-gold/5 p-4">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
        <p className="text-sm text-text-secondary">
          All applicants are subject to artisan vetting — identity and background checks, a short
          interview, and product quality review. Submitting this form is an application, not a
          guarantee of acceptance. Our onboarding team will follow up with you throughout the
          process until you are fully onboarded.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {/* Honeypot — hidden from users */}
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={(e) => update('website', e.target.value)}
          className="absolute left-[-9999px] h-0 w-0 opacity-0"
          aria-hidden="true"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">Full name *</label>
            <input required maxLength={120} value={form.fullName} onChange={(e) => update('fullName', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">Craft / specialty *</label>
            <input required maxLength={120} value={form.craft} onChange={(e) => update('craft', e.target.value)} placeholder="e.g. Woven baskets, beadwork" className={inputCls} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">Email *</label>
            <input required type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">Phone *</label>
            <input required maxLength={30} value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+256…" className={inputCls} />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">Region</label>
            <input maxLength={120} value={form.region} onChange={(e) => update('region', e.target.value)} placeholder="Where are you based?" className={inputCls} />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">Your story</label>
            <textarea rows={5} maxLength={4000} value={form.story} onChange={(e) => update('story', e.target.value)} placeholder="Tell us about your craft, experience, and what you make." className={inputCls} />
          </div>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="flex items-center justify-center gap-2 rounded-lg bg-gold px-6 py-3 text-sm font-semibold text-bg-primary transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Submit application
        </button>
      </form>
    </div>
  );
}
