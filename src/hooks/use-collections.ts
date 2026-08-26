import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface ApiCollection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
  sortOrder: number;
  /** Live count from the API — never hardcode this. */
  productCount: number;
}

/**
 * Curated collections, from the API.
 *
 * The homepage strip previously rendered a hardcoded list from mock-data with
 * invented counts ("12 pieces"), every tile linking to /collections/<slug> —
 * which 404s because those collections do not exist. Shoppers were shown
 * inventory that was never there.
 */
export function useCollections() {
  const { data, isLoading } = useQuery({
    queryKey: ['collections'],
    queryFn: () => api.get<{ data: ApiCollection[] }>('/collections'),
    staleTime: 10 * 60 * 1000,
  });

  return {
    collections: data?.data ?? [],
    isLoading,
  };
}
