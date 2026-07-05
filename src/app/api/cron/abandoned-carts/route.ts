import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { sendAndLogEmail } from '@/lib/email/sender';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function GET(req: Request) {
    // Only allow via cron or secure token in production
    // For now we allow open GET access for easy invocation

    try {
        const supabase = await createServerSupabaseClient();

        // Find all carts last updated MORE than 2 hours ago, and status == 'pending'
        const twoHoursAgo = new Date();
        twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);

        const { data: abandonedCarts, error: fetchError } = await supabase
            .from('abandoned_carts')
            .select('*')
            .eq('status', 'pending')
            .lt('last_updated_at', twoHoursAgo.toISOString());

        if (fetchError) throw fetchError;
        if (!abandonedCarts || abandonedCarts.length === 0) {
            return NextResponse.json({ message: "No abandoned carts to process." });
        }

        let sentCount = 0;

        // Process each and send emails
        for (const cart of abandonedCarts) {
            try {
                // Determine cart total to see if it's worth sending
                const items = cart.cart_data as Record<string, unknown>[];
                if (!items || items.length === 0) continue;

                const customerName = cart.email.split('@')[0];

                // Construct a very basic plain text layout here (In production, replace with a nice ReactEmail component like AbandonedCartEmail.tsx)
                const itemsListHtml = items.map(i => `<li>${i.name} (Qty: ${i.quantity}) - ₹${i.price}</li>`).join('');
                const htmlBody = `
                    <div style="font-family: 'Playfair Display', serif; text-align: center; color: #1a3a2a;">
                        <h1 style="color: #d4a843;">You left something sweet behind! 🍯</h1>
                        <p>Hi ${customerName},</p>
                        <p>We noticed you left some amazing items in your Krishna Naturals cart. We've saved them for you.</p>
                        <ul style="list-style-type: none; padding: 0; max-width: 400px; margin: 20px auto; text-align: left;">
                            ${itemsListHtml}
                        </ul>
                        <p>Complete your purchase now and get an exclusive 10% off with code <strong>RECOVERY10</strong> at checkout!</p>
                        <a href="https://krishnanaturals.co.in/cart" style="display: inline-block; padding: 12px 24px; background-color: #1a3a2a; color: white; text-decoration: none; border-radius: 8px; margin-top: 20px;">Return to Checkout</a>
                    </div>
                `;

                // Fire Resend email
                await sendAndLogEmail({
                    from: 'Krishna Naturals <orders@krishnanaturals.co.in>',
                    to: cart.email,
                    subject: 'You left something behind! 🍯',
                    html: htmlBody,
                    emailType: 'ABANDONED_CART',
                });

                // Update status to sent
                await supabase
                    .from('abandoned_carts')
                    .update({ status: 'sent' })
                    .eq('id', cart.id);

                sentCount++;
            } catch (innerError) {
                console.error(`Failed to completely process cart ${cart.id}`, innerError);
            }
        }

        return NextResponse.json({
            message: `Processed ${abandonedCarts.length} carts. Successfully sent ${sentCount} recovery emails.`
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message || "Failed to trigger abandoned cart emails" }, { status: 500 });
    }
}
