"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminHomePage() {
    const router = useRouter();
    useEffect(() => {
        router.replace("/admin/dashboard");
    }, [router]);
    return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--admin-bg)' }}>
            <div className="w-8 h-8 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
        </div>
    );
}
