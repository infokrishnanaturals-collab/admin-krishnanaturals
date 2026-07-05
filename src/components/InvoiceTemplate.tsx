import React from 'react';

interface InvoiceProps {
    order: any; // Using any for rapid prototyping; replace with strict Order type
}

export const InvoiceTemplate = React.forwardRef<HTMLDivElement, InvoiceProps>(({ order }, ref) => {
    if (!order) return null;

    // Supabase join returns order_items, not items
    const items = order.order_items || order.items || [];
    const date = new Date(order.created_at).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric'
    });

    return (
        <div ref={ref} className="p-10 bg-white text-black font-sans w-[210mm] min-h-[297mm] mx-auto box-border" style={{ printColorAdjust: 'exact' }}>
            {/* Header */}
            <div className="flex justify-between items-start mb-12 border-b-2 border-gray-900 pb-6">
                <div>
                    {/* Using an img tag instead of Next/Image for raw printing */}
                    <img src="https://krishnanaturals.co.in/images/logo.png" alt="Krishna Naturals" className="w-24 mb-4" />
                    <h1 className="text-3xl font-serif font-bold text-[#1B4332]">INVOICE</h1>
                    <p className="text-sm text-gray-600 mt-1">Invoice #{order.order_number}</p>
                    <p className="text-sm text-gray-600">Date: {date}</p>
                </div>
                <div className="text-right text-sm text-gray-700">
                    <h2 className="font-bold text-gray-900 text-base mb-1">Krishna Naturals</h2>
                    <p>123 Forest Reserve Road</p>
                    <p>Gir Somnath, Gujarat 362140</p>
                    <p>FSSAI: 10019021000001</p>
                    <p>GSTIN: 24AAAAA0000A1Z5</p>
                </div>
            </div>

            {/* Bill To & Ship To */}
            <div className="flex justify-between mb-12">
                <div className="w-1/2 pr-4">
                    <h3 className="font-bold text-gray-900 border-b border-gray-200 pb-2 mb-3 uppercase text-xs tracking-widest">Billed To</h3>
                    <p className="font-semibold">{order.shipping_details?.fullName || 'Customer'}</p>
                    <p className="text-sm text-gray-600 mt-1">{order.shipping_details?.address}</p>
                    <p className="text-sm text-gray-600">{order.shipping_details?.city}, {order.shipping_details?.state} {order.shipping_details?.pinCode}</p>
                    <p className="text-sm text-gray-600 mt-1">Phone: {order.shipping_details?.phone}</p>
                </div>
            </div>

            {/* Items Table */}
            <table className="w-full mb-12">
                <thead>
                    <tr className="border-b-2 border-gray-900 text-left">
                        <th className="py-3 px-2 font-bold text-sm uppercase tracking-wider">Item</th>
                        <th className="py-3 px-2 font-bold text-sm uppercase tracking-wider text-center">Qty</th>
                        <th className="py-3 px-2 font-bold text-sm uppercase tracking-wider text-right">Price</th>
                        <th className="py-3 px-2 font-bold text-sm uppercase tracking-wider text-right">Total</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {items.map((item: any, index: number) => (
                        <tr key={index}>
                            <td className="py-4 px-2">
                                <p className="font-semibold text-gray-900">{item.name}</p>
                            </td>
                            <td className="py-4 px-2 text-center text-gray-700">{item.quantity}</td>
                            <td className="py-4 px-2 text-right text-gray-700">₹{item.price}</td>
                            <td className="py-4 px-2 text-right font-medium text-gray-900">₹{item.price * item.quantity}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end">
                <div className="w-64">
                    <div className="flex justify-between py-2 text-sm text-gray-600">
                        <span>Subtotal:</span>
                        <span>₹{order.total}</span>
                    </div>
                    <div className="flex justify-between py-2 text-sm text-gray-600 border-b border-gray-200">
                        <span>Shipping:</span>
                        <span>Free</span>
                    </div>
                    <div className="flex justify-between py-3 text-lg font-bold text-gray-900">
                        <span>Total:</span>
                        <span>₹{order.total}</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-24 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
                <p className="font-medium text-gray-700 mb-1">Thank you for your business!</p>
                <p>For support, visit krishnanaturals.co.in/contact | Returns valid within 7 days of delivery.</p>
                <p className="mt-4 italic">This is a computer-generated document. No signature is required.</p>
            </div>
        </div>
    );
});

InvoiceTemplate.displayName = 'InvoiceTemplate';
export default InvoiceTemplate;
