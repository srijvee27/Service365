import { NextRequest, NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import { validateShuftiSignature } from "@/lib/shufti-service";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("Signature");
    const secretKey = process.env.SHUFTI_SECRET_KEY;

    let body: Record<string, unknown>;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
    }

    if (secretKey && signature) {
      const isValid = validateShuftiSignature(body, signature, secretKey);
      if (!isValid) {
        console.warn("[Shufti Webhook] Invalid signature received.");
        return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 401 });
      }
    }

    const reference = body.reference as string;
    const event = body.event as string;

    if (!reference) {
      return NextResponse.json({ success: false, error: "Missing reference" }, { status: 400 });
    }

    if (isDatabaseConfigured) {
      const record = await prisma.nidVerification.findUnique({
        where: { reference },
      });

      if (record) {
        if (event === "verification.accepted") {
          await prisma.nidVerification.update({
            where: { reference },
            data: {
              status: "VERIFIED",
              verifiedAt: new Date(),
            },
          });
        } else if (event === "verification.declined") {
          await prisma.nidVerification.update({
            where: { reference },
            data: {
              status: "FAILED",
              declinedReason: (body.declined_reason as string) || "Declined by Shufti Pro",
            },
          });
        }
      }
    }

    return NextResponse.json({ success: true, message: "Webhook processed" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error processing webhook";
    return NextResponse.json({ success: false, error: { message } }, { status: 500 });
  }
}
