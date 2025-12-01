import createMiddleware from 'next-intl/middleware';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

const isPublicRoute = createRouteMatcher([
  '/',
  '/:locale',
  '/:locale/products(.*)',
  '/:locale/about',
  '/:locale/contact',
  '/products(.*)',
  '/about',
  '/contact',
]);

const isApiRoute = createRouteMatcher([
  '/api/(.*)',
]);

export default clerkMiddleware(async (auth, request: NextRequest) => {
  const pathname = request.nextUrl.pathname;
  
  // Skip middleware for API routes - let them pass through
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }
  
  // Skip intl middleware for admin routes
  if (pathname.startsWith('/admin')) {
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
