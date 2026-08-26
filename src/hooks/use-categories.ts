import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  /** Category image set via /admin. Null until an admin uploads one. */
  image: string | null;
  /** Live product count. The API has always returned this; the type omitted it,
   *  so the homepage hardcoded 0 and showed stocked categories as empty. */
  _count?: { products: number };
}

export function useCategories() {
  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get<{ data: ApiCategory[] }>('/categories'),
    staleTime: 10 * 60 * 1000,
  });

  return {
    categories: data?.data ?? [],
    isLoading,
  };
}
