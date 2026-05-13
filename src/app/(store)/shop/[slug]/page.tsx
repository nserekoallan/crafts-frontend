import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductDetailClient } from './_components/product-detail-client';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const res = await fetch(`${API_BASE}/api/v1/products/slug/${slug}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return { title: 'Product | Crafts Continent' };
    }

    const json = await res.json();
    const product = json.data;

    return {
      title: `${product.name} | Crafts Continent`,
      description: product.description?.slice(0, 160) ?? undefined,
      openGraph: product.images?.[0]?.url
        ? { images: [product.images[0].url] }
        : undefined,
    };
  } catch {
    return { title: 'Product | Crafts Continent' };
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  if (!slug || slug === 'undefined') notFound();
  return <ProductDetailClient slug={slug} />;
}
