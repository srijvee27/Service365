import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { isDatabaseConfigured } from "@/lib/db";
import { AlertCircle, ExternalLink } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Service365 - Delivering Business. Every Day.",
  description:
    "Fast, reliable and transparent parcel delivery and logistics for growing businesses in Bangladesh. 64 districts nationwide coverage with guaranteed COD & bKash payouts.",
  keywords: [
    "courier bangladesh",
    "parcel delivery dhaka",
    "logistics chittagong",
    "cod courier bd",
    "service365",
    "ecommerce courier",
  ],
  authors: [{ name: "Service365 Bangladesh" }],
  openGraph: {
    title: "Service365 - Bangladesh Logistics & Courier SaaS",
    description: "Delivering Business. Every Day. Doorstep parcel delivery across all 64 districts of Bangladesh.",
    url: "https://service365.vercel.app",
    siteName: "Service365",
    locale: "en_BD",
    type: "website",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} min-h-screen flex flex-col antialiased`}>
        {/* Beginner Setup Banner if DATABASE_URL is not set */}
        {!isDatabaseConfigured && (
          <div className="bg-amber-500 text-slate-900 px-4 py-2 text-sm font-medium border-b border-amber-600 flex items-center justify-between shadow-sm sticky top-0 z-50">
            <div className="flex items-center gap-2 max-w-5xl mx-auto w-full">
              <AlertCircle className="w-5 h-5 text-slate-950 shrink-0" />
              <span>
                <strong>PostgreSQL Setup Required:</strong> DATABASE_URL is not set in <code className="bg-amber-400/80 px-1 py-0.5 rounded text-xs">.env.local</code>. Please create a free Neon PostgreSQL database or run local PostgreSQL.
              </span>
              <a
                href="https://neon.tech"
                target="_blank"
                rel="noreferrer"
                className="ml-auto inline-flex items-center gap-1 bg-slate-900 text-white px-2.5 py-1 rounded text-xs font-semibold hover:bg-slate-800 transition"
              >
                Neon Guide <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {/* Development Payment Sandbox Banner */}
        {process.env.PAYMENT_MODE === "mock" && (
          <div className="bg-blue-600 text-white px-4 py-1 text-xs font-medium flex items-center justify-center gap-2">
            <span>🛠️ Development Payment Mode (Sandbox Simulator Active)</span>
          </div>
        )}

        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
