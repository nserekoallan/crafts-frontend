'use client';

import { useState } from 'react';
import { Instagram, Twitter, Send, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const SOCIAL_LINKS = [
  {
    href: 'https://www.instagram.com/craft_continent',
    label: 'Instagram',
    icon: Instagram,
  },
  {
    href: 'https://x.com/Craftcontinent',
    label: 'X (Twitter)',
    icon: Twitter,
  },
  {
    href: 'https://www.tiktok.com/@craft.continent',
    label: 'TikTok',
    icon: Send,
  },
] as const;

/**
 * Contact page with form and social links.
 */
export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:py-20 lg:px-8">
      {/* Hero */}
      <div className="text-center">
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
                Message Sent
              </h2>
              <p className="mt-2 text-sm text-text-secondary">
                Thank you for reaching out. We&apos;ll get back to you soon.
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

              <button
                type="submit"
                disabled={!name.trim() || !email.trim() || !message.trim()}
                className={cn(
                  'flex h-11 w-full items-center justify-center rounded-lg text-sm font-bold transition-colors active:scale-[0.98]',
                  'bg-gold text-bg-primary hover:bg-gold/90',
                  'disabled:cursor-not-allowed disabled:opacity-40',
                )}
              >
                Send Message
              </button>
            </form>
          )}
        </div>

        {/* Sidebar — social links */}
        <div className="flex flex-col items-center gap-6 md:items-start md:pt-2">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-gold">
              Follow Us
            </h2>
            <div className="mt-3 flex items-center gap-3">
              {SOCIAL_LINKS.map(({ href, label, icon: Icon }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-border-dark bg-bg-surface text-text-secondary transition-colors hover:border-gold hover:text-gold"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-gold">
              Email
            </h2>
            <a
              href="mailto:hello@craftscontinent.com"
              className="mt-2 block text-sm text-text-secondary transition-colors hover:text-gold"
            >
              hello@craftscontinent.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
