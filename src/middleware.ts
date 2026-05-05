import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') ?? '';
  const { pathname } = request.nextUrl;

  // artisan.craftcontinent.com → land on /dashboard
  if (hostname.startsWith('artisan.') && pathname === '/') {
    return NextResponse.rewrite(new URL('/dashboard', request.url));
  }

  // admin.craftcontinent.com → land on /admin
  if (hostname.startsWith('admin.') && pathname === '/') {
    return NextResponse.rewrite(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
