"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Bike, Phone, MapPin, CheckCircle, XCircle, Search, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function AdminRidersPage() {
  const [riders, setRiders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadRiders = async () => {
    try {
      const res = await fetch("/api/admin/riders");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setRiders(data.data);
      }
    } catch (err) {
      console.error("Error loading riders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRiders();
  }, []);

  const toggleStatus = async (riderId: string, currentActive: boolean) => {
    try {
      const res = await fetch("/api/admin/riders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ riderId, isActive: !currentActive }),
      });
      const data = await res.json();
      if (data.success) {
        await loadRiders();
      }
    } catch (err) {
      alert("Error toggling rider status");
    }
  };

  const filteredRiders = riders.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.phone.includes(search) ||
      r.hub?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center">
            <Bike className="w-6 h-6 text-purple-600 mr-2.5" /> Fleet & Field Delivery Agents
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage field agents, active tasks, cash-in-hand reconciliation, and operational hubs.
          </p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search rider by name, phone, hub..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          </div>
        ) : filteredRiders.length === 0 ? (
          <div className="p-12 text-center">
            <Bike className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h3 className="font-bold text-slate-800">No riders found</h3>
            <p className="text-xs text-slate-500 mt-1">No rider accounts match your query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="py-3.5 px-6">Agent Details</th>
                  <th className="py-3.5 px-6">Operating Hub & Zone</th>
                  <th className="py-3.5 px-6">Active Tasks</th>
                  <th className="py-3.5 px-6">Cash in Hand</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Dispatch Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRiders.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm shrink-0">
                          {r.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{r.name}</p>
                          <p className="text-xs text-slate-500 font-mono">{r.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-xs font-semibold text-slate-800">{r.hub || "Central Hub"}</p>
                      <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 mt-0.5">
                        {r.zone?.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs font-semibold text-blue-600">
                      {r.activeAssignments} active parcels
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-mono font-bold text-slate-900">
                        {formatCurrency(r.cashInHand)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          r.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {r.isActive ? "On Duty" : "Offline"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => toggleStatus(r.id, r.isActive)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                          r.isActive
                            ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white"
                        }`}
                      >
                        {r.isActive ? "Deactivate" : "Activate Duty"}
                      </button>
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
