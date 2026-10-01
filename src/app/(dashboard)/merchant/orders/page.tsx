"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { MerchantLayout } from "@/components/layout/MerchantLayout";
import { formatCurrency, formatOrderDate } from "@/lib/utils";
import {
  Package,
  Search,
  PlusCircle,
  AlertCircle,
} from "lucide-react";

const EDITABLE_STATUSES = [
  { value: "ORDER_CREATED", label: "ORDER CREATED" },
  { value: "PICKED_UP", label: "PICKED UP" },
  { value: "IN_TRANSIT", label: "IN TRANSIT" },
  { value: "OUT_FOR_DELIVERY", label: "OUT FOR DELIVERY" },
  { value: "DELIVERED", label: "DELIVERED" },
  { value: "RETURNED", label: "RETURNED" },
];

export default function MerchantOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Edit & Save state
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<Record<string, string>>({});
  const [savingOrderId, setSavingOrderId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders?status=${statusFilter}&search=${encodeURIComponent(search)}`);
      const json = await res.json();
      if (json.success) {
        setOrders(json.data || []);
      }
    } catch {
      // use empty
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const getStatusOptions = (currentStatus: string) => {
    const options = [...EDITABLE_STATUSES];
    if (currentStatus && !options.some((opt) => opt.value === currentStatus)) {
      options.unshift({
        value: currentStatus,
        label: currentStatus.replace(/_/g, " "),
      });
    }
    return options;
  };

  const handleEdit = (orderId: string, currentStatus: string) => {
    setSaveError(null);
    if (editingOrderId === orderId) {
      setEditingOrderId(null);
    } else {
      setEditingOrderId(orderId);
      setSelectedStatuses((prev) => ({
        ...prev,
        [orderId]: currentStatus,
      }));
    }
  };

  const handleSave = async (orderId: string, currentStatus: string) => {
    const newStatus = selectedStatuses[orderId] || currentStatus;

    // If user clicks Save without changing anything or without entering edit mode
    if (editingOrderId !== orderId || newStatus === currentStatus) {
      setEditingOrderId(null);
      return;
    }

    setSavingOrderId(orderId);
    setSaveError(null);

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to update order status. Please try again.");
      }

      setEditingOrderId(null);

      // Optimistically update local order status
      setOrders((prev) =>
        prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
      );

      // Sync with database and update filter tab placement
      await loadOrders();
    } catch (err: any) {
      setSaveError(err.message || "Failed to update order status. Please try again.");
    } finally {
      setSavingOrderId(null);
    }
  };

  return (
    <MerchantLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Order Management</h1>
            <p className="text-xs text-slate-500 mt-0.5">Filter, search, track, and print shipping documents</p>
          </div>
          <Link
            href="/merchant/parcels/create"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Parcel</span>
          </Link>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, Phone, Customer..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto scrollbar-none">
            {["ALL", "ORDER_CREATED", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "RETURNED"].map(
              (st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                    statusFilter === st
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                  }`}
                >
                  {st.replace(/_/g, " ")}
                </button>
              )
            )}
          </div>
        </div>

        {/* Error Alert */}
        {saveError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{saveError}</span>
            </div>
            <button
              onClick={() => setSaveError(null)}
              className="text-red-500 hover:text-red-700 font-bold ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {/* Orders Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Package className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No orders found matching filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-5">Order / Tracking ID</th>
                    <th className="py-3 px-5">Order ID</th>
                    <th className="py-3 px-5">Order Date</th>
                    <th className="py-3 px-5">Customer & Phone</th>
                    <th className="py-3 px-5">Destination Area</th>
                    <th className="py-3 px-5">Weight</th>
                    <th className="py-3 px-5">Payment / COD</th>
                    <th className="py-3 px-5">Delivery Charge</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((o) => {
                    const isEditing = editingOrderId === o.id;
                    const isSaving = savingOrderId === o.id;
                    const currentVal = selectedStatuses[o.id] || o.status;

                    return (
                      <tr key={o.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3.5 px-5 font-mono">
                          <span className="font-bold text-blue-600">{o.trackingId}</span>
                          <span className="block text-[10px] text-slate-400">{o.orderNumber}</span>
                        </td>
                        <td className="py-3.5 px-5 whitespace-nowrap">
                          <span className="font-mono font-bold text-slate-900 block text-xs">
                            {o.orderId || `#${o.id.slice(-6).toUpperCase()}`}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 whitespace-nowrap">
                          <span className="font-semibold text-slate-800 block text-xs">
                            {formatOrderDate(o.orderDate || o.createdAt)}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 font-medium text-slate-900">
                          {o.receiverName}
                          <span className="block text-[10px] text-slate-400 font-mono">{o.receiverPhone}</span>
                        </td>
                        <td className="py-3.5 px-5 text-slate-700">
                          <span className="font-semibold block">{o.receiverDistrict}</span>
                          <span className="text-[10px] text-slate-400">{o.receiverArea}</span>
                        </td>
                        <td className="py-3.5 px-5 font-mono text-slate-600">{Number(o.weight)} kg</td>
                        <td className="py-3.5 px-5">
                          <span className="font-bold text-slate-900">
                            {o.paymentMethod === "COD" ? formatCurrency(o.codAmount) : "Prepaid"}
                          </span>
                          <span className="block text-[10px] text-slate-400 uppercase">{o.paymentMethod}</span>
                        </td>
                        <td className="py-3.5 px-5 font-bold text-slate-700">{formatCurrency(o.totalCharge)}</td>
                        <td className="py-3.5 px-5">
                          <select
                            disabled={!isEditing}
                            value={currentVal}
                            onChange={(e) => {
                              setSelectedStatuses((prev) => ({ ...prev, [o.id]: e.target.value }));
                            }}
                            className={`text-[10px] font-bold uppercase px-2 py-1 rounded-lg border transition ${
                              isEditing
                                ? "bg-white text-blue-700 border-blue-500 ring-2 ring-blue-100 shadow-sm cursor-pointer"
                                : o.status === "DELIVERED"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 cursor-not-allowed"
                                : o.status === "OUT_FOR_DELIVERY"
                                ? "bg-blue-50 text-blue-700 border-blue-200 cursor-not-allowed"
                                : o.status.includes("RETURN") || o.status.includes("FAILED")
                                ? "bg-red-50 text-red-700 border-red-200 cursor-not-allowed"
                                : "bg-amber-50 text-amber-700 border-amber-200 cursor-not-allowed"
                            }`}
                          >
                            {getStatusOptions(o.status).map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3.5 px-5 text-right space-x-3 whitespace-nowrap">
                          <Link
                            href={`/track/${o.trackingId}`}
                            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-bold"
                          >
                            Track
                          </Link>
                          <Link
                            href={`/print/label/${o.orderNumber}`}
                            target="_blank"
                            className="inline-flex items-center text-slate-600 hover:text-slate-900 font-semibold"
                          >
                            Label
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleEdit(o.id, o.status)}
                            className={`inline-flex items-center font-bold transition ${
                              isEditing
                                ? "text-amber-600 hover:text-amber-800 underline"
                                : "text-indigo-600 hover:text-indigo-800"
                            }`}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSave(o.id, o.status)}
                            disabled={isSaving}
                            className={`inline-flex items-center font-bold transition ${
                              isEditing
                                ? "text-emerald-600 hover:text-emerald-800 font-extrabold"
                                : "text-slate-400 hover:text-slate-600 cursor-pointer"
                            } disabled:opacity-50`}
                          >
                            {isSaving ? "Saving..." : "Save"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </MerchantLayout>
  );
}
