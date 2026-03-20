'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

/** Supported currency codes. */
export type CurrencyCode = 'UGX' | 'USD';

const EXCHANGE_RATE = 3750;
const STORAGE_KEY = 'crafts-currency';

interface CurrencyContextValue {
  /** Active currency code. */
  currency: CurrencyCode;
  /** Switch the active currency. */
  setCurrency: (code: CurrencyCode) => void;
  /**
   * Format a UGX price into the active currency string.
   * All product prices are stored as UGX — this converts on the fly.
   */
  formatPrice: (amountUgx: number) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

/**
 * Provides currency state and formatting to the entire app.
 * Persists the user's choice in localStorage.
 */
export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>('UGX');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'USD' || stored === 'UGX') {
      setCurrencyState(stored);
    }
  }, []);

  const setCurrency = useCallback((code: CurrencyCode) => {
    setCurrencyState(code);
    localStorage.setItem(STORAGE_KEY, code);
  }, []);

  const formatPrice = useCallback(
    (amountUgx: number): string => {
      if (currency === 'USD') {
        const usd = amountUgx / EXCHANGE_RATE;
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(usd);
      }
      return `UGX ${new Intl.NumberFormat('en-UG').format(amountUgx)}`;
    },
    [currency],
  );

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}

/**
 * Hook to access currency state and formatting.
 * Must be used within a CurrencyProvider.
 */
export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return ctx;
}
