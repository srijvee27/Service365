"use client";

import React, { useState, useMemo } from "react";
import { BANGLADESH_DISTRICTS, getZoneByDistrict } from "@/lib/bangladesh-data";
import { calculateDeliveryPricing, ServiceType, PaymentMethod } from "@/lib/pricing-engine";
import { formatCurrency } from "@/lib/utils";
import { Calculator, ArrowRight, Clock, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";

export function DeliveryCalculator() {
  const [pickupDistrict, setPickupDistrict] = useState("Dhaka City");
  const [deliveryDistrict, setDeliveryDistrict] = useState("Chattogram");
  const [weight, setWeight] = useState(1);
  const [serviceType, setServiceType] = useState<ServiceType>("REGULAR");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [codAmount, setCodAmount] = useState(1500);

  const pickupZone = useMemo(() => getZoneByDistrict(pickupDistrict), [pickupDistrict]);
  const deliveryZone = useMemo(() => getZoneByDistrict(deliveryDistrict), [deliveryDistrict]);

  const pricing = useMemo(() => {
    return calculateDeliveryPricing({
      fromZone: pickupZone,
      toZone: deliveryZone,
      weightKg: weight,
      serviceType,
      paymentMethod,
      codAmount: paymentMethod === "COD" ? codAmount : 0,
    });
  }, [pickupZone, deliveryZone, weight, serviceType, paymentMethod, codAmount]);

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200 overflow-hidden">
      {/* Card Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur flex items-center justify-center">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Delivery Rate Calculator</h3>
            <p className="text-xs text-blue-100">Live dynamic pricing across all 64 districts</p>
          </div>
        </div>
        <span className="text-[11px] font-semibold bg-white/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
          Instant Estimate
        </span>
      </div>

      <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Form Column */}
        <div className="lg:col-span-7 space-y-5">
          {/* Pickup and Delivery Districts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                Pickup District
              </label>
              <select
                value={pickupDistrict}
                onChange={(e) => setPickupDistrict(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              >
                {BANGLADESH_DISTRICTS.map((d) => (
                  <option key={d.name} value={d.name}>
                    {d.name} ({d.division})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                Delivery District
              </label>
              <select
                value={deliveryDistrict}
                onChange={(e) => setDeliveryDistrict(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              >
                {BANGLADESH_DISTRICTS.map((d) => (
                  <option key={d.name} value={d.name}>
                    {d.name} ({d.division})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Weight Selection Slider & Value */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                Parcel Weight: <span className="text-blue-600 font-bold text-sm">{weight} kg</span>
              </label>
              <span className="text-xs text-slate-400">Up to 20 kg</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="20"
              step="0.5"
              value={weight}
              onChange={(e) => setWeight(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>0.5 kg</span>
              <span>5 kg</span>
              <span>10 kg</span>
              <span>20 kg</span>
            </div>
          </div>

          {/* Service Speed Toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">
              Service Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setServiceType("REGULAR")}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border transition text-center ${
                  serviceType === "REGULAR"
                    ? "bg-blue-50 border-blue-600 text-blue-700 shadow-sm"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                Regular
              </button>
              <button
                type="button"
                onClick={() => setServiceType("EXPRESS")}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border transition text-center ${
                  serviceType === "EXPRESS"
                    ? "bg-blue-50 border-blue-600 text-blue-700 shadow-sm"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                ⚡ Express
              </button>
              <button
                type="button"
                onClick={() => setServiceType("SAME_DAY")}
                disabled={pickupZone !== "INSIDE_DHAKA" || deliveryZone !== "INSIDE_DHAKA"}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border transition text-center ${
                  pickupZone !== "INSIDE_DHAKA" || deliveryZone !== "INSIDE_DHAKA"
                    ? "opacity-40 cursor-not-allowed bg-slate-100 text-slate-400"
                    : serviceType === "SAME_DAY"
                    ? "bg-blue-50 border-blue-600 text-blue-700 shadow-sm"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
                title={
                  pickupZone !== "INSIDE_DHAKA" || deliveryZone !== "INSIDE_DHAKA"
                    ? "Same day delivery is only available within Dhaka City"
                    : ""
                }
              >
                🚀 Same Day
              </button>
            </div>
          </div>

          {/* Payment Method & COD Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                Payment Method
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("COD")}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg border text-center transition ${
                    paymentMethod === "COD"
                      ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                      : "border-slate-200 text-slate-600"
                  }`}
                >
                  Cash on Delivery
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("BKASH")}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg border text-center transition ${
                    paymentMethod === "BKASH"
                      ? "bg-pink-50 border-pink-500 text-pink-700"
                      : "border-slate-200 text-slate-600"
                  }`}
                >
                  bKash Prepaid
                </button>
              </div>
            </div>

            {paymentMethod === "COD" && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                  COD Amount to Collect (৳)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100000"
                  value={codAmount}
                  onChange={(e) => setCodAmount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>
            )}
          </div>
        </div>

        {/* Calculation Result Summary Column */}
        <div className="lg:col-span-5 bg-slate-50 rounded-xl p-6 border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Estimated Total</span>
              <span className="text-3xl font-extrabold text-blue-600 tracking-tight">
                {formatCurrency(pricing.totalCharge)}
              </span>
            </div>

            {/* Breakdown List */}
            <div className="space-y-2.5 py-4 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Base Charge (First 1 kg)</span>
                <span className="font-semibold text-slate-800">{formatCurrency(pricing.baseCharge)}</span>
              </div>
              {pricing.weightCharge > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Additional Weight ({pricing.breakdown.extraWeightKg} kg × ৳{pricing.breakdown.perKgRate})</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(pricing.weightCharge)}</span>
                </div>
              )}
              {pricing.codFee > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>COD Collection Fee ({pricing.breakdown.codPercentage}%)</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(pricing.codFee)}</span>
                </div>
              )}
              <div className="flex justify-between text-emerald-600 font-medium pt-1 border-t border-slate-200">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Estimated Delivery Time
                </span>
                <span>~{pricing.estimatedHours} Hours</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-200">
            <Link
              href={`/merchant/parcels/create?from=${encodeURIComponent(pickupDistrict)}&to=${encodeURIComponent(
                deliveryDistrict
              )}&weight=${weight}&service=${serviceType}&cod=${codAmount}&method=${paymentMethod}`}
              className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-3 px-4 rounded-lg shadow-sm shadow-blue-500/20 hover:shadow-blue-500/30 transition transform active:scale-95"
            >
              <span>Book Parcel Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-[11px] text-center text-slate-400">
              Free doorstep pickup for registered merchants • 24/7 parcel tracking
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeliveryCalculator;
