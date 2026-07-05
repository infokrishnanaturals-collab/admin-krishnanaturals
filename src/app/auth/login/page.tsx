"use client";

import { useState } from "react";
import { Mail, Lock, Shield, Leaf } from "lucide-react";
import { signInWithEmail } from "@/lib/firebase/auth";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

function getFriendlyErrorMessage(err: unknown): string {
    if (err instanceof Error) {
        const msg = err.message.toLowerCase();
        if (msg.includes("auth/popup-closed-by-user")) return "Sign-in was cancelled.";
        if (msg.includes("auth/user-not-found")) return "No admin account found with this email.";
        if (msg.includes("auth/wrong-password")) return "Incorrect password.";
        if (msg.includes("auth/invalid-credential")) return "Invalid email or password.";
        if (msg.includes("auth/network-request-failed")) return "Network error. Check your connection.";
        return err.message.replace("Firebase: Error ", "").replace(/\(auth\/.*\)\.?/, "").trim();
    }
    return "An unexpected authentication error occurred.";
}

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        // Strict Admin Security Check
        const allowedEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase();
        if (!allowedEmail || email.toLowerCase() !== allowedEmail) {
            toast.error("Unauthorized Account. Access restricted to Master Admin.");
            
            // Log unauthorized access attempt
            fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/audit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "login_unauthorized",
                    actor_email: email,
                    details: { reason: "Email not matching NEXT_PUBLIC_ADMIN_EMAIL" }
                })
            }).catch(console.error);

            setLoading(false);
            return;
        }
        try {
            await signInWithEmail(email, password);
            toast.success("Welcome back! Select your profile.");
            router.push("/profiles");
        } catch (err: unknown) {
            const errorMsg = getFriendlyErrorMessage(err);
            toast.error(errorMsg);
            
            // Log failed login
            fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/audit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "login_failed",
                    actor_email: email,
                    details: { error: errorMsg }
                })
            }).catch(console.error);

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-[var(--cream)] overflow-hidden">
            {/* Left — Brand Panel */}
            <div className="hidden lg:flex flex-col items-center justify-center flex-1 relative overflow-hidden bg-[var(--forest-dark)] text-white">
                {/* Organic decorative shapes */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[var(--forest-light)] rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-float" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[var(--gold)] rounded-full mix-blend-screen filter blur-[100px] opacity-10 animate-float-delayed" />
                
                {/* Subtle grid pattern */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(var(--white) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

                <div className="relative z-10 text-center px-12 max-w-lg fade-in-up">
                    <div className="w-24 h-24 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-10 bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl">
                        <Leaf className="w-10 h-10 text-[var(--gold-light)]" />
                    </div>
                    <h1 className="text-5xl font-bold text-white mb-6 font-serif leading-tight">
                        Krishna Naturals
                    </h1>
                    <p className="text-gray-300 text-lg leading-relaxed font-light mb-12">
                        Admin Portal — Manage your products, orders, analytics, and store content from one powerful, organic dashboard.
                    </p>
                    
                    <div className="flex items-center justify-center gap-10 text-xs text-gray-400 font-medium tracking-widest uppercase">
                        <span className="flex items-center gap-2"><Shield size={14} className="text-[var(--gold)]" /> Secure</span>
                        <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[var(--gold)]"></span> Analytics</span>
                        <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[var(--gold)] animate-pulse"></span> Real-time</span>
                    </div>
                </div>
            </div>

            {/* Right — Login Form */}
            <div className="flex-1 flex items-center justify-center px-6 py-12 relative bg-[var(--cream)]">
                {/* Subtle mobile decor */}
                <div className="absolute top-[-20%] right-[-20%] w-[300px] h-[300px] bg-[var(--gold-light)] rounded-full filter blur-[100px] opacity-20 lg:hidden" />
                
                <div className="w-full max-w-md relative z-10 fade-in-left">
                    {/* Mobile-only brand */}
                    <div className="lg:hidden text-center mb-10 fade-in-up fade-in-delay-1">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-6 bg-white border border-gray-100 shadow-md text-[var(--forest)]">
                            <Leaf size={28} />
                        </div>
                    </div>

                    <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                        {/* Header */}
                        <div className="mb-10 text-center">
                            <h2 className="admin-heading">
                                Master Admin Portal
                            </h2>
                            <p className="admin-subheading">
                                Sign in with your master credentials
                            </p>
                        </div>

                        {/* Email Login */}
                        <form onSubmit={handleEmailLogin} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 ml-1">Email address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[var(--forest)] transition-colors" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[var(--forest-muted)] focus:border-[var(--forest)] block pl-11 p-3.5 transition-all outline-none"
                                        placeholder="admin@example.com"
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 ml-1">Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[var(--forest)] transition-colors" />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[var(--forest-muted)] focus:border-[var(--forest)] block pl-11 p-3.5 transition-all outline-none"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 rounded-xl text-sm font-bold transition-all duration-300 mt-4 bg-[var(--forest)] text-white hover:bg-[var(--forest-light)] hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                            >
                                {loading ? "Signing in..." : "Sign in to Dashboard"}
                                {!loading && <Shield size={16} className="opacity-50 group-hover:opacity-100 transition-opacity" />}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
