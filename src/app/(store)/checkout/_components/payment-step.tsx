'use client';

import { useCallback, useState } from 'react';
import { ArrowLeft, CreditCard, Landmark, Phone, Wifi } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PaymentMethod = 'mobile_money' | 'card' | 'bank_transfer' | 'ussd';

export interface PaymentSelection {
  method: PaymentMethod;
  /** DusuPay provider code e.g. "mtn_ug", "airtel_ug". Set for mobile money. */
  providerCode?: string;
  /** International phone number without +. Required for mobile money. */
  msisdn?: string;
}

interface PaymentStepProps {
  initial: PaymentSelection;
  onContinue: (selection: PaymentSelection) => void;
  onBack: () => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MOBILE_MONEY_PROVIDERS = [
  { code: 'mtn_ug', label: 'MTN MoMo', prefix: '256', hint: '256 77X XXX XXX' },
  { code: 'airtel_ug', label: 'Airtel Money', prefix: '256', hint: '256 75X XXX XXX' },
  { code: 'mpesa_ke', label: 'M-Pesa Kenya', prefix: '254', hint: '254 7XX XXX XXX' },
  { code: 'mtn_gh', label: 'MTN Ghana', prefix: '233', hint: '233 24X XXX XXX' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PaymentStep({ initial, onContinue, onBack }: PaymentStepProps) {
  const [method, setMethod] = useState<PaymentMethod>(initial.method);
  const [providerCode, setProviderCode] = useState(initial.providerCode ?? 'mtn_ug');
  const [msisdn, setMsisdn] = useState(initial.msisdn ?? '');
  const [phoneError, setPhoneError] = useState('');

  const handleContinue = useCallback(() => {
    if (method === 'mobile_money') {
      const digits = msisdn.replace(/\D/g, '');
      if (digits.length < 10 || digits.length > 15) {
        setPhoneError('Enter a valid phone number (10–15 digits, no + prefix)');
        return;
      }
      onContinue({ method, providerCode, msisdn: digits });
    } else {
      onContinue({ method });
    }
  }, [method, providerCode, msisdn, onContinue]);

  const handleMethodChange = (m: PaymentMethod) => {
    setMethod(m);
    setPhoneError('');
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-gold">
        <CreditCard className="h-5 w-5" />
        <h2 className="font-heading text-lg font-bold text-text-primary">Payment Method</h2>
      </div>

      {/* Method tiles */}
      <div className="space-y-3">
        {[
          {
            id: 'mobile_money' as PaymentMethod,
            label: 'Mobile Money',
            description: 'MTN MoMo · Airtel · M-Pesa',
            icon: <Phone className="h-5 w-5" />,
            recommended: true,
          },
          {
            id: 'card' as PaymentMethod,
            label: 'Debit / Credit Card',
            description: 'Visa, Mastercard via Paystack',
            icon: <CreditCard className="h-5 w-5" />,
          },
          {
            id: 'bank_transfer' as PaymentMethod,
            label: 'Bank Transfer',
            description: 'Direct bank payment via Flutterwave',
            icon: <Landmark className="h-5 w-5" />,
          },
          {
            id: 'ussd' as PaymentMethod,
            label: 'USSD',
            description: 'Pay via USSD code',
            icon: <Wifi className="h-5 w-5" />,
          },
        ].map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => handleMethodChange(option.id)}
            className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-colors ${
              method === option.id
                ? 'border-gold bg-gold-muted'
                : 'border-border-dark bg-bg-elevated hover:border-border-dark-hover'
            }`}
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                method === option.id ? 'bg-gold/20 text-gold' : 'bg-bg-surface text-text-tertiary'
              }`}
            >
              {option.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-text-primary">{option.label}</span>
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
                method === option.id ? 'border-gold' : 'border-text-tertiary/40'
              }`}
            >
              {method === option.id && <div className="h-2.5 w-2.5 rounded-full bg-gold" />}
            </div>
          </button>
        ))}
      </div>

      {/* Mobile money sub-fields */}
      {method === 'mobile_money' && (
        <div className="rounded-xl border border-border-dark bg-bg-elevated p-4 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
            Mobile Money Details
          </p>

          {/* Provider selector */}
          <div className="grid grid-cols-2 gap-2">
            {MOBILE_MONEY_PROVIDERS.map((p) => (
              <button
                key={p.code}
                type="button"
                onClick={() => setProviderCode(p.code)}
                className={`rounded-lg border px-3 py-2.5 text-left transition-colors ${
                  providerCode === p.code
                    ? 'border-gold bg-gold/10 text-gold'
                    : 'border-border-dark text-text-secondary hover:border-border-dark-hover'
                }`}
              >
                <span className="block text-sm font-semibold">{p.label}</span>
                <span className="block text-[11px] text-text-tertiary">{p.hint}</span>
              </button>
            ))}
          </div>

          {/* Phone number */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Phone Number
            </label>
            <input
              type="tel"
              value={msisdn}
              onChange={(e) => {
                setMsisdn(e.target.value.replace(/[^\d]/g, ''));
                setPhoneError('');
              }}
              placeholder={
                MOBILE_MONEY_PROVIDERS.find((p) => p.code === providerCode)?.hint ?? '256XXXXXXXXX'
              }
              className={`w-full rounded-xl border px-4 py-3 text-sm bg-bg-surface text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-gold/30 transition-colors ${
                phoneError ? 'border-error' : 'border-border-dark focus:border-gold'
              }`}
            />
            {phoneError && <p className="mt-1 text-xs text-error">{phoneError}</p>}
            <p className="mt-1 text-xs text-text-tertiary">
              Enter number without + prefix. You will receive a payment prompt on your phone.
            </p>
          </div>
        </div>
      )}

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
