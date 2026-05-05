'use client';

import { useState, useMemo } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-charcoal mb-2">Users</h1>
        <p className="text-medium-gray">Manage platform users</p>
      </div>

      <div className="bg-white rounded-xl border border-light-gray p-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-medium-gray" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-hunter-green focus:border-transparent"
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
                  : 'bg-light-gray text-charcoal hover:bg-medium-gray/20',
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
        <div className="bg-white rounded-xl border border-light-gray p-8 text-center text-medium-gray">
          Failed to load users.
        </div>
      ) : (
        <>
          <div className="text-sm text-medium-gray">
            Showing {filteredUsers.length} of {total} users
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-xl border border-light-gray overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-light-gray/50">
                  <tr>
                    {['Name', 'Contact', 'Role', 'Joined', 'Status', 'Actions'].map((h) => (
                      <th
                        key={h}
                        className={cn(
                          'px-6 py-3 text-xs font-semibold text-medium-gray uppercase tracking-wider',
                          h === 'Actions' ? 'text-right' : 'text-left',
                        )}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-gray">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-light-gray/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-charcoal">
                        {displayName(user)}
                      </td>
                      <td className="px-6 py-4 text-sm text-medium-gray">
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
                      <td className="px-6 py-4 text-sm text-medium-gray">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Badge variant={user.isActive ? 'delivered' : 'cancelled'}>
                          {user.isActive ? 'active' : 'suspended'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-right">
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="bg-white rounded-xl border border-light-gray p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-charcoal mb-0.5">{displayName(user)}</div>
                    <div className="text-sm text-medium-gray truncate">
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
                  <span className="text-medium-gray">
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
            <div className="bg-white rounded-xl border border-light-gray p-12 text-center">
              <p className="text-medium-gray">No users found</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
