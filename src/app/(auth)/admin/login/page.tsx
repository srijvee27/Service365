"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Service365Logo } from "@/components/branding/Service365Logo";
import { ShieldCheck, ArrowRight, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("admin@service365.demo");
  const [password, setPassword] = useState("Admin@365");
  const [loading, setLoading] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    async function checkExisting() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        const user = data.user || data.data;
        if (data.success && user && (user.role === "SUPER_ADMIN" || user.role === "ADMIN")) {
          router.replace("/admin/dashboard");
          return;
        }
      } catch {
        // stay on login
      } finally {
        setCheckingExisting(false);
      }
    }
    checkExisting();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error?.message || "Invalid administrative credentials");
        return;
      }

      if (data.user?.role !== "SUPER_ADMIN" && data.user?.role !== "ADMIN") {
        setError("Access denied. Administrative authorization required.");
        return;
      }

      window.location.href = "/admin/dashboard";
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-block hover:opacity-95 transition">
          <Service365Logo theme="dark" size="lg" />
        </Link>
        <div className="mt-4 inline-flex items-center gap-1.5 bg-purple-500/10 text-purple-300 px-3 py-1 rounded-full text-xs font-bold border border-purple-500/20">
          <ShieldCheck className="w-4 h-4" />
          <span>Restricted Admin Portal</span>
        </div>
        <h2 className="mt-2 text-2xl font-extrabold tracking-tight">System Administration</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-800 py-8 px-6 shadow-2xl rounded-2xl border border-slate-700">
          {error && (
            <div className="mb-5 bg-red-900/30 border border-red-500/40 text-red-200 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Admin Email Address
              </label>
              <input
                type="email"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Master Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm py-3 px-4 rounded-lg shadow-sm transition flex items-center justify-center gap-2"
            >
              <span>{loading ? "Authenticating..." : "Authorize Admin Session"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Pre-seeded with demo account: <code className="text-purple-300 font-mono">admin@service365.demo</code>
          </div>
        </div>
      </div>
    </div>
  );
}
