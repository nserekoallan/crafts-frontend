'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';

// ─── Types ───────────────────────────────────────────────────────────────────

interface UserDetail {
  id: string;
  email: string | null;
  phone: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  profile: { firstName: string; lastName: string; avatar: string | null } | null;
  artisan: { id: string; businessName: string; status: string } | null;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function displayName(user: UserDetail): string {
  if (user.profile) return `${user.profile.firstName} ${user.profile.lastName}`;
  return user.email ?? user.phone ?? 'Unknown';
}

function initials(user: UserDetail): string {
  if (user.profile) {
    return `${user.profile.firstName[0]}${user.profile.lastName[0]}`.toUpperCase();
  }
  const label = user.email ?? user.phone ?? '?';
  return label.slice(0, 2).toUpperCase();
}

function orderStatusVariant(status: string) {
  if (status === 'DELIVERED' || status === 'PAID') return 'delivered';
  if (status === 'CANCELLED' || status === 'REFUNDED') return 'cancelled';
  if (status === 'PENDING') return 'pending';
  if (status === 'PROCESSING' || status === 'QC_PASSED') return 'processing';
  if (status === 'SHIPPED') return 'shipped';
  return 'default';
}

function roleVariant(role: string) {
  if (role === 'ADMIN' || role === 'SUPER_ADMIN') return 'default';
  if (role === 'ARTISAN') return 'pending';
  return 'processing';
}

function formatCurrency(v: number): string {
  return new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', maximumFractionDigits: 0 }).format(v);
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery<{ data: UserDetail }>({
    queryKey: ['admin', 'user-detail', id],
    queryFn: () => api.get(`/users/${id}`),
    enabled: !!id,
  });

  const { data: ordersData, isLoading: ordersLoading } = useQuery<{ data: Order[] }>({
    queryKey: ['admin', 'user-orders', id],
    queryFn: () => api.get(`/orders?userId=${id}&limit=50`),
    enabled: !!id,
  });

  const { mutate: toggleStatus, isPending: isToggling } = useMutation({
    mutationFn: (isActive: boolean) => api.patch(`/users/${id}/status`, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'user-detail', id] }),
  });

  const user = data?.data;
  const orders = ordersData?.data ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="py-20 text-center">
        <p className="text-red-400">Failed to load user.</p>
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
        href="/admin/users"
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-gold transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Users
      </Link>

      {/* Header card */}
      <div className="bg-bg-elevated rounded-xl border border-border-dark p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-6">
          {/* Avatar */}
          <div className="h-16 w-16 shrink-0 rounded-xl bg-blue-500/20 flex items-center justify-center text-xl font-bold text-blue-400">
            {initials(user)}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-text-primary">{displayName(user)}</h1>
              <Badge variant={roleVariant(user.role)}>{user.role.toLowerCase()}</Badge>
              <Badge variant={user.isActive ? 'delivered' : 'cancelled'}>
                {user.isActive ? 'Active' : 'Suspended'}
              </Badge>
            </div>
            {user.email && <p className="text-text-secondary text-sm">{user.email}</p>}
            {user.phone && <p className="text-text-secondary text-sm">{user.phone}</p>}
            <p className="text-text-tertiary text-sm mt-0.5">
              Joined {new Date(user.createdAt).toLocaleDateString()}
            </p>
            {user.artisan && (
              <p className="text-text-tertiary text-sm mt-0.5">
                Artisan:{' '}
                <Link
                  href={`/admin/artisans/${user.artisan.id}`}
                  className="text-gold hover:underline"
                >
                  {user.artisan.businessName}
                </Link>
              </p>
            )}
          </div>

          {/* Actions */}
          <div>
            <button
              onClick={() => toggleStatus(!user.isActive)}
              disabled={isToggling}
              className={
                user.isActive
                  ? 'rounded-lg border border-red-500/30 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 disabled:opacity-50 transition-colors'
                  : 'rounded-lg border border-emerald-500/30 px-4 py-2 text-sm font-medium text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-50 transition-colors'
              }
            >
              {isToggling ? '…' : user.isActive ? 'Suspend' : 'Activate'}
            </button>
          </div>
        </div>
      </div>

      {/* Orders */}
      <div className="bg-bg-elevated rounded-xl border border-border-dark overflow-hidden">
        <div className="px-6 py-4 border-b border-border-dark">
          <h2 className="font-semibold text-text-primary">Orders</h2>
        </div>
        {ordersLoading ? (
          <div className="p-6 text-text-secondary text-sm">Loading orders…</div>
        ) : orders.length === 0 ? (
          <div className="p-6 text-text-secondary text-sm">No orders found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-dark">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">Order #</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-secondary">Total</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dark">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-mono text-text-primary">{order.orderNumber}</td>
                    <td className="px-4 py-3 text-text-secondary">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <Badge variant={orderStatusVariant(order.status)}>{order.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-text-primary">{formatCurrency(Number(order.total))}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-gold hover:underline text-xs"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
