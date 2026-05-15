import type { Metadata } from 'next';
import { ArtisansClient } from './_components/artisans-client';

export const metadata: Metadata = {
  title: 'Meet Our Artisans | Crafts Continent',
  description:
    'Discover skilled African craftspeople and their handmade creations.',
};

export default function ArtisansPage() {
  return <ArtisansClient />;
}
