import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/', '/login', '/callback', '/landing', '/privacy'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // Add security headers
  const isDev = process.env.NODE_ENV === 'development';

  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Enable XSS protection in older browsers
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Clickjacking protection
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');

  // Referrer policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy
  response.headers.set(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=()'
  );

  // Content Security Policy - Strict in production
  const cspHeader = isDev
    ? "default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:;"
    : "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; font-src 'self' data:;";

  response.headers.set('Content-Security-Policy', cspHeader);

  // Strict Transport Security (HSTS) for HTTPS only
  if (!isDev) {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // Allow public routes and static assets
  if (
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/')) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/oauth2') ||
    pathname.startsWith('/store') ||
    pathname.includes('.')
  ) {
    return response;
  }

  // Dashboard routes require auth token cookie (set at login)
  const token = request.cookies.get('gmb_auth_token')?.value;
  if (!token && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
