import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://craftcontinent.com';

  // Static routes
  const staticRoutes = ['', '/shop', '/collections', '/about', '/contact', '/wishlist'].map(
    (route) => ({
      url: `${base}${route}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: route === '' ? 1 : 0.8,
    }),
  );

  // Dynamic product pages
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/products?limit=500&status=ACTIVE`,
      { next: { revalidate: 3600 }, signal: AbortSignal.timeout(5000) },
    );
    if (res.ok) {
      const data = await res.json();
      const products: Array<{ slug: string; updatedAt?: string }> = Array.isArray(data)
        ? data
        : (data.data ?? []);
      productRoutes = products.map((p) => ({
        url: `${base}/shop/${p.slug}`,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.7,
      }));
    }
  } catch {
    // silently skip on error — API unreachable at build time
  }

  // Dynamic collection pages
  let collectionRoutes: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/collections`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const data = await res.json();
      const collections: Array<{ slug: string }> = Array.isArray(data)
        ? data
        : (data.data ?? []);
      collectionRoutes = collections.map((c) => ({
        url: `${base}/collections/${c.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }));
    }
  } catch {
    // silently skip on error — API unreachable at build time
  }

  return [...staticRoutes, ...productRoutes, ...collectionRoutes];
}
