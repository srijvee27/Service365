import { calculateDeliveryPricing } from "../src/lib/pricing-engine";

describe("Pricing Engine", () => {
  test("calculates standard base rate inside Dhaka for <= 1kg", () => {
    const result = calculateDeliveryPricing({
      fromZone: "INSIDE_DHAKA",
      toZone: "INSIDE_DHAKA",
      weightKg: 0.8,
      serviceType: "REGULAR",
      paymentMethod: "COD",
      codAmount: 0,
    });

    expect(result.baseCharge).toBe(60);
    expect(result.weightCharge).toBe(0);
    expect(result.codFee).toBe(0);
    expect(result.totalCharge).toBe(60);
    expect(result.estimatedHours).toBe(24);
  });

  test("calculates additional weight charge for > 1kg", () => {
    const result = calculateDeliveryPricing({
      fromZone: "INSIDE_DHAKA",
      toZone: "INSIDE_DHAKA",
      weightKg: 2.4, // Extra 2kg rounded up (ceil(2.4 - 1.0) = 2kg)
      serviceType: "REGULAR",
      paymentMethod: "COD",
      codAmount: 0,
    });

    expect(result.baseCharge).toBe(60);
    expect(result.weightCharge).toBe(30); // 2 * 15 = 30
    expect(result.totalCharge).toBe(90);
  });

  test("calculates Outside Dhaka delivery with 1% COD fee", () => {
    const result = calculateDeliveryPricing({
      fromZone: "INSIDE_DHAKA",
      toZone: "OUTSIDE_DHAKA",
      weightKg: 1.0,
      serviceType: "REGULAR",
      paymentMethod: "COD",
      codAmount: 5000,
    });

    expect(result.baseCharge).toBe(130);
    expect(result.weightCharge).toBe(0);
    expect(result.codFee).toBe(50); // 1% of 5000
    expect(result.totalCharge).toBe(180);
    expect(result.estimatedHours).toBe(48);
  });

  test("calculates Express delivery markup", () => {
    const regular = calculateDeliveryPricing({
      fromZone: "INSIDE_DHAKA",
      toZone: "INSIDE_DHAKA",
      weightKg: 1.0,
      serviceType: "REGULAR",
      paymentMethod: "ONLINE",
      codAmount: 0,
    });

    const express = calculateDeliveryPricing({
      fromZone: "INSIDE_DHAKA",
      toZone: "INSIDE_DHAKA",
      weightKg: 1.0,
      serviceType: "EXPRESS",
      paymentMethod: "ONLINE",
      codAmount: 0,
    });

    expect(express.baseCharge).toBe(regular.baseCharge + 40);
    expect(express.estimatedHours).toBeLessThan(regular.estimatedHours);
  });

  test("calculates master scenario: Inside to Outside Dhaka, 2.5kg, 2500 BDT declared value with 1% COD", () => {
    const result = calculateDeliveryPricing({
      fromZone: "INSIDE_DHAKA",
      toZone: "OUTSIDE_DHAKA",
      weightKg: 2.5,
      declaredValue: 2500,
      serviceType: "REGULAR",
      paymentMethod: "COD",
      customRule: {
        baseCharge: 130,
        extraPerKg: 25,
        codPercentage: 1.0,
      },
    });

    expect(result.baseCharge).toBe(130);
    expect(result.weightCharge).toBe(50); // ceil(2.5 - 1.0) = 2kg extra * 25 = 50
    expect(result.deliveryCharge).toBe(180); // 130 + 50
    expect(result.codFee).toBe(27); // Math.round((2500 + 180) * 0.01) = 27
    expect(result.totalCharge).toBe(207); // 180 + 27
    expect(result.recommendedCodAmount).toBe(2707); // 2500 + 180 + 27
  });
});
