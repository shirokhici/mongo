import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware untuk API routes yang tidak memerlukan auth
  if (pathname.startsWith('/api/config') || 
      pathname.startsWith('/api/register-install') ||
      pathname.startsWith('/api/auth/login') ||
      pathname.startsWith('/api/uploads')) {
    return NextResponse.next();
  }

  // Proteksi admin routes
  if (pathname.startsWith('/admin')) {
    // Skip login page
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    // Check authentication
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    const user = verifyToken(token);
    if (!user) {
      // Clear invalid token
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.set('auth-token', '', { maxAge: 0 });
      return response;
    }

    // Add user info to headers untuk digunakan di components
    const response = NextResponse.next();
    response.headers.set('x-user-id', user.userId);
    response.headers.set('x-user-role', user.role);
    response.headers.set('x-username', user.username);
    
    return response;
  }

  // Proteksi admin API routes
  if (pathname.startsWith('/api/admin') || pathname.startsWith('/api/upload')) {
    const authHeader = request.headers.get('authorization');
    const cookieToken = request.cookies.get('auth-token')?.value;
    
    let token = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (cookieToken) {
      token = cookieToken;
    }

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Add user info to headers
    const response = NextResponse.next();
    response.headers.set('x-user-id', user.userId);
    response.headers.set('x-user-role', user.role);
    response.headers.set('x-username', user.username);
    
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/upload/:path*',
  ],
};