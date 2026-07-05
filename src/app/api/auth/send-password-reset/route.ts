import { NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase/admin';
import { Resend } from 'resend';
import { ResetPasswordEmail } from '@/emails/ResetPasswordEmail';

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
            url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/auth/login`,
            handleCodeInApp: false,
        };

        // Generating the standard Action link to handoff to Firebase Frontend Controller UI
        const adminAuth = getAdminAuth();
        const link = await adminAuth.generatePasswordResetLink(email, actionCodeSettings);

        // Dispatches Custom Resend template replacing Default UI
        const { error } = await resend.emails.send({
            from: 'Krishna Naturals <hello@krishnanaturals.co.in>',
            to: [email],
            subject: 'Reset Your Password 🍯',
            react: ResetPasswordEmail({ resetLink: link }),
        });

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
