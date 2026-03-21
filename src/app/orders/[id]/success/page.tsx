'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check, Package, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { useCurrency } from '@/lib/currency';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingAddress: {
    street: string;
    city: string;
    country: string;
    state?: string;
  } | null;
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    product: { name: string; imageUrl: string };
  }>;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Order success / confirmation page shown after placing an order.
 */
export default function OrderSuccessPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { formatPrice } = useCurrency();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (!authLoading && isAuthenticated && id) {
      api
        .get<{ data: Order }>(`/orders/${id}`)
        .then((res) => setOrder(res.data))
        .catch(() => router.replace('/shop'))
        .finally(() => setLoading(false));
    }
  }, [authLoading, isAuthenticated, id, router]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="mx-auto max-w-lg px-4 py-10 text-center md:py-16">
      {/* Success animation */}
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
        <div className="flex h-14 w-14 animate-check-pop items-center justify-center rounded-full bg-success">
          <Check className="h-7 w-7 text-bg-primary" strokeWidth={3} />
        </div>
      </div>

      <h1 className="mt-6 font-heading text-2xl font-bold text-text-primary md:text-3xl">
        Order Placed!
      </h1>
      <p className="mt-2 text-sm text-text-secondary">
        Thank you for your order. We&apos;ll notify you when it ships.
      </p>

      {/* Order number */}
      <div className="mt-6 rounded-xl border border-border-dark bg-bg-elevated p-4">
        <p className="text-xs uppercase tracking-wider text-text-tertiary">
          Order Number
        </p>
        <p className="mt-1 font-heading text-lg font-bold text-gold">
          {order.orderNumber}
        </p>
      </div>

      {/* Items summary */}
      <div className="mt-4 rounded-xl border border-border-dark bg-bg-elevated p-4 text-left">
        <h3 className="text-sm font-semibold text-text-secondary">
          Items Ordered
        </h3>
        <div className="mt-3 divide-y divide-border-dark">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.product.imageUrl}
                alt={item.product.name}
                className="h-10 w-10 shrink-0 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-text-primary line-clamp-1">
                  {item.product.name}
                </p>
                <p className="text-xs text-text-tertiary">Qty: {item.quantity}</p>
              </div>
              <p className="shrink-0 text-sm font-medium text-text-primary">
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-border-dark pt-3">
          <span className="text-sm font-medium text-text-secondary">Total</span>
          <span className="font-heading font-bold text-gold">
            {formatPrice(Number(order.total))}
          </span>
        </div>
      </div>

      {/* Shipping */}
      {order.shippingAddress && (
        <div className="mt-4 rounded-xl border border-border-dark bg-bg-elevated p-4 text-left">
          <h3 className="text-sm font-semibold text-text-secondary">
            Shipping To
          </h3>
          <p className="mt-1 text-sm text-text-primary">
            {[
              order.shippingAddress.street,
              order.shippingAddress.city,
              order.shippingAddress.state,
              order.shippingAddress.country,
            ]
              .filter(Boolean)
              .join(', ')}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href={`/orders/${order.id}`}
          className="flex h-12 items-center justify-center gap-2 rounded-xl border border-border-dark px-6 text-sm font-medium text-text-primary transition-colors hover:border-gold/30 hover:text-gold"
        >
          <Package className="h-4 w-4" />
          View Order
        </Link>
        <Link
          href="/shop"
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-gold px-8 text-sm font-bold text-bg-primary transition-colors hover:bg-gold-light active:scale-[0.98]"
        >
          <ShoppingBag className="h-4 w-4" />
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
