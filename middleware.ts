import createMiddleware from 'next-intl/middleware';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
]);

export default clerkMiddleware(async (auth, request: NextRequest) => {
  const pathname = request.nextUrl.pathname;
  
  // Skip middleware for API routes - let them pass through
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }
  
  // Admin routes - require authentication
  if (isAdminRoute(request)) {
    const { userId } = await auth();
    
    // Not logged in - return 405
    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: 'Method Not Allowed', message: 'Admin access required' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Let the admin layout handle role checking
    return NextResponse.next();
  }
  
  // Handle intl middleware for all other routes
  return intlMiddleware(request);
});

export const config = {
  matcher: [
    '/((?!_next|_vercel|.*\\..*).*)',
  ],
};
