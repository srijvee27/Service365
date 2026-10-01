"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { XCircle, RefreshCw, ArrowLeft } from "lucide-react";

function PaymentFailureInner() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || "Payment was declined by payment gateway";

  return (
    <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
        <XCircle className="w-10 h-10" />
      </div>

      <div className="space-y-1">
        <span className="text-xs font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
          Payment Failed
        </span>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight pt-2">
          Transaction Incomplete
        </h1>
        <p className="text-xs text-slate-500">
          We were unable to complete your bKash payment.
        </p>
      </div>

      <div className="bg-red-50/60 rounded-2xl p-4 border border-red-100 text-xs text-red-700 text-left">
        <strong>Reason:</strong> {decodeURIComponent(error)}
      </div>

      <div className="space-y-2.5">
        <Link
          href="/merchant/parcels/create"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-sm transition flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry Booking with COD or bKash</span>
        </Link>
        <Link
          href="/merchant/dashboard"
          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-2.5 px-4 rounded-xl transition inline-block"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default function PaymentFailurePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <Suspense fallback={<div className="text-sm text-slate-500">Loading...</div>}>
          <PaymentFailureInner />
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}
