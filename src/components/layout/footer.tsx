import Link from 'next/link';

const FOOTER_LINKS = [
  { href: '/shop', label: 'Shop' },
  { href: '/artisans', label: 'Artisans' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
] as const;

/**
 * Site-wide footer with brand, navigation links and copyright.
 */
export function Footer() {
  return (
    <footer className="border-t border-light-gray bg-charcoal text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
          {/* Brand */}
          <div>
            <p className="font-heading text-lg font-bold">
              CC <span className="text-satin-gold">Crafts Continent</span>
            </p>
            <p className="mt-1 text-sm text-medium-gray">Authentic African Artisan Marketplace</p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap justify-center gap-6">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-medium-gray transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6 text-center text-xs text-medium-gray">
          &copy; {new Date().getFullYear()} Crafts Continent. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
