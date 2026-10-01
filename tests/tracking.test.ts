import { generateOrderNumber, generateTrackingId } from "../src/lib/utils";

describe("Order and Tracking ID Generators", () => {
  test("generates Order Number adhering to S365-YYYY-XXXXXX format", () => {
    const orderNumber = generateOrderNumber();
    const currentYear = new Date().getFullYear();
    const regex = new RegExp(`^S365-${currentYear}-\\d{6}$`);
    expect(orderNumber).toMatch(regex);
  });

  test("generates Tracking ID starting with S365BD followed by 8 alphanumeric chars", () => {
    const trackingId = generateTrackingId();
    expect(trackingId.startsWith("S365BD")).toBe(true);
    expect(trackingId.length).toBe(14); // "S365BD" (6) + 8 chars = 14
    expect(/^[A-Z0-9]+$/.test(trackingId)).toBe(true);
  });

  test("ensures uniqueness across consecutive generated Tracking IDs", () => {
    const set = new Set<string>();
    for (let i = 0; i < 50; i++) {
      set.add(generateTrackingId());
    }
    expect(set.size).toBe(50);
  });
});
