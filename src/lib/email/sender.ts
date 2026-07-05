/**
 * Centralized email sender with full logging.
 * Every email sent in the system MUST go through this wrapper.
 * Logs to `email_logs` table in Supabase for 100% audit trail.
 */
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);

// Use service role to bypass RLS for logging
function getAdminSupabase() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

interface SendEmailParams {
    from: string;
    to: string | string[];
    subject: string;
    html: string;
    emailType: string;         // e.g., 'ORDER_CONFIRMATION', 'WELCOME', 'PASSWORD_RESET'
    relatedOrderId?: string;   // optional: link to order
    triggeredBy?: string;      // optional: user email or 'SYSTEM'
    metadata?: Record<string, unknown>; // optional extra data
}

interface EmailResult {
    success: boolean;
    id?: string;
    error?: string;
}

export async function sendAndLogEmail(params: SendEmailParams): Promise<EmailResult> {
    const { from, to, subject, html, emailType, relatedOrderId, triggeredBy, metadata } = params;
    const recipients = Array.isArray(to) ? to : [to];
    const sentAt = new Date().toISOString();

    let resendId: string | undefined;
    let errorMsg: string | undefined;
    let success = false;

    // Inject Tracking Pixel for all emails
    // The tracking route expects ?email=... and ?c=...
    // For multiple recipients, we just use the first one for tracking simplicity, or general 'broadcast'
    const trackingEmail = encodeURIComponent(recipients[0]);
    const trackingCampaign = encodeURIComponent(emailType);
    const trackingPixelUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://krishnanaturals.co.in'}/api/track/email/open?email=${trackingEmail}&c=${trackingCampaign}`;
    const trackedHtml = html.includes('</body>') 
        ? html.replace('</body>', `<img src="${trackingPixelUrl}" width="1" height="1" alt="" style="display:none;" /></body>`)
        : html + `<img src="${trackingPixelUrl}" width="1" height="1" alt="" style="display:none;" />`;

    try {
        const response = await resend.emails.send({
            from,
            to: recipients,
            subject,
            html: trackedHtml,
        });

        if (response.error) {
            errorMsg = response.error.message;
        } else {
            success = true;
            resendId = response.data?.id;
        }
    } catch (err: unknown) {
        errorMsg = err instanceof Error ? err.message : 'Unknown send error';
    }

    // Log to database — fire-and-forget, never block the response
    try {
        const supabase = getAdminSupabase();
        
        // Log one entry per recipient for granular tracking
        const logs = recipients.map((recipient) => ({
            recipient_email: recipient.toLowerCase().trim(),
            email_type: emailType,
            subject: subject,
            from_address: from,
            resend_id: resendId || null,
            status: success ? 'sent' : 'failed',
            error_message: errorMsg || null,
            related_order_id: relatedOrderId || null,
            triggered_by: triggeredBy || 'SYSTEM',
            metadata: metadata ? JSON.stringify(metadata) : null,
            sent_at: sentAt,
        }));

        await supabase.from('email_logs').insert(logs);
    } catch (logErr) {
        // Never let logging failure break email sending
        console.error('[EMAIL_LOG] Failed to log email:', logErr);
    }

    return { success, id: resendId, error: errorMsg };
}

/**
 * Log an email sent via raw fetch (e.g., cron/ai-audit)
 */
export async function logEmailManually(params: {
    recipientEmail: string;
    emailType: string;
    subject: string;
    fromAddress: string;
    status: 'sent' | 'failed';
    triggeredBy?: string;
    errorMessage?: string;
    metadata?: Record<string, unknown>;
}) {
    try {
        const supabase = getAdminSupabase();
        await supabase.from('email_logs').insert({
            recipient_email: params.recipientEmail.toLowerCase().trim(),
            email_type: params.emailType,
            subject: params.subject,
            from_address: params.fromAddress,
            status: params.status,
            error_message: params.errorMessage || null,
            triggered_by: params.triggeredBy || 'SYSTEM',
            metadata: params.metadata ? JSON.stringify(params.metadata) : null,
            sent_at: new Date().toISOString(),
        });
    } catch (err) {
        console.error('[EMAIL_LOG] Manual log failed:', err);
    }
}
