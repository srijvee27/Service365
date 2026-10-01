"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { ShieldCheck, AlertCircle, CheckCircle2, ArrowRight, XCircle } from "lucide-react";

function MockGatewayInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const paymentId = searchParams.get("paymentId") || "MOCK_PAYMENT_123";
  const orderNumber = searchParams.get("orderNumber") || "S365-2026-000000";
  const amount = parseFloat(searchParams.get("amount") || "0");
  const phone = searchParams.get("phone") || "017XXXXXXXX";

  const [processing, setProcessing] = useState(false);

  const handleAction = async (action: "success" | "fail" | "cancel") => {
    setProcessing(true);
    if (action === "success") {
      try {
        const res = await fetch("/api/payments/bkash/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId }),
        });
        const data = await res.json();
        if (data.success) {
          router.push(`/payment/success?paymentId=${paymentId}&orderNumber=${orderNumber}&trxId=${data.transactionId || "TRX_MOCK"}`);
        } else {
          router.push(`/payment/failure?paymentId=${paymentId}&error=${encodeURIComponent(data.error?.message || "Execution failed")}`);
        }
      } catch {
        router.push(`/payment/failure?paymentId=${paymentId}&error=NetworkError`);
      }
    } else if (action === "fail") {
      router.push(`/payment/failure?paymentId=${paymentId}&orderNumber=${orderNumber}&error=Insufficient+Balance+(Mock+Simulation)`);
    } else {
      router.push(`/payment/cancel?paymentId=${paymentId}&orderNumber=${orderNumber}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center px-4 py-12">
      {/* Prominent Sandbox Warning Banner */}
      <div className="max-w-md w-full mb-6 bg-amber-500 text-slate-950 px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <span>DEVELOPMENT SANDBOX ACTIVE: This is a test simulator. No real money will be deducted.</span>
      </div>

      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-700">
        {/* Mock bKash Header */}
        <div className="bg-[#E2136E] text-white p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/20 backdrop-blur mb-2 font-black text-xl">
            bK
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">bKash Payment Gateway</h2>
          <p className="text-xs text-pink-100 mt-0.5">Sandbox Test Interface</p>
        </div>

        {/* Invoice Breakdown */}
        <div className="p-6 space-y-5">
          <div className="bg-pink-50/60 rounded-2xl p-4 border border-pink-100 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase text-slate-500">Invoice Amount</span>
              <p className="text-2xl font-black text-[#E2136E]">{formatCurrency(amount)}</p>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-bold uppercase text-slate-500">Order Ref</span>
              <p className="text-xs font-mono font-bold text-slate-800">{orderNumber}</p>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Merchant Name:</span>
              <strong className="text-slate-800">Service365 Delivery Ltd.</strong>
            </div>
            <div className="flex justify-between">
              <span>Payer Account:</span>
              <strong className="text-slate-800 font-mono">{phone}</strong>
            </div>
            <div className="flex justify-between">
              <span>Session ID:</span>
              <span className="font-mono text-slate-500">{paymentId}</span>
            </div>
          </div>

          {/* Test Action Buttons */}
          <div className="space-y-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              disabled={processing}
              onClick={() => handleAction("success")}
              className="w-full bg-[#E2136E] hover:bg-[#c90f61] text-white font-bold text-sm py-3 px-4 rounded-xl shadow-md transition transform active:scale-95 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{processing ? "Processing Simulation..." : `Authorize Payment of ${formatCurrency(amount)}`}</span>
            </button>

            <button
              type="button"
              disabled={processing}
              onClick={() => handleAction("fail")}
              className="w-full bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-xs py-2.5 px-4 rounded-xl border border-red-200 transition flex items-center justify-center gap-1.5"
            >
              <XCircle className="w-4 h-4" />
              <span>Simulate Payment Failure (Insufficient Balance)</span>
            </button>

            <button
              type="button"
              disabled={processing}
              onClick={() => handleAction("cancel")}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs py-2.5 px-4 rounded-xl transition text-center"
            >
              Cancel Transaction
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MockGatewayPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-sm">Loading sandbox simulator...</div>}>
      <MockGatewayInner />
    </Suspense>
  );
}
