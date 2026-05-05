import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname =
    request.headers.get('x-forwarded-host') ??
    request.headers.get('host') ??
    '';
  const { pathname } = request.nextUrl;

  if (hostname.startsWith('artisan.')) {
    if (pathname === '/') return NextResponse.rewrite(new URL('/dashboard', request.url));
    if (pathname === '/login') return NextResponse.rewrite(new URL('/dashboard/login', request.url));
  }

  if (hostname.startsWith('admin.')) {
    if (pathname === '/') return NextResponse.rewrite(new URL('/admin', request.url));
    if (pathname === '/login') return NextResponse.rewrite(new URL('/admin/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
