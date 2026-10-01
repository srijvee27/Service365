"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Store, CheckCircle, XCircle, AlertTriangle, Search, ExternalLink, ShieldCheck } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function AdminMerchantsPage() {
  const [merchants, setMerchants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadMerchants = async () => {
    try {
      const res = await fetch("/api/admin/merchants");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setMerchants(data.data);
      }
    } catch (err) {
      console.error("Error loading merchants", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMerchants();
  }, []);

  const updateStatus = async (merchantId: string, newStatus: string) => {
    setActionLoading(merchantId);
    try {
      const res = await fetch(`/api/admin/merchants/${merchantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        await loadMerchants();
      } else {
        alert(data.error?.message || "Failed to update status");
      }
    } catch (err) {
      alert("Error updating merchant status");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredMerchants = merchants.filter((m) => {
    const matchesSearch =
      m.businessName.toLowerCase().includes(search.toLowerCase()) ||
      m.phone.includes(search) ||
      m.contactPerson.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center">
            <Store className="w-6 h-6 text-blue-600 mr-2.5" /> Merchant Directory & Approvals
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage merchant accounts, KYC verification, and payout eligibility across Bangladesh.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search merchants..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl text-xs px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          </div>
        ) : filteredMerchants.length === 0 ? (
          <div className="p-12 text-center">
            <Store className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h3 className="font-bold text-slate-800">No merchants found</h3>
            <p className="text-xs text-slate-500 mt-1">No merchant profiles match your search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="py-3.5 px-6">Business / Contact</th>
                  <th className="py-3.5 px-6">Location</th>
                  <th className="py-3.5 px-6">Total Parcels</th>
                  <th className="py-3.5 px-6">Wallet Balance</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMerchants.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
                          {m.businessName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{m.businessName}</p>
                          <p className="text-xs text-slate-500">
                            {m.contactPerson} • <span className="font-mono">{m.phone}</span>
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-700">
                      <span className="font-semibold">{m.district}</span>
                    </td>
                    <td className="py-4 px-6 text-xs font-semibold text-slate-800">
                      {m.totalOrders} shipments
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-mono font-bold text-slate-900">
                        {formatCurrency(m.walletBalance)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          m.status === "APPROVED"
                            ? "bg-emerald-100 text-emerald-800"
                            : m.status === "PENDING"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      {m.status === "PENDING" && (
                        <button
                          onClick={() => updateStatus(m.id, "APPROVED")}
                          disabled={actionLoading === m.id}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition"
                        >
                          Approve
                        </button>
                      )}
                      {m.status === "APPROVED" && (
                        <button
                          onClick={() => updateStatus(m.id, "SUSPENDED")}
                          disabled={actionLoading === m.id}
                          className="px-2.5 py-1 bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-semibold rounded-lg transition"
                        >
                          Suspend
                        </button>
                      )}
                      {m.status === "SUSPENDED" && (
                        <button
                          onClick={() => updateStatus(m.id, "APPROVED")}
                          disabled={actionLoading === m.id}
                          className="px-2.5 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-semibold rounded-lg transition"
                        >
                          Reactivate
                        </button>
                      )}
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
