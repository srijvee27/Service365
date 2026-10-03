// ==============================================================================
// Service365 - Bangladesh National ID (NID) Service Abstraction
// Handles NID format validation, masking, and official verification interface.
// ==============================================================================

export interface NidVerificationResult {
  configured: boolean;
  success: boolean;
  message: string;
  verifiedName?: string;
  dateOfBirth?: string;
  nidMasked?: string;
}

/**
 * Validates Bangladeshi NID format:
 * - Smart Card: 10 digits
 * - Legacy NID: 13 digits
 * - Legacy NID with 4-digit birth year prefix: 17 digits
 */
export function isValidBangladeshNid(nid: string): boolean {
  if (!nid) return false;
  const cleanNid = nid.trim();
  return /^(\d{10}|\d{13}|\d{17})$/.test(cleanNid);
}

/**
 * Masks NID for secure UI display and API responses.
 * Leaves first 2 and last 4 characters visible, masks middle with *.
 */
export function maskNid(nid?: string | null): string {
  if (!nid) return "N/A";
  const clean = nid.trim();
  if (clean.length <= 4) return "****";
  if (clean.length === 10) {
    return `${clean.slice(0, 2)}******${clean.slice(-2)}`;
  }
  return `${clean.slice(0, 4)}********${clean.slice(-4)}`;
}

/**
 * Official Bangladesh NID verification abstraction.
 * Only connects if authorized/official credentials (e.g., Porichoy API or Election Commission gateway)
 * are provided in environment variables.
 * Never scrapes government websites and never returns fake/fabricated verification data.
 */
export async function verifyNidWithOfficialGateway(
  nidNumber: string,
  personName?: string,
  dateOfBirth?: string
): Promise<NidVerificationResult> {
  const apiKey = process.env.PORICHOY_API_KEY || process.env.BANGLADESH_NID_API_KEY;
  const apiEndpoint = process.env.BANGLADESH_NID_API_URL || "https://api.porichoy.bd/api/v1/nid";

  const masked = maskNid(nidNumber);

  if (!apiKey) {
    return {
      configured: false,
      success: false,
      message:
        "Official NID verification service is not configured. Authorized API credentials (PORICHOY_API_KEY / BANGLADESH_NID_API_KEY) are missing in the server environment.",
      nidMasked: masked,
    };
  }

  try {
    const res = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        nid: nidNumber,
        name: personName,
        dob: dateOfBirth,
      }),
    });

    if (!res.ok) {
      return {
        configured: true,
        success: false,
        message: `Official NID gateway returned HTTP ${res.status}: ${res.statusText}`,
        nidMasked: masked,
      };
    }

    const data = await res.json();
    return {
      configured: true,
      success: Boolean(data.success || data.passk),
      message: data.message || "NID verified successfully through official gateway.",
      verifiedName: data.name || data.data?.name,
      dateOfBirth: data.dob || data.data?.dob,
      nidMasked: masked,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Network error contacting official NID service";
    return {
      configured: true,
      success: false,
      message: errorMsg,
      nidMasked: masked,
    };
  }
}
