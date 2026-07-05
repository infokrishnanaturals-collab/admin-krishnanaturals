import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Preview,
    Section,
    Text,
} from '@react-email/components';
import * as React from 'react';

interface OrderReceiptEmailProps {
    orderNumber: string;
    customerName: string;
    totalAmount: number;
    items: Array<{ name: string; quantity: number; price: number }>;
    shippingAddress: string;
    isShipped?: boolean; // Keep for backwards compatibility
    status?: string;
    trackingNumber?: string;
    trackingUrl?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://krishnanaturals.co.in';

export const OrderReceiptEmail = ({
    orderNumber,
    customerName,
    totalAmount,
    items,
    shippingAddress,
    isShipped = false,
    status = 'pending',
    trackingNumber,
    trackingUrl,
}: OrderReceiptEmailProps) => {
    // Determine the status string (default to shipped if isShipped is true for backward compat)
    const currentStatus = isShipped ? 'shipped' : status.toLowerCase();
    
    let previewText = `Thank you for your order #${orderNumber} from Krishna Naturals.`;
    let headingText = 'Thank you for your order!';
    let bodyText = `We've successfully received your order ${orderNumber}. We'll notify you once it's processed.`;

    if (currentStatus === 'processing') {
        previewText = `Good news! Your Order #${orderNumber} is now being processed.`;
        headingText = 'Your Order is Processing!';
        bodyText = `Our team is carefully preparing and packaging your order ${orderNumber}. We'll let you know when it ships.`;
    } else if (currentStatus === 'shipped') {
        previewText = `Great news! Your Order #${orderNumber} has shipped.`;
        headingText = 'Your Order is on the way!';
        bodyText = `We’re excited to let you know that your order ${orderNumber} has been shipped and is on its way to you.`;
    } else if (currentStatus === 'delivered') {
        previewText = `Your Order #${orderNumber} has been delivered!`;
        headingText = 'Order Delivered!';
        bodyText = `Your order ${orderNumber} has been delivered. We hope you enjoy your pure honey!`;
    } else if (currentStatus === 'cancelled') {
        previewText = `Update regarding your Order #${orderNumber}.`;
        headingText = 'Order Cancelled';
        bodyText = `Your order ${orderNumber} has been cancelled. If you have any questions, please reply to this email.`;
    }

    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Section style={header}>
                        <Text style={brandName}>Krishna Naturals</Text>
                    </Section>

                    <Heading style={heading}>
                        {headingText}
                    </Heading>

                    <Text style={paragraph}>
                        Hi {customerName},
                    </Text>
                    <Text style={paragraph}>
                        {bodyText}
                    </Text >

                    {(trackingNumber || trackingUrl) && (
                        <Section style={trackingBox}>
                            {trackingNumber && (
                                <Text style={trackingText}>Tracking Number: <strong>{trackingNumber}</strong></Text>
                            )}
                            {trackingUrl && (
                                <Text style={trackingText}>
                                    <a href={trackingUrl} style={button}>Track Package</a>
                                </Text>
                            )}
                        </Section>
                    )}

                    <Section style={orderTable}>
                        <Text style={tableHeading}>Order Summary</Text>
                        {items.map((item, index) => (
                            <Text key={index} style={itemText}>
                                {item.quantity}x {item.name} - ₹{(item.price * item.quantity).toFixed(2)}
                            </Text>
                        ))}
                        <Hr style={hr} />
                        <Text style={totalText}>Total: ₹{totalAmount.toFixed(2)}</Text>
                    </Section>

                    <Text style={paragraph}>
                        <strong>Shipping To:</strong><br />
                        {shippingAddress}
                    </Text>

                    <Hr style={hr} />
                    <Text style={footer}>
                        If you have any questions, please reply to this email or contact us at support@krishnanaturals.co.in.
                    </Text>
                    <Text style={footer}>
                        © {new Date().getFullYear()} Krishna Naturals. All rights reserved.
                    </Text>
                </Container >
            </Body >
        </Html >
    );
};

// Styles
const main = {
    backgroundColor: '#FFF8E7', /* Cream background from brand */
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
    margin: '0 auto',
    padding: '20px 0 48px',
    width: '560px',
};

const header = {
    padding: '24px',
    backgroundColor: '#1B4332', /* Forest Green */
    borderRadius: '8px 8px 0 0',
    textAlign: 'center' as const,
};

const brandName = {
    color: '#D4A843', /* Gold */
    fontSize: '24px',
    fontWeight: 'bold',
    letterSpacing: '2px',
    textTransform: 'uppercase' as const,
    margin: '0',
};

const heading = {
    fontSize: '24px',
    letterSpacing: '-0.5px',
    lineHeight: '1.3',
    fontWeight: '400',
    color: '#3E2723', /* Brown */
    padding: '17px 0 0',
};

const paragraph = {
    margin: '0 0 15px',
    fontSize: '15px',
    lineHeight: '1.4',
    color: '#3c4149',
};

const trackingBox = {
    padding: '20px',
    backgroundColor: '#e6f4ea',
    borderRadius: '4px',
    marginBottom: '24px',
    textAlign: 'center' as const,
};

const trackingText = {
    fontSize: '16px',
    color: '#1B4332',
    margin: '0 0 10px',
};

const button = {
    backgroundColor: '#1B4332',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '15px',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    width: '210px',
    padding: '14px 7px',
    fontWeight: 'bold',
};

const orderTable = {
    padding: '20px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e5e5e5',
    marginBottom: '24px',
};

const tableHeading = {
    fontSize: '18px',
    color: '#1B4332',
    fontWeight: 'bold',
    marginBottom: '15px',
};

const itemText = {
    fontSize: '14px',
    color: '#555',
    margin: '0 0 8px',
};

const totalText = {
    fontSize: '18px',
    color: '#3E2723',
    fontWeight: 'bold',
    marginTop: '15px',
    textAlign: 'right' as const,
};

const hr = {
    borderColor: '#e5e5e5',
    margin: '20px 0',
};

const footer = {
    color: '#8898aa',
    fontSize: '12px',
    margin: '0 0 10px',
};

export default OrderReceiptEmail;
