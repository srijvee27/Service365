"use client";

import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DeliveryCalculator } from "@/components/landing/DeliveryCalculator";
import { Check, Info, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
  const pricingMatrix = [
    {
      route: "Inside Dhaka ➔ Inside Dhaka",
      base: "৳60",
      extraKg: "৳15/kg",
      time: "24 Hours",
      codFee: "1%",
    },
    {
      route: "Inside Dhaka ➔ Dhaka Suburb (Gazipur/Savar/Narayanganj)",
      base: "৳100",
      extraKg: "৳20/kg",
      time: "24-36 Hours",
      codFee: "1%",
    },
    {
      route: "Dhaka Suburb ➔ Inside Dhaka",
      base: "৳100",
      extraKg: "৳20/kg",
      time: "24-36 Hours",
      codFee: "1%",
    },
    {
      route: "Dhaka Suburb ➔ Dhaka Suburb",
      base: "৳110",
      extraKg: "৳20/kg",
      time: "36 Hours",
      codFee: "1%",
    },
    {
      route: "Inside Dhaka ➔ Outside Dhaka (Divisional Hubs)",
      base: "৳130",
      extraKg: "৳25/kg",
      time: "48 Hours",
      codFee: "1%",
    },
    {
      route: "Outside Dhaka ➔ Inside Dhaka",
      base: "৳130",
      extraKg: "৳25/kg",
      time: "48 Hours",
      codFee: "1%",
    },
    {
      route: "Outside Dhaka ➔ Outside Dhaka (Inter-District)",
      base: "৳150",
      extraKg: "৳25/kg",
      time: "48-72 Hours",
      codFee: "1%",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <section className="bg-gradient-to-r from-blue-900 to-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-300 bg-blue-500/20 px-3 py-1 rounded-full border border-blue-400/20">
            Simple & Transparent
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Delivery Rates That Empower Growth
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-base sm:text-lg">
            No surprise fuel surcharges or hidden deductions. Pay transparent delivery rates with automated COD settlement.
          </p>
        </div>
      </section>

      {/* Embedded Live Calculator */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <DeliveryCalculator />
      </section>

      {/* Standard Pricing Table */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Standard Delivery Rate Matrix</h2>
          <p className="text-slate-600 text-sm">
            Rates apply to standard packages up to 1.0 kg base weight. Additional kg billed transparently.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500 tracking-wider">
                <tr>
                  <th className="py-4 px-6">Delivery Route Zone</th>
                  <th className="py-4 px-6">Base Rate (1kg)</th>
                  <th className="py-4 px-6">Extra Weight Rate</th>
                  <th className="py-4 px-6">Transit Time</th>
                  <th className="py-4 px-6">COD Fee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pricingMatrix.map((item, i) => (
                  <tr key={i} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-6 font-semibold text-slate-900">{item.route}</td>
                    <td className="py-4 px-6 font-bold text-blue-600 text-base">{item.base}</td>
                    <td className="py-4 px-6 text-slate-600">{item.extraKg}</td>
                    <td className="py-4 px-6 text-slate-600">{item.time}</td>
                    <td className="py-4 px-6 text-emerald-600 font-semibold">{item.codFee}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pricing Notes */}
        <div className="mt-8 bg-blue-50/60 border border-blue-100 rounded-xl p-5 flex items-start gap-3 text-xs text-slate-600">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-slate-800">Delivery Pricing Policies</p>
            <p>
              • All rates are calculated on actual parcel weight (or volumetric weight if length × width × height / 5000 is greater).
            </p>
            <p>• Doorstep pickup is completely free for all verified merchant accounts across Dhaka and regional centers.</p>
            <p>• Return fees for undelivered packages are charged at 50% of the forward delivery fee.</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
