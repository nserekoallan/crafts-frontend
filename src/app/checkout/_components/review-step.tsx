'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit2, Loader2, ShieldCheck } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { useCart } from '@/lib/cart';
import { useCurrency } from '@/lib/currency';
import type { ShippingAddress } from './shipping-step';
import type { PaymentMethod } from './payment-step';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ReviewStepProps {
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  onEditShipping: () => void;
  onEditPayment: () => void;
}

interface OrderResponse {
  data: {
    id: string;
    orderNumber: string;
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  mobile_money: 'Mobile Money',
  card: 'Debit / Credit Card',
  bank_transfer: 'Bank Transfer',
  ussd: 'USSD',
};

/**
 * Formats a shipping address into a readable string.
 */
function formatAddress(addr: ShippingAddress): string {
  const parts = [addr.street, addr.city, addr.state, addr.country, addr.zip]
    .filter(Boolean);
  return parts.join(', ');
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Order review step — shows summary and places the order.
 */
export function ReviewStep({
  shippingAddress,
  paymentMethod,
  onEditShipping,
  onEditPayment,
}: ReviewStepProps) {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const { formatPrice } = useCurrency();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePlaceOrder = useCallback(async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await api.post<OrderResponse>('/orders', {
        shippingAddress: {
          street: shippingAddress.street.trim(),
          city: shippingAddress.city.trim(),
          country: shippingAddress.country.trim(),
          state: shippingAddress.state?.trim() || undefined,
          zip: shippingAddress.zip?.trim() || undefined,
          phone: shippingAddress.phone?.trim() || undefined,
        },
        notes: shippingAddress.notes?.trim() || undefined,
      });

      clearCart();
      router.push(`/orders/${response.data.id}/success`);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.body.error.message);
      } else {
        setError('Something went wrong. Please try again.');
      }
      setIsSubmitting(false);
    }
  }, [isSubmitting, shippingAddress, clearCart, router]);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-gold">
        <ShieldCheck className="h-5 w-5" />
        <h2 className="font-heading text-lg font-bold text-text-primary">
          Review Order
        </h2>
      </div>

      {/* Shipping summary */}
      <div className="rounded-xl border border-border-dark bg-bg-elevated p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text-secondary">
            Shipping Address
          </h3>
          <button
            onClick={onEditShipping}
            className="flex items-center gap-1 text-xs font-medium text-gold transition-colors hover:text-gold-light"
          >
            <Edit2 className="h-3 w-3" />
            Edit
          </button>
        </div>
        <p className="mt-2 text-sm text-text-primary">
          {formatAddress(shippingAddress)}
        </p>
        {shippingAddress.phone && (
          <p className="mt-1 text-xs text-text-tertiary">
            {shippingAddress.phone}
          </p>
        )}
        {shippingAddress.notes && (
          <p className="mt-1 text-xs italic text-text-tertiary">
            &ldquo;{shippingAddress.notes}&rdquo;
          </p>
        )}
      </div>

      {/* Payment summary */}
      <div className="rounded-xl border border-border-dark bg-bg-elevated p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text-secondary">
            Payment Method
          </h3>
          <button
            onClick={onEditPayment}
            className="flex items-center gap-1 text-xs font-medium text-gold transition-colors hover:text-gold-light"
          >
            <Edit2 className="h-3 w-3" />
            Edit
          </button>
        </div>
        <p className="mt-2 text-sm text-text-primary">
          {PAYMENT_LABELS[paymentMethod]}
        </p>
      </div>

      {/* Items */}
      <div className="rounded-xl border border-border-dark bg-bg-elevated p-4">
        <h3 className="text-sm font-semibold text-text-secondary">
          Items ({items.length})
        </h3>
        <div className="mt-3 divide-y divide-border-dark">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.imageUrl}
                alt={item.name}
                className="h-12 w-12 shrink-0 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text-primary line-clamp-1">
                  {item.name}
                </p>
                <p className="text-xs text-text-tertiary">Qty: {item.quantity}</p>
              </div>
              <p className="shrink-0 text-sm font-semibold text-text-primary">
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 border-t border-border-dark pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Subtotal</span>
            <span className="font-heading font-bold text-gold">
              {formatPrice(subtotal)}
            </span>
          </div>
          <p className="mt-1 text-xs text-text-tertiary">
            Shipping calculated after order confirmation
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-error/30 bg-error/10 p-3">
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onEditPayment}
          disabled={isSubmitting}
          className="flex h-12 items-center justify-center gap-2 rounded-xl border border-border-dark px-6 text-sm font-medium text-text-secondary transition-colors hover:border-border-dark-hover hover:text-text-primary disabled:opacity-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <button
          onClick={handlePlaceOrder}
          disabled={isSubmitting}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-gold text-sm font-bold text-bg-primary transition-colors hover:bg-gold-light active:scale-[0.98] disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Placing Order...
            </>
          ) : (
            'Place Order'
          )}
        </button>
      </div>
    </div>
  );
}
