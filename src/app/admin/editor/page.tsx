"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Save, Laptop, Smartphone, Eye, Settings, Sparkles, Globe } from "lucide-react";

const DEFAULT_CONTENT = {
    hero: {
        badge: "Established 1977 · Gujarat, India",
        title_normal: "Pure Honey,",
        title_italic: "Pure Love",
        subtitle: "45 years of tradition. 100% natural. Raw, organic forest honey sourced from Gujarat's pristine regions.",
        primary_btn_text: "Shop Now",
        primary_btn_link: "/shop",
        secondary_btn_text: "Our Story",
        secondary_btn_link: "/legacy",
        badges: [
            { icon: "🍯", title: "100% Pure", desc: "No additives" },
            { icon: "🌿", title: "Chemical Free", desc: "Organic sourcing" },
            { icon: "🚚", title: "Free Delivery", desc: "Orders above ₹500" },
            { icon: "⭐", title: "Since 1977", desc: "45+ years of trust" }
        ]
    },
    featured_products: {
        overline: "Our Collection",
        title: "Premium Honey",
        subtitle: "Carefully harvested from Gujarat's pristine forests. No additives, no sugar — just pure natural honey."
    },
    categories: {
        overline: "Shop by Size",
        title: "Find Your Perfect Pack"
    },
    brand_story: {
        overline: "Our Story",
        title: "A History of Trust",
        quote: "Purity and Assurity is our fairly earned asset.",
        paragraph: "From Mr. Tarachandbhai Bhanushali's vision in 1977 to supplying 50 tonnes annually, Krishna Naturals has been Gujarat's most trusted name in pure honey. Today, we bring export-quality purity directly to your doorstep.",
        btn_text: "Read Our Legacy →",
        btn_link: "/legacy"
    },
    commitment_to_purity: {
        overline: "Why Krishna Naturals",
        title: "Commitment to Purity",
        items: [
            { icon: "🐝", title: "Ethical Beekeeping", desc: "We partner with local beekeepers using non-invasive methods that prioritize bee colony health and biodiversity." },
            { icon: "🌲", title: "Forest Sourced", desc: "Our honey comes from wild, untouched Gujarat forests, rich in diverse flora and free from pollutants." },
            { icon: "✅", title: "Quality Assured", desc: "Every batch undergoes rigorous quality checks. No pasteurization, no additives — 100% natural goodness." }
        ]
    },
    about_section: {
        title: "About Krishna Naturals & Secure Sign-In",
        paragraph: "Krishna Naturals is an e-commerce platform dedicated to supplying 100% pure, raw, and unfiltered forest honey directly from the pristine forests of Gujarat. We integrate secure Google Sign-In to allow customers to easily register, securely authenticate, track their honey shipments, view order history, and contact customer support. We prioritize your data privacy: we only access your name and email address, and never share your data with third parties. Learn more in our Privacy Policy."
    }
};

export default function HomepageEditorPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [content, setContent] = useState(DEFAULT_CONTENT);
    const [activeTab, setActiveTab] = useState("hero");
    const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/editor");
                if (res.ok) {
                    const data = await res.json();
                    if (data) {
                        // Safely merge with DEFAULT_CONTENT to prevent undefined fields
                        setContent({
                            hero: { ...DEFAULT_CONTENT.hero, ...data.hero },
                            featured_products: { ...DEFAULT_CONTENT.featured_products, ...data.featured_products },
                            categories: { ...DEFAULT_CONTENT.categories, ...data.categories },
                            brand_story: { ...DEFAULT_CONTENT.brand_story, ...data.brand_story },
                            commitment_to_purity: { ...DEFAULT_CONTENT.commitment_to_purity, ...data.commitment_to_purity },
                            about_section: { ...DEFAULT_CONTENT.about_section, ...data.about_section }
                        });
                    }
                }
            } catch (e) {
                console.error(e);
            }
            setIsLoading(false);
        };
        fetchContent();
    }, []);

    const handleNestedChange = (section: string, field: string, value: any) => {
        setContent(prev => ({
            ...prev,
            [section]: {
                // @ts-ignore
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleBadgeChange = (index: number, field: "icon" | "title" | "desc", value: string) => {
        setContent(prev => {
            const newBadges = [...prev.hero.badges];
            newBadges[index] = { ...newBadges[index], [field]: value };
            return {
                ...prev,
                hero: {
                    ...prev.hero,
                    badges: newBadges
                }
            };
        });
    };

    const handlePurityItemChange = (index: number, field: "icon" | "title" | "desc", value: string) => {
        setContent(prev => {
            const newItems = [...prev.commitment_to_purity.items];
            newItems[index] = { ...newItems[index], [field]: value };
            return {
                ...prev,
                commitment_to_purity: {
                    ...prev.commitment_to_purity,
                    items: newItems
                }
            };
        });
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/editor", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(content)
            });
            if (!res.ok) throw new Error("Update failed");
            toast.success("Homepage saved successfully!");
        } catch (e: any) {
            toast.error("Failed to save changes: " + e.message);
            console.error(e);
        }
        setIsSaving(false);
    };

    if (isLoading) {
        return <div className="p-8 text-gray-500 animate-pulse">Loading editor configuration...</div>;
    }

    const tabs = [
        { id: "hero", label: "Hero Banner" },
        { id: "featured", label: "Featured" },
        { id: "categories", label: "Categories" },
        { id: "story", label: "Brand Story" },
        { id: "purity", label: "Purity & Trust" },
        { id: "about", label: "About Info" }
    ];

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] w-full">
            {/* Header Controls */}
            <div className="flex items-center justify-between pb-6 fade-in border-b border-gray-100">
                <div>
                    <h1 className="admin-heading">
                        Homepage Editor
                    </h1>
                    <p className="admin-subheading">Customize content, headings, and CTAs on the main landing page.</p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Preview toggles */}
                    <div className="p-1 rounded-xl flex gap-1 bg-gray-50 border border-gray-200">
                        <button
                            onClick={() => setPreviewMode("desktop")}
                            className={`p-2 rounded-lg flex items-center justify-center ${previewMode === "desktop" ? "bg-[var(--forest)] text-white shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
                            title="Desktop View"
                        >
                            <Laptop size={16} />
                        </button>
                        <button
                            onClick={() => setPreviewMode("mobile")}
                            className={`p-2 rounded-lg flex items-center justify-center ${previewMode === "mobile" ? "bg-[var(--forest)] text-white shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
                            title="Mobile View"
                        >
                            <Smartphone size={16} />
                        </button>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="admin-btn-primary flex items-center gap-2 px-6 py-2.5"
                    >
                        <Save size={16} />
                        {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>

            <div className="flex flex-1 gap-6 mt-6 overflow-hidden min-h-0 fade-in fade-in-delay-1">
                {/* Form Controls (Left Side) */}
                <div className="w-1/2 flex flex-col admin-panel overflow-hidden p-0">
                    {/* Navigation tabs */}
                    <div className="flex px-4 py-2 gap-1 overflow-x-auto border-b border-gray-100 bg-gray-50">
                        {tabs.map(t => (
                            <button
                                key={t.id}
                                onClick={() => setActiveTab(t.id)}
                                className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${activeTab === t.id ? "bg-[var(--forest-light)] text-[var(--forest)]" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"}`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Scrollable Form Body */}
                    <div className="flex-1 p-6 overflow-y-auto space-y-6">
                        {activeTab === "hero" && (
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: "var(--admin-text-dim)" }}>Hero Section Content</h3>
                                <div>
                                    <label className="block text-xs font-semibold mb-1 text-gray-500">Pre-title/Badge</label>
                                    <input
                                        type="text"
                                        className="admin-input text-sm"
                                        value={content.hero.badge}
                                        onChange={(e) => handleNestedChange("hero", "badge", e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold mb-1 text-gray-500">Title (Normal Text)</label>
                                        <input
                                            type="text"
                                            className="admin-input text-sm"
                                            value={content.hero.title_normal}
                                            onChange={(e) => handleNestedChange("hero", "title_normal", e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold mb-1 text-gray-500">Title (Italic Gold Text)</label>
                                        <input
                                            type="text"
                                            className="admin-input text-sm"
                                            value={content.hero.title_italic}
                                            onChange={(e) => handleNestedChange("hero", "title_italic", e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold mb-1 text-gray-500">Subtitle</label>
                                    <textarea
                                        rows={3}
                                        className="admin-input text-sm"
                                        value={content.hero.subtitle}
                                        onChange={(e) => handleNestedChange("hero", "subtitle", e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold mb-1 text-gray-500">Primary CTA Button Text</label>
                                        <input
                                            type="text"
                                            className="admin-input text-sm"
                                            value={content.hero.primary_btn_text}
                                            onChange={(e) => handleNestedChange("hero", "primary_btn_text", e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold mb-1 text-gray-500">Secondary Button Text</label>
                                        <input
                                            type="text"
                                            className="admin-input text-sm"
                                            value={content.hero.secondary_btn_text}
                                            onChange={(e) => handleNestedChange("hero", "secondary_btn_text", e.target.value)}
                                        />
                                    </div>
                                </div>

                                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 pt-4">Hero Trust Badges</h3>
                                {content.hero.badges.map((badge, idx) => (
                                    <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex gap-3 items-center">
                                        <div className="w-14">
                                            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Icon</label>
                                            <input
                                                type="text"
                                                className="w-full border border-gray-200 rounded-lg p-2 outline-none text-center text-sm"
                                                value={badge.icon}
                                                onChange={(e) => handleBadgeChange(idx, "icon", e.target.value)}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Label</label>
                                            <input
                                                type="text"
                                                className="w-full border border-gray-200 rounded-lg p-2 outline-none text-sm"
                                                value={badge.title}
                                                onChange={(e) => handleBadgeChange(idx, "title", e.target.value)}
                                            />
                                        </div>
                                        <div className="flex-[2]">
                                            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Description</label>
                                            <input
                                                type="text"
                                                className="w-full border border-gray-200 rounded-lg p-2 outline-none text-sm"
                                                value={badge.desc}
                                                onChange={(e) => handleBadgeChange(idx, "desc", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === "featured" && (
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: "var(--admin-text-dim)" }}>Featured Products Heading</h3>
                                <div>
                                    <label className="block text-xs font-semibold mb-1 text-gray-500">Overline Label</label>
                                    <input
                                        type="text"
                                        className="admin-input text-sm"
                                        value={content.featured_products.overline}
                                        onChange={(e) => handleNestedChange("featured_products", "overline", e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold mb-1 text-gray-500">Section Title</label>
                                    <input
                                        type="text"
                                        className="admin-input text-sm"
                                        value={content.featured_products.title}
                                        onChange={(e) => handleNestedChange("featured_products", "title", e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold mb-1 text-gray-500">Description Subtitle</label>
                                    <textarea
                                        rows={3}
                                        className="admin-input text-sm"
                                        value={content.featured_products.subtitle}
                                        onChange={(e) => handleNestedChange("featured_products", "subtitle", e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === "categories" && (
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: "var(--admin-text-dim)" }}>Categories Section Headers</h3>
                                <div>
                                    <label className="block text-xs font-semibold mb-1 text-gray-500">Overline Label</label>
                                    <input
                                        type="text"
                                        className="admin-input text-sm"
                                        value={content.categories.overline}
                                        onChange={(e) => handleNestedChange("categories", "overline", e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold mb-1 text-gray-500">Section Title</label>
                                    <input
                                        type="text"
                                        className="admin-input text-sm"
                                        value={content.categories.title}
                                        onChange={(e) => handleNestedChange("categories", "title", e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === "story" && (
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: "var(--admin-text-dim)" }}>Brand Story Details</h3>
                                <div>
                                    <label className="block text-xs font-semibold mb-1 text-gray-500">Overline Label</label>
                                    <input
                                        type="text"
                                        className="admin-input text-sm"
                                        value={content.brand_story.overline}
                                        onChange={(e) => handleNestedChange("brand_story", "overline", e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold mb-1 text-gray-500">Section Title</label>
                                    <input
                                        type="text"
                                        className="admin-input text-sm"
                                        value={content.brand_story.title}
                                        onChange={(e) => handleNestedChange("brand_story", "title", e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold mb-1 text-gray-500">Callout/Quote Phrase</label>
                                    <input
                                        type="text"
                                        className="admin-input text-sm"
                                        value={content.brand_story.quote}
                                        onChange={(e) => handleNestedChange("brand_story", "quote", e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold mb-1 text-gray-500">Main Narrative Paragraph</label>
                                    <textarea
                                        rows={4}
                                        className="admin-input text-sm"
                                        value={content.brand_story.paragraph}
                                        onChange={(e) => handleNestedChange("brand_story", "paragraph", e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold mb-1 text-gray-500">Button Text</label>
                                        <input
                                            type="text"
                                            className="admin-input text-sm"
                                            value={content.brand_story.btn_text}
                                            onChange={(e) => handleNestedChange("brand_story", "btn_text", e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold mb-1 text-gray-500">Button Route Target</label>
                                        <input
                                            type="text"
                                            className="admin-input text-sm"
                                            value={content.brand_story.btn_link}
                                            onChange={(e) => handleNestedChange("brand_story", "btn_link", e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "purity" && (
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: "var(--admin-text-dim)" }}>Purity Guarantee Section</h3>
                                <div>
                                    <label className="block text-xs font-semibold mb-1 text-gray-500">Overline Label</label>
                                    <input
                                        type="text"
                                        className="admin-input text-sm"
                                        value={content.commitment_to_purity.overline}
                                        onChange={(e) => handleNestedChange("commitment_to_purity", "overline", e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold mb-1 text-gray-500">Section Title</label>
                                    <input
                                        type="text"
                                        className="admin-input text-sm"
                                        value={content.commitment_to_purity.title}
                                        onChange={(e) => handleNestedChange("commitment_to_purity", "title", e.target.value)}
                                    />
                                </div>

                                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 pt-4">Value Proposition Pillars</h3>
                                {content.commitment_to_purity.items.map((item, idx) => (
                                    <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                                        <div className="flex gap-4 items-center">
                                            <div className="w-14">
                                                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Icon</label>
                                                <input
                                                    type="text"
                                                    className="w-full border border-gray-200 rounded-lg p-1.5 outline-none text-center text-sm"
                                                    value={item.icon}
                                                    onChange={(e) => handlePurityItemChange(idx, "icon", e.target.value)}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Title</label>
                                                <input
                                                    type="text"
                                                    className="w-full border border-gray-200 rounded-lg p-1.5 outline-none text-sm font-semibold"
                                                    value={item.title}
                                                    onChange={(e) => handlePurityItemChange(idx, "title", e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Description</label>
                                            <textarea
                                                rows={2}
                                                className="w-full border border-gray-200 rounded-lg p-2 outline-none text-sm"
                                                value={item.desc}
                                                onChange={(e) => handlePurityItemChange(idx, "desc", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === "about" && (
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: "var(--admin-text-dim)" }}>About & Secure Login Disclaimer</h3>
                                <div>
                                    <label className="block text-xs font-semibold mb-1 text-gray-500">Section Title</label>
                                    <input
                                        type="text"
                                        className="admin-input text-sm"
                                        value={content.about_section.title}
                                        onChange={(e) => handleNestedChange("about_section", "title", e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold mb-1 text-gray-500">Description Paragraph</label>
                                    <textarea
                                        rows={6}
                                        className="admin-input text-sm"
                                        value={content.about_section.paragraph}
                                        onChange={(e) => handleNestedChange("about_section", "paragraph", e.target.value)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Live Preview Panel (Right Side) */}
                <div className="w-1/2 flex flex-col bg-gray-900 rounded-2xl overflow-hidden shadow-inner relative border border-gray-800">
                    <div className="bg-gray-850 px-4 py-3 flex items-center justify-between border-b border-gray-800 z-10">
                        <div className="flex gap-2 items-center">
                            <Eye size={14} className="text-green-500" />
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Live Preview Simulator</span>
                        </div>
                        <div className="px-2 py-1 rounded bg-yellow-500/10 border border-yellow-500/20 text-[10px] text-yellow-500 font-bold uppercase tracking-wide">
                            Auto translation active in browser based on subpath
                        </div>
                    </div>

                    {/* Simulator Container */}
                    <div className="flex-1 bg-amber-50/10 overflow-y-auto p-4 flex items-start justify-center">
                        <div
                            className={`bg-[#FFF8E7] text-[var(--gray-800)] shadow-2xl transition-all duration-300 ${previewMode === "mobile" ? "w-[375px] min-h-[667px] rounded-3xl border-8 border-gray-800 my-4" : "w-full min-h-full rounded-xl"}`}
                            style={{
                                color: "#2B2A27",
                                fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                            }}
                        >
                            {/* Simulated Navigation */}
                            <div className="h-12 bg-white/80 backdrop-blur border-b border-black/5 flex items-center justify-between px-6 sticky top-0 z-20">
                                <div className="text-sm font-extrabold text-[#1B4332] tracking-wider">🍯 KRISHNA</div>
                                <div className="flex gap-3 items-center text-[11px] font-semibold text-gray-500">
                                    <span>Home</span>
                                    <span>Shop</span>
                                    <span>Our Story</span>
                                    <div className="flex gap-1 items-center px-1.5 py-0.5 rounded border border-gray-200 bg-gray-50 text-[9px]">
                                        <Globe size={9} className="text-amber-500" /> EN
                                    </div>
                                </div>
                            </div>

                            {/* Simulated Hero Section */}
                            <div className="py-16 px-6 text-center relative overflow-hidden bg-[#FFF8E7] border-b border-black/5">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1B4332]/5 border border-[#1B4332]/10 rounded-full mb-4">
                                    <span className="text-[9px] font-bold text-[#1B4332] uppercase tracking-wider">
                                        ✨ {content.hero.badge}
                                    </span>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-extrabold mb-4 text-[#1B4332] leading-tight" style={{ fontFamily: "Playfair Display, Georgia, serif" }}>
                                    {content.hero.title_normal}
                                    <br />
                                    <span className="italic text-amber-600 block mt-1">{content.hero.title_italic}</span>
                                </h1>
                                <p className="text-xs md:text-sm text-gray-500 max-w-sm mx-auto mb-6 leading-relaxed">
                                    {content.hero.subtitle}
                                </p>
                                <div className="flex gap-3 justify-center mb-8">
                                    <span className="bg-[#1B4332] text-white px-5 py-2 rounded-full text-xs font-bold shadow-sm">
                                        {content.hero.primary_btn_text}
                                    </span>
                                    <span className="border border-[#1B4332] text-[#1B4332] px-5 py-2 rounded-full text-xs font-bold">
                                        {content.hero.secondary_btn_text}
                                    </span>
                                </div>

                                <div className="flex flex-wrap justify-center gap-6 mt-8">
                                    {content.hero.badges.map((badge, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-[#1B4332]/5 flex items-center justify-center text-sm shadow-sm">{badge.icon}</div>
                                            <div className="text-left leading-tight">
                                                <p className="text-[10px] font-bold text-[#1B4332]">{badge.title}</p>
                                                <p className="text-[8px] text-gray-400">{badge.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Simulated Featured Heading */}
                            <div className="py-12 px-6 text-center border-b border-black/5 bg-white">
                                <p className="text-[9px] font-bold uppercase tracking-wider text-amber-500 mb-1">{content.featured_products.overline}</p>
                                <h2 className="text-xl font-bold text-[#1B4332] mb-2">{content.featured_products.title}</h2>
                                <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">{content.featured_products.subtitle}</p>
                            </div>

                            {/* Simulated Brand Story */}
                            <div className="py-14 px-6 text-center bg-[#1B4332] text-white">
                                <p className="text-[9px] font-bold uppercase tracking-wider text-amber-400 mb-2">{content.brand_story.overline}</p>
                                <h2 className="text-xl md:text-2xl font-bold mb-4">{content.brand_story.title}</h2>
                                <p className="text-sm italic text-amber-200/90 mb-4 font-serif">&quot;{content.brand_story.quote}&quot;</p>
                                <p className="text-[11px] text-white/70 max-w-sm mx-auto mb-6 leading-relaxed">{content.brand_story.paragraph}</p>
                                <span className="inline-block bg-amber-500 text-[#1B4332] px-5 py-2 rounded-full text-xs font-bold">
                                    {content.brand_story.btn_text}
                                </span>
                            </div>

                            {/* Simulated Purity Grid */}
                            <div className="py-12 px-6 bg-white border-b border-black/5">
                                <div className="text-center mb-8">
                                    <p className="text-[9px] font-bold uppercase tracking-wider text-amber-500 mb-1">{content.commitment_to_purity.overline}</p>
                                    <h2 className="text-xl font-bold text-[#1B4332]">{content.commitment_to_purity.title}</h2>
                                </div>
                                <div className="space-y-4">
                                    {content.commitment_to_purity.items.map((item, idx) => (
                                        <div key={idx} className="flex gap-4 p-4 rounded-xl bg-[#FFF8E7] border border-black/5">
                                            <div className="w-10 h-10 rounded-lg bg-[#1B4332]/5 flex items-center justify-center text-xl shrink-0">{item.icon}</div>
                                            <div>
                                                <h4 className="text-xs font-bold text-[#1B4332] mb-1">{item.title}</h4>
                                                <p className="text-[10px] text-gray-500 leading-normal">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Simulated About Section */}
                            <div className="py-10 px-6 text-center bg-[#FFF8E7]">
                                <h3 className="text-sm font-bold text-[#1B4332] mb-3">{content.about_section.title}</h3>
                                <p className="text-[10px] text-gray-500 leading-relaxed max-w-md mx-auto">{content.about_section.paragraph}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
