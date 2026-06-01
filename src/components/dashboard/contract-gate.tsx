'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Loader2 } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import {
  ARTISAN_CONTRACT_SECTIONS,
  ARTISAN_CONTRACT_TITLE,
  CURRENT_CONTRACT_VERSION,
} from '@/lib/artisan-contract';

interface ArtisanContractInfo {
  contractAcceptedVersion: string | null;
}

/**
 * Blocks the artisan dashboard until the current contract & terms are accepted.
 */
export function ContractGate({
  artisanId,
  children,
}: {
  artisanId: string;
  children: React.ReactNode;
}) {
  const [agreed, setAgreed] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['artisan', 'contract', artisanId],
    queryFn: () =>
      api.get<{ data: ArtisanContractInfo }>(`/artisans/${artisanId}`).then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-hunter-green" />
      </div>
    );
  }

  const accepted = data?.contractAcceptedVersion === CURRENT_CONTRACT_VERSION;
  if (accepted) return <>{children}</>;

  async function accept() {
    setError('');
    setAccepting(true);
    try {
      await api.post('/artisans/me/accept-contract', { version: CURRENT_CONTRACT_VERSION });
      await refetch();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not record your acceptance. Try again.');
    } finally {
      setAccepting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center gap-2 text-hunter-green-light">
        <FileText className="h-5 w-5" />
        <span className="text-xs font-semibold uppercase tracking-widest">Before you continue</span>
      </div>
      <h1 className="mt-2 font-heading text-2xl font-bold text-white">{ARTISAN_CONTRACT_TITLE}</h1>
      <p className="mt-1 text-sm text-white/50">Version {CURRENT_CONTRACT_VERSION}</p>

      <div className="mt-6 max-h-[55vh] space-y-5 overflow-y-auto rounded-xl border border-white/[0.08] bg-[#0D0D0D] p-5">
        {ARTISAN_CONTRACT_SECTIONS.map((s) => (
          <div key={s.heading}>
            <h2 className="text-sm font-bold text-white">{s.heading}</h2>
            <p className="mt-1 text-sm leading-relaxed text-white/60">{s.body}</p>
          </div>
        ))}
      </div>

      <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm text-white/80">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-hunter-green"
        />
        I have read and agree to the Crafts Continent Artisan Agreement and Terms.
      </label>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      <button
        onClick={accept}
        disabled={!agreed || accepting}
        className="mt-5 flex items-center gap-2 rounded-lg bg-hunter-green px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {accepting && <Loader2 className="h-4 w-4 animate-spin" />}
        Accept & continue
      </button>
    </div>
  );
}
