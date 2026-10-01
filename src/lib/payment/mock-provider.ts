// ==============================================================================
// Service365 - Mock Payment Provider (Local Sandbox Simulator)
// Simulates realistic bKash checkout flow without external gateway dependencies.
// ==============================================================================

import {
  PaymentProvider,
  CreatePaymentParams,
  CreatePaymentResponse,
  ExecutePaymentResponse,
  QueryPaymentResponse,
  RefundPaymentParams,
  RefundPaymentResponse,
} from "./types";

interface MockPaymentStoreItem {
  paymentId: string;
  orderId: string;
  orderNumber: string;
  amount: number;
  customerPhone: string;
  status: "INITIATED" | "SUCCESS" | "FAILED" | "CANCELLED";
  transactionId?: string;
  createdAt: number;
}

// In-memory simulator registry for mock payments (dev/test sandbox)
const mockPaymentStore = new Map<string, MockPaymentStoreItem>();

export class MockPaymentProvider implements PaymentProvider {
  name = "bKash (Development Sandbox Simulator)";
  isMock = true;

  async createPayment(params: CreatePaymentParams): Promise<CreatePaymentResponse> {
    const paymentId = `MOCK_BKASH_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    mockPaymentStore.set(paymentId, {
      paymentId,
      orderId: params.orderId,
      orderNumber: params.orderNumber,
      amount: params.amount,
      customerPhone: params.customerPhone,
      status: "INITIATED",
      createdAt: Date.now(),
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const redirectUrl = `${appUrl}/payment/mock-gateway?paymentId=${paymentId}&orderNumber=${encodeURIComponent(
      params.orderNumber
    )}&amount=${params.amount}&phone=${encodeURIComponent(params.customerPhone)}`;

    return {
      success: true,
      paymentId,
      redirectUrl,
      isMock: true,
    };
  }

  async executePayment(paymentId: string): Promise<ExecutePaymentResponse> {
    const record = mockPaymentStore.get(paymentId);
    if (!record) {
      return {
        success: false,
        paymentId,
        amount: 0,
        currency: "BDT",
        status: "FAILED",
        errorMessage: "Payment record not found in sandbox simulator",
      };
    }

    const transactionId = `TRX${Date.now().toString().slice(-8)}${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
    record.status = "SUCCESS";
    record.transactionId = transactionId;

    return {
      success: true,
      paymentId,
      transactionId,
      amount: record.amount,
      currency: "BDT",
      status: "SUCCESS",
      rawResponse: {
        statusCode: "0000",
        statusMessage: "Successful (Mock Gateway Sandbox)",
        paymentId,
        payerReference: record.customerPhone,
        customerMsisdn: record.customerPhone,
        trxID: transactionId,
        amount: record.amount.toFixed(2),
        transactionStatus: "Completed",
        paymentExecuteTime: new Date().toISOString(),
        currency: "BDT",
        intent: "sale",
        merchantInvoiceNumber: record.orderNumber,
      },
    };
  }

  async queryPayment(paymentId: string): Promise<QueryPaymentResponse> {
    const record = mockPaymentStore.get(paymentId);
    return {
      paymentId,
      transactionId: record?.transactionId,
      amount: record?.amount || 0,
      status: record?.status || "NOT_FOUND",
      rawResponse: record as unknown as Record<string, unknown>,
    };
  }

  async refundPayment(params: RefundPaymentParams): Promise<RefundPaymentResponse> {
    const refundTrxId = `REF_${Date.now().toString().slice(-8)}`;
    return {
      success: true,
      refundTrxId,
      amount: params.amount,
    };
  }
}
