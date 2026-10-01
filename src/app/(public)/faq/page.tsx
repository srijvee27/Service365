"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChevronDown, HelpCircle, Search } from "lucide-react";

export default function FAQPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const categories = [
    { id: "all", label: "All Questions" },
    { id: "merchants", label: "Merchant Onboarding" },
    { id: "delivery", label: "Delivery & Routing" },
    { id: "cod", label: "COD & Payments" },
    { id: "returns", label: "Returns & Claims" },
  ];

  const faqs = [
    {
      category: "merchants",
      q: "How do I register as a merchant on Service365?",
      a: "Click on 'Become a Merchant' or visit /merchant/register. Fill out your business name, contact info, pickup address, and disbursement bank/bKash details. Your account is activated instantly with access to full portal features.",
    },
    {
      category: "merchants",
      q: "Is there any registration or monthly subscription fee?",
      a: "No. Service365 has zero registration fees, zero subscription fees, and no monthly minimums. You only pay for the deliveries you book.",
    },
    {
      category: "delivery",
      q: "How fast is delivery outside Dhaka?",
      a: "Parcels to major divisional cities (Chattogram, Sylhet, Rajshahi, Khulna, etc.) are delivered within 48 hours. Remote upazilas are reached within 48 to 72 hours.",
    },
    {
      category: "delivery",
      q: "Can I schedule a doorstep pickup from my residence or warehouse?",
      a: "Yes. All verified merchants receive free scheduled doorstep pickup for 1 or more parcels. Our riders collect parcels every afternoon from your designated pickup store.",
    },
    {
      category: "cod",
      q: "When and how are Cash on Delivery (COD) funds paid out?",
      a: "Once our rider collects the cash and confirms delivery, your merchant wallet balance is immediately updated. Automated settlement batches disburse funds directly to your bank account via BEFTN/NPSB or directly to your bKash merchant wallet within 24-48 hours.",
    },
    {
      category: "cod",
      q: "What is the COD collection charge?",
      a: "Our COD collection fee is a flat 1% of the collected cash amount. There are zero additional hidden percentage deductions.",
    },
    {
      category: "returns",
      q: "What is the Return-to-Merchant (RTM) procedure?",
      a: "If a recipient cannot be reached after 3 verified attempts, our system flags the order as DELIVERY_FAILED and prompts return authorization. Returned parcels are routed back to your pickup address with photographic proof and condition inspection.",
    },
    {
      category: "returns",
      q: "How are return delivery fees calculated?",
      a: "For undelivered returns, we charge only 50% of the forward delivery fee to cover return transit.",
    },
  ];

  const filtered = faqs.filter((item) => {
    const matchCategory = activeTab === "all" || item.category === activeTab;
    const matchSearch =
      item.q.toLowerCase().includes(search.toLowerCase()) ||
      item.a.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <section className="bg-gradient-to-r from-blue-900 to-slate-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-300 bg-blue-500/20 px-3 py-1 rounded-full border border-blue-400/20">
            Frequently Asked Questions
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Help & Answers</h1>
          <p className="text-slate-300 max-w-xl mx-auto text-sm sm:text-base">
            Find immediate clarity on delivery timelines, pricing, merchant settlements, and tracking.
          </p>

          <div className="pt-6 max-w-xl mx-auto">
            <div className="relative flex items-center bg-white rounded-xl shadow-lg p-1 text-slate-800">
              <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search questions or keywords..."
                className="w-full bg-transparent text-sm px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex-1">
        {/* Category Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveTab(c.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                activeTab === c.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Accordion */}
        <div className="space-y-4">
          {filtered.map((item, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <button
                type="button"
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full text-left px-6 py-4 font-semibold text-sm sm:text-base text-slate-800 flex items-center justify-between gap-4 hover:bg-slate-50 transition"
              >
                <span>{item.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                    openIdx === idx ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIdx === idx && (
                <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 border-t border-slate-100 leading-relaxed">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
