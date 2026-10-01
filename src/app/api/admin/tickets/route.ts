import { NextRequest, NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Role, TicketStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { session, error } = await requireRole(["ADMIN", "SUPER_ADMIN"]);
    if (!session) {
      return NextResponse.json({ success: false, error: { message: error || "Unauthorized" } }, { status: 401 });
    }

    if (!isDatabaseConfigured) {
      return NextResponse.json({
        success: true,
        data: [
          {
            id: "t_1",
            ticketNumber: "TKT-2026-0001",
            subject: "Delayed delivery inquiry for Dhanmondi parcel",
            category: "DELIVERY",
            priority: "HIGH",
            status: "OPEN",
            merchantName: "Star Tech BD",
            userEmail: "merchant@service365.demo",
            createdAt: new Date().toISOString(),
          },
        ],
      });
    }

    const tickets = await prisma.supportTicket.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    const formatted = tickets.map((t) => ({
      id: t.id,
      ticketNumber: t.ticketNumber,
      subject: t.subject,
      category: t.category,
      priority: t.priority,
      status: t.status,
      merchantName: t.user.name,
      userEmail: t.user.email,
      createdAt: t.createdAt.toISOString(),
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching tickets";
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
    const { ticketId, status } = body;

    if (!isDatabaseConfigured) {
      return NextResponse.json({ success: true, message: "Ticket updated (mock)" });
    }

    const updated = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: status as TicketStatus },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error updating ticket";
    return NextResponse.json({ success: false, error: { message } }, { status: 500 });
  }
}
