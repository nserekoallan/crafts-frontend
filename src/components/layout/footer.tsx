import Image from 'next/image';
import Link from 'next/link';
import { Gem, HandHelping, Instagram, Music, ShieldCheck, Truck, Twitter } from 'lucide-react';

const FOOTER_LINKS = [
  { href: '/shop', label: 'Shop' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
] as const;

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
    icon: Music,
  },
] as const;

const TRUST_ITEMS = [
  { icon: Gem, label: '100% Handmade' },
  { icon: HandHelping, label: 'Fair Trade' },
  { icon: Truck, label: 'Free Shipping 300K+' },
  { icon: ShieldCheck, label: 'Secure Mobile Money' },
] as const;

/**
 * Dark-themed site-wide footer with trust bar, social links, and gold accents.
 */
export function Footer() {
  return (
    <footer className="border-t border-border-dark bg-bg-elevated pb-16 md:pb-0">
      {/* Trust bar */}
      <div className="border-b border-border-dark">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-8 md:grid-cols-4 lg:px-8">
          {TRUST_ITEMS.map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-2 text-center">
              <Icon className="h-6 w-6 text-gold" />
              <span className="text-xs font-medium text-text-secondary">{label}</span>
            </div>
          ))}
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
              {SOCIAL_LINKS.map(({ href, label, icon: Icon }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="p-2 text-text-secondary transition-colors hover:text-gold"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
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
