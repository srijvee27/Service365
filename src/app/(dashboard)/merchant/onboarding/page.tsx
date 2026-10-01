"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MerchantLayout } from "@/components/layout/MerchantLayout";
import { BANGLADESH_DISTRICTS } from "@/lib/bangladesh-data";
import { Store, Building, CreditCard, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";

export default function MerchantOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Step 1: Personal
  const [ownerName, setOwnerName] = useState("Tanvir Ahmed");
  const [ownerPhone, setOwnerPhone] = useState("01711223344");
  const [ownerEmail, setOwnerEmail] = useState("merchant@service365.demo");

  // Step 2: Business & Pickup
  const [businessName, setBusinessName] = useState("Apex Tech BD");
  const [tradeLicense, setTradeLicense] = useState("TRAD/DSCC/2026/08941");
  const [storeName, setStoreName] = useState("Apex Tech Central Warehouse");
  const [pickupDistrict, setPickupDistrict] = useState("Dhaka City");
  const [pickupArea, setPickupArea] = useState("Dhanmondi");
  const [pickupAddress, setPickupAddress] = useState("House 42, Road 9/A, Dhanmondi, Dhaka");

  // Step 3: Payment Settlement
  const [paymentOption, setPaymentOption] = useState<"BKASH" | "BANK">("BKASH");
  const [bkashNumber, setBkashNumber] = useState("01711223344");
  const [bankName, setBankName] = useState("City Bank");
  const [bankAccountName, setBankAccountName] = useState("Apex Tech BD");
  const [bankAccountNumber, setBankAccountNumber] = useState("1102938475001");
  const [bankBranch, setBankBranch] = useState("Dhanmondi Branch");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setCompleted(true);
    }, 600);
  };

  return (
    <MerchantLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Merchant Store Verification & Onboarding
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete your store profile and disbursement credentials to unlock automated next-day COD payouts
          </p>
        </div>

        {/* Stepper Tabs */}
        <div className="grid grid-cols-3 gap-3">
          <div
            className={`p-3 rounded-xl border text-center text-xs font-bold transition ${
              step === 1 ? "bg-blue-50 border-blue-500 text-blue-700" : "bg-white border-slate-200 text-slate-500"
            }`}
          >
            1. Personal Info
          </div>
          <div
            className={`p-3 rounded-xl border text-center text-xs font-bold transition ${
              step === 2 ? "bg-blue-50 border-blue-500 text-blue-700" : "bg-white border-slate-200 text-slate-500"
            }`}
          >
            2. Store & Pickup Address
          </div>
          <div
            className={`p-3 rounded-xl border text-center text-xs font-bold transition ${
              step === 3 ? "bg-blue-50 border-blue-500 text-blue-700" : "bg-white border-slate-200 text-slate-500"
            }`}
          >
            3. COD Payment Account
          </div>
        </div>

        {completed ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
            <h2 className="text-2xl font-extrabold text-slate-900">Verification Submitted!</h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Your store details and payment preferences have been verified. You can now book parcels with free doorstep pickup.
            </p>
            <button
              onClick={() => router.push("/merchant/dashboard")}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-sm"
            >
              Open Merchant Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in-50">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Store className="w-4 h-4 text-blue-600" />
                  <span>Personal Contact Information</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Owner Full Name</label>
                    <input
                      type="text"
                      required
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      required
                      value={ownerPhone}
                      onChange={(e) => setOwnerPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Official Email Address</label>
                  <input
                    type="email"
                    required
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-in fade-in-50">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Building className="w-4 h-4 text-blue-600" />
                  <span>Business Store & Default Pickup Warehouse</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Registered Business Name</label>
                    <input
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Trade License (Optional)</label>
                    <input
                      type="text"
                      value={tradeLicense}
                      onChange={(e) => setTradeLicense(e.target.value)}
                      placeholder="e.g. TRAD/DNCC/2026/0129"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Pickup District</label>
                    <select
                      value={pickupDistrict}
                      onChange={(e) => setPickupDistrict(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium"
                    >
                      {BANGLADESH_DISTRICTS.map((d) => (
                        <option key={d.name} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Pickup Thana / Area</label>
                    <input
                      type="text"
                      value={pickupArea}
                      onChange={(e) => setPickupArea(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Pickup Street Address</label>
                  <input
                    type="text"
                    required
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 animate-in fade-in-50">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>COD Settlement Payment Preference</span>
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentOption("BKASH")}
                    className={`py-3 px-4 rounded-xl border-2 text-xs font-bold text-center transition ${
                      paymentOption === "BKASH" ? "border-pink-500 bg-pink-50 text-pink-700" : "border-slate-200 text-slate-600"
                    }`}
                  >
                    bKash Merchant Wallet
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentOption("BANK")}
                    className={`py-3 px-4 rounded-xl border-2 text-xs font-bold text-center transition ${
                      paymentOption === "BANK" ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600"
                    }`}
                  >
                    Bank Account (BEFTN/NPSB)
                  </button>
                </div>

                {paymentOption === "BKASH" ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">bKash Account Number</label>
                    <input
                      type="tel"
                      required
                      value={bkashNumber}
                      onChange={(e) => setBkashNumber(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Name</label>
                        <input
                          type="text"
                          required
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Account Holder Name</label>
                        <input
                          type="text"
                          required
                          value={bankAccountName}
                          onChange={(e) => setBankAccountName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Account Number</label>
                        <input
                          type="text"
                          required
                          value={bankAccountNumber}
                          onChange={(e) => setBankAccountNumber(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Branch Name</label>
                        <input
                          type="text"
                          required
                          value={bankBranch}
                          onChange={(e) => setBankBranch(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Stepper Buttons */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 px-4 py-2.5 rounded-lg border border-slate-200"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>
              ) : <div />}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="inline-flex items-center gap-1.5 bg-blue-600 text-white font-bold text-xs px-6 py-2.5 rounded-lg shadow-sm"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded-lg shadow-sm"
                >
                  <span>{loading ? "Verifying..." : "Submit Store Verification"}</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </MerchantLayout>
  );
}
