/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import AdminLayout from "../../admin/layout";
import { Html5QrcodeScanner } from "html5-qrcode";
import { toast } from "react-hot-toast";
import { QrCode, Plus, Minus, Package } from "lucide-react";

export default function InventoryScannerPage() {
    const [scannedProductId, setScannedProductId] = useState<string | null>(null);
    const [scannedProduct, setScannedProduct] = useState<any>(null);
    const [adjustAmount, setAdjustAmount] = useState<number>(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let scanner: Html5QrcodeScanner | null = null;
        
        // Use a small timeout to ensure the DOM has rendered after AdminLayout's auth check
        const timer = setTimeout(() => {
            const element = document.getElementById("qr-reader");
            if (!element) {
                console.warn("Scanner element 'qr-reader' not found yet. Retrying...");
                return;
            }

            scanner = new Html5QrcodeScanner(
                "qr-reader",
                { fps: 10, qrbox: { width: 250, height: 250 } },
                /* verbose= */ false
            );

            scanner.render(
                (decodedText) => {
                    setScannedProductId(decodedText);
                    try {
                        scanner?.pause(true);
                    } catch (err) {
                        console.warn("Scanner pause error:", err);
                    }
                },
                (error) => {
                    // ignore generic errors during continuous scanning
                }
            );
        }, 500);

        return () => {
            clearTimeout(timer);
            if (scanner) {
                scanner.clear().catch(err => console.error("Failed to clear scanner", err));
            }
        };
    }, []);

    useEffect(() => {
        if (!scannedProductId) return;

        const fetchProduct = async () => {
            setLoading(true);
            try {
                const res = await fetch(process.env.NEXT_PUBLIC_API_URL + `/admin/products?id=${scannedProductId}`);
                if (!res.ok) throw new Error("Product not found");
                const data = await res.json();
                
                if (data) {
                    setScannedProduct(data);
                    toast.success(`Scanned: ${data.name}`);
                } else {
                    throw new Error("Invalid data");
                }
            } catch (e) {
                toast.error("Invalid QR Code: Product not found");
                setScannedProductId(null);
                setScannedProduct(null);
                // @ts-ignore
                if (window.html5QrcodeScanner) window.html5QrcodeScanner.resume();
            }
            setLoading(false);
        };

        fetchProduct();
    }, [scannedProductId]);

    const handleUpdateStock = async () => {
        if (!scannedProduct || adjustAmount === 0) return;
        setLoading(true);

        const newStock = Math.max(0, scannedProduct.stock + adjustAmount);

        try {
            const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/products', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    ...scannedProduct,
                    id: scannedProduct.id, 
                    stock: newStock,
                    originalStock: scannedProduct.stock
                })
            });

            if (!res.ok) throw new Error("Failed to update stock");

            toast.success(`Stock updated! New total: ${newStock}`);
            setScannedProduct({ ...scannedProduct, stock: newStock });
            setAdjustAmount(0); // Reset
        } catch (e) {
            toast.error("Failed to update stock");
        }
        setLoading(false);
    };

    const handleResumeScanning = () => {
        setScannedProductId(null);
        setScannedProduct(null);
        setAdjustAmount(0);
        // @ts-ignore
        const scannerElement = document.getElementById('qr-reader');
        // A tricky part with html5-qrcode react integration is resuming cleanly.
        // Easiest is to prompt user to scan next visually.
    };

    return (
        <AdminLayout>
            <div className="max-w-2xl mx-auto pb-12">
                <div className="flex items-center gap-3 mb-8">
                    <QrCode size={32} style={{ color: "var(--forest)" }} />
                    <h1 className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: "var(--forest-dark)" }}>
                        Floor Scanner
                    </h1>
                </div>

                {/* Scanner Interface */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden mb-8">
                    <div id="qr-reader" className="w-full"></div>
                </div>

                {/* Scanned Result & Quick Updater Modal-esque block */}
                {scannedProduct && (
                    <div className="bg-[var(--forest)] text-white p-6 rounded-2xl shadow-xl animate-in slide-in-from-bottom-4">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-xl font-bold">{scannedProduct.name}</h3>
                                <p className="text-gray-200 text-sm mt-1 flex items-center gap-2">
                                    <Package size={14} /> SKU: {scannedProduct.slug}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-300 uppercase tracking-widest font-semibold">Current Stock</p>
                                <p className="text-3xl font-bold text-[var(--gold)]">{scannedProduct.stock}</p>
                            </div>
                        </div>

                        <div className="bg-white/10 p-4 rounded-xl mb-4">
                            <p className="text-sm font-medium mb-3">Adjust Stock (+/-)</p>
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={() => setAdjustAmount(a => a - 1)}
                                    className="p-3 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                                >
                                    <Minus size={20} />
                                </button>

                                <div className="text-center">
                                    <span className="text-2xl font-bold mx-4">
                                        {adjustAmount > 0 ? '+' : ''}{adjustAmount}
                                    </span>
                                </div>

                                <button
                                    onClick={() => setAdjustAmount(a => a + 1)}
                                    className="p-3 bg-green-500 hover:bg-green-600 rounded-lg transition-colors"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                            <div className="grid grid-cols-4 gap-2 mt-3">
                                {[5, 10, 20, 50].map(val => (
                                    <button
                                        key={val}
                                        onClick={() => setAdjustAmount(a => a + val)}
                                        className="py-1 bg-white/5 hover:bg-white/20 rounded text-sm font-medium border border-white/20"
                                    >
                                        +{val}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleUpdateStock}
                                disabled={loading || adjustAmount === 0}
                                className="flex-1 bg-[var(--gold)] text-[var(--forest-dark)] py-3 rounded-xl font-bold hover:brightness-110 transition-all disabled:opacity-50"
                            >
                                {loading ? "Updating..." : "CONFIRM ADJUSTMENT"}
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 bg-white/10 text-white py-3 rounded-xl font-medium hover:bg-white/20 transition-all"
                            >
                                Next Scan
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
