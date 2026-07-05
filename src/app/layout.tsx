import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: {
    default: "Admin — Krishna Naturals",
    template: "%s | Admin · Krishna Naturals",
  },
  description: "Krishna Naturals administration dashboard.",
  robots: { index: false, follow: false },
  manifest: "/manifest.json",
  appleWebApp: {
    title: "Krishna Admin",
    statusBarStyle: "black-translucent",
    capable: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[var(--admin-bg)] text-[var(--admin-text)] antialiased font-sans overflow-x-hidden">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "rgba(30, 30, 40, 0.95)",
              color: "#e4e4e7",
              borderRadius: "12px",
              padding: "12px 20px",
              fontSize: "13px",
              fontWeight: 500,
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(12px)",
            },
            success: {
              iconTheme: { primary: "#22c55e", secondary: "#0a0a0f" },
            },
            error: {
              iconTheme: { primary: "#ef4444", secondary: "#0a0a0f" },
            },
          }}
        />
      </body>
    </html>
  );
}
