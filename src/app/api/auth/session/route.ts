import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// POST: Create session cookie from Firebase ID token
export async function POST(request: Request) {
    try {
        const { idToken } = await request.json();

        if (!idToken) {
            return NextResponse.json({ error: 'No token provided' }, { status: 400 });
        }

        const expiresIn = 60 * 60 * 24 * 14 * 1000; // 14 days in milliseconds
        const { getAdminAuth } = await import('@/lib/firebase/admin');
        const sessionCookie = await getAdminAuth().createSessionCookie(idToken, { expiresIn });

        const cookieStore = await cookies();

        // Store the session cookie as an HttpOnly cookie
        cookieStore.set('__admin_session', sessionCookie, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 14, // 14 days in seconds
            path: '/',
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Session creation error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE: Clear session cookie
export async function DELETE() {
    const cookieStore = await cookies();
    cookieStore.delete('__admin_session');
    return NextResponse.json({ success: true });
}
