import { NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase/admin';
import { Resend } from 'resend';
import { MagicLinkEmail } from '@/emails/MagicLinkEmail';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy');

export async function POST(req: Request) {
    try {
        // Secure token check
        const authHeader = req.headers.get('authorization');
        const apiSecret = process.env.ADMIN_API_SECRET;
        const isSecretValid = apiSecret && authHeader === `Bearer ${apiSecret}`;

        if (!isSecretValid) {
            return NextResponse.json({ error: 'Unauthorized: Invalid API secret key' }, { status: 401 });
        }

        const { email } = await req.json();
        const actionCodeSettings = {
            url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/auth/verify`,
            handleCodeInApp: true,
        };

        // 1. Tell Firebase Admin to generate a raw backend auth link, completely bypassing their default template
        const adminAuth = getAdminAuth();
        const link = await adminAuth.generateSignInWithEmailLink(email, actionCodeSettings);

        // 2. Blast that raw link utilizing our custom, extremely beautiful HTML Template natively through Resend!
        const { error } = await resend.emails.send({
            from: 'Krishna Naturals <hello@krishnanaturals.co.in>',
            to: [email],
            subject: 'Your Magic Login Link 🍯',
            react: MagicLinkEmail({ loginLink: link }),
        });

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
