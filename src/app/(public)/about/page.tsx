import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Truck, ShieldCheck, MapPin, Award, Users, HeartHandshake } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      {/* Header */}
      <section className="bg-gradient-to-r from-blue-900 to-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-300 bg-blue-500/20 px-3 py-1 rounded-full border border-blue-400/20">
            About Service365
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Delivering Business. <span className="text-blue-400">Every Day.</span>
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-base sm:text-lg">
            Service365 is Bangladesh’s dedicated courier and logistics network built to bridge merchant ambition
            with flawless nationwide fulfillment.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Reinventing Delivery for Bangladesh's Digital Economy
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm">
              Founded to empower digital sellers, enterprise retail, and growing small businesses, Service365 eliminates
              traditional courier bottlenecks: unpredictable transit, delayed COD payouts, and obscure package tracking.
            </p>
            <p className="text-slate-600 leading-relaxed text-sm">
              By combining high-performance routing software, verified delivery riders, and an open-door financial
              settlement engine, we make every consignment traceable from pickup to buyer doorstep.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Uncompromised Speed</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Guaranteed same-day and next-day deliveries inside metropolitan hubs, with transparent 48-72h nationwide coverage.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Financially Transparent COD</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Prompt 24-48 hour COD disbursements directly to bank accounts and bKash merchant wallets with zero hidden deductions.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Empowering Verified Riders</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Fair pay, comprehensive safety training, and digital delivery-proof systems that reward excellence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-blue-600 text-white py-14">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-extrabold">64</div>
            <div className="text-xs text-blue-100 mt-1 uppercase tracking-wide">Districts Covered</div>
          </div>
          <div>
            <div className="text-4xl font-extrabold">99.4%</div>
            <div className="text-xs text-blue-100 mt-1 uppercase tracking-wide">On-Time Completion</div>
          </div>
          <div>
            <div className="text-4xl font-extrabold">24h</div>
            <div className="text-xs text-blue-100 mt-1 uppercase tracking-wide">COD Settlement</div>
          </div>
          <div>
            <div className="text-4xl font-extrabold">365</div>
            <div className="text-xs text-blue-100 mt-1 uppercase tracking-wide">Days Operations</div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
