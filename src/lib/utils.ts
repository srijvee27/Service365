import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number or numeric string as Bangladeshi Taka (৳)
 */
export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return "৳0.00";
  }
  const numeric = typeof amount === "string" ? parseFloat(amount) : amount;
  return `৳${numeric.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Normalizes any Bangladesh mobile phone number into E.164 format (+8801XXXXXXXXX).
 * Accepts:
 * - 017XXXXXXXX
 * - +88017XXXXXXXX
 * - 88017XXXXXXXX
 * - 01XXXXXXXXX (11 digits starting with 013-019)
 */
export function normalizeBangladeshPhone(phone: string): { isValid: boolean; normalized: string; error?: string } {
  if (!phone) {
    return { isValid: false, normalized: "", error: "Phone number is required" };
  }

  // Remove spaces, hyphens, and parenthesis
  const cleaned = phone.replace(/[\s\-()]/g, "");

  // Match Bangladesh regex
  // Optional +88 or 88 prefix followed by 01[3-9]\d{8}
  const regex = /^(?:\+?88)?(01[3-9]\d{8})$/;
  const match = cleaned.match(regex);

  if (!match) {
    return {
      isValid: false,
      normalized: cleaned,
      error: "Invalid Bangladesh phone number. Format should be 01XXXXXXXXX or +8801XXXXXXXXX",
    };
  }

  // normalized form is always +8801XXXXXXXXX
  const localPart = match[1]; // e.g. 01712345678
  const normalized = `+88${localPart}`;

  return {
    isValid: true,
    normalized,
  };
}

/**
 * Generates a unique, standardized Service365 Order Number (e.g. S365-2026-004921)
 */
export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  return `S365-${year}-${randomSuffix}`;
}

/**
 * Generates a unique, URL-safe alphanumeric Tracking ID (e.g. S365BD8F4K29)
 */
export function generateTrackingId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Excluding similar characters (0, O, 1, I)
  let result = "S365BD";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Formats date into readable Bangladesh time / localized string
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Returns today's date formatted as YYYY-MM-DD in Asia/Dhaka timezone
 */
export function getTodayBangladeshDate(): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date()); // Returns "YYYY-MM-DD"
}

/**
 * Formats order date as readable date (e.g. Sep 16, 2026) without timezone shift
 */
export function formatOrderDate(date: Date | string | null | undefined): string {
  if (!date) return "N/A";
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}/.test(date)) {
    const [year, month, day] = date.substring(0, 10).split("-").map(Number);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[month - 1]} ${day}, ${year}`;
  }
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    timeZone: "Asia/Dhaka",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

