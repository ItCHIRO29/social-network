import { NextResponse, NextRequest } from 'next/server';

export default async function middleware(req: NextRequest) {
    const pathname = req.nextUrl.pathname;
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
        const link = `${process.env.NEXT_PUBLIC_VERFY_UTL}/api/auth/verify`;
        const response = await fetch(link, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });

        if (!response.ok) {
            console.log(response.body, response.status)
            console.log(response)
            throw new Error('Invalid token');
        }
        authenticated = true;
    } catch (error) {
        console.log(error)
        if (pathname !== '/login' && pathname !== '/register') {
            return NextResponse.redirect(new URL('/login', req.url));
        }
    }

    if (authenticated && (pathname === '/login' || pathname === '/register')) {
        return NextResponse.redirect(new URL('/', req.url));
    }

    // return NextResponse.next();
}
