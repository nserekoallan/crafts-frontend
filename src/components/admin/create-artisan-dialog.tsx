'use client';

import { useState, type FormEvent } from 'react';
import { Check, Copy } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { apiErrorMessage } from '@/lib/api-error-message';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface CreatedArtisan {
  name: string;
  phone: string;
  password: string;
}

interface AdminCreateArtisanResponse {
  data: { temporaryPassword: string; user: { phone: string | null } };
}

// Same rule as the API: the number may be typed in any common format
// ("0700111222", "+256 700 111 222"); the API normalises it.
const PHONE_PATTERN = /^\+?[\d\s-]{7,20}$/;

export function CreateArtisanDialog({ open, onClose, onSuccess }: Props) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [bio, setBio] = useState('');
  const [region, setRegion] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<CreatedArtisan | null>(null);
  const [copied, setCopied] = useState(false);

  function reset() {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setPhoneError('');
    setBusinessName('');
    setBio('');
    setRegion('');
    setError('');
    setSubmitting(false);
    setCreated(null);
    setCopied(false);
  }

  function validatePhone(value: string): string {
    if (!value.trim()) return 'Phone number is required.';
    if (!PHONE_PATTERN.test(value.trim())) return 'Enter a valid phone number, e.g. 0700111222';
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
      const res = await api.post<AdminCreateArtisanResponse>('/artisans/admin', {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim() || undefined,
        phone: phone.trim(),
        businessName: businessName.trim(),
        bio: bio.trim() || undefined,
        region: region.trim() || undefined,
      });
      setCreated({
        name: `${firstName.trim()} ${lastName.trim()}`,
        phone: res.data.user.phone ?? phone.trim(),
        password: res.data.temporaryPassword,
      });
      onSuccess();
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not create the artisan. Check your connection and try again.'));
    } finally {
      setSubmitting(false);
    }
  }

  async function copyCredentials() {
    if (!created) return;
    try {
      await navigator.clipboard.writeText(
        `Craft Continent artisan login\nPhone: ${created.phone}\nPassword: ${created.password}`,
      );
      setCopied(true);
    } catch {
      // Clipboard blocked: the password stays on screen and is selectable.
      setError('Could not copy automatically. Select the password and copy it manually.');
    }
  }

  if (created) {
    return (
      <Dialog open={open} onClose={handleClose} title="Artisan Created" className="max-w-xl">
        <div className="mt-4 space-y-4">
          <p className="text-sm text-text-secondary">
            Share these login details with <strong className="text-text-primary">{created.name}</strong>. The
            password is shown only once.
          </p>
          <dl className="space-y-3 rounded-lg border border-border-dark bg-bg-base p-4">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">Phone</dt>
              <dd className="mt-1 font-mono text-sm text-text-primary">{created.phone}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">Password</dt>
              <dd className="mt-1 select-all font-mono text-lg tracking-wide text-text-primary">{created.password}</dd>
            </div>
          </dl>
          {error && (
            <div className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400" role="alert">{error}</div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={copyCredentials}>
              {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              {copied ? 'Copied' : 'Copy login details'}
            </Button>
            <Button type="button" variant="primary" onClick={handleClose}>
              Done
            </Button>
          </div>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={handleClose} title="Create Artisan" className="max-w-xl">
      <form onSubmit={handleSubmit} className="mt-4 space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">Account</p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-text-secondary" htmlFor="ca-firstName">First Name <span className="text-red-400">*</span></label>
              <Input id="ca-firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary" htmlFor="ca-lastName">Last Name <span className="text-red-400">*</span></label>
              <Input id="ca-lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="mt-1" />
            </div>
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
              placeholder="0700111222"
              className="mt-1"
            />
            {phoneError ? (
              <p className="mt-1 text-xs text-red-500">{phoneError}</p>
            ) : (
              <p className="mt-1 text-xs text-text-tertiary">The artisan logs in with this number.</p>
            )}
          </div>
          <div className="mt-3">
            <label className="block text-sm font-medium text-text-secondary" htmlFor="ca-email">
              Email <span className="text-text-tertiary">(optional)</span>
            </label>
            <Input id="ca-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" />
          </div>
          <p className="mt-3 text-xs text-text-tertiary">
            A password is generated automatically and shown after the artisan is created.
          </p>
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
