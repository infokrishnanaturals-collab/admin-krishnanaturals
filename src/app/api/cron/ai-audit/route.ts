import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
    // Verify Cron Secret if needed
    // const authHeader = request.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) return new NextResponse('Unauthorized', { status: 401 });

    try {
        // Initialize Supabase admin client
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // using anon for now as fallback if service is missing
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Fetch logs from the last 24 hours
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const { data: logs, error } = await supabase
            .from('inventory_logs')
            .select('*')
            .gte('created_at', yesterday.toISOString());

        if (error) throw error;
        if (!logs || logs.length === 0) return NextResponse.json({ status: 'ok', message: 'No logs to audit' });

        // --- AI Anomaly Detection Simulation ---
        // In a full production environment, this JSON array would be sent to OpenAI/Gemini:
        // const prompt = `Analyze these inventory logs for theft, massive dumps, or unusual restocks: ${JSON.stringify(logs)}`;

        const anomaliesFound: string[] = [];

        // Algorithmic Fallback Rules (Acts as our "AI"):
        for (const log of logs) {
            // Rule 1: Massive deduction in a single transaction (Theft / Error)
            if (log.quantity_change < -50) {
                anomaliesFound.push(`Massive stock wipe (-${Math.abs(log.quantity_change)}) on ${log.product_name} by ${log.user_email}.`);
            }

            // Rule 2: Manual Restock during strange hours (e.g. 2 AM to 5 AM)
            const logHour = new Date(log.created_at).getHours();
            if (log.change_type === 'MANUAL_RESTOCK' && (logHour >= 2 && logHour <= 5)) {
                anomaliesFound.push(`Suspicious late-night manual restock on ${log.product_name} at ${logHour}:00 AM by ${log.user_email}.`);
            }

            // Rule 3: QR Floor Scanner mass-dumping
            if (log.change_type === 'QR_ADJUSTMENT' && Math.abs(log.quantity_change) > 100) {
                anomaliesFound.push(`Impossible physical QR scan manipulation (${log.quantity_change}) on ${log.product_name} by ${log.user_email}.`);
            }
        }

        if (anomaliesFound.length > 0) {
            // TRIGGER EMAIL ALERT VIA RESEND
            const resendKey = process.env.RESEND_API_KEY;
            const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@krishnanaturals.co.in";

            if (resendKey) {
                await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${resendKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        from: 'Krishna Security <onboarding@resend.dev>',
                        to: adminEmail,
                        subject: '⚠️ SECURITY ALERT: Inventory Anomalies Detected',
                        html: `
                            <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; background: #FFF3F3; padding: 30px; border-radius: 12px; border: 1px solid #FCA5A5;">
                                <h2 style="color: #DC2626; margin-top: 0;">AI Audit Detection Alert</h2>
                                <p style="color: #4B5563;">The Krishna Naturals automated cron job has detected highly unusual behavior in your inventory ledger over the last 24 hours.</p>
                                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                    <ul style="color: #1F2937; margin: 0; padding-left: 20px;">
                                        ${anomaliesFound.map(a => `<li style="margin-bottom: 10px;"><strong>${a}</strong></li>`).join('')}
                                    </ul>
                                </div>
                                <p style="color: #4B5563; font-size: 14px;">Please review the <a href="https://krishnanaturals.co.in/admin/logs" style="color: #DC2626;">Forensic Audit Logs</a> immediately to ensure your stock is secure.</p>
                            </div>
                        `
                    })
                });
            }

            return NextResponse.json({ status: 'anomalies_detected', count: anomaliesFound.length, anomalies: anomaliesFound });
        }

        return NextResponse.json({ status: 'ok', message: 'Audit clear. No anomalies found.' });

    } catch (error: any) {
        console.error('Audit Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
