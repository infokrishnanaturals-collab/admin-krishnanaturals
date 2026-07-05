"use client";

import { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { toast } from "react-hot-toast";
import { Package, X, CheckCircle, Truck, RefreshCw } from "lucide-react";

export default function FulfillmentScannerPage() {
    const [scannedOrderId, setScannedOrderId] = useState<string | null>(null);
    const [orderInfo, setOrderInfo] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    const [courier, setCourier] = useState("");
    const [tracking, setTracking] = useState("");
    
    // Top courier partners quick-select
    const COURIERS = ["Delhivery", "BlueDart", "Ecom Express", "India Post", "DTDC"];

    useEffect(() => {
        // Initialize Scanner on mount
        if (!scannerRef.current) {
            scannerRef.current = new Html5QrcodeScanner(
                "reader",
                { fps: 10, qrbox: { width: 250, height: 250 }, rememberLastUsedCamera: true },
                /* verbose= */ false
            );
            
            scannerRef.current.render(onScanSuccess, onScanFailure);
        }

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(console.error);
                scannerRef.current = null;
            }
        };
    }, []);

    const onScanSuccess = async (decodedText: string) => {
        if (!decodedText.startsWith("kn_dispatch:")) return;
        
        const id = decodedText.replace("kn_dispatch:", "");
        if (scannedOrderId === id) return; // Prevent double trigger
        
        // Pause scanner
        if (scannerRef.current) {
            try {
                scannerRef.current.pause(true);
            } catch (err) {
                console.warn("Scanner pause error:", err);
            }
        }
        
        setScannedOrderId(id);
        toast.success("QR Code Detected!", { icon: "✅" });
        
        // Fetch order basic details to show in modal
        try {
            const res = await fetch(process.env.NEXT_PUBLIC_API_URL + `/admin/orders`);
            const data = await res.json();
            const order = data.find((o: any) => o.id === id);
            if (order) setOrderInfo(order);
        } catch (e) {
            console.error("Failed to fetch order details", e);
        }
    };

    const onScanFailure = (error: any) => {
        // Usually safe to ignore continuous failures
    };

    const handleReset = () => {
        setScannedOrderId(null);
        setOrderInfo(null);
        setCourier("");
        setTracking("");
        if (scannerRef.current) {
            try {
                scannerRef.current.resume();
            } catch (err) {
                console.warn("Scanner resume error:", err);
            }
        }
    };

    const handleDispatch = async () => {
        if (!courier || !tracking) {
            toast.error("Courier and Tracking Number required");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch(process.env.NEXT_PUBLIC_API_URL + `/admin/orders/${scannedOrderId}/dispatch`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ courier_name: courier, tracking_number: tracking })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to dispatch");
            }

            toast.success("Order Dispatched successfully!");
            handleReset(); // Instantly go back to scanning
        } catch (e: any) {
            toast.error(e.message || "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col p-4 md:p-8">
            <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
                
                <div className="text-center mb-6 pt-4">
                    <h1 className="text-2xl font-black text-white tracking-widest uppercase flex items-center justify-center gap-2">
                        <Package className="w-6 h-6 text-green-400" /> Fulfillment Scanner
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Scan the QR code on the shipping label to dispatch.</p>
                </div>

                {/* Scanner Container */}
                <div className={`relative bg-black rounded-3xl overflow-hidden border-4 transition-all duration-300 ${scannedOrderId ? 'border-green-500 scale-95 opacity-50 pointer-events-none' : 'border-gray-700 shadow-2xl'}`}>
                    <div id="reader" className="w-full bg-black min-h-[300px]"></div>
                    {/* Add some global CSS override for the scanner via styled jsx or just let it inject */}
                    <style dangerouslySetInnerHTML={{__html: `
                        #reader button { background: white !important; color: black !important; padding: 8px 16px !important; border-radius: 8px !important; font-weight: bold !important; border: none !important; margin: 8px !important; cursor: pointer !important; }
                        #reader select { padding: 8px !important; border-radius: 8px !important; }
                        #reader__dashboard_section_csr span { color: white !important; }
                        #reader__scan_region img { display: none !important; }
                    `}} />
                </div>

                {/* Dispatch Modal / Bottom Sheet */}
                <div className={`fixed inset-x-0 bottom-0 bg-white text-gray-900 rounded-t-3xl p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] transition-transform duration-500 z-50 flex flex-col ${scannedOrderId ? 'translate-y-0' : 'translate-y-full'}`}>
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                                <CheckCircle className="text-green-500" /> Dispatch Order
                            </h2>
                            {orderInfo && (
                                <p className="text-gray-500 text-sm mt-1 font-mono">{orderInfo.order_number}</p>
                            )}
                        </div>
                        <button onClick={handleReset} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                            <X className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <div className="space-y-4">
                            {/* Products Summary to verify box contents */}
                            {orderInfo && (orderInfo.order_items || orderInfo.items) && (
                                <div className="mb-6 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                                    <h3 className="text-[10px] font-black text-blue-800 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Package className="w-3 h-3" /> Box Contents
                                    </h3>
                                    <ul className="space-y-2">
                                        {(orderInfo.order_items || orderInfo.items).map((item: any, idx: number) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm font-bold text-gray-800">
                                                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">{item.quantity}x</span>
                                                <div className="leading-tight">
                                                    {item.product_name || item.name}
                                                    {item.batch_number && (
                                                        <span className="ml-2 text-[10px] font-black text-gray-500 uppercase tracking-wider">
                                                            [Batch: {item.batch_number}]
                                                        </span>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Courier Partner</label>
                                <div className="flex flex-wrap gap-2">
                                    {COURIERS.map(c => (
                                        <button 
                                            key={c}
                                            onClick={() => setCourier(c)}
                                            className={`px-4 py-2 rounded-full text-sm font-bold transition-all border-2 ${courier === c ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'}`}
                                        >
                                            {c}
                                        </button>
                                    ))}
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Or type custom courier..."
                                    className="w-full mt-3 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all"
                                    value={courier}
                                    onChange={(e) => setCourier(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Tracking Number</label>
                                <input 
                                    type="text" 
                                    placeholder="Enter or scan barcode..."
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl font-mono text-lg focus:ring-2 focus:ring-black outline-none transition-all"
                                    value={tracking}
                                    onChange={(e) => setTracking(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100">
                        <button 
                            onClick={handleDispatch}
                            disabled={isSubmitting || !courier || !tracking}
                            className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-4 rounded-xl font-black uppercase tracking-widest transition-all"
                        >
                            {isSubmitting ? (
                                <RefreshCw className="w-5 h-5 animate-spin" />
                            ) : (
                                <Truck className="w-5 h-5" />
                            )}
                            {isSubmitting ? 'Dispatching...' : 'Confirm & Dispatch'}
                        </button>
                    </div>
                </div>
                
                {/* Overlay when modal is open to dim the background */}
                {scannedOrderId && (
                    <div 
                        className="fixed inset-0 bg-black/60 z-40"
                        onClick={handleReset}
                    ></div>
                )}
            </div>
        </div>
    );
}
