import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Dashboard routes - Only Super Admin and Admin
    if (pathname.startsWith('/dashboard')) {
      if (!token || !['Super Admin', 'Admin'].includes(token.role)) {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    }

    // Admin routes
    if (pathname.startsWith('/admin')) {
      if (!token || !['Super Admin', 'Admin'].includes(token.role)) {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    }

    // Staff routes
    if (pathname.startsWith('/staff')) {
      if (!token || !['Super Admin', 'Admin', 'Staff'].includes(token.role)) {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    }

    // Support routes
    if (pathname.startsWith('/support')) {
      if (!token || !['Super Admin', 'Admin', 'Staff', 'Support'].includes(token.role)) {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    }

    // Protected routes that require authentication
    if (pathname.startsWith('/profile') || pathname.startsWith('/orders')) {
      if (!token) {
        return NextResponse.redirect(new URL('/login', req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Public routes that don't require authentication
        if (pathname === '/' || pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/shop') || pathname.startsWith('/api/auth')) {
          return true;
        }
        
        // Protected routes require authentication
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/staff/:path*", 
    "/support/:path*",
    "/profile/:path*", 
    "/orders/:path*",
    "/dashboard/:path*"
  ]
};
