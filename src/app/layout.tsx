/**
 * Root Layout — PWA Enabled
 * 
 * FEATURES:
 * - PWA Manifest
 * - Apple Touch Icon (iOS)
 * - Theme Color (Mobile Chrome)
 * - Viewport (Mobile Optimized)
 * - Site Metadata
 */

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { siteConfig } from "@/config/site";
import "./globals.css";

// ═══════════════════════════════════════════════════════════
// FONTS
// ═══════════════════════════════════════════════════════════

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

// ═══════════════════════════════════════════════════════════
// METADATA
// ═══════════════════════════════════════════════════════════

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.company.name }],
  generator: "Next.js",
  keywords: [
    "ledger",
    "karigar",
    "textile",
    "accounts",
    "business",
    "kanani creation",
  ],

  // ═══════════════════════════════════════════
  // PWA
  // ═══════════════════════════════════════════
  manifest: "/manifest.json",

  // ═══════════════════════════════════════════
  // APPLE (iOS)
  // ═══════════════════════════════════════════
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: siteConfig.shortName,
  },

  // ═══════════════════════════════════════════
  // ICONS
  // ═══════════════════════════════════════════
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      {
        url: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
    shortcut: ["/icons/icon-192x192.png"],
  },

  // ═══════════════════════════════════════════
  // OPENGRAPH
  // ═══════════════════════════════════════════
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },

  // ═══════════════════════════════════════════
  // ROBOTS
  // ═══════════════════════════════════════════
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

// ═══════════════════════════════════════════════════════════
// VIEWPORT (Mobile)
// ═══════════════════════════════════════════════════════════

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0f172a" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

// ═══════════════════════════════════════════════════════════
// ROOT LAYOUT
// ═══════════════════════════════════════════════════════════

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Extra PWA Meta for iOS */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-status-bar-style"
          content="default"
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className="font-sans antialiased bg-slate-50 text-slate-900">
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}