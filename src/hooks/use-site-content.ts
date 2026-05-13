import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface ContentResponse<T> {
  data: { key: string; value: T };
}

/**
 * Fetches a single site content key from /content/:key.
 * Returns fallback immediately while loading, and as permanent fallback if the
 * API is down or the key hasn't been seeded yet.
 */
export function useSiteContent<T extends object | string | number | boolean | unknown[]>(
  key: string,
  fallback: T,
): { data: T; isLoading: boolean } {
  const { data, isLoading } = useQuery({
    queryKey: ['content', key],
    queryFn: async (): Promise<T> => {
      const res = await api.get<ContentResponse<T>>(`/content/${key}`);
      // Handle both { data: { value } } and { value } shapes defensively
      const envelope = res as unknown as ContentResponse<T>;
      if (envelope?.data?.value !== undefined) return envelope.data.value;
      // If the API returns value directly (shape mismatch)
      const direct = res as unknown as { value: T };
      if (direct?.value !== undefined) return direct.value;
      return fallback;
    },
    staleTime: 5 * 60 * 1000,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    placeholderData: fallback as any,
    retry: 1,
  });

  return { data: data ?? fallback, isLoading };
}

/**
 * Convenience hook for social links used in header, footer, and contact page.
 */
export function useSocialLinks(): {
  data: { instagram: string; twitter: string; tiktok: string };
  isLoading: boolean;
} {
  return useSiteContent('site.socialLinks', {
    instagram: 'https://www.instagram.com/craft_continent',
    twitter: 'https://x.com/Craftcontinent',
    tiktok: 'https://www.tiktok.com/@craft.continent',
  });
}
