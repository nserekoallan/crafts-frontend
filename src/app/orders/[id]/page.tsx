'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, Clock, Package, Truck, XCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { useCurrency } from '@/lib/currency';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'PROCESSING'
  | 'QC_PASSED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  shippingCost: number;
  total: number;
  currency: string;
  shippingAddress: {
    street: string;
    city: string;
    country: string;
    state?: string;
    zip?: string;
    phone?: string;
  } | null;
  notes: string | null;
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    product: { name: string; imageUrl: string; slug: string };
  }>;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Status timeline config
// ---------------------------------------------------------------------------

const TIMELINE_STEPS: Array<{
  status: OrderStatus;
  label: string;
  icon: React.ReactNode;
}> = [
  { status: 'PENDING', label: 'Order Placed', icon: <Clock className="h-4 w-4" /> },
  { status: 'PAID', label: 'Payment Confirmed', icon: <Check className="h-4 w-4" /> },
  { status: 'PROCESSING', label: 'Processing', icon: <Package className="h-4 w-4" /> },
  { status: 'QC_PASSED', label: 'Quality Checked', icon: <Check className="h-4 w-4" /> },
  { status: 'SHIPPED', label: 'Shipped', icon: <Truck className="h-4 w-4" /> },
  { status: 'DELIVERED', label: 'Delivered', icon: <Check className="h-4 w-4" /> },
];

const STATUS_ORDER: OrderStatus[] = [
  'PENDING', 'PAID', 'PROCESSING', 'QC_PASSED', 'SHIPPED', 'DELIVERED',
];

/**
 * Returns the index of the status in the timeline, or -1 for terminal states.
 */
function getStatusIndex(status: OrderStatus): number {
  return STATUS_ORDER.indexOf(status);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Order detail page — shows status timeline, items, shipping, and payment info.
 */
export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { formatPrice } = useCurrency();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace(`/login?redirect=/orders/${id}`);
      return;
    }

    if (!authLoading && isAuthenticated && id) {
      api
        .get<{ data: Order }>(`/orders/${id}`)
        .then((res) => setOrder(res.data))
        .catch(() => setError('Order not found or access denied.'))
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

  if (error || !order) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <XCircle className="h-12 w-12 text-error" />
        <h2 className="mt-4 font-heading text-lg font-bold text-text-primary">
          {error ?? 'Order not found'}
        </h2>
        <Link
          href="/shop"
          className="mt-4 text-sm font-medium text-gold hover:text-gold-light"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  const isTerminal = order.status === 'CANCELLED' || order.status === 'REFUNDED';
  const currentIndex = getStatusIndex(order.status);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:py-8 lg:px-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/shop"
          className="flex items-center gap-1 text-sm font-medium text-text-secondary transition-colors hover:text-gold"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="font-heading text-xl font-bold text-text-primary md:text-2xl">
            Order {order.orderNumber}
          </h1>
          <p className="text-xs text-text-tertiary">
            Placed on{' '}
            {new Date(order.createdAt).toLocaleDateString('en-UG', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Terminal status banner */}
      {isTerminal && (
        <div
          className={`mt-4 rounded-xl border p-3 text-sm font-medium ${
            order.status === 'CANCELLED'
              ? 'border-error/30 bg-error/10 text-error'
              : 'border-warning/30 bg-warning/10 text-warning'
          }`}
        >
          This order has been {order.status.toLowerCase()}.
        </div>
      )}

      {/* Status timeline */}
      {!isTerminal && (
        <div className="mt-6 rounded-xl border border-border-dark bg-bg-elevated p-5">
          <h3 className="text-sm font-semibold text-text-secondary">
            Order Status
          </h3>
          <div className="mt-4 flex items-center gap-1">
            {TIMELINE_STEPS.map((step, i) => {
              const isCompleted = i <= currentIndex;
              const isCurrent = i === currentIndex;

              return (
                <div key={step.status} className="flex flex-1 flex-col items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                      isCompleted
                        ? 'bg-gold text-bg-primary'
                        : 'border border-border-dark bg-bg-surface text-text-tertiary'
                    } ${isCurrent ? 'ring-2 ring-gold/30' : ''}`}
                  >
                    {step.icon}
                  </div>
                  <span
                    className={`mt-2 text-center text-[10px] font-medium leading-tight sm:text-xs ${
                      isCompleted ? 'text-text-primary' : 'text-text-tertiary'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
          {/* Progress bar beneath */}
          <div className="mt-3 flex gap-1">
            {TIMELINE_STEPS.map((step, i) => (
              <div
                key={step.status}
                className={`h-1 flex-1 rounded-full ${
                  i <= currentIndex ? 'bg-gold' : 'bg-bg-surface'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="mt-4 rounded-xl border border-border-dark bg-bg-elevated p-5">
        <h3 className="text-sm font-semibold text-text-secondary">
          Items ({order.items.length})
        </h3>
        <div className="mt-3 divide-y divide-border-dark">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <Link href={`/shop/${item.product.slug}`} className="shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="h-14 w-14 rounded-lg object-cover"
                />
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={`/shop/${item.product.slug}`}>
                  <p className="text-sm font-medium text-text-primary line-clamp-1 hover:text-gold">
                    {item.product.name}
                  </p>
                </Link>
                <p className="text-xs text-text-tertiary">
                  {item.quantity} x {formatPrice(item.price)}
                </p>
              </div>
              <p className="shrink-0 text-sm font-semibold text-text-primary">
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-1.5 border-t border-border-dark pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-text-secondary">Subtotal</span>
            <span className="text-text-primary">{formatPrice(Number(order.subtotal))}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Shipping</span>
            <span className="text-text-primary">
              {Number(order.shippingCost) > 0
                ? formatPrice(Number(order.shippingCost))
                : 'Free'}
            </span>
          </div>
          <div className="flex justify-between border-t border-border-dark pt-2 text-base font-medium">
            <span className="text-text-primary">Total</span>
            <span className="font-heading font-bold text-gold">
              {formatPrice(Number(order.total))}
            </span>
          </div>
        </div>
      </div>

      {/* Shipping address */}
      {order.shippingAddress && (
        <div className="mt-4 rounded-xl border border-border-dark bg-bg-elevated p-5">
          <h3 className="text-sm font-semibold text-text-secondary">
            Shipping Address
          </h3>
          <p className="mt-2 text-sm text-text-primary">
            {[
              order.shippingAddress.street,
              order.shippingAddress.city,
              order.shippingAddress.state,
              order.shippingAddress.country,
              order.shippingAddress.zip,
            ]
              .filter(Boolean)
              .join(', ')}
          </p>
          {order.shippingAddress.phone && (
            <p className="mt-1 text-xs text-text-tertiary">
              {order.shippingAddress.phone}
            </p>
          )}
        </div>
      )}

      {/* Notes */}
      {order.notes && (
        <div className="mt-4 rounded-xl border border-border-dark bg-bg-elevated p-5">
          <h3 className="text-sm font-semibold text-text-secondary">
            Delivery Notes
          </h3>
          <p className="mt-2 text-sm italic text-text-primary">
            &ldquo;{order.notes}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
