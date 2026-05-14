'use client';

import { useEffect, useRef, useState } from 'react';
import { ExternalLink, Loader2, Upload } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type StoryStatus = 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';

interface ArtisanProfile {
  id: string;
  businessName: string;
  bio: string | null;
  region: string | null;
  status: 'PENDING' | 'VERIFIED' | 'SUSPENDED';
  storyStatus?: StoryStatus;
  storyNote?: string | null;
  adminRating?: number;
  documents?: ArtisanDocument[];
}

interface ArtisanDocument {
  id: string;
  type: 'NATIONAL_ID' | 'BUSINESS_LICENSE' | 'CERTIFICATE';
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  url?: string;
  createdAt: string;
}

interface NotificationPreferences {
  emailTransactional: boolean;
  emailMarketing: boolean;
  smsTransactional: boolean;
  smsMarketing: boolean;
  pushTransactional: boolean;
  pushMarketing: boolean;
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const REGIONS = [
  'Central',
  'Eastern',
  'Northern',
  'Western',
  'Kampala',
  'Nairobi',
  'Lagos',
  'Accra',
  'Nairobi',
  'Dar es Salaam',
  'Addis Ababa',
  'Kigali',
  'Other',
];

const DOCUMENT_TYPES: Array<{
  value: ArtisanDocument['type'];
  label: string;
}> = [
  { value: 'NATIONAL_ID', label: 'National ID' },
  { value: 'BUSINESS_LICENSE', label: 'Business License' },
  { value: 'CERTIFICATE', label: 'Certificate' },
];

const DOC_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
  VERIFIED: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
  REJECTED: 'bg-red-500/15 text-red-400 border border-red-500/20',
};

// ---------------------------------------------------------------------------
// Notification toggle
// ---------------------------------------------------------------------------

const NOTIF_ROWS = [
  { key: 'Transactional', label: 'Transactional', hint: 'Order updates, alerts' },
  { key: 'Marketing', label: 'Marketing', hint: 'Promotions and news' },
] as const;

const NOTIF_COLS = [
  { key: 'email', label: 'Email' },
  { key: 'sms', label: 'SMS' },
  { key: 'push', label: 'Push' },
] as const;

type NotifKey = keyof NotificationPreferences;

function notifKey(col: string, row: string): NotifKey {
  return `${col}${row}` as NotifKey;
}

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-6 w-11 rounded-full border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 disabled:opacity-40',
        checked
          ? 'border-hunter-green bg-hunter-green'
          : 'border-border-dark bg-bg-surface',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0.5',
        )}
      />
    </button>
  );
}

// ---------------------------------------------------------------------------
// Section: Business info
// ---------------------------------------------------------------------------

function BusinessInfoSection({ artisanId }: { artisanId: string }) {
  const { refreshUser } = useAuth();

  const { data: artisan, isLoading } = useQuery({
    queryKey: ['artisan', 'profile', artisanId],
    queryFn: () =>
      api.get<{ data: ArtisanProfile }>(`/artisans/${artisanId}`).then((r) => r.data),
    enabled: !!artisanId,
  });

  const [businessName, setBusinessName] = useState('');
  const [bio, setBio] = useState('');
  const [region, setRegion] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [submitStorySuccess, setSubmitStorySuccess] = useState(false);
  const [submitStoryError, setSubmitStoryError] = useState('');

  useEffect(() => {
    if (!artisan) return;
    setBusinessName(artisan.businessName ?? '');
    setBio(artisan.bio ?? '');
    setRegion(artisan.region ?? '');
  }, [artisan]);

  const queryClient = useQueryClient();

  const { mutate: saveProfile, isPending } = useMutation({
    mutationFn: (data: { businessName: string; bio: string; region: string }) =>
      api.patch('/artisans', data),
    onSuccess: () => {
      setSaveSuccess(true);
      setSaveError('');
      refreshUser();
      setTimeout(() => setSaveSuccess(false), 3000);
    },
    onError: (err) => {
      setSaveError(err instanceof ApiError ? err.message : 'Failed to save business info.');
    },
  });

  const { mutate: submitStory, isPending: isSubmittingStory } = useMutation({
    mutationFn: () => api.post('/artisans/story/submit'),
    onSuccess: () => {
      setSubmitStorySuccess(true);
      setSubmitStoryError('');
      queryClient.invalidateQueries({ queryKey: ['artisan', 'profile', artisanId] });
      setTimeout(() => setSubmitStorySuccess(false), 5000);
    },
    onError: (err) => {
      setSubmitStoryError(err instanceof ApiError ? err.message : 'Failed to submit story.');
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 animate-pulse rounded-lg bg-bg-surface/60" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-secondary">
          Business name
        </label>
        <input
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          className="w-full rounded-lg border border-border-dark bg-bg-surface px-3.5 py-2.5 text-sm text-text-primary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-secondary">
          Bio
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          placeholder="Describe your craft and story…"
          className="w-full resize-none rounded-lg border border-border-dark bg-bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
        />

        {/* Story review status */}
        <div className="mt-2 space-y-2">
          {(!artisan?.storyStatus || artisan.storyStatus === 'NONE') && (
            <p className="text-xs text-text-tertiary">
              Your story hasn&apos;t been submitted. Save your bio below and click Submit for Review.
            </p>
          )}
          {artisan?.storyStatus === 'PENDING' && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-400 border border-amber-500/20">
              Story submitted — admin will review shortly
            </span>
          )}
          {artisan?.storyStatus === 'APPROVED' && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
              Story approved and visible to buyers ✓
            </span>
          )}
          {artisan?.storyStatus === 'REJECTED' && (
            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-3 py-1 text-xs font-semibold text-red-400 border border-red-500/20">
                Story rejected{artisan.storyNote ? `: ${artisan.storyNote}` : ''}
              </span>
              <p className="text-xs text-text-tertiary">Update your bio and resubmit.</p>
            </div>
          )}

          {/* Submit button — shown when NONE or REJECTED */}
          {(!artisan?.storyStatus || artisan.storyStatus === 'NONE' || artisan.storyStatus === 'REJECTED') && (
            <div className="flex flex-col gap-1">
              <button
                onClick={() => submitStory()}
                disabled={isSubmittingStory || !bio.trim()}
                className="flex w-fit items-center gap-2 rounded-lg border border-gold/40 px-4 py-2 text-sm font-medium text-gold hover:bg-gold/10 disabled:opacity-40 transition-colors"
              >
                {isSubmittingStory && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Submit Story for Review
              </button>
              {submitStoryError && <p className="text-xs text-red-400">{submitStoryError}</p>}
              {submitStorySuccess && (
                <p className="text-xs text-emerald-400">Submitted! Admin will review shortly.</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-secondary">
          Region
        </label>
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="w-full rounded-lg border border-border-dark bg-bg-surface px-3.5 py-2.5 text-sm text-text-primary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
        >
          <option value="">— Select region —</option>
          {REGIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {saveError && <p className="text-sm text-red-400">{saveError}</p>}
      {saveSuccess && <p className="text-sm text-emerald-400">Business info saved.</p>}

      <button
        onClick={() => saveProfile({ businessName, bio, region })}
        disabled={isPending}
        className="flex items-center gap-2 rounded-lg bg-hunter-green px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        Save
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section: Documents
// ---------------------------------------------------------------------------

function DocumentsSection({ artisanId }: { artisanId: string }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingType, setUploadingType] = useState<ArtisanDocument['type'] | null>(null);
  const [uploadError, setUploadError] = useState('');

  const { data: artisan, isLoading } = useQuery({
    queryKey: ['artisan', 'profile', artisanId],
    queryFn: () =>
      api.get<{ data: ArtisanProfile }>(`/artisans/${artisanId}`).then((r) => r.data),
    enabled: !!artisanId,
  });

  const { mutate: uploadDoc, isPending: isUploading } = useMutation({
    mutationFn: ({ file, type }: { file: File; type: ArtisanDocument['type'] }) => {
      const form = new FormData();
      form.append('document', file);
      form.append('type', type);
      return api.postForm('/artisans/documents', form);
    },
    onSuccess: () => {
      setUploadError('');
      setUploadingType(null);
      queryClient.invalidateQueries({ queryKey: ['artisan', 'profile', artisanId] });
    },
    onError: (err) => {
      setUploadError(err instanceof ApiError ? err.message : 'Upload failed.');
      setUploadingType(null);
    },
  });

  function handleUploadClick(type: ArtisanDocument['type']) {
    setUploadingType(type);
    setUploadError('');
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('data-type', type);
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const type = e.target.getAttribute('data-type') as ArtisanDocument['type'] | null;
    if (!file || !type) return;

    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setUploadError('File exceeds 10 MB limit.');
      setUploadingType(null);
      return;
    }

    uploadDoc({ file, type });
  }

  const documents = artisan?.documents ?? [];

  // Group docs by type to show latest per type
  const docsByType = DOCUMENT_TYPES.reduce<Record<string, ArtisanDocument | undefined>>(
    (acc, { value }) => {
      const found = documents
        .filter((d) => d.type === value)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
      acc[value] = found;
      return acc;
    },
    {},
  );

  return (
    <div className="space-y-4">
      <p className="text-sm text-text-tertiary">
        Upload required documents for verification. Each document must be under 10 MB (JPEG, PNG, WebP, or PDF).
      </p>

      {uploadError && <p className="text-sm text-red-400">{uploadError}</p>}

      <div className="space-y-3">
        {DOCUMENT_TYPES.map(({ value, label }) => {
          const doc = docsByType[value];
          const isCurrentlyUploading = isUploading && uploadingType === value;

          return (
            <div
              key={value}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border-dark bg-bg-elevated p-4"
            >
              <div className="min-w-0">
                <p className="font-medium text-text-primary">{label}</p>
                {doc ? (
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                        DOC_STATUS_COLORS[doc.status] ?? 'bg-bg-surface text-text-primary',
                      )}
                    >
                      {doc.status}
                    </span>
                    <span className="text-xs text-text-tertiary">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ) : (
                  <p className="mt-1 text-xs text-text-tertiary">Not uploaded</p>
                )}
              </div>

              <button
                disabled={isCurrentlyUploading || isUploading}
                onClick={() => handleUploadClick(value)}
                className="flex items-center gap-2 rounded-lg border border-border-dark bg-bg-surface px-3.5 py-2 text-sm font-medium text-text-secondary transition-colors hover:border-gold hover:text-gold disabled:opacity-50"
              >
                {isCurrentlyUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {doc ? 'Re-upload' : 'Upload'}
              </button>
            </div>
          );
        })}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section: Notifications
// ---------------------------------------------------------------------------

function NotificationsSection() {
  const queryClient = useQueryClient();

  const { data: prefs, isLoading } = useQuery({
    queryKey: ['user', 'notification-preferences'],
    queryFn: () =>
      api
        .get<{ data: NotificationPreferences }>('/users/notification-preferences')
        .then((r) => r.data),
  });

  const [local, setLocal] = useState<NotificationPreferences | null>(null);

  useEffect(() => {
    if (prefs) setLocal(prefs);
  }, [prefs]);

  const { mutate: savePrefs, isPending } = useMutation({
    mutationFn: (data: Partial<NotificationPreferences>) =>
      api.patch('/users/notification-preferences', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'notification-preferences'] });
    },
  });

  function handleToggle(key: NotifKey, value: boolean) {
    if (!local) return;
    const updated = { ...local, [key]: value };
    setLocal(updated);
    savePrefs({ [key]: value });
  }

  if (isLoading || !local) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-bg-surface/60" />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border-dark bg-bg-elevated">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border-dark">
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-tertiary">
              Category
            </th>
            {NOTIF_COLS.map((col) => (
              <th
                key={col.key}
                className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-text-tertiary"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-dark">
          {NOTIF_ROWS.map((row) => (
            <tr key={row.key} className="hover:bg-white/[0.02]">
              <td className="px-5 py-4">
                <p className="font-medium text-text-primary">{row.label}</p>
                <p className="text-xs text-text-tertiary">{row.hint}</p>
              </td>
              {NOTIF_COLS.map((col) => {
                const key = notifKey(col.key, row.key);
                return (
                  <td key={col.key} className="px-5 py-4 text-center">
                    <div className="flex justify-center">
                      <Toggle
                        checked={local[key]}
                        onChange={(v) => handleToggle(key, v)}
                        disabled={isPending}
                      />
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const VERIFICATION_BADGE: Record<
  ArtisanProfile['status'],
  { label: string; className: string }
> = {
  VERIFIED: {
    label: 'Verified ✓',
    className: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
  },
  PENDING: {
    label: 'Pending Verification',
    className: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
  },
  SUSPENDED: {
    label: 'Suspended',
    className: 'bg-red-500/15 text-red-400 border border-red-500/20',
  },
};

function StarDisplay({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < full ? 'text-amber-400' : 'text-border-dark'}>
          &#9733;
        </span>
      ))}
      <span className="ml-1 text-xs text-text-secondary">({rating.toFixed(1)})</span>
    </span>
  );
}

export default function DashboardSettingsPage() {
  const { user } = useAuth();
  const artisanId = user?.artisan?.id;

  const { data: artisan } = useQuery({
    queryKey: ['artisan', 'profile', artisanId],
    queryFn: () =>
      api.get<{ data: ArtisanProfile }>(`/artisans/${artisanId}`).then((r) => r.data),
    enabled: !!artisanId,
    staleTime: 5 * 60 * 1000,
  });

  if (!artisanId) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-hunter-green border-t-transparent" />
      </div>
    );
  }

  const badge = artisan ? VERIFICATION_BADGE[artisan.status] : null;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-text-primary md:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Manage your business profile, documents, and notifications.
        </p>
      </div>

      {/* Admin-set profile banner */}
      {artisan && badge && (
        <div className="rounded-xl border border-border-dark bg-bg-elevated p-5 mb-6">
          <p className="text-sm font-semibold text-text-primary">Your Artisan Profile</p>
          <p className="mt-0.5 text-xs text-text-tertiary">
            This information is set by the admin
          </p>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-1">
                Verification Status
              </p>
              <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', badge.className)}>
                {badge.label}
              </span>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-1">
                Admin Rating
              </p>
              {artisan.adminRating != null && artisan.adminRating > 0 ? (
                <StarDisplay rating={artisan.adminRating} />
              ) : (
                <span className="text-xs text-text-tertiary">Not rated yet</span>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-1">
                Region
              </p>
              <p className="text-sm text-text-primary">{artisan.region ?? 'Not set'}</p>
            </div>
          </div>

          <div className="mt-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-1">
              Business Name
            </p>
            <p className="text-sm text-text-primary">{artisan.businessName}</p>
          </div>

          <a
            href={`/artisans/${artisanId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-gold hover:underline"
          >
            View my public profile
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      )}

      {/* Edit profile */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-text-primary">Edit Profile</h2>
        <div className="rounded-xl border border-border-dark bg-bg-elevated p-5">
          <BusinessInfoSection artisanId={artisanId} />
        </div>
      </section>

      {/* Documents */}
      <section>
        <h2 className="mb-1 text-lg font-semibold text-text-primary">Documents</h2>
        <p className="mb-4 text-sm text-text-secondary">
          Required for artisan verification. Upload originals or clear scans.
        </p>
        <DocumentsSection artisanId={artisanId} />
      </section>

      {/* Notifications */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-text-primary">
          Notification Preferences
        </h2>
        <NotificationsSection />
      </section>
    </div>
  );
}
