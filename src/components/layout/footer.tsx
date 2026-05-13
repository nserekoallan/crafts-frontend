'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Gem, HandHelping, Instagram, Music, ShieldCheck, Truck, Twitter } from 'lucide-react';
import { NewsletterForm } from './newsletter-form';
import { useSiteContent, useSocialLinks } from '@/hooks/use-site-content';

const FOOTER_LINKS = [
  { href: '/shop', label: 'Shop' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
] as const;

const DEFAULT_TRUST_ITEMS = [
  { id: 1, icon: 'gem', label: '100% Handmade' },
  { id: 2, icon: 'hand-helping', label: 'Fair Trade' },
  { id: 3, icon: 'truck', label: 'Free Shipping 300K+' },
  { id: 4, icon: 'shield-check', label: 'Secure Mobile Money' },
];

const DEFAULT_NEWSLETTER = {
  heading: 'Stay in the loop',
  subheading: 'Get new arrivals and artisan stories in your inbox.',
};

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  gem: Gem,
  'hand-helping': HandHelping,
  truck: Truck,
  'shield-check': ShieldCheck,
};

const SOCIAL_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  twitter: Twitter,
  tiktok: Music,
};

/**
 * Dark-themed site-wide footer with trust bar, social links, and gold accents.
 */
export function Footer() {
  const { data: trustItems } = useSiteContent('footer.trust', DEFAULT_TRUST_ITEMS);
  const { data: newsletter } = useSiteContent('footer.newsletter', DEFAULT_NEWSLETTER);
  const { data: socialLinks } = useSocialLinks();

  return (
    <footer className="border-t border-border-dark bg-bg-elevated pb-16 md:pb-0">
      {/* Trust bar */}
      <div className="border-b border-border-dark">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-8 md:grid-cols-4 lg:px-8">
          {trustItems.map(({ id, icon, label }) => {
            const Icon = ICON_MAP[icon] ?? Gem;
            return (
              <div key={id} className="flex flex-col items-center gap-2 text-center">
                <Icon className="h-6 w-6 text-gold" />
                <span className="text-xs font-medium text-text-secondary">{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Newsletter */}
      <div className="border-b border-border-dark">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-text-primary">{newsletter.heading}</p>
              <p className="mt-0.5 text-xs text-text-secondary">{newsletter.subheading}</p>
            </div>
            <NewsletterForm />
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start">
            <Image
              src="/logo.jpg"
              alt="Crafts Continent"
              width={56}
              height={56}
              className="h-14 w-14 rounded-lg object-cover"
            />
            <p className="mt-3 font-heading text-lg font-bold uppercase tracking-[0.15em] text-gold">
              Crafts Continent
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              Authentic African Artisan Marketplace
            </p>
          </div>

          {/* Nav + Social */}
          <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
            <nav className="flex flex-wrap justify-center gap-6">
              {FOOTER_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-text-secondary transition-colors hover:text-gold"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Social icons */}
            <div className="flex items-center gap-3">
              {(Object.entries(socialLinks) as [string, string][]).map(([platform, href]) => {
                const Icon = SOCIAL_ICON_MAP[platform];
                if (!Icon || !href) return null;
                return (
                  <a
                    key={platform}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={platform}
                    className="p-2 text-text-secondary transition-colors hover:text-gold"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border-dark pt-6 text-center text-xs text-text-tertiary">
          &copy; {new Date().getFullYear()} Crafts Continent. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
