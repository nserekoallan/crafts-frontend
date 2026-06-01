'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useCurrency } from '@/lib/currency';
import { cn } from '@/lib/utils';

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'PAID', label: 'Paid' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'QC_PASSED', label: 'QC Passed' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
] as const;

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  items: { id: string }[];
}

interface OrdersResponse {
  data: Order[];
  meta: { total: number; page: number; limit: number };
}

const STATUS_VARIANT: Record<string, 'default' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'> = {
  DELIVERED: 'delivered',
  SHIPPED: 'shipped',
  PROCESSING: 'processing',
  QC_PASSED: 'processing',
  PAID: 'processing',
  PENDING: 'pending',
  CANCELLED: 'cancelled',
};

/**
 * Customer order history — requires authentication.
 */
export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { formatPrice } = useCurrency();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login?redirect=/orders');
    }
  }, [authLoading, isAuthenticated, router]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['orders', statusFilter],
    queryFn: () => {
      const params = new URLSearchParams({ limit: '50' });
      if (statusFilter !== 'all') params.set('status', statusFilter);
      return api.get<OrdersResponse>(`/orders?${params.toString()}`);
    },
    enabled: isAuthenticated,
  });

  const orders = data?.data ?? [];

  if (authLoading || (!isAuthenticated && !authLoading)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-hunter-green border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-text-primary">My Orders</h1>

      {/* Status filters */}
      <div className="mt-4 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              statusFilter === f.value
                ? 'border-gold bg-gold/10 text-gold'
                : 'border-border-dark text-text-secondary hover:border-gold/50 hover:text-text-primary',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="mt-8 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl border border-border-dark bg-bg-elevated" />
          ))}
        </div>
      ) : error ? (
        <div className="mt-8 text-center text-sm text-red-400">Failed to load orders.</div>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center">
          {statusFilter === 'all' ? (
            <>
              <p className="text-lg text-text-secondary">You have no orders yet.</p>
              <Link href="/shop" className="mt-4 inline-block text-sm font-medium text-gold hover:underline">
                Start shopping
              </Link>
            </>
          ) : (
            <p className="text-lg text-text-secondary">No orders with this status.</p>
          )}
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border-dark bg-bg-elevated p-5 transition-colors hover:border-border-dark-hover"
            >
              <div>
                <p className="font-semibold text-text-primary">{order.orderNumber}</p>
                <p className="text-sm text-text-secondary">
                  {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <p className="text-xs text-text-tertiary">
                  {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant={STATUS_VARIANT[order.status] ?? 'default'}>
                  {order.status.replace('_', ' ')}
                </Badge>
                <span className="font-heading font-bold text-gold">{formatPrice(order.total)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
