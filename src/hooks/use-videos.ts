import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ApiVideo, ApiVideosResponse } from '@/lib/types/video';

export interface VideoQuery {
  page?: number;
  limit?: number;
  categoryId?: string;
  artisanId?: string;
  tag?: string;
}

function buildQuery(params: VideoQuery): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') search.set(key, String(value));
  });
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

/** Published videos for the public hub. */
export function useVideos(params: VideoQuery = {}) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['videos', params],
    queryFn: () => api.get<ApiVideosResponse>(`/videos${buildQuery(params)}`),
    staleTime: 5 * 60 * 1000,
  });

  return {
    videos: data?.data ?? [],
    total: data?.meta.total ?? 0,
    totalPages: data?.meta.totalPages ?? 0,
    isLoading,
    isError,
  };
}

/** A single published video, by slug. */
export function useVideo(slug: string) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['video', slug],
    queryFn: () => api.get<{ data: ApiVideo }>(`/videos/${slug}`),
    enabled: Boolean(slug),
  });

  return { video: data?.data, isLoading, isError };
}

/** The signed-in artisan's own videos, at any status. */
export function useMyVideos(artisanId?: string) {
  const { data, isLoading } = useQuery({
    queryKey: ['videos', 'mine', artisanId],
    queryFn: () => api.get<ApiVideosResponse>(`/videos${buildQuery({ artisanId, limit: 100 })}`),
    enabled: Boolean(artisanId),
  });

  return { videos: data?.data ?? [], isLoading };
}

/** Admin moderation queue, or every video when `all` is set. */
export function useAdminVideos(all = false) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['videos', 'admin', all],
    queryFn: () => api.get<ApiVideosResponse>(`/videos/admin/${all ? 'all' : 'queue'}?limit=100`),
  });

  return { videos: data?.data ?? [], isLoading, refetch };
}

/** Approve / reject / suspend / unsuspend, mirroring the product workflow. */
export function useVideoModeration() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['videos'] });

  const approve = useMutation({
    mutationFn: (id: string) => api.patch<{ data: ApiVideo }>(`/videos/${id}/approve`, {}),
    onSuccess: invalidate,
  });

  const reject = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.patch<{ data: ApiVideo }>(`/videos/${id}/reject`, { reason }),
    onSuccess: invalidate,
  });

  const suspend = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.patch<{ data: ApiVideo }>(`/videos/${id}/suspend`, { reason }),
    onSuccess: invalidate,
  });

  const unsuspend = useMutation({
    mutationFn: (id: string) => api.patch<{ data: ApiVideo }>(`/videos/${id}/unsuspend`, {}),
    onSuccess: invalidate,
  });

  return { approve, reject, suspend, unsuspend };
}

/** Artisan submits a draft for review. */
export function useSubmitVideo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<{ data: ApiVideo }>(`/videos/${id}/submit`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['videos'] }),
  });
}

export function useDeleteVideo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/videos/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['videos'] }),
  });
}
