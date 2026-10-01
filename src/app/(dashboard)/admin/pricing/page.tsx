"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { BadgePercent, Calculator, Save, CheckCircle, RefreshCw } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function AdminPricingPage() {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  // Live Simulator state
  const [simFromZone, setSimFromZone] = useState("INSIDE_DHAKA");
  const [simToZone, setSimToZone] = useState("OUTSIDE_DHAKA");
  const [simWeight, setSimWeight] = useState("2.5");
  const [simCod, setSimCod] = useState("3500");
  const [simResult, setSimResult] = useState<any>(null);

  const loadRules = async () => {
    try {
      const res = await fetch("/api/admin/pricing");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setRules(data.data);
      }
    } catch (err) {
      console.error("Error loading pricing rules", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  const handleUpdateRule = async (rule: any) => {
    setSavingId(rule.id);
    try {
      const res = await fetch("/api/admin/pricing", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: rule.id,
          baseCharge: rule.baseCharge,
          additionalWeightCharge: rule.additionalWeightCharge,
          codPercentage: rule.codPercentage,
          active: rule.active,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Pricing rule updated successfully!");
        await loadRules();
      } else {
        alert(data.error?.message || "Failed to update pricing rule");
      }
    } catch (err) {
      alert("Error saving rule");
    } finally {
      setSavingId(null);
    }
  };

  const handleSimulate = async () => {
    try {
      const res = await fetch("/api/pricing/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromZone: simFromZone,
          toZone: simToZone,
          weightKg: Number(simWeight),
          codAmount: Number(simCod),
          serviceType: "REGULAR",
          paymentMethod: "COD",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSimResult(data.data);
      }
    } catch (err) {
      console.error("Simulation error", err);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center">
            <BadgePercent className="w-6 h-6 text-blue-600 mr-2.5" /> Dynamic Pricing Engine Rules
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure base delivery fees, per-kg weight increments, and COD commission percentages.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Rules Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Active Zone Matrix Rules</h2>
            <button
              onClick={loadRules}
              className="text-xs font-semibold text-slate-500 hover:text-blue-600 flex items-center"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mx-auto"></div>
            </div>
          ) : rules.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">No pricing rules found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-6">Route Matrix</th>
                    <th className="py-3 px-6">Base (1kg)</th>
                    <th className="py-3 px-6">Extra / Kg</th>
                    <th className="py-3 px-6">COD %</th>
                    <th className="py-3 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rules.map((r, idx) => (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-4 px-6">
                        <span className="font-bold text-slate-800 text-xs block">
                          {r.fromZone.replace(/_/g, " ")} →
                        </span>
                        <span className="text-blue-600 font-bold text-xs">
                          {r.toZone.replace(/_/g, " ")}
                        </span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">{r.serviceType}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <span className="text-xs font-bold text-slate-400 mr-1">৳</span>
                          <input
                            type="number"
                            value={r.baseCharge}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setRules((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, baseCharge: val } : item))
                              );
                            }}
                            className="w-20 px-2 py-1 border border-slate-200 rounded-lg text-xs font-mono font-bold focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <span className="text-xs font-bold text-slate-400 mr-1">৳</span>
                          <input
                            type="number"
                            value={r.additionalWeightCharge}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setRules((prev) =>
                                prev.map((item, i) =>
                                  i === idx ? { ...item, additionalWeightCharge: val } : item
                                )
                              );
                            }}
                            className="w-20 px-2 py-1 border border-slate-200 rounded-lg text-xs font-mono font-bold focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <input
                            type="number"
                            step="0.5"
                            value={r.codPercentage}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setRules((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, codPercentage: val } : item))
                              );
                            }}
                            className="w-16 px-2 py-1 border border-slate-200 rounded-lg text-xs font-mono font-bold focus:ring-1 focus:ring-blue-500"
                          />
                          <span className="text-xs font-bold text-slate-400 ml-1">%</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleUpdateRule(r)}
                          disabled={savingId === r.id}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition disabled:opacity-50"
                        >
                          {savingId === r.id ? "Saving..." : "Save"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Live Simulator Panel */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-base mb-2">
              <Calculator className="w-5 h-5 text-blue-600" />
              <h3>Pricing Simulator</h3>
            </div>
            <p className="text-xs text-slate-500 mb-5">
              Simulate actual server-side pricing engine output before applying live rate updates.
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Origin Zone</label>
                <select
                  value={simFromZone}
                  onChange={(e) => setSimFromZone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500"
                >
                  <option value="INSIDE_DHAKA">Inside Dhaka</option>
                  <option value="DHAKA_SUBURB">Dhaka Suburbs</option>
                  <option value="OUTSIDE_DHAKA">Outside Dhaka</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Destination Zone</label>
                <select
                  value={simToZone}
                  onChange={(e) => setSimToZone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500"
                >
                  <option value="INSIDE_DHAKA">Inside Dhaka</option>
                  <option value="DHAKA_SUBURB">Dhaka Suburbs</option>
                  <option value="OUTSIDE_DHAKA">Outside Dhaka</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Parcel Weight (KG)</label>
                <input
                  type="number"
                  step="0.5"
                  value={simWeight}
                  onChange={(e) => setSimWeight(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-medium focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">COD Collection Amount (৳)</label>
                <input
                  type="number"
                  value={simCod}
                  onChange={(e) => setSimCod(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-medium focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={handleSimulate}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition text-xs shadow-sm mt-2"
              >
                Run Server Calculation
              </button>
            </div>
          </div>

          {/* Simulation Output Card */}
          {simResult && (
            <div className="mt-6 bg-slate-50 border border-slate-200 rounded-xl p-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Engine Calculation Breakdown
              </span>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Base Charge (1kg):</span>
                  <span className="font-mono font-semibold">{formatCurrency(simResult.baseCharge)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Extra Weight Fee:</span>
                  <span className="font-mono font-semibold">{formatCurrency(simResult.weightCharge)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>COD Collection Fee:</span>
                  <span className="font-mono font-semibold">{formatCurrency(simResult.codFee)}</span>
                </div>
                <div className="border-t border-slate-200 pt-1.5 mt-1.5 flex justify-between font-bold text-slate-900 text-sm">
                  <span>Total Delivery Fee:</span>
                  <span className="font-mono text-blue-600">{formatCurrency(simResult.totalCharge)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
