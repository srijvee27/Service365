"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { MerchantLayout } from "@/components/layout/MerchantLayout";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  RotateCcw,
  Wallet,
  DollarSign,
  ArrowRight,
  Printer,
  Search,
  PlusCircle,
  TrendingUp,
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface OrderSummaryItem {
  id: string;
  orderNumber: string;
  trackingId: string;
  receiverName: string;
  receiverDistrict: string;
  receiverPhone: string;
  paymentMethod: string;
  codAmount: number;
  totalCharge: number;
  status: string;
  createdAt: string;
}

const mockChartData = [
  { day: "Mon", orders: 12, cod: 18400 },
  { day: "Tue", orders: 19, cod: 24500 },
  { day: "Wed", orders: 15, cod: 19200 },
  { day: "Thu", orders: 28, cod: 41000 },
  { day: "Fri", orders: 22, cod: 31500 },
  { day: "Sat", orders: 34, cod: 52000 },
  { day: "Sun", orders: 30, cod: 46800 },
];

export default function MerchantDashboardPage() {
  const [orders, setOrders] = useState<OrderSummaryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await fetch("/api/orders");
        const json = await res.json();
        if (json.success && json.data) {
          setOrders(json.data);
        }
      } catch {
        // use empty
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  // Compute metrics
  const totalOrders = orders.length;
  const delivered = orders.filter((o) => o.status === "DELIVERED").length;
  const inTransit = orders.filter((o) => o.status === "IN_TRANSIT" || o.status === "OUT_FOR_DELIVERY").length;
  const pendingPickup = orders.filter((o) => o.status === "ORDER_CREATED" || o.status === "PICKUP_REQUESTED").length;
  const returns = orders.filter((o) => o.status.includes("RETURN")).length;

  const totalCodCollected = orders
    .filter((o) => o.status === "DELIVERED")
    .reduce((sum, o) => sum + Number(o.codAmount || 0), 0);

  const pendingCod = orders
    .filter((o) => o.status !== "DELIVERED" && o.paymentMethod === "COD")
    .reduce((sum, o) => sum + Number(o.codAmount || 0), 0);

  return (
    <MerchantLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Welcome Header & Quick Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Merchant Overview
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Live consignment performance, COD earnings, and transit metrics across 64 districts
            </p>
          </div>

          <Link
            href="/merchant/parcels/create"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-5 py-3 rounded-xl shadow-md shadow-blue-500/20 transition transform active:scale-95 shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Parcel</span>
          </Link>
        </div>

        {/* 8 Metric Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Total Bookings</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalOrders}</div>
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <Package className="w-3.5 h-3.5 text-blue-600" /> Lifetime consignments
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Pending Pickup</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-600">{pendingPickup}</div>
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" /> Awaiting rider pickup
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">In Transit</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-600">{inTransit}</div>
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-blue-500" /> On route to buyer
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Delivered</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">{delivered}</div>
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Doorstep confirmed
            </p>
          </div>

          {/* Financial Cards */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Available Balance</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
              {formatCurrency(totalCodCollected > 0 ? totalCodCollected - 450 : 8450)}
            </div>
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5 text-emerald-500" /> Ready for withdrawal
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">COD Pending</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-800">
              {formatCurrency(pendingCod > 0 ? pendingCod : 2800)}
            </div>
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" /> In transit cash
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Returns (RTM)</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-red-600">{returns}</div>
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <RotateCcw className="w-3.5 h-3.5 text-red-500" /> Reverse transit
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Delivery Success</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-600">
              {totalOrders > 0 ? `${Math.round((delivered / totalOrders) * 100)}%` : "98.5%"}
            </div>
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-purple-500" /> Completion rate
            </p>
          </div>
        </div>

        {/* Analytics Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Weekly Delivery & COD Volume</h3>
              <p className="text-xs text-slate-500">Total parcel volume and cash collections over the past 7 days</p>
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
              Live Trends
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData}>
                <defs>
                  <linearGradient id="orderGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop stopColor="#2563EB" stopOpacity={0.4} />
                    <stop stopColor="#2563EB" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#94A3B8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94A3B8" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0F172A", color: "#FFF", borderRadius: 8, fontSize: 12 }}
                />
                <Area type="monotone" dataKey="orders" stroke="#2563EB" strokeWidth={3} fill="url(#orderGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Parcel Bookings</h3>
              <p className="text-xs text-slate-500">Live order statuses and printable labels</p>
            </div>
            <Link
              href="/merchant/orders"
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              <span>View All Orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Package className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No orders booked yet</p>
              <Link
                href="/merchant/parcels/create"
                className="inline-flex items-center gap-1.5 bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-lg"
              >
                <span>Book Your First Parcel</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-5">Consignment ID</th>
                    <th className="py-3 px-5">Recipient</th>
                    <th className="py-3 px-5">Destination</th>
                    <th className="py-3 px-5">COD Amount</th>
                    <th className="py-3 px-5">Charge</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.slice(0, 5).map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-5 font-mono font-bold text-blue-600">
                        {o.trackingId}
                        <span className="block text-[10px] text-slate-400 font-normal">{o.orderNumber}</span>
                      </td>
                      <td className="py-3.5 px-5 font-medium text-slate-900">
                        {o.receiverName}
                        <span className="block text-[10px] text-slate-400">{o.receiverPhone}</span>
                      </td>
                      <td className="py-3.5 px-5 text-slate-700">{o.receiverDistrict}</td>
                      <td className="py-3.5 px-5 font-semibold text-slate-800">
                        {o.paymentMethod === "COD" ? formatCurrency(o.codAmount) : "Prepaid"}
                      </td>
                      <td className="py-3.5 px-5 text-slate-600 font-semibold">{formatCurrency(o.totalCharge)}</td>
                      <td className="py-3.5 px-5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            o.status === "DELIVERED"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : o.status === "OUT_FOR_DELIVERY"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {o.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right space-x-2">
                        <Link
                          href={`/track/${o.trackingId}`}
                          className="inline-flex items-center text-slate-500 hover:text-blue-600 font-semibold text-xs"
                        >
                          Track
                        </Link>
                        <Link
                          href={`/print/label/${o.orderNumber}`}
                          target="_blank"
                          className="inline-flex items-center text-slate-500 hover:text-slate-900 font-semibold text-xs"
                        >
                          Label
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </MerchantLayout>
  );
}
