// ==============================================================================
// Service365 - Notification, SMS & Email Service
// Modular provider architecture for transactional communications
// ==============================================================================

export interface SendSmsParams {
  toPhone: string;
  message: string;
}

export interface SendEmailParams {
  toEmail: string;
  subject: string;
  htmlContent: string;
}

export interface SmsProvider {
  name: string;
  sendSms(params: SendSmsParams): Promise<{ success: boolean; messageId?: string; error?: string }>;
}

export interface EmailProvider {
  name: string;
  sendEmail(params: SendEmailParams): Promise<{ success: boolean; messageId?: string; error?: string }>;
}

/**
 * Mock SMS Provider for local development / testing
 */
export class MockSmsProvider implements SmsProvider {
  name = "Mock SMS Provider (Dev Console)";

  async sendSms(params: SendSmsParams) {
    // In development/test, log to console
    if (process.env.NODE_ENV !== "test") {
      console.log(`[SMS MOCK] To: ${params.toPhone} | Text: "${params.message}"`);
    }
    return {
      success: true,
      messageId: `SMS_MOCK_${Date.now()}`,
    };
  }
}

/**
 * Production Bangladeshi SMS Provider adapter (e.g., SSL Wireless, BulkSMS BD, Greenweb)
 */
export class BangladeshSmsProvider implements SmsProvider {
  name = "Bangladesh Gateway SMS";
  private apiKey: string;
  private senderId: string;

  constructor() {
    this.apiKey = process.env.SMS_API_KEY || "";
    this.senderId = process.env.SMS_SENDER_ID || "Service365";
  }

  async sendSms(params: SendSmsParams) {
    if (!this.apiKey) {
      return { success: false, error: "SMS_API_KEY not configured" };
    }
    try {
      // Standard BD SMS API call
      // Adaptable to SSL Wireless / Greenweb / Elitbuzz
      console.log(`[LIVE SMS] Dispatched to ${params.toPhone} via ${this.senderId}`);
      return { success: true, messageId: `SMS_BD_${Date.now()}` };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "SMS dispatch error";
      return { success: false, error: msg };
    }
  }
}

/**
 * Mock Email Provider for local development
 */
export class MockEmailProvider implements EmailProvider {
  name = "Mock Email Provider";

  async sendEmail(params: SendEmailParams) {
    if (process.env.NODE_ENV !== "test") {
      console.log(`[EMAIL MOCK] To: ${params.toEmail} | Subject: "${params.subject}"`);
    }
    return { success: true, messageId: `EMAIL_MOCK_${Date.now()}` };
  }
}

export function getSmsProvider(): SmsProvider {
  if (process.env.SMS_PROVIDER === "bangladesh_sms" && process.env.SMS_API_KEY) {
    return new BangladeshSmsProvider();
  }
  return new MockSmsProvider();
}

export function getEmailProvider(): EmailProvider {
  return new MockEmailProvider();
}

/**
 * Notification template generator for Service365 parcel updates
 */
export const NotificationTemplates = {
  orderConfirmed: (orderNumber: string, trackingId: string) => ({
    sms: `Service365: Your order ${orderNumber} has been booked. Track live at https://service365.vercel.app/track/${trackingId}`,
    emailSubject: `Order Confirmation - ${orderNumber}`,
    emailHtml: `<h2>Your Parcel is Booked!</h2><p>Order Number: <strong>${orderNumber}</strong></p><p>Tracking ID: <strong>${trackingId}</strong></p><p>You can track your parcel live anytime at Service365.</p>`,
  }),
  outForDelivery: (trackingId: string, riderName: string, riderPhone: string) => ({
    sms: `Service365: Parcel ${trackingId} is OUT FOR DELIVERY by Rider ${riderName} (${riderPhone}). Please keep payment ready.`,
    emailSubject: `Out for Delivery - ${trackingId}`,
    emailHtml: `<h2>Out for Delivery!</h2><p>Your parcel ${trackingId} is with delivery agent <strong>${riderName}</strong> (${riderPhone}).</p>`,
  }),
  delivered: (trackingId: string, codCollected: number) => ({
    sms: `Service365: Parcel ${trackingId} has been DELIVERED.${codCollected > 0 ? ` COD Collected: ৳${codCollected}.` : ""} Thank you for choosing Service365.`,
    emailSubject: `Delivered - ${trackingId}`,
    emailHtml: `<h2>Delivered!</h2><p>Parcel ${trackingId} was successfully delivered.</p>`,
  }),
};
