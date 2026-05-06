'use client';

import { useState, type FormEvent } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api, ApiError } from '@/lib/api';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateArtisanDialog({ open, onClose, onSuccess }: Props) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [bio, setBio] = useState('');
  const [region, setRegion] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function reset() {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setPhoneError('');
    setPassword('');
    setBusinessName('');
    setBio('');
    setRegion('');
    setError('');
    setSubmitting(false);
  }

  function validatePhone(value: string): string {
    if (!value) return 'Phone number is required.';
    if (!/^\+\d{7,15}$/.test(value)) return 'Must start with + followed by 7–15 digits.';
    return '';
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    const pErr = validatePhone(phone);
    if (pErr) {
      setPhoneError(pErr);
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/artisans/admin', {
        firstName,
        lastName,
        email,
        phone,
        password,
        businessName,
        bio: bio || undefined,
        region: region || undefined,
      });
      reset();
      onSuccess();
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        const msg = (err.body as { message?: string | string[] })?.message;
        setError(Array.isArray(msg) ? msg[0] : (msg ?? 'Failed to create artisan.'));
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} title="Create Artisan" className="max-w-xl">
      <form onSubmit={handleSubmit} className="mt-4 space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">Account</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-text-secondary" htmlFor="ca-firstName">First Name</label>
              <Input id="ca-firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary" htmlFor="ca-lastName">Last Name</label>
              <Input id="ca-lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="mt-1" />
            </div>
          </div>
          <div className="mt-3">
            <label className="block text-sm font-medium text-text-secondary" htmlFor="ca-email">Email</label>
            <Input id="ca-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1" />
          </div>
          <div className="mt-3">
            <label className="block text-sm font-medium text-text-secondary" htmlFor="ca-phone">
              Phone <span className="text-red-400">*</span>
            </label>
            <Input
              id="ca-phone"
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (phoneError) setPhoneError(validatePhone(e.target.value));
              }}
              required
              placeholder="+256700111222"
              className="mt-1"
            />
            {phoneError && (
              <p className="mt-1 text-xs text-red-500">{phoneError}</p>
            )}
          </div>
          <div className="mt-3">
            <label className="block text-sm font-medium text-text-secondary" htmlFor="ca-password">Password</label>
            <Input id="ca-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="mt-1" placeholder="Min 8 chars, upper, lower, number, symbol" />
          </div>
        </div>

        <div className="border-t border-border-dark pt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">Business</p>
          <div className="mt-3">
            <label className="block text-sm font-medium text-text-secondary" htmlFor="ca-businessName">Business Name <span className="text-red-400">*</span></label>
            <Input id="ca-businessName" value={businessName} onChange={(e) => setBusinessName(e.target.value)} required className="mt-1" />
          </div>
          <div className="mt-3">
            <label className="block text-sm font-medium text-text-secondary" htmlFor="ca-bio">Bio</label>
            <textarea
              id="ca-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border border-border-dark bg-bg-base px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </div>
          <div className="mt-3">
            <label className="block text-sm font-medium text-text-secondary" htmlFor="ca-region">Region</label>
            <Input id="ca-region" value={region} onChange={(e) => setRegion(e.target.value)} placeholder="e.g. West Africa" className="mt-1" />
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400" role="alert">{error}</div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create Artisan'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
