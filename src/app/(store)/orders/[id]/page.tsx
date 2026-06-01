'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, Clock, Package, Star, Truck, XCircle } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { api, ApiError } from '@/lib/api';
import { useCurrency } from '@/lib/currency';
import { cn } from '@/lib/utils';

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
  trackingNumber: string | null;
  trackingCarrier: string | null;
  trackingUrl: string | null;
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
    product: { id: string; name: string; imageUrl: string; slug: string };
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
// Review section (DELIVERED orders only)
// ---------------------------------------------------------------------------

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  const displayed = hovered || value;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(0)}
          aria-label={`${i} star${i !== 1 ? 's' : ''}`}
          className="p-0.5 transition-transform hover:scale-110"
        >
          <Star
            className={cn(
              'h-5 w-5 transition-colors',
              i <= displayed ? 'fill-gold text-gold' : 'fill-none text-text-tertiary',
            )}
          />
        </button>
      ))}
    </div>
  );
}

/**
 * Single review card for one order item.
 * Keeps its own state and hook calls — no hooks-in-loops problem.
 */
function ReviewCard({
  item,
}: {
  item: Order['items'][number];
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  const { data: ratingData } = useQuery({
    queryKey: ['review', 'rating', item.product.id],
    queryFn: () =>
      api
        .get<{ data: { average: number; count: number } }>(
          `/reviews/product/${item.product.id}/rating`,
        )
        .then((r) => r.data),
    staleTime: 60_000,
  });

  const hasExistingReview = (ratingData?.count ?? 0) > 0;

  const { mutate: submitReview, isPending } = useMutation({
    mutationFn: () =>
      api.post('/reviews', {
        productId: item.product.id,
        rating,
        comment: comment.trim() || undefined,
      }),
    onSuccess: () => setSubmitted(true),
    onError: (err) => {
      if (err instanceof ApiError && err.status === 409) {
        setAlreadyReviewed(true);
      }
    },
  });

  if (submitted || alreadyReviewed || hasExistingReview) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-border-dark p-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.product.imageUrl}
          alt={item.product.name}
          className="h-10 w-10 shrink-0 rounded-lg object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="line-clamp-1 text-sm font-medium text-text-primary">
            {item.product.name}
          </p>
          <p className="text-xs text-emerald-400">
            {submitted ? 'Thanks for your review!' : 'Already reviewed'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border-dark p-4">
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.product.imageUrl}
          alt={item.product.name}
          className="h-10 w-10 shrink-0 rounded-lg object-cover"
        />
        <p className="line-clamp-1 min-w-0 flex-1 text-sm font-medium text-text-primary">
          {item.product.name}
        </p>
      </div>

      <div className="mt-3">
        <StarPicker value={rating} onChange={setRating} />
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
        placeholder="Share your thoughts (optional)…"
        className="mt-3 w-full resize-none rounded-lg border border-border-dark bg-bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
      />

      <button
        onClick={() => submitReview()}
        disabled={rating === 0 || isPending}
        className="mt-3 rounded-lg bg-gold/10 px-4 py-2 text-xs font-semibold text-gold transition-colors hover:bg-gold/20 disabled:opacity-40"
      >
        Submit Review
      </button>
    </div>
  );
}

function RateYourPurchase({ items }: { items: Order['items'] }) {
  return (
    <div className="mt-4 rounded-xl border border-border-dark bg-bg-elevated p-5">
      <h3 className="text-sm font-semibold text-text-secondary">Rate Your Purchase</h3>
      <div className="mt-4 space-y-4">
        {items.map((item) => (
          <ReviewCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
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
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelSuccess, setCancelSuccess] = useState(false);

  const { mutate: cancelOrder, isPending: isCancelling } = useMutation({
    mutationFn: () => api.post(`/orders/${id}/cancel`, {}),
    onSuccess: () => {
      setOrder((prev) => prev ? { ...prev, status: 'CANCELLED' } : prev);
      setShowCancelConfirm(false);
      setCancelSuccess(true);
      setCancelError(null);
    },
    onError: () => {
      setCancelError('Failed to cancel order. Please try again.');
    },
  });

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
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 md:py-8 lg:px-8">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link
          href="/shop"
          className="flex items-center gap-1 text-sm font-medium text-text-secondary transition-colors hover:text-gold"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
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
        {['PENDING', 'PAID', 'PROCESSING', 'QC_PASSED'].includes(order.status) && !cancelSuccess && (
          <button
            onClick={() => { setShowCancelConfirm(true); setCancelError(null); }}
            className="shrink-0 rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:border-red-500/50 hover:bg-red-500/10"
          >
            Cancel Order
          </button>
        )}
      </div>

      {/* Cancel confirmation */}
      {showCancelConfirm && (
        <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <p className="text-sm text-text-primary">
            Are you sure you want to cancel this order? This cannot be undone.
          </p>
          {cancelError && (
            <p className="mt-2 text-xs text-red-400">{cancelError}</p>
          )}
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => cancelOrder()}
              disabled={isCancelling}
              className="rounded-lg bg-red-500/20 px-4 py-2 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/30 disabled:opacity-50"
            >
              {isCancelling ? 'Cancelling…' : 'Yes, Cancel Order'}
            </button>
            <button
              onClick={() => { setShowCancelConfirm(false); setCancelError(null); }}
              disabled={isCancelling}
              className="rounded-lg px-4 py-2 text-xs font-semibold text-text-tertiary transition-colors hover:text-text-secondary disabled:opacity-50"
            >
              Keep Order
            </button>
          </div>
        </div>
      )}

      {/* Cancel success toast (inline) */}
      {cancelSuccess && (
        <div className="mt-4 rounded-xl border border-border-dark bg-bg-elevated p-3 text-sm text-text-secondary">
          Order cancelled.
        </div>
      )}

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

      {/* Tracking card — shown when tracking number is set */}
      {order.trackingNumber && (
        <div className="mt-4 rounded-xl border border-hunter-green/20 bg-hunter-green/10 p-5">
          <p className="font-semibold text-text-primary">Your package is on the way</p>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
            {order.trackingCarrier && (
              <span className="text-text-secondary">
                Carrier: <span className="font-medium text-text-primary">{order.trackingCarrier}</span>
              </span>
            )}
            <span className="text-text-secondary">
              Tracking: <span className="font-mono font-medium text-text-primary">{order.trackingNumber}</span>
            </span>
          </div>
          {order.trackingUrl && (
            <a
              href={order.trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-hunter-green/30 bg-hunter-green/20 px-4 py-2 text-sm font-semibold text-text-primary transition-colors hover:bg-hunter-green/30"
            >
              Track Package →
            </a>
          )}
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

      {/* Review section — only for delivered orders */}
      {order.status === 'DELIVERED' && order.items.length > 0 && (
        <RateYourPurchase items={order.items} />
      )}
    </div>
  );
}
