import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  mapApiProductToProduct,
  type ApiProductsResponse,
} from '@/lib/types/product';
import type { Product } from '@/lib/mock-data';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UseProductsParams {
  search?: string;
  categoryId?: string;
  region?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  enabled?: boolean;
}

export interface UseProductsResult {
  products: Product[];
  total: number;
  totalPages: number;
  page: number;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Builds a query string from non-empty params.
 */
function buildQuery(params: UseProductsParams): string {
  const entries: [string, string][] = [];

  if (params.search?.trim()) entries.push(['search', params.search.trim()]);
  if (params.categoryId) entries.push(['categoryId', params.categoryId]);
  if (params.region) entries.push(['region', params.region]);
  if (params.minPrice !== undefined) entries.push(['minPrice', String(params.minPrice)]);
  if (params.maxPrice !== undefined) entries.push(['maxPrice', String(params.maxPrice)]);
  if (params.page && params.page > 1) entries.push(['page', String(params.page)]);
  if (params.limit) entries.push(['limit', String(params.limit)]);

  if (entries.length === 0) return '';
  return '?' + new URLSearchParams(entries).toString();
}

/**
 * TanStack Query hook to fetch products from the API.
 */
export function useProducts(params: UseProductsParams = {}): UseProductsResult {
  const { enabled = true, ...queryParams } = params;
  const queryString = buildQuery(queryParams);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['products', queryParams],
    queryFn: () => api.get<ApiProductsResponse>(`/products${queryString}`),
    enabled,
  });

  return {
    products: data?.data.map(mapApiProductToProduct) ?? [],
    total: data?.meta.total ?? 0,
    totalPages: data?.meta.totalPages ?? 0,
    page: data?.meta.page ?? 1,
    isLoading,
    isError,
    error: error as Error | null,
  };
}
