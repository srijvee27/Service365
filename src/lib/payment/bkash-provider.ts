// ==============================================================================
// Service365 - Official bKash Tokenized Payment Gateway Provider (v1.2.0-beta)
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

interface BkashTokenGrantResponse {
  statusCode: string;
  statusMessage: string;
  id_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}

export class BkashPaymentProvider implements PaymentProvider {
  name = "bKash Official Gateway";
  isMock = false;

  private baseUrl: string;
  private appKey: string;
  private appSecret: string;
  private username: string;
  private password: string;

  private cachedToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor() {
    this.baseUrl = process.env.BKASH_BASE_URL || "https://tokenized.sandbox.bka.sh/v1.2.0-beta";
    this.appKey = process.env.BKASH_APP_KEY || "";
    this.appSecret = process.env.BKASH_APP_SECRET || "";
    this.username = process.env.BKASH_USERNAME || "";
    this.password = process.env.BKASH_PASSWORD || "";
  }

  private async getAuthToken(): Promise<string> {
    // If cached and still valid (with 60s buffer), reuse token
    if (this.cachedToken && Date.now() < this.tokenExpiresAt - 60000) {
      return this.cachedToken;
    }

    const res = await fetch(`${this.baseUrl}/tokenized/checkout/token/grant`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        username: this.username,
        password: this.password,
      },
      body: JSON.stringify({
        app_key: this.appKey,
        app_secret: this.appSecret,
      }),
    });

    if (!res.ok) {
      throw new Error(`bKash Token Grant HTTP error: ${res.status} ${res.statusText}`);
    }

    const data = (await res.json()) as BkashTokenGrantResponse;
    if (data.statusCode !== "0000" || !data.id_token) {
      throw new Error(`bKash Auth Failed: ${data.statusMessage || "Invalid credentials"}`);
    }

    this.cachedToken = data.id_token;
    this.tokenExpiresAt = Date.now() + (data.expires_in || 3600) * 1000;
    return this.cachedToken;
  }

  async createPayment(params: CreatePaymentParams): Promise<CreatePaymentResponse> {
    try {
      const token = await this.getAuthToken();
      const res = await fetch(`${this.baseUrl}/tokenized/checkout/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: token,
          "X-APP-Key": this.appKey,
        },
        body: JSON.stringify({
          mode: "0011",
          payerReference: params.customerPhone,
          callbackURL: params.callbackUrl,
          amount: params.amount.toFixed(2),
          currency: "BDT",
          intent: "sale",
          merchantInvoiceNumber: params.orderNumber,
        }),
      });

      const data = await res.json();
      if (data.statusCode !== "0000" || !data.bkashURL) {
        return {
          success: false,
          paymentId: data.paymentID || "",
          redirectUrl: "",
          errorMessage: data.statusMessage || "Failed to create bKash checkout session",
        };
      }

      return {
        success: true,
        paymentId: data.paymentID,
        redirectUrl: data.bkashURL,
        isMock: false,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown bKash error";
      return {
        success: false,
        paymentId: "",
        redirectUrl: "",
        errorMessage: msg,
      };
    }
  }

  async executePayment(paymentId: string): Promise<ExecutePaymentResponse> {
    try {
      const token = await this.getAuthToken();
      const res = await fetch(`${this.baseUrl}/tokenized/checkout/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: token,
          "X-APP-Key": this.appKey,
        },
        body: JSON.stringify({ paymentID: paymentId }),
      });

      const data = await res.json();
      if (data.statusCode !== "0000" || data.transactionStatus !== "Completed") {
        return {
          success: false,
          paymentId,
          amount: parseFloat(data.amount || "0"),
          currency: "BDT",
          status: "FAILED",
          errorMessage: data.statusMessage || "Payment execution failed",
          rawResponse: data,
        };
      }

      return {
        success: true,
        paymentId: data.paymentID,
        transactionId: data.trxID,
        amount: parseFloat(data.amount),
        currency: data.currency || "BDT",
        status: "SUCCESS",
        rawResponse: data,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "bKash payment execution error";
      return {
        success: false,
        paymentId,
        amount: 0,
        currency: "BDT",
        status: "FAILED",
        errorMessage: msg,
      };
    }
  }

  async queryPayment(paymentId: string): Promise<QueryPaymentResponse> {
    const token = await this.getAuthToken();
    const res = await fetch(`${this.baseUrl}/tokenized/checkout/payment/status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: token,
        "X-APP-Key": this.appKey,
      },
      body: JSON.stringify({ paymentID: paymentId }),
    });

    const data = await res.json();
    return {
      paymentId: data.paymentID || paymentId,
      transactionId: data.trxID,
      amount: parseFloat(data.amount || "0"),
      status: data.transactionStatus || "UNKNOWN",
      rawResponse: data,
    };
  }

  async refundPayment(params: RefundPaymentParams): Promise<RefundPaymentResponse> {
    const token = await this.getAuthToken();
    const res = await fetch(`${this.baseUrl}/tokenized/checkout/payment/refund`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: token,
        "X-APP-Key": this.appKey,
      },
      body: JSON.stringify({
        paymentID: params.paymentId,
        amount: params.amount.toFixed(2),
        trxID: params.transactionId,
        sku: "delivery_refund",
        reason: params.reason || "Order cancelled",
      }),
    });

    const data = await res.json();
    if (data.statusCode !== "0000") {
      return {
        success: false,
        amount: params.amount,
        errorMessage: data.statusMessage || "Refund failed",
      };
    }

    return {
      success: true,
      refundTrxId: data.refundTrxID,
      amount: parseFloat(data.amount),
    };
  }
}
