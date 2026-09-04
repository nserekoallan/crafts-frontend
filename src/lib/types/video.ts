import type { ApiProductCategory, ApiProductImage } from './product';

export type VideoStatus = 'DRAFT' | 'PENDING_QC' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED';

export interface ApiVideoArtisan {
  id: string;
  businessName: string;
  region?: string | null;
}

export interface ApiVideoLinkedProduct {
  videoId: string;
  productId: string;
  position: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: string | number;
    displayPrice?: string | number | null;
    currency?: string;
    images?: ApiProductImage[];
    artisan?: { id: string; businessName: string };
  };
}

export interface ApiVideo {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  /** Null until the video is published — pre-approval objects are private. */
  url: string | null;
  posterUrl: string | null;
  durationSeconds: number | null;
  sizeBytes: number | null;
  mimeType: string | null;
  status: VideoStatus;
  uploadedAt: string | null;
  artisanId: string | null;
  categoryId: string | null;
  tags: string[];
  viewCount: number;
  rejectionReason?: string | null;
  createdAt: string;
  artisan?: ApiVideoArtisan | null;
  category?: ApiProductCategory | null;
  products?: ApiVideoLinkedProduct[];
  _count?: { products: number };
}

export interface ApiVideosResponse {
  data: ApiVideo[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

/** Response from POST /videos — the reservation plus its presigned target. */
export interface CreateVideoResponse {
  video: ApiVideo;
  uploadUrl: string;
  storageKey: string;
}

/** Formats seconds as m:ss for the duration badge. */
export function formatDuration(seconds: number | null): string {
  if (!seconds || seconds < 0) return '';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
