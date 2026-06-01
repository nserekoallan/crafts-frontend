import type { Metadata } from 'next';
import { ViewTransitions } from 'next-view-transitions';
import { QueryProvider } from '@/providers/query-provider';
import { AuthProvider } from '@/lib/auth';
import { CurrencyProvider } from '@/lib/currency';
import { CartProvider } from '@/lib/cart';
import { WishlistProvider } from '@/lib/wishlist';
import { RecentlyViewedProvider } from '@/lib/recently-viewed';
import { ErrorBoundary } from '@/components/error-boundary';
import './globals.css';

export const metadata: Metadata = {
  title: 'Crafts Continent | Authentic African Artisan Marketplace',
  description:
    'Discover and purchase authentic handcrafted African art, textiles, jewelry, and home decor directly from skilled artisans across the continent.',
  icons: { icon: '/logo.jpg' },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Crafts Continent',
  },
  openGraph: {
    title: 'Crafts Continent | Authentic African Artisan Marketplace',
    description:
      'Discover and purchase authentic handcrafted African art, textiles, jewelry, and home decor directly from skilled artisans across the continent.',
    images: ['/logo.jpg'],
  },
};

/**
 * Root layout — provides all React context providers.
 * Store chrome (header, footer, nav) lives in (store)/layout.tsx.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransitions>
    <html lang="en">
      <head>
        <meta name="theme-color" content="#c9a84c" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Bricolage+Grotesque:wght@400;500;600;700;800&family=Piazzolla:ital,wght@0,400;0,500;0,700;1,400;1,700&family=Hanken+Grotesk:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex min-h-screen flex-col">
        <QueryProvider>
          <AuthProvider>
            <CurrencyProvider>
              <CartProvider>
                <WishlistProvider>
                  <RecentlyViewedProvider>
                    <ErrorBoundary>
                      {children}
                    </ErrorBoundary>
                  </RecentlyViewedProvider>
                </WishlistProvider>
              </CartProvider>
            </CurrencyProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
    </ViewTransitions>
  );
}
