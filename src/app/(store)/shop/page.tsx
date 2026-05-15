import type { Metadata } from 'next';
import { ShopClient } from './_components/shop-client';

export const metadata: Metadata = {
  title: 'Shop African Crafts | Crafts Continent',
  description:
    'Browse authentic handcrafted pieces from skilled African artisans. Baskets, jewelry, textiles, wall art and more.',
  openGraph: {
    title: 'Shop African Crafts | Crafts Continent',
    description:
      'Browse authentic handcrafted pieces from skilled African artisans.',
  },
};

export default function ShopPage() {
  return <ShopClient />;
}
