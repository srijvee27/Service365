"use client";

import React, { useState } from "react";
import { MerchantLayout } from "@/components/layout/MerchantLayout";
import { HelpCircle, PlusCircle, CheckCircle2, MessageSquare, Clock } from "lucide-react";

export default function MerchantSupportPage() {
  const [ticketModal, setTicketModal] = useState(false);
  const [tickets, setTickets] = useState([
    {
      id: "TKT-2026-001",
      subject: "Consignment S365BD9K4M8X2 Delivery Confirmation",
      category: "DELIVERY",
      priority: "HIGH",
      status: "RESOLVED",
      createdAt: "Sep 14, 2026",
    },
    {
      id: "TKT-2026-002",
      subject: "Weekly COD bank disbursement timing enquiry",
      category: "COD",
      priority: "MEDIUM",
      status: "IN_PROGRESS",
      createdAt: "Sep 15, 2026",
    },
  ]);

  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("DELIVERY");
  const [message, setMessage] = useState("");

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const newTkt = {
      id: `TKT-2026-00${tickets.length + 1}`,
      subject,
      category,
      priority: "MEDIUM",
      status: "OPEN",
      createdAt: "Just now",
    };
    setTickets([newTkt, ...tickets]);
    setTicketModal(false);
    setSubject("");
    setMessage("");
  };

  return (
    <MerchantLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Merchant Support Desk</h1>
            <p className="text-xs text-slate-500 mt-0.5">Submit support tickets, report missing packages, and request billing assistance</p>
          </div>

          <button
            type="button"
            onClick={() => setTicketModal(true)}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Support Ticket</span>
          </button>
        </div>

        {/* Tickets List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Your Tickets</h3>
            <span className="text-xs font-semibold text-slate-500">{tickets.length} Total</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {tickets.map((t) => (
              <div key={t.id} className="p-5 flex items-center justify-between hover:bg-slate-50/60 transition">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-600">{t.id}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {t.category}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{t.subject}</h4>
                  <span className="text-slate-400 text-[11px] block">{t.createdAt}</span>
                </div>

                <div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      t.status === "RESOLVED"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : t.status === "IN_PROGRESS"
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {t.status.replace(/_/g, " ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal */}
        {ticketModal && (
          <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">New Support Ticket</h3>
                <button onClick={() => setTicketModal(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ticket Subject</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief description of the issue"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="DELIVERY">Delivery Status / Delay</option>
                    <option value="COD">COD Collection / Settlement</option>
                    <option value="BILLING">Billing & Invoices</option>
                    <option value="TECHNICAL">Technical Issue / Bug</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Please include Order Number or Tracking ID if applicable..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setTicketModal(false)}
                    className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-lg shadow-sm"
                  >
                    Submit Ticket
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MerchantLayout>
  );
}
