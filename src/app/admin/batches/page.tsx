"use client";

import { useEffect, useState, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { QRCodeSVG } from "qrcode.react";
import { useReactToPrint } from "react-to-print";
import { toast } from "react-hot-toast";

// @ts-ignore
const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function BatchesPage() {
    const [batches, setBatches] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [newBatch, setNewBatch] = useState({
        product_id: "",
        batch_number: "",
        manufacture_date: "",
        expiry_date: "",
        stock_quantity: 0
    });

    const printRef = useRef<HTMLDivElement>(null);
    const [printingBatch, setPrintingBatch] = useState<any>(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Batch_QR_${printingBatch?.batch_number}`,
        onAfterPrint: () => setPrintingBatch(null),
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/batches');
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.error || 'Failed to load data');

            setBatches(data.batches || []);
            setProducts(data.products || []);
        } catch (err: any) {
            toast.error("Failed to load data: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBatch = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const qrData = JSON.stringify({
                batch: newBatch.batch_number,
                product: newBatch.product_id
            });
            
            const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/batches', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newBatch,
                    qr_code_data: qrData
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to create batch');

            toast.success("Batch created successfully!");
            setNewBatch({ product_id: "", batch_number: "", manufacture_date: "", expiry_date: "", stock_quantity: 0 });
            fetchData();
        } catch (err: any) {
            toast.error("Error creating batch: " + err.message);
        }
    };

    const triggerPrint = (batch: any) => {
        setPrintingBatch(batch);
        setTimeout(() => {
            handlePrint();
        }, 100);
    };

    if (loading) return <div className="p-8">Loading batches...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Batch Management</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Create Batch Form */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm col-span-1 h-fit">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">New Batch Entry</h2>
                    <form onSubmit={handleCreateBatch} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                            <select 
                                required
                                value={newBatch.product_id}
                                onChange={(e) => setNewBatch({...newBatch, product_id: e.target.value})}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500"
                            >
                                <option value="">Select a product...</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number</label>
                            <input 
                                type="text" required placeholder="e.g. BATCH-100"
                                value={newBatch.batch_number}
                                onChange={(e) => setNewBatch({...newBatch, batch_number: e.target.value})}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mfg Date</label>
                                <input 
                                    type="date"
                                    value={newBatch.manufacture_date}
                                    onChange={(e) => setNewBatch({...newBatch, manufacture_date: e.target.value})}
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                                <input 
                                    type="date"
                                    value={newBatch.expiry_date}
                                    onChange={(e) => setNewBatch({...newBatch, expiry_date: e.target.value})}
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Initial Quantity</label>
                            <input 
                                type="number" required min="1"
                                value={newBatch.stock_quantity || ''}
                                onChange={(e) => setNewBatch({...newBatch, stock_quantity: e.target.value ? parseInt(e.target.value) : 0})}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500"
                            />
                        </div>

                        <button type="submit" className="w-full bg-green-700 text-white py-2 rounded-lg font-bold hover:bg-green-800 transition">
                            Create & Generate QR
                        </button>
                    </form>
                </div>

                {/* Batch List */}
                <div className="col-span-2">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="p-4 font-semibold text-gray-600">Batch ID</th>
                                    <th className="p-4 font-semibold text-gray-600">Product</th>
                                    <th className="p-4 font-semibold text-gray-600">Dates (Mfg - Exp)</th>
                                    <th className="p-4 font-semibold text-gray-600">Stock</th>
                                    <th className="p-4 font-semibold text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {batches.map(batch => (
                                    <tr key={batch.id} className="hover:bg-gray-50 transition">
                                        <td className="p-4 font-mono text-xs">{batch.batch_number}</td>
                                        <td className="p-4 font-medium">{batch.products?.name}</td>
                                        <td className="p-4 text-gray-500">
                                            {batch.manufacture_date || '?'} to {batch.expiry_date || '?'}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${batch.stock_quantity > 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {batch.stock_quantity}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <button 
                                                onClick={() => triggerPrint(batch)}
                                                className="text-blue-600 hover:text-blue-800 font-medium"
                                            >
                                                Print QR
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Hidden Print Container for generating exact physical QR labels based on stock quantity */}
            <div className="hidden">
                <div ref={printRef}>
                    {printingBatch && Array.from({ length: printingBatch.stock_quantity || 1 }).map((_, index) => (
                        <div key={index} className="w-[2in] h-[2in] flex flex-col items-center justify-center p-2 bg-white text-black text-center" style={{ pageBreakAfter: 'always' }}>
                            <h2 className="text-[10px] font-black uppercase mb-1 truncate w-full text-center">{printingBatch.products?.name}</h2>
                            <QRCodeSVG value={printingBatch.qr_code_data} size={100} level="H" />
                            <p className="font-mono text-[10px] font-bold mt-2">B: {printingBatch.batch_number}</p>
                            <p className="text-[8px] mt-1">MFG: {printingBatch.manufacture_date || 'N/A'}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
