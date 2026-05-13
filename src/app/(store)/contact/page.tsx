'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Instagram, Twitter, Music, CheckCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useSiteContent, useSocialLinks } from '@/hooks/use-site-content';

const SOCIAL_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  twitter: Twitter,
  tiktok: Music,
};

const SOCIAL_LABEL_MAP: Record<string, string> = {
  instagram: 'Instagram',
  twitter: 'X (Twitter)',
  tiktok: 'TikTok',
};

const DEFAULT_CONTACT = {
  email: 'hello@craftcontinent.com',
  supportHours: 'Mon–Fri 9am–6pm EAT',
};

/**
 * Contact page with form and social links.
 */
export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: socialLinks } = useSocialLinks();
  const { data: contact } = useSiteContent('site.contact', DEFAULT_CONTACT);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.post('/contact', { name, email, message });
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:py-20 lg:px-8">
      {/* Hero */}
      <div className="text-center">
        <Image
          src="/logo.jpg"
          alt="Crafts Continent"
          width={64}
          height={64}
          className="mx-auto mb-5 h-16 w-16 rounded-xl object-cover"
        />
        <h1 className="font-heading text-3xl font-bold text-text-primary md:text-4xl">
          Get in Touch
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-base text-text-secondary">
          Have a question, feedback, or business enquiry? We&apos;d love to hear from you.
        </p>
      </div>

      <div className="mt-12 grid gap-10 md:grid-cols-[1fr_auto]">
        {/* Form */}
        <div className="rounded-2xl border border-border-dark bg-bg-surface p-6 md:p-8">
          {submitted ? (
            <div className="flex flex-col items-center py-12 text-center">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <h2 className="mt-4 font-heading text-xl font-bold text-text-primary">
                Message Sent!
              </h2>
              <p className="mt-2 text-sm text-text-secondary">
                We&apos;ll reply within 24 hours.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setName('');
                  setEmail('');
                  setMessage('');
                }}
                className="mt-6 rounded-lg border border-gold px-6 py-2 text-sm font-medium text-gold transition-colors hover:bg-gold hover:text-bg-primary"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="contact-name"
                  className="mb-1.5 block text-sm font-medium text-text-primary"
                >
                  Name <span className="text-terracotta">*</span>
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 w-full rounded-lg border border-border-dark bg-bg-primary px-4 text-sm text-text-primary placeholder:text-text-tertiary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-email"
                  className="mb-1.5 block text-sm font-medium text-text-primary"
                >
                  Email <span className="text-terracotta">*</span>
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 w-full rounded-lg border border-border-dark bg-bg-primary px-4 text-sm text-text-primary placeholder:text-text-tertiary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="mb-1.5 block text-sm font-medium text-text-primary"
                >
                  Message <span className="text-terracotta">*</span>
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-lg border border-border-dark bg-bg-primary px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                  placeholder="How can we help?"
                />
              </div>

              {error && (
                <p className="text-sm text-red-400">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting || !name.trim() || !email.trim() || !message.trim()}
                className={cn(
                  'flex h-11 w-full items-center justify-center gap-2 rounded-lg text-sm font-bold transition-colors active:scale-[0.98]',
                  'bg-gold text-bg-primary hover:bg-gold/90',
                  'disabled:cursor-not-allowed disabled:opacity-40',
                )}
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitting ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          )}
        </div>

        {/* Sidebar — social links + contact */}
        <div className="flex flex-col items-center gap-6 md:items-start md:pt-2">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-gold">
              Follow Us
            </h2>
            <div className="mt-3 flex items-center gap-3">
              {(Object.entries(socialLinks) as [string, string][]).map(([platform, href]) => {
                const Icon = SOCIAL_ICON_MAP[platform];
                if (!Icon || !href) return null;
                return (
                  <a
                    key={platform}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={SOCIAL_LABEL_MAP[platform] ?? platform}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-border-dark bg-bg-surface text-text-secondary transition-colors hover:border-gold hover:text-gold"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-gold">
              Email
            </h2>
            <a
              href={`mailto:${contact.email}`}
              className="mt-2 block text-sm text-text-secondary transition-colors hover:text-gold"
            >
              {contact.email}
            </a>
          </div>

          {contact.supportHours && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-gold">
                Support Hours
              </h2>
              <p className="mt-2 text-sm text-text-secondary">{contact.supportHours}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
