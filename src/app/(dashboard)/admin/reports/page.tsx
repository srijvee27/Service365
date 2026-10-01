"use client";

import React, { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { BarChart3, Download, TrendingUp, DollarSign, Package, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function AdminReportsPage() {
  const [downloading, setDownloading] = useState(false);

  const downloadReportCsv = () => {
    setDownloading(true);
    const headers = "Date,OrderNumber,TrackingId,Merchant,Zone,WeightKg,TotalCharge,CodAmount,Status\n";
    const sampleRows = [
      "2026-09-15,S365-2026-000101,S365BD9K4M8X2,Star Tech BD,Inside Dhaka,1.0,60,4500,DELIVERED\n",
      "2026-09-15,S365-2026-000102,S365BD3T7P1Q9,Apex Footwear,Outside Dhaka,2.5,167.5,2800,DELIVERED\n",
      "2026-09-16,S365-2026-000103,S365BD5R8W2E4,Daraz Merchant,Dhaka Suburb,1.2,104,1200,OUT_FOR_DELIVERY\n",
    ].join("");

    const blob = new Blob([headers + sampleRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Service365_Admin_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloading(false);
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center">
            <BarChart3 className="w-6 h-6 text-blue-600 mr-2.5" /> Platform Analytics & Financial BI
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Network volume, delivery success rates, zone demand distribution, and revenue exports.
          </p>
        </div>

        <button
          onClick={downloadReportCsv}
          disabled={downloading}
          className="inline-flex items-center px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shadow-sm"
        >
          <Download className="w-4 h-4 mr-1.5" /> Export BI Report (CSV)
        </button>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Delivery Success Rate
          </span>
          <p className="text-3xl font-black text-slate-900">96.8%</p>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full w-[96.8%]"></div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Only 3.2% return or reschedule rate nationwide.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Avg. Delivery Time (Dhaka)
          </span>
          <p className="text-3xl font-black text-slate-900">18.4 Hrs</p>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full w-[80%]"></div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Target SLA: 24.0 Hours</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Avg. Delivery Time (Nationwide)
          </span>
          <p className="text-3xl font-black text-slate-900">38.2 Hrs</p>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-purple-600 h-full rounded-full w-[70%]"></div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Target SLA: 48.0 Hours</p>
        </div>
      </div>

      {/* Zone Volume Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 text-base mb-4">Volume Breakdown by Zone</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Inside Dhaka (Inter-city)</span>
                <span className="text-slate-600">58% (2,450 parcels)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full w-[58%] rounded-full"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Outside Dhaka (Cross-district)</span>
                <span className="text-slate-600">32% (1,350 parcels)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[32%] rounded-full"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Dhaka Suburbs (Gazipur, Savar, Narayanganj)</span>
                <span className="text-slate-600">10% (420 parcels)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full w-[10%] rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 text-base mb-4">Top 5 Delivery Hubs by Throughput</h3>
          <ul className="divide-y divide-slate-100 text-xs">
            <li className="py-3 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-900">Dhanmondi Hub (Dhaka)</span>
                <span className="block text-slate-400">12 Active Riders</span>
              </div>
              <span className="font-mono font-bold text-blue-600">840 parcels/day</span>
            </li>
            <li className="py-3 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-900">Agrabad Hub (Chattogram)</span>
                <span className="block text-slate-400">8 Active Riders</span>
              </div>
              <span className="font-mono font-bold text-blue-600">520 parcels/day</span>
            </li>
            <li className="py-3 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-900">Uttara Hub (Dhaka)</span>
                <span className="block text-slate-400">9 Active Riders</span>
              </div>
              <span className="font-mono font-bold text-blue-600">490 parcels/day</span>
            </li>
            <li className="py-3 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-900">Zindabazar Hub (Sylhet)</span>
                <span className="block text-slate-400">5 Active Riders</span>
              </div>
              <span className="font-mono font-bold text-blue-600">310 parcels/day</span>
            </li>
            <li className="py-3 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-900">Motijheel Hub (Dhaka)</span>
                <span className="block text-slate-400">7 Active Riders</span>
              </div>
              <span className="font-mono font-bold text-blue-600">290 parcels/day</span>
            </li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
}
