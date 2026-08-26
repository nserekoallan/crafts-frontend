'use client';

import { Check, X } from 'lucide-react';

/**
 * Live password rules. Must mirror RegisterDto / ResetPasswordDto in the API —
 * if these drift, users are rejected on submit for a rule the form said passed.
 */
const RULES = [
  { label: 'At least 8 characters', test: (v: string) => v.length >= 8 },
  { label: 'A lowercase letter', test: (v: string) => /[a-z]/.test(v) },
  { label: 'An uppercase letter', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'A number', test: (v: string) => /\d/.test(v) },
  { label: 'A symbol, like ! or #', test: (v: string) => /[^A-Za-z0-9]/.test(v) },
] as const;

/** True when the value satisfies every rule the API enforces. */
export function isPasswordValid(value: string): boolean {
  return RULES.every((r) => r.test(value));
}

interface PasswordRequirementsProps {
  value: string;
  /** Hide until the user starts typing, so an untouched form isn't a wall of red. */
  show?: boolean;
}

export function PasswordRequirements({ value, show = true }: PasswordRequirementsProps) {
  if (!show) return null;

  return (
    <ul className="mt-2 space-y-1" aria-live="polite">
      {RULES.map((rule) => {
        const met = rule.test(value);
        return (
          <li
            key={rule.label}
            className={`flex items-center gap-1.5 text-xs ${
              met ? 'text-success' : 'text-text-tertiary'
            }`}
          >
            {met ? (
              <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            ) : (
              <X className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            )}
            <span>{rule.label}</span>
            <span className="sr-only">{met ? '(met)' : '(not met)'}</span>
          </li>
        );
      })}
    </ul>
  );
}
