"use client";

import React, { useState } from "react";
import { MerchantLayout } from "@/components/layout/MerchantLayout";
import { BarChart3, Download, Calendar, TrendingUp, CheckCircle2, RotateCcw } from "lucide-react";

export default function MerchantReportsPage() {
  const [dateRange, setDateRange] = useState("30");

  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        "Order ID,Tracking ID,Customer,District,COD Amount,Delivery Fee,Status,Date",
        "S365-2026-000101,S365BD9K4M8X2,Shakib Al Hasan,Chattogram,4500,200,DELIVERED,2026-09-14",
        "S365-2026-000102,S365BD7L3P9Q1,Sadia Afrin,Dhaka City,2800,128,OUT_FOR_DELIVERY,2026-09-15",
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Service365_Orders_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <MerchantLayout>
      <div className="space-y-8 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Reports & Performance Analytics
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Consolidated business intelligence and transaction records export
            </p>
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Export Orders to CSV</span>
          </button>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase">Delivery Success Rate</span>
            <div className="text-3xl font-extrabold text-emerald-600">98.5%</div>
            <p className="text-xs text-slate-500 pt-1">On-time doorstep fulfillment</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase">Return (RTM) Rate</span>
            <div className="text-3xl font-extrabold text-blue-600">1.5%</div>
            <p className="text-xs text-slate-500 pt-1">Significantly below market average</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase">Average Transit Speed</span>
            <div className="text-3xl font-extrabold text-slate-900">26.4h</div>
            <p className="text-xs text-slate-500 pt-1">Across nationwide dispatches</p>
          </div>
        </div>

        {/* Breakdown Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900">Divisional Order Distribution</h3>
          <div className="space-y-3 pt-2">
            {[
              { division: "Dhaka Division", pct: 62, count: 184 },
              { division: "Chattogram Division", pct: 18, count: 52 },
              { division: "Sylhet Division", pct: 9, count: 26 },
              { division: "Rajshahi & Khulna", pct: 11, count: 32 },
            ].map((item) => (
              <div key={item.division} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>{item.division}</span>
                  <span>{item.count} parcels ({item.pct}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MerchantLayout>
  );
}
