"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    ShoppingCart,
    MessageSquare,
    Settings,
    Tag,
    FileText,
    LogOut,
    Star,
    Edit,
    BarChart3,
    Activity,
    Megaphone,
    ChevronRight,
    ExternalLink,
    Shield,
    Leaf,
    Package,
    Users,
    ScanLine,
    Menu as MenuIcon,
    X
} from "lucide-react";
import { auth } from "@/lib/firebase/config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { toast } from "react-hot-toast";

// Primary tabs for Bottom Navigation
const bottomNavItems = [
    { name: "Home", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { name: "Scan", href: "/admin/fulfillment/scanner", icon: ScanLine },
];

// All menu items
const menuItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { name: "Scanner", href: "/admin/fulfillment/scanner", icon: ScanLine },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Batches & QR", href: "/admin/batches", icon: Tag },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "Marketing", href: "/admin/marketing", icon: Megaphone },
    { name: "Content", href: "/admin/blog", icon: FileText },
    { name: "Support", href: "/admin/feedback", icon: MessageSquare },
    { name: "Logs", href: "/admin/logs", icon: Activity },
    { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [adminEmail, setAdminEmail] = useState("");
    const [isMounted, setIsMounted] = useState(false);
    
    // Mobile Bottom Sheet State
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                router.push("/auth/login");
                return;
            }

            const adminDomain = process.env.NEXT_PUBLIC_ADMIN_DOMAIN || "@krishnanaturals.co.in";
            const envAdmin = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase().trim();
            const allowedEmails = envAdmin ? [envAdmin] : [];

            if (
                (user.email && user.email.toLowerCase().endsWith(adminDomain.toLowerCase())) ||
                (user.email && allowedEmails.includes(user.email.toLowerCase()))
            ) {
                try {
                    const idToken = await user.getIdToken(true);
                    await fetch(process.env.NEXT_PUBLIC_API_URL + '/auth/session', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ idToken }),
                    });
                } catch (e) {
                    console.error("Failed to sync session token", e);
                }
                
                setIsAuthorized(true);
                setAdminEmail(user.email || "");
            } else {
                toast.error("Access Denied. Admin privileges required.");
                router.push("/auth/login");
            }
        });

        return () => unsubscribe();
    }, [router]);

    if (!isMounted || !isAuthorized) {
        return (
            <div className="min-h-[100dvh] flex items-center justify-center bg-[#0a0a0f]">
                <div className="flex flex-col items-center gap-6 fade-in-up">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-gray-800 rounded-full"></div>
                        <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                        <Leaf className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-green-400 w-6 h-6 animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    const currentPage = menuItems.find(item => pathname.startsWith(item.href)) || { name: "Admin" };

    return (
        <div className="min-h-[100dvh] bg-[#f8f9fa] text-gray-900 font-sans flex flex-col md:flex-row pb-[env(safe-area-inset-bottom)] md:pb-0">
            
            {/* =========================================
                DESKTOP SIDEBAR (Hidden on Mobile)
                ========================================= */}
            <aside className="hidden md:flex flex-col w-[280px] fixed top-0 left-0 h-screen bg-white border-r border-gray-200 z-50">
                <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shadow-lg">
                        <Leaf size={20} className="text-green-400" />
                    </div>
                    <div>
                        <h2 className="text-base font-black tracking-tight">Krishna Admin</h2>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Workspace</p>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
                    {menuItems.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                                    isActive 
                                    ? 'bg-black text-white shadow-md' 
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-black'
                                }`}
                            >
                                <item.icon size={18} className={isActive ? 'text-green-400' : 'text-gray-400'} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100 bg-gray-50">
                    <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white border border-gray-200 shadow-sm">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-black">
                            {adminEmail.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-black truncate">{adminEmail.split('@')[0]}</p>
                            <p className="text-[10px] text-gray-500 font-medium truncate">Admin</p>
                        </div>
                        <button onClick={() => signOut(auth)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* =========================================
                MAIN CONTENT AREA
                ========================================= */}
            <main className="flex-1 md:ml-[280px] flex flex-col min-h-[100dvh] relative pb-20 md:pb-0">
                
                {/* NATIVE APP HEADER (iOS/Android Style) */}
                <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200 px-4 py-3 md:px-8 md:py-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Mobile Logo */}
                        <div className="md:hidden w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center shadow-md">
                            <Leaf size={16} className="text-green-400" />
                        </div>
                        <h1 className="text-lg md:text-xl font-black tracking-tight flex items-center gap-2">
                            {currentPage.name}
                        </h1>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 bg-green-50 px-2 py-1 md:px-3 md:py-1.5 rounded-full border border-green-200 shadow-sm">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                            <span className="text-[10px] md:text-xs font-bold text-green-700 uppercase tracking-widest hidden sm:inline-block">Online</span>
                        </div>
                    </div>
                </header>

                {/* PAGE CONTENT */}
                <div key={pathname} className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {children}
                </div>
            </main>

            {/* =========================================
                MOBILE BOTTOM NAVIGATION
                ========================================= */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <nav className="flex items-center justify-around px-2 py-2">
                    {bottomNavItems.map((item) => {
                        const isActive = pathname.startsWith(item.href) && !isMenuOpen;
                        return (
                            <Link 
                                key={item.name} 
                                href={item.href}
                                onClick={() => setIsMenuOpen(false)}
                                className="flex flex-col items-center gap-1 p-2 w-16 active:scale-95 transition-transform"
                            >
                                <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-black text-green-400' : 'text-gray-500'}`}>
                                    <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                                </div>
                                <span className={`text-[10px] font-bold ${isActive ? 'text-black' : 'text-gray-500'}`}>
                                    {item.name}
                                </span>
                            </Link>
                        );
                    })}
                    
                    {/* Menu Button */}
                    <button 
                        onClick={() => setIsMenuOpen(true)}
                        className="flex flex-col items-center gap-1 p-2 w-16 active:scale-95 transition-transform"
                    >
                        <div className={`p-1.5 rounded-xl transition-colors ${isMenuOpen ? 'bg-black text-green-400' : 'text-gray-500'}`}>
                            <MenuIcon size={22} strokeWidth={isMenuOpen ? 2.5 : 2} />
                        </div>
                        <span className={`text-[10px] font-bold ${isMenuOpen ? 'text-black' : 'text-gray-500'}`}>
                            Menu
                        </span>
                    </button>
                </nav>
            </div>

            {/* =========================================
                MOBILE MENU BOTTOM SHEET
                ========================================= */}
            {/* Backdrop */}
            <div 
                className={`md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsMenuOpen(false)}
            />
            
            {/* Sheet */}
            <div className={`md:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[70] shadow-[0_-10px_40px_rgba(0,0,0,0.3)] transition-transform duration-500 ease-out flex flex-col max-h-[85vh] ${isMenuOpen ? 'translate-y-0' : 'translate-y-full'}`}>
                <div className="p-4 flex items-center justify-between border-b border-gray-100 shrink-0">
                    <h3 className="text-lg font-black tracking-tight">All Tools</h3>
                    <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-gray-100 rounded-full active:scale-90 transition-transform">
                        <X size={20} className="text-gray-600" />
                    </button>
                </div>
                
                <div className="p-4 overflow-y-auto pb-[calc(env(safe-area-inset-bottom)+20px)] custom-scrollbar">
                    <div className="grid grid-cols-4 gap-y-6 gap-x-2">
                        {menuItems.filter(i => !bottomNavItems.find(b => b.name === i.name)).map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsMenuOpen(false)}
                                className="flex flex-col items-center gap-2 active:opacity-50 transition-opacity"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-700 shadow-sm">
                                    <item.icon size={20} strokeWidth={2} />
                                </div>
                                <span className="text-[10px] font-bold text-gray-600 text-center leading-tight">
                                    {item.name}
                                </span>
                            </Link>
                        ))}
                    </div>
                    
                    <div className="mt-8 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <a href="http://localhost:3000" target="_blank" className="flex items-center gap-3 text-sm font-bold text-gray-700 p-2 active:opacity-50">
                            <ExternalLink size={18} /> View Storefront
                        </a>
                        <button onClick={() => signOut(auth)} className="w-full flex items-center gap-3 text-sm font-bold text-red-600 p-2 mt-2 active:opacity-50">
                            <LogOut size={18} /> Sign Out
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
}
