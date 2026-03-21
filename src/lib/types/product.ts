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
  price: string | number;
  currency: string;
  stock: number;
  status: string;
  tags: string[];
  materials: string | string[];
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

/** Placeholder used when a product has no uploaded images. */
const PLACEHOLDER_IMAGE = '/products/product-01.jpg';

/**
 * Maps an API product to the frontend Product type used by all UI components.
 */
export function mapApiProductToProduct(apiProduct: ApiProduct): Product {
  const sortedImages = apiProduct.images
    .slice()
    .sort((a, b) => a.position - b.position);

  const imageUrl = sortedImages[0]?.url ?? PLACEHOLDER_IMAGE;

  return {
    id: apiProduct.id,
    name: apiProduct.name,
    slug: apiProduct.slug,
    price: Number(apiProduct.price),
    currency: apiProduct.currency,
    imageUrl,
    images: sortedImages.length > 0
      ? sortedImages.map((img) => img.url)
      : [PLACEHOLDER_IMAGE],
    artisanName: apiProduct.artisan.businessName,
    artisanId: apiProduct.artisan.id,
    region: apiProduct.artisan.region,
    category: apiProduct.category.name,
    description: apiProduct.description,
    rating: 0,
    reviewCount: apiProduct._count.reviews,
    stockStatus: deriveStockStatus(apiProduct.stock),
    stockCount: apiProduct.stock,
  };
}
