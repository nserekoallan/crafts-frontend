'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
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

interface QCInspection {
  id: string;
  status: 'PENDING' | 'PASSED' | 'FAILED';
  notes: string | null;
  images: string[];
  createdAt: string;
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  artisanAmount?: number;
  platformAmount?: number;
  product: {
    id: string;
    name: string;
    imageUrl?: string;
    images?: Array<{ url: string; isDefault: boolean }>;
  };
  artisan?: { businessName: string };
  inspections?: QCInspection[];
}

interface Payment {
  id: string;
  provider: string;
  method: string | null;
  status: string;
  reference: string | null;
  amount: number;
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  shippingCost: number;
  total: number;
  currency: string;
  notes: string | null;
  createdAt: string;
  trackingNumber: string | null;
  trackingCarrier: string | null;
  trackingUrl: string | null;
  shippedAt: string | null;
  shippingAddress: {
    street: string;
    city: string;
    country: string;
    state?: string;
    zip?: string;
    notes?: string;
  } | null;
  user: {
    id: string;
    email: string | null;
    phone: string | null;
    profile?: { firstName: string; lastName: string } | null;
    firstName?: string;
    lastName?: string;
  } | null;
  items: OrderItem[];
  payments?: Payment[];
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

type StatusVariant = 'default' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

const STATUS_VARIANT: Record<string, StatusVariant> = {
  DELIVERED: 'delivered',
  SHIPPED: 'shipped',
  PROCESSING: 'processing',
  QC_PASSED: 'processing',
  PAID: 'processing',
  PENDING: 'pending',
  CANCELLED: 'cancelled',
  REFUNDED: 'cancelled',
};

const STATUS_ORDER: OrderStatus[] = [
  'PENDING', 'PAID', 'PROCESSING', 'QC_PASSED', 'SHIPPED', 'DELIVERED',
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

const QC_STATUS_COLORS: Record<string, string> = {
  PASSED: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
  FAILED: 'bg-red-500/15 text-red-400 border border-red-500/20',
  PENDING: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function customerName(user: OrderDetail['user']): string {
  if (!user) return 'Unknown';
  const first = user.firstName ?? user.profile?.firstName ?? '';
  const last = user.lastName ?? user.profile?.lastName ?? '';
  const full = `${first} ${last}`.trim();
  return full || user.email || user.phone || 'Unknown';
}

function itemThumb(item: OrderItem): string | null {
  if (item.product.imageUrl) return item.product.imageUrl;
  const def = item.product.images?.find((img) => img.isDefault);
  return def?.url ?? item.product.images?.[0]?.url ?? null;
}

// ---------------------------------------------------------------------------
// Refund dialog
// ---------------------------------------------------------------------------

const REFUNDABLE_ORDER_STATUSES: OrderStatus[] = ['PAID', 'PROCESSING', 'QC_PASSED', 'SHIPPED'];

function RefundDialog({
  orderId,
  orderTotal,
  onClose,
  onSuccess,
}: {
  orderId: string;
  orderTotal: number;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [reason, setReason] = useState('');
  const [partial, setPartial] = useState(false);
  const [amount, setAmount] = useState(String(orderTotal));
  const [apiError, setApiError] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const { mutate: processRefund, isPending } = useMutation({
    mutationFn: () =>
      api.post('/payments/refund', {
        orderId,
        reason,
        partial,
        amount: partial ? Number(amount) : undefined,
      }),
    onSuccess: () => {
      onSuccess();
      onClose();
    },
    onError: (err: unknown) => {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Failed to process refund';
      setApiError(msg);
    },
  });

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) onClose();
  };

  const canSubmit = reason.trim().length > 0 && (!partial || (Number(amount) > 0 && !isNaN(Number(amount))));

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div className="w-full max-w-md rounded-2xl border border-border-dark bg-bg-surface p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">Process Refund</h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-text-tertiary transition-colors hover:text-text-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">
              Reason <span className="text-red-400">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for the refund…"
              rows={3}
              className="w-full rounded-lg border border-border-dark bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 resize-none"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={partial}
              onChange={(e) => setPartial(e.target.checked)}
              className="h-4 w-4 rounded accent-gold"
            />
            <span className="text-sm text-text-primary">Partial refund</span>
          </label>

          {partial && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-secondary">
                Refund amount (UGX)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={1}
                className="w-full rounded-lg border border-border-dark bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
              />
            </div>
          )}

          {apiError && (
            <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {apiError}
            </p>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isPending}
            className="rounded-lg border border-border-dark px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => processRefund()}
            disabled={isPending || !canSubmit}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            {isPending ? 'Processing…' : 'Process Refund'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Status step strip
// ---------------------------------------------------------------------------

function StatusStrip({
  currentStatus,
  orderId,
}: {
  currentStatus: OrderStatus;
  orderId: string;
}) {
  const queryClient = useQueryClient();
  const { mutate: updateStatus, isPending } = useMutation({
    mutationFn: (status: string) =>
      api.patch(`/orders/${orderId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
    },
  });

  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  const isTerminal = currentStatus === 'CANCELLED' || currentStatus === 'REFUNDED';
  const nextStatuses = NEXT_STATUSES[currentStatus] ?? [];

  return (
    <div className="rounded-xl border border-border-dark bg-bg-elevated p-5">
      <h3 className="mb-4 text-sm font-semibold text-text-secondary">Order Status</h3>

      {isTerminal ? (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400">
          This order is {currentStatus.toLowerCase()}.
        </div>
      ) : (
        <>
          {/* Step strip */}
          <div className="flex gap-1">
            {STATUS_ORDER.map((step, i) => {
              const isCompleted = i <= currentIndex;
              const isCurrent = i === currentIndex;
              return (
                <div key={step} className="flex flex-1 flex-col items-center">
                  <div
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors',
                      isCompleted
                        ? 'bg-hunter-green text-white'
                        : 'border border-border-dark bg-bg-surface text-text-tertiary',
                      isCurrent && 'ring-2 ring-hunter-green/30',
                    )}
                  >
                    {i + 1}
                  </div>
                  <span
                    className={cn(
                      'mt-1.5 text-center text-[9px] font-medium leading-tight sm:text-[11px]',
                      isCompleted ? 'text-text-primary' : 'text-text-tertiary',
                    )}
                  >
                    {step.replace('_', ' ')}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="mt-3 flex gap-1">
            {STATUS_ORDER.map((step, i) => (
              <div
                key={step}
                className={cn(
                  'h-1 flex-1 rounded-full',
                  i <= currentIndex ? 'bg-hunter-green' : 'bg-bg-surface',
                )}
              />
            ))}
          </div>

          {/* Action buttons */}
          {nextStatuses.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {nextStatuses.map((s) => (
                <button
                  key={s}
                  disabled={isPending}
                  onClick={() => updateStatus(s)}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50',
                    s === 'CANCELLED'
                      ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                      : 'bg-hunter-green/10 text-hunter-green hover:bg-hunter-green/20',
                  )}
                >
                  Mark as {s.replace('_', ' ')}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// QC Inspections section
// ---------------------------------------------------------------------------

function QCSection({ items }: { items: OrderItem[] }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const itemsWithInspections = items.filter(
    (item) => item.inspections && item.inspections.length > 0,
  );

  if (itemsWithInspections.length === 0) return null;

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="rounded-xl border border-border-dark bg-bg-elevated p-5">
      <h3 className="mb-4 text-sm font-semibold text-text-secondary">QC Inspections</h3>
      <div className="space-y-3">
        {itemsWithInspections.map((item) => {
          const isOpen = expanded.has(item.id);
          return (
            <div key={item.id} className="rounded-lg border border-border-dark">
              <button
                onClick={() => toggle(item.id)}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <span className="text-sm font-medium text-text-primary">
                  {item.product.name}
                </span>
                {isOpen ? (
                  <ChevronUp className="h-4 w-4 text-text-tertiary" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-text-tertiary" />
                )}
              </button>
              {isOpen && (
                <div className="border-t border-border-dark px-4 pb-4 pt-3 space-y-3">
                  {item.inspections!.map((insp) => (
                    <div key={insp.id}>
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                            QC_STATUS_COLORS[insp.status] ?? 'bg-bg-surface text-text-primary',
                          )}
                        >
                          {insp.status}
                        </span>
                        <span className="text-xs text-text-tertiary">
                          {new Date(insp.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {insp.notes && (
                        <p className="mt-2 text-sm text-text-secondary">{insp.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tracking card
// ---------------------------------------------------------------------------

function TrackingCard({
  order,
}: {
  order: OrderDetail;
}) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingCarrier, setTrackingCarrier] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const trackable = order.status === 'SHIPPED' || order.status === 'QC_PASSED';
  if (!trackable) return null;

  const { mutate: saveTracking, isPending } = useMutation({
    mutationFn: () =>
      api.patch(`/orders/${order.id}/tracking`, {
        trackingNumber: trackingNumber.trim(),
        trackingCarrier: trackingCarrier.trim() || undefined,
        trackingUrl: trackingUrl.trim() || undefined,
      }),
    onSuccess: () => {
      setShowForm(false);
      setFormError(null);
      queryClient.invalidateQueries({ queryKey: ['admin', 'order', order.id] });
    },
    onError: (err: unknown) => {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Failed to save tracking info';
      setFormError(msg);
    },
  });

  return (
    <div className="rounded-xl border border-border-dark bg-bg-elevated p-5">
      <h3 className="mb-3 text-sm font-semibold text-text-secondary">Tracking Information</h3>

      {order.trackingNumber ? (
        <div className="space-y-2">
          <div className="grid gap-3 sm:grid-cols-2">
            {order.trackingCarrier && (
              <div>
                <p className="text-xs text-text-tertiary">Carrier</p>
                <p className="mt-0.5 font-medium text-text-primary">{order.trackingCarrier}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-text-tertiary">Tracking Number</p>
              <p className="mt-0.5 font-mono text-sm text-text-primary">{order.trackingNumber}</p>
            </div>
          </div>
          {order.trackingUrl && (
            <a
              href={order.trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gold hover:text-gold-light"
            >
              Track Package →
            </a>
          )}
        </div>
      ) : showForm ? (
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">
              Tracking Number <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="e.g. 1Z999AA10123456784"
              className="w-full rounded-lg border border-border-dark bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">
              Carrier
            </label>
            <input
              type="text"
              value={trackingCarrier}
              onChange={(e) => setTrackingCarrier(e.target.value)}
              placeholder="DHL, FedEx, Posta Uganda…"
              className="w-full rounded-lg border border-border-dark bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">
              Tracking URL
            </label>
            <input
              type="url"
              value={trackingUrl}
              onChange={(e) => setTrackingUrl(e.target.value)}
              placeholder="https://track.dhl.com/..."
              className="w-full rounded-lg border border-border-dark bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
            />
          </div>
          {formError && (
            <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {formError}
            </p>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => saveTracking()}
              disabled={isPending || !trackingNumber.trim()}
              className="rounded-lg bg-hunter-green/10 px-4 py-2 text-sm font-semibold text-hunter-green transition-colors hover:bg-hunter-green/20 disabled:opacity-50"
            >
              {isPending ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={() => { setShowForm(false); setFormError(null); }}
              disabled={isPending}
              className="rounded-lg border border-border-dark px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="rounded-lg bg-hunter-green/10 px-4 py-2 text-sm font-semibold text-hunter-green transition-colors hover:bg-hunter-green/20"
        >
          Add Tracking
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { formatPrice } = useCurrency();
  const queryClient = useQueryClient();
  const [refundOpen, setRefundOpen] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'order', id],
    queryFn: () =>
      api.get<{ data: OrderDetail }>(`/orders/${id}`).then((r) => r.data),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-12 animate-pulse rounded-xl bg-bg-surface/60" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-xl bg-bg-surface/60" />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-8 text-center text-sm text-red-400">
        Order not found or access denied.{' '}
        <Link href="/admin/orders" className="underline">
          Back to orders
        </Link>
      </div>
    );
  }

  const order = data;
  const payment = order.payments?.[0];
  const canRefund = REFUNDABLE_ORDER_STATUSES.includes(order.status);

  return (
    <div className="space-y-5">
      {refundOpen && (
        <RefundDialog
          orderId={order.id}
          orderTotal={Number(order.total)}
          onClose={() => setRefundOpen(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'order', id] });
            queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
          }}
        />
      )}
      {/* Header bar */}
      <div className="flex items-start gap-3">
        <Link
          href="/admin/orders"
          className="mt-1 flex items-center gap-1 text-sm text-text-tertiary transition-colors hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Orders
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-text-primary md:text-3xl">
            {order.orderNumber}
          </h1>
          <p className="mt-1 text-sm text-text-tertiary">
            {new Date(order.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <Badge variant={STATUS_VARIANT[order.status] ?? 'default'}>
          {order.status.replace('_', ' ')}
        </Badge>
      </div>

      {/* Status controls */}
      <StatusStrip currentStatus={order.status} orderId={order.id} />

      {/* Customer card */}
      {order.user && (
        <div className="rounded-xl border border-border-dark bg-bg-elevated p-5">
          <h3 className="mb-3 text-sm font-semibold text-text-secondary">Customer</h3>
          <p className="font-medium text-text-primary">{customerName(order.user)}</p>
          <div className="mt-1 space-y-0.5 text-sm text-text-tertiary">
            {order.user.email && <p>{order.user.email}</p>}
            {order.user.phone && <p>{order.user.phone}</p>}
          </div>
        </div>
      )}

      {/* Items table */}
      <div className="rounded-xl border border-border-dark bg-bg-elevated p-5">
        <h3 className="mb-4 text-sm font-semibold text-text-secondary">
          Items ({order.items.length})
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-dark text-left text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                <th className="pb-3 pr-4">Product</th>
                <th className="pb-3 pr-4">Artisan</th>
                <th className="pb-3 pr-4 text-center">Qty</th>
                <th className="pb-3 pr-4 text-right">Unit Price</th>
                <th className="pb-3 pr-4 text-right">Artisan</th>
                <th className="pb-3 pr-4 text-right">Platform</th>
                <th className="pb-3 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dark">
              {order.items.map((item) => {
                const thumb = itemThumb(item);
                const lineTotal = item.price * item.quantity;
                return (
                  <tr key={item.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        {thumb ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={thumb}
                            alt={item.product.name}
                            className="h-10 w-10 shrink-0 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 shrink-0 rounded-lg bg-bg-surface" />
                        )}
                        <span className="font-medium text-text-primary">
                          {item.product.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-text-secondary">
                      {item.artisan?.businessName ?? '—'}
                    </td>
                    <td className="py-3 pr-4 text-center text-text-primary">
                      {item.quantity}
                    </td>
                    <td className="py-3 pr-4 text-right text-text-primary">
                      {formatPrice(item.price)}
                    </td>
                    <td className="py-3 pr-4 text-right text-text-secondary">
                      {item.artisanAmount != null ? formatPrice(item.artisanAmount) : '—'}
                    </td>
                    <td className="py-3 pr-4 text-right text-text-secondary">
                      {item.platformAmount != null ? formatPrice(item.platformAmount) : '—'}
                    </td>
                    <td className="py-3 text-right font-semibold text-text-primary">
                      {formatPrice(lineTotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals */}
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
          <div className="flex justify-between border-t border-border-dark pt-2 text-base font-semibold">
            <span className="text-text-primary">Total</span>
            <span className="text-gold">{formatPrice(Number(order.total))}</span>
          </div>
        </div>
      </div>

      {/* Payment card */}
      {payment && (
        <div className="rounded-xl border border-border-dark bg-bg-elevated p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-secondary">Payment</h3>
            {canRefund && (
              <button
                onClick={() => setRefundOpen(true)}
                className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/20"
              >
                Process Refund
              </button>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs text-text-tertiary">Provider</p>
              <p className="mt-0.5 font-medium text-text-primary">{payment.provider}</p>
            </div>
            <div>
              <p className="text-xs text-text-tertiary">Method</p>
              <p className="mt-0.5 font-medium text-text-primary">
                {payment.method?.replace('_', ' ') ?? '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-tertiary">Status</p>
              <span
                className={cn(
                  'mt-0.5 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold',
                  payment.status === 'SUCCESS' || payment.status === 'COMPLETED'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                    : payment.status === 'FAILED'
                      ? 'bg-red-500/15 text-red-400 border border-red-500/20'
                      : 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
                )}
              >
                {payment.status}
              </span>
            </div>
            {payment.reference && (
              <div>
                <p className="text-xs text-text-tertiary">Reference</p>
                <p className="mt-0.5 font-mono text-xs text-text-secondary">
                  {payment.reference}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs text-text-tertiary">Amount</p>
              <p className="mt-0.5 font-semibold text-gold">
                {formatPrice(Number(payment.amount))}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tracking information */}
      <TrackingCard order={order} />

      {/* Shipping address */}
      {order.shippingAddress && (
        <div className="rounded-xl border border-border-dark bg-bg-elevated p-5">
          <h3 className="mb-3 text-sm font-semibold text-text-secondary">Shipping Address</h3>
          <p className="text-sm text-text-primary">
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
          {order.shippingAddress.notes && (
            <p className="mt-2 text-xs italic text-text-tertiary">
              Note: {order.shippingAddress.notes}
            </p>
          )}
        </div>
      )}

      {/* QC inspections */}
      <QCSection items={order.items} />
    </div>
  );
}
