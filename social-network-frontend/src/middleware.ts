import { NextResponse, NextRequest } from 'next/server';

export default async function middleware(req: NextRequest) {
    const pathname = req.nextUrl.pathname;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    if (
        pathname.startsWith('/_next/') ||
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

        const response = await fetch(`${process.env.NEXT_PUBLIC_VERFY_UTL}/api/auth/verify`, {
            signal: controller.signal,
            method: 'GET',
            credentials: 'include',
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });

        if (!response.ok) {

            console.log(response.body, response.status)
            // throw new Error('Invalid token');
        }

        authenticated = true;
    } catch (error) {
        if (error === 'AbortError') {
            console.error('Request timed out');
        }
        console.log(error)
        if (pathname !== '/login' && pathname !== '/register') {
            return NextResponse.redirect(new URL('/login', req.url));
        }
    } finally {
        clearTimeout(timeout);
    }

    if (authenticated && (pathname === '/login' || pathname === '/register')) {
        return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
}
