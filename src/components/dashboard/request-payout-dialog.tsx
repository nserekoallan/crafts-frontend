'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, X } from 'lucide-react';
import { api, ApiError } from '@/lib/api';

interface Props {
  balance: number;
  onClose: () => void;
}

export function RequestPayoutDialog({ balance, onClose }: Props) {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: (amt: number) => api.post('/artisans/me/payouts', { amount: amt }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artisan', 'earnings'] });
      onClose();
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        const msg = (err.body as { message?: string })?.message;
        setError(msg ?? 'Failed to request payout.');
      } else {
        setError('Failed to request payout.');
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt < 10) {
      setError('Minimum payout amount is 10.');
      return;
    }
    if (amt > balance) {
      setError('Amount exceeds your available balance.');
      return;
    }
    mutate(amt);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-charcoal">Request Payout</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-light-gray transition-colors">
            <X className="h-5 w-5 text-medium-gray" />
          </button>
        </div>

        <p className="text-sm text-medium-gray mb-4">
          Available balance: <span className="font-semibold text-charcoal">UGX {balance.toLocaleString()}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">
              Amount (UGX)
            </label>
            <input
              type="number"
              min="10"
              max={balance}
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              required
              className="w-full rounded-xl border border-light-gray px-4 py-3 text-sm text-charcoal placeholder-medium-gray focus:outline-none focus:ring-2 focus:ring-hunter-green/30 focus:border-hunter-green transition-colors"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-light-gray py-3 text-sm font-medium text-charcoal hover:border-charcoal transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-hunter-green py-3 text-sm font-bold text-white hover:bg-hunter-green/90 disabled:opacity-70 transition-colors"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Request Payout
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
