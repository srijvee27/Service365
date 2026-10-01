import { NextRequest, NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ trackingId: string }> }
) {
  try {
    const { trackingId } = await params;
    if (!trackingId) {
      return NextResponse.json(
        { success: false, error: { message: "Tracking ID is required" } },
        { status: 400 }
      );
    }

    const cleanId = decodeURIComponent(trackingId).trim();

    if (!isDatabaseConfigured) {
      // Mock tracking record for development testing
      return NextResponse.json({
        success: true,
        data: {
          orderNumber: "S365-2026-000101",
          trackingId: cleanId,
          senderDistrict: "Dhaka City",
          senderArea: "Dhanmondi",
          receiverDistrict: "Chattogram",
          receiverArea: "Agrabad",
          receiverName: "S*** H***",
          serviceType: "REGULAR",
          paymentMethod: "COD",
          codAmount: 4500,
          codStatus: "COLLECTED",
          status: "DELIVERED",
          weight: 1.5,
          events: [
            { id: "e1", status: "ORDER_CREATED", message: "Order placed by merchant", location: "Dhanmondi Hub", createdAt: new Date(Date.now() - 3600000 * 24).toISOString() },
            { id: "e2", status: "PICKED_UP", message: "Picked up by rider", location: "Dhanmondi, Dhaka", createdAt: new Date(Date.now() - 3600000 * 20).toISOString() },
            { id: "e3", status: "IN_TRANSIT", message: "Dispatched to regional hub", location: "Tejgaon Sort Facility", createdAt: new Date(Date.now() - 3600000 * 12).toISOString() },
            { id: "e4", status: "OUT_FOR_DELIVERY", message: "Out for delivery with rider Rahim", location: "Agrabad Hub", createdAt: new Date(Date.now() - 3600000 * 4).toISOString() },
            { id: "e5", status: "DELIVERED", message: "Delivered to recipient. COD Collected: ৳4,500.", location: "Agrabad, Chattogram", createdAt: new Date(Date.now() - 3600000 * 2).toISOString() },
          ],
        },
      });
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ trackingId: cleanId }, { orderNumber: cleanId }],
      },
      include: {
        trackingEvents: {
          orderBy: { createdAt: "desc" },
        },
        assignments: {
          where: { assignmentType: "DELIVERY" },
          include: {
            rider: {
              include: { user: true },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Consignment not found" } },
        { status: 404 }
      );
    }

    // Mask recipient name for privacy
    const names = order.receiverName.split(" ");
    const maskedName = names.map((n) => (n.length > 2 ? `${n[0]}***` : n)).join(" ");

    const assignedRider = order.assignments[0]?.rider;

    return NextResponse.json({
      success: true,
      data: {
        orderNumber: order.orderNumber,
        trackingId: order.trackingId,
        senderDistrict: order.senderDistrict,
        senderArea: order.senderArea,
        receiverDistrict: order.receiverDistrict,
        receiverArea: order.receiverArea,
        receiverName: maskedName,
        serviceType: order.serviceType,
        paymentMethod: order.paymentMethod,
        codAmount: Number(order.codAmount),
        codStatus: order.codStatus,
        status: order.status,
        weight: Number(order.weight),
        productDescription: order.productDescription,
        estimatedDelivery: order.estimatedDelivery?.toISOString(),
        deliveredAt: order.deliveredAt?.toISOString(),
        rider: assignedRider
          ? {
              name: assignedRider.user.name,
              phone: assignedRider.user.phone,
              vehicleType: assignedRider.vehicleType,
            }
          : undefined,
        events: order.trackingEvents.map((ev) => ({
          id: ev.id,
          status: ev.status,
          message: ev.message,
          location: ev.location,
          createdAt: ev.createdAt.toISOString(),
        })),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error querying tracking data";
    return NextResponse.json({ success: false, error: { message } }, { status: 500 });
  }
}
