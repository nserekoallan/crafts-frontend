'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, Edit2, Loader2, Phone, ShieldCheck } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { useCart } from '@/lib/cart';
import { useCurrency } from '@/lib/currency';
import type { ShippingAddress } from './shipping-step';
import type { PaymentSelection } from './payment-step';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ReviewStepProps {
  shippingAddress: ShippingAddress;
  paymentSelection: PaymentSelection;
  onEditShipping: () => void;
  onEditPayment: () => void;
}

interface OrderResponse {
  data: { id: string; orderNumber: string };
}

interface PaymentInitResponse {
  data: {
    payment: { id: string };
    checkoutUrl?: string;
    requiresRedirect: boolean;
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const METHOD_LABELS: Record<string, string> = {
  mobile_money: 'Mobile Money',
  card: 'Debit / Credit Card',
  bank_transfer: 'Bank Transfer',
  ussd: 'USSD',
};

const PROVIDER_LABELS: Record<string, string> = {
  mtn_ug: 'MTN MoMo Uganda',
  airtel_ug: 'Airtel Money Uganda',
  mpesa_ke: 'M-Pesa Kenya',
  mtn_gh: 'MTN Ghana',
};

// Maps frontend method to API-expected values
const METHOD_TO_API: Record<string, string> = {
  mobile_money: 'MOBILE_MONEY',
  card: 'CARD',
  bank_transfer: 'BANK_TRANSFER',
  ussd: 'USSD',
};

// Auto-selects provider based on method
const METHOD_TO_PROVIDER: Record<string, string> = {
  mobile_money: 'DUSUPAY',
  card: 'PAYSTACK',
  bank_transfer: 'FLUTTERWAVE',
  ussd: 'PAYSTACK',
};

function formatAddress(addr: ShippingAddress): string {
  return [addr.street, addr.city, addr.state, addr.country, addr.zip]
    .filter(Boolean)
    .join(', ');
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ReviewStep({
  shippingAddress,
  paymentSelection,
  onEditShipping,
  onEditPayment,
}: ReviewStepProps) {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const { formatPrice } = useCurrency();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Set when DusuPay mobile money STK push succeeds — no redirect, waiting for webhook. */
  const [pushPending, setPushPending] = useState<{ orderId: string; phone: string } | null>(null);

  // Poll for payment confirmation once the STK push is sent
  useEffect(() => {
    if (!pushPending) return;
    const interval = setInterval(async () => {
      try {
        const res = await api.get<{ data: { status: string } }>(`/orders/${pushPending.orderId}`);
        if (res.data.status !== 'PENDING') {
          router.push(`/orders/${pushPending.orderId}`);
        }
      } catch {
        // keep polling on transient errors
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [pushPending, router]);

  const handlePlaceOrder = useCallback(async () => {
    if (isSubmitting || items.length === 0) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Step 1: Sync localStorage cart to server
      await api.delete('/cart').catch(() => null);
      for (const item of items) {
        await api.post('/cart/items', { productId: item.id, quantity: item.quantity });
      }

      // Step 2: Create order
      const orderRes = await api.post<OrderResponse>('/orders', {
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

      const orderId = orderRes.data.id;

      // Step 3: Initialize payment
      const paymentBody: Record<string, unknown> = {
        orderId,
        provider: METHOD_TO_PROVIDER[paymentSelection.method] ?? 'PAYSTACK',
        method: METHOD_TO_API[paymentSelection.method] ?? 'CARD',
      };

      if (paymentSelection.providerCode) {
        paymentBody.providerCode = paymentSelection.providerCode;
      }
      if (paymentSelection.msisdn) {
        paymentBody.msisdn = paymentSelection.msisdn;
      }

      const paymentRes = await api.post<PaymentInitResponse>('/payments/initialize', paymentBody);

      clearCart();

      // Step 4: Redirect or show push-pending state
      if (paymentRes.data.requiresRedirect && paymentRes.data.checkoutUrl) {
        window.location.href = paymentRes.data.checkoutUrl;
      } else {
        // DusuPay mobile money STK push — prompt sent to phone
        setPushPending({ orderId, phone: paymentSelection.msisdn ?? '' });
      }
    } catch (err) {
      if (err instanceof ApiError) {
        const details = err.body.error?.details?.[0]?.message;
        setError(details ?? err.body.error?.message ?? 'Something went wrong. Please try again.');
      } else {
        setError('Something went wrong. Please try again.');
      }
      setIsSubmitting(false);
    }
  }, [isSubmitting, items, shippingAddress, paymentSelection, clearCart]);

  // ---------------------------------------------------------------------------
  // Push-pending screen
  // ---------------------------------------------------------------------------

  if (pushPending) {
    return (
      <div className="space-y-5 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold/10">
          <Phone className="h-8 w-8 text-gold" />
        </div>
        <div>
          <h2 className="font-heading text-lg font-bold text-text-primary">
            Check Your Phone
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            A payment request has been sent to{' '}
            <span className="font-semibold text-text-primary">
              {pushPending.phone || 'your mobile number'}
            </span>.
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            Enter your PIN to complete the payment. Your order will be confirmed automatically.
          </p>
        </div>

        <div className="rounded-xl border border-border-dark bg-bg-elevated p-4">
          <div className="flex items-center gap-2 text-xs text-text-tertiary">
            <div className="h-2 w-2 animate-pulse rounded-full bg-gold" />
            Waiting for payment confirmation…
          </div>
        </div>

        <button
          onClick={() => router.push(`/orders`)}
          className="inline-flex items-center gap-2 rounded-xl border border-border-dark px-6 py-3 text-sm font-medium text-text-secondary transition-colors hover:border-border-dark-hover hover:text-text-primary"
        >
          View My Orders
        </button>

        <p className="text-xs text-text-tertiary">
          Once you confirm on your phone, your order status will update automatically.
        </p>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Review screen
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-gold">
        <ShieldCheck className="h-5 w-5" />
        <h2 className="font-heading text-lg font-bold text-text-primary">Review Order</h2>
      </div>

      {/* Shipping summary */}
      <div className="rounded-xl border border-border-dark bg-bg-elevated p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text-secondary">Shipping Address</h3>
          <button
            onClick={onEditShipping}
            className="flex items-center gap-1 text-xs font-medium text-gold transition-colors hover:text-gold-light"
          >
            <Edit2 className="h-3 w-3" />
            Edit
          </button>
        </div>
        <p className="mt-2 text-sm text-text-primary">{formatAddress(shippingAddress)}</p>
        {shippingAddress.phone && (
          <p className="mt-1 text-xs text-text-tertiary">{shippingAddress.phone}</p>
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
          <h3 className="text-sm font-semibold text-text-secondary">Payment Method</h3>
          <button
            onClick={onEditPayment}
            className="flex items-center gap-1 text-xs font-medium text-gold transition-colors hover:text-gold-light"
          >
            <Edit2 className="h-3 w-3" />
            Edit
          </button>
        </div>
        <p className="mt-2 text-sm text-text-primary">
          {METHOD_LABELS[paymentSelection.method] ?? paymentSelection.method}
          {paymentSelection.providerCode && (
            <span className="ml-1 text-text-tertiary">
              — {PROVIDER_LABELS[paymentSelection.providerCode] ?? paymentSelection.providerCode}
            </span>
          )}
        </p>
        {paymentSelection.msisdn && (
          <p className="mt-1 text-xs text-text-tertiary">{paymentSelection.msisdn}</p>
        )}
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
                <p className="text-sm font-medium text-text-primary line-clamp-1">{item.name}</p>
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
            <span className="font-heading font-bold text-gold">{formatPrice(subtotal)}</span>
          </div>
          <p className="mt-1 text-xs text-text-tertiary">
            Shipping calculated after order confirmation
          </p>
        </div>
      </div>

      {/* Mobile money note */}
      {paymentSelection.method === 'mobile_money' && (
        <div className="flex items-start gap-3 rounded-xl border border-gold/20 bg-gold/5 p-3">
          <Phone className="h-4 w-4 shrink-0 text-gold mt-0.5" />
          <p className="text-xs text-text-secondary">
            After placing your order, you will receive a payment prompt on{' '}
            <span className="font-semibold">{paymentSelection.msisdn}</span>.
            Enter your PIN to complete the payment.
          </p>
        </div>
      )}

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
              Processing…
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4" />
              Place Order & Pay
            </>
          )}
        </button>
      </div>
    </div>
  );
}
