'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Mail, Phone, MapPin, ChevronDown, ChevronUp, UserPlus, CheckCircle2 } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { cn } from '@/lib/utils';

type RequestStatus = 'NEW' | 'CONTACTED' | 'INTERVIEWING' | 'APPROVED' | 'REJECTED';

interface ArtisanRequest {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  craft: string;
  region: string | null;
  story: string | null;
  status: RequestStatus;
  adminNotes: string | null;
  convertedArtisanId: string | null;
  createdAt: string;
}

interface ListResponse {
  data: ArtisanRequest[];
  meta: { total: number };
}

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'NEW', label: 'New' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'INTERVIEWING', label: 'Interviewing' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
];

const STATUS_STYLE: Record<RequestStatus, string> = {
  NEW: 'bg-blue-500/15 text-blue-400',
  CONTACTED: 'bg-amber-500/15 text-amber-400',
  INTERVIEWING: 'bg-purple-500/15 text-purple-400',
  APPROVED: 'bg-green-500/15 text-green-400',
  REJECTED: 'bg-red-500/15 text-red-400',
};

const NEXT_STATUSES: RequestStatus[] = ['NEW', 'CONTACTED', 'INTERVIEWING', 'REJECTED'];

/** Temporary password for a converted artisan; also emailed to them by the API. */
function generatePassword(): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `Cc-${rand}!A9`;
}

export default function AdminArtisanRequestsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'artisan-requests', statusFilter],
    queryFn: () => {
      const params = new URLSearchParams({ limit: '100' });
      if (statusFilter !== 'all') params.set('status', statusFilter);
      return api.get<ListResponse>(`/artisan-requests?${params}`);
    },
  });

  const requests = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-text-primary">Artisan Requests</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Applications from the public &ldquo;Become an Artisan&rdquo; form. Work each through to
          approval and convert.
        </p>
      </div>

      {/* Status filters */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              statusFilter === f.value
                ? 'border-gold bg-gold/10 text-gold'
                : 'border-border-dark text-text-secondary hover:border-gold/50 hover:text-text-primary',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-hunter-green" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-border-dark bg-bg-elevated p-8 text-center text-text-secondary">
          Failed to load applications.
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-xl border border-border-dark bg-bg-elevated p-12 text-center">
          <p className="font-medium text-text-primary">No applications</p>
          <p className="mt-1 text-sm text-text-secondary">Nothing matches this filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <RequestCard
              key={req.id}
              req={req}
              expanded={expanded === req.id}
              onToggle={() => setExpanded(expanded === req.id ? null : req.id)}
              onChanged={() => queryClient.invalidateQueries({ queryKey: ['admin', 'artisan-requests'] })}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function RequestCard({
  req,
  expanded,
  onToggle,
  onChanged,
}: {
  req: ArtisanRequest;
  expanded: boolean;
  onToggle: () => void;
  onChanged: () => void;
}) {
  const [notes, setNotes] = useState(req.adminNotes ?? '');
  const [converting, setConverting] = useState(false);
  const [businessName, setBusinessName] = useState(req.craft);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');

  const { mutate: setStatus, isPending: statusPending } = useMutation({
    mutationFn: (status: RequestStatus) =>
      api.patch(`/artisan-requests/${req.id}/status`, { status, adminNotes: notes }),
    onSuccess: onChanged,
    onError: (e) => setActionError(e instanceof ApiError ? e.message : 'Failed to update.'),
  });

  const { mutate: convert, isPending: convertPending } = useMutation({
    mutationFn: async () => {
      const [firstName, ...rest] = req.fullName.trim().split(' ');
      const lastName = rest.join(' ') || firstName;
      const password = generatePassword();
      const created = await api.post<{ data: { id: string } }>('/artisans/admin', {
        email: req.email,
        password,
        firstName,
        lastName,
        businessName: businessName.trim() || req.craft,
        region: req.region ?? undefined,
      });
      await api.patch(`/artisan-requests/${req.id}/status`, {
        status: 'APPROVED',
        adminNotes: notes,
        convertedArtisanId: created.data.id,
      });
      return password;
    },
    onSuccess: (password) => {
      setTempPassword(password);
      setConverting(false);
      onChanged();
    },
    onError: (e) => setActionError(e instanceof ApiError ? e.message : 'Conversion failed.'),
  });

  return (
    <div className="rounded-xl border border-border-dark bg-bg-elevated p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-text-primary">{req.fullName}</h3>
            <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold', STATUS_STYLE[req.status])}>
              {req.status}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-text-secondary">{req.craft}</p>
        </div>
        <button onClick={onToggle} className="shrink-0 text-text-tertiary hover:text-gold">
          {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-text-secondary">
        <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{req.email}</span>
        <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{req.phone}</span>
        {req.region && <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{req.region}</span>}
        <span className="text-text-tertiary">{new Date(req.createdAt).toLocaleDateString()}</span>
      </div>

      {expanded && (
        <div className="mt-4 space-y-4 border-t border-border-dark pt-4">
          {req.story && (
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-text-tertiary">Story</p>
              <p className="whitespace-pre-wrap text-sm text-text-secondary">{req.story}</p>
            </div>
          )}

          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-text-tertiary">Admin notes</p>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Internal notes (saved with the next status change)"
              className="w-full rounded-lg border border-border-dark bg-bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30"
            />
          </div>

          {tempPassword ? (
            <div className="flex items-start gap-2 rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-400">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                Artisan account created. Temporary password: <code className="font-mono">{tempPassword}</code>
                <p className="mt-0.5 text-xs text-text-secondary">Credentials were also emailed to the applicant.</p>
              </div>
            </div>
          ) : converting ? (
            <div className="space-y-2 rounded-lg border border-border-dark bg-bg-surface p-3">
              <label className="block text-xs font-medium uppercase tracking-wider text-text-tertiary">Business name</label>
              <input
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full rounded-lg border border-border-dark bg-bg-primary px-3 py-2 text-sm text-text-primary focus:border-gold focus:outline-none"
              />
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => convert()}
                  disabled={convertPending || !businessName.trim()}
                  className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {convertPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserPlus className="h-3.5 w-3.5" />}
                  Create artisan & approve
                </button>
                <button onClick={() => setConverting(false)} className="rounded-lg px-3 py-1.5 text-xs font-medium text-text-tertiary hover:text-text-secondary">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {NEXT_STATUSES.filter((s) => s !== req.status).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  disabled={statusPending}
                  className="rounded-lg border border-border-dark px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:border-gold hover:text-gold disabled:opacity-50"
                >
                  Mark {s.charAt(0) + s.slice(1).toLowerCase()}
                </button>
              ))}
              {req.status !== 'APPROVED' && (
                <button
                  onClick={() => { setActionError(''); setConverting(true); }}
                  className="flex items-center gap-1.5 rounded-lg bg-gold px-3 py-1.5 text-xs font-semibold text-bg-primary hover:opacity-90"
                >
                  <UserPlus className="h-3.5 w-3.5" /> Convert to artisan
                </button>
              )}
            </div>
          )}

          {actionError && <p className="text-sm text-red-400">{actionError}</p>}
        </div>
      )}
    </div>
  );
}
