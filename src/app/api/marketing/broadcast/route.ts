import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import * as admin from 'firebase-admin';
import { createClient } from '@supabase/supabase-js';
import OfferTemplate from '@/emails/OfferTemplate';

// 1. Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy');

export async function POST(req: Request) {
    try {
        // 2. Initialize Firebase Admin
        if (!admin.apps.length) {
            let privateKey = process.env.FIREBASE_PRIVATE_KEY || '';
            if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
                privateKey = privateKey.slice(1, -1);
            }
            privateKey = privateKey.replace(/\\n/g, '\n');

            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: privateKey,
                }),
            });
        }

        // 3. Initialize Supabase
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const body = await req.json();
        const { title, message, discountCode, target, sendEmail, sendPush } = body;
        const adminSecret = req.headers.get('x-admin-secret');

        // Security check
        if (adminSecret !== process.env.ADMIN_API_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const results = { emails: 0, pushes: 0, errors: [] as string[] };

        // We generate a campaign tracking ID to group these emails
        const campaignId = `camp_${Date.now()}`;

        // Get target users from Supabase
        // In a real scenario, this would query users who opted into marketing
        const { data: users, error: userError } = await supabase
            .from('users')
            .select('email, id');

        if (userError) throw userError;

        // Fetch Push Tokens
        const { data: pushTokens, error: tokenError } = await supabase
            .from('fcm_tokens')
            .select('token');

        if (tokenError) throw tokenError;

        // --- BROADCAST EMAILS ---
        if (sendEmail && users && users.length > 0) {
            const BATCH_SIZE = 50; // Resend limit per request
            for (let i = 0; i < users.length; i += BATCH_SIZE) {
                const batch = users.slice(i, i + BATCH_SIZE).map((user: any) => ({
                    from: `Krishna Naturals <offers${process.env.NEXT_PUBLIC_ADMIN_DOMAIN}>`,
                    to: [user.email],
                    subject: title,
                    react: OfferTemplate({ 
                        title, 
                        description: message, 
                        ctaText: "Shop the Sale",
                        ctaLink: "https://krishnanaturals.co.in",
                        discountCode,
                        trackingId: `${campaignId}_${user.id}` // Phase 10 support
                    }),
                }));

                try {
                    await resend.batch.send(batch as any);
                    results.emails += batch.length;
                } catch (err: any) {
                    console.error("Email batch error", err);
                    results.errors.push(`Email batch failed: ${err.message}`);
                }
            }
        }

        // --- BROADCAST PUSH NOTIFICATIONS ---
        if (sendPush && pushTokens && pushTokens.length > 0) {
            const tokens = pushTokens.map((pt) => pt.token);
            
            // Firebase sendMulticast takes max 500 tokens at a time
            const MAX_TOKENS = 500;
            for (let i = 0; i < tokens.length; i += MAX_TOKENS) {
                const chunk = tokens.slice(i, i + MAX_TOKENS);
                const messagePayload = {
                    notification: {
                        title: title,
                        body: message,
                    },
                    tokens: chunk,
                };
                
                try {
                    const response = await admin.messaging().sendEachForMulticast(messagePayload);
                    results.pushes += response.successCount;
                } catch (err: any) {
                    console.error("Push batch error", err);
                    results.errors.push(`Push batch failed: ${err.message}`);
                }
            }
        }

        // Log campaign to DB (Phase 2)
        await supabase.from('push_campaigns').insert({
            title,
            body: message,
            target_audience: target,
            success_count: results.emails + results.pushes,
            status: 'sent',
            sent_at: new Date().toISOString()
        });

        return NextResponse.json({ success: true, results });

    } catch (err: any) {
        console.error('Broadcast API Error:', err);
        return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
    }
}
