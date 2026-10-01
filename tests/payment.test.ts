import { MockPaymentProvider } from "../src/lib/payment/mock-provider";

describe("Payment Provider Abstraction", () => {
  const provider = new MockPaymentProvider();

  test("initializes mock provider with sandbox credentials", () => {
    expect(provider.isMock).toBe(true);
    expect(provider.name).toContain("Sandbox");
  });

  test("creates payment session and returns redirect URL", async () => {
    const res = await provider.createPayment({
      orderId: "ord_test_123",
      orderNumber: "S365-2026-999888",
      amount: 1250,
      customerPhone: "+8801711223344",
      callbackUrl: "http://localhost:3000/api/payments/bkash/callback",
    });

    expect(res.success).toBe(true);
    expect(res.paymentId).toBeDefined();
    expect(res.paymentId.startsWith("MOCK_BKASH_")).toBe(true);
    expect(res.redirectUrl).toContain("mock-gateway");
  });

  test("executes payment and generates verifiable transaction ID", async () => {
    const initRes = await provider.createPayment({
      orderId: "ord_test_456",
      orderNumber: "S365-2026-777666",
      amount: 3400,
      customerPhone: "+8801899112233",
      callbackUrl: "http://localhost:3000/api/payments/bkash/callback",
    });

    const execRes = await provider.executePayment(initRes.paymentId);
    expect(execRes.success).toBe(true);
    expect(execRes.status).toBe("SUCCESS");
    expect(execRes.transactionId).toBeDefined();
    expect(execRes.amount).toBe(3400);

    const queryRes = await provider.queryPayment(initRes.paymentId);
    expect(queryRes.status).toBe("SUCCESS");
    expect(queryRes.transactionId).toBe(execRes.transactionId);
  });
});
