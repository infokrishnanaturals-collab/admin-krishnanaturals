"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Plus, Edit2, Trash2, X, FileText } from "lucide-react";

type Blog = {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    author: string;
    image_url: string;
    is_published: boolean;
    published_at: string;
    seo_title: string;
    meta_keywords: string;
    created_at: string;
};

export default function AdminBlogPage() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState({
        id: "",
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        author: "Krishna Naturals",
        image_url: "/images/bg.png",
        is_published: true,
        seo_title: "",
        meta_keywords: "",
        published_at: new Date().toISOString()
    });

    const fetchBlogs = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/blogs');
            if (!res.ok) throw new Error("Failed to load blog posts");
            const data = await res.json();
            setBlogs(data);
        } catch (e) {
            toast.error("Failed to load blog posts");
        }
        setLoading(false);
    }, []);

    useEffect(() => {
         
        fetchBlogs();
    }, [fetchBlogs]);

    const resetForm = () => {
        setFormData({
            id: "",
            title: "",
            slug: "",
            excerpt: "",
            content: "",
            author: "Krishna Naturals",
            image_url: "/images/bg.png",
            is_published: true,
            seo_title: "",
            meta_keywords: "",
            published_at: new Date().toISOString()
        });
        setIsEditing(false);
        setShowForm(false);
    };

    const handleEdit = (blog: Blog) => {
        setFormData({
            id: blog.id,
            title: blog.title || "",
            slug: blog.slug || "",
            excerpt: blog.excerpt || "",
            content: blog.content || "",
            author: blog.author || "Krishna Naturals",
            image_url: blog.image_url || "/images/bg.png",
            is_published: blog.is_published,
            seo_title: blog.seo_title || "",
            meta_keywords: blog.meta_keywords || "",
            published_at: blog.published_at || new Date().toISOString()
        });
        setIsEditing(true);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Are you sure you want to delete the post "${title}"?`)) return;

        try {
            const res = await fetch(process.env.NEXT_PUBLIC_API_URL + `/admin/blogs?id=${id}`, {
                method: 'DELETE'
            });

            if (!res.ok) throw new Error("Failed to delete blog post");
            
            toast.success("Post deleted successfully");
            fetchBlogs();
        } catch (e) {
            toast.error("Failed to delete blog post");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            title: formData.title,
            slug: formData.slug,
            excerpt: formData.excerpt,
            content: formData.content,
            author: formData.author,
            image_url: formData.image_url,
            is_published: formData.is_published,
            seo_title: formData.seo_title,
            meta_keywords: formData.meta_keywords,
            published_at: formData.is_published ? formData.published_at : null
        };

        try {
            if (isEditing) {
                const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/blogs', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...payload, id: formData.id })
                });

                if (!res.ok) throw new Error("Failed to update post");
                toast.success("Blog post updated!");
            } else {
                const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/blogs', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!res.ok) throw new Error("Failed to create post");
                toast.success("Blog post published!");
            }
        } catch (e) {
            toast.error("An error occurred during save");
        }

        resetForm();
        fetchBlogs();
    };

    if (loading && blogs.length === 0) {
        return (
            <div className="max-w-7xl mx-auto space-y-6 fade-in">
                <div className="h-24 bg-white/40 animate-pulse rounded-2xl border border-white/60"></div>
                <div className="h-[500px] bg-white/40 animate-pulse rounded-2xl border border-white/60"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto fade-in">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <FileText size={32} className="text-[var(--forest)]" />
                    <h1 className="admin-heading mb-1">
                        Blog Content Manager
                    </h1>
                </div>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="admin-btn-primary flex items-center gap-2 px-4 py-2"
                    >
                        <Plus size={18} /> Compose Post
                    </button>
                )}
            </div>

            {/* Content Editor Form */}
            {showForm && (
                <div className="mb-8 fade-in relative bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_-12px_rgba(20,58,42,0.1)] rounded-3xl p-8 z-20">
                    <button onClick={resetForm} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 bg-white hover:bg-gray-50 shadow-sm rounded-xl border border-gray-100 transition-all">
                        <X size={18} />
                    </button>
                    <h2 className="font-serif text-2xl text-[var(--forest-dark)] mb-6 flex items-center gap-2">
                        {isEditing ? <Edit2 size={24} className="text-[var(--gold)]" /> : <FileText size={24} className="text-[var(--gold)]" />}
                        {isEditing ? "Edit Article" : "Write New Article"}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2 space-y-1.5">
                                <label className="text-[13px] font-semibold text-gray-700 uppercase tracking-wider">Article Title</label>
                                <input required type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/50 focus:border-[var(--gold)] transition-all" placeholder="e.g. The Healing Power of Raw Honey" />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[13px] font-semibold text-gray-700 uppercase tracking-wider">URL Slug</label>
                                <input required type="text" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') })} className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/50 focus:border-[var(--gold)] transition-all" placeholder="e.g. heal-with-raw-honey" />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[13px] font-semibold text-gray-700 uppercase tracking-wider">Author Name</label>
                                <input required type="text" value={formData.author} onChange={e => setFormData({ ...formData, author: e.target.value })} className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/50 focus:border-[var(--gold)] transition-all" />
                            </div>

                            <div className="md:col-span-2 space-y-1.5">
                                <label className="text-[13px] font-semibold text-gray-700 uppercase tracking-wider">Short Excerpt (Shown on Journal Index)</label>
                                <textarea required rows={2} value={formData.excerpt} onChange={e => setFormData({ ...formData, excerpt: e.target.value })} className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/50 focus:border-[var(--gold)] transition-all resize-y" placeholder="A brief summary to entice readers..."></textarea>
                            </div>

                            <div className="md:col-span-2 space-y-1.5">
                                <label className="text-[13px] font-semibold text-gray-700 uppercase tracking-wider">Full Article Body (Markdown / Text)</label>
                                <textarea required rows={10} value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/50 focus:border-[var(--gold)] transition-all resize-y" placeholder="Write your full article here..."></textarea>
                            </div>
                        </div>

                        {/* SEO Options */}
                        <div className="pt-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[13px] font-semibold text-gray-700 uppercase tracking-wider">SEO Title (Optional)</label>
                                <input type="text" value={formData.seo_title} onChange={e => setFormData({ ...formData, seo_title: e.target.value })} className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/50 focus:border-[var(--gold)] transition-all text-sm" placeholder="Overrides normal title for search engines" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[13px] font-semibold text-gray-700 uppercase tracking-wider">Meta Keywords</label>
                                <input type="text" value={formData.meta_keywords} onChange={e => setFormData({ ...formData, meta_keywords: e.target.value })} className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/50 focus:border-[var(--gold)] transition-all text-sm" placeholder="e.g. raw honey, ayurveda, natural health" />
                            </div>
                            <div className="md:col-span-2 flex items-center gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" checked={formData.is_published} onChange={e => setFormData({ ...formData, is_published: e.target.checked })} className="w-5 h-5 text-[var(--forest)] rounded border-gray-300 focus:ring-[var(--forest)]" />
                                    <span className="font-semibold text-[13px] text-gray-900 uppercase tracking-wide">Publish Immediately</span>
                                </label>
                                <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide ml-2">Uncheck to save as draft.</p>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4 border-t border-gray-100">
                            <button type="submit" disabled={loading} className="admin-btn-primary px-8 shadow-md">
                                {loading ? "Saving..." : (isEditing ? "Update Article" : "Publish Article")}
                            </button>
                            <button type="button" onClick={resetForm} className="px-6 py-3 rounded-xl font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Post List */}
            <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_-12px_rgba(20,58,42,0.1)] rounded-3xl overflow-hidden fade-in relative z-10">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Article Title</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Author</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {blogs.map((blog) => (
                                <tr key={blog.id} className="hover:bg-white/80 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-gray-900 group-hover:text-[var(--forest-dark)] transition-colors">{blog.title}</div>
                                        <div className="text-[13px] mt-0.5 max-w-[200px] truncate text-gray-500">/{blog.slug}</div>
                                    </td>
                                    <td className="px-6 py-4 text-[13px] hidden md:table-cell text-gray-500">{blog.author}</td>
                                    <td className="px-6 py-4 text-[13px] text-gray-500">
                                        {new Date(blog.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${blog.is_published ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                                            {blog.is_published ? "Published" : "Draft"}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleEdit(blog)} className="w-8 h-8 flex items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all shadow-sm" title="Edit Article">
                                                <Edit2 size={15} />
                                            </button>
                                            <button onClick={() => handleDelete(blog.id, blog.title)} className="w-8 h-8 flex items-center justify-center rounded-lg text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all shadow-sm" title="Delete Article">
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {blogs.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={5}>
                                        <div className="py-16 text-center flex flex-col items-center">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                                                <FileText size={24} className="text-gray-400" />
                                            </div>
                                            <h3 className="text-gray-900 font-medium mb-1">Your journal is empty</h3>
                                            <p className="text-gray-500 text-sm">Time to share some wisdom. Create your first article.</p>
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
