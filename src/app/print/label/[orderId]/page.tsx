"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Printer, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import Service365Logo from "@/components/branding/Service365Logo";
import { formatCurrency } from "@/lib/utils";

interface OrderData {
  id: string;
  orderId?: string;
  orderNumber: string;
  trackingId: string;
  senderName: string;
  senderPhone: string;
  senderDistrict: string;
  senderArea: string;
  senderAddress: string;
  receiverName: string;
  receiverPhone: string;
  receiverDistrict: string;
  receiverArea: string;
  receiverAddress: string;
  deliveryInstructions?: string;
  productType: string;
  productDescription?: string;
  weight: number;
  totalCharge: number;
  paymentMethod: string;
  paymentStatus: string;
  codAmount: number;
  status: string;
  createdAt: string;
  merchant?: {
    businessName: string;
    phone: string;
  };
}

export default function ShippingLabelPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.orderId as string;
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        const data = await res.json();
        if (data.success && data.data) {
          setOrder(data.data);
        } else {
          // Fallback mock order if viewing demo or database empty
          setOrder({
            id: orderId,
            orderNumber: `S365-2026-${orderId.slice(-6).toUpperCase()}`,
            trackingId: `S365BD${orderId.slice(0, 7).toUpperCase()}`,
            senderName: "Star Tech BD",
            senderPhone: "+8801711223344",
            senderDistrict: "Dhaka",
            senderArea: "Dhanmondi",
            senderAddress: "House 12, Road 4, Dhanmondi, Dhaka 1205",
            receiverName: "Tanvir Ahmed",
            receiverPhone: "+8801899112233",
            receiverDistrict: "Chattogram",
            receiverArea: "Agrabad",
            receiverAddress: "Flat 4B, Agrabad C/A, Chattogram 4100",
            deliveryInstructions: "Call before arrival, deliver before 5 PM",
            productType: "ELECTRONICS",
            productDescription: "Wireless Headphone ANC",
            weight: 1.2,
            totalCharge: 160,
            paymentMethod: "COD",
            paymentStatus: "PENDING",
            codAmount: 3850,
            status: "ORDER_CREATED",
            createdAt: new Date().toISOString(),
            merchant: {
              businessName: "Star Tech BD Ltd.",
              phone: "+8801711223344",
            },
          });
        }
      } catch (err: unknown) {
        console.error("Failed to load order for label:", err);
        setError("Could not load order details.");
      } finally {
        setLoading(false);
      }
    }

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Label Unavailable</h2>
          <p className="text-slate-600 mb-6">{error || "The specified order was not found."}</p>
          <button
            onClick={() => router.back()}
            className="px-5 py-2.5 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Barcode pattern generator for visual simulation
  const routingTag = `${order.receiverDistrict.slice(0, 3).toUpperCase()}-${(order.receiverArea || order.receiverDistrict).slice(0, 6).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-slate-200 py-8 px-4 flex flex-col items-center print:bg-white print:p-0 print:m-0">
      {/* Action Header - Hidden during print */}
      <div className="w-full max-w-[420px] mb-4 flex items-center justify-between print:hidden">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-sm font-semibold text-slate-700 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl shadow-sm hover:shadow transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
        </button>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center text-sm font-bold text-white bg-blue-600 px-5 py-2 rounded-xl shadow hover:bg-blue-700 transition"
        >
          <Printer className="w-4 h-4 mr-2" /> Print Label
        </button>
      </div>

      {/* 4x6 Thermal Label Container */}
      <div className="w-[384px] bg-white border-2 border-black p-4 text-black font-sans leading-tight shadow-lg print:shadow-none print:border-2 print:border-black print:w-[384px] print:m-0 print:p-4 print:page-break-inside-avoid">
        {/* Header: Brand & Support */}
        <div className="border-b-2 border-black pb-3 mb-2 flex items-center justify-between">
          <div>
            <Service365Logo variant="print" size="sm" />
          </div>
          <div className="text-right">
            <span className="inline-block bg-black text-white text-[10px] font-black px-1.5 py-0.5 uppercase tracking-wider mb-0.5">
              EXPRESS 365
            </span>
            <p className="text-[10px] font-bold">24/7: 09612-365365</p>
            <p className="text-[9px] text-slate-700">service365.vercel.app</p>
          </div>
        </div>

        {/* Routing Hub & Date Row */}
        <div className="grid grid-cols-2 border-b-2 border-black pb-2 mb-2 text-[11px]">
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-700 block">Routing Hub</span>
            <span className="text-xl font-black tracking-tight">{routingTag}</span>
          </div>
          <div className="text-right">
            <span className="text-[9px] uppercase font-bold text-slate-700 block">Booking Date</span>
            <span className="font-bold">{new Date(order.createdAt).toLocaleDateString("en-GB")}</span>
            <span className="text-[10px] block font-mono">{order.orderNumber}</span>
          </div>
        </div>

        {/* Primary Barcode Section */}
        <div className="border-b-2 border-black pb-3 mb-2 text-center">
          <div className="flex justify-center items-center py-1.5 px-2 bg-slate-50 border border-slate-300 mb-1">
            {/* High fidelity SVG barcode lines */}
            <svg className="w-full h-14" viewBox="0 0 280 50">
              {Array.from({ length: 58 }).map((_, i) => {
                const width = ((i * 13) % 4) + 1.5;
                const x = i * 4.8;
                return <rect key={i} x={x} y={0} width={width} height={48} fill="#000000" />;
              })}
            </svg>
          </div>
          <p className="text-sm font-black tracking-widest font-mono uppercase">{order.trackingId}</p>
        </div>

        {/* Deliver To (Recipient) Section */}
        <div className="border-b-2 border-black pb-2 mb-2">
          <div className="flex items-start justify-between">
            <div>
              <span className="inline-block bg-black text-white text-[9px] font-black px-1 uppercase tracking-wider mb-1">
                DELIVER TO (RECIPIENT)
              </span>
              <p className="text-sm font-black">{order.receiverName}</p>
              <p className="text-xs font-bold font-mono">{order.receiverPhone}</p>
              <p className="text-xs mt-1 font-medium">{order.receiverAddress}</p>
              <p className="text-xs font-bold mt-0.5">
                {order.receiverArea}, {order.receiverDistrict}
              </p>
            </div>
            <div className="text-right pl-2 shrink-0">
              <span className="text-[10px] uppercase font-bold text-slate-700 block">Order ID</span>
              <span className="text-lg font-black font-mono block">
                {order.orderId || `#${order.id.slice(-6).toUpperCase()}`}
              </span>
            </div>
          </div>
          {order.deliveryInstructions && (
            <p className="text-[10px] mt-1 bg-slate-100 p-1 font-semibold border border-dashed border-black">
              Note: {order.deliveryInstructions}
            </p>
          )}
        </div>

        {/* COD Financial Section - Ultra Bold */}
        <div className="border-b-2 border-black pb-2 mb-2 bg-slate-50 p-2 border">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-[9px] font-black uppercase text-slate-800 block">
                {order.paymentMethod === "COD" ? "Cash On Delivery (COD)" : "Payment Status"}
              </span>
              <span className="text-2xl font-black">
                {order.paymentMethod === "COD" ? formatCurrency(order.codAmount) : "PAID ONLINE"}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold block">Weight: {order.weight} KG</span>
              <span className="text-[9px] text-slate-600 block">Delivery: {formatCurrency(order.totalCharge)}</span>
            </div>
          </div>
        </div>

        {/* Return Address & Merchant */}
        <div className="grid grid-cols-3 border-b-2 border-black pb-2 mb-2 text-[10px]">
          <div className="col-span-2 pr-2 border-r border-black">
            <span className="text-[9px] font-bold uppercase text-slate-700 block">Return To (Merchant)</span>
            <p className="font-bold truncate">{order.merchant?.businessName || order.senderName}</p>
            <p className="font-mono">{order.merchant?.phone || order.senderPhone}</p>
            <p className="text-[9px] truncate">{order.senderAddress}</p>
            <p className="text-[9px] font-semibold">{order.senderArea}, {order.senderDistrict}</p>
          </div>
          {/* QR Code for Public Live Tracking */}
          <div className="flex flex-col items-center justify-center pl-2 text-center">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://service365.vercel.app/track/${order.trackingId}`}
              alt="Tracking QR Code"
              className="w-14 h-14 border border-black p-0.5"
            />
            <span className="text-[8px] font-bold mt-0.5 font-mono">SCAN TO TRACK</span>
          </div>
        </div>

        {/* Footer Disclaimer */}
        <div className="flex justify-between items-center text-[8px] text-slate-600">
          <span>Service365 Courier • Delivery Verification Required</span>
          <span className="font-mono">VERIFIED</span>
        </div>
      </div>

      <p className="text-xs text-slate-500 mt-4 print:hidden text-center max-w-sm">
        Standard 4x6 inch thermal paper compliant (Zebra, TSC, Xprinter). Hit Ctrl+P or use the Print button.
      </p>
    </div>
  );
}
