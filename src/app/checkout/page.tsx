'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, Lock, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useCart } from '@/lib/cart';
import { useCurrency } from '@/lib/currency';
import { ShippingStep, type ShippingAddress } from './_components/shipping-step';
import { PaymentStep, type PaymentMethod } from './_components/payment-step';
import { ReviewStep } from './_components/review-step';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Step = 1 | 2 | 3;

const STEP_LABELS: Record<Step, string> = {
  1: 'Shipping',
  2: 'Payment',
  3: 'Review',
};

// ---------------------------------------------------------------------------
// Progress Bar (inline — small component)
// ---------------------------------------------------------------------------

/**
 * Renders the 3-step checkout progress indicator.
 */
function ProgressBar({ current }: { current: Step }) {
  const steps: Step[] = [1, 2, 3];

  return (
    <div className="flex items-center gap-2">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                step < current
                  ? 'bg-gold text-bg-primary'
                  : step === current
                    ? 'border-2 border-gold bg-gold/10 text-gold'
                    : 'border border-border-dark bg-bg-surface text-text-tertiary'
              }`}
            >
              {step < current ? <Check className="h-4 w-4" /> : step}
            </div>
            <span
              className={`hidden text-sm font-medium sm:block ${
                step <= current ? 'text-text-primary' : 'text-text-tertiary'
              }`}
            >
              {STEP_LABELS[step]}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`h-px w-6 sm:w-10 ${
                step < current ? 'bg-gold' : 'bg-border-dark'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

/**
 * Multi-step checkout page with shipping, payment, and review steps.
 */
export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { items, subtotal, itemCount } = useCart();
  const { formatPrice } = useCurrency();

  const [step, setStep] = useState<Step>(1);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    street: '',
    city: '',
    country: 'Uganda',
    state: '',
    zip: '',
    phone: '',
    notes: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mobile_money');

  // Auth guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login?redirect=/checkout');
    }
  }, [authLoading, isAuthenticated, router]);

  // Empty cart guard
  useEffect(() => {
    if (!authLoading && isAuthenticated && items.length === 0) {
      router.replace('/shop');
    }
  }, [authLoading, isAuthenticated, items.length, router]);

  // Show nothing while loading auth or if guards will redirect
  if (authLoading || !isAuthenticated || items.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:py-8 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/cart"
            className="flex items-center gap-1 text-sm font-medium text-text-secondary transition-colors hover:text-gold"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Cart</span>
          </Link>
          <h1 className="font-heading text-xl font-bold text-text-primary md:text-2xl">
            Checkout
          </h1>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
          <Lock className="h-3.5 w-3.5" />
          Secure Checkout
        </div>
      </div>

      {/* Progress */}
      <div className="mt-4 md:mt-6">
        <ProgressBar current={step} />
      </div>

      {/* Content */}
      <div className="mt-6 grid grid-cols-1 gap-6 md:mt-8 lg:grid-cols-5 lg:gap-8">
        {/* Main form area */}
        <div className="lg:col-span-3">
          {step === 1 && (
            <ShippingStep
              initial={shippingAddress}
              onContinue={(addr) => {
                setShippingAddress(addr);
                setStep(2);
              }}
            />
          )}
          {step === 2 && (
            <PaymentStep
              initial={paymentMethod}
              onContinue={(method) => {
                setPaymentMethod(method);
                setStep(3);
              }}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <ReviewStep
              shippingAddress={shippingAddress}
              paymentMethod={paymentMethod}
              onEditShipping={() => setStep(1)}
              onEditPayment={() => setStep(2)}
            />
          )}
        </div>

        {/* Order summary sidebar */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border-dark bg-bg-elevated p-5 lg:sticky lg:top-24">
            <h3 className="flex items-center gap-2 font-heading text-base font-bold text-text-primary">
              <ShoppingBag className="h-4 w-4 text-gold" />
              Order Summary
            </h3>

            <div className="mt-4 max-h-48 space-y-3 overflow-y-auto pr-1 lg:max-h-64">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-10 w-10 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-text-primary line-clamp-1">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-text-tertiary">
                      {item.quantity} x {formatPrice(item.price)}
                    </p>
                  </div>
                  <p className="shrink-0 text-xs font-semibold text-text-primary">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2 border-t border-border-dark pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">
                  Items ({itemCount})
                </span>
                <span className="text-text-primary">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">Shipping</span>
                <span className="text-text-tertiary">Calculated later</span>
              </div>
              <div className="flex items-center justify-between border-t border-border-dark pt-2 text-base">
                <span className="font-medium text-text-primary">Total</span>
                <span className="font-heading font-bold text-gold">
                  {formatPrice(subtotal)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
