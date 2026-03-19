'use client';

import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import { MOCK_ORDERS } from '@/lib/mock-data';

/**
 * Orders list page displaying order history with status badges.
 */
export default function OrdersPage() {
  const orders = MOCK_ORDERS;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
      <h1 className="text-3xl font-bold">My Orders</h1>

      {orders.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-lg text-medium-gray">You have no orders yet.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-light-gray bg-white p-5">
              <div>
                <p className="font-semibold text-charcoal">{order.orderNumber}</p>
                <p className="text-sm text-medium-gray">{new Date(order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p className="text-xs text-medium-gray">{order.itemCount} item{order.itemCount > 1 ? 's' : ''}</p>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant={order.status}>{order.status}</Badge>
                <span className="font-heading font-bold text-hunter-green">{formatPrice(order.total)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
