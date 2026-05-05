import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
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
