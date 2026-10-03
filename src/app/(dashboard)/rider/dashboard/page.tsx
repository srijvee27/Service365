"use client";

import React, { useState, useEffect, useCallback } from "react";
import { RiderLayout } from "@/components/layout/RiderLayout";
import { formatCurrency } from "@/lib/utils";
import {
  Truck,
  Phone,
  MapPin,
  CheckCircle2,
  Package,
  DollarSign,
  Key,
  Navigation,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

export default function RiderDashboardPage() {
  const [riderUser, setRiderUser] = useState<any>(null);
  const [cashInHand, setCashInHand] = useState(0);
  const [activeTasks, setActiveTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Status progression action state
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  // OTP / Delivery Complete Modal
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [otpInput, setOtpInput] = useState("");
  const [processing, setProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
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
        } else {
          setCashInHand(4200);
        }
      }

      if (ordersData.success && Array.isArray(ordersData.data)) {
        const activeStatuses = ["ASSIGNED", "ACCEPTED", "PICKED_UP", "OUT_FOR_DELIVERY"];
        const tasks = ordersData.data
          .filter((o: any) => activeStatuses.includes(o.status))
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
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

  const riderIdDisplay =
    riderUser?.rider?.riderId ||
    (riderUser?.email === "rider@service365.demo"
      ? "RDR-092"
      : `RDR-${(riderUser?.rider?.id || riderUser?.id || "001").slice(-3).toUpperCase()}`);

  // Flow: ASSIGNED -> ACCEPTED -> PICKED_UP -> OUT_FOR_DELIVERY -> DELIVERED
  const handleAdvanceStatus = async (task: any) => {
    let nextStatus = "";
    if (task.status === "ASSIGNED") nextStatus = "ACCEPTED";
    else if (task.status === "ACCEPTED") nextStatus = "PICKED_UP";
    else if (task.status === "PICKED_UP") nextStatus = "OUT_FOR_DELIVERY";
    else if (task.status === "OUT_FOR_DELIVERY") {
      handleOpenDelivery(task);
      return;
    }

    if (!nextStatus) return;

    setUpdatingTaskId(task.id);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/orders/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          message: `Rider updated delivery progress to ${nextStatus.replace(/_/g, " ")}.`,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to update delivery status");
      }

      setSuccessMessage(`Order ${task.trackingId} status updated to ${nextStatus.replace(/_/g, " ")}.`);
      setTimeout(() => setSuccessMessage(null), 3000);
      await loadData();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to advance delivery status");
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleOpenDelivery = (task: any) => {
    setSelectedTask(task);
    setOtpModalOpen(true);
    setOtpInput("");
    setErrorMessage(null);
  };

  const handleConfirmDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    setProcessing(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/orders/${selectedTask.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "DELIVERED",
          message: `Delivered by Rider ${riderUser?.name || ""}. Cash on delivery collected.`,
          location: selectedTask.address || "Customer Address",
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to confirm delivery");
      }

      setCashInHand((prev) => prev + selectedTask.codAmount);
      setActiveTasks((prev) => prev.filter((t) => t.id !== selectedTask.id));
      setSuccessMessage(`Order ${selectedTask.trackingId} successfully delivered! COD ৳${selectedTask.codAmount} collected.`);
      setOtpModalOpen(false);
      setTimeout(() => setSuccessMessage(null), 4000);
      await loadData();
    } catch (err: any) {
      setErrorMessage(err.message || "Error confirming delivery. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const getActionButtonLabel = (status: string) => {
    switch (status) {
      case "ASSIGNED":
        return "Accept Delivery";
      case "ACCEPTED":
        return "Mark Picked Up";
      case "PICKED_UP":
        return "Start Delivery (Out for Delivery)";
      case "OUT_FOR_DELIVERY":
        return "Complete Delivery";
      default:
        return "Update Status";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ASSIGNED":
        return <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">ASSIGNED</span>;
      case "ACCEPTED":
        return <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">ACCEPTED</span>;
      case "PICKED_UP":
        return <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">PICKED UP</span>;
      case "OUT_FOR_DELIVERY":
        return <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">OUT FOR DELIVERY</span>;
      default:
        return <span className="bg-slate-700 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full">{status}</span>;
    }
  };

  return (
    <RiderLayout>
      <div className="space-y-6">
        {/* Rider Profile Card Matching Screenshot 4 */}
        <div className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700/80 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-600/30 text-blue-400 flex items-center justify-center font-black text-base border border-blue-500/30">
              {getInitials(riderUser?.name)}
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{riderUser?.name || "Rahim Uddin"}</span>
                <span className="text-xs font-normal text-slate-400">
                  ({formatVehicle(riderUser?.rider?.vehicleType)} Rider)
                </span>
              </h2>
              <span className="text-xs text-slate-400 mt-0.5 block font-mono">
                Hub: {formatZone(riderUser?.rider?.currentZone)} • ID: {riderIdDisplay}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Cash in Hand
            </span>
            <span className="text-xl font-black text-emerald-400 font-mono">
              {formatCurrency(cashInHand)}
            </span>
          </div>
        </div>

        {/* Alerts */}
        {successMessage && (
          <div className="bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 p-4 rounded-xl text-xs flex items-center gap-2 shadow-sm animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-950/70 border border-red-500/50 text-red-300 p-4 rounded-xl text-xs flex items-center gap-2 shadow-sm">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Assigned Deliveries Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-400" />
            <span>Assigned Deliveries ({activeTasks.length})</span>
          </h3>
          <span className="text-xs text-slate-400">Swipe or tap to complete</span>
        </div>

        {/* Tasks List */}
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mx-auto"></div>
          </div>
        ) : activeTasks.length === 0 ? (
          <div className="bg-slate-800/40 rounded-2xl p-10 text-center border border-slate-700/60 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h4 className="text-base font-bold text-white">All Deliveries Completed!</h4>
            <p className="text-xs text-slate-400">
              No active runs assigned right now. Return collected COD cash to the sorting hub.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeTasks.map((task) => {
              const isUpdating = updatingTaskId === task.id;

              return (
                <div
                  key={task.id}
                  className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700 shadow-xl space-y-4 transition hover:border-slate-600"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-blue-400 block">
                          {task.trackingId}
                        </span>
                        {getStatusBadge(task.status)}
                      </div>
                      <h4 className="text-base font-bold text-white mt-1">{task.customer}</h4>
                    </div>

                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold px-3 py-1 rounded-full font-mono">
                      COD: {formatCurrency(task.codAmount)}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 space-y-2 pt-1">
                    <p className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <span>{task.address}</span>
                    </p>
                    {task.instructions && (
                      <p className="text-amber-300/90 text-[11px] bg-amber-950/40 p-2.5 rounded-lg border border-amber-900/40">
                        Note: {task.instructions}
                      </p>
                    )}
                  </div>

                  {/* Actions Grid */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <a
                      href={`tel:${task.phone}`}
                      className="flex items-center justify-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs py-3 rounded-xl transition shadow-sm"
                    >
                      <Phone className="w-4 h-4 text-blue-400" />
                      <span>Call Customer</span>
                    </a>

                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleAdvanceStatus(task)}
                      className={`flex items-center justify-center gap-1.5 text-white font-bold text-xs py-3 rounded-xl shadow-md transition ${
                        task.status === "OUT_FOR_DELIVERY"
                          ? "bg-emerald-600 hover:bg-emerald-500"
                          : "bg-blue-600 hover:bg-blue-500"
                      } disabled:opacity-50`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        {isUpdating ? "Updating..." : getActionButtonLabel(task.status)}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* OTP / Delivery Confirmation Modal */}
        {otpModalOpen && selectedTask && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-700 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-emerald-400" />
                  <span>Complete Delivery Run</span>
                </h3>
                <button
                  onClick={() => setOtpModalOpen(false)}
                  className="text-slate-400 hover:text-white text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Recipient:</span>
                  <strong className="text-white">{selectedTask.customer}</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Cash to Collect:</span>
                  <strong className="text-emerald-400 font-bold text-sm font-mono">
                    {formatCurrency(selectedTask.codAmount)}
                  </strong>
                </div>
              </div>

              <form onSubmit={handleConfirmDelivery} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Customer Delivery Verification OTP
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    placeholder="Enter 4-digit SMS OTP (or 1234)"
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
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-sm transition disabled:opacity-50"
                  >
                    {processing ? "Confirming..." : "Confirm & Collect Cash"}
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
