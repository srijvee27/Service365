import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <section className="bg-gradient-to-r from-blue-900 to-slate-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Terms of Service</h1>
          <p className="text-slate-300 text-xs sm:text-sm">Effective Date: January 1, 2026 • Service365 Logistics Ltd.</p>
        </div>
      </section>

      <section className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-6 text-slate-700 text-sm leading-relaxed">
          <h2 className="text-lg font-bold text-slate-900">1. Acceptance of Terms</h2>
          <p>
            By registering for an account, booking a parcel, or using any API/portal service provided by Service365,
            you agree to be legally bound by these Terms of Service.
          </p>

          <h2 className="text-lg font-bold text-slate-900">2. Merchant Obligations</h2>
          <p>
            Merchants must declare accurate parcel weights and true descriptions of consignment contents. Any deliberate
            underdeclaration of weight may result in tariff adjustments upon hub weighing.
          </p>

          <h2 className="text-lg font-bold text-slate-900">3. Cash on Delivery (COD) Collection & Payouts</h2>
          <p>
            Service365 acts as an authorized collection agent for Cash on Delivery consignments. Collected funds are held
            in trust and disbursed according to the merchant’s selected settlement schedule, less verified delivery and COD service charges.
          </p>

          <h2 className="text-lg font-bold text-slate-900">4. Limitation of Liability</h2>
          <p>
            Standard consignment liability is limited to the declared value of the parcel up to a maximum threshold of
            ৳5,000 BDT unless additional transit coverage insurance was booked prior to dispatch.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
