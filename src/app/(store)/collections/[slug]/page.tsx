import type { Metadata } from 'next';
import { CollectionClient } from './_components/collection-client';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const res = await fetch(`${API_BASE}/api/v1/collections/${slug}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return { title: 'Collection | Crafts Continent' };
    }

    const json = await res.json();
    const collection = json.data;

    return {
      title: `${collection.name} | Crafts Continent`,
      description: collection.description ?? undefined,
    };
  } catch {
    return { title: 'Collection | Crafts Continent' };
  }
}

export default async function CollectionSlugPage({ params }: PageProps) {
  const { slug } = await params;
  return <CollectionClient slug={slug} />;
}
