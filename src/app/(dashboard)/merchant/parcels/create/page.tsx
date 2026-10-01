"use client";

import React, { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MerchantLayout } from "@/components/layout/MerchantLayout";
import { BANGLADESH_DISTRICTS, getDistrictByName, getZoneByDistrict } from "@/lib/bangladesh-data";
import { calculateDeliveryPricing, ServiceType, PaymentMethod } from "@/lib/pricing-engine";
import { formatCurrency, getTodayBangladeshDate } from "@/lib/utils";
import {
  Package,
  MapPin,
  Truck,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  FileText,
  Printer,
  Search,
} from "lucide-react";
import Link from "next/link";

function CreateParcelContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Wizard step state
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<any | null>(null);

  // Form states initialized with reasonable defaults
  const [orderDate, setOrderDate] = useState(getTodayBangladeshDate());
  const [senderName, setSenderName] = useState("Apex Tech BD");
  const [senderPhone, setSenderPhone] = useState("01711223344");
  const [senderDistrict, setSenderDistrict] = useState(searchParams.get("from") || "Dhaka City");
  const [senderArea, setSenderArea] = useState("Dhanmondi");
  const [senderAddress, setSenderAddress] = useState("House 42, Road 9/A, Dhanmondi, Dhaka");
  const [pickupInstructions, setPickupInstructions] = useState("");

  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [receiverDistrict, setReceiverDistrict] = useState(searchParams.get("to") || "Chattogram");
  const [receiverArea, setReceiverArea] = useState("Agrabad");
  const [receiverAddress, setReceiverAddress] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");

  const [productType, setProductType] = useState("ELECTRONICS");
  const [productDescription, setProductDescription] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [weight, setWeight] = useState(parseFloat(searchParams.get("weight") || "1"));
  const [declaredValue, setDeclaredValue] = useState(2500);

  const [serviceType, setServiceType] = useState<ServiceType>((searchParams.get("service") as ServiceType) || "REGULAR");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>((searchParams.get("method") as PaymentMethod) || "COD");
  const [codAmount, setCodAmount] = useState(parseFloat(searchParams.get("cod") || "2500"));

  // Dynamic thana list for receiver district
  const receiverDistrictData = useMemo(() => getDistrictByName(receiverDistrict), [receiverDistrict]);
  const senderDistrictData = useMemo(() => getDistrictByName(senderDistrict), [senderDistrict]);

  // Pricing calculation
  const fromZone = useMemo(() => getZoneByDistrict(senderDistrict), [senderDistrict]);
  const toZone = useMemo(() => getZoneByDistrict(receiverDistrict), [receiverDistrict]);

  const pricing = useMemo(() => {
    return calculateDeliveryPricing({
      fromZone,
      toZone,
      weightKg: weight,
      serviceType,
      paymentMethod,
      codAmount: paymentMethod === "COD" ? codAmount : 0,
    });
  }, [fromZone, toZone, weight, serviceType, paymentMethod, codAmount]);

  const handleNext = () => {
    setError(null);
    if (currentStep === 1) {
      if (!orderDate) {
        setError("Please specify an Order Date");
        return;
      }
      if (!senderName || !senderPhone || !senderAddress) {
        setError("Please complete all sender pickup details");
        return;
      }
    } else if (currentStep === 2) {
      if (!receiverName || !receiverPhone || !receiverAddress) {
        setError("Please complete all receiver delivery details");
        return;
      }
    }
    setCurrentStep((prev) => Math.min(6, prev + 1));
  };

  const handleBack = () => {
    setError(null);
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleBookParcel = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderDate,
          senderName,
          senderPhone,
          senderDistrict,
          senderArea,
          senderAddress,
          pickupInstructions,
          receiverName,
          receiverPhone,
          receiverDistrict,
          receiverArea,
          receiverAddress,
          deliveryInstructions,
          productType,
          productDescription,
          quantity,
          weight,
          declaredValue,
          serviceType,
          paymentMethod,
          codAmount: paymentMethod === "COD" ? codAmount : 0,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error?.message || "Failed to book parcel");
        return;
      }

      setConfirmedOrder(json.data);

      // If online bKash was chosen, trigger bKash payment gateway
      if (paymentMethod === "BKASH") {
        const payRes = await fetch("/api/payments/bkash/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: json.data.id,
            amount: json.data.totalCharge,
            customerPhone: receiverPhone,
          }),
        });
        const payJson = await payRes.json();
        if (payJson.success && payJson.redirectUrl) {
          window.location.href = payJson.redirectUrl;
          return;
        }
      }
    } catch {
      setError("Network error booking parcel. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { num: 1, label: "Pickup Address" },
    { num: 2, label: "Receiver Info" },
    { num: 3, label: "Parcel Specs" },
    { num: 4, label: "Service Speed" },
    { num: 5, label: "Payment Mode" },
    { num: 6, label: "Confirmation" },
  ];

  return (
    <MerchantLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Book a New Consignment
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Doorstep parcel creation across 64 Bangladesh districts with instant shipping label generation
          </p>
        </div>

        {/* Wizard Step Progress Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="grid grid-cols-6 gap-2">
            {steps.map((s) => (
              <div key={s.num} className="text-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto text-xs font-bold transition ${
                    confirmedOrder || currentStep > s.num
                      ? "bg-emerald-500 text-white"
                      : currentStep === s.num
                      ? "bg-blue-600 text-white ring-4 ring-blue-100"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {confirmedOrder || currentStep > s.num ? "✓" : s.num}
                </div>
                <span className="text-[10px] font-semibold text-slate-600 block mt-1.5 truncate hidden sm:block">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Confirmation Modal if Booked */}
        {confirmedOrder ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                Booking Confirmed
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 pt-2">
                Your Consignment is Scheduled!
              </h2>
              <p className="text-xs text-slate-500">
                A rider will be dispatched to your pickup address. Printable label has been generated.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left text-xs">
              <div>
                <span className="text-slate-400 block font-semibold">Tracking ID</span>
                <span className="text-base font-mono font-bold text-blue-600">{confirmedOrder.trackingId}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Order Number</span>
                <span className="text-sm font-mono font-bold text-slate-800">{confirmedOrder.orderNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Delivery Charge</span>
                <span className="text-sm font-bold text-slate-800">{formatCurrency(confirmedOrder.totalCharge)}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">COD Amount</span>
                <span className="text-sm font-bold text-emerald-600">
                  {confirmedOrder.paymentMethod === "COD" ? formatCurrency(confirmedOrder.codAmount) : "Prepaid"}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link
                href={`/print/label/${confirmedOrder.orderNumber}`}
                target="_blank"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-sm transition"
              >
                <Printer className="w-4 h-4" />
                <span>Print 4x6 Thermal Label</span>
              </Link>

              <Link
                href={`/track/${confirmedOrder.trackingId}`}
                target="_blank"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition"
              >
                <Search className="w-4 h-4" />
                <span>Track Live</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  setConfirmedOrder(null);
                  setCurrentStep(1);
                  setReceiverName("");
                  setReceiverPhone("");
                  setReceiverAddress("");
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm px-6 py-3 rounded-xl transition"
              >
                <span>Book Another Parcel</span>
              </button>
            </div>
          </div>
        ) : (
          /* Form Content Wizard */
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* STEP 1: SENDER PICKUP */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-in fade-in-50 duration-150">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>Step 1: Sender Pickup Information</span>
                </h3>

                <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Order Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                    className="w-full sm:w-64 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Official booking date for this parcel (Default: Today in Asia/Dhaka).
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Store / Sender Name</label>
                    <input
                      type="text"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Pickup Contact Phone</label>
                    <input
                      type="tel"
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Pickup District</label>
                    <select
                      value={senderDistrict}
                      onChange={(e) => setSenderDistrict(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium"
                    >
                      {BANGLADESH_DISTRICTS.map((d) => (
                        <option key={d.name} value={d.name}>
                          {d.name} ({d.division})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Pickup Thana / Area</label>
                    <select
                      value={senderArea}
                      onChange={(e) => setSenderArea(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium"
                    >
                      {senderDistrictData?.areas.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Pickup Address</label>
                  <input
                    type="text"
                    value={senderAddress}
                    onChange={(e) => setSenderAddress(e.target.value)}
                    placeholder="House, Road, Block, Sector"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Pickup Instructions (Optional)</label>
                  <input
                    type="text"
                    value={pickupInstructions}
                    onChange={(e) => setPickupInstructions(e.target.value)}
                    placeholder="e.g. Ring warehouse bell on 2nd floor"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
            )}

            {/* STEP 2: RECEIVER DESTINATION */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-in fade-in-50 duration-150">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>Step 2: Recipient Delivery Destination</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Customer / Recipient Name</label>
                    <input
                      type="text"
                      required
                      value={receiverName}
                      onChange={(e) => setReceiverName(e.target.value)}
                      placeholder="e.g. Asif Mahmud"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Mobile Phone</label>
                    <input
                      type="tel"
                      required
                      value={receiverPhone}
                      onChange={(e) => setReceiverPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Destination District</label>
                    <select
                      value={receiverDistrict}
                      onChange={(e) => setReceiverDistrict(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium"
                    >
                      {BANGLADESH_DISTRICTS.map((d) => (
                        <option key={d.name} value={d.name}>
                          {d.name} ({d.division})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Delivery Area / Thana</label>
                    <select
                      value={receiverArea}
                      onChange={(e) => setReceiverArea(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium"
                    >
                      {receiverDistrictData?.areas.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Delivery Address</label>
                  <input
                    type="text"
                    required
                    value={receiverAddress}
                    onChange={(e) => setReceiverAddress(e.target.value)}
                    placeholder="Apartment, Holding, Road, Landmark"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Delivery Instructions (Optional)</label>
                  <input
                    type="text"
                    value={deliveryInstructions}
                    onChange={(e) => setDeliveryInstructions(e.target.value)}
                    placeholder="e.g. Call before delivery, deliver after 2 PM"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
            )}

            {/* STEP 3: PARCEL SPECS */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-in fade-in-50 duration-150">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-600" />
                  <span>Step 3: Parcel Weight & Product Specifications</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Product Category</label>
                    <select
                      value={productType}
                      onChange={(e) => setProductType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="GENERAL">General Goods</option>
                      <option value="ELECTRONICS">Electronics & Gadgets</option>
                      <option value="APPAREL">Apparel & Fashion</option>
                      <option value="COSMETICS">Cosmetics & Health</option>
                      <option value="DOCUMENTS">Documents & Parcels</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Weight in Kg (Current: {weight} kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="50"
                      value={weight}
                      onChange={(e) => setWeight(parseFloat(e.target.value) || 1)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Declared Value (৳ BDT)</label>
                    <input
                      type="number"
                      min="0"
                      value={declaredValue}
                      onChange={(e) => setDeclaredValue(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Product Description / Notes</label>
                  <input
                    type="text"
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    placeholder="e.g. Wireless Ergonomic Mouse - Black"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
            )}

            {/* STEP 4: SERVICE SPEED */}
            {currentStep === 4 && (
              <div className="space-y-4 animate-in fade-in-50 duration-150">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-purple-600" />
                  <span>Step 4: Choose Delivery Speed</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div
                    onClick={() => setServiceType("REGULAR")}
                    className={`cursor-pointer p-5 rounded-2xl border-2 transition ${
                      serviceType === "REGULAR" ? "border-blue-600 bg-blue-50/50" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <h4 className="font-bold text-slate-900 text-sm">Regular Transit</h4>
                    <p className="text-xs text-slate-500 mt-1">24-72 Hours Delivery</p>
                    <span className="text-sm font-extrabold text-blue-600 mt-3 block">
                      Standard Rates
                    </span>
                  </div>

                  <div
                    onClick={() => setServiceType("EXPRESS")}
                    className={`cursor-pointer p-5 rounded-2xl border-2 transition ${
                      serviceType === "EXPRESS" ? "border-blue-600 bg-blue-50/50" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <h4 className="font-bold text-slate-900 text-sm">⚡ Express Next-Day</h4>
                    <p className="text-xs text-slate-500 mt-1">Guaranteed Priority Transit</p>
                    <span className="text-sm font-extrabold text-blue-600 mt-3 block">
                      +৳40 Surcharge
                    </span>
                  </div>

                  <div
                    onClick={() => {
                      if (fromZone === "INSIDE_DHAKA" && toZone === "INSIDE_DHAKA") {
                        setServiceType("SAME_DAY");
                      }
                    }}
                    className={`p-5 rounded-2xl border-2 transition ${
                      fromZone !== "INSIDE_DHAKA" || toZone !== "INSIDE_DHAKA"
                        ? "opacity-40 cursor-not-allowed border-slate-200 bg-slate-50"
                        : serviceType === "SAME_DAY"
                        ? "cursor-pointer border-blue-600 bg-blue-50/50"
                        : "cursor-pointer border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <h4 className="font-bold text-slate-900 text-sm">🚀 Same Day Dhaka</h4>
                    <p className="text-xs text-slate-500 mt-1">Within 6-8 Hours</p>
                    <span className="text-sm font-extrabold text-blue-600 mt-3 block">
                      ৳120 Flat (1kg)
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: PAYMENT MODE & COD */}
            {currentStep === 5 && (
              <div className="space-y-4 animate-in fade-in-50 duration-150">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>Step 5: Payment & COD Configuration</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div
                    onClick={() => setPaymentMethod("COD")}
                    className={`cursor-pointer p-5 rounded-2xl border-2 transition ${
                      paymentMethod === "COD" ? "border-emerald-500 bg-emerald-50/50" : "border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-sm">Cash on Delivery (COD)</h4>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        1% Fee
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Our rider collects cash at the buyer's doorstep and disburses it to your wallet.
                    </p>
                  </div>

                  <div
                    onClick={() => setPaymentMethod("BKASH")}
                    className={`cursor-pointer p-5 rounded-2xl border-2 transition ${
                      paymentMethod === "BKASH" ? "border-pink-500 bg-pink-50/50" : "border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-sm">bKash Prepaid Online</h4>
                      <span className="text-xs font-bold text-pink-700 bg-pink-100 px-2 py-0.5 rounded">
                        0% COD Fee
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Pay delivery fee online directly through official bKash Tokenized Checkout.
                    </p>
                  </div>
                </div>

                {paymentMethod === "COD" && (
                  <div className="bg-emerald-50/70 p-5 rounded-2xl border border-emerald-200 space-y-2">
                    <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wide">
                      Cash Amount to Collect from Recipient (৳ BDT)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={codAmount}
                      onChange={(e) => setCodAmount(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-emerald-300 rounded-lg px-4 py-2.5 text-lg font-bold text-emerald-800"
                    />
                    <p className="text-[11px] text-emerald-700">
                      COD Fee: 1% ({formatCurrency(pricing.codFee)}) will be deducted upon settlement.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* STEP 6: REVIEW BREAKDOWN */}
            {currentStep === 6 && (
              <div className="space-y-6 animate-in fade-in-50 duration-150">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Step 6: Review Consignment Details & Confirm</span>
                </h3>

                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold uppercase block mb-1">Pickup (Origin)</span>
                    <p className="font-bold text-slate-800 text-sm">{senderName}</p>
                    <p className="text-slate-600">{senderPhone}</p>
                    <p className="text-slate-600">{senderAddress}, {senderArea}, {senderDistrict}</p>
                  </div>

                  <div>
                    <span className="text-slate-400 font-bold uppercase block mb-1">Delivery (Destination)</span>
                    <p className="font-bold text-slate-800 text-sm">{receiverName}</p>
                    <p className="text-slate-600">{receiverPhone}</p>
                    <p className="text-slate-600">{receiverAddress}, {receiverArea}, {receiverDistrict}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <span className="font-semibold text-slate-600">Order Booking Date:</span>
                  <span className="font-bold text-blue-700 font-mono">{orderDate}</span>
                </div>

                {/* Final Price Breakdown */}
                <div className="bg-blue-50/60 rounded-2xl p-6 border border-blue-100 space-y-3">
                  <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                    Official Delivery Charge Breakdown (Server Calculated)
                  </h4>
                  <div className="space-y-1.5 text-xs text-slate-700">
                    <div className="flex justify-between">
                      <span>Base Delivery Charge (1 kg):</span>
                      <strong className="text-slate-900">{formatCurrency(pricing.baseCharge)}</strong>
                    </div>
                    {pricing.weightCharge > 0 && (
                      <div className="flex justify-between">
                        <span>Extra Weight ({pricing.breakdown.extraWeightKg} kg):</span>
                        <strong className="text-slate-900">{formatCurrency(pricing.weightCharge)}</strong>
                      </div>
                    )}
                    {pricing.codFee > 0 && (
                      <div className="flex justify-between">
                        <span>COD Collection Fee (1%):</span>
                        <strong className="text-slate-900">{formatCurrency(pricing.codFee)}</strong>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-blue-200 text-base font-extrabold text-blue-700">
                      <span>Total Delivery Fee:</span>
                      <span>{formatCurrency(pricing.totalCharge)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 px-4 py-2.5 rounded-lg border border-slate-200 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>
              ) : <div />}

              {currentStep < 6 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-2.5 rounded-lg shadow-sm transition"
                >
                  <span>Continue to Step {currentStep + 1}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleBookParcel}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-8 py-3 rounded-xl shadow-md transition transform active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{submitting ? "Booking Consignment..." : "Confirm & Book Consignment"}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </MerchantLayout>
  );
}

export default function CreateParcelPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      }
    >
      <CreateParcelContent />
    </React.Suspense>
  );
}

