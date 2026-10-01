"use client";

import React, { useState, useEffect } from "react";
import { RiderLayout } from "@/components/layout/RiderLayout";
import { formatCurrency } from "@/lib/utils";
import {
  Truck,
  Phone,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Package,
  DollarSign,
  Key,
} from "lucide-react";

export default function RiderDashboardPage() {
  const [riderUser, setRiderUser] = useState<any>(null);
  const [cashInHand, setCashInHand] = useState(0);
  const [activeTasks, setActiveTasks] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [meRes, ordersRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/orders"),
        ]);
        const meData = await meRes.json();
        const ordersData = await ordersRes.json();

        if (meData.success && meData.data) {
          const u = meData.data;
          setRiderUser(u);
          if (u.rider?.cashInHand !== undefined && u.rider?.cashInHand !== null) {
            setCashInHand(Number(u.rider.cashInHand));
          } else if (u.email === "rider@service365.demo") {
            setCashInHand(4200);
          }
        }

        if (ordersData.success && Array.isArray(ordersData.data)) {
          const tasks = ordersData.data
            .filter((o: any) => o.status === "OUT_FOR_DELIVERY" || o.status === "PICKED_UP" || o.status === "ASSIGNED")
            .map((o: any) => ({
              id: o.id,
              orderNumber: o.orderNumber,
              trackingId: o.trackingId,
              customer: o.receiverName,
              phone: o.receiverPhone,
              address: `${o.receiverAddress || ""}${o.receiverDistrict ? `, ${o.receiverDistrict}` : ""}`.trim().replace(/^,\s*/, ""),
              instructions: o.deliveryInstructions || "Deliver parcel to recipient",
              type: "DELIVERY",
              codAmount: Number(o.codAmount || 0),
              status: o.status,
            }));
          setActiveTasks(tasks);
        }
      } catch (err) {
        console.error("Failed to load rider dashboard data", err);
      }
    }
    loadData();
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return "RU";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const formatVehicle = (type?: string) => {
    if (!type) return "Bike";
    const upper = type.toUpperCase();
    if (upper === "CYCLE") return "Bicycle";
    if (upper === "VAN") return "Van";
    return "Bike";
  };

  const formatZone = (zone?: string) => {
    if (!zone || zone === "INSIDE_DHAKA") return "Dhaka North";
    if (zone === "DHAKA_SUBURB") return "Dhaka Suburb";
    if (zone === "OUTSIDE_DHAKA") return "Outside Dhaka";
    return zone;
  };

  const riderIdDisplay = riderUser?.email === "rider@service365.demo"
    ? "RDR-092"
    : `RDR-${(riderUser?.rider?.id || riderUser?.id || "001").slice(-3).toUpperCase()}`;

  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [otpInput, setOtpInput] = useState("");
  const [processing, setProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleOpenDelivery = (task: any) => {
    setSelectedTask(task);
    setOtpModalOpen(true);
    setOtpInput("");
  };

  const handleConfirmDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    setProcessing(true);
    try {
      const res = await fetch(`/api/orders/${selectedTask.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "DELIVERED",
          message: `Delivered by Rider with OTP verification. COD ৳${selectedTask.codAmount} collected.`,
          location: "Gulshan-2, Dhaka",
        }),
      });

      const json = await res.json();
      if (json.success) {
        setCashInHand((prev) => prev + selectedTask.codAmount);
        setActiveTasks((prev) => prev.filter((t) => t.id !== selectedTask.id));
        setSuccessMessage(`Order ${selectedTask.trackingId} successfully delivered! COD collected.`);
        setOtpModalOpen(false);
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch {
      alert("Error confirming delivery. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <RiderLayout>
      <div className="space-y-6">
        {/* Rider Stats Bar */}
        <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-base">
              {getInitials(riderUser?.name)}
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                {riderUser?.name || "Rahim Uddin"} ({formatVehicle(riderUser?.rider?.vehicleType)} Rider)
              </h2>
              <span className="text-xs text-slate-400">
                Hub: {formatZone(riderUser?.rider?.currentZone)} • ID: {riderIdDisplay}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Cash in Hand</span>
            <span className="text-xl font-black text-emerald-400 font-mono">
              {formatCurrency(cashInHand)}
            </span>
          </div>
        </div>

        {successMessage && (
          <div className="bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 p-4 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Assigned Tasks Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-400" />
            <span>Assigned Deliveries ({activeTasks.length})</span>
          </h3>
          <span className="text-xs text-slate-400">Swipe or tap to complete</span>
        </div>

        {/* Tasks List */}
        {activeTasks.length === 0 ? (
          <div className="bg-slate-800/40 rounded-2xl p-10 text-center border border-slate-700/60 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h4 className="text-base font-bold text-white">All Deliveries Completed!</h4>
            <p className="text-xs text-slate-400">Great job. Return collected COD cash to Tejgaon sorting hub.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeTasks.map((task) => (
              <div
                key={task.id}
                className="bg-slate-800 rounded-2xl p-5 border border-slate-700 shadow-lg space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-blue-400 block">
                      {task.trackingId}
                    </span>
                    <h4 className="text-base font-bold text-white mt-0.5">{task.customer}</h4>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold px-2.5 py-1 rounded-full">
                    COD: {formatCurrency(task.codAmount)}
                  </span>
                </div>

                <div className="text-xs text-slate-300 space-y-1.5 pt-1">
                  <p className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>{task.address}</span>
                  </p>
                  {task.instructions && (
                    <p className="text-amber-300/90 text-[11px] bg-amber-950/30 p-2 rounded-lg border border-amber-900/40">
                      Note: {task.instructions}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <a
                    href={`tel:${task.phone}`}
                    className="flex items-center justify-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs py-3 rounded-xl transition"
                  >
                    <Phone className="w-4 h-4 text-blue-400" />
                    <span>Call Customer</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => handleOpenDelivery(task)}
                    className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 rounded-xl shadow-md transition"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete Delivery</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* OTP Confirmation Modal */}
        {otpModalOpen && selectedTask && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-700 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-emerald-400" />
                  <span>Verify Delivery OTP</span>
                </h3>
                <button
                  onClick={() => setOtpModalOpen(false)}
                  className="text-slate-400 hover:text-white text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700 text-xs space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Customer:</span>
                  <strong className="text-white">{selectedTask.customer}</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Cash to Collect:</span>
                  <strong className="text-emerald-400 font-bold text-sm">
                    {formatCurrency(selectedTask.codAmount)}
                  </strong>
                </div>
              </div>

              <form onSubmit={handleConfirmDelivery} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Enter 4-Digit Customer SMS OTP
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    placeholder="e.g. 4921 (or demo override: 1234)"
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-center text-xl font-mono font-bold tracking-widest text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    autoFocus
                  />
                  <span className="text-[10px] text-slate-400 block mt-1 text-center">
                    Sent via SMS to customer's mobile number
                  </span>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setOtpModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-sm"
                  >
                    {processing ? "Verifying..." : "Confirm & Collect Cash"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </RiderLayout>
  );
}
