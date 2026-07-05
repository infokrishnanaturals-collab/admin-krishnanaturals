"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error securely to an external reporting system if available, or just console
        console.error("Application runtime error:", error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--cream)] px-6" style={{ paddingTop: "6rem" }}>
            <div className="max-w-md w-full text-center py-12 animate-fade-in-up">
                {/* Error Icon */}
                <div className="relative w-24 h-24 mx-auto mb-8 flex items-center justify-center rounded-full bg-red-50 text-red-500 shadow-md">
                    <AlertCircle size={48} />
                </div>

                <h1 className="text-3xl font-extrabold mb-4" style={{ fontFamily: "'Playfair Display', serif", color: "var(--forest-dark)" }}>
                    Something Went Wrong
                </h1>
                
                <p className="text-sm mb-8 max-w-sm mx-auto leading-relaxed" style={{ color: "var(--gray-500)" }}>
                    An unexpected error occurred while loading this page. Rest assured, our team has been notified.
                </p>

                {/* Masked digest code for developers, safe for public display */}
                {error.digest && (
                    <p className="text-[10px] uppercase tracking-wider font-semibold mb-8 text-gray-400 bg-gray-50/50 py-1.5 px-3 rounded-lg border inline-block">
                        Error ID: {error.digest}
                    </p>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => reset()}
                        className="btn btn-primary shadow-lg flex items-center justify-center gap-2"
                    >
                        <RefreshCw size={16} /> Try Again
                    </button>
                    <Link href="/" className="btn btn-outline flex items-center justify-center gap-2">
                        <Home size={16} /> Go Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
