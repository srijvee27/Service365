"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CheckCircle2, ArrowRight, Printer, Search } from "lucide-react";

function PaymentSuccessInner() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("paymentId") || "";
  const orderNumber = searchParams.get("orderNumber") || "";
  const trxId = searchParams.get("trxId") || "";

  return (
    <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="space-y-1">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
          Payment Confirmed
        </span>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight pt-2">
          Your Parcel is Booked!
        </h1>
        <p className="text-xs text-slate-500">
          We have received your payment and notified our dispatch fleet.
        </p>
      </div>

      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-xs space-y-2 text-left">
        <div className="flex justify-between">
          <span className="text-slate-500">Order Number:</span>
          <strong className="font-mono text-slate-800">{orderNumber || "S365-CONFIRMED"}</strong>
        </div>
        {trxId && (
          <div className="flex justify-between">
            <span className="text-slate-500">Transaction ID:</span>
            <strong className="font-mono text-slate-800">{trxId}</strong>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-slate-500">Payment Gateway:</span>
          <strong className="text-slate-800">bKash (Verified)</strong>
        </div>
      </div>

      <div className="space-y-2.5">
        <Link
          href={`/track`}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-sm transition flex items-center justify-center gap-2"
        >
          <Search className="w-4 h-4" />
          <span>Track Delivery Status</span>
        </Link>
        <Link
          href="/merchant/dashboard"
          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-2.5 px-4 rounded-xl transition inline-block"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <Suspense fallback={<div className="text-sm text-slate-500">Loading receipt...</div>}>
          <PaymentSuccessInner />
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}
