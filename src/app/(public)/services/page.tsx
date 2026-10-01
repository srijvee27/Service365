import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Truck, Zap, Rocket, Warehouse, RefreshCw, Layers, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ServicesPage() {
  const services = [
    {
      icon: Truck,
      title: "Regular Doorstep Delivery",
      subtitle: "24-72 Hours Nationwide",
      badge: "Most Popular",
      desc: "Comprehensive doorstep delivery across all 64 districts. Ideal for regular e-commerce products, apparel, electronics, and home goods with end-to-end status milestones.",
      features: ["Doorstep pickup from merchant", "Real-time OTP delivery verification", "Up to 3 contact attempts", "Full COD collection support"],
      rate: "Starting at ৳60 inside Dhaka / ৳130 Nationwide",
    },
    {
      icon: Zap,
      title: "Express Next-Day Delivery",
      subtitle: "Guaranteed Next-Day Delivery",
      badge: "Priority Transit",
      desc: "Accelerated routing prioritizing urgent orders. Parcels picked up before 4:00 PM are delivered anywhere in metropolitan Dhaka and divisional headquarters by the following afternoon.",
      features: ["Priority sorting hub dispatch", "Direct point-to-point transport", "Dedicated customer care hotline", "SMS alerts for buyer"],
      rate: "+৳40 Express Surcharge",
    },
    {
      icon: Rocket,
      title: "Same Day Dhaka Express",
      subtitle: "Delivered Within 6-8 Hours",
      badge: "Hyperfast",
      desc: "Instant fulfillment for intra-Dhaka parcels. Book before 11:00 AM and our dedicated city fleet ensures delivery to the recipient on the exact same day.",
      features: ["Within Dhaka City only", "Direct dedicated bike couriers", "Live rider GPS trackability", "Instant COD collection"],
      rate: "৳120 Flat (Up to 1kg)",
    },
    {
      icon: RefreshCw,
      title: "Reverse Logistics & Returns",
      subtitle: "Transparent Return-to-Merchant",
      badge: "Automated",
      desc: "Effortless handling of undelivered parcels and customer returns. Full photographic reason tracking, condition verification, and return fee settlement.",
      features: ["Automated merchant return dashboard", "Photographic proof of non-delivery", "Batch return to warehouse", "Reduced return handling fees"],
      rate: "Transparent 50% delivery fee for returns",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <section className="bg-gradient-to-r from-blue-900 to-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-300 bg-blue-500/20 px-3 py-1 rounded-full border border-blue-400/20">
            Logistics Solutions
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Logistics Built for Modern Commerce
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-base sm:text-lg">
            Whether you need same-day delivery inside Dhaka or nationwide coverage to all 64 districts,
            Service365 delivers with precision.
          </p>
        </div>
      </section>

      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
                      {s.badge}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-slate-900">{s.title}</h3>
                  <p className="text-xs font-semibold text-blue-600 mb-3">{s.subtitle}</p>
                  <p className="text-sm text-slate-600 leading-relaxed mb-6">{s.desc}</p>

                  <div className="space-y-2 mb-6">
                    {s.features.map((f, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{s.rate}</span>
                  <Link
                    href="/merchant/parcels/create"
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
                  >
                    <span>Ship With This Service</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <Footer />
    </div>
  );
}
