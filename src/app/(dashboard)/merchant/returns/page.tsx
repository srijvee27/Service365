"use client";

import React from "react";
import { MerchantLayout } from "@/components/layout/MerchantLayout";
import { RotateCcw, AlertCircle, MapPin, Package } from "lucide-react";
import Link from "next/link";

export default function MerchantReturnsPage() {
  const returnOrders = [
    {
      id: "RET-101",
      orderNumber: "S365-2026-000088",
      trackingId: "S365BD5R2P9M1",
      customer: "Farhan Kabir",
      district: "Rajshahi",
      reason: "Customer unreachable after 3 attempts",
      returnFee: 65,
      status: "RETURN_IN_TRANSIT",
      rider: "Jamal Hossain",
    },
  ];

  return (
    <MerchantLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Return Management (RTM)</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor reverse logistics, customer return reasons, and warehouse check-in
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Active Return Consignments</h3>
            <span className="text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-md">
              1 Active Return
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-5">Consignment ID</th>
                  <th className="py-3 px-5">Customer & District</th>
                  <th className="py-3 px-5">Return Reason</th>
                  <th className="py-3 px-5">Assigned Rider</th>
                  <th className="py-3 px-5">Return Fee (50%)</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {returnOrders.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-5 font-mono">
                      <span className="font-bold text-blue-600">{r.trackingId}</span>
                      <span className="block text-[10px] text-slate-400">{r.orderNumber}</span>
                    </td>
                    <td className="py-3 px-5 font-medium text-slate-900">
                      {r.customer}
                      <span className="block text-[10px] text-slate-400">{r.district}</span>
                    </td>
                    <td className="py-3 px-5 text-slate-700">{r.reason}</td>
                    <td className="py-3 px-5 text-slate-600">{r.rider}</td>
                    <td className="py-3 px-5 font-bold text-slate-800">৳{r.returnFee}</td>
                    <td className="py-3 px-5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">
                        {r.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-right">
                      <Link
                        href={`/track/${r.trackingId}`}
                        className="text-xs font-bold text-blue-600 hover:underline"
                      >
                        Track
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MerchantLayout>
  );
}
