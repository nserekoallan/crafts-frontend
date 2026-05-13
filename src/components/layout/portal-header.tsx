'use client';

import Link from 'next/link';
import Image from 'next/image';
import { LogOut, ExternalLink, Bell, X } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface NotificationLog {
  id: string;
  title: string;
  body: string;
  channel: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationsResponse {
  data: NotificationLog[];
  meta: { total: number; unreadCount: number };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ---------------------------------------------------------------------------
// NotificationBell
// ---------------------------------------------------------------------------

function NotificationBell() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data } = useQuery({
    queryKey: ['admin', 'notifications'],
    queryFn: () => api.get<NotificationsResponse>('/admin/notifications?page=1&limit=20'),
    refetchInterval: 30_000,
  });

  const notifications = data?.data ?? [];
  const unreadCount = data?.meta?.unreadCount ?? 0;

  const { mutate: markRead } = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/notifications/${id}/read`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] }),
  });

  const { mutate: markAllRead } = useMutation({
    mutationFn: () => api.patch('/admin/notifications/read-all', {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] }),
  });

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-8 w-8 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white/80"
        title="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-gold px-0.5 text-[10px] font-bold text-bg-primary">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto rounded-xl border border-border-dark bg-bg-elevated shadow-xl z-50">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border-dark px-4 py-3">
            <span className="text-sm font-semibold text-text-primary">Notifications</span>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllRead()}
                  className="text-xs text-gold hover:text-gold-light transition-colors"
                >
                  Mark all as read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="text-text-secondary hover:text-text-primary"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Items */}
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-text-tertiary">
              No notifications yet
            </div>
          ) : (
            <div className="divide-y divide-border-dark">
              {notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => !n.isRead && markRead(n.id)}
                  className={cn(
                    'w-full px-4 py-3 text-left hover:bg-white/[0.03] transition-colors',
                    !n.isRead && 'bg-gold/[0.04]',
                  )}
                >
                  <div className="flex items-start gap-2">
                    {!n.isRead && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gold" />
                    )}
                    <div className={cn('min-w-0 flex-1', n.isRead && 'ml-4')}>
                      <p className="text-sm font-medium text-text-primary line-clamp-1">
                        {n.title || n.channel}
                      </p>
                      <p className="mt-0.5 text-xs text-text-secondary line-clamp-2">
                        {n.body}
                      </p>
                      <p className="mt-1 text-xs text-text-tertiary">{timeAgo(n.createdAt)}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PortalHeader
// ---------------------------------------------------------------------------

interface PortalHeaderProps {
  /** Label shown as a badge to the right of the logo, e.g. "Admin Console" or "Artisan Studio" */
  label: string;
  /** Accent colour class applied to the badge text, defaults to satin-gold */
  accentClass?: string;
  /** Path to redirect to after logout */
  loginPath?: string;
  /** Show admin notification bell */
  showNotifications?: boolean;
}

/**
 * Slim top bar shared by the admin console and artisan dashboard portals.
 * Sits above the dark sidebar — intentionally separate from the store header.
 */
export function PortalHeader({
  label,
  accentClass = 'text-satin-gold',
  loginPath = '/login',
  showNotifications = false,
}: PortalHeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.replace(loginPath);
  }

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-white/[0.06] bg-[#0D0D0D] px-4 lg:px-6">
      {/* Left: logo + portal label */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.jpg"
            alt="Crafts Continent"
            width={32}
            height={32}
            className="h-8 w-8 rounded-md object-cover"
          />
          <span className="hidden font-heading text-sm font-bold uppercase tracking-widest text-white sm:inline">
            Crafts Continent
          </span>
        </Link>

        <span className="text-white/20">/</span>

        <span className={`text-xs font-semibold uppercase tracking-wider ${accentClass}`}>
          {label}
        </span>
      </div>

      {/* Right: user info + actions */}
      <div className="flex items-center gap-3">
        {user && (
          <span className="hidden text-xs text-white/50 sm:inline">
            {user.firstName} {user.lastName}
          </span>
        )}

        {showNotifications && <NotificationBell />}

        <Link
          href="/"
          className="flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white/80"
          title="Go to store"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Store</span>
        </Link>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white/80"
          title="Log out"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Log out</span>
        </button>
      </div>
    </header>
  );
}
