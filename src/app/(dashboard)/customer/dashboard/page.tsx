"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Package, 
  Search, 
  Clock, 
  CheckCircle2, 
  Truck, 
  ExternalLink, 
  PlusCircle, 
  User, 
  Phone, 
  MapPin, 
  LogOut,
  AlertCircle 
} from "lucide-react";
import Service365Logo from "@/components/branding/Service365Logo";
import { formatCurrency, formatOrderDate } from "@/lib/utils";

interface CustomerOrder {
  id: string;
  orderNumber: string;
  trackingId: string;
  receiverName: string;
  receiverPhone: string;
  receiverDistrict: string;
  receiverArea: string;
  totalCharge: number;
  paymentMethod: string;
  codAmount: number;
  status: string;
  createdAt: string;
  orderDate?: string;
  orderId?: string;
}

export default function CustomerDashboard() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [trackingInput, setTrackingInput] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [userRes, ordersRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/orders"),
        ]);
        const userData = await userRes.json();
        const ordersData = await ordersRes.json();

        if (userData.success) setUser(userData.data);
        if (ordersData.success && Array.isArray(ordersData.data)) {
          setOrders(ordersData.data);
        }
      } catch (err) {
        console.error("Failed to load customer data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  const deliveredCount = orders.filter((o) => o.status === "DELIVERED").length;
  const inTransitCount = orders.filter((o) =>
    ["PICKED_UP", "AT_SORTING_CENTER", "IN_TRANSIT", "OUT_FOR_DELIVERY"].includes(o.status)
  ).length;
  const pendingCount = orders.filter((o) =>
    ["ORDER_CREATED", "ORDER_CONFIRMED", "PICKUP_REQUESTED"].includes(o.status)
  ).length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/">
              <Service365Logo size="sm" />
            </Link>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              Customer Portal
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/merchant/parcels/create"
              className="inline-flex items-center px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition shadow-sm"
            >
              <PlusCircle className="w-4 h-4 mr-1.5" /> Book Parcel
            </Link>
            <div className="flex items-center space-x-2 border-l border-slate-200 pl-4">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-sm">
                {user?.name?.charAt(0) || "C"}
              </div>
              <button
                onClick={handleLogout}
                className="text-slate-500 hover:text-rose-600 p-1 rounded-lg transition"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome & Quick Track Banner */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white mb-8 shadow-lg relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-2xl sm:text-3xl font-black mb-2">
              Welcome, {user?.name || "Valued Customer"}!
            </h1>
            <p className="text-blue-200 text-sm mb-6">
              Track your deliveries across 64 districts in Bangladesh in real-time or send a new parcel.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (trackingInput.trim()) {
                  window.location.href = `/track/${trackingInput.trim()}`;
                }
              }}
              className="flex items-center bg-white rounded-2xl p-1.5 shadow-md max-w-md"
            >
              <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
              <input
                type="text"
                placeholder="Enter Tracking ID (e.g. S365BD9K4M8X2)"
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                className="w-full px-3 py-2 text-slate-900 placeholder-slate-400 text-sm focus:outline-none"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shrink-0"
              >
                Track Now
              </button>
            </form>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Pickup</p>
              <p className="text-2xl font-black text-slate-900">{pendingCount}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">In Transit</p>
              <p className="text-2xl font-black text-slate-900">{inTransitCount}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Delivered</p>
              <p className="text-2xl font-black text-slate-900">{deliveredCount}</p>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center">
              <Package className="w-5 h-5 text-blue-600 mr-2" /> My Parcels & Deliveries
            </h2>
            <span className="text-xs font-medium text-slate-500">{orders.length} total shipments</span>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mx-auto"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No shipments found</h3>
              <p className="text-slate-500 text-xs mt-1 mb-4">You haven&apos;t booked or received any packages yet.</p>
              <Link
                href="/merchant/parcels/create"
                className="inline-flex items-center px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition"
              >
                Send Your First Parcel
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
                    <th className="py-3.5 px-6">Tracking ID & Order</th>
                    <th className="py-3.5 px-6">Order ID</th>
                    <th className="py-3.5 px-6">Order Date</th>
                    <th className="py-3.5 px-6">Recipient</th>
                    <th className="py-3.5 px-6">Destination</th>
                    <th className="py-3.5 px-6">Payment / COD</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-4 px-6">
                        <span className="font-mono font-bold text-blue-600 block">{o.trackingId}</span>
                        <span className="text-xs text-slate-400 font-mono">{o.orderNumber}</span>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="font-mono font-bold text-slate-900 block text-xs">
                          {o.orderId || `#${o.id.slice(-6).toUpperCase()}`}
                        </span>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="font-semibold text-slate-800 block text-xs">
                          {formatOrderDate(o.orderDate || o.createdAt)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-medium text-slate-900">{o.receiverName}</p>
                        <p className="text-xs text-slate-500 font-mono">{o.receiverPhone}</p>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
                          {o.receiverDistrict}
                        </span>
                        <span className="block text-xs text-slate-500 mt-0.5">{o.receiverArea}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-bold text-slate-900 block">
                          {o.paymentMethod === "COD" ? formatCurrency(o.codAmount) : "Paid Online"}
                        </span>
                        <span className="text-[11px] text-slate-400">Charge: {formatCurrency(o.totalCharge)}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            o.status === "DELIVERED"
                              ? "bg-emerald-100 text-emerald-800"
                              : o.status === "OUT_FOR_DELIVERY"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {o.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <Link
                          href={`/track/${o.trackingId}`}
                          className="inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-800"
                        >
                          Track <ExternalLink className="w-3 h-3 ml-1" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
