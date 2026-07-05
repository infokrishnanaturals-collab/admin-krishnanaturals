"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        Sentry.captureException(error);
    }, [error]);
    return (
        <html lang="en">
            <body style={{ margin: 0, padding: 0, background: "#FDFAF3", fontFamily: "sans-serif" }}>
                <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 24px" }}>
                    <div style={{ maxWidth: "400px", width: "100%", textAlign: "center" }}>
                        <div style={{ width: "80px", height: "80px", margin: "0 auto 24px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: "#FEF2F2", color: "#EF4444" }}>
                            <AlertCircle size={40} />
                        </div>
                        <h1 style={{ fontSize: "28px", fontWeight: "bold", margin: "0 0 16px", color: "#0E1F16" }}>Critical Error</h1>
                        <p style={{ fontSize: "14px", color: "#78716C", lineHeight: 1.6, margin: "0 0 32px" }}>
                            A critical error occurred. Please try reloading the page.
                        </p>
                        <button
                            onClick={() => reset()}
                            style={{ padding: "12px 24px", background: "#1A3A2A", color: "#FDFAF3", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "14px" }}
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
