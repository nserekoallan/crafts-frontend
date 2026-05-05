'use client';

import { useCallback, useState } from 'react';
import { MapPin } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ShippingAddress {
  street: string;
  city: string;
  country: string;
  state: string;
  zip: string;
  phone: string;
  notes: string;
}

interface ShippingStepProps {
  initial: ShippingAddress;
  onContinue: (address: ShippingAddress) => void;
}

interface FieldErrors {
  street?: string;
  city?: string;
  country?: string;
  phone?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const AFRICAN_COUNTRIES = [
  'Uganda',
  'Kenya',
  'Tanzania',
  'Rwanda',
  'Ethiopia',
  'Nigeria',
  'Ghana',
  'South Africa',
  'Cameroon',
  'Senegal',
  'DR Congo',
  'Mozambique',
  'Zimbabwe',
  'Zambia',
  'Mali',
  'Ivory Coast',
  'Madagascar',
  'Angola',
  'Morocco',
  'Egypt',
  'Tunisia',
  'Algeria',
  'Botswana',
  'Namibia',
  'Malawi',
] as const;

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/**
 * Validates the shipping address form and returns field-level errors.
 */
function validateAddress(address: ShippingAddress): FieldErrors {
  const errors: FieldErrors = {};

  if (!address.street.trim()) {
    errors.street = 'Street address is required';
  }
  if (!address.city.trim()) {
    errors.city = 'City is required';
  }
  if (!address.country.trim()) {
    errors.country = 'Country is required';
  }
  if (address.phone && !/^\+?[\d\s-]{7,15}$/.test(address.phone.trim())) {
    errors.phone = 'Enter a valid phone number';
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Shipping address form step in the checkout wizard.
 */
export function ShippingStep({ initial, onContinue }: ShippingStepProps) {
  const [form, setForm] = useState<ShippingAddress>(initial);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const updateField = useCallback(
    (field: keyof ShippingAddress, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      if (errors[field as keyof FieldErrors]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors],
  );

  const handleBlur = useCallback(
    (field: keyof ShippingAddress) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      const fieldErrors = validateAddress(form);
      if (fieldErrors[field as keyof FieldErrors]) {
        setErrors((prev) => ({
          ...prev,
          [field]: fieldErrors[field as keyof FieldErrors],
        }));
      }
    },
    [form],
  );

  const handleSubmit = useCallback(() => {
    const fieldErrors = validateAddress(form);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      setTouched({ street: true, city: true, country: true, phone: true });
      return;
    }
    onContinue(form);
  }, [form, onContinue]);

  const inputClasses =
    'h-12 w-full rounded-xl border bg-bg-surface px-4 text-sm text-text-primary placeholder:text-text-tertiary outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold/30';

  const errorBorder = 'border-error/60';
  const normalBorder = 'border-border-dark';

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-gold">
        <MapPin className="h-5 w-5" />
        <h2 className="font-heading text-lg font-bold text-text-primary">
          Shipping Address
        </h2>
      </div>

      {/* Street */}
      <div>
        <label
          htmlFor="street"
          className="mb-1.5 block text-sm font-medium text-text-secondary"
        >
          Street Address <span className="text-error">*</span>
        </label>
        <input
          id="street"
          type="text"
          placeholder="123 Market Street"
          value={form.street}
          onChange={(e) => updateField('street', e.target.value)}
          onBlur={() => handleBlur('street')}
          className={`${inputClasses} ${touched.street && errors.street ? errorBorder : normalBorder}`}
        />
        {touched.street && errors.street && (
          <p className="mt-1 text-xs text-error">{errors.street}</p>
        )}
      </div>

      {/* City + Country */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="city"
            className="mb-1.5 block text-sm font-medium text-text-secondary"
          >
            City <span className="text-error">*</span>
          </label>
          <input
            id="city"
            type="text"
            placeholder="Kampala"
            value={form.city}
            onChange={(e) => updateField('city', e.target.value)}
            onBlur={() => handleBlur('city')}
            className={`${inputClasses} ${touched.city && errors.city ? errorBorder : normalBorder}`}
          />
          {touched.city && errors.city && (
            <p className="mt-1 text-xs text-error">{errors.city}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="country"
            className="mb-1.5 block text-sm font-medium text-text-secondary"
          >
            Country <span className="text-error">*</span>
          </label>
          <select
            id="country"
            value={form.country}
            onChange={(e) => updateField('country', e.target.value)}
            onBlur={() => handleBlur('country')}
            className={`${inputClasses} ${touched.country && errors.country ? errorBorder : normalBorder}`}
          >
            {AFRICAN_COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {touched.country && errors.country && (
            <p className="mt-1 text-xs text-error">{errors.country}</p>
          )}
        </div>
      </div>

      {/* State + Zip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="state"
            className="mb-1.5 block text-sm font-medium text-text-secondary"
          >
            State / Region
          </label>
          <input
            id="state"
            type="text"
            placeholder="Central"
            value={form.state}
            onChange={(e) => updateField('state', e.target.value)}
            className={`${inputClasses} ${normalBorder}`}
          />
        </div>

        <div>
          <label
            htmlFor="zip"
            className="mb-1.5 block text-sm font-medium text-text-secondary"
          >
            ZIP / Postal Code
          </label>
          <input
            id="zip"
            type="text"
            placeholder="00100"
            value={form.zip}
            onChange={(e) => updateField('zip', e.target.value)}
            className={`${inputClasses} ${normalBorder}`}
          />
        </div>
      </div>

      {/* Phone */}
      <div>
        <label
          htmlFor="phone"
          className="mb-1.5 block text-sm font-medium text-text-secondary"
        >
          Phone Number
        </label>
        <input
          id="phone"
          type="tel"
          placeholder="+256 700 123456"
          value={form.phone}
          onChange={(e) => updateField('phone', e.target.value)}
          onBlur={() => handleBlur('phone')}
          className={`${inputClasses} ${touched.phone && errors.phone ? errorBorder : normalBorder}`}
        />
        {touched.phone && errors.phone && (
          <p className="mt-1 text-xs text-error">{errors.phone}</p>
        )}
      </div>

      {/* Notes */}
      <div>
        <label
          htmlFor="notes"
          className="mb-1.5 block text-sm font-medium text-text-secondary"
        >
          Delivery Notes
        </label>
        <textarea
          id="notes"
          rows={3}
          placeholder="Any special instructions for delivery..."
          value={form.notes}
          onChange={(e) => updateField('notes', e.target.value)}
          className={`${inputClasses} ${normalBorder} h-auto py-3`}
        />
      </div>

      {/* Continue */}
      <button
        onClick={handleSubmit}
        className="flex h-12 w-full items-center justify-center rounded-xl bg-gold text-sm font-bold text-bg-primary transition-colors hover:bg-gold-light active:scale-[0.98]"
      >
        Continue to Payment
      </button>
    </div>
  );
}
