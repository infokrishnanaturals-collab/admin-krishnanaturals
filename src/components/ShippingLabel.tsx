import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface ShippingLabelProps {
    order: any;
}

export const ShippingLabel = React.forwardRef<HTMLDivElement, ShippingLabelProps>(({ order }, ref) => {
    if (!order) return null;

    // A URL that the delivery agent or admin can scan to update status
    const adminUrl = `https://krishnanaturals.co.in/admin/orders?search=${order.order_number}`;

    return (
        <div ref={ref} className="p-8 bg-white text-black font-sans w-[4in] min-h-[6in] mx-auto box-border border border-dashed border-gray-300" style={{ printColorAdjust: 'exact' }}>
            {/* Header */}
            <div className="flex justify-between items-center border-b-4 border-black pb-4 mb-6">
                <div>
                    <h1 className="text-2xl font-black uppercase">Krishna Naturals</h1>
                    <p className="text-xs font-bold mt-1 tracking-wider uppercase">Priority Shipping</p>
                </div>
                <div className="text-right">
                    <img src="https://krishnanaturals.co.in/images/logo.png" alt="Logo" className="w-12 inline-block grayscale" />
                </div>
            </div>

            {/* Ship To */}
            <div className="mb-8">
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-2 border-b border-gray-300 pb-1">Ship To:</h2>
                <div className="text-xl font-black mb-1">{order.shipping_details?.fullName}</div>
                <div className="text-base font-semibold leading-relaxed">
                    {order.shipping_details?.address}<br />
                    {order.shipping_details?.city}, {order.shipping_details?.state}<br />
                    {order.shipping_details?.pinCode}
                </div>
                <div className="text-sm font-bold mt-2">Ph: {order.shipping_details?.phone}</div>
            </div>

            {/* Return Address */}
            <div className="mb-8 text-xs border border-gray-300 p-3 rounded bg-gray-50">
                <strong className="uppercase">Return Address:</strong><br />
                Krishna Naturals<br />
                123 Forest Reserve Road, Gir Somnath, Gujarat 362140<br />
                Ph: +91 9999999999
            </div>

            {/* Meta, Pick List & QR */}
            <div className="flex justify-between items-end border-t-2 border-black pt-6">
                <div className="flex-1 pr-4">
                    <p className="text-sm font-bold">Order: <span className="font-mono">{order.order_number}</span></p>
                    <p className="text-xs font-semibold text-gray-600 mt-1">Weight: 1.2 kg (Est.)</p>
                    <p className="text-xs font-semibold text-gray-600 mb-2">Date: {new Date(order.created_at).toLocaleDateString()}</p>
                    
                    {/* Internal Pick List (for warehouse workers) */}
                    <div className="mt-2 pt-2 border-t-2 border-dashed border-gray-400">
                        <p className="text-xs font-black uppercase tracking-widest text-black mb-1 flex items-center gap-2">
                            <span>🛒 INTERNAL PICK LIST</span>
                        </p>
                        <p className="text-[10px] text-gray-600 mb-2">Pack exact batches below:</p>
                        {(order.order_items || order.items) && (order.order_items || order.items).length > 0 ? (
                            <ul className="text-sm font-bold font-mono space-y-2">
                                {(order.order_items || order.items).map((item: any, idx: number) => (
                                    <li key={idx} className="flex items-start gap-2 bg-gray-50 p-2 border border-gray-200 rounded">
                                        <span className="bg-black text-white px-2 py-0.5 rounded-sm">{item.quantity}x</span>
                                        <div className="flex-1">
                                            <div className="leading-tight">{item.product_name || item.name}</div>
                                            {item.batch_number ? (
                                                <div className="text-xs text-red-600 mt-0.5 font-black uppercase">
                                                    USE BATCH: {item.batch_number}
                                                </div>
                                            ) : (
                                                <div className="text-[10px] text-red-500 font-semibold uppercase mt-1">
                                                    ⚠️ Not Allocated
                                                </div>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <span className="text-xs text-gray-400 italic">No items found</span>
                        )}
                    </div>
                </div>
                <div className="flex flex-col items-center ml-4">
                    {/* The QR Code for the Scanner App */}
                    <div className="p-2 border-2 border-black bg-white rounded-lg">
                        <QRCodeSVG value={`kn_dispatch:${order.id}`} size={90} level="H" />
                    </div>
                    <span className="text-[11px] font-black uppercase mt-2 tracking-widest text-center leading-tight">Scan Box<br/>to Dispatch</span>
                </div>
            </div>
            
            {/* Courier Barcode Placeholder */}
            <div className="mt-8 text-center pt-4 border-t-2 border-dashed border-gray-400">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Courier Use Only</p>
                {/* SVG Barcode placeholder (Usually generated by Courier API) */}
                <svg width="100%" height="60px" preserveAspectRatio="none">
                    <rect width="100%" height="100%" fill="#f3f4f6" />
                    <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="#9ca3af" fontSize="12" fontWeight="bold">BARCODE PLACEMENT</text>
                </svg>
            </div>
        </div>
    );
});

ShippingLabel.displayName = 'ShippingLabel';
export default ShippingLabel;
