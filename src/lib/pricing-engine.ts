// ==============================================================================
// Service365 - Server-Side Delivery Pricing Engine
// Calculates deterministic delivery charges based on zones, weight, service, and COD.
// ==============================================================================

export type ZoneType = "INSIDE_DHAKA" | "DHAKA_SUBURB" | "OUTSIDE_DHAKA";
export type ServiceType = "REGULAR" | "EXPRESS" | "SAME_DAY";
export type PaymentMethod = "COD" | "BKASH" | "ONLINE";

export interface PricingCalculationInput {
  fromZone: ZoneType;
  toZone: ZoneType;
  weightKg: number;
  serviceType: ServiceType;
  paymentMethod: PaymentMethod;
  codAmount?: number;
  declaredValue?: number;
  discountAmount?: number;
  customRule?: {
    baseCharge?: number;
    extraPerKg?: number;
    codPercentage?: number;
    taxPercentage?: number;
    estimatedHours?: number;
  };
}

export interface PricingCalculationResult {
  baseCharge: number;
  weightCharge: number;
  deliveryCharge: number;
  codFee: number;
  taxAmount: number;
  discountAmount: number;
  totalCharge: number;
  estimatedHours: number;
  recommendedCodAmount?: number;
  breakdown: {
    baseWeightThreshold: number;
    extraWeightKg: number;
    perKgRate: number;
    codPercentage: number;
    taxPercentage: number;
  };
}

/**
 * Standard rule matrix fallback if custom database pricing rules are not provided
 */
const DEFAULT_ZONE_PRICING: Record<
  string,
  { baseCharge: number; extraPerKg: number; estimatedHours: number }
> = {
  "INSIDE_DHAKA->INSIDE_DHAKA": { baseCharge: 60, extraPerKg: 15, estimatedHours: 24 },
  "INSIDE_DHAKA->DHAKA_SUBURB": { baseCharge: 100, extraPerKg: 20, estimatedHours: 36 },
  "DHAKA_SUBURB->INSIDE_DHAKA": { baseCharge: 100, extraPerKg: 20, estimatedHours: 36 },
  "DHAKA_SUBURB->DHAKA_SUBURB": { baseCharge: 110, extraPerKg: 20, estimatedHours: 36 },
  "INSIDE_DHAKA->OUTSIDE_DHAKA": { baseCharge: 130, extraPerKg: 25, estimatedHours: 48 },
  "OUTSIDE_DHAKA->INSIDE_DHAKA": { baseCharge: 130, extraPerKg: 25, estimatedHours: 48 },
  "DHAKA_SUBURB->OUTSIDE_DHAKA": { baseCharge: 140, extraPerKg: 25, estimatedHours: 48 },
  "OUTSIDE_DHAKA->DHAKA_SUBURB": { baseCharge: 140, extraPerKg: 25, estimatedHours: 48 },
  "OUTSIDE_DHAKA->OUTSIDE_DHAKA": { baseCharge: 150, extraPerKg: 25, estimatedHours: 72 },
};

/**
 * Calculates delivery fee deterministically on the server
 */
export function calculateDeliveryPricing(input: PricingCalculationInput): PricingCalculationResult {
  const {
    fromZone,
    toZone,
    weightKg,
    serviceType,
    paymentMethod,
    codAmount = 0,
    declaredValue = 0,
    discountAmount = 0,
    customRule,
  } = input;

  const key = `${fromZone}->${toZone}`;
  const defaultRule = DEFAULT_ZONE_PRICING[key] || { baseCharge: 130, extraPerKg: 25, estimatedHours: 48 };

  let baseCharge = customRule?.baseCharge !== undefined ? customRule.baseCharge : defaultRule.baseCharge;
  let estimatedHours = customRule?.estimatedHours !== undefined ? customRule.estimatedHours : defaultRule.estimatedHours;
  const extraPerKg = customRule?.extraPerKg !== undefined ? customRule.extraPerKg : defaultRule.extraPerKg;
  const configuredCodRate = customRule?.codPercentage !== undefined ? customRule.codPercentage : 1.0;

  // Service Type Adjustments
  if (serviceType === "EXPRESS") {
    baseCharge += 40;
    estimatedHours = Math.max(12, Math.floor(estimatedHours * 0.6));
  } else if (serviceType === "SAME_DAY") {
    baseCharge += 70;
    estimatedHours = 12;
  }

  // Weight Calculations (Base charge covers up to 1.0 kg)
  const baseWeightThreshold = 1.0;
  const roundedWeight = Math.max(0.1, Number(weightKg) || 0.5);
  const extraWeightKg = Math.max(0, Math.ceil(roundedWeight - baseWeightThreshold));
  const weightCharge = extraWeightKg * extraPerKg;

  // Delivery charge (base charge with speed markup + weight charge)
  const deliveryCharge = baseCharge + weightCharge;

  // Cash on Delivery (COD) Fee:
  // If codAmount > 0, calculate based on codAmount.
  // If codAmount is 0 and declaredValue > 0, calculate based on subtotal (declaredValue + deliveryCharge).
  const codPercentage = paymentMethod === "COD" ? configuredCodRate : 0.0;
  let codFee = 0;
  if (paymentMethod === "COD") {
    if (codAmount > 0) {
      codFee = Math.round((codAmount * codPercentage) / 100);
    } else if (declaredValue > 0) {
      const subtotal = declaredValue + deliveryCharge;
      codFee = Math.round((subtotal * codPercentage) / 100);
    }
  }

  // Subtotal before tax (delivery fee + COD fee)
  const subtotal = deliveryCharge + codFee;

  // Tax (0% default in BD domestic postal services or configurable)
  const taxPercentage = customRule?.taxPercentage !== undefined ? customRule.taxPercentage : 0;
  const taxAmount = Math.round((subtotal * taxPercentage) / 100);

  // Final Total Delivery Charge
  const totalCharge = Math.max(0, subtotal + taxAmount - discountAmount);

  // Recommended final amount to collect from recipient:
  // Parcel Value + Delivery Charge + COD Fee
  const recommendedCodAmount =
    paymentMethod === "COD"
      ? (declaredValue > 0 ? declaredValue + deliveryCharge + (codAmount > 0 ? codFee : Math.round(((declaredValue + deliveryCharge) * codPercentage) / 100)) : codAmount)
      : 0;

  return {
    baseCharge,
    weightCharge,
    deliveryCharge,
    codFee,
    taxAmount,
    discountAmount,
    totalCharge,
    estimatedHours,
    recommendedCodAmount,
    breakdown: {
      baseWeightThreshold,
      extraWeightKg,
      perKgRate: extraPerKg,
      codPercentage,
      taxPercentage,
    },
  };
}
