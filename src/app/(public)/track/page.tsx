"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Search, Package, ArrowRight, ShieldCheck, Clock, MapPin } from "lucide-react";

export default function TrackPage() {
  const router = useRouter();
  const [trackingId, setTrackingId] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingId.trim()) {
      router.push(`/track/${encodeURIComponent(trackingId.trim().toUpperCase())}`);
    }
  };

  const sampleTrackingIds = [
    { id: "S365BD9K4M8X2", label: "Delivered Parcel (Chattogram)", status: "DELIVERED" },
    { id: "S365BD7L3P9Q1", label: "Out for Delivery (Gulshan)", status: "OUT_FOR_DELIVERY" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <section className="bg-gradient-to-r from-blue-900 to-slate-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center mx-auto text-blue-400">
            <Package className="w-7 h-7" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Live Parcel Tracking
          </h1>
          <p className="text-slate-300 max-w-xl mx-auto text-sm sm:text-base">
            Track real-time progress, rider dispatch, and delivery confirmation across all 64 districts.
          </p>

          {/* Search Box */}
          <div className="pt-6 max-w-2xl mx-auto">
            <form
              onSubmit={handleSearch}
              className="bg-white rounded-2xl p-2 shadow-2xl flex flex-col sm:flex-row items-center gap-2 border border-slate-200"
            >
              <div className="flex items-center gap-3 w-full px-3 py-2 text-slate-800">
                <Search className="w-5 h-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="Enter Tracking ID (e.g. S365BD9K4M8X2)..."
                  className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-base font-semibold focus:outline-none"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-7 py-3.5 rounded-xl shadow-md transition transform active:scale-95 shrink-0 flex items-center justify-center gap-2"
              >
                <span>Track Parcel</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Sample quick tracking IDs */}
          <div className="pt-6">
            <span className="text-xs text-slate-400 block mb-2">Test with demo consignments:</span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {sampleTrackingIds.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => router.push(`/track/${item.id}`)}
                  className="text-xs bg-slate-800/80 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-lg text-slate-300 font-mono transition flex items-center gap-2"
                >
                  <span className="text-blue-400 font-bold">{item.id}</span>
                  <span className="text-[10px] text-slate-400">({item.label})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Info Pillars */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Real-time Timestamping</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every status scan from hub dispatch to sorting center is recorded with immutable audit timestamps.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">OTP Secured Delivery</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Deliveries are authenticated via customer SMS OTP or digital signatures, ensuring zero misplaced packages.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Rider Contact Direct</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Once marked Out for Delivery, view assigned rider credentials and call directly for delivery coordination.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
