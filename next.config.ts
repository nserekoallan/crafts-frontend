import type { NextConfig } from 'next';

const baseConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    const apiDestination =
      process.env.API_DESTINATION ?? 'https://api.craftcontinent.com';
    return [
      {
        source: '/api/v1/:path*',
        destination: `${apiDestination}/api/v1/:path*`,
      },
    ];
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.r2.dev',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

// `viewTransition` is experimental in Next 16; merged so it doesn't fight the
// NextConfig type. Wraps client navigations in startViewTransition so matching
// `view-transition-name` pairs morph (product card image → detail hero).
const nextConfig = {
  ...baseConfig,
  experimental: { viewTransition: true },
};

export default nextConfig;
