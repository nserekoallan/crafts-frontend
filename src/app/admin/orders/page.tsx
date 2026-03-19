'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ARTISAN_ORDERS_DETAILED } from '@/lib/mock-data';
import type { OrderStatus } from '@/lib/mock-data';
import { Badge } from '@/components/ui/badge';
import { formatPrice, cn } from '@/lib/utils';

/**
 * OrdersPage - All platform orders management interface
 */
export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  /**
   * Status filter options
   */
  const statusFilters: Array<{ value: OrderStatus | 'all'; label: string }> = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
  ];

  /**
   * Filtered orders based on status
   */
  const filteredOrders = useMemo(() => {
    if (statusFilter === 'all') return ARTISAN_ORDERS_DETAILED;
    return ARTISAN_ORDERS_DETAILED.filter((order) => order.status === statusFilter);
  }, [statusFilter]);

  /**
   * Toggle order expansion
   * @param {string} orderId - Order ID to toggle
   */
  const toggleExpanded = (orderId: string) => {
    setExpandedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-charcoal mb-2">Orders</h1>
        <p className="text-medium-gray">Manage all platform orders</p>
      </div>

      {/* Status Filter Tabs */}
      <div className="bg-white rounded-xl border border-light-gray p-2">
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                statusFilter === filter.value
                  ? 'bg-hunter-green text-white'
                  : 'bg-transparent text-charcoal hover:bg-light-gray'
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-medium-gray">
        Showing {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl border border-light-gray overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-light-gray/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-medium-gray uppercase tracking-wider">
                  Order #
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-medium-gray uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-medium-gray uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-medium-gray uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-medium-gray uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-medium-gray uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-medium-gray uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-gray">
              {filteredOrders.map((order) => {
                const isExpanded = expandedOrders.has(order.id);
                return (
                  <>
                    <tr
                      key={order.id}
                      className="hover:bg-light-gray/30 transition-colors cursor-pointer"
                      onClick={() => toggleExpanded(order.id)}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-charcoal">
                        {order.orderNumber}
                      </td>
                      <td className="px-6 py-4 text-sm text-charcoal">
                        {order.customerName}
                      </td>
                      <td className="px-6 py-4 text-sm text-medium-gray">
                        {new Date(order.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-medium-gray">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Badge variant={order.status}>{order.status}</Badge>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-charcoal text-right">
                        {formatPrice(order.total)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-medium-gray mx-auto" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-medium-gray mx-auto" />
                        )}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 bg-light-gray/20">
                          <div className="space-y-2">
                            <div className="font-semibold text-sm text-charcoal mb-3">
                              Order Items:
                            </div>
                            {order.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between py-2 border-b border-light-gray last:border-0"
                              >
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-charcoal">
                                    {item.productName}
                                  </div>
                                  <div className="text-xs text-medium-gray">
                                    Quantity: {item.quantity}
                                  </div>
                                </div>
                                <div className="text-sm font-semibold text-charcoal">
                                  {formatPrice(item.price * item.quantity)}
                                </div>
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
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {filteredOrders.map((order) => {
          const isExpanded = expandedOrders.has(order.id);
          return (
            <div
              key={order.id}
              className="bg-white rounded-xl border border-light-gray overflow-hidden"
            >
              <div
                className="p-4 space-y-3 cursor-pointer"
                onClick={() => toggleExpanded(order.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-charcoal mb-1">
                      {order.orderNumber}
                    </div>
                    <div className="text-sm text-medium-gray">
                      {order.customerName}
                    </div>
                  </div>
                  <Badge variant={order.status}>{order.status}</Badge>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-medium-gray">
                    {new Date(order.date).toLocaleDateString()} •{' '}
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-medium-gray" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-medium-gray" />
                  )}
                </div>

                <div className="text-lg font-semibold text-charcoal">
                  {formatPrice(order.total)}
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-light-gray p-4 bg-light-gray/20 space-y-2">
                  <div className="font-semibold text-sm text-charcoal mb-3">
                    Order Items:
                  </div>
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-2 border-b border-light-gray last:border-0"
                    >
                      <div className="flex-1">
                        <div className="text-sm font-medium text-charcoal">
                          {item.productName}
                        </div>
                        <div className="text-xs text-medium-gray">
                          Qty: {item.quantity}
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-charcoal">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <div className="bg-white rounded-xl border border-light-gray p-12 text-center">
          <p className="text-medium-gray">No orders found with this status</p>
        </div>
      )}
    </div>
  );
}
