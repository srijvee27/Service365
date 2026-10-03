import crypto from "crypto";

export interface ShuftiStartParams {
  name: string;
  email: string;
  phone: string;
  nidNumber: string;
  redirectUrl?: string;
}

export interface ShuftiStartResponse {
  success: boolean;
  reference: string;
  verificationUrl?: string;
  event?: string;
  message?: string;
  error?: string;
}

export interface ShuftiStatusResponse {
  reference: string;
  event: string;
  verification_result?: {
    document?: {
      document_number?: number;
      name?: number;
      dob?: number;
    };
  };
  verification_data?: {
    document?: {
      name?: { first_name?: string; last_name?: string; full_name?: string };
      dob?: string;
      document_number?: string;
    };
  };
  declined_reason?: string;
}

/**
 * Validates Shufti Pro response signature using SHA256 according to official spec.
 */
export function validateShuftiSignature(
  data: unknown,
  signature: string | null,
  secretKey: string
): boolean {
  if (!signature || !secretKey) return false;
  try {
    let dataStr = JSON.stringify(data);
    dataStr = dataStr.replace(/\//g, "\\/");
    const skHash = crypto.createHash("sha256").update(secretKey).digest("hex");
    dataStr = `${dataStr}${skHash}`;
    const calculated = crypto.createHash("sha256").update(dataStr).digest("hex");
    return calculated === signature;
  } catch (err) {
    console.error("[Shufti] Signature validation error:", err);
    return false;
  }
}

/**
 * Starts Shufti Pro verification session from the server-side.
 * Credentials are never exposed to the frontend.
 */
export async function startShuftiVerification(
  params: ShuftiStartParams
): Promise<ShuftiStartResponse> {
  const clientId = process.env.SHUFTI_CLIENT_ID;
  const secretKey = process.env.SHUFTI_SECRET_KEY;
  const callbackUrl = (process.env.SHUFTI_CALLBACK_URL || "").trim();

  if (!clientId || !secretKey) {
    return {
      success: false,
      reference: "",
      error: "Shufti Pro credentials are not configured in the server environment.",
    };
  }

  const reference = `SP_NID_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const basicAuth = Buffer.from(`${clientId}:${secretKey}`).toString("base64");

  const nameParts = (params.name || "").trim().split(/\s+/);
  const firstName = nameParts[0] || "Rider";
  const lastName = nameParts.slice(1).join(" ") || firstName;

  const payload: Record<string, unknown> = {
    reference,
    email: params.email || undefined,
    country: "BD",
    language: "EN",
    verification_mode: "any",
    allow_offline: "1",
    allow_online: "1",
    show_privacy_policy: "1",
    show_results: "1",
    show_consent: "1",
    show_feedback_form: "0",
    document: {
      supported_types: ["id_card"],
      name: {
        first_name: firstName,
        last_name: lastName,
        full_name: params.name || `${firstName} ${lastName}`,
      },
      fetch_enhanced_data: "1",
    },
  };

  // Only include callback_url / redirect_url if explicitly configured and whitelisted
  if (callbackUrl && callbackUrl.startsWith("https") && !callbackUrl.includes("yourdomain.com")) {
    payload.callback_url = callbackUrl;
  }
  if (params.redirectUrl && params.redirectUrl.startsWith("https") && !params.redirectUrl.includes("localhost")) {
    payload.redirect_url = params.redirectUrl;
  }

  try {
    const res = await fetch("https://api.shuftipro.com/", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Basic ${basicAuth}`,
      },
      body: JSON.stringify(payload),
    });

    const signature = res.headers.get("Signature");
    const data = await res.json();

    if (signature && secretKey) {
      const isValid = validateShuftiSignature(data, signature, secretKey);
      if (!isValid) {
        console.warn("[Shufti] Warning: Response signature validation failed for reference:", reference);
      }
    }

    if (data.event === "request.pending" && data.verification_url) {
      return {
        success: true,
        reference,
        verificationUrl: data.verification_url,
        event: data.event,
        message: data.message || "Verification session created",
      };
    }

    // Some configurations return verification directly
    if (data.event === "verification.accepted") {
      return {
        success: true,
        reference,
        event: data.event,
        message: "Verification accepted",
      };
    }

    return {
      success: false,
      reference,
      error: data.message || data.error || `Shufti returned event: ${data.event || "UNKNOWN"}`,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error contacting Shufti Pro API";
    return {
      success: false,
      reference,
      error: msg,
    };
  }
}

/**
 * Checks verification status from Shufti Pro API using reference.
 */
export async function queryShuftiStatus(reference: string): Promise<ShuftiStatusResponse | null> {
  const clientId = process.env.SHUFTI_CLIENT_ID;
  const secretKey = process.env.SHUFTI_SECRET_KEY;

  if (!clientId || !secretKey || !reference) return null;

  const basicAuth = Buffer.from(`${clientId}:${secretKey}`).toString("base64");

  try {
    const res = await fetch("https://api.shuftipro.com/status", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Basic ${basicAuth}`,
      },
      body: JSON.stringify({ reference }),
    });

    if (!res.ok) return null;
    const signature = res.headers.get("Signature");
    const data = await res.json();

    if (signature && secretKey) {
      const isValid = validateShuftiSignature(data, signature, secretKey);
      if (!isValid) {
        console.warn("[Shufti] Status signature mismatch for reference:", reference);
      }
    }

    return data as ShuftiStatusResponse;
  } catch (err) {
    console.error("[Shufti] Error querying status:", err);
    return null;
  }
}
