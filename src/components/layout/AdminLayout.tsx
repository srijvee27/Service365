"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  Bike,
  Package,
  BadgePercent,
  MapPin,
  CircleDollarSign,
  BarChart3,
  ShieldAlert,
  Headphones,
  LogOut,
  Menu,
  X,
  Bell,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import Service365Logo from "@/components/branding/Service365Logo";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Global Orders", icon: Package },
  { href: "/admin/merchants", label: "Merchants", icon: Store },
  { href: "/admin/riders", label: "Riders & Fleets", icon: Bike },
  { href: "/admin/pricing", label: "Pricing Rules", icon: BadgePercent },
  { href: "/admin/locations", label: "Coverage (64 Districts)", icon: MapPin },
  { href: "/admin/cod-settlements", label: "COD Settlements", icon: CircleDollarSign },
  { href: "/admin/reports", label: "Analytics & Reports", icon: BarChart3 },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: ShieldAlert },
  { href: "/admin/tickets", label: "Support Tickets", icon: Headphones },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    async function checkAdmin() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        const user = data.user || data.data;
        if (!data.success || !user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
          // If not admin, redirect to admin login
          router.push("/admin/login");
        } else {
          setAdminUser(user);
          setCheckingAuth(false);
        }
      } catch (err) {
        router.push("/admin/login");
      }
    }
    checkAdmin();
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-400">Verifying administrative session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-950 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800/80">
          <Link href="/admin/dashboard" className="flex items-center space-x-2">
            <Service365Logo theme="dark" size="sm" />
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Admin Role Tag */}
        <div className="px-6 py-3 bg-slate-900/50 border-b border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-mono font-semibold tracking-wider text-slate-400 uppercase">
              Admin Console
            </span>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50">
            ROOT
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-blue-600 text-white font-semibold shadow-sm"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/80"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Admin Profile Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 truncate">
              <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm shrink-0">
                {adminUser?.name?.charAt(0) || "A"}
              </div>
              <div className="truncate text-left">
                <p className="text-xs font-bold text-white truncate">{adminUser?.name || "System Admin"}</p>
                <p className="text-[11px] text-slate-400 truncate">{adminUser?.email || "admin@service365.demo"}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:block">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Operations Management
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/admin/orders"
              className="hidden md:inline-flex items-center px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
            >
              <Package className="w-3.5 h-3.5 mr-1.5" /> Dispatch Hub
            </Link>
            <Link
              href="/track"
              target="_blank"
              className="text-xs font-medium text-slate-500 hover:text-slate-800 px-2 py-1"
            >
              Public Tracker ↗
            </Link>
          </div>
        </header>

        {/* Children View */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
