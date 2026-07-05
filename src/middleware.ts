import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
    const pathname = req.nextUrl.pathname;

    // 1. Secure API Routes — Only allow requests from Cloudflare Worker
    if (pathname.startsWith('/api')) {
        // Check Cron Authorization
        if (pathname.startsWith('/api/cron')) {
            const authHeader = req.headers.get('authorization');
            const cronSecret = process.env.CRON_SECRET;
            if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
                return new NextResponse(
                    JSON.stringify({ error: 'Unauthorized: Invalid or missing cron secret' }),
                    { status: 401, headers: { 'Content-Type': 'application/json' } }
                );
            }
            return NextResponse.next();
        }

        // In production: validate X-Worker-Secret from Cloudflare Worker
        // This ensures nobody can call the admin API directly — only the Worker can
        if (process.env.NODE_ENV === 'production') {
            const workerSecret = req.headers.get('X-Worker-Secret');
            const expectedSecret = process.env.WORKER_SECRET;

            if (expectedSecret && workerSecret !== expectedSecret) {
                // Also check for legacy ADMIN_API_SECRET (frontend→admin proxy calls)
                const authHeader = req.headers.get('authorization');
                const adminSecret = process.env.ADMIN_API_SECRET;
                const hasValidAdminSecret = adminSecret && authHeader === `Bearer ${adminSecret}`;

                if (!hasValidAdminSecret) {
                    return new NextResponse(
                        JSON.stringify({ error: 'Forbidden: Direct API access not allowed' }),
                        { status: 403, headers: { 'Content-Type': 'application/json' } }
                    );
                }
            }
        }
        
        return NextResponse.next();
    }

    // 2. Protect Confidential Pages (Requires login, redirects to login)
    const protectedPaths = ['/support', '/profile', '/profiles', '/orders', '/checkout', '/admin', '/manager'];
    const isProtected = protectedPaths.some(path => pathname === path || pathname.startsWith(path + '/'));

    if (isProtected) {
        const sessionCookie = req.cookies.get('__admin_session')?.value;
        if (!sessionCookie) {
            const loginUrl = new URL('/auth/login', req.url);
            loginUrl.searchParams.set('redirect', pathname + req.nextUrl.search);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|images).*)'],
};
