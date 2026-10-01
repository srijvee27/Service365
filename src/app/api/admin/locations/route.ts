import { NextRequest, NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Role, ZoneType } from "@prisma/client";
import { BANGLADESH_DISTRICTS } from "@/lib/bangladesh-data";

export async function GET(req: NextRequest) {
  try {
    const { session, error } = await requireRole(["ADMIN", "SUPER_ADMIN"]);
    if (!session) {
      return NextResponse.json({ success: false, error: { message: error || "Unauthorized" } }, { status: 401 });
    }

    if (!isDatabaseConfigured) {
      // Return verified seeded data
      return NextResponse.json({
        success: true,
        data: BANGLADESH_DISTRICTS.map((d, index) => ({
          id: `dist_${index}`,
          name: d.name,
          bnName: d.bnName,
          division: d.division,
          zoneType: d.zoneType,
          active: true,
          deliveryTimeHours: d.zoneType === "INSIDE_DHAKA" ? 24 : 48,
        })),
      });
    }

    const districts = await prisma.district.findMany({
      include: { division: true },
      orderBy: { name: "asc" },
    });

    const formatted = districts.map((d) => ({
      id: d.id,
      name: d.name,
      bnName: d.bnName,
      division: d.division.name,
      zoneType: d.zoneType,
      active: d.active,
      deliveryTimeHours: d.deliveryTimeHours,
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching locations";
    return NextResponse.json({ success: false, error: { message } }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { session, error } = await requireRole(["ADMIN", "SUPER_ADMIN"]);
    if (!session) {
      return NextResponse.json({ success: false, error: { message: error || "Unauthorized" } }, { status: 401 });
    }

    const body = await req.json();
    const { id, active, zoneType, deliveryTimeHours } = body;

    if (!isDatabaseConfigured) {
      return NextResponse.json({ success: true, message: "District updated (mock mode)" });
    }

    const updated = await prisma.district.update({
      where: { id },
      data: {
        active: active !== undefined ? Boolean(active) : undefined,
        zoneType: zoneType ? (zoneType as ZoneType) : undefined,
        deliveryTimeHours: deliveryTimeHours ? Number(deliveryTimeHours) : undefined,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error updating district";
    return NextResponse.json({ success: false, error: { message } }, { status: 500 });
  }
}
