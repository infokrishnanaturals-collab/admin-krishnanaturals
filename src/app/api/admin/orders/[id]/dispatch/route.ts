import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const supabase = await createServerSupabaseClient();
        const p = await params;
        const orderId = p.id;

        const body = await req.json();
        const { courier_name, tracking_number } = body;

        if (!courier_name || !tracking_number) {
            return NextResponse.json({ error: "Courier name and tracking number are required." }, { status: 400 });
        }

        // Generate tracking URL based on courier name
        let tracking_url = "";
        const cname = courier_name.toLowerCase();
        if (cname.includes("delhivery")) tracking_url = `https://www.delhivery.com/track/package/${tracking_number}`;
        else if (cname.includes("bluedart")) tracking_url = `https://www.bluedart.com/tracking?trackNo=${tracking_number}`;
        else if (cname.includes("ecom")) tracking_url = `https://ecomexpress.in/tracking/?awb_no=${tracking_number}`;
        else if (cname.includes("dtdc")) tracking_url = `https://www.dtdc.in/tracking/tracking_results.asp?trknos=${tracking_number}`;
        else if (cname.includes("india post") || cname.includes("speed post")) tracking_url = `https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx`;

        // 1. Update Order Status
        const { data: updatedOrder, error: updateError } = await supabase
            .from('orders')
            .update({
                status: 'shipped',
                courier_name,
                tracking_number,
                tracking_url
            })
            .eq('id', orderId)
            .select('*')
            .single();

        if (updateError) throw updateError;

        // 2. Trigger Email via our existing internal API
        try {
            let recipientEmail = null;
            if (updatedOrder.user_id) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('email')
                    .eq('id', updatedOrder.user_id)
                    .single();
                if (profile) recipientEmail = profile.email;
            }

            let sd = updatedOrder.shipping_details;
            if (sd && typeof sd === 'string') sd = JSON.parse(sd);
            
            const customerName = sd?.name || updatedOrder.shipping_name || "Customer";
            const shippingAddress = sd
                ? `${sd.address || ""}, ${sd.city || ""}, ${sd.state || ""} ${sd.postalCode || ""}`
                : `${updatedOrder.shipping_address_line1 || ""}, ${updatedOrder.shipping_city || ""}, ${updatedOrder.shipping_state || ""} ${updatedOrder.shipping_pincode || ""}`;

            const { data: orderItems } = await supabase
                .from('order_items')
                .select('*')
                .eq('order_id', orderId);

            const protocol = req.headers.get("x-forwarded-proto") || "http";
            const host = req.headers.get("host") || "localhost:3000";
            const baseUrl = `${protocol}://${host}`;

            await fetch(`${baseUrl}/api/emails`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: recipientEmail || (process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? ''),
                    type: 'ORDER_STATUS_UPDATE',
                    payload: {
                        status: 'shipped',
                        orderNumber: updatedOrder.order_number || "Unknown",
                        customerName,
                        totalAmount: parseFloat(updatedOrder.total || "0") || 0,
                        items: (orderItems || []).map((i: any) => ({
                            name: i.product_name || "Product",
                            quantity: i.quantity || 1,
                            price: i.price || 0
                        })),
                        shippingAddress,
                        trackingNumber: tracking_number,
                        trackingUrl: tracking_url
                    }
                })
            });
        } catch (emailErr) {
            console.error("Failed to send dispatch email:", emailErr);
        }

        return NextResponse.json({ success: true, message: "Order dispatched successfully!" });
    } catch (e: any) {
        console.error("Dispatch Error:", e);
        return NextResponse.json({ error: e.message || "Failed to dispatch order" }, { status: 500 });
    }
}
