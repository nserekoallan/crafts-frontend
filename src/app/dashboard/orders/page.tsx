'use client';

import { useState, useMemo } from 'react';
import { useArtisanOrders } from '@/hooks/use-artisan';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/lib/currency';
import { Badge } from '@/components/ui/badge';

type StatusFilter = 'all' | 'PENDING' | 'PAID' | 'PROCESSING' | 'QC_PASSED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

const STATUS_TABS: StatusFilter[] = ['all', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const STATUS_LABELS: Record<string, string> = {
  all: 'All',
  PENDING: 'Pending',
  PAID: 'Paid',
  PROCESSING: 'Processing',
  QC_PASSED: 'QC Passed',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

function getStatusVariant(status: string): 'default' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' {
  const map: Record<string, 'default' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'> = {
    DELIVERED: 'delivered',
    SHIPPED: 'shipped',
    PROCESSING: 'processing',
    QC_PASSED: 'processing',
    PAID: 'processing',
    PENDING: 'pending',
    CANCELLED: 'cancelled',
  };
  return map[status] ?? 'default';
}

export default function OrdersPage() {
  const { formatPrice } = useCurrency();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const { data, isLoading, error } = useArtisanOrders();

  const orders = data?.data ?? [];

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return orders;
    return orders.filter((o) => o.status === statusFilter);
  }, [orders, statusFilter]);

  return (
    <div>
      <h1 className="text-2xl font-bold">Orders</h1>
      <p className="mt-1 text-sm text-medium-gray">Orders containing your products</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {STATUS_TABS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium transition-colors',
              statusFilter === s
                ? 'bg-hunter-green text-white'
                : 'border border-border-dark text-text-secondary hover:border-white/30',
            )}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border-dark bg-bg-elevated">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-medium-gray">Loading orders…</div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-500">Failed to load orders.</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-medium-gray">
            {orders.length === 0 ? 'No orders yet.' : 'No orders match this filter.'}
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border-dark text-xs font-semibold uppercase tracking-wider text-text-secondary">
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Items</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dark">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-white/[0.03]">
                  <td className="px-5 py-3 font-medium">{order.orderNumber}</td>
                  <td className="px-5 py-3 text-medium-gray">{order.items?.length ?? 0}</td>
                  <td className="px-5 py-3">
                    <Badge variant={getStatusVariant(order.status)}>
                      {STATUS_LABELS[order.status] ?? order.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-medium-gray">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3 text-right font-medium">{formatPrice(order.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
