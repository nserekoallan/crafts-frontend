'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check, ImageOff, Loader2, Package, ShoppingBag, X } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { useCart } from '@/lib/cart';
import { useCurrency } from '@/lib/currency';
import {
  type CustomerOrderItem,
  PAID_ORDER_STATUSES,
  consumeCheckoutOrder,
  orderItemImage,
  orderItemLineTotal,
} from '@/lib/order-items';

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
  items: CustomerOrderItem[];
  createdAt: string;
}

const PENDING_POLL_MS = 4000;

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
  const { clearCart } = useCart();

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

  const orderStatus = order?.status;
  useEffect(() => {
    if (orderStatus !== 'PENDING' || !id) return;
    let disposed = false;
    const interval = setInterval(() => {
      api
        .get<{ data: Order }>(`/orders/${id}`)
        .then((res) => {
          if (!disposed) setOrder(res.data);
        })
        .catch(() => undefined);
    }, PENDING_POLL_MS);
    return () => {
      disposed = true;
      clearInterval(interval);
    };
  }, [orderStatus, id]);

  // The cart is kept until payment succeeds so a failed payment can be retried,
  // and is only cleared for the order this tab just checked out.
  const isPaidStatus = orderStatus !== undefined && PAID_ORDER_STATUSES.includes(orderStatus);
  useEffect(() => {
    if (isPaidStatus && id && consumeCheckoutOrder(id)) clearCart();
  }, [isPaidStatus, id, clearCart]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      </div>
    );
  }

  if (!order) return null;

  // Same defect as checkout/success: this announced "Order Placed!" without ever
  // checking status, and nothing links here — it is reached by direct URL or a
  // payment-provider redirect, which is precisely when the payment may have
  // failed. Derive the outcome from the order instead of assuming success.
  const isPaid = isPaidStatus;
  const isFailed = order.status === 'CANCELLED' || order.status === 'REFUNDED';
  const headline = isPaid
    ? 'Order confirmed'
    : isFailed
      ? order.status === 'REFUNDED'
        ? 'Order refunded'
        : 'Payment not completed'
      : 'Confirming your payment…';
  const subcopy = isPaid
    ? "Thank you for your order. We'll notify you when it ships."
    : order.status === 'REFUNDED'
      ? 'This order has been refunded.'
      : isFailed
        ? 'This order was not paid. You can try again from your cart.'
        : 'We are still waiting for confirmation from your payment provider.';

  return (
    <div className="mx-auto max-w-lg px-4 py-10 text-center md:py-16">
      {/* Outcome icon: check only once paid, X on failure, spinner while waiting */}
      <div
        className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${
          isPaid ? 'bg-success/10' : isFailed ? 'bg-error/10' : 'bg-gold/10'
        }`}
      >
        {isPaid ? (
          <div className="flex h-14 w-14 animate-check-pop items-center justify-center rounded-full bg-success">
            <Check className="h-7 w-7 text-bg-primary" strokeWidth={3} />
          </div>
        ) : isFailed ? (
          <div className="flex h-14 w-14 animate-check-pop items-center justify-center rounded-full bg-error">
            <X className="h-7 w-7 text-bg-primary" strokeWidth={3} />
          </div>
        ) : (
          <Loader2 className="h-10 w-10 animate-spin text-gold" aria-label="Waiting for payment" />
        )}
      </div>

      <h1 className="mt-6 font-heading text-2xl font-bold text-text-primary md:text-3xl">
        {headline}
      </h1>
      <p className="mt-2 text-sm text-text-secondary">{subcopy}</p>

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
              {orderItemImage(item) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={orderItemImage(item)!}
                  alt={item.product.name}
                  className="h-10 w-10 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-bg-surface text-text-tertiary">
                  <ImageOff className="h-4 w-4" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm text-text-primary line-clamp-1">
                  {item.product.name}
                </p>
                <p className="text-xs text-text-tertiary">Qty: {item.quantity}</p>
              </div>
              <p className="shrink-0 text-sm font-medium text-text-primary">
                {formatPrice(orderItemLineTotal(item))}
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
