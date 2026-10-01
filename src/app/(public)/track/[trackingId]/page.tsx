"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import QRCode from "qrcode";
import {
  Package,
  MapPin,
  Clock,
  ShieldCheck,
  Phone,
  ArrowLeft,
  Printer,
  CheckCircle2,
  AlertCircle,
  Truck,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

interface TrackingEventItem {
  id: string;
  status: string;
  message: string;
  location?: string;
  createdAt: string;
}

interface TrackingData {
  orderNumber: string;
  trackingId: string;
  senderDistrict: string;
  senderArea: string;
  receiverDistrict: string;
  receiverArea: string;
  receiverName: string;
  serviceType: string;
  paymentMethod: string;
  codAmount: number;
  codStatus: string;
  status: string;
  weight: number;
  productDescription?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  rider?: {
    name: string;
    phone: string;
    vehicleType: string;
  };
  events: TrackingEventItem[];
}

export default function TrackingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const trackingId = params?.trackingId as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<TrackingData | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTrackingData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/tracking/${encodeURIComponent(trackingId)}`);
        const json = await res.json();
        if (json.success && json.data) {
          setData(json.data);
          // Generate QR Code
          const currentUrl = typeof window !== "undefined" ? window.location.href : `https://service365.vercel.app/track/${trackingId}`;
          const qr = await QRCode.toDataURL(currentUrl, { width: 140, margin: 1 });
          setQrDataUrl(qr);
        } else {
          setError(json.error?.message || "Consignment not found. Please verify the Tracking ID.");
        }
      } catch {
        setError("Unable to connect to tracking server. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    if (trackingId) {
      loadTrackingData();
    }
  }, [trackingId]);

  const STAGES = [
    { key: "ORDER_CREATED", label: "Order Placed" },
    { key: "ORDER_CONFIRMED", label: "Confirmed" },
    { key: "PICKUP_REQUESTED", label: "Pickup Assigned" },
    { key: "PICKED_UP", label: "Picked Up" },
    { key: "AT_SORTING_CENTER", label: "At Sorting Center" },
    { key: "IN_TRANSIT", label: "In Transit" },
    { key: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
    { key: "DELIVERED", label: "Delivered" },
  ];

  const getStageIndex = (status: string) => {
    const idx = STAGES.findIndex((s) => s.key === status);
    return idx >= 0 ? idx : 0;
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Back Link & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            href="/track"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Search Another Consignment</span>
          </Link>

          {data && (
            <div className="flex items-center gap-2">
              <Link
                href={`/print/label/${data.orderNumber}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white border border-slate-300 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-50 shadow-sm transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Shipping Label</span>
              </Link>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-700">Fetching live consignment status...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-white rounded-2xl border border-red-200 p-10 text-center space-y-4 shadow-sm">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">Tracking Record Not Found</h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto">{error}</p>
            <div className="pt-2">
              <Link
                href="/track"
                className="inline-flex items-center gap-2 bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-lg"
              >
                <span>Return to Search</span>
              </Link>
            </div>
          </div>
        )}

        {/* Tracking Details View */}
        {!loading && data && (
          <div className="space-y-6">
            {/* Top Status Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Consignment Tracking ID
                  </span>
                  <div className="flex items-center gap-3 mt-1">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
                      {data.trackingId}
                    </h1>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                        data.status === "DELIVERED"
                          ? "bg-emerald-100 text-emerald-800"
                          : data.status === "OUT_FOR_DELIVERY"
                          ? "bg-blue-100 text-blue-800 animate-pulse"
                          : data.status.includes("FAILED") || data.status.includes("RETURN")
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {data.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Order Ref: {data.orderNumber}</p>
                </div>

                {qrDataUrl && (
                  <div className="flex flex-col items-center p-2 bg-slate-50 rounded-xl border border-slate-100 shrink-0">
                    <img src={qrDataUrl} alt="Tracking QR Code" className="w-24 h-24" />
                    <span className="text-[9px] font-mono text-slate-400 mt-1">Scan for Mobile</span>
                  </div>
                )}
              </div>

              {/* Key Routing Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase">From (Origin)</span>
                  <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    <span>{data.senderDistrict}</span>
                  </p>
                  <p className="text-xs text-slate-500">{data.senderArea}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase">To (Destination)</span>
                  <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-500" />
                    <span>{data.receiverDistrict}</span>
                  </p>
                  <p className="text-xs text-slate-500">{data.receiverArea}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Payment & COD</span>
                  <p className="text-sm font-bold text-blue-600">
                    {data.paymentMethod === "COD" ? `COD: ${formatCurrency(data.codAmount)}` : "Prepaid Online"}
                  </p>
                  <p className="text-xs text-slate-500 font-mono">Status: {data.codStatus}</p>
                </div>
              </div>

              {/* Rider Assigned Card */}
              {data.rider && (
                <div className="mt-6 p-4 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Delivery Rider: {data.rider.name}</h4>
                      <p className="text-[11px] text-slate-600">
                        Assigned Rider • Contact: <span className="font-mono">{data.rider.phone}</span>
                      </p>
                    </div>
                  </div>

                  <a
                    href={`tel:${data.rider.phone}`}
                    className="inline-flex items-center gap-1.5 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm hover:bg-blue-700 transition"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Rider</span>
                  </a>
                </div>
              )}
            </div>

            {/* Vertical Milestone Progress Timeline */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
              <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span>Consignment Lifecycle Timeline</span>
              </h3>

              <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-200 space-y-8 ml-3">
                {data.events.map((event, idx) => (
                  <div key={event.id || idx} className="relative group">
                    {/* Circle Node */}
                    <div
                      className={`absolute -left-[31px] sm:-left-[39px] top-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        idx === 0
                          ? "bg-blue-600 text-white ring-4 ring-blue-100"
                          : "bg-emerald-500 text-white ring-4 ring-emerald-50"
                      }`}
                    >
                      ✓
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                          {event.status.replace(/_/g, " ")}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {formatDateTime(event.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">{event.message}</p>
                      {event.location && (
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>Location: {event.location}</span>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
