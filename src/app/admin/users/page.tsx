'use client';

import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { MOCK_USERS } from '@/lib/mock-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type RoleFilter = 'all' | 'customer' | 'artisan' | 'admin';

/**
 * UsersPage - User management interface for administrators
 */
export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');

  /**
   * Filtered users based on search and role filter
   */
  const filteredUsers = useMemo(() => {
    return MOCK_USERS.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = roleFilter === 'all' || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [searchQuery, roleFilter]);

  /**
   * Handle user suspension toggle
   * @param {string} userId - User ID
   * @param {string} currentStatus - Current user status
   */
  const handleToggleSuspension = (userId: string, currentStatus: string) => {
    const action = currentStatus === 'active' ? 'suspend' : 'activate';
    alert(`Would ${action} user ${userId}`);
  };

  /**
   * Handle view user
   * @param {string} userId - User ID
   */
  const handleViewUser = (userId: string) => {
    alert(`View user details for ${userId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-charcoal mb-2">Users</h1>
        <p className="text-medium-gray">Manage platform users</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-light-gray p-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-medium-gray" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-hunter-green focus:border-transparent"
          />
        </div>

        {/* Role Filters */}
        <div className="flex flex-wrap gap-2">
          {(['all', 'customer', 'artisan', 'admin'] as const).map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                roleFilter === role
                  ? 'bg-hunter-green text-white'
                  : 'bg-light-gray text-charcoal hover:bg-medium-gray/20'
              )}
            >
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-medium-gray">
        Showing {filteredUsers.length} of {MOCK_USERS.length} users
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl border border-light-gray overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-light-gray/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-medium-gray uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-medium-gray uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-medium-gray uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-medium-gray uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-medium-gray uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-medium-gray uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-gray">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-light-gray/30 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-charcoal">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-medium-gray">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Badge
                      variant={
                        user.role === 'admin'
                          ? 'default'
                          : user.role === 'artisan'
                          ? 'pending'
                          : 'processing'
                      }
                    >
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-medium-gray">
                    {new Date(user.joinedDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Badge variant={user.status === 'active' ? 'delivered' : 'cancelled'}>
                      {user.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewUser(user.id)}
                    >
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleSuspension(user.id, user.status)}
                    >
                      {user.status === 'active' ? 'Suspend' : 'Activate'}
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
          <div key={user.id} className="bg-white rounded-xl border border-light-gray p-4 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-charcoal mb-1">{user.name}</div>
                <div className="text-sm text-medium-gray truncate">{user.email}</div>
              </div>
              <Badge variant={user.status === 'active' ? 'delivered' : 'cancelled'}>
                {user.status}
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Badge
                variant={
                  user.role === 'admin'
                    ? 'default'
                    : user.role === 'artisan'
                    ? 'pending'
                    : 'processing'
                }
              >
                {user.role}
              </Badge>
              <span className="text-medium-gray">
                Joined {new Date(user.joinedDate).toLocaleDateString()}
              </span>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="secondary"
                size="sm"
                className="flex-1"
                onClick={() => handleViewUser(user.id)}
              >
                View
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1"
                onClick={() => handleToggleSuspension(user.id, user.status)}
              >
                {user.status === 'active' ? 'Suspend' : 'Activate'}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <div className="bg-white rounded-xl border border-light-gray p-12 text-center">
          <p className="text-medium-gray">No users found matching your criteria</p>
        </div>
      )}
    </div>
  );
}
