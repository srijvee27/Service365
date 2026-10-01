"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import AdminLayout from "@/components/layout/AdminLayout";
import {
  Package,
  Search,
  AlertCircle,
} from "lucide-react";
import { formatCurrency, formatOrderDate } from "@/lib/utils";

const EDITABLE_STATUSES = [
  { value: "ORDER_CREATED", label: "ORDER CREATED" },
  { value: "PICKED_UP", label: "PICKED UP" },
  { value: "IN_TRANSIT", label: "IN TRANSIT" },
  { value: "OUT_FOR_DELIVERY", label: "OUT FOR DELIVERY" },
  { value: "DELIVERED", label: "DELIVERED" },
  { value: "RETURNED", label: "RETURNED" },
];

export default function AdminOrdersPage() {
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
      const ordRes = await fetch("/api/orders");
      const ordData = await ordRes.json();

      if (ordData.success && Array.isArray(ordData.data)) {
        setOrders(ordData.data);
      }
    } catch (err) {
      console.error("Failed to load global orders", err);
    } finally {
      setLoading(false);
    }
  }, []);

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
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to update order status. Please try again.");
      }

      setEditingOrderId(null);

      // Optimistically update order in state
      setOrders((prev) =>
        prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
      );

      // Sync with database
      await loadOrders();
    } catch (err: any) {
      setSaveError(err.message || "Failed to update order status. Please try again.");
    } finally {
      setSavingOrderId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.trackingId.toLowerCase().includes(search.toLowerCase()) ||
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.receiverName.toLowerCase().includes(search.toLowerCase()) ||
      o.receiverPhone.includes(search);
    const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center">
            <Package className="w-6 h-6 text-blue-600 mr-2.5" /> Global Consignments & Dispatch
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Dispatch, monitor delivery lifecycles, and edit order statuses across Bangladesh.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tracking ID, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl text-xs px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
          >
            <option value="ALL">ALL</option>
            <option value="ORDER_CREATED">ORDER CREATED</option>
            <option value="PICKED_UP">PICKED UP</option>
            <option value="IN_TRANSIT">IN TRANSIT</option>
            <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="RETURNED">RETURNED</option>
          </select>
        </div>
      </div>

      {/* Error Alert */}
      {saveError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs flex items-center justify-between mb-4">
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

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h3 className="font-bold text-slate-800">No consignments found</h3>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or search keywords.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="py-3.5 px-6">Tracking / Number</th>
                  <th className="py-3.5 px-6">Order ID</th>
                  <th className="py-3.5 px-6">Order Date</th>
                  <th className="py-3.5 px-6">Merchant / Sender</th>
                  <th className="py-3.5 px-6">Recipient & Address</th>
                  <th className="py-3.5 px-6">COD / Fee</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((o) => {
                  const isEditing = editingOrderId === o.id;
                  const isSaving = savingOrderId === o.id;
                  const currentVal = selectedStatuses[o.id] || o.status;

                  return (
                    <tr key={o.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-4 px-6">
                        <Link
                          href={`/track/${o.trackingId}`}
                          className="font-mono font-bold text-blue-600 hover:underline block"
                        >
                          {o.trackingId}
                        </Link>
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
                        <p className="font-bold text-slate-800">{o.merchant?.businessName || o.senderName}</p>
                        <p className="text-xs text-slate-500">{o.senderDistrict}</p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-medium text-slate-900">{o.receiverName}</p>
                        <p className="text-xs text-slate-500 font-mono">{o.receiverPhone}</p>
                        <p className="text-xs text-slate-600 truncate max-w-[180px]">{o.receiverAddress}</p>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-bold text-slate-900 block">
                          {o.paymentMethod === "COD" ? formatCurrency(o.codAmount) : "Paid Online"}
                        </span>
                        <span className="text-[11px] text-slate-400">Delivery: {formatCurrency(o.totalCharge)}</span>
                      </td>
                      <td className="py-4 px-6">
                        <select
                          disabled={!isEditing}
                          value={currentVal}
                          onChange={(e) => {
                            setSelectedStatuses((prev) => ({ ...prev, [o.id]: e.target.value }));
                          }}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-lg border focus:outline-none transition ${
                            isEditing
                              ? "bg-white text-blue-700 border-blue-500 ring-2 ring-blue-100 shadow-sm cursor-pointer"
                              : o.status === "DELIVERED"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200 cursor-not-allowed"
                              : o.status === "OUT_FOR_DELIVERY"
                              ? "bg-blue-50 text-blue-800 border-blue-200 cursor-not-allowed"
                              : o.status.includes("RETURN") || o.status.includes("FAILED")
                              ? "bg-red-50 text-red-700 border-red-200 cursor-not-allowed"
                              : "bg-slate-50 text-slate-700 border-slate-200 cursor-not-allowed"
                          }`}
                        >
                          {getStatusOptions(o.status).map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-4 px-6 text-right space-x-3 whitespace-nowrap">
                        <Link
                          href={`/track/${o.trackingId}`}
                          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-bold text-xs"
                        >
                          Track
                        </Link>
                        <Link
                          href={`/print/label/${o.orderNumber || o.id}`}
                          target="_blank"
                          className="inline-flex items-center text-slate-600 hover:text-slate-900 font-semibold text-xs"
                        >
                          Label
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleEdit(o.id, o.status)}
                          className={`inline-flex items-center font-bold text-xs transition ${
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
                          className={`inline-flex items-center font-bold text-xs transition ${
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
    </AdminLayout>
  );
}
