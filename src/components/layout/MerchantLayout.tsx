"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Service365Logo } from "@/components/branding/Service365Logo";
import {
  LayoutDashboard,
  PlusCircle,
  Package,
  Truck,
  Search,
  DollarSign,
  Wallet,
  RotateCcw,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Store,
  Bell,
  User,
} from "lucide-react";

interface MerchantLayoutProps {
  children: React.ReactNode;
}

export function MerchantLayout({ children }: MerchantLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [merchantName, setMerchantName] = useState("Merchant Console");

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me");
        const json = await res.json();
        if (json.success && json.user) {
          setMerchantName(json.user.name);
        }
      } catch {
        // use default
      }
    }
    loadUser();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const menuItems = [
    { href: "/merchant/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/merchant/parcels/create", label: "Create Parcel", icon: PlusCircle, highlight: true },
    { href: "/merchant/orders", label: "Orders", icon: Package },
    { href: "/merchant/cod", label: "COD Ledger", icon: DollarSign },
    { href: "/merchant/wallet", label: "Wallet & Payouts", icon: Wallet },
    { href: "/merchant/returns", label: "Returns", icon: RotateCcw },
    { href: "/merchant/reports", label: "Reports & Analytics", icon: BarChart3 },
    { href: "/merchant/settings", label: "Store Settings", icon: Settings },
    { href: "/merchant/support", label: "Support Tickets", icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-slate-100/70 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800">
            <Link href="/merchant/dashboard">
              <Service365Logo theme="dark" size="md" />
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Store Info Pill */}
          <div className="px-4 py-4">
            <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                <Store className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <h4 className="text-xs font-bold text-white truncate">{merchantName}</h4>
                <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Active Merchant
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1 text-xs font-semibold">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${
                    item.highlight
                      ? "bg-blue-600 text-white font-bold shadow-sm shadow-blue-500/20 hover:bg-blue-500"
                      : isActive
                      ? "bg-slate-800 text-white border-l-4 border-blue-500"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 space-y-2 text-xs">
          <Link
            href="/track"
            target="_blank"
            className="flex items-center gap-2.5 px-3 py-2 text-slate-400 hover:text-white rounded-lg transition"
          >
            <Search className="w-4 h-4" />
            <span>Public Consignment Search</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-lg transition font-semibold"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main App Container */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline-block">
              Service365 Merchant Operations Portal
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/merchant/parcels/create"
              className="hidden sm:inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Book Parcel</span>
            </Link>

            <div className="h-8 w-px bg-slate-200" />

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                <User className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800 hidden sm:inline-block">
                {merchantName}
              </span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}

export default MerchantLayout;
