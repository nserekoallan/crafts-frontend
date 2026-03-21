import type { Product, StockStatus } from '@/lib/mock-data';

// ---------------------------------------------------------------------------
// API Response Types
// ---------------------------------------------------------------------------

export interface ApiProductImage {
  id: string;
  url: string;
  variants: Record<string, string> | null;
  position: number;
  isDefault: boolean;
}

export interface ApiProductArtisan {
  id: string;
  businessName: string;
  region: string;
}

export interface ApiProductCategory {
  id: string;
  name: string;
  slug: string;
}

export interface ApiProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  stock: number;
  status: string;
  tags: string[];
  materials: string[];
  dimensions: string | null;
  weight: number | null;
  images: ApiProductImage[];
  artisan: ApiProductArtisan;
  category: ApiProductCategory;
  _count: { reviews: number };
  createdAt: string;
  updatedAt: string;
}

export interface ApiProductsMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiProductsResponse {
  data: ApiProduct[];
  meta: ApiProductsMeta;
}

// ---------------------------------------------------------------------------
// Mapper
// ---------------------------------------------------------------------------

/**
 * Derives a UI stock status from the raw stock count.
 */
function deriveStockStatus(stock: number): StockStatus {
  if (stock <= 0) return 'out_of_stock';
  if (stock <= 5) return 'low_stock';
  return 'in_stock';
}

/**
 * Maps an API product to the frontend Product type used by all UI components.
 */
export function mapApiProductToProduct(api: ApiProduct): Product {
  const defaultImage = api.images
    .slice()
    .sort((a, b) => a.position - b.position)[0];

  return {
    id: api.id,
    name: api.name,
    slug: api.slug,
    price: api.price,
    currency: api.currency,
    imageUrl: defaultImage?.url ?? '/placeholder.jpg',
    images: api.images
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((img) => img.url),
    artisanName: api.artisan.businessName,
    artisanId: api.artisan.id,
    region: api.artisan.region,
    category: api.category.name,
    description: api.description,
    rating: 0,
    reviewCount: api._count.reviews,
    stockStatus: deriveStockStatus(api.stock),
    stockCount: api.stock,
  };
}
