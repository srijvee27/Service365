"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AdminLayout from "@/components/layout/AdminLayout";
import {
  Package,
  CheckCircle2,
  Truck,
  Clock,
  CircleDollarSign,
  Store,
  Bike,
  TrendingUp,
  ArrowUpRight,
  Printer,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/admin/stats");
        const data = await res.json();
        if (data.success) {
          setStats(data.data);
        }
      } catch (err) {
        console.error("Failed to load admin stats", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <AdminLayout>
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Central Logistics Command Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time monitoring across 64 Bangladesh districts & hub operations.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="inline-flex items-center px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-ping"></span>
            Network Active (365/24/7)
          </div>
          <Link
            href="/admin/orders"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-sm"
          >
            Manage Global Consignments
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Total Consignments</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900">{stats?.totalOrders ?? 0}</p>
            <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> Delivered: {stats?.deliveredOrders ?? 0}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Delivery Revenue</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CircleDollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900">
              {formatCurrency(stats?.totalRevenue ?? 0)}
            </p>
            <p className="text-xs text-slate-500 font-semibold mt-1">Platform delivery service fees</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">COD Collected</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <CircleDollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900">
              {formatCurrency(stats?.totalCodCollected ?? 0)}
            </p>
            <p className="text-xs text-amber-600 font-semibold mt-1">
              Pending Payout: {formatCurrency(stats?.pendingCodSettlement ?? 0)}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Active Fleet</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Bike className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900">{stats?.activeRiders ?? 0} Riders</p>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              Merchants: {stats?.activeMerchants ?? 0} enrolled
            </p>
          </div>
        </div>
      </div>

      {/* Operations Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <Link
          href="/admin/merchants"
          className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Merchant Verification</h3>
          <p className="text-xs text-slate-500 mt-1">Review onboarding applications, trade licenses, and payout details.</p>
        </Link>

        <Link
          href="/admin/riders"
          className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Bike className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Rider Hub Dispatch</h3>
          <p className="text-xs text-slate-500 mt-1">Assign deliveries to riders, monitor cash collected and delivery proofs.</p>
        </Link>

        <Link
          href="/admin/cod-settlements"
          className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CircleDollarSign className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">COD Batch Settlements</h3>
          <p className="text-xs text-slate-500 mt-1">Approve pending merchant wallet disbursements to bKash or Bank.</p>
        </Link>
      </div>

      {/* Recent Consignments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Global Consignments</h2>
            <p className="text-xs text-slate-500">Live order stream passing through Service365 network</p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800"
          >
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          </div>
        ) : !stats?.recentOrders || stats.recentOrders.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">No orders yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="py-3 px-6">Tracking ID</th>
                  <th className="py-3 px-6">Merchant</th>
                  <th className="py-3 px-6">Recipient</th>
                  <th className="py-3 px-6">Destination</th>
                  <th className="py-3 px-6">COD</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Label</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.recentOrders.map((o: any) => (
                  <tr key={o.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-6">
                      <Link
                        href={`/track/${o.trackingId}`}
                        className="font-mono font-bold text-blue-600 hover:underline block"
                      >
                        {o.trackingId}
                      </Link>
                      <span className="text-[11px] text-slate-400 font-mono">{o.orderNumber}</span>
                    </td>
                    <td className="py-3.5 px-6 font-medium text-slate-800">
                      {o.merchant?.businessName || o.senderName}
                    </td>
                    <td className="py-3.5 px-6">
                      <p className="font-medium text-slate-900">{o.receiverName}</p>
                      <p className="text-xs text-slate-400 font-mono">{o.receiverPhone}</p>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="text-xs font-semibold text-slate-700 block">{o.receiverDistrict}</span>
                      <span className="text-[11px] text-slate-500">{o.receiverArea}</span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="font-bold text-slate-900 block">
                        {o.paymentMethod === "COD" ? formatCurrency(o.codAmount) : "Paid"}
                      </span>
                      <span className="text-[11px] text-slate-400">Charge: {formatCurrency(o.totalCharge)}</span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
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
                    <td className="py-3.5 px-6 text-right">
                      <Link
                        href={`/print/label/${o.id}`}
                        target="_blank"
                        className="inline-flex items-center p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                        title="Print 4x6 Thermal Label"
                      >
                        <Printer className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
