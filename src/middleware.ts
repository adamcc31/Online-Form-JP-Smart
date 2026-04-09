import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJwtToken } from './lib/jwt';

// Routes requiring authentication
const protectedRoutes = ['/dashboard', '/admin', '/agent'];

// Routes only for non-authenticated users
const nonAuthRoutes = ['/login'];

// Public routes that never need auth checks (performance)
const publicRoutes = ['/p/', '/status', '/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip auth checks for public routes
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
  if (isPublicRoute) {
    return NextResponse.next();
  }

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isNonAuthRoute = nonAuthRoutes.some((route) => pathname.startsWith(route));

  const token = request.cookies.get('token')?.value;
  const verifiedToken = token && (await verifyJwtToken(token));

  if (isProtectedRoute) {
    if (!verifiedToken) {
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', encodeURI(request.url));
      return NextResponse.redirect(url);
    }
  }

  if (isNonAuthRoute) {
    if (verifiedToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Inject user context to headers
  const response = NextResponse.next();
  if (verifiedToken && typeof verifiedToken.role === 'string') {
    response.headers.set('x-user-role', verifiedToken.role);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
