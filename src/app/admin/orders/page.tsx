'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { formatPrice, cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product?: { name: string };
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

type StatusVariant = 'default' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

const STATUS_VARIANT: Record<string, StatusVariant> = {
  DELIVERED: 'delivered',
  SHIPPED: 'shipped',
  PROCESSING: 'processing',
  QC_PASSED: 'processing',
  PAID: 'processing',
  PENDING: 'pending',
  CANCELLED: 'cancelled',
};

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'PAID', label: 'Paid' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'QC_PASSED', label: 'QC Passed' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const NEXT_STATUSES: Record<string, string[]> = {
  PENDING: ['PAID', 'CANCELLED'],
  PAID: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['QC_PASSED', 'CANCELLED'],
  QC_PASSED: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
  REFUNDED: [],
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'orders', statusFilter],
    queryFn: () => {
      const params = new URLSearchParams({ limit: '50' });
      if (statusFilter !== 'all') params.set('status', statusFilter);
      return api.get<OrdersResponse>(`/orders?${params}`);
    },
  });

  const { mutate: updateStatus, variables: pendingVars } = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      api.patch(`/orders/${orderId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
    },
  });

  const orders = data?.data ?? [];

  const toggleExpanded = (id: string) => {
    setExpandedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-charcoal mb-2">Orders</h1>
        <p className="text-medium-gray">Manage all platform orders</p>
      </div>

      {/* Status Filter Tabs */}
      <div className="bg-white rounded-xl border border-light-gray p-2">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                statusFilter === f.value
                  ? 'bg-hunter-green text-white'
                  : 'bg-transparent text-charcoal hover:bg-light-gray'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      {!isLoading && (
        <div className="text-sm text-medium-gray">
          Showing {orders.length} order{orders.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-light-gray/60" />
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
          Failed to load orders.
        </div>
      )}

      {/* Desktop Table */}
      {!isLoading && !error && orders.length > 0 && (
        <div className="hidden md:block bg-white rounded-xl border border-light-gray overflow-hidden">
          <table className="w-full">
            <thead className="bg-light-gray/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-medium-gray uppercase tracking-wider">Order #</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-medium-gray uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-medium-gray uppercase tracking-wider">Items</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-medium-gray uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-medium-gray uppercase tracking-wider">Actions</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-medium-gray uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-medium-gray uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-gray">
              {orders.map((order) => {
                const isExpanded = expandedOrders.has(order.id);
                const nextStatuses = NEXT_STATUSES[order.status] ?? [];
                const isUpdating = pendingVars?.orderId === order.id;
                return (
                  <>
                    <tr key={order.id} className="hover:bg-light-gray/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-charcoal">{order.orderNumber}</td>
                      <td className="px-6 py-4 text-sm text-medium-gray">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-medium-gray">
                        {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? 's' : ''}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={STATUS_VARIANT[order.status] ?? 'default'}>
                          {order.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        {nextStatuses.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {nextStatuses.map((s) => (
                              <button
                                key={s}
                                disabled={isUpdating}
                                onClick={() => updateStatus({ orderId: order.id, status: s })}
                                className="rounded px-2 py-1 text-xs font-medium bg-hunter-green/10 text-hunter-green hover:bg-hunter-green/20 disabled:opacity-50 transition-colors"
                              >
                                → {s.replace('_', ' ')}
                              </button>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-charcoal text-right">
                        {formatPrice(order.total)}
                      </td>
                      <td
                        className="px-6 py-4 text-center cursor-pointer"
                        onClick={() => toggleExpanded(order.id)}
                      >
                        {isExpanded
                          ? <ChevronUp className="w-5 h-5 text-medium-gray mx-auto" />
                          : <ChevronDown className="w-5 h-5 text-medium-gray mx-auto" />
                        }
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${order.id}-detail`}>
                        <td colSpan={7} className="px-6 py-4 bg-light-gray/20">
                          <p className="text-sm font-semibold text-charcoal mb-3">Order Items</p>
                          <div className="space-y-2">
                            {order.items?.map((item) => (
                              <div key={item.id} className="flex items-center justify-between text-sm py-2 border-b border-light-gray last:border-0">
                                <div>
                                  <p className="font-medium text-charcoal">{item.product?.name ?? item.id}</p>
                                  <p className="text-xs text-medium-gray">Qty: {item.quantity}</p>
                                </div>
                                <p className="font-semibold text-charcoal">{formatPrice(item.price * item.quantity)}</p>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile Cards */}
      {!isLoading && !error && orders.length > 0 && (
        <div className="md:hidden space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedOrders.has(order.id);
            const nextStatuses = NEXT_STATUSES[order.status] ?? [];
            const isUpdating = pendingVars?.orderId === order.id;
            return (
              <div key={order.id} className="bg-white rounded-xl border border-light-gray overflow-hidden">
                <div className="p-4 space-y-3 cursor-pointer" onClick={() => toggleExpanded(order.id)}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-charcoal">{order.orderNumber}</p>
                      <p className="text-xs text-medium-gray">
                        {new Date(order.createdAt).toLocaleDateString()} · {order.items?.length ?? 0} items
                      </p>
                    </div>
                    <Badge variant={STATUS_VARIANT[order.status] ?? 'default'}>
                      {order.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-charcoal">{formatPrice(order.total)}</p>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-medium-gray" /> : <ChevronDown className="w-5 h-5 text-medium-gray" />}
                  </div>
                </div>
                {isExpanded && (
                  <div className="border-t border-light-gray p-4 bg-light-gray/20 space-y-3">
                    {nextStatuses.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {nextStatuses.map((s) => (
                          <button
                            key={s}
                            disabled={isUpdating}
                            onClick={() => updateStatus({ orderId: order.id, status: s })}
                            className="rounded px-3 py-1.5 text-xs font-medium bg-hunter-green text-white disabled:opacity-50"
                          >
                            Mark as {s.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    )}
                    {order.items?.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm py-2 border-b border-light-gray last:border-0">
                        <div>
                          <p className="font-medium text-charcoal">{item.product?.name ?? item.id}</p>
                          <p className="text-xs text-medium-gray">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && orders.length === 0 && (
        <div className="bg-white rounded-xl border border-light-gray p-12 text-center">
          <p className="text-medium-gray">No orders found</p>
        </div>
      )}
    </div>
  );
}
