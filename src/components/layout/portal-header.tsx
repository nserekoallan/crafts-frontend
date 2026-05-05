'use client';

import Link from 'next/link';
import Image from 'next/image';
import { LogOut, ExternalLink } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface PortalHeaderProps {
  /** Label shown as a badge to the right of the logo, e.g. "Admin Console" or "Artisan Studio" */
  label: string;
  /** Accent colour class applied to the badge text, defaults to satin-gold */
  accentClass?: string;
}

/**
 * Slim top bar shared by the admin console and artisan dashboard portals.
 * Sits above the dark sidebar — intentionally separate from the store header.
 */
export function PortalHeader({ label, accentClass = 'text-satin-gold' }: PortalHeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.replace('/login');
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
