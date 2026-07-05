"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Plus, Edit2, Trash2, X, QrCode, Package } from "lucide-react";

type Product = {
    id: string;
    name: string;
    slug: string;
    price: number;
    stock: number;
    category: string;
    description: string;
    is_active: boolean;
};

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState({
        id: "",
        name: "",
        slug: "",
        price: 0,
        stock: 100,
        category: "general",
        description: "",
        is_active: true
    });

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/products');
            if (!res.ok) throw new Error("Failed to load products");
            const data = await res.json();
            setProducts(data);
        } catch (e) {
            toast.error("Failed to load products");
        }
        setLoading(false);
    }, []);

    useEffect(() => {
         
        fetchProducts();
    }, [fetchProducts]);

    const resetForm = () => {
        setFormData({
            id: "", name: "", slug: "", price: 0, stock: 100, category: "general", description: "", is_active: true
        });
        setIsEditing(false);
        setShowForm(false);
    };

    const handleEdit = (product: Product) => {
        setFormData(product);
        setIsEditing(true);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (product: Product) => {
        if (!confirm("Are you sure you want to delete this product?")) return;

        try {
            const res = await fetch(process.env.NEXT_PUBLIC_API_URL + `/admin/products?id=${product.id}&name=${encodeURIComponent(product.name)}`, {
                method: 'DELETE'
            });

            if (!res.ok) throw new Error("Failed to delete product");
            
            toast.success("Product deleted successfully");
            fetchProducts();
        } catch (e) {
            toast.error("Failed to delete product");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            name: formData.name,
            slug: formData.slug,
            price: formData.price,
            stock: formData.stock,
            category: formData.category,
            description: formData.description,
            is_active: formData.is_active
        };

        try {
            if (isEditing) {
                const productMatch = products.find(p => p.id === formData.id);
                const originalStock = productMatch ? productMatch.stock : formData.stock;

                const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/products', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...payload, id: formData.id, originalStock })
                });

                if (!res.ok) throw new Error("Failed to update product");
                toast.success("Product updated!");
            } else {
                const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/products', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!res.ok) throw new Error("Failed to create product");
                toast.success("Product created!");
            }
        } catch (e) {
            toast.error("An error occurred during save");
        }

        resetForm();
        fetchProducts();
    };

    const handlePrintQR = (product: Product) => {
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${product.id}`;

        const printWindow = window.open('', '', 'width=600,height=600');
        if (!printWindow) return toast.error("Pop-ups blocked");

        printWindow.document.write(`
            <html>
                <head>
                    <title>Print QR - ${product.name}</title>
                    <style>
                        body { font-family: sans-serif; text-align: center; padding: 40px; }
                        img { max-width: 200px; margin-bottom: 20px; }
                        h2 { margin: 0; color: #1A3A2A; font-size: 18px; }
                        p { margin: 5px 0 0 0; color: #666; font-size: 14px; }
                    </style>
                </head>
                <body>
                    <img src="${qrUrl}" onload="window.print(); window.close();" />
                    <h2>${product.name}</h2>
                    <p>SKU: ${product.slug}</p>
                    <p>Price: Rs. ${product.price}</p>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    if (loading && products.length === 0) {
        return (
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="h-24 bg-white/40 animate-pulse rounded-2xl border border-white/60"></div>
                <div className="h-[500px] bg-white/40 animate-pulse rounded-2xl border border-white/60"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto pb-12">
            <div className="flex justify-between items-center mb-8 fade-in">
                <div>
                    <h1 className="admin-heading mb-1">
                        Inventory
                    </h1>
                    <p className="admin-subheading">Manage products and stock</p>
                </div>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="admin-btn-primary"
                    >
                        <Plus size={16} /> Add Product
                    </button>
                )}
            </div>

            {/* Product Form */}
            {showForm && (
                <div className="mb-8 fade-in relative bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_-12px_rgba(20,58,42,0.1)] rounded-3xl p-8">
                    <button onClick={resetForm} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 bg-white hover:bg-gray-50 shadow-sm rounded-xl border border-gray-100 transition-all">
                        <X size={18} />
                    </button>
                    <h2 className="font-serif text-2xl text-[var(--forest-dark)] mb-6 flex items-center gap-2">
                        {isEditing ? <Edit2 size={24} className="text-[var(--gold)]" /> : <Plus size={24} className="text-[var(--gold)]" />}
                        {isEditing ? "Edit Product" : "New Product"}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[13px] font-semibold text-gray-700 uppercase tracking-wider">Product Name</label>
                                <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/50 focus:border-[var(--gold)] transition-all" placeholder="e.g., Raw Forest Honey" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[13px] font-semibold text-gray-700 uppercase tracking-wider">URL Slug</label>
                                <input required type="text" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/ /g, '-') })} className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/50 focus:border-[var(--gold)] transition-all" placeholder="e.g., raw-forest-honey" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[13px] font-semibold text-gray-700 uppercase tracking-wider">Price (₹)</label>
                                <input required type="number" min="0" value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/50 focus:border-[var(--gold)] transition-all" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[13px] font-semibold text-gray-700 uppercase tracking-wider">Stock</label>
                                <input required type="number" min="0" value={formData.stock} onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })} className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/50 focus:border-[var(--gold)] transition-all" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[13px] font-semibold text-gray-700 uppercase tracking-wider">Description</label>
                            <textarea rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/50 focus:border-[var(--gold)] transition-all resize-y"></textarea>
                        </div>

                        <div className="flex gap-4 pt-4 border-t border-gray-100">
                            <button type="submit" className="admin-btn-primary px-8 shadow-md">
                                {isEditing ? "Update Product" : "Save Product"}
                            </button>
                            <button type="button" onClick={resetForm} className="px-6 py-3 rounded-xl font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Product List */}
            <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_-12px_rgba(20,58,42,0.1)] rounded-3xl overflow-hidden fade-in relative z-10">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product Name</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {products.map((product) => (
                                <tr key={product.id} className="hover:bg-white/80 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-gray-900 group-hover:text-[var(--forest-dark)] transition-colors">{product.name}</div>
                                        <div className="text-[13px] text-gray-500 max-w-[200px] truncate mt-0.5">/{product.slug}</div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-[var(--forest-dark)]">₹{product.price}</td>
                                    <td className="px-6 py-4">
                                        <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${product.stock > 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                            {product.stock} in stock
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${product.is_active ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                            {product.is_active ? "Active" : "Draft"}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handlePrintQR(product)} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-all shadow-sm" title="Print QR Label">
                                                <QrCode size={15} />
                                            </button>
                                            <button onClick={() => handleEdit(product)} className="w-8 h-8 flex items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all shadow-sm" title="Edit Product">
                                                <Edit2 size={15} />
                                            </button>
                                            <button onClick={() => handleDelete(product)} className="w-8 h-8 flex items-center justify-center rounded-lg text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all shadow-sm" title="Delete Product">
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {products.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={5}>
                                        <div className="py-16 text-center flex flex-col items-center">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                                                <Package size={24} className="text-gray-400" />
                                            </div>
                                            <h3 className="text-gray-900 font-medium mb-1">No products found</h3>
                                            <p className="text-gray-500 text-sm">Get started by adding a new product.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
