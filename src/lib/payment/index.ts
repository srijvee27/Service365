// ==============================================================================
// Service365 - Payment Provider Factory
// Dynamically selects Mock or Production bKash Provider based on configuration
// ==============================================================================

import { PaymentProvider } from "./types";
import { MockPaymentProvider } from "./mock-provider";
import { BkashPaymentProvider } from "./bkash-provider";

let instance: PaymentProvider | null = null;

export function getPaymentProvider(): PaymentProvider {
  if (instance) return instance;

  const mode = process.env.PAYMENT_MODE?.toLowerCase() || "mock";
  const mockFlag = process.env.MOCK_BKASH === "true";
  const hasBkashCreds = Boolean(
    process.env.BKASH_APP_KEY &&
      process.env.BKASH_APP_SECRET &&
      process.env.BKASH_USERNAME &&
      process.env.BKASH_PASSWORD
  );

  // If mock mode is explicitly selected OR credentials are missing, use Mock Sandbox Provider
  if (mode === "mock" || mockFlag || !hasBkashCreds) {
    instance = new MockPaymentProvider();
  } else {
    instance = new BkashPaymentProvider();
  }

  return instance;
}

export * from "./types";
export * from "./mock-provider";
export * from "./bkash-provider";
