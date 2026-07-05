import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Preview,
    Section,
    Text,
} from '@react-email/components';
import * as React from 'react';

interface NewOrderNotificationProps {
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    totalAmount: number;
    subtotal: number;
    shippingFee: number;
    discountAmount?: number;
    couponCode?: string;
    paymentMethod: string;
    items: Array<{ name: string; quantity: number; price: number }>;
    shippingAddress: string;
    orderDate: string;
}

export const NewOrderNotification = ({
    orderNumber,
    customerName,
    customerEmail,
    customerPhone,
    totalAmount,
    subtotal,
    shippingFee,
    discountAmount = 0,
    couponCode,
    paymentMethod,
    items,
    shippingAddress,
    orderDate,
}: NewOrderNotificationProps) => {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <Html>
            <Head />
            <Preview>🛒 New Order #{orderNumber} — ₹{totalAmount.toFixed(2)} from {customerName}</Preview>
            <Body style={main}>
                <Container style={container}>
                    {/* Alert Header */}
                    <Section style={header}>
                        <Text style={headerIcon}>🛒</Text>
                        <Text style={headerTitle}>NEW ORDER RECEIVED</Text>
                        <Text style={headerSubtitle}>Order #{orderNumber}</Text>
                    </Section>

                    {/* Quick Stats */}
                    <Section style={statsRow}>
                        <table style={statsTable}>
                            <tbody>
                                <tr>
                                    <td style={statCell}>
                                        <Text style={statValue}>₹{totalAmount.toFixed(2)}</Text>
                                        <Text style={statLabel}>Order Total</Text>
                                    </td>
                                    <td style={statCell}>
                                        <Text style={statValue}>{itemCount}</Text>
                                        <Text style={statLabel}>{itemCount === 1 ? 'Item' : 'Items'}</Text>
                                    </td>
                                    <td style={statCell}>
                                        <Text style={statValue}>{paymentMethod}</Text>
                                        <Text style={statLabel}>Payment</Text>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </Section>

                    {/* Customer Details */}
                    <Section style={sectionBox}>
                        <Text style={sectionTitle}>👤 Customer Details</Text>
                        <table style={detailsTable}>
                            <tbody>
                                <tr>
                                    <td style={detailLabel}>Name</td>
                                    <td style={detailValue}>{customerName}</td>
                                </tr>
                                <tr>
                                    <td style={detailLabel}>Email</td>
                                    <td style={detailValue}>
                                        <a href={`mailto:${customerEmail}`} style={linkStyle}>{customerEmail}</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td style={detailLabel}>Phone</td>
                                    <td style={detailValue}>
                                        <a href={`tel:${customerPhone}`} style={linkStyle}>{customerPhone}</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td style={detailLabel}>Ordered At</td>
                                    <td style={detailValue}>{orderDate}</td>
                                </tr>
                            </tbody>
                        </table>
                    </Section>

                    {/* Order Items */}
                    <Section style={sectionBox}>
                        <Text style={sectionTitle}>📦 Order Items</Text>
                        {items.map((item, index) => (
                            <Section key={index} style={itemRow}>
                                <table style={{ width: '100%' }}>
                                    <tbody>
                                        <tr>
                                            <td style={itemName}>{item.name}</td>
                                            <td style={itemQty}>×{item.quantity}</td>
                                            <td style={itemPrice}>₹{(item.price * item.quantity).toFixed(2)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </Section>
                        ))}
                        <Hr style={hr} />
                        <table style={{ width: '100%' }}>
                            <tbody>
                                <tr>
                                    <td style={summaryLabel}>Subtotal</td>
                                    <td style={summaryValue}>₹{subtotal.toFixed(2)}</td>
                                </tr>
                                {discountAmount > 0 && (
                                    <tr>
                                        <td style={summaryLabel}>Discount {couponCode ? `(${couponCode})` : ''}</td>
                                        <td style={{ ...summaryValue, color: '#16a34a' }}>-₹{discountAmount.toFixed(2)}</td>
                                    </tr>
                                )}
                                <tr>
                                    <td style={summaryLabel}>Shipping</td>
                                    <td style={summaryValue}>{shippingFee === 0 ? 'Free' : `₹${shippingFee.toFixed(2)}`}</td>
                                </tr>
                                <tr>
                                    <td style={totalLabel}>TOTAL</td>
                                    <td style={totalValue}>₹{totalAmount.toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </Section>

                    {/* Shipping Address */}
                    <Section style={sectionBox}>
                        <Text style={sectionTitle}>🚚 Ship To</Text>
                        <Text style={addressText}>{customerName}</Text>
                        <Text style={addressText}>{shippingAddress}</Text>
                        <Text style={addressText}>📞 {customerPhone}</Text>
                    </Section>

                    {/* Action Required */}
                    <Section style={actionBox}>
                        <Text style={actionText}>
                            ⚡ This order needs to be processed. Log into the admin panel to update the status.
                        </Text>
                    </Section>

                    <Hr style={hr} />
                    <Text style={footer}>
                        This is an automated notification from Krishna Naturals order system.
                    </Text>
                    <Text style={footer}>
                        © {new Date().getFullYear()} Krishna Naturals. All rights reserved.
                    </Text>
                </Container>
            </Body>
        </Html>
    );
};

// Styles
const main = {
    backgroundColor: '#f3f4f6',
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
    margin: '0 auto',
    padding: '20px 0 48px',
    width: '560px',
};

const header = {
    padding: '28px 24px',
    backgroundColor: '#dc2626',
    borderRadius: '12px 12px 0 0',
    textAlign: 'center' as const,
};

const headerIcon = {
    fontSize: '36px',
    margin: '0 0 8px',
};

const headerTitle = {
    color: '#ffffff',
    fontSize: '22px',
    fontWeight: 'bold' as const,
    letterSpacing: '3px',
    margin: '0 0 4px',
};

const headerSubtitle = {
    color: '#fecaca',
    fontSize: '14px',
    margin: '0',
    letterSpacing: '1px',
};

const statsRow = {
    backgroundColor: '#ffffff',
    padding: '20px',
    borderBottom: '1px solid #e5e7eb',
};

const statsTable = {
    width: '100%',
    textAlign: 'center' as const,
};

const statCell = {
    width: '33%',
    padding: '8px',
    verticalAlign: 'top' as const,
};

const statValue = {
    fontSize: '20px',
    fontWeight: 'bold' as const,
    color: '#1f2937',
    margin: '0 0 2px',
};

const statLabel = {
    fontSize: '11px',
    color: '#9ca3af',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    margin: '0',
};

const sectionBox = {
    backgroundColor: '#ffffff',
    padding: '20px 24px',
    marginTop: '12px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
};

const sectionTitle = {
    fontSize: '14px',
    fontWeight: 'bold' as const,
    color: '#374151',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    marginBottom: '12px',
};

const detailsTable = {
    width: '100%',
};

const detailLabel = {
    fontSize: '13px',
    color: '#9ca3af',
    padding: '6px 0',
    width: '100px',
    verticalAlign: 'top' as const,
};

const detailValue = {
    fontSize: '14px',
    color: '#1f2937',
    padding: '6px 0',
    fontWeight: '500' as const,
};

const linkStyle = {
    color: '#2563eb',
    textDecoration: 'none',
};

const itemRow = {
    padding: '8px 0',
    borderBottom: '1px solid #f3f4f6',
};

const itemName = {
    fontSize: '14px',
    color: '#1f2937',
    fontWeight: '500' as const,
};

const itemQty = {
    fontSize: '13px',
    color: '#6b7280',
    textAlign: 'center' as const,
    width: '50px',
};

const itemPrice = {
    fontSize: '14px',
    color: '#1f2937',
    textAlign: 'right' as const,
    fontWeight: '600' as const,
    width: '100px',
};

const summaryLabel = {
    fontSize: '13px',
    color: '#6b7280',
    padding: '4px 0',
};

const summaryValue = {
    fontSize: '13px',
    color: '#1f2937',
    textAlign: 'right' as const,
    padding: '4px 0',
};

const totalLabel = {
    fontSize: '15px',
    color: '#1f2937',
    fontWeight: 'bold' as const,
    padding: '8px 0 4px',
    borderTop: '2px solid #1f2937',
};

const totalValue = {
    fontSize: '18px',
    color: '#dc2626',
    fontWeight: 'bold' as const,
    textAlign: 'right' as const,
    padding: '8px 0 4px',
    borderTop: '2px solid #1f2937',
};

const addressText = {
    fontSize: '14px',
    color: '#374151',
    margin: '0 0 4px',
    lineHeight: '1.5',
};

const actionBox = {
    backgroundColor: '#fef3c7',
    padding: '16px 20px',
    borderRadius: '8px',
    marginTop: '12px',
    border: '1px solid #fcd34d',
};

const actionText = {
    fontSize: '14px',
    color: '#92400e',
    margin: '0',
    fontWeight: '500' as const,
};

const hr = {
    borderColor: '#e5e7eb',
    margin: '16px 0',
};

const footer = {
    color: '#9ca3af',
    fontSize: '12px',
    margin: '0 0 8px',
    textAlign: 'center' as const,
};

export default NewOrderNotification;
