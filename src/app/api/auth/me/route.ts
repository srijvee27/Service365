import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { prisma, isDatabaseConfigured } from "@/lib/db";

export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ success: false, user: null, data: null }, { status: 401 });
  }

  if (isDatabaseConfigured) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: session.id },
        include: {
          rider: true,
          merchant: true,
          customer: true,
        },
      });

      if (user) {
        const { passwordHash: _, ...safeUser } = user;
        const mergedData = {
          ...session,
          ...safeUser,
          riderId: user.rider?.id || session.riderId,
          merchantId: user.merchant?.id || session.merchantId,
          customerId: user.customer?.id || session.customerId,
          rider: user.rider,
        };
        return NextResponse.json({
          success: true,
          user: mergedData,
          data: mergedData,
        });
      }
    } catch {
      // Fallback to session
    }
  }

  return NextResponse.json({ success: true, user: session, data: session });
}

