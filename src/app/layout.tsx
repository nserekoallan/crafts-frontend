import type { Metadata } from 'next';
import { QueryProvider } from '@/providers/query-provider';
import { AuthProvider } from '@/lib/auth';
import { CurrencyProvider } from '@/lib/currency';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { BottomNav } from '@/components/layout/bottom-nav';
import './globals.css';

export const metadata: Metadata = {
  title: 'Crafts Continent | Authentic African Artisan Marketplace',
  description:
    'Discover and purchase authentic handcrafted African art, textiles, jewelry, and home decor directly from skilled artisans across the continent.',
};

/**
 * Root layout wrapping all pages with providers, header, footer and mobile bottom nav.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex min-h-screen flex-col">
        <QueryProvider>
          <AuthProvider>
            <CurrencyProvider>
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
              <BottomNav />
            </CurrencyProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
