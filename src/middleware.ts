import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJwtToken } from './lib/jwt';

// Define the routes that need authentication
const protectedRoutes = ['/dashboard', '/admin', '/agent'];

// Define routes that are only for non-authenticated users (like login)
const nonAuthRoutes = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isNonAuthRoute = nonAuthRoutes.some((route) => pathname.startsWith(route));

  // Determine how we get the token. 
  // Depending on how backend is storing UI session. Usually Next.js app stores in cookie.
  const token = request.cookies.get('token')?.value;

  const verifiedToken = token && (await verifyJwtToken(token));

  if (isProtectedRoute) {
    if (!verifiedToken) {
      // Redirect to login if user tries to access a protected route without valid token
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', encodeURI(request.url));
      return NextResponse.redirect(url);
    }
  }

  if (isNonAuthRoute) {
    if (verifiedToken) {
      // Redirect to dashboard if logged-in user tries to access login/register
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Inject user context to headers for subsequent use maybe
  const response = NextResponse.next();
  if (verifiedToken && typeof verifiedToken.role === 'string') {
    response.headers.set('x-user-role', verifiedToken.role);
  }

  return response;
}

export const config = {
  // Define route matchers
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
