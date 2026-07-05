import { NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase/admin';
import { Resend } from 'resend';
import { VerificationEmail } from '@/emails/VerificationEmail';

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
            url: `${process.env.NEXT_PUBLIC_URL || 'https://krishnanaturals.co.in'}/auth/login?verified=true`,
            handleCodeInApp: true,
        };

        // 1. Tell Firebase Admin to generate a raw backend email verification link, bypassing the default UI
        const adminAuth = getAdminAuth();
        const link = await adminAuth.generateEmailVerificationLink(email, actionCodeSettings);

        // 2. Blast that raw link utilizing our custom, extremely beautiful HTML Template natively through Resend!
        const { error } = await resend.emails.send({
            from: 'Krishna Naturals <hello@krishnanaturals.co.in>',
            to: [email],
            subject: 'Verify your email for Krishna Naturals ✓',
            react: VerificationEmail({ verificationLink: link, email }),
        });

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
