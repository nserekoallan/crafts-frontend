import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Portal hosts differ per environment:
 *   production  admin.craftcontinent.com        artisan.craftcontinent.com
 *   staging     stagingadmin.craftcontinent.com stagingartisan.craftcontinent.com
 *
 * Match the leading label itself rather than a "admin." prefix, so both the
 * dotted and the flat staging form route to the same portal.
 */
function isPortalHost(hostname: string, portal: 'admin' | 'artisan'): boolean {
  const label = hostname.split('.')[0].toLowerCase();
  return label === portal || label === `staging${portal}`;
}

export function middleware(request: NextRequest) {
  const hostname =
    request.headers.get('x-forwarded-host') ??
    request.headers.get('host') ??
    '';
  const { pathname } = request.nextUrl;

  if (isPortalHost(hostname, 'artisan')) {
    if (pathname === '/') return NextResponse.rewrite(new URL('/dashboard', request.url));
    if (pathname === '/login') return NextResponse.rewrite(new URL('/dashboard/login', request.url));
  }

  if (isPortalHost(hostname, 'admin')) {
    if (pathname === '/') return NextResponse.rewrite(new URL('/admin', request.url));
    if (pathname === '/login') return NextResponse.rewrite(new URL('/admin/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
