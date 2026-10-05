"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import {
  Calculator,
  Save,
  CheckCircle,
  RefreshCw,
  Truck,
  Zap,
  Clock,
  Sparkles,
  Plus,
  Layers,
  MapPin,
  Scale,
  DollarSign,
  History,
  Check,
  Info,
  X,
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { BANGLADESH_DISTRICTS, getZoneByDistrict } from "@/lib/bangladesh-data";

const DELIVERY_TYPES = [
  { value: "REGULAR", label: "Regular Transit", subtitle: "24–72 Hours" },
  { value: "EXPRESS", label: "Express Next-Day", subtitle: "Guaranteed Priority (+৳40)" },
  { value: "SAME_DAY", label: "Same Day Dhaka", subtitle: "6–8 Hours Dhaka (+৳70)" },
] as const;

export default function AdminPricingPage() {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active UI Navigation Tab
  const [activeTab, setActiveTab] = useState<"matrix" | "zones" | "weight" | "cod" | "history">("matrix");

  // Selected Service Type for Matrix View
  const [selectedService, setSelectedService] = useState<"REGULAR" | "EXPRESS" | "SAME_DAY">("REGULAR");

  // Modal State for "Add Rate Card"
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRule, setNewRule] = useState({
    fromZone: "INSIDE_DHAKA",
    toZone: "OUTSIDE_DHAKA",
    serviceType: "REGULAR",
    baseCharge: 130,
    additionalWeightCharge: 25,
    codPercentage: 1,
  });

  // Live Simulator state (matching the screenshot reference)
  const [simFromDistrict, setSimFromDistrict] = useState("Dhaka City");
  const [simToDistrict, setSimToDistrict] = useState("Chattogram");
  const [simServiceType, setSimServiceType] = useState("REGULAR");
  const [simWeight, setSimWeight] = useState("2.5");
  const [simCod, setSimCod] = useState("2500");
  const [simLoading, setSimLoading] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);

  const loadRules = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/pricing");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setRules(data.data);
      }
    } catch (err) {
      console.error("Error loading pricing rules", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  // Run simulation whenever simulator inputs change or initial load
  const runSimulation = async (
    fromDist = simFromDistrict,
    toDist = simToDistrict,
    service = simServiceType,
    weight = simWeight,
    cod = simCod
  ) => {
    setSimLoading(true);
    try {
      const fromZone = getZoneByDistrict(fromDist);
      const toZone = getZoneByDistrict(toDist);
      const res = await fetch("/api/pricing/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromDistrict: fromDist,
          toDistrict: toDist,
          fromZone,
          toZone,
          weightKg: Number(weight) || 1,
          codAmount: Number(cod) || 0,
          declaredValue: Number(cod) > 0 ? Number(cod) : 0,
          serviceType: service,
          paymentMethod: "COD",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSimResult(data.data);
      }
    } catch (err) {
      console.error("Simulation error", err);
    } finally {
      setSimLoading(false);
    }
  };

  useEffect(() => {
    // Initial calculation for display
    runSimulation();
  }, []);

  const handleUpdateRule = async (rule: any) => {
    setSavingId(rule.id);
    try {
      const res = await fetch("/api/admin/pricing", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: rule.id,
          baseCharge: Number(rule.baseCharge),
          additionalWeightCharge: Number(rule.additionalWeightCharge),
          codPercentage: Number(rule.codPercentage),
          active: rule.active,
          serviceType: rule.serviceType,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSavedId(rule.id);
        setToastMessage("Pricing rule updated successfully!");
        setTimeout(() => setSavedId(null), 3000);
        setTimeout(() => setToastMessage(null), 3500);
        // Refresh simulation with new rates
        runSimulation();
      } else {
        alert(data.error?.message || "Failed to update pricing rule");
      }
    } catch (err) {
      alert("Error saving rule");
    } finally {
      setSavingId(null);
    }
  };

  const handleToggleActive = async (rule: any, index: number) => {
    const newActive = !rule.active;
    setRules((prev) =>
      prev.map((item, i) => (i === index ? { ...item, active: newActive } : item))
    );
    try {
      await fetch("/api/admin/pricing", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: rule.id,
          active: newActive,
        }),
      });
      setToastMessage(`Rule marked ${newActive ? "Active" : "Inactive"}`);
      setTimeout(() => setToastMessage(null), 2500);
    } catch (err) {
      console.error("Error toggling active state", err);
    }
  };

  const formatZoneLabel = (zone: string) => {
    if (!zone) return "";
    return zone
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Filter rules by active service type
  const displayedRules = rules.filter((r) => (r.serviceType || "REGULAR") === selectedService);


  return (
    <AdminLayout>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-md">
              Operations Management
            </span>
            <span className="flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full gap-1 border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Pricing Engine Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Pricing Rules
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage delivery rates, weight slabs, and COD charges for all zones and service types.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadRules}
            disabled={loading}
            className="px-3.5 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-sm flex items-center gap-1.5"
            title="Refresh Rules"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-600" : ""}`} />
            Refresh
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm shadow-blue-500/20 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add Rate Card
          </button>
        </div>
      </div>

      {/* Top Nav Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab("matrix")}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition shrink-0 ${
            activeTab === "matrix"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Rate Matrix
        </button>

        <button
          onClick={() => setActiveTab("zones")}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition shrink-0 ${
            activeTab === "zones"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          Zone Mapping
        </button>

        <button
          onClick={() => setActiveTab("weight")}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition shrink-0 ${
            activeTab === "weight"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          Weight Slabs
        </button>

        <button
          onClick={() => setActiveTab("cod")}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition shrink-0 ${
            activeTab === "cod"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          COD Rules
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition shrink-0 ${
            activeTab === "history"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <History className="w-3.5 h-3.5" />
          History
        </button>
      </div>

      {/* Conditionally Render Content based on activeTab */}
      {activeTab === "zones" && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Bangladesh 64 Districts Zone Classification
            </h3>
            <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
              {BANGLADESH_DISTRICTS.length} Covered Districts
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-6">
            Districts are mapped directly to three pricing tiers: Inside Dhaka, Dhaka Suburbs, and Outside Dhaka.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
              <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Inside Dhaka (Metro)</span>
                <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">Zone 1</span>
              </h4>
              <p className="text-xs text-slate-600 mb-3">Dhaka City Corporation North & South core delivery areas.</p>
              <div className="text-xs font-semibold text-slate-800 bg-white p-2.5 rounded-lg border border-blue-200/60">
                Dhaka (Sadar, Dhanmondi, Gulshan, Banani, Uttara, Mirpur, Mohammadpur, Motijheel, etc.)
              </div>
            </div>

            <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-4">
              <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Dhaka Suburbs</span>
                <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-bold">Zone 2</span>
              </h4>
              <p className="text-xs text-slate-600 mb-3">Greater Dhaka outer districts and industrial hubs.</p>
              <div className="text-xs font-semibold text-slate-800 bg-white p-2.5 rounded-lg border border-purple-200/60">
                Gazipur, Narayanganj, Savar, Keraniganj, Tongi, Dhamrai, Narsingdi, Munshiganj, Manikganj.
              </div>
            </div>

            <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4">
              <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Outside Dhaka</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">Zone 3</span>
              </h4>
              <p className="text-xs text-slate-600 mb-3">All other 55+ districts across 7 administrative divisions.</p>
              <div className="text-xs font-semibold text-slate-800 bg-white p-2.5 rounded-lg border border-emerald-200/60">
                Chattogram, Sylhet, Rajshahi, Khulna, Barishal, Rangpur, Mymensingh, Cox&apos;s Bazar, Cumilla, etc.
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "weight" && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Scale className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">Deterministic Weight Calculation Standard</h3>
          </div>
          <p className="text-xs text-slate-500 mb-5">
            Pathao & Steadfast logistics-aligned weight calculation model utilized across all Service365 orders.
          </p>
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="font-bold text-slate-900 mb-1">Base Weight Allowance: 0.0 - 1.0 KG</div>
              <p className="text-slate-600">The Base Rate (1KG) covers any parcel weight up to and including 1.0 kg without any extra increment.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="font-bold text-slate-900 mb-1">Extra Weight Surcharge Formula: Math.ceil(Weight - 1.0) × Extra/KG</div>
              <p className="text-slate-600">
                Every additional kilogram (or fraction of a kilogram) is rounded up to the nearest whole kilogram:
                <br />
                • 1.2 KG → 1 extra KG charged
                <br />
                • 2.5 KG → 2 extra KG charged (Math.ceil(2.5 - 1) = 2)
                <br />
                • 5.1 KG → 5 extra KG charged (Math.ceil(5.1 - 1) = 5)
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "cod" && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 mb-8">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">Cash on Delivery (COD) Commission Policy</h3>
          </div>
          <p className="text-xs text-slate-500 mb-5">
            Admin configurable commission deducted upon successful delivery settlement.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="font-bold text-slate-900 mb-1">Standard Rate: 1.0%</div>
              <p className="text-slate-600">Standard commission across all Bangladesh routes. Billed on total recipient collection amount upon settlement.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="font-bold text-slate-900 mb-1">Settlement Calculation</div>
              <p className="text-slate-600">
                Merchant Wallet Credit = COD Amount Collected - (Delivery Charge + COD Fee).
                The merchant receives their exact declared goods value upon delivery.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 mb-8">
          <div className="flex items-center gap-2 mb-2">
            <History className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">Audit & Modification History</h3>
          </div>
          <p className="text-xs text-slate-500 mb-5">
            All pricing adjustments are logged in the persistent Neon database audit logs table.
          </p>
          <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs text-emerald-900 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold block">Live Audit Trail Enabled</span>
              <span>Rate updates trigger an automatic entry in the central AuditLog table with administrator timestamp and prior value snapshots.</span>
            </div>
          </div>
        </div>
      )}

      {/* Service Speed Switcher Cards (Matching Visual Mockup) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {DELIVERY_TYPES.map((dt) => {
          const count = rules.filter((r) => (r.serviceType || "REGULAR") === dt.value).length;
          const isSelected = selectedService === dt.value;
          return (
            <button
              key={dt.value}
              onClick={() => setSelectedService(dt.value)}
              className={`p-4 rounded-2xl border text-left transition flex items-center justify-between ${
                isSelected
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-md shadow-blue-500/20"
                  : "bg-white border-slate-200 text-slate-800 hover:border-blue-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected ? "bg-white/20 text-white" : "bg-blue-50 text-blue-600"
                  }`}
                >
                  {dt.value === "REGULAR" && <Truck className="w-5 h-5" />}
                  {dt.value === "EXPRESS" && <Zap className="w-5 h-5" />}
                  {dt.value === "SAME_DAY" && <Clock className="w-5 h-5" />}
                </div>
                <div>
                  <div className="text-sm font-bold flex items-center gap-1.5">
                    <span>{dt.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        isSelected ? "bg-white/25 text-white" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {count} {count === 1 ? "rule" : "rules"}
                    </span>
                  </div>
                  <div className={`text-[11px] ${isSelected ? "text-blue-100" : "text-slate-500"}`}>
                    {dt.subtitle}
                  </div>
                </div>
              </div>
              {isSelected && <Check className="w-4 h-4 text-white" />}
            </button>
          );
        })}
      </div>

      {/* Main Grid: Rate Matrix on Left, Simulator on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Left Column: Delivery Rate Matrix Table */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Delivery Rate Matrix —{" "}
                  {selectedService === "REGULAR"
                    ? "Regular Transit"
                    : selectedService === "EXPRESS"
                    ? "Express Next-Day"
                    : "Same Day Dhaka"}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure base rates (first 1kg), extra kg increments, and COD percentages.
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                {displayedRules.length} Rules Active
              </span>
            </div>

            {loading ? (
              <div className="p-16 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mx-auto"></div>
                <p className="text-xs text-slate-500 mt-3 font-medium">Loading pricing matrix...</p>
              </div>
            ) : displayedRules.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                  <Plus className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 mb-1">
                  No custom rate cards for {DELIVERY_TYPES.find((t) => t.value === selectedService)?.label} yet
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
                  Standard base rates with speed surcharges automatically apply. Click below to add a dedicated route pricing card for this delivery type.
                </p>
                <button
                  onClick={() => {
                    setNewRule((prev) => ({ ...prev, serviceType: selectedService }));
                    setIsAddModalOpen(true);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-sm"
                >
                  + Add {DELIVERY_TYPES.find((t) => t.value === selectedService)?.label} Card
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-500 text-[11px] uppercase font-semibold">
                    <tr>
                      <th className="py-3 px-5">Origin Zone</th>
                      <th className="py-3 px-5">Destination Zone</th>
                      <th className="py-3 px-4">Base (1KG)</th>
                      <th className="py-3 px-4">Extra / KG</th>
                      <th className="py-3 px-4">COD %</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {displayedRules.map((r, idx) => {
                      // If Express or Same Day is selected, calculate display values
                      const speedMarkup = selectedService === "EXPRESS" ? 40 : selectedService === "SAME_DAY" ? 70 : 0;
                      const effectiveBase = Number(r.baseCharge) + speedMarkup;

                      return (
                        <tr key={r.id} className="hover:bg-slate-50/60 transition">
                          <td className="py-3.5 px-5 font-semibold text-slate-800">
                            <div className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                              {formatZoneLabel(r.fromZone)}
                            </div>
                          </td>
                          <td className="py-3.5 px-5 font-semibold text-slate-700">
                            {formatZoneLabel(r.toZone)}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center">
                              <span className="text-xs font-bold text-slate-400 mr-1">৳</span>
                              <input
                                type="number"
                                value={r.baseCharge}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setRules((prev) =>
                                    prev.map((item) => (item.id === r.id ? { ...item, baseCharge: val } : item))
                                  );
                                }}
                                className="w-20 px-2 py-1 bg-slate-50/60 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                              />
                            </div>
                            {speedMarkup > 0 && (
                              <span className="text-[10px] text-blue-600 block mt-0.5 font-medium">
                                Effective: ৳{effectiveBase}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center">
                              <span className="text-xs font-bold text-slate-400 mr-1">৳</span>
                              <input
                                type="number"
                                value={r.additionalWeightCharge}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setRules((prev) =>
                                    prev.map((item) =>
                                      item.id === r.id ? { ...item, additionalWeightCharge: val } : item
                                    )
                                  );
                                }}
                                className="w-20 px-2 py-1 bg-slate-50/60 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                              />
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center">
                              <input
                                type="number"
                                step="0.5"
                                value={r.codPercentage}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setRules((prev) =>
                                    prev.map((item) =>
                                      item.id === r.id ? { ...item, codPercentage: val } : item
                                    )
                                  );
                                }}
                                className="w-16 px-2 py-1 bg-slate-50/60 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                              />
                              <span className="text-xs font-bold text-slate-400 ml-1">%</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => handleToggleActive(r, idx)}
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-flex items-center gap-1 transition ${
                                r.active
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80 hover:bg-emerald-100"
                                  : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  r.active ? "bg-emerald-500" : "bg-slate-400"
                                }`}
                              />
                              {r.active ? "Active" : "Inactive"}
                            </button>
                          </td>
                          <td className="py-3.5 px-5 text-right">
                            <button
                              onClick={() => handleUpdateRule(r)}
                              disabled={savingId === r.id}
                              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition inline-flex items-center gap-1 shadow-sm ${
                                savedId === r.id
                                  ? "bg-emerald-600 text-white"
                                  : "bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-50"
                              }`}
                            >
                              {savingId === r.id ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : savedId === r.id ? (
                                <Check className="w-3 h-3 text-white" />
                              ) : (
                                <Save className="w-3 h-3" />
                              )}
                              <span>{savingId === r.id ? "Saving..." : savedId === r.id ? "Saved" : "Save"}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="p-4 bg-slate-50/50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span>
              Rates apply dynamically across Merchant Booking Step 4 & 5, Landing Page Calculator, and live order settlements.
            </span>
          </div>
        </div>

        {/* Right Column: Pricing Simulator Card (Matching Visual Mockup) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2.5 text-slate-900 font-bold text-base mb-1">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-tight">Pricing Simulator</h3>
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-5">
              Calculate delivery charge, COD fee and total amount instantly.
            </p>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Origin District</label>
                <select
                  value={simFromDistrict}
                  onChange={(e) => {
                    const newDist = e.target.value;
                    setSimFromDistrict(newDist);
                    runSimulation(newDist, simToDistrict, simServiceType, simWeight, simCod);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  {BANGLADESH_DISTRICTS.map((d) => (
                    <option key={d.name} value={d.name}>
                      {d.name} ({formatZoneLabel(d.zoneType)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Destination District</label>
                <select
                  value={simToDistrict}
                  onChange={(e) => {
                    const newDist = e.target.value;
                    setSimToDistrict(newDist);
                    runSimulation(simFromDistrict, newDist, simServiceType, simWeight, simCod);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  {BANGLADESH_DISTRICTS.map((d) => (
                    <option key={d.name} value={d.name}>
                      {d.name} ({formatZoneLabel(d.zoneType)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Parcel Weight (KG)</label>
                <input
                  type="number"
                  step="0.5"
                  value={simWeight}
                  onChange={(e) => {
                    const newWeight = e.target.value;
                    setSimWeight(newWeight);
                    runSimulation(simFromDistrict, simToDistrict, simServiceType, newWeight, simCod);
                  }}
                  placeholder="e.g. 2.5"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">COD Collection Amount (৳)</label>
                <input
                  type="number"
                  value={simCod}
                  onChange={(e) => {
                    const newCod = e.target.value;
                    setSimCod(newCod);
                    runSimulation(simFromDistrict, simToDistrict, simServiceType, simWeight, newCod);
                  }}
                  placeholder="e.g. 2500"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Service Type</label>
                <select
                  value={simServiceType}
                  onChange={(e) => {
                    const newService = e.target.value;
                    setSimServiceType(newService);
                    runSimulation(simFromDistrict, simToDistrict, newService, simWeight, simCod);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  <option value="REGULAR">Regular Transit (Standard)</option>
                  <option value="EXPRESS">Express Next-Day (+৳40)</option>
                  <option value="SAME_DAY">Same Day Dhaka (+৳70)</option>
                </select>
              </div>

              <button
                onClick={() => runSimulation()}
                disabled={simLoading}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl transition text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5 mt-2 disabled:opacity-50"
              >
                {simLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>Calculate Price</span>
              </button>
            </div>
          </div>

          {/* Simulation Output Card (Matching the Reference Image Design) */}
          {simResult && (
            <div className="mt-5 bg-gradient-to-br from-indigo-50/70 to-blue-50/50 border border-indigo-100 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  Calculation Result
                </span>
                <span className="text-[10px] font-bold text-indigo-600 bg-white px-2 py-0.5 rounded-full border border-indigo-200/60 shadow-xs">
                  {simResult.appliedRoute || `${formatZoneLabel(simResult.fromZone)} → ${formatZoneLabel(simResult.toZone)}`}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Charge</span>
                  <span className="font-mono font-bold text-slate-900">
                    {formatCurrency(simResult.deliveryCharge || simResult.totalCharge)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>COD Fee ({simResult.breakdown?.codPercentage ?? simResult.codPercentage ?? 1}%)</span>
                  <span className="font-mono font-bold text-slate-900">
                    {formatCurrency(simResult.codFee || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Total Charge</span>
                  <span className="font-mono font-bold text-slate-900">
                    {formatCurrency((simResult.deliveryCharge || 0) + (simResult.codFee || 0))}
                  </span>
                </div>

                {/* Customer Payable Banner (Matching Mockup with Gradient Background) */}
                <div className="mt-3 pt-3 border-t border-indigo-100/80">
                  <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl p-3 text-white flex items-center justify-between shadow-sm">
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-blue-100">
                        Customer Payable
                      </div>
                      <div className="text-[10px] text-blue-200">
                        Collect From Recipient
                      </div>
                    </div>
                    <div className="text-base font-black font-mono">
                      {formatCurrency(simResult.recommendedCodAmount || (Number(simCod) + (simResult.deliveryCharge || 0) + (simResult.codFee || 0)))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Rate Card Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Add Rate Card</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Configure zone routing and delivery rates. Changes will be saved directly into Neon database.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Delivery Type</label>
                <select
                  value={newRule.serviceType}
                  onChange={(e) => setNewRule({ ...newRule, serviceType: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  {DELIVERY_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Origin Zone</label>
                <select
                  value={newRule.fromZone}
                  onChange={(e) => setNewRule({ ...newRule, fromZone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  <option value="INSIDE_DHAKA">Inside Dhaka</option>
                  <option value="DHAKA_SUBURB">Dhaka Suburbs</option>
                  <option value="OUTSIDE_DHAKA">Outside Dhaka</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Destination Zone</label>
                <select
                  value={newRule.toZone}
                  onChange={(e) => setNewRule({ ...newRule, toZone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  <option value="INSIDE_DHAKA">Inside Dhaka</option>
                  <option value="DHAKA_SUBURB">Dhaka Suburbs</option>
                  <option value="OUTSIDE_DHAKA">Outside Dhaka</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Base (1KG)</label>
                  <input
                    type="number"
                    value={newRule.baseCharge}
                    onChange={(e) => setNewRule({ ...newRule, baseCharge: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Extra / KG</label>
                  <input
                    type="number"
                    value={newRule.additionalWeightCharge}
                    onChange={(e) => setNewRule({ ...newRule, additionalWeightCharge: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">COD %</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newRule.codPercentage}
                    onChange={(e) => setNewRule({ ...newRule, codPercentage: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!newRule.serviceType) {
                      alert("Please select a delivery type.");
                      return;
                    }
                    if (isNaN(Number(newRule.baseCharge)) || Number(newRule.baseCharge) < 0) {
                      alert("Please enter a valid base charge.");
                      return;
                    }

                    try {
                      const res = await fetch("/api/admin/pricing", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          fromZone: newRule.fromZone,
                          toZone: newRule.toZone,
                          serviceType: newRule.serviceType,
                          baseCharge: Number(newRule.baseCharge),
                          additionalWeightCharge: Number(newRule.additionalWeightCharge),
                          codPercentage: Number(newRule.codPercentage),
                          active: true,
                        }),
                      });
                      const data = await res.json();
                      if (data.success) {
                        setIsAddModalOpen(false);
                        setSelectedService(newRule.serviceType as "REGULAR" | "EXPRESS" | "SAME_DAY");
                        const serviceName =
                          DELIVERY_TYPES.find((t) => t.value === newRule.serviceType)?.label ||
                          newRule.serviceType;
                        setToastMessage(`Rate card saved for ${serviceName}!`);
                        setTimeout(() => setToastMessage(null), 3500);
                        await loadRules();
                        runSimulation();
                      } else {
                        alert(data.error?.message || "Failed to save rate card");
                      }
                    } catch (err) {
                      alert("Error saving rate card");
                    }
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm"
                >
                  Save Rate Card
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
