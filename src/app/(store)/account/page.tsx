'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Loader2, LogOut, MapPin, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  bio: string | null;
  avatar: string | null;
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
// Notification toggle grid
// ---------------------------------------------------------------------------

const NOTIF_ROWS = [
  { key: 'Transactional', label: 'Transactional', hint: 'Order updates, receipts, security alerts' },
  { key: 'Marketing', label: 'Marketing', hint: 'Promotions, new arrivals, featured artisans' },
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
// Profile tab
// ---------------------------------------------------------------------------

function ProfileTab() {
  const { refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: () =>
      api.get<{ data: UserProfile }>('/users/profile').then((r) => r.data),
  });

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Prefill once profile loads
  useEffect(() => {
    if (!profile) return;
    setFirstName(profile.firstName ?? '');
    setLastName(profile.lastName ?? '');
    setBio(profile.bio ?? '');
    setAvatarPreview(profile.avatar ?? null);
  }, [profile]);

  const { mutate: saveProfile, isPending: isSaving } = useMutation({
    mutationFn: (data: { firstName: string; lastName: string; bio: string }) =>
      api.patch('/users/profile', data),
    onSuccess: () => {
      setSaveSuccess(true);
      setSaveError('');
      refreshUser();
      setTimeout(() => setSaveSuccess(false), 3000);
    },
    onError: (err) => {
      setSaveError(err instanceof ApiError ? err.message : 'Failed to save profile.');
    },
  });

  const { mutate: uploadAvatar, isPending: isUploading } = useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append('avatar', file);
      return api.patchForm('/users/avatar', form);
    },
    onSuccess: (res: unknown) => {
      const data = res as { data?: { avatar?: string } };
      if (data?.data?.avatar) setAvatarPreview(data.data.avatar);
      refreshUser();
    },
  });

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setAvatarPreview(preview);
    uploadAvatar(file);
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 animate-pulse rounded-lg bg-bg-surface/60" />
        ))}
      </div>
    );
  }

  const initials =
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || '?';

  return (
    <div className="space-y-6">
      {/* Avatar */}
      <div className="flex items-center gap-5">
        <div className="relative">
          <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-border-dark bg-bg-surface">
            {avatarPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarPreview}
                alt="Avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-heading text-2xl font-bold text-text-secondary">
                {initials}
              </div>
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-border-dark bg-bg-elevated text-text-secondary transition-colors hover:text-gold disabled:opacity-50"
            aria-label="Upload avatar"
          >
            {isUploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Camera className="h-3.5 w-3.5" />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
        <div>
          <p className="font-semibold text-text-primary">
            {firstName} {lastName}
          </p>
          <p className="text-sm text-text-tertiary">
            {isUploading ? 'Uploading…' : 'JPG, PNG or WebP · max 2 MB'}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">
            First name
          </label>
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full rounded-lg border border-border-dark bg-bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">
            Last name
          </label>
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full rounded-lg border border-border-dark bg-bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
          />
        </div>
      </div>

      {/* Read-only fields */}
      {profile?.email && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">
            Email <span className="text-text-tertiary">(cannot be changed)</span>
          </label>
          <input
            value={profile.email}
            readOnly
            className="w-full cursor-not-allowed rounded-lg border border-border-dark bg-bg-surface/40 px-3.5 py-2.5 text-sm text-text-tertiary"
          />
        </div>
      )}

      {profile?.phone && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">
            Phone <span className="text-text-tertiary">(cannot be changed)</span>
          </label>
          <input
            value={profile.phone}
            readOnly
            className="w-full cursor-not-allowed rounded-lg border border-border-dark bg-bg-surface/40 px-3.5 py-2.5 text-sm text-text-tertiary"
          />
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-secondary">
          Bio
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          placeholder="Tell us a bit about yourself…"
          className="w-full resize-none rounded-lg border border-border-dark bg-bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
        />
      </div>

      {saveError && (
        <p className="text-sm text-red-400">{saveError}</p>
      )}
      {saveSuccess && (
        <p className="text-sm text-emerald-400">Profile saved.</p>
      )}

      <button
        onClick={() => saveProfile({ firstName, lastName, bio })}
        disabled={isSaving}
        className="flex items-center gap-2 rounded-lg bg-hunter-green px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
        Save profile
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Notifications tab
// ---------------------------------------------------------------------------

function NotificationsTab() {
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
          <div key={i} className="h-20 animate-pulse rounded-lg bg-bg-surface/60" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-text-tertiary">
        Choose how you receive notifications for each category.
      </p>

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
    </div>
  );
}

// ---------------------------------------------------------------------------
// Security tab
// ---------------------------------------------------------------------------

function SecurityTab() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { mutate: changePassword, isPending } = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      api.patch('/users/password', data),
    onSuccess: () => {
      setSuccess(true);
      setError('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(false), 4000);
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : 'Failed to change password.');
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError("New passwords don't match.");
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    changePassword({ currentPassword, newPassword });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-text-tertiary">
        Choose a strong password with at least 8 characters.
      </p>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-secondary">
          Current Password
        </label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
          className="w-full rounded-lg border border-border-dark bg-bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-secondary">
          New Password
        </label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={8}
          className="w-full rounded-lg border border-border-dark bg-bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-secondary">
          Confirm New Password
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="w-full rounded-lg border border-border-dark bg-bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
        />
        {confirmPassword && newPassword !== confirmPassword && (
          <p className="mt-1 text-xs text-red-400">Passwords don&apos;t match.</p>
        )}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {success && <p className="text-sm text-emerald-400">Password changed successfully.</p>}

      <button
        type="submit"
        disabled={isPending || !currentPassword || !newPassword || !confirmPassword}
        className="flex items-center gap-2 rounded-lg bg-hunter-green px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        Change Password
      </button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Addresses tab
// ---------------------------------------------------------------------------

interface SavedAddress {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  region: string;
  isDefault: boolean;
}

interface AddressFormState {
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  region: string;
  isDefault: boolean;
}

const EMPTY_FORM: AddressFormState = {
  label: '',
  fullName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  region: '',
  isDefault: false,
};

const UGANDA_REGIONS = [
  'Kampala',
  'Central',
  'Eastern',
  'Northern',
  'Western',
  'Buganda',
  'Busoga',
  'Bukedi',
  'Bugisu',
  'Teso',
  'Karamoja',
  'Lango',
  'Acholi',
  'West Nile',
  'Bunyoro',
  'Tooro',
  'Ankole',
  'Kigezi',
] as const;

const LABEL_SUGGESTIONS = ['Home', 'Work', 'Other'];

function AddressForm({
  initial,
  onSave,
  onCancel,
  isPending,
}: {
  initial: AddressFormState;
  onSave: (data: AddressFormState) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [form, setForm] = useState<AddressFormState>(initial);

  function set(field: keyof AddressFormState, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const inputCls =
    'w-full rounded-lg border border-border-dark bg-bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20';

  return (
    <div className="space-y-4 rounded-xl border border-border-dark bg-bg-elevated p-5">
      {/* Label */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-secondary">Label</label>
        <div className="flex gap-2">
          <input
            value={form.label}
            onChange={(e) => set('label', e.target.value)}
            placeholder="Home, Work, Other…"
            className={inputCls}
          />
          <div className="flex gap-1">
            {LABEL_SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => set('label', s)}
                className={cn(
                  'rounded-lg border px-3 py-2 text-xs font-medium transition-colors',
                  form.label === s
                    ? 'border-gold bg-gold/10 text-gold'
                    : 'border-border-dark text-text-secondary hover:text-text-primary',
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Full name + phone */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">Full Name</label>
          <input
            value={form.fullName}
            onChange={(e) => set('fullName', e.target.value)}
            placeholder="John Doe"
            className={inputCls}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">Phone</label>
          <input
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
            placeholder="+256 700 123456"
            className={inputCls}
          />
        </div>
      </div>

      {/* Address lines */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-secondary">Address Line 1</label>
        <input
          value={form.addressLine1}
          onChange={(e) => set('addressLine1', e.target.value)}
          placeholder="Street address"
          className={inputCls}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-secondary">
          Address Line 2 <span className="text-text-tertiary">(optional)</span>
        </label>
        <input
          value={form.addressLine2}
          onChange={(e) => set('addressLine2', e.target.value)}
          placeholder="Apartment, floor, etc."
          className={inputCls}
        />
      </div>

      {/* City + Region */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">City</label>
          <input
            value={form.city}
            onChange={(e) => set('city', e.target.value)}
            placeholder="Kampala"
            className={inputCls}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">Region</label>
          <select
            value={form.region}
            onChange={(e) => set('region', e.target.value)}
            className={inputCls}
          >
            <option value="">Select region…</option>
            {UGANDA_REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Default checkbox */}
      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={form.isDefault}
          onChange={(e) => set('isDefault', e.target.checked)}
          className="h-4 w-4 rounded accent-gold"
        />
        <span className="text-sm text-text-primary">Set as default address</span>
      </label>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => onSave(form)}
          disabled={isPending || !form.label || !form.fullName || !form.addressLine1 || !form.city || !form.region}
          className="flex items-center gap-2 rounded-lg bg-hunter-green px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Save Address
        </button>
        <button
          onClick={onCancel}
          disabled={isPending}
          className="rounded-lg border border-border-dark px-5 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function AddressesTab() {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<'list' | 'add' | 'edit'>('list');
  const [editTarget, setEditTarget] = useState<SavedAddress | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data: addresses, isLoading } = useQuery<SavedAddress[]>({
    queryKey: ['user', 'addresses'],
    queryFn: () =>
      api.get<{ data: SavedAddress[] }>('/users/addresses').then((r) => r.data),
  });

  const { mutate: createAddress, isPending: isCreating } = useMutation({
    mutationFn: (data: AddressFormState) =>
      api.post('/users/addresses', {
        label: data.label,
        fullName: data.fullName,
        phone: data.phone,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2 || undefined,
        city: data.city,
        region: data.region,
        isDefault: data.isDefault,
      }),
    onSuccess: () => {
      setMode('list');
      queryClient.invalidateQueries({ queryKey: ['user', 'addresses'] });
    },
  });

  const { mutate: updateAddress, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddressFormState }) =>
      api.patch(`/users/addresses/${id}`, {
        label: data.label,
        fullName: data.fullName,
        phone: data.phone,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2 || undefined,
        city: data.city,
        region: data.region,
        isDefault: data.isDefault,
      }),
    onSuccess: () => {
      setMode('list');
      setEditTarget(null);
      queryClient.invalidateQueries({ queryKey: ['user', 'addresses'] });
    },
  });

  const { mutate: deleteAddress, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => api.delete(`/users/addresses/${id}`),
    onSuccess: () => {
      setDeleteConfirm(null);
      queryClient.invalidateQueries({ queryKey: ['user', 'addresses'] });
    },
  });

  const { mutate: setDefault, isPending: isSettingDefault } = useMutation({
    mutationFn: (id: string) => api.patch(`/users/addresses/${id}/default`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'addresses'] });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-bg-surface/60" />
        ))}
      </div>
    );
  }

  if (mode === 'add') {
    return (
      <AddressForm
        initial={EMPTY_FORM}
        onSave={(data) => createAddress(data)}
        onCancel={() => setMode('list')}
        isPending={isCreating}
      />
    );
  }

  if (mode === 'edit' && editTarget) {
    const initial: AddressFormState = {
      label: editTarget.label,
      fullName: editTarget.fullName,
      phone: editTarget.phone,
      addressLine1: editTarget.addressLine1,
      addressLine2: editTarget.addressLine2 ?? '',
      city: editTarget.city,
      region: editTarget.region,
      isDefault: editTarget.isDefault,
    };
    return (
      <AddressForm
        initial={initial}
        onSave={(data) => updateAddress({ id: editTarget.id, data })}
        onCancel={() => { setMode('list'); setEditTarget(null); }}
        isPending={isUpdating}
      />
    );
  }

  const list = addresses ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-tertiary">
          {list.length === 0 ? 'No saved addresses yet.' : `${list.length} saved address${list.length !== 1 ? 'es' : ''}`}
        </p>
        <button
          onClick={() => setMode('add')}
          className="flex items-center gap-1.5 rounded-lg bg-hunter-green/10 px-4 py-2 text-sm font-semibold text-hunter-green transition-colors hover:bg-hunter-green/20"
        >
          <Plus className="h-4 w-4" />
          Add New Address
        </button>
      </div>

      {list.map((addr) => (
        <div
          key={addr.id}
          className={cn(
            'rounded-xl border bg-bg-elevated p-5',
            addr.isDefault ? 'border-gold/30' : 'border-border-dark',
          )}
        >
          <div className="mb-2 flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-text-tertiary" />
              <span className="text-sm font-semibold text-text-primary">{addr.label}</span>
              {addr.isDefault && (
                <span className="flex items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 text-xs font-semibold text-gold">
                  <Star className="h-3 w-3" />
                  Default
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {!addr.isDefault && (
                <button
                  onClick={() => setDefault(addr.id)}
                  disabled={isSettingDefault}
                  className="rounded px-2 py-1 text-xs text-text-tertiary transition-colors hover:text-gold disabled:opacity-40"
                >
                  Set as Default
                </button>
              )}
              <button
                onClick={() => { setEditTarget(addr); setMode('edit'); }}
                className="rounded p-1.5 text-text-tertiary transition-colors hover:text-text-primary"
                aria-label="Edit address"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setDeleteConfirm(addr.id)}
                className="rounded p-1.5 text-text-tertiary transition-colors hover:text-red-400"
                aria-label="Delete address"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="space-y-0.5 text-sm text-text-secondary">
            <p className="font-medium text-text-primary">{addr.fullName}</p>
            <p>{addr.phone}</p>
            <p>{addr.addressLine1}</p>
            {addr.addressLine2 && <p>{addr.addressLine2}</p>}
            <p>{addr.city}, {addr.region}</p>
          </div>

          {deleteConfirm === addr.id && (
            <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
              <p className="text-sm text-red-400">Delete this address?</p>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => deleteAddress(addr.id)}
                  disabled={isDeleting}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting…' : 'Delete'}
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="rounded-lg border border-border-dark px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const TABS = ['Profile', 'Notifications', 'Addresses', 'Security'] as const;
type Tab = (typeof TABS)[number];

export default function AccountPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('Profile');

  function handleLogout() {
    logout();
    router.replace('/');
  }

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login?redirect=/account');
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || (!isAuthenticated && !authLoading)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-hunter-green border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">My Account</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Manage your profile and notification preferences.
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="flex shrink-0 items-center gap-2 rounded-lg border border-error/30 px-4 py-2 text-sm font-medium text-error transition-colors hover:border-error/50 hover:bg-error/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error/40"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>

      {/* Tab bar */}
      <div className="mt-6 flex gap-1 rounded-xl border border-border-dark bg-bg-elevated p-1">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              activeTab === tab
                ? 'bg-hunter-green text-white'
                : 'text-text-secondary hover:text-text-primary',
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="mt-6">
        {activeTab === 'Profile' ? (
          <ProfileTab />
        ) : activeTab === 'Notifications' ? (
          <NotificationsTab />
        ) : activeTab === 'Addresses' ? (
          <AddressesTab />
        ) : (
          <SecurityTab />
        )}
      </div>
    </div>
  );
}
