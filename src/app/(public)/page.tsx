"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DeliveryCalculator } from "@/components/landing/DeliveryCalculator";
import {
  ArrowRight,
  Search,
  Truck,
  ShieldCheck,
  CreditCard,
  Clock,
  MapPin,
  TrendingUp,
  CheckCircle2,
  ChevronDown,
  Layers,
  Smartphone,
  Award,
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [quickTrackingId, setQuickTrackingId] = useState("");
  const [faqOpen, setFaqOpen] = useState<number | null>(0);

  const handleQuickTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickTrackingId.trim()) {
      router.push(`/track/${quickTrackingId.trim()}`);
    }
  };

  const faqs = [
    {
      q: "Which areas do you deliver to in Bangladesh?",
      a: "Service365 covers all 64 districts of Bangladesh down to every thana and upazila level. Inside Dhaka and major hubs, we offer same-day and next-day express delivery.",
    },
    {
      q: "How does Cash on Delivery (COD) payment work?",
      a: "Our delivery agents collect the cash upon doorstep delivery to your customer. The funds are instantly verified and reflected in your merchant wallet, and automatically disbursed to your designated bank account or bKash wallet.",
    },
    {
      q: "Can I pay online with bKash instead of COD?",
      a: "Yes! Customers or merchants can choose bKash checkout when booking the parcel to prepay the delivery fees or full item value.",
    },
    {
      q: "What happens if a delivery attempt fails?",
      a: "Our riders make up to 3 contact and delivery attempts with real-time OTP confirmation. If the parcel cannot be delivered, it is routed through our transparent Return-to-Merchant (RTM) reverse logistics pipeline.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-slate-900 to-slate-900 text-white pt-16 pb-24 lg:pt-24 lg:pb-32">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(#3b82f6 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Next-Generation Logistics for Bangladesh</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                Bangladesh Delivered <span className="text-blue-400 underline decoration-blue-500/50">Better.</span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-300 max-w-2xl leading-relaxed">
                Fast, reliable, and transparent parcel delivery for growing businesses.
                Doorstep delivery across all 64 districts with automated COD payouts and real-time live tracking.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-2 justify-center lg:justify-start">
                <Link
                  href="/merchant/parcels/create"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-7 py-3.5 rounded-xl shadow-lg shadow-blue-600/30 transition transform active:scale-95"
                >
                  <span>Send a Parcel</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/track"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-800/80 hover:bg-slate-700/80 text-white font-semibold px-7 py-3.5 rounded-xl border border-slate-700 transition"
                >
                  <Search className="w-5 h-5 text-slate-400" />
                  <span>Track Parcel</span>
                </Link>
              </div>

              {/* Quick Tracker Input */}
              <div className="pt-4 max-w-lg mx-auto lg:mx-0">
                <form
                  onSubmit={handleQuickTrack}
                  className="relative flex items-center bg-slate-800/90 border border-slate-700 rounded-xl p-1.5 focus-within:ring-2 focus-within:ring-blue-500 transition"
                >
                  <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
                  <input
                    type="text"
                    value={quickTrackingId}
                    onChange={(e) => setQuickTrackingId(e.target.value)}
                    placeholder="Enter Tracking ID (e.g. S365BD9K4M8X2)..."
                    className="w-full bg-transparent text-sm text-white placeholder-slate-400 px-3 py-2 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition shrink-0"
                  >
                    Track Live
                  </button>
                </form>
              </div>

              {/* Trust Metric Badges */}
              <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>64 Districts Nationwide</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Next-Day COD Settlement</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Verified Rider Verification</span>
                </div>
              </div>
            </div>

            {/* Hero Right Visual / Live Metrics Mockup */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl bg-slate-800/80 border border-slate-700 p-6 shadow-2xl backdrop-blur-xl">
                {/* Visual Header */}
                <div className="flex items-center justify-between border-b border-slate-700 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  </div>
                  <span className="text-xs font-mono text-slate-400">Dispatch Hub Live Monitor</span>
                </div>

                {/* Status Progress Item */}
                <div className="space-y-4">
                  <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-700/80">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-mono text-blue-400 font-bold">S365BD9K4M8X2</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        OUT FOR DELIVERY
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-medium">Agrabad C/A, Chattogram</p>
                    <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-emerald-500 h-1.5 rounded-full w-4/5" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-700/60">
                      <span className="text-xl font-bold text-white">99.4%</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">Success Rate</p>
                    </div>
                    <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-700/60">
                      <span className="text-xl font-bold text-emerald-400">24 Hours</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">COD Payout Cycle</p>
                    </div>
                  </div>

                  {/* Rider Contact Card */}
                  <div className="bg-blue-950/40 rounded-xl p-3.5 border border-blue-800/40 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
                        RU
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-white">Rider: Rahim Uddin</h5>
                        <p className="text-[10px] text-slate-400">Zone: Chattogram Central</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                      OTP Ready
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Delivery Calculator Section */}
      <section className="relative -mt-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 z-20">
        <DeliveryCalculator />
      </section>

      {/* Why Service365 / Key Advantages */}
      <section className="py-20 lg:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            The Service365 Advantage
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Built for Bangladeshi Commerce
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Everything your business needs to ship parcels reliably, collect cash securely, and delight buyers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 mb-2">64 Districts Reach</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              No dropped regions. Full delivery coverage across every division, district, and upazila in Bangladesh.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 mb-2">Guaranteed COD</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Transparent COD ledger with prompt settlements directly into your merchant bank account or bKash wallet.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 mb-2">365-Day Operations</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Continuous dispatch, tracking, and customer support all year round. No extended holiday backlogs.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 mb-2">Merchant Analytics</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Comprehensive dashboard with order success rates, return analytics, financial reports, and CSV exports.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-slate-100/70 py-20 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">How Service365 Works</h2>
            <p className="text-slate-600 text-sm">
              Simple 4-step delivery pipeline engineered for frictionless e-commerce fulfillment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Book Parcel",
                desc: "Enter pickup & destination details through the merchant dashboard or direct order booking wizard.",
              },
              {
                step: "02",
                title: "Doorstep Pickup",
                desc: "Our verified rider arrives at your store or warehouse with digital barcode scanning.",
              },
              {
                step: "03",
                title: "Sorting & Transit",
                desc: "Parcels are sorted in automated regional hubs and dispatched along optimized nationwide routes.",
              },
              {
                step: "04",
                title: "Doorstep Delivery & COD",
                desc: "Rider verifies delivery via OTP, collects COD cash, and your wallet is instantly credited.",
              },
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-xl p-6 border border-slate-200 relative">
                <span className="text-3xl font-extrabold text-blue-200">{item.step}</span>
                <h3 className="font-bold text-base text-slate-900 mt-2 mb-1.5">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Frequently Asked Questions</h2>
          <p className="text-slate-600 text-sm">Everything you need to know about Service365 courier services.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                className="w-full text-left px-6 py-4 font-semibold text-sm sm:text-base text-slate-800 flex items-center justify-between gap-4 hover:bg-slate-50 transition"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                    faqOpen === idx ? "rotate-180" : ""
                  }`}
                />
              </button>
              {faqOpen === idx && (
                <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 border-t border-slate-100 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Scale Your Parcel Logistics?
          </h2>
          <p className="text-blue-100 max-w-xl mx-auto text-sm sm:text-base">
            Join thousands of e-commerce brands, shops, and businesses shipping across Bangladesh with Service365.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/merchant/register"
              className="bg-white text-blue-600 hover:bg-blue-50 font-bold px-8 py-3.5 rounded-xl shadow-lg transition transform active:scale-95"
            >
              Register as Merchant
            </Link>
            <Link
              href="/pricing"
              className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-8 py-3.5 rounded-xl border border-blue-500 transition"
            >
              View Pricing Table
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
