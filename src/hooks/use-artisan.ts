import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { ApiProduct, ApiProductsResponse } from '@/lib/types/product';

export interface FeaturedRequestStatus {
  productId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

interface Payout {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
}

interface EarningsData {
  balance: string | number;
  payouts: Payout[];
}

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
}

interface OrdersResponse {
  data: Order[];
  meta: { total: number; page: number; limit: number };
}

export type { ApiProduct };

export function useArtisanEarnings() {
  const { isAuthenticated, user } = useAuth();

  return useQuery({
    queryKey: ['artisan', 'earnings'],
    queryFn: () =>
      api.get<{ data: EarningsData }>('/artisans/me/earnings').then((r) => r.data),
    enabled: isAuthenticated && user?.role === 'artisan',
  });
}

export function useArtisanOrders(page = 1) {
  const { isAuthenticated, user } = useAuth();

  return useQuery({
    queryKey: ['artisan', 'orders', page],
    queryFn: () =>
      api.get<OrdersResponse>(`/orders?page=${page}&limit=20`).then((r) => r),
    enabled: isAuthenticated && user?.role === 'artisan',
    retry: 1,
  });
}

export function useArtisanProducts(page = 1) {
  const { isAuthenticated, user } = useAuth();
  const artisanId = user?.artisan?.id;

  return useQuery({
    queryKey: ['artisan', 'products', artisanId, page],
    queryFn: () =>
      api
        .get<ApiProductsResponse>(`/products?artisanId=${artisanId}&page=${page}&limit=20`)
        .then((r) => r),
    enabled: isAuthenticated && !!artisanId,
  });
}

export function useArtisanFeaturedRequests() {
  const { isAuthenticated, user } = useAuth();

  return useQuery({
    queryKey: ['artisan', 'featured-requests'],
    queryFn: () =>
      api
        .get<{ data: FeaturedRequestStatus[] }>('/featured-requests/me')
        .then((r) => r.data),
    enabled: isAuthenticated && user?.role === 'artisan',
    retry: 1,
  });
}

export function useRequestFeatured() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, message }: { productId: string; message?: string }) =>
      api.post('/featured-requests', { productId, message }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['artisan', 'featured-requests'] }),
  });
}
