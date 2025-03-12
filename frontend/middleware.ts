import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    const pathname = req.nextUrl.pathname;

    // Skip middleware for certain routes
    if (
        pathname.startsWith('/_next/') || // Next.js internals
        pathname.startsWith('/images/') || // Static files
        pathname.startsWith('/api/') ||    // API routes
        pathname === '/login' ||           // Skip login page
        pathname === '/register'          // Skip registration page
    ) {
        return NextResponse.next(); // Continue without checking token
    }

    // Token check for protected routes
    const token = req.cookies.get('token');
    if (!token) {
        // Redirect to login if not authenticated
        const url = req.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    return NextResponse.next(); // Continue to the requested page
}
