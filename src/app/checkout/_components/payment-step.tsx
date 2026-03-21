'use client';

import { useCallback, useState } from 'react';
import { ArrowLeft, CreditCard, Landmark, Phone, Wifi } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PaymentMethod = 'mobile_money' | 'card' | 'bank_transfer' | 'ussd';

interface PaymentStepProps {
  initial: PaymentMethod;
  onContinue: (method: PaymentMethod) => void;
  onBack: () => void;
}

interface PaymentOption {
  id: PaymentMethod;
  label: string;
  description: string;
  icon: React.ReactNode;
  recommended?: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    id: 'mobile_money',
    label: 'Mobile Money',
    description: 'MTN MoMo, Airtel Money',
    icon: <Phone className="h-5 w-5" />,
    recommended: true,
  },
  {
    id: 'card',
    label: 'Debit / Credit Card',
    description: 'Visa, Mastercard',
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    id: 'bank_transfer',
    label: 'Bank Transfer',
    description: 'Direct bank payment',
    icon: <Landmark className="h-5 w-5" />,
  },
  {
    id: 'ussd',
    label: 'USSD',
    description: 'Pay via USSD code',
    icon: <Wifi className="h-5 w-5" />,
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Payment method selection step in the checkout wizard.
 */
export function PaymentStep({ initial, onContinue, onBack }: PaymentStepProps) {
  const [selected, setSelected] = useState<PaymentMethod>(initial);

  const handleContinue = useCallback(() => {
    onContinue(selected);
  }, [selected, onContinue]);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-gold">
        <CreditCard className="h-5 w-5" />
        <h2 className="font-heading text-lg font-bold text-text-primary">
          Payment Method
        </h2>
      </div>

      <div className="space-y-3">
        {PAYMENT_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setSelected(option.id)}
            className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-colors ${
              selected === option.id
                ? 'border-gold bg-gold-muted'
                : 'border-border-dark bg-bg-elevated hover:border-border-dark-hover'
            }`}
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                selected === option.id
                  ? 'bg-gold/20 text-gold'
                  : 'bg-bg-surface text-text-tertiary'
              }`}
            >
              {option.icon}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-text-primary">
                  {option.label}
                </span>
                {option.recommended && (
                  <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold">
                    Recommended
                  </span>
                )}
              </div>
              <p className="text-xs text-text-tertiary">{option.description}</p>
            </div>

            <div
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                selected === option.id
                  ? 'border-gold'
                  : 'border-text-tertiary/40'
              }`}
            >
              {selected === option.id && (
                <div className="h-2.5 w-2.5 rounded-full bg-gold" />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex h-12 items-center justify-center gap-2 rounded-xl border border-border-dark px-6 text-sm font-medium text-text-secondary transition-colors hover:border-border-dark-hover hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <button
          onClick={handleContinue}
          className="flex h-12 flex-1 items-center justify-center rounded-xl bg-gold text-sm font-bold text-bg-primary transition-colors hover:bg-gold-light active:scale-[0.98]"
        >
          Continue to Review
        </button>
      </div>
    </div>
  );
}
