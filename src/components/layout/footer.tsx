import Link from 'next/link';
import { Gem, HandHelping, ShieldCheck, Truck } from 'lucide-react';

const FOOTER_LINKS = [
  { href: '/shop', label: 'Shop' },
  { href: '/artisans', label: 'Artisans' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
] as const;

const TRUST_ITEMS = [
  { icon: Gem, label: '100% Handmade' },
  { icon: HandHelping, label: 'Fair Trade' },
  { icon: Truck, label: 'Free Shipping 300K+' },
  { icon: ShieldCheck, label: 'Secure Mobile Money' },
] as const;

/**
 * Dark-themed site-wide footer with trust bar and gold accents.
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
          <div>
            <p className="font-heading text-lg font-bold uppercase tracking-[0.15em] text-gold">
              Crafts Continent
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              Authentic African Artisan Marketplace
            </p>
          </div>

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
        </div>

        <div className="mt-8 border-t border-border-dark pt-6 text-center text-xs text-text-tertiary">
          &copy; {new Date().getFullYear()} Crafts Continent. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
