"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Service365Logo } from "@/components/branding/Service365Logo";
import { Truck, LogOut, Phone, ShieldCheck, MapPin, CheckCircle2 } from "lucide-react";

export function RiderLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [riderStatus, setRiderStatus] = useState<"AVAILABLE" | "BUSY" | "OFFLINE">("AVAILABLE");

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="h-16 bg-slate-950 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Service365Logo theme="dark" size="sm" />
          <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase">
            Rider Console
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Status selector */}
          <select
            value={riderStatus}
            onChange={(e) => setRiderStatus(e.target.value as any)}
            className="bg-slate-800 border border-slate-700 text-xs font-bold rounded-lg px-2.5 py-1 text-emerald-400 focus:outline-none"
          >
            <option value="AVAILABLE">🟢 Available</option>
            <option value="BUSY">🟡 Busy on Delivery</option>
            <option value="OFFLINE">⚪ Offline</option>
          </select>

          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6">{children}</main>
    </div>
  );
}

export default RiderLayout;
