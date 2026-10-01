"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { ShieldAlert, Search, RefreshCw, User, Terminal } from "lucide-react";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadLogs = async () => {
    try {
      const res = await fetch("/api/admin/audit-logs");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setLogs(data.data);
      }
    } catch (err) {
      console.error("Failed to load audit logs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = logs.filter((l) => {
    const actionMatch = l.action.toLowerCase().includes(search.toLowerCase());
    const entityMatch = l.entity?.toLowerCase().includes(search.toLowerCase());
    const userMatch = l.user?.email?.toLowerCase().includes(search.toLowerCase());
    return actionMatch || entityMatch || userMatch;
  });

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center">
            <ShieldAlert className="w-6 h-6 text-rose-600 mr-2.5" /> Security & Operational Audit Trail
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Immutable log of all administrative modifications, pricing revisions, and financial settlements.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search action, actor, entity..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>

          <button
            onClick={loadLogs}
            className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition"
            title="Refresh Logs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center">
            <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h3 className="font-bold text-slate-800">No audit logs</h3>
            <p className="text-xs text-slate-500 mt-1">No operational events matched your search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="py-3.5 px-6">Timestamp</th>
                  <th className="py-3.5 px-6">Actor / User</th>
                  <th className="py-3.5 px-6">Action</th>
                  <th className="py-3.5 px-6">Entity & ID</th>
                  <th className="py-3.5 px-6">Context & Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-xs">
                {filteredLogs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-6 text-slate-500 whitespace-nowrap">
                      {new Date(l.createdAt).toLocaleString("en-GB")}
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-bold text-slate-900 block">{l.user?.name || "System"}</span>
                      <span className="text-[10px] text-slate-400">{l.user?.email}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                        {l.action}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-700">
                      <span className="font-semibold text-slate-900">{l.entity}</span>
                      {l.entityId && <span className="block text-[10px] text-slate-400">ID: {l.entityId}</span>}
                    </td>
                    <td className="py-4 px-6 text-[11px] text-slate-600 max-w-xs truncate">
                      {l.details ? JSON.stringify(l.details) : "—"}
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
