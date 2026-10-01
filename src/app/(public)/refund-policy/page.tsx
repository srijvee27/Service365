import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function RefundPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <section className="bg-gradient-to-r from-blue-900 to-slate-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Refund & COD Policy</h1>
          <p className="text-slate-300 text-xs sm:text-sm">Guidelines on delivery cancellations, returns, and merchant refunds.</p>
        </div>
      </section>

      <section className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-6 text-slate-700 text-sm leading-relaxed">
          <h2 className="text-lg font-bold text-slate-900">1. Prepaid Delivery Fee Refunds</h2>
          <p>
            If a merchant cancels a prepaid order prior to rider pickup, the full delivery charge is instantly refunded to
            the merchant’s balance or reversed to the original bKash payment source within 3-5 business days.
          </p>

          <h2 className="text-lg font-bold text-slate-900">2. Undelivered Consignments & Return Charges</h2>
          <p>
            If a consignment is returned after standard delivery attempts have been exhausted, a return charge equal to 50%
            of the forward delivery charge is levied to cover reverse transit and restocking to the merchant warehouse.
          </p>

          <h2 className="text-lg font-bold text-slate-900">3. Lost or Damaged Parcel Compensation</h2>
          <p>
            In the event of verified physical loss or damage while in Service365 custody, merchants may lodge a claim through
            the merchant support portal. Claims are investigated and compensated within 7 working days.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
