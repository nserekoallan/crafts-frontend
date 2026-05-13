'use client';

import { useState, useMemo, type FormEvent } from 'react';
import Link from 'next/link';
import { Search, Loader2, CheckSquare, X, Download, UserPlus } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { exportToCsv } from '@/lib/export-csv';

type RoleFilter = 'all' | 'customer' | 'artisan' | 'admin';

interface ApiUser {
  id: string;
  email: string | null;
  phone: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  profile: { firstName: string | null; lastName: string | null; avatar: string | null } | null;
}

interface UsersResponse {
  data: ApiUser[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

function displayName(user: ApiUser): string {
  const first = user.profile?.firstName ?? '';
  const last = user.profile?.lastName ?? '';
  const name = `${first} ${last}`.trim();
  return name || user.email || user.phone || 'Unknown';
}

// ---------------------------------------------------------------------------
// Create Staff Dialog
// ---------------------------------------------------------------------------

interface CreateStaffResult {
  userId: string;
  tempPassword: string;
}

function CreateStaffDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'QC_INSPECTOR'>('ADMIN');
  const [result, setResult] = useState<CreateStaffResult | null>(null);
  const [formError, setFormError] = useState('');

  const { mutate: createStaff, isPending } = useMutation({
    mutationFn: () =>
      api.post<{ data: CreateStaffResult }>('/users/admin/create-staff', { name, email, role }).then((r) => r.data),
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (err) => {
      setFormError(err instanceof ApiError ? err.message : 'Failed to create staff account.');
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError('');
    createStaff();
  }

  function handleClose() {
    setName(''); setEmail(''); setRole('ADMIN'); setResult(null); setFormError('');
    onClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} title="Create Staff Account" className="max-w-md">
      {result ? (
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
            <p className="text-sm font-semibold text-emerald-400 mb-2">Account created successfully</p>
            <p className="text-xs text-text-secondary">Share these credentials with the staff member securely. The temporary password will not be shown again.</p>
          </div>
          <div className="space-y-2 rounded-lg border border-border-dark bg-bg-surface p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">Email</span>
              <span className="font-medium text-text-primary">{email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Temp password</span>
              <span className="font-mono font-semibold text-gold">{result.tempPassword}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Role</span>
              <span className="font-medium text-text-primary">{role}</span>
            </div>
          </div>
          <div className="flex justify-end">
            <Button variant="primary" onClick={handleClose}>Done</Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary" htmlFor="cs-name">Full Name</label>
            <Input id="cs-name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1" placeholder="Jane Doe" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary" htmlFor="cs-email">Email</label>
            <Input id="cs-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1" placeholder="jane@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary" htmlFor="cs-role">Role</label>
            <Select
              id="cs-role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'ADMIN' | 'QC_INSPECTOR')}
              className="mt-1"
            >
              <option value="ADMIN">Admin</option>
              <option value="QC_INSPECTOR">QC Inspector</option>
            </Select>
          </div>
          {formError && <p className="text-sm text-red-400">{formError}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={handleClose} disabled={isPending}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={isPending}>
              {isPending ? 'Creating…' : 'Create Account'}
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function UsersPage() {
  const queryClient = useQueryClient();
  const { user: authUser } = useAuth();
  const isSuperAdmin = authUser?.role === 'super_admin';
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showCreateStaff, setShowCreateStaff] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'users', roleFilter, searchQuery],
    queryFn: () => {
      const params = new URLSearchParams({ limit: '50' });
      if (roleFilter !== 'all') params.set('role', roleFilter);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      return api.get<UsersResponse>(`/users?${params}`);
    },
  });

  const { mutate: toggleStatus, isPending: isToggling } = useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      api.patch(`/users/${userId}/status`, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });

  const { mutate: bulkAction, isPending: isBulkPending } = useMutation({
    mutationFn: (action: 'suspend' | 'activate') =>
      api.patch('/users/bulk', { ids: Array.from(selected), action }),
    onSuccess: () => {
      setSelected(new Set());
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });

  const users: ApiUser[] = data?.data ?? [];
  const total = data?.meta?.total ?? 0;

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase();
    return users.filter((u) => {
      const name = displayName(u).toLowerCase();
      const email = (u.email ?? '').toLowerCase();
      const phone = (u.phone ?? '').toLowerCase();
      return name.includes(q) || email.includes(q) || phone.includes(q);
    });
  }, [users, searchQuery]);

  const allVisibleIds = filteredUsers.map((u) => u.id);
  const allSelected = allVisibleIds.length > 0 && allVisibleIds.every((id) => selected.has(id));
  const someSelected = selected.size > 0;

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(allVisibleIds));
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  function handleExport() {
    exportToCsv(
      'users.csv',
      ['Name', 'Email', 'Phone', 'Role', 'Status', 'Joined Date'],
      filteredUsers.map((u) => [
        displayName(u),
        u.email ?? '',
        u.phone ?? '',
        u.role,
        u.isActive ? 'Active' : 'Suspended',
        new Date(u.createdAt).toLocaleDateString(),
      ]),
    );
  }

  return (
    <div className="space-y-6">
      <CreateStaffDialog open={showCreateStaff} onClose={() => setShowCreateStaff(false)} />

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Users</h1>
          <p className="text-text-secondary">Manage platform users</p>
        </div>
        <div className="flex items-center gap-2">
          {isSuperAdmin && (
            <button
              onClick={() => setShowCreateStaff(true)}
              className="flex items-center gap-2 rounded-lg border border-hunter-green bg-hunter-green/10 px-4 py-2 text-sm font-medium text-hunter-green transition-colors hover:bg-hunter-green/20"
            >
              <UserPlus className="h-4 w-4" />
              Create Staff Account
            </button>
          )}
          <button
            onClick={handleExport}
            disabled={filteredUsers.length === 0}
            className="flex items-center gap-2 rounded-lg border border-border-dark bg-bg-elevated px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:border-gold/40 hover:text-text-primary disabled:opacity-40"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-bg-elevated rounded-xl border border-border-dark p-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-border-dark bg-bg-primary text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent placeholder:text-text-tertiary"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {(['all', 'customer', 'artisan', 'admin'] as const).map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                roleFilter === role
                  ? 'bg-hunter-green text-white'
                  : 'bg-white/[0.05] text-text-secondary hover:bg-white/[0.08]',
              )}
            >
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-hunter-green" />
        </div>
      ) : error ? (
        <div className="bg-bg-elevated rounded-xl border border-border-dark p-8 text-center text-text-secondary">
          Failed to load users.
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-text-secondary">
              Showing {filteredUsers.length} of {total} users
              {someSelected && (
                <span className="ml-2 font-medium text-gold">({selected.size} selected)</span>
              )}
            </p>
            {someSelected && (
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs text-text-tertiary">
                  <CheckSquare className="h-4 w-4" />
                  Bulk:
                </span>
                <button
                  disabled={isBulkPending}
                  onClick={() => bulkAction('suspend')}
                  className="rounded px-3 py-1 text-xs font-medium bg-red-500/15 text-red-400 hover:bg-red-500/20 disabled:opacity-50 transition-colors"
                >
                  Suspend
                </button>
                <button
                  disabled={isBulkPending}
                  onClick={() => bulkAction('activate')}
                  className="rounded px-3 py-1 text-xs font-medium bg-green-500/15 text-green-400 hover:bg-green-500/20 disabled:opacity-50 transition-colors"
                >
                  Activate
                </button>
                <button
                  onClick={() => setSelected(new Set())}
                  className="rounded p-1 text-text-tertiary hover:text-text-primary transition-colors"
                  title="Clear selection"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block bg-bg-elevated rounded-xl border border-border-dark overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-bg-surface/60">
                  <tr>
                    <th className="w-10 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleAll}
                        className="h-4 w-4 rounded accent-gold cursor-pointer"
                        title="Select all"
                      />
                    </th>
                    {['Name', 'Contact', 'Role', 'Joined', 'Status', 'Actions'].map((h) => (
                      <th
                        key={h}
                        className={cn(
                          'px-6 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider',
                          h === 'Actions' ? 'text-right' : 'text-left',
                        )}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-dark">
                  {filteredUsers.map((user) => {
                    const isChecked = selected.has(user.id);
                    return (
                    <tr key={user.id} className={cn('transition-colors', isChecked ? 'bg-gold/[0.04]' : 'hover:bg-white/[0.03]')}>
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleOne(user.id)}
                          className="h-4 w-4 rounded accent-gold cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-text-primary">
                        {displayName(user)}
                      </td>
                      <td className="px-6 py-4 text-sm text-text-secondary">
                        <div>{user.email ?? '—'}</div>
                        {user.phone && <div className="text-xs">{user.phone}</div>}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Badge
                          variant={
                            user.role === 'SUPER_ADMIN' || user.role === 'ADMIN'
                              ? 'default'
                              : user.role === 'ARTISAN'
                              ? 'pending'
                              : 'processing'
                          }
                        >
                          {user.role.toLowerCase()}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-text-secondary">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Badge variant={user.isActive ? 'delivered' : 'cancelled'}>
                          {user.isActive ? 'active' : 'suspended'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/users/${user.id}`}
                            className="rounded-md border border-border-dark px-3 py-1 text-xs font-medium text-text-secondary hover:border-gold/40 hover:text-gold transition-colors"
                          >
                            View
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isToggling}
                            onClick={() =>
                              toggleStatus({ userId: user.id, isActive: !user.isActive })
                            }
                          >
                            {user.isActive ? 'Suspend' : 'Activate'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ); })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="bg-bg-elevated rounded-xl border border-border-dark p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-text-primary mb-0.5">{displayName(user)}</div>
                    <div className="text-sm text-text-secondary truncate">
                      {user.email ?? user.phone ?? '—'}
                    </div>
                  </div>
                  <Badge variant={user.isActive ? 'delivered' : 'cancelled'}>
                    {user.isActive ? 'active' : 'suspended'}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Badge
                    variant={
                      user.role === 'SUPER_ADMIN' || user.role === 'ADMIN'
                        ? 'default'
                        : user.role === 'ARTISAN'
                        ? 'pending'
                        : 'processing'
                    }
                  >
                    {user.role.toLowerCase()}
                  </Badge>
                  <span className="text-text-secondary">
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  disabled={isToggling}
                  onClick={() => toggleStatus({ userId: user.id, isActive: !user.isActive })}
                >
                  {user.isActive ? 'Suspend' : 'Activate'}
                </Button>
              </div>
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <div className="bg-bg-elevated rounded-xl border border-border-dark p-12 text-center">
              <p className="text-text-secondary">No users found</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
