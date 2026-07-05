"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { toast } from "react-hot-toast";
import { useReactToPrint } from "react-to-print";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import InvoiceTemplate from "@/components/InvoiceTemplate";
import ShippingLabel from "@/components/ShippingLabel";

type OrderItem = {
    id?: string;
    title?: string;
    weight?: string;
    quantity?: number;
    price?: number;
    product_name?: string;
    product_id?: string;
};
type ShippingDetails = {
    name?: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    phone?: string;
};
type Order = {
    id: string;
    user_id?: string;
    order_number: string;
    created_at: string;
    status: string;
    total: string;
    subtotal?: string;
    shipping_fee?: string;
    discount_amount?: string;
    coupon_code?: string;
    courier_name?: string;
    tracking_number?: string;
    tracking_url?: string;
    shipping_name?: string;
    shipping_phone?: string;
    shipping_address_line1?: string;
    shipping_city?: string;
    shipping_state?: string;
    shipping_pincode?: string;
    shipping_details?: ShippingDetails | string | null;
    payment_method?: string;
    items?: OrderItem[] | string;
};

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ status: "", courier_name: "", tracking_number: "", tracking_url: "" });
    const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());
    
    // Printing state
    const [printOrder, setPrintOrder] = useState<Order | null>(null);
    const invoicePrintRef = useRef<HTMLDivElement>(null);
    const labelPrintRef = useRef<HTMLDivElement>(null);

    const handlePrintInvoice = useReactToPrint({
        contentRef: invoicePrintRef,
        documentTitle: `Invoice_${printOrder?.order_number || 'Order'}`,
        onAfterPrint: () => setPrintOrder(null)
    });

    const handlePrintLabel = useReactToPrint({
        contentRef: labelPrintRef,
        documentTitle: `Label_${printOrder?.order_number || 'Order'}`,
        onAfterPrint: () => setPrintOrder(null)
    });

    const generateInvoice = (order: Order) => {
        setPrintOrder(order);
        setTimeout(() => handlePrintInvoice(), 100);
    };

    const generateShippingLabel = async (order: Order) => {
        try {
            toast.loading("Allocating inventory...", { id: 'alloc' });
            await fetch(process.env.NEXT_PUBLIC_API_URL + `/admin/orders/${order.id}/allocate`, { method: 'POST' });
            
            const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/orders');
            if (!res.ok) throw new Error("Failed to refetch");
            const data = await res.json();
            setOrders(data);
            
            const updatedOrder = data.find((o: Order) => o.id === order.id) || order;
            toast.success("Inventory allocated for Pick List!", { id: 'alloc' });
            
            setPrintOrder(updatedOrder);
            setTimeout(() => handlePrintLabel(), 100);
        } catch (e) {
            console.error(e);
            toast.error("Failed to allocate inventory", { id: 'alloc' });
            // Fallback: print anyway
            setPrintOrder(order);
            setTimeout(() => handlePrintLabel(), 100);
        }
    };

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/orders');
            if (!res.ok) throw new Error("Failed to load orders");
            const data = await res.json();
            setOrders(data);
        } catch (e) {
            toast.error("Failed to load orders");
        }
        setLoading(false);
    }, []);

    useEffect(() => {
         
        fetchOrders();
    }, [fetchOrders]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedOrderIds(new Set(orders.map(o => o.id)));
        } else {
            setSelectedOrderIds(new Set());
        }
    };

    const handleSelectOrder = (id: string) => {
        const newSelected = new Set(selectedOrderIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedOrderIds(newSelected);
    };

    const handleEditClick = (order: Order) => {
        setEditingOrderId(order.id);
        setEditForm({
            status: order.status || "pending",
            courier_name: order.courier_name || "",
            tracking_number: order.tracking_number || "",
            tracking_url: order.tracking_url || ""
        });
    };

    const handleSaveStatus = async (orderId: string) => {
        const order = orders.find(o => o.id === orderId);
        
        try {
            const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/orders', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId,
                    status: editForm.status,
                    courier_name: editForm.courier_name,
                    tracking_number: editForm.tracking_number,
                    tracking_url: editForm.tracking_url
                })
            });

            if (!res.ok) throw new Error("Failed to update order");
            
            const data = await res.json();
            toast.success("Order updated successfully!");

            // Trigger Status Update Email
            try {
                const recipientEmail = data.user_email || null;

                // Prepare order details for email
                let sd: ShippingDetails | null = null;
                if (order?.shipping_details) {
                    sd = typeof order.shipping_details === 'string'
                        ? JSON.parse(order.shipping_details)
                        : order.shipping_details;
                }

                const customerName = sd?.name || order?.shipping_name || "Customer";
                const shippingAddress = sd
                    ? `${sd.address || ""}, ${sd.city || ""}, ${sd.state || ""} ${sd.postalCode || ""}`
                    : `${order?.shipping_address_line1 || ""}, ${order?.shipping_city || ""}, ${order?.shipping_state || ""} ${order?.shipping_pincode || ""}`;

                let rawItems: OrderItem[] = [];
                if (order?.items) {
                    rawItems = typeof order.items === 'string' ? JSON.parse(order.items) : order.items as OrderItem[];
                    if (!Array.isArray(rawItems)) rawItems = [];
                }

                // We ALWAYS send the email. The API now handles CC'ing the admin.
                // If recipientEmail is null, it will only go to the Admin.
                await fetch(process.env.NEXT_PUBLIC_API_URL + '/emails', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: recipientEmail || (process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? ''), // Fallback to admin if customer email missing
                        type: 'ORDER_STATUS_UPDATE',
                        payload: {
                            status: editForm.status,
                            orderNumber: order?.order_number || "Unknown",
                            customerName,
                            totalAmount: parseFloat(order?.total || "0") || 0,
                            items: rawItems.map((i: OrderItem) => ({
                                name: i.title || i.product_name || "Product",
                                quantity: i.quantity || 1,
                                price: i.price || 0
                            })),
                            shippingAddress,
                            trackingNumber: editForm.tracking_number,
                            trackingUrl: editForm.tracking_url
                        }
                    })
                });
                console.log(`Status email process completed for order ${order?.order_number}`);
            } catch (emailErr) {
                console.error("Failed to process status update email:", emailErr);
            }

            setEditingOrderId(null);
            fetchOrders();
        } catch (e) {
            toast.error("Failed to update order");
        }
    };


    const handleBulkStatusUpdate = async (status: string) => {
        if (selectedOrderIds.size === 0) return;
        const confirmMsg = `Are you sure you want to mark ${selectedOrderIds.size} orders as ${status.toUpperCase()}?`;
        if (!confirm(confirmMsg)) return;

        try {
            const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/orders', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderIds: Array.from(selectedOrderIds), status })
            });

            if (!res.ok) throw new Error("Failed to update orders");

            toast.success(`${selectedOrderIds.size} orders marked as ${status}.`);
            
            // Trigger emails for each selected order
            const selectedOrders = orders.filter(o => selectedOrderIds.has(o.id));
            
            // We do this in parallel to be fast, but with a small delay between batches if needed.
            // For now, simple Promise.all is fine for reasonable numbers of orders.
            Promise.all(selectedOrders.map(async (order) => {
                try {
                    // Skip querying profile directly, API handles it now or we just fallback to admin.
                    // For bulk, let's just email the admin and whichever ones we have emails for.
                    const recipientEmail = null;

                    let sd: ShippingDetails | null = null;
                    if (order.shipping_details) {
                        sd = typeof order.shipping_details === 'string' ? JSON.parse(order.shipping_details) : order.shipping_details;
                    }
                    const customerName = sd?.name || order.shipping_name || "Customer";
                    const shippingAddress = sd
                        ? `${sd.address || ""}, ${sd.city || ""}, ${sd.state || ""} ${sd.postalCode || ""}`
                        : `${order.shipping_address_line1 || ""}, ${order.shipping_city || ""}, ${order.shipping_state || ""} ${order.shipping_pincode || ""}`;

                    let rawItems: OrderItem[] = [];
                    if (order.items) {
                        rawItems = typeof order.items === 'string' ? JSON.parse(order.items) : order.items as OrderItem[];
                    }

                    await fetch(process.env.NEXT_PUBLIC_API_URL + '/emails', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            to: recipientEmail || (process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? ''),
                            type: 'ORDER_STATUS_UPDATE',
                            payload: {
                                status: status,
                                orderNumber: order.order_number,
                                customerName,
                                totalAmount: parseFloat(order.total) || 0,
                                items: rawItems.map((i: OrderItem) => ({
                                    name: i.title || i.product_name || "Product",
                                    quantity: i.quantity || 1,
                                    price: i.price || 0
                                })),
                                shippingAddress
                            }
                        })
                    });
                } catch (e) {
                    console.error(`Bulk email failed for order ${order.order_number}:`, e);
                }
            })).then(() => {
                console.log("Bulk status emails processed.");
            });

            setSelectedOrderIds(new Set());
            fetchOrders();
        } catch (e) {
            toast.error("Failed to update orders");
        }
    };

    const generateBulkShippingLabels = () => {
        if (selectedOrderIds.size === 0) return;
        const selectedOrders = orders.filter(o => selectedOrderIds.has(o.id));
        const doc = new jsPDF({ format: [100, 150] });

        selectedOrders.forEach((order, index) => {
            if (index > 0) doc.addPage();

            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text("SHIPPING LABEL", 10, 15);

            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text("FROM:", 10, 25);
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.text("Krishna Naturals", 10, 31);
            doc.setFont("helvetica", "normal");
            doc.text("Madhapar, Bhuj, Gujarat - 370020\nPh: +91 9408724778", 10, 36);

            doc.line(10, 45, 90, 45);

            doc.setFontSize(10);
            doc.text("TO:", 10, 53);

            const sd = typeof order.shipping_details === 'string' ? JSON.parse(order.shipping_details) : order.shipping_details;
            doc.setFont("helvetica", "bold");
            doc.text(sd?.name?.toUpperCase() || "CUSTOMER", 10, 59);

            doc.setFont("helvetica", "normal");
            const addressLines = doc.splitTextToSize(sd?.address || "", 80);
            doc.text(addressLines, 10, 65);

            const nextY = 65 + (addressLines.length * 5);
            doc.text(`${sd?.city || ""}, ${sd?.state || ""}`, 10, nextY);
            doc.text(`PIN: ${sd?.postalCode || ""}`, 10, nextY + 5);
            doc.text(`Ph: ${sd?.phone || ""}`, 10, nextY + 10);

            doc.line(10, 95, 90, 95);

            doc.setFontSize(10);
            doc.text(`Order: ${order.order_number}`, 10, 105);
            doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, 10, 111);
            doc.text(`Weight: ________`, 10, 117);

            const isCOD = order.payment_method === 'cod';
            doc.setFont("helvetica", "bold");
            doc.text(`Payment: ${isCOD ? 'COD' : 'PREPAID'}`, 10, 125);

            if (isCOD) {
                doc.setFontSize(14);
                doc.text(`COLLECT CASH: Rs. ${parseFloat(order.total).toFixed(2)}`, 10, 135);
            }
        });

        doc.save(`Bulk_Shipping_Labels_${Date.now()}.pdf`);
        toast.success(`Exported ${selectedOrders.length} shipping labels.`);
        setSelectedOrderIds(new Set());
    };

    const generateBulkInvoices = () => {
        if (selectedOrderIds.size === 0) return;
        const selectedOrders = orders.filter(o => selectedOrderIds.has(o.id));
        const doc = new jsPDF();

        selectedOrders.forEach((order, index) => {
            if (index > 0) doc.addPage();

            doc.setFontSize(22);
            doc.setFont("helvetica", "bold");
            doc.text("KRISHNA NATURALS", 14, 20);
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text("Madhapar, Bhuj, Gujarat - 370020", 14, 26);
            doc.text(process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@krishnanaturals.co.in", 14, 30);
            doc.text("Ph: +91 9408724778", 14, 34);

            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text("TAX INVOICE", 150, 20);
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text(`Order #: ${order.order_number}`, 150, 26);
            doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, 150, 30);
            doc.text(`Payment: ${order.payment_method?.toUpperCase() || 'PREPAID'}`, 150, 34);

            doc.line(14, 40, 196, 40);

            const sd = typeof order.shipping_details === 'string' ? JSON.parse(order.shipping_details) : order.shipping_details;
            doc.setFont("helvetica", "bold");
            doc.text("BILL TO / SHIP TO:", 14, 48);
            doc.setFont("helvetica", "normal");
            doc.text(sd?.name || "Customer", 14, 54);
            const addressLines = doc.splitTextToSize(sd?.address || "", 80);
            doc.text(addressLines, 14, 59);
            const addrY = 59 + (addressLines.length * 4);
            doc.text(`${sd?.city || ""} ${sd?.state || ""} - ${sd?.postalCode || ""}`, 14, addrY);
            doc.text(`Ph: ${sd?.phone || ""}`, 14, addrY + 5);

            let items = [];
            try { items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items; } catch { }
            if (!Array.isArray(items)) items = [];

            autoTable(doc, {
                startY: 85,
                head: [['Item', 'Weight', 'Qty', 'Unit Price', 'Total']],
                body: items.map((item: OrderItem) => [
                    item.title || item.product_name || 'Product',
                    item.weight || '-',
                    item.quantity || 1,
                    `Rs. ${Number(item.price).toFixed(2)}`,
                    `Rs. ${(Number(item.price) * (item.quantity || 1)).toFixed(2)}`
                ]),
                theme: 'striped',
                headStyles: { fillColor: [26, 58, 42] }
            });

            const finalY = (doc as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY || 100;

            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text(`TOTAL AMOUNT: Rs. ${parseFloat(order.total).toFixed(2)}`, 130, finalY + 10);
        });

        doc.save(`Bulk_Invoices_${Date.now()}.pdf`);
        toast.success(`Exported ${selectedOrders.length} invoices.`);
        setSelectedOrderIds(new Set());
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="h-24 bg-white/40 animate-pulse rounded-2xl border border-white/60"></div>
                <div className="h-[500px] bg-white/40 animate-pulse rounded-2xl border border-white/60"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto pb-24 relative">
            <h1 className="admin-heading mb-1">
                Order Management
            </h1>
            <p className="admin-subheading mb-6">Manage, track, and export your orders</p>

            <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_-12px_rgba(20,58,42,0.1)] rounded-3xl overflow-hidden fade-in relative z-10">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                <th className="px-6 py-4 w-12">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-gray-300 text-[var(--gold)] focus:ring-[var(--gold)]"
                                        checked={selectedOrderIds.size === orders.length && orders.length > 0}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order #</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tracking Info</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.map((order) => (
                                <tr key={order.id} className="hover:bg-white/80 transition-colors group">
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-gray-300 text-[var(--gold)] focus:ring-[var(--gold)]"
                                            checked={selectedOrderIds.has(order.id)}
                                            onChange={() => handleSelectOrder(order.id)}
                                        />
                                    </td>
                                <td className="px-6 py-4 font-semibold text-gray-900 group-hover:text-[var(--forest-dark)] transition-colors">{order.order_number}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>

                                <td className="px-6 py-4">
                                    {editingOrderId === order.id ? (
                                        <select
                                            className="w-full bg-white/50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/50 transition-all"
                                            value={editForm.status}
                                            onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="processing">Processing</option>
                                            <option value="shipped">Shipped</option>
                                            <option value="delivered">Delivered</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    ) : (
                                        <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border
                                                ${order.status === 'delivered' ? 'bg-green-50 text-green-700 border-green-200' :
                                                order.status === 'shipped' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                    order.status === 'processing' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                        order.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' : 
                                                        'bg-gray-100 text-gray-700 border-gray-200'}`}
                                        >
                                            <span className="capitalize">{order.status || 'pending'}</span>
                                        </div>
                                    )}
                                </td>

                                <td className="px-6 py-4 font-bold text-[var(--forest-dark)]">₹{parseFloat(order.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>

                                <td className="px-6 py-4">
                                    {editingOrderId === order.id ? (
                                        <div className="space-y-2">
                                            <input
                                                type="text" placeholder="Courier Name" className="w-full bg-white/50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/50 transition-all"
                                                value={editForm.courier_name} onChange={(e) => setEditForm({ ...editForm, courier_name: e.target.value })}
                                            />
                                            <input
                                                type="text" placeholder="Tracking Number" className="w-full bg-white/50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/50 transition-all"
                                                value={editForm.tracking_number} onChange={(e) => setEditForm({ ...editForm, tracking_number: e.target.value })}
                                            />
                                            <input
                                                type="text" placeholder="Tracking URL (https://...)" className="w-full bg-white/50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/50 transition-all"
                                                value={editForm.tracking_url} onChange={(e) => setEditForm({ ...editForm, tracking_url: e.target.value })}
                                            />
                                        </div>
                                    ) : (
                                        <div className="text-sm">
                                            {order.courier_name ? (
                                                <div>
                                                    <strong className="text-gray-900">{order.courier_name}</strong>
                                                    <p className="text-xs text-gray-500 mt-0.5">{order.tracking_number}</p>
                                                    {order.tracking_url && <a href={order.tracking_url} target="_blank" rel="noreferrer" className="text-[11px] font-semibold text-[var(--gold)] hover:text-yellow-600 uppercase tracking-wider inline-block mt-1">Track Order →</a>}
                                                </div>
                                            ) : <span className="text-xs italic text-gray-400">None</span>}
                                        </div>
                                    )}
                                </td>

                                <td className="px-6 py-4 text-right">
                                    {editingOrderId === order.id ? (
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleSaveStatus(order.id)} className="admin-btn-primary px-3 py-1.5 text-xs">Save</button>
                                            <button onClick={() => setEditingOrderId(null)} className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50">Cancel</button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-2 items-end">
                                            <button onClick={() => handleEditClick(order)} className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors">
                                                Manage Tracking
                                            </button>
                                            {order.shipping_phone && (
                                                <a 
                                                    href={`https://wa.me/${order.shipping_phone.replace(/\D/g, '')}?text=Hi%20${(order.shipping_name || 'Customer').split(' ')[0]},%20this%20is%20regarding%20your%20order%20${order.order_number}%20from%20Krishna%20Naturals.`}
                                                    target="_blank" rel="noreferrer"
                                                    className="text-[11px] font-bold text-green-600 hover:text-green-800 transition-colors flex items-center gap-1"
                                                >
                                                    WhatsApp Msg
                                                </a>
                                            )}
                                            <div className="flex gap-2 text-[11px] text-gray-500 font-medium mt-1">
                                                <button onClick={() => generateInvoice(order)} className="hover:text-[var(--forest-dark)] transition-colors">↓ Invoice</button>
                                                <span className="text-gray-300">|</span>
                                                <button onClick={() => generateShippingLabel(order)} className="hover:text-[var(--forest-dark)] transition-colors">↓ Label</button>
                                            </div>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {orders.length === 0 && (
                            <tr>
                                <td colSpan={7}>
                                    <div className="py-16 text-center flex flex-col items-center">
                                        <h3 className="text-gray-900 font-medium mb-1">No orders found</h3>
                                        <p className="text-gray-500 text-sm">When customers place orders, they will appear here.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>


            {/* Bulk Actions Floating Bar */}
            {selectedOrderIds.size > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-8 px-6 py-4 rounded-xl flex items-center gap-6 z-50 bg-white shadow-xl border border-gray-200">
                    <span className="font-bold pr-6 border-r border-gray-200 text-[var(--forest-dark)]">
                        {selectedOrderIds.size} Selected
                    </span>
                    <div className="flex items-center gap-3">
                        <button onClick={generateBulkShippingLabels} className="admin-btn-secondary">
                            Print Labels
                        </button>
                        <button onClick={generateBulkInvoices} className="admin-btn-secondary">
                            Print Invoices
                        </button>
                        <select
                            className="admin-input w-auto"
                            onChange={(e) => {
                                if (e.target.value) {
                                    handleBulkStatusUpdate(e.target.value);
                                    e.target.value = ""; // reset
                                }
                            }}
                        >
                            <option value="">Status...</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                        </select>
                    </div>
                </div>
            )}

            {/* Hidden Print Containers */}
            <div className="hidden">
                <InvoiceTemplate ref={invoicePrintRef} order={printOrder} />
                <ShippingLabel ref={labelPrintRef} order={printOrder} />
            </div>
        </div>
    );
}
