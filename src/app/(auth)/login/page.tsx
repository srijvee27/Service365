"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Service365Logo } from "@/components/branding/Service365Logo";
import { Lock, Mail, ArrowRight, AlertCircle, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        setError(data.error?.message || "Invalid credentials");
        return;
      }

      // Redirection based on role
      const role = data.user?.role;
      if (role === "SUPER_ADMIN" || role === "ADMIN") {
        router.push("/admin/dashboard");
      } else if (role === "MERCHANT") {
        router.push("/merchant/dashboard");
      } else if (role === "RIDER") {
        router.push("/rider/dashboard");
      } else {
        router.push("/customer/dashboard");
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (email: string, pass: string) => {
    setIdentifier(email);
    setPassword(pass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-block hover:opacity-95 transition">
          <Service365Logo size="lg" />
        </Link>
        <h2 className="mt-6 text-2xl font-extrabold text-slate-900 tracking-tight">
          Sign In to Service365
        </h2>
        <p className="mt-2 text-xs text-slate-500">
          Access your merchant console, delivery management, or parcel orders
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 sm:rounded-2xl border border-slate-200">
          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address or Phone Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="name@business.com or 017XXXXXXXX"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">Password</label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-700"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm py-3 px-4 rounded-lg shadow-sm transition flex items-center justify-center gap-2"
            >
              <span>{loading ? "Signing in..." : "Sign In to Account"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 text-center flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> One-Click Demo Logins
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleDemoFill("merchant@service365.demo", "Merchant@365")}
                className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100/80 text-blue-700 font-semibold border border-blue-200/80 transition text-left"
              >
                📦 Merchant Console
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill("admin@service365.demo", "Admin@365")}
                className="p-2 rounded-lg bg-purple-50 hover:bg-purple-100/80 text-purple-700 font-semibold border border-purple-200/80 transition text-left"
              >
                ⚙️ Super Admin
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill("rider@service365.demo", "Rider@365")}
                className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 font-semibold border border-emerald-200/80 transition text-left"
              >
                🛵 Delivery Rider
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill("customer@service365.demo", "Customer@365")}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-semibold border border-slate-200 transition text-left"
              >
                👤 Customer User
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500 space-y-1">
            <p>
              New merchant?{" "}
              <Link href="/merchant/register" className="font-bold text-blue-600 hover:underline">
                Create Merchant Account
              </Link>
            </p>
            <p>
              Are you a customer?{" "}
              <Link href="/register" className="font-bold text-blue-600 hover:underline">
                Sign up as Customer
              </Link>
            </p>
            <p>
              Are you a rider?{" "}
              <Link href="/rider/register" className="font-bold text-blue-600 hover:underline">
                Sign up as Rider
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
