"use client";

import React, { useState } from "react";
import { MerchantLayout } from "@/components/layout/MerchantLayout";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Wallet, ArrowDownRight, ArrowUpRight, CheckCircle2, Clock, AlertCircle } from "lucide-react";

export default function MerchantWalletPage() {
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState(5000);
  const [payoutSuccess, setPayoutSuccess] = useState(false);

  const transactions = [
    {
      id: "TX-9901",
      type: "PAYOUT_DEBIT",
      amount: 15000,
      destination: "City Bank (Ac: ****5001)",
      status: "COMPLETED",
      date: new Date(Date.now() - 3600000 * 48).toISOString(),
    },
    {
      id: "TX-9902",
      type: "COD_CREDIT",
      amount: 4300,
      destination: "Order #S365-2026-000101",
      status: "COMPLETED",
      date: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
  ];

  const handleRequestPayout = (e: React.FormEvent) => {
    e.preventDefault();
    setPayoutSuccess(true);
    setTimeout(() => {
      setPayoutSuccess(false);
      setPayoutModalOpen(false);
    }, 1500);
  };

  return (
    <MerchantLayout>
      <div className="space-y-8 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Merchant Wallet</h1>
            <p className="text-xs text-slate-500 mt-0.5">Manage available funds and schedule bank/bKash disbursements</p>
          </div>

          <button
            type="button"
            onClick={() => setPayoutModalOpen(true)}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm transition"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Request Payout</span>
          </button>
        </div>

        {/* 3 Wallet Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-700 text-white p-6 rounded-3xl shadow-lg shadow-emerald-600/20 space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-100">Available Balance</span>
            <div className="text-3xl font-black">{formatCurrency(8450)}</div>
            <p className="text-xs text-emerald-100/90 pt-2">Eligible for same-day withdrawal</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Balance</span>
            <div className="text-3xl font-extrabold text-amber-600">{formatCurrency(2400)}</div>
            <p className="text-xs text-slate-400 pt-2">Parcels currently in transit</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Disbursed</span>
            <div className="text-3xl font-extrabold text-slate-800">{formatCurrency(15000)}</div>
            <p className="text-xs text-slate-400 pt-2">Settled to your Bank/bKash</p>
          </div>
        </div>

        {/* Payout History */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Wallet Activity & Payout History</h3>
            <span className="text-xs font-semibold text-slate-400">All Transactions</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {transactions.map((tx) => (
              <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-50/70 transition">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      tx.type === "COD_CREDIT"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    {tx.type === "COD_CREDIT" ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">
                      {tx.type === "COD_CREDIT" ? "COD Order Credit" : "Bank Payout Settlement"}
                    </h4>
                    <span className="text-slate-400 text-[11px] block">{tx.destination}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`font-mono font-bold text-sm block ${
                      tx.type === "COD_CREDIT" ? "text-emerald-600" : "text-slate-900"
                    }`}
                  >
                    {tx.type === "COD_CREDIT" ? `+${formatCurrency(tx.amount)}` : `-${formatCurrency(tx.amount)}`}
                  </span>
                  <span className="text-[10px] text-slate-400">{formatDateTime(tx.date)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payout Request Modal */}
        {payoutModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Withdraw Funds to Account</h3>
                <button
                  onClick={() => setPayoutModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              {payoutSuccess ? (
                <div className="text-center py-6 space-y-2">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                  <h4 className="font-bold text-slate-900">Payout Request Submitted!</h4>
                  <p className="text-xs text-slate-500">
                    Your request of {formatCurrency(payoutAmount)} has been queued for bank disbursement.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleRequestPayout} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Withdrawal Amount (Available: {formatCurrency(8450)})
                    </label>
                    <input
                      type="number"
                      min="500"
                      max="8450"
                      value={payoutAmount}
                      onChange={(e) => setPayoutAmount(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-base font-bold text-slate-900"
                    />
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                    <span className="text-slate-500 font-semibold block">Disbursement Destination:</span>
                    <p className="font-bold text-slate-800">bKash Merchant Wallet: 01711223344</p>
                    <span className="text-[10px] text-slate-400">Default registered payment method</span>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setPayoutModalOpen(false)}
                      className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-lg shadow-sm"
                    >
                      Confirm Payout
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </MerchantLayout>
  );
}
