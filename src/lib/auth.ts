// ==============================================================================
// Service365 - Authentication, RBAC & Session Management
// Uses jose for edge/serverless JWT tokens and bcryptjs for secure password hashing.
// ==============================================================================

import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "service365-super-secret-jwt-key-change-in-production-min-32-chars"
);

export const SESSION_COOKIE_NAME = "s365_session";

export type Role = "SUPER_ADMIN" | "ADMIN" | "SUPPORT" | "MERCHANT" | "RIDER" | "CUSTOMER";

export interface SessionPayload {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: Role;
  merchantId?: string;
  riderId?: string;
  customerId?: string;
}

/**
 * Hash a plain text password with bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Verify a plain text password against a bcrypt hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Create a signed JWT session token valid for 7 days
 */
export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

/**
 * Verify and decode a JWT session token
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * Get current authenticated user session from Next.js cookies
 */
export async function getCurrentSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

/**
 * Authorization guard: verifies that session exists and user has one of allowed roles
 */
export async function requireAuth(allowedRoles?: Role[]): Promise<{ session: SessionPayload | null; error?: string }> {
  const session = await getCurrentSession();
  if (!session) {
    return { session: null, error: "Unauthorized. Please log in to continue." };
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(session.role)) {
    return { session: null, error: "Forbidden. You do not have permission to access this resource." };
  }

  return { session };
}

export async function requireRole(allowedRoles: Role[]): Promise<{ session: SessionPayload | null; error?: string }> {
  return requireAuth(allowedRoles);
}

