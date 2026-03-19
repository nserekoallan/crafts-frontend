'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ARTISAN_ORDERS_DETAILED, type OrderStatus } from '@/lib/mock-data';
import { formatPrice, cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type StatusFilterType = 'all' | OrderStatus;

const STATUS_TABS: StatusFilterType[] = ['all', 'pending', 'processing', 'shipped', 'delivered'];

/**
 * Returns Badge variant for order status.
 */
function getStatusBadgeVariant(status: OrderStatus): 'default' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' {
  return status as 'default' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
}

/**
 * Returns human-readable status label.
 */
function getStatusLabel(status: OrderStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

/**
 * Artisan orders management page with expandable order details.
 */
export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Filter orders by status
  const filteredOrders = ARTISAN_ORDERS_DETAILED.filter(
    (order) => statusFilter === 'all' || order.status === statusFilter,
  );

  /**
   * Toggles the expanded state of an order row.
   */
  function toggleOrderExpansion(orderId: string) {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-charcoal md:text-3xl">Orders</h1>
        <p className="mt-1 text-sm text-medium-gray">Track and manage customer orders</p>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto border-b border-light-gray">
        {STATUS_TABS.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={cn(
              'whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
              statusFilter === status
                ? 'border-hunter-green text-hunter-green'
                : 'border-transparent text-medium-gray hover:text-charcoal',
            )}
          >
            {status === 'all' ? 'All' : getStatusLabel(status)}
          </button>
        ))}
      </div>

      {/* Orders Table (Desktop) */}
      <div className="hidden overflow-hidden rounded-lg border border-light-gray lg:block">
        <table className="w-full">
          <thead className="bg-light-gray/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal">
                Order #
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal">
                Customer
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal">
                Items
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal">
                Total
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal">
                Status
              </th>
              <th className="w-12 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-light-gray bg-white">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-medium-gray">
                  No orders found.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => {
                const isExpanded = expandedOrderId === order.id;
                return (
                  <>
                    <tr
                      key={order.id}
                      onClick={() => toggleOrderExpansion(order.id)}
                      className="cursor-pointer transition-colors hover:bg-light-gray/30"
                    >
                      <td className="px-4 py-3 font-medium text-charcoal">{order.orderNumber}</td>
                      <td className="px-4 py-3 text-charcoal">{order.customerName}</td>
                      <td className="px-4 py-3 text-medium-gray">{order.date}</td>
                      <td className="px-4 py-3 text-charcoal">{order.items.length}</td>
                      <td className="px-4 py-3 font-medium text-charcoal">{formatPrice(order.total)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={getStatusBadgeVariant(order.status)}>{getStatusLabel(order.status)}</Badge>
                      </td>
                      <td className="px-4 py-3 text-medium-gray">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan={7} className="bg-light-gray/20 px-4 py-4">
                          <div className="space-y-2">
                            <p className="text-sm font-semibold text-charcoal">Order Items:</p>
                            <div className="space-y-1">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between text-sm">
                                  <span className="text-charcoal">
                                    {item.productName} <span className="text-medium-gray">× {item.quantity}</span>
                                  </span>
                                  <span className="font-medium text-charcoal">{formatPrice(item.price * item.quantity)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Orders Cards (Mobile) */}
      <div className="grid gap-4 lg:hidden">
        {filteredOrders.length === 0 ? (
          <div className="rounded-lg border border-light-gray bg-white px-4 py-8 text-center text-sm text-medium-gray">
            No orders found.
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            return (
              <div key={order.id} className="rounded-lg border border-light-gray bg-white shadow-sm">
                <button
                  onClick={() => toggleOrderExpansion(order.id)}
                  className="w-full p-4 text-left transition-colors hover:bg-light-gray/30"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-charcoal">{order.orderNumber}</p>
                        <Badge variant={getStatusBadgeVariant(order.status)}>{getStatusLabel(order.status)}</Badge>
                      </div>
                      <p className="text-sm text-charcoal">{order.customerName}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-medium-gray">{order.date}</span>
                        <span className="text-medium-gray">{order.items.length} items</span>
                      </div>
                      <p className="text-base font-semibold text-charcoal">{formatPrice(order.total)}</p>
                    </div>
                    <div className="shrink-0 text-medium-gray">
                      {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </div>
                  </div>
                </button>
                {isExpanded && (
                  <div className="border-t border-light-gray bg-light-gray/20 p-4">
                    <p className="mb-2 text-sm font-semibold text-charcoal">Order Items:</p>
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="text-charcoal">
                            {item.productName} <span className="text-medium-gray">× {item.quantity}</span>
                          </span>
                          <span className="font-medium text-charcoal">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
