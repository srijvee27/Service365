"use client";

import React, { useState } from "react";
import { MerchantLayout } from "@/components/layout/MerchantLayout";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { DollarSign, Clock, CheckCircle2, AlertCircle, ArrowUpRight } from "lucide-react";

export default function MerchantCodPage() {
  const [activeTab, setActiveTab] = useState("all");

  const codLedger = [
    {
      id: "COD-001",
      orderNumber: "S365-2026-000101",
      customer: "Shakib Al Hasan",
      amount: 4500,
      fee: 45,
      deliveryCharge: 155,
      netDisbursement: 4300,
      status: "COLLECTED",
      collectedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: "COD-002",
      orderNumber: "S365-2026-000102",
      customer: "Sadia Afrin",
      amount: 2800,
      fee: 28,
      deliveryCharge: 100,
      netDisbursement: 2672,
      status: "PENDING",
      collectedAt: null,
    },
  ];

  return (
    <MerchantLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Cash on Delivery (COD) Ledger</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent collection breakdown, 1% fee audit, and net payable amounts
          </p>
        </div>

        {/* 4 Cards Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase">Total COD Volume</span>
            <div className="text-2xl font-extrabold text-slate-900">{formatCurrency(7300)}</div>
            <p className="text-[11px] text-slate-500">Gross parcel value</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase">Collected Cash</span>
            <div className="text-2xl font-extrabold text-emerald-600">{formatCurrency(4500)}</div>
            <p className="text-[11px] text-emerald-600">In Service365 vault</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase">Pending Collection</span>
            <div className="text-2xl font-extrabold text-amber-600">{formatCurrency(2800)}</div>
            <p className="text-[11px] text-slate-500">Out for delivery</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase">Total COD Fees (1%)</span>
            <div className="text-2xl font-extrabold text-slate-700">{formatCurrency(73)}</div>
            <p className="text-[11px] text-slate-500">Collection fee billed</p>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">COD Itemized Transactions</h3>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
              100% Reconciled
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-5">Order Reference</th>
                  <th className="py-3 px-5">Customer</th>
                  <th className="py-3 px-5">Gross COD</th>
                  <th className="py-3 px-5">COD Fee (1%)</th>
                  <th className="py-3 px-5">Delivery Charge</th>
                  <th className="py-3 px-5">Net Payable</th>
                  <th className="py-3 px-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {codLedger.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-5 font-mono font-bold text-blue-600">{row.orderNumber}</td>
                    <td className="py-3 px-5 font-medium text-slate-900">{row.customer}</td>
                    <td className="py-3 px-5 font-bold text-slate-900">{formatCurrency(row.amount)}</td>
                    <td className="py-3 px-5 text-slate-500">-{formatCurrency(row.fee)}</td>
                    <td className="py-3 px-5 text-slate-500">-{formatCurrency(row.deliveryCharge)}</td>
                    <td className="py-3 px-5 font-bold text-emerald-600">{formatCurrency(row.netDisbursement)}</td>
                    <td className="py-3 px-5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          row.status === "COLLECTED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MerchantLayout>
  );
}
