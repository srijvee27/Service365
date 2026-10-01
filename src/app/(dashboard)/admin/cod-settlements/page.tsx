"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { CircleDollarSign, CheckCircle2, Clock, AlertCircle, Search, ExternalLink } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function AdminCodSettlementsPage() {
  const [settlements, setSettlements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalSettlement, setModalSettlement] = useState<any>(null);
  const [trxRef, setTrxRef] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadSettlements = async () => {
    try {
      const res = await fetch("/api/admin/cod-settlements");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setSettlements(data.data);
      }
    } catch (err) {
      console.error("Failed to load settlements", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettlements();
  }, []);

  const handleSettle = async () => {
    if (!modalSettlement || !trxRef.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/cod-settlements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settlementId: modalSettlement.id,
          transactionRef: trxRef.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setModalSettlement(null);
        setTrxRef("");
        await loadSettlements();
      } else {
        alert(data.error?.message || "Settlement failed");
      }
    } catch (err) {
      alert("Error settling COD");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center">
            <CircleDollarSign className="w-6 h-6 text-emerald-600 mr-2.5" /> Merchant COD Settlements & Payouts
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Reconcile collected cash from riders and disburse net earnings to merchants via bKash or Bank.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          </div>
        ) : settlements.length === 0 ? (
          <div className="p-12 text-center">
            <CircleDollarSign className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h3 className="font-bold text-slate-800">No settlement requests</h3>
            <p className="text-xs text-slate-500 mt-1">Merchants haven&apos;t requested any payouts yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="py-3.5 px-6">Batch & Date</th>
                  <th className="py-3.5 px-6">Merchant Business</th>
                  <th className="py-3.5 px-6">Method & Account</th>
                  <th className="py-3.5 px-6">Disbursement Amount</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Approval</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {settlements.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-6">
                      <span className="font-mono font-bold text-slate-900 block">{s.batchNumber}</span>
                      <span className="text-xs text-slate-400">
                        {new Date(s.createdAt).toLocaleDateString("en-GB")}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-800">{s.merchantName}</td>
                    <td className="py-4 px-6">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700">
                        {s.paymentMethod}
                      </span>
                      <p className="text-xs font-mono text-slate-600 mt-0.5">{s.accountNumber}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-bold font-mono text-base text-slate-900">
                        {formatCurrency(s.amount)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          s.status === "SETTLED"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {s.status}
                      </span>
                      {s.transactionRef && (
                        <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                          Trx: {s.transactionRef}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {s.status === "PENDING" ? (
                        <button
                          onClick={() => setModalSettlement(s)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition"
                        >
                          Disburse & Settle
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Reconciled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Settle Modal */}
      {modalSettlement && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Confirm Merchant Disbursement</h3>
            <p className="text-xs text-slate-500 mb-4">
              Disbursing <span className="font-bold text-slate-900 font-mono">{formatCurrency(modalSettlement.amount)}</span> to{" "}
              <span className="font-bold text-slate-900">{modalSettlement.merchantName}</span> via{" "}
              {modalSettlement.paymentMethod} ({modalSettlement.accountNumber}).
            </p>

            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Bank / bKash Transaction Reference ID (TrxID)
              </label>
              <input
                type="text"
                placeholder="e.g. BK9X28M417 or EFT-881923"
                value={trxRef}
                onChange={(e) => setTrxRef(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                This transaction reference will be permanently recorded in the financial ledger.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setModalSettlement(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSettle}
                disabled={!trxRef.trim() || submitting}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition disabled:opacity-50"
              >
                {submitting ? "Processing..." : "Confirm Payout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
