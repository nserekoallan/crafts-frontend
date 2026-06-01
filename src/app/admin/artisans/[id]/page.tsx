'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Star, ExternalLink } from 'lucide-react';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ArtisanDocument {
  id: string;
  type: string;
  url: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  createdAt: string;
}

interface ArtisanDetail {
  id: string;
  businessName: string;
  bio: string | null;
  region: string | null;
  status: 'PENDING' | 'VERIFIED' | 'SUSPENDED';
  adminRating: number | null;
  adminRatingNote: string | null;
  contractAcceptedVersion: string | null;
  contractAcceptedAt: string | null;
  documents: ArtisanDocument[];
  user: {
    profile: { firstName: string; lastName: string } | null;
    email: string | null;
  };
}

interface Product {
  id: string;
  name: string;
  category: { name: string };
  status: string;
  price: number;
  stock: number;
}

interface Payout {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function statusVariant(status: string) {
  if (status === 'VERIFIED' || status === 'ACTIVE' || status === 'COMPLETED') return 'delivered';
  if (status === 'SUSPENDED' || status === 'REJECTED' || status === 'FAILED') return 'cancelled';
  if (status === 'PENDING') return 'pending';
  if (status === 'PROCESSING' || status === 'APPROVED') return 'processing';
  return 'default';
}

function initials(artisan: ArtisanDetail): string {
  if (artisan.user.profile) {
    return `${artisan.user.profile.firstName[0]}${artisan.user.profile.lastName[0]}`.toUpperCase();
  }
  return artisan.businessName.slice(0, 2).toUpperCase();
}

function fullName(artisan: ArtisanDetail): string {
  if (artisan.user.profile) {
    return `${artisan.user.profile.firstName} ${artisan.user.profile.lastName}`;
  }
  return artisan.businessName;
}

function formatCurrency(v: number): string {
  return new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', maximumFractionDigits: 0 }).format(v);
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(0)}
          className="p-0.5 transition-transform hover:scale-110"
        >
          <Star
            className={cn(
              'h-5 w-5 transition-colors',
              (hovered || value) >= i ? 'fill-gold text-gold' : 'fill-transparent text-white/20',
            )}
          />
        </button>
      ))}
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

type Tab = 'products' | 'payouts' | 'documents';

function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  const TABS: { key: Tab; label: string }[] = [
    { key: 'products', label: 'Products' },
    { key: 'payouts', label: 'Payouts' },
    { key: 'documents', label: 'Documents' },
  ];
  return (
    <div className="flex border-b border-border-dark">
      {TABS.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={cn(
            'relative px-5 py-3 text-sm font-medium transition-colors',
            active === t.key ? 'text-gold' : 'text-text-secondary hover:text-text-primary',
          )}
        >
          {t.label}
          {active === t.key && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Products Tab ─────────────────────────────────────────────────────────────

function ProductsTab({ artisanId }: { artisanId: string }) {
  const { data, isLoading } = useQuery<{ data: Product[] }>({
    queryKey: ['admin', 'artisan-products', artisanId],
    queryFn: () => api.get(`/products?artisanId=${artisanId}&limit=50`),
  });
  const products = data?.data ?? [];

  if (isLoading) return <div className="p-6 text-text-secondary text-sm">Loading products…</div>;

  if (products.length === 0) {
    return <div className="p-6 text-text-secondary text-sm">No products found.</div>;
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-border-dark">
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">Name</th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">Category</th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">Status</th>
          <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-secondary">Price</th>
          <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-secondary">Stock</th>
          <th className="px-4 py-3" />
        </tr>
      </thead>
      <tbody className="divide-y divide-border-dark">
        {products.map((p) => (
          <tr key={p.id} className="hover:bg-white/[0.02]">
            <td className="px-4 py-3 font-medium text-text-primary">{p.name}</td>
            <td className="px-4 py-3 text-text-secondary">{p.category?.name ?? '—'}</td>
            <td className="px-4 py-3"><Badge variant={statusVariant(p.status)}>{p.status}</Badge></td>
            <td className="px-4 py-3 text-right text-text-secondary">{formatCurrency(p.price)}</td>
            <td className="px-4 py-3 text-right text-text-secondary">{p.stock}</td>
            <td className="px-4 py-3 text-right">
              <Link href={`/admin/products/${p.id}`} className="text-gold hover:underline text-xs">
                View
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─── Payouts Tab ─────────────────────────────────────────────────────────────

function PayoutsTab({ artisanId }: { artisanId: string }) {
  const { data, isLoading } = useQuery<{ data: Payout[] }>({
    queryKey: ['admin', 'artisan-payouts', artisanId],
    queryFn: () => api.get(`/artisans/payouts/admin?artisanId=${artisanId}&limit=50`),
  });
  const payouts = data?.data ?? [];
  const totalPaid = payouts
    .filter((p) => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  if (isLoading) return <div className="p-6 text-text-secondary text-sm">Loading payouts…</div>;

  if (payouts.length === 0) {
    return <div className="p-6 text-text-secondary text-sm">No payouts found.</div>;
  }

  return (
    <div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border-dark">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">Date</th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-secondary">Amount</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-dark">
          {payouts.map((p) => (
            <tr key={p.id} className="hover:bg-white/[0.02]">
              <td className="px-4 py-3 text-text-secondary">{new Date(p.createdAt).toLocaleDateString()}</td>
              <td className="px-4 py-3 text-right font-medium text-text-primary">{formatCurrency(Number(p.amount))}</td>
              <td className="px-4 py-3"><Badge variant={statusVariant(p.status)}>{p.status}</Badge></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-end px-4 py-3 border-t border-border-dark text-sm">
        <span className="text-text-secondary mr-2">Total Paid:</span>
        <span className="font-bold text-gold">{formatCurrency(totalPaid)}</span>
      </div>
    </div>
  );
}

// ─── Documents Tab ────────────────────────────────────────────────────────────

function DocumentsTab({
  documents,
  artisanId,
}: {
  documents: ArtisanDocument[];
  artisanId: string;
}) {
  const queryClient = useQueryClient();
  const { mutate: updateStatus, isPending } = useMutation({
    mutationFn: ({ docId, status }: { docId: string; status: string }) =>
      api.patch(`/artisans/documents/${docId}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'artisan-detail', artisanId] });
    },
  });

  if (documents.length === 0) {
    return <div className="p-6 text-text-secondary text-sm">No documents uploaded.</div>;
  }

  return (
    <div className="divide-y divide-border-dark">
      {documents.map((doc) => (
        <div key={doc.id} className="flex items-center justify-between gap-4 px-4 py-4">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-text-primary text-sm">{doc.type.replace(/_/g, ' ')}</p>
            <p className="text-xs text-text-tertiary mt-0.5">
              {new Date(doc.createdAt).toLocaleDateString()}
            </p>
          </div>
          <Badge variant={statusVariant(doc.status)}>{doc.status}</Badge>
          <a
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-secondary hover:text-gold transition-colors"
            title="Open document"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
          <div className="flex items-center gap-2">
            {doc.status !== 'VERIFIED' && (
              <button
                onClick={() => updateStatus({ docId: doc.id, status: 'VERIFIED' })}
                disabled={isPending}
                className="rounded-md border border-emerald-500/30 px-3 py-1 text-xs font-medium text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-50"
              >
                Approve
              </button>
            )}
            {doc.status !== 'REJECTED' && (
              <button
                onClick={() => updateStatus({ docId: doc.id, status: 'REJECTED' })}
                disabled={isPending}
                className="rounded-md border border-red-500/30 px-3 py-1 text-xs font-medium text-red-400 hover:bg-red-500/10 disabled:opacity-50"
              >
                Reject
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ArtisanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>('products');
  const [ratingValue, setRatingValue] = useState(0);

  const { data, isLoading, isError } = useQuery<{ data: ArtisanDetail }>({
    queryKey: ['admin', 'artisan-detail', id],
    queryFn: () => api.get(`/artisans/${id}`),
    enabled: !!id,
  });

  const artisan = data?.data;

  // Sync star rating when data loads
  if (artisan && ratingValue === 0 && artisan.adminRating) {
    setRatingValue(artisan.adminRating);
  }

  const { mutate: updateStatus, isPending: isUpdatingStatus } = useMutation({
    mutationFn: (status: string) => api.patch(`/artisans/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'artisan-detail', id] }),
  });

  const { mutate: saveRating, isPending: isSavingRating } = useMutation({
    mutationFn: (rating: number) => api.patch(`/artisans/${id}/rating`, { rating }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'artisan-detail', id] }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      </div>
    );
  }

  if (isError || !artisan) {
    return (
      <div className="py-20 text-center">
        <p className="text-red-400">Failed to load artisan.</p>
        <button onClick={() => router.back()} className="mt-4 text-sm text-text-secondary hover:text-gold">
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href="/admin/artisans"
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-gold transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Artisans
      </Link>

      {/* Header card */}
      <div className="bg-bg-elevated rounded-xl border border-border-dark p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-6">
          {/* Avatar */}
          <div className="h-16 w-16 shrink-0 rounded-xl bg-satin-gold/20 flex items-center justify-center text-xl font-bold text-satin-gold">
            {initials(artisan)}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-text-primary">{artisan.businessName}</h1>
              <Badge variant={statusVariant(artisan.status)}>{artisan.status}</Badge>
            </div>
            <p className="text-text-secondary text-sm">{fullName(artisan)}</p>
            {artisan.user.email && (
              <p className="text-text-tertiary text-sm">{artisan.user.email}</p>
            )}
            {artisan.region && (
              <p className="text-text-tertiary text-sm mt-0.5">{artisan.region}</p>
            )}
            <p className="mt-1 text-sm">
              {artisan.contractAcceptedVersion ? (
                <span className="text-green-400">
                  Contract accepted (v{artisan.contractAcceptedVersion}
                  {artisan.contractAcceptedAt
                    ? ` · ${new Date(artisan.contractAcceptedAt).toLocaleDateString()}`
                    : ''}
                  )
                </span>
              ) : (
                <span className="text-amber-400">Contract not yet accepted</span>
              )}
            </p>

            {/* Rating */}
            <div className="flex items-center gap-3 mt-4">
              <StarRating value={ratingValue} onChange={setRatingValue} />
              <button
                onClick={() => saveRating(ratingValue)}
                disabled={isSavingRating || ratingValue === 0}
                className="text-xs border border-gold/40 text-gold rounded px-3 py-1 hover:bg-gold/10 disabled:opacity-40 transition-colors"
              >
                {isSavingRating ? 'Saving…' : 'Save Rating'}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-wrap sm:flex-col sm:items-end">
            {artisan.status !== 'VERIFIED' && (
              <button
                onClick={() => updateStatus('VERIFIED')}
                disabled={isUpdatingStatus}
                className="rounded-lg border border-emerald-500/30 px-4 py-2 text-sm font-medium text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-50 transition-colors"
              >
                Activate
              </button>
            )}
            {artisan.status !== 'SUSPENDED' && (
              <button
                onClick={() => updateStatus('SUSPENDED')}
                disabled={isUpdatingStatus}
                className="rounded-lg border border-red-500/30 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 disabled:opacity-50 transition-colors"
              >
                Suspend
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-bg-elevated rounded-xl border border-border-dark overflow-hidden">
        <TabBar active={activeTab} onChange={setActiveTab} />
        <div className="overflow-x-auto">
          {activeTab === 'products' && <ProductsTab artisanId={id} />}
          {activeTab === 'payouts' && <PayoutsTab artisanId={id} />}
          {activeTab === 'documents' && (
            <DocumentsTab documents={artisan.documents} artisanId={id} />
          )}
        </div>
      </div>
    </div>
  );
}
