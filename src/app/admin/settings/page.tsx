'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Percent } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface MarkupResponse {
  markupPercent: number;
}

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const [markupInput, setMarkupInput] = useState('');
  const [saved, setSaved] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['platform', 'markup'],
    queryFn: () => api.get<{ data: MarkupResponse }>('/admin/settings/markup').then((r) => r.data),
  });

  useEffect(() => {
    if (data && !markupInput) setMarkupInput(String(data.markupPercent));
  // Pre-fill once on initial load; markupInput omitted to avoid overwriting user edits
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const currentMarkup = data?.markupPercent ?? 25;

  const mutation = useMutation({
    mutationFn: (markupPercent: number) =>
      api.patch('/admin/settings/markup', { markupPercent }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform', 'markup'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const previewPrice = markupInput
    ? Math.round(100 * (1 + parseFloat(markupInput) / 100) * 100) / 100
    : null;

  function handleSave() {
    const val = parseFloat(markupInput);
    if (isNaN(val) || val < 0 || val > 200) return;
    mutation.mutate(val);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Platform Settings</h1>
        <p className="mt-1 text-sm text-text-secondary">Configure global marketplace parameters.</p>
      </div>

      <div className="max-w-lg rounded-xl border border-border-dark bg-bg-surface p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-hunter-green/10">
            <Percent className="h-5 w-5 text-hunter-green" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-text-primary">Platform Markup</h2>
            <p className="text-xs text-text-secondary">
              The percentage added on top of the artisan's price. Currently{' '}
              <span className="font-semibold">{isLoading ? '…' : currentMarkup}%</span>.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <div>
            <label htmlFor="markup" className="block text-sm font-medium text-text-primary">
              Markup Percentage
            </label>
            <div className="relative mt-1.5">
              <Input
                id="markup"
                type="number"
                min="0"
                max="200"
                step="0.5"
                value={markupInput}
                onChange={(e) => { setMarkupInput(e.target.value); setSaved(false); }}
                placeholder={String(currentMarkup)}
                className="pr-8"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-text-tertiary">%</span>
            </div>
          </div>

          {previewPrice !== null && markupInput && (
            <div className="rounded-lg bg-hunter-green/5 px-4 py-3 text-sm">
              <span className="text-text-secondary">Example: artisan sets </span>
              <span className="font-semibold text-text-primary">$100</span>
              <span className="text-text-secondary"> → customer pays </span>
              <span className="font-semibold text-gold">${previewPrice.toFixed(2)}</span>
            </div>
          )}

          <div className="flex items-center gap-3 pt-1">
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={mutation.isPending || !markupInput}
              className="bg-hunter-green text-white hover:bg-hunter-green/90 disabled:opacity-50"
            >
              {mutation.isPending ? 'Saving…' : 'Save & Recalculate All Prices'}
            </Button>
            {saved && (
              <span className="text-sm text-gold">Saved! All product prices updated.</span>
            )}
            {mutation.isError && (
              <span className="text-sm text-red-500">Failed to save. Try again.</span>
            )}
          </div>
          <p className="text-xs text-text-tertiary">
            Saving will immediately recalculate display prices for all products on the marketplace.
          </p>
        </div>
      </div>

      <div className="max-w-lg rounded-xl border border-border-dark bg-bg-surface p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10">
            <Settings className="h-5 w-5 text-gold" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-text-primary">More Settings</h2>
            <p className="text-xs text-text-secondary">
              Manage{' '}
              <a href="/admin/shipping" className="text-gold hover:underline">shipping zones</a>,{' '}
              <a href="/admin/categories" className="text-gold hover:underline">categories</a>,{' '}
              <a href="/admin/collections" className="text-gold hover:underline">collections</a>, and{' '}
              <a href="/admin/coupons" className="text-gold hover:underline">coupons</a> from their dedicated pages.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
