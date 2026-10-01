// ==============================================================================
// Service365 - Payment Provider Types & Interfaces
// ==============================================================================

export interface CreatePaymentParams {
  orderId: string;
  orderNumber: string;
  amount: number;
  customerPhone: string;
  callbackUrl: string;
  payerReference?: string;
}

export interface CreatePaymentResponse {
  success: boolean;
  paymentId: string;
  redirectUrl: string;
  errorMessage?: string;
  isMock?: boolean;
}

export interface ExecutePaymentResponse {
  success: boolean;
  paymentId: string;
  transactionId?: string;
  amount: number;
  currency: string;
  status: "SUCCESS" | "FAILED" | "CANCELLED";
  rawResponse?: Record<string, unknown>;
  errorMessage?: string;
}

export interface QueryPaymentResponse {
  paymentId: string;
  transactionId?: string;
  amount: number;
  status: string;
  rawResponse?: Record<string, unknown>;
}

export interface RefundPaymentParams {
  paymentId: string;
  amount: number;
  transactionId: string;
  reason?: string;
}

export interface RefundPaymentResponse {
  success: boolean;
  refundTrxId?: string;
  amount: number;
  errorMessage?: string;
}

export interface PaymentProvider {
  name: string;
  isMock: boolean;
  createPayment(params: CreatePaymentParams): Promise<CreatePaymentResponse>;
  executePayment(paymentId: string): Promise<ExecutePaymentResponse>;
  queryPayment(paymentId: string): Promise<QueryPaymentResponse>;
  refundPayment(params: RefundPaymentParams): Promise<RefundPaymentResponse>;
}
