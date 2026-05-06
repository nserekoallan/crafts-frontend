'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

/** Supported currency codes. */
export type CurrencyCode = 'UGX' | 'USD';

const FALLBACK_RATE = 3700;
const STORAGE_KEY = 'crafts-currency';

interface FxRateResponse {
  data: { usdToUgx: number; updatedAt: string; source: 'live' | 'fallback' };
}

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
  /** Live USD→UGX rate (built-in fallback when the FX endpoint hasn't returned yet). */
  usdToUgx: number;
  /** ISO timestamp the rate was last refreshed; null when using the built-in fallback. */
  rateUpdatedAt: string | null;
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

  const { data: fxData } = useQuery({
    queryKey: ['platform', 'fx-rate'],
    queryFn: () => api.get<FxRateResponse>('/platform/fx-rate'),
    staleTime: 60 * 60 * 1000, // 1 hour
    refetchInterval: 24 * 60 * 60 * 1000, // 24 hours
  });

  const usdToUgx = fxData?.data?.usdToUgx ?? FALLBACK_RATE;
  const rateUpdatedAt = fxData?.data?.source === 'live' ? fxData.data.updatedAt : null;

  const formatPrice = useCallback(
    (amountUgx: number): string => {
      if (currency === 'USD') {
        const usd = amountUgx / usdToUgx;
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(usd);
      }
      return `UGX ${new Intl.NumberFormat('en-UG').format(amountUgx)}`;
    },
    [currency, usdToUgx],
  );

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, usdToUgx, rateUpdatedAt }}>
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
