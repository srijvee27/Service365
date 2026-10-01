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
  discountAmount?: number;
}

export interface PricingCalculationResult {
  baseCharge: number;
  weightCharge: number;
  codFee: number;
  taxAmount: number;
  discountAmount: number;
  totalCharge: number;
  estimatedHours: number;
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
  const { fromZone, toZone, weightKg, serviceType, paymentMethod, codAmount = 0, discountAmount = 0 } = input;

  const key = `${fromZone}->${toZone}`;
  const defaultRule = DEFAULT_ZONE_PRICING[key] || { baseCharge: 130, extraPerKg: 25, estimatedHours: 48 };

  let baseCharge = defaultRule.baseCharge;
  let estimatedHours = defaultRule.estimatedHours;

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
  const weightCharge = extraWeightKg * defaultRule.extraPerKg;

  // Cash on Delivery (COD) Fee: 1% of COD collection amount (min 0)
  const codPercentage = paymentMethod === "COD" ? 1.0 : 0.0;
  const codFee = paymentMethod === "COD" && codAmount > 0 ? Math.round((codAmount * codPercentage) / 100) : 0;

  // Subtotal before tax
  const subtotal = baseCharge + weightCharge + codFee;

  // Tax (0% default in BD domestic postal services or configurable)
  const taxPercentage = 0;
  const taxAmount = Math.round((subtotal * taxPercentage) / 100);

  // Final Total
  const totalCharge = Math.max(0, subtotal + taxAmount - discountAmount);

  return {
    baseCharge,
    weightCharge,
    codFee,
    taxAmount,
    discountAmount,
    totalCharge,
    estimatedHours,
    breakdown: {
      baseWeightThreshold,
      extraWeightKg,
      perKgRate: defaultRule.extraPerKg,
      codPercentage,
      taxPercentage,
    },
  };
}
