import { NextResponse, NextRequest } from 'next/server';

export default async function middleware(req: NextRequest) {
    const pathname = req.nextUrl.pathname;

    if (
        pathname.startsWith('/_next/') || 
        pathname.startsWith('/api/') || 
        pathname.startsWith('/static/') ||
        pathname.startsWith('/favicon.ico') ||
        pathname.startsWith('/images/')
    ) {
        return NextResponse.next();
    }
    let authenticated = false;

    try {
        const token = req.cookies.get('token')?.value;
        if (!token) {
            throw new Error('Token not found');
        }

        const response = await fetch('http://localhost:8080/api/auth/verify', {
            method: 'GET', 
            credentials: 'include',
            headers: {
                'Authorization': `Bearer ${token}`, 
            }
        });

        if (!response.ok) {
            throw new Error('Invalid token');
        }

        authenticated = true;
    } catch (error) {
        if (pathname !== '/login' && pathname !== '/signup') {
            return NextResponse.redirect(new URL('/login', req.url));
        }
    }

    if (authenticated && (pathname === '/login' || pathname === '/signup')) {
        return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
}
