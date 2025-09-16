import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for public routes
  if (
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname === '/' ||
    pathname === '/auth/login'
  ) {
    return NextResponse.next();
  }

  // Check for authentication on protected routes
  if (
    pathname.startsWith('/api/admin/') ||
    pathname.startsWith('/api/team_leader/') ||
    pathname.startsWith('/api/member/') ||
    pathname.startsWith('/admin/') ||
    pathname.startsWith('/team_leader/') ||
    pathname.startsWith('/member/') ||
    pathname.startsWith('/dashboard/')
  ) {
    // Try to get token from Authorization header
    const authHeader = request.headers.get('authorization');
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      // Try to get token from cookies
      token = request.cookies.get('auth-token')?.value;
    }

    if (!token) {
      // For API routes, return 401
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        );
      }
      
      // For page routes, redirect to login
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    try {
      const decoded = verifyToken(token);
      
      // Add user info to headers for API routes
      if (pathname.startsWith('/api/')) {
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('user-id', decoded.userId);
        requestHeaders.set('user-role', decoded.role || '');
        
        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
      }
      
    } catch (error) {
      console.error('Token verification failed:', error);
      
      // For API routes, return 401
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { success: false, error: 'Invalid token' },
          { status: 401 }
        );
      }
      
      // For page routes, redirect to login
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};