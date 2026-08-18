import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

/**
 * Non-production deployments must never be indexed — a crawlable staging copy
 * competes with production for the same content in search results.
 * Set NEXT_PUBLIC_SITE_ENV=production on the production box to allow crawling.
 */
const isProduction = process.env.NEXT_PUBLIC_SITE_ENV === 'production';

export default function robots(): MetadataRoute.Robots {
  if (!isProduction) {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
    };
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/dashboard/',
          '/api/',
          '/checkout/',
          '/cart',
          '/account',
          '/orders',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
