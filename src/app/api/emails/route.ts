/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { render } from '@react-email/components';
import { OrderReceiptEmail } from '@/emails/OrderReceipt';
import { WelcomeEmail } from '@/emails/WelcomeEmail';
import { verifySessionUser, isAdminEmail } from '@/lib/firebase/admin';
import { EmailSendSchema } from '@/lib/validations';
import { sendAndLogEmail } from '@/lib/email/sender';

export async function POST(req: Request) {
    try {
        const raw = await req.json();
        const parsed = EmailSendSchema.safeParse(raw);
        if (!parsed.success) {
            return NextResponse.json({ error: 'Invalid email data', details: parsed.error.flatten() }, { status: 400 });
        }
        const { to, type, payload: rawPayload } = parsed.data;
        const payload = rawPayload as any;

        // Ensure we have an email target and payload
        if (!to || !type || !payload) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        // Check for shared internal secret key (used by the frontend proxy)
        const authHeader = req.headers.get('authorization');
        const apiSecret = process.env.ADMIN_API_SECRET;
        const isSecretValid = apiSecret && authHeader === `Bearer ${apiSecret}`;

        if (!isSecretValid) {
            // 1. Authenticate user session
            const sessionUser = await verifySessionUser();

            // 2. Authorize based on action type
            const adminRequiredTypes = ['ORDER_STATUS_UPDATE', 'ORDER_SHIPPED', 'MARKETING_BROADCAST', 'TICKET_REPLY'];
            if (adminRequiredTypes.includes(type)) {
                if (!sessionUser || !isAdminEmail(sessionUser.email)) {
                    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
                }
            }

            const customerRequiredTypes = ['ORDER_CONFIRMATION'];
            if (customerRequiredTypes.includes(type)) {
                if (!sessionUser) {
                    return NextResponse.json({ error: 'Unauthorized: Session required' }, { status: 401 });
                }
                const recipients = Array.isArray(to) ? to : [to];
                if (sessionUser.email && !recipients.some(email => email.toLowerCase().trim() === sessionUser.email?.toLowerCase().trim())) {
                    return NextResponse.json({ error: 'Forbidden: You can only send confirmations to your own email address' }, { status: 403 });
                }
            }
        }

        const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@krishnanaturals.co.in';
        const recipients = Array.isArray(to) ? to : [to];

        let emailResponse;

        if (type === 'ORDER_CONFIRMATION') {
            // 1) Send customer confirmation email
            const customerHtml = await render(OrderReceiptEmail({
                orderNumber: payload.orderNumber,
                customerName: payload.customerName,
                totalAmount: payload.totalAmount,
                items: payload.items,
                shippingAddress: payload.shippingAddress,
                isShipped: false,
            }));
            emailResponse = await sendAndLogEmail({
                from: 'Krishna Naturals <orders@krishnanaturals.co.in>',
                to: recipients,
                subject: `Order Confirmed: #${payload.orderNumber}`,
                html: customerHtml,
                emailType: 'ORDER_CONFIRMATION',
            });

            // 2) Send admin/owner notification email (fire-and-forget, don't block the response)
            try {
                const { NewOrderNotification } = await import('@/emails/NewOrderNotification');
                const adminHtml = await render(NewOrderNotification({
                    orderNumber: payload.orderNumber,
                    customerName: payload.customerName,
                    customerEmail: Array.isArray(to) ? to[0] : to,
                    customerPhone: payload.customerPhone || 'N/A',
                    totalAmount: payload.totalAmount,
                    subtotal: payload.subtotal ?? payload.totalAmount,
                    shippingFee: payload.shippingFee ?? 0,
                    discountAmount: payload.discountAmount ?? 0,
                    couponCode: payload.couponCode || undefined,
                    paymentMethod: payload.paymentMethod || 'Online',
                    items: payload.items,
                    shippingAddress: payload.shippingAddress,
                    orderDate: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
                }));
                await sendAndLogEmail({
                    from: 'Krishna Naturals <orders@krishnanaturals.co.in>',
                    to: [ADMIN_EMAIL],
                    subject: `🛒 New Order #${payload.orderNumber} — ₹${payload.totalAmount.toFixed(2)} from ${payload.customerName}`,
                    html: adminHtml,
                    emailType: 'ADMIN_NEW_ORDER_NOTIFICATION',
                });
            } catch (adminEmailErr) {
                console.error('Failed to send admin notification email:', adminEmailErr);
                // Don't fail the response — customer email was already sent
            }
        }
        else if (type === 'ORDER_STATUS_UPDATE' || type === 'ORDER_SHIPPED') {
            const status = payload.status || 'shipped';
            // Also notify admin of the change
            const statusRecipients = [...new Set([...recipients, ADMIN_EMAIL])];
            const html = await render(OrderReceiptEmail({
                orderNumber: payload.orderNumber,
                customerName: payload.customerName,
                totalAmount: payload.totalAmount,
                items: payload.items,
                shippingAddress: payload.shippingAddress,
                isShipped: status === 'shipped',
                status: status,
                trackingNumber: payload.trackingNumber,
                trackingUrl: payload.trackingUrl,
            }));
            emailResponse = await sendAndLogEmail({
                from: 'Krishna Naturals <orders@krishnanaturals.co.in>',
                to: statusRecipients,
                subject: `Order #${payload.orderNumber} Status Updated: ${status.toUpperCase()}`,
                html,
                emailType: 'ORDER_STATUS_UPDATE',
            });
        }
        else if (type === 'WELCOME') {
            const html = await render(WelcomeEmail({
                customerName: payload.customerName || "Valued Customer",
            }));
            emailResponse = await sendAndLogEmail({
                from: 'Krishna Naturals <hello@krishnanaturals.co.in>',
                to: recipients,
                subject: 'Welcome to the Krishna Naturals Family! 🍯',
                html,
                emailType: 'WELCOME',
            });
        }
        else if (type === 'MARKETING_BROADCAST') {
            const { MarketingEmail } = await import('@/emails/MarketingEmail');
            const html = await render(MarketingEmail({
                subject: payload.subject || 'Special Update from Krishna Naturals',
                markdownContent: payload.markdownContent || 'Hello from Krishna Naturals!',
            }));
            emailResponse = await sendAndLogEmail({
                from: 'Krishna Naturals <hello@krishnanaturals.co.in>',
                to: recipients,
                subject: payload.subject || 'Special Update from Krishna Naturals',
                html,
                emailType: 'MARKETING_BROADCAST',
            });
        }
        else if (type === 'NEW_CONTACT_MESSAGE') {
            // Always ensure admin is in the loop
            const contactRecipients = [...new Set([...recipients, ADMIN_EMAIL])];
            emailResponse = await sendAndLogEmail({
                from: 'Krishna Naturals <hello@krishnanaturals.co.in>',
                to: contactRecipients,
                subject: `New Contact Form Message: ${payload.subject}`,
                html: `
                    <h2>New Message from Contact Form</h2>
                    <p><strong>From:</strong> ${payload.name} (${payload.email})</p>
                    <p><strong>Subject:</strong> ${payload.subject}</p>
                    <hr />
                    <p><strong>Message:</strong></p>
                    <p>${payload.message.replace(/\n/g, '<br />')}</p>
                `,
                emailType: 'NEW_CONTACT_MESSAGE',
            });
        }
        else if (type === 'TICKET_REPLY') {
            emailResponse = await sendAndLogEmail({
                from: 'Krishna Naturals Support <hello@krishnanaturals.co.in>',
                to: recipients,
                subject: `Re: ${payload.subject}`,
                html: `
                    <h2>Update on your support ticket</h2>
                    <p>Hello,</p>
                    <p>Our team has replied to your ticket: <strong>${payload.subject}</strong></p>
                    <hr />
                    <p><strong>Reply:</strong></p>
                    <p>${payload.reply.replace(/\n/g, '<br />')}</p>
                    <hr />
                    <p><small>If you have any further questions, you can reply directly to this email or submit a new contact form.</small></p>
                `,
                emailType: 'TICKET_REPLY',
            });
        }
        else {
            return NextResponse.json({ error: 'Invalid email type' }, { status: 400 });
        }

        if (emailResponse.error) {
            console.error("Email Tracker Error:", emailResponse.error);
            return NextResponse.json({ error: emailResponse.error }, { status: 500 });
        }

        return NextResponse.json({ success: true, id: emailResponse.id });

    } catch (error) {
        console.error('Email sending failed:', error);
        return NextResponse.json({ error: 'Internal server error while sending email' }, { status: 500 });
    }
}
