"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Service365Logo } from "@/components/branding/Service365Logo";
import { ArrowRight, AlertCircle, Truck, CheckCircle, ShieldCheck, Loader2, ExternalLink } from "lucide-react";

export default function RiderRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    nidNumber: "",
    vehicleType: "BIKE",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  // Shufti NID Verification State
  const [verifyingNid, setVerifyingNid] = useState(false);
  const [nidVerified, setNidVerified] = useState(false);
  const [nidReference, setNidReference] = useState("");
  const [nidVerifyError, setNidVerifyError] = useState<string | null>(null);
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null);

  const handleVerifyNid = async () => {
    setNidVerifyError(null);
    setError(null);

    if (!formData.name.trim()) {
      setNidVerifyError("Please enter your Full Name as shown on NID first.");
      return;
    }
    if (!formData.phone.trim()) {
      setNidVerifyError("Please enter your Bangladesh Mobile Number first.");
      return;
    }
    if (!formData.email.trim()) {
      setNidVerifyError("Please enter your Email Address first.");
      return;
    }
    if (!formData.nidNumber || !/^(\d{10}|\d{13}|\d{17})$/.test(formData.nidNumber.trim())) {
      setNidVerifyError("Please enter a valid 10, 13, or 17 digit Bangladesh NID number.");
      return;
    }

    setVerifyingNid(true);
    try {
      const res = await fetch("/api/rider/nid-verification/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          nidNumber: formData.nidNumber,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.verificationUrl) {
        setNidVerifyError(data.error?.message || "Failed to start NID verification.");
        setVerifyingNid(false);
        return;
      }

      setNidReference(data.reference);
      setVerificationUrl(data.verificationUrl);

      // Open Shufti Pro in a dedicated popup window
      const popup = window.open(
        data.verificationUrl,
        "shufti_verification",
        "width=850,height=750,scrollbars=yes,status=1"
      );

      // Poll backend verification status
      const pollTimer = setInterval(async () => {
        try {
          const checkRes = await fetch(`/api/rider/nid-verification/status?reference=${data.reference}`);
          const checkData = await checkRes.json();
          if (checkData.success && checkData.verified) {
            clearInterval(pollTimer);
            setNidVerified(true);
            setVerifyingNid(false);
            setVerificationUrl(null);
            setNidVerifyError(null);
            if (popup && !popup.closed) {
              popup.close();
            }
          } else if (checkData.status === "FAILED") {
            clearInterval(pollTimer);
            setVerifyingNid(false);
            setNidVerified(false);
            setNidVerifyError(checkData.message || "NID verification declined. Please try again.");
          }
        } catch {
          // Ignore transient polling network errors
        }
      }, 2500);

      // Auto clear after 5 mins
      setTimeout(() => {
        clearInterval(pollTimer);
        setVerifyingNid(false);
      }, 300000);
    } catch {
      setNidVerifyError("Connection error while connecting to verification service.");
      setVerifyingNid(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nidVerified || !nidReference) {
      setError("NID verification is required before completing registration.");
      return;
    }

    if (!formData.nidNumber || !/^(\d{10}|\d{13}|\d{17})$/.test(formData.nidNumber.trim())) {
      setError("Please enter a valid Bangladesh NID number (10 digits Smart Card, 13 digits, or 17 digits).");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          nidNumber: formData.nidNumber,
          vehicleType: formData.vehicleType,
          password: formData.password,
          role: "RIDER",
          nidReference,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error?.message || "Registration failed");
        return;
      }

      setSuccessInfo(
        data.message || "Rider application registered successfully! Pending admin approval. Redirecting to sign in..."
      );
      setTimeout(() => {
        router.push("/login");
      }, 2500);
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-block hover:opacity-95 transition">
          <Service365Logo size="lg" />
        </Link>
        <div className="mt-3 inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200">
          <Truck className="w-3.5 h-3.5" />
          <span>Delivery Fleet Signup</span>
        </div>
        <h2 className="mt-2 text-2xl font-extrabold text-slate-900 tracking-tight">
          Register as Delivery Rider
        </h2>
        <p className="mt-2 text-xs text-slate-500">
          Deliver parcel orders, manage delivery runs, and earn with Service365
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 sm:rounded-2xl border border-slate-200">
          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successInfo && (
            <div className="mb-5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2">
              <Truck className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successInfo}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your name exactly as shown on your NID"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bangladesh Mobile Number</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="018XXXXXXXX or +88018XXXXXXXX"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">NID Number (National ID)</label>
                <input
                  type="text"
                  required
                  value={formData.nidNumber}
                  onChange={(e) => {
                    setFormData({ ...formData, nidNumber: e.target.value.replace(/\D/g, "") });
                    if (nidVerified) {
                      setNidVerified(false);
                      setNidReference("");
                    }
                  }}
                  placeholder="10, 13, or 17 digit Bangladesh NID"
                  maxLength={17}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />

                {/* Verify NID Action Immediately Below NID Number */}
                <div className="mt-2 space-y-1.5">
                  <button
                    type="button"
                    onClick={handleVerifyNid}
                    disabled={verifyingNid || nidVerified}
                    className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      nidVerified
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default"
                        : verifyingNid
                        ? "bg-slate-100 text-slate-600 border border-slate-300 cursor-wait"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                    }`}
                  >
                    {nidVerified ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span>NID Verified ✓</span>
                      </>
                    ) : verifyingNid ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-slate-600 shrink-0" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 shrink-0" />
                        <span>Verify NID</span>
                      </>
                    )}
                  </button>

                  {nidVerifyError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{nidVerifyError}</span>
                    </div>
                  )}

                  {verifyingNid && verificationUrl && (
                    <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-[11px] text-slate-600 space-y-1">
                      <p className="font-semibold text-slate-800">Shufti Pro verification session active.</p>
                      <p>Complete identity document verification in the opened window. Status will update automatically.</p>
                      <a
                        href={verificationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-700 font-bold hover:underline inline-flex items-center gap-1 mt-0.5"
                      >
                        <span>Re-open verification window</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="rider@example.com"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle Type</label>
              <select
                value={formData.vehicleType}
                onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              >
                <option value="BIKE">Motorcycle / Bike</option>
                <option value="CYCLE">Bicycle</option>
                <option value="VAN">Delivery Van</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm py-3 px-4 rounded-lg shadow-sm transition flex items-center justify-center gap-2"
            >
              <span>{loading ? "Creating Account..." : "Create Account"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500 space-y-1">
            <p>
              Already have an account?{" "}
              <Link href="/login" className="font-bold text-blue-600 hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
