import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <section className="bg-gradient-to-r from-blue-900 to-slate-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
          <p className="text-slate-300 text-xs sm:text-sm">How Service365 protects customer and merchant information.</p>
        </div>
      </section>

      <section className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-6 text-slate-700 text-sm leading-relaxed">
          <h2 className="text-lg font-bold text-slate-900">1. Information We Collect</h2>
          <p>
            We collect personal identification information including merchant store names, contact telephone numbers,
            recipient delivery addresses, and financial disbursement credentials (such as bank routing numbers or bKash wallet numbers).
          </p>

          <h2 className="text-lg font-bold text-slate-900">2. Use of Information</h2>
          <p>
            Collected contact data is used strictly for fulfilling parcel pickups, dispatch routing, delivery OTP verification,
            and sending transactional SMS/email delivery status updates. We do not sell or rent user information to third parties.
          </p>

          <h2 className="text-lg font-bold text-slate-900">3. Security & Payment Data</h2>
          <p>
            All online bKash transactions are processed directly through secure tokenized gateway endpoints. We never store
            user bKash PINs, banking passwords, or raw debit credentials on our servers.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
