import { NextRequest, NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { calculateDeliveryPricing, ServiceType, PaymentMethod } from "@/lib/pricing-engine";
import { getZoneByDistrict } from "@/lib/bangladesh-data";
import { generateOrderNumber, generateTrackingId, normalizeBangladeshPhone } from "@/lib/utils";
import { OrderStatus, PaymentStatus, CodStatus, Role } from "@prisma/client";
import { NotificationTemplates, getSmsProvider } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  try {
    const { session, error } = await requireAuth();
    if (!session) {
      return NextResponse.json({ success: false, error: { message: error || "Unauthorized" } }, { status: 401 });
    }

    const body = await req.json();
    const {
      orderDate,
      senderName,
      senderPhone,
      senderDistrict,
      senderArea,
      senderAddress,
      pickupInstructions,
      receiverName,
      receiverPhone,
      receiverDistrict,
      receiverArea,
      receiverAddress,
      deliveryInstructions,
      productType = "GENERAL",
      productDescription = "",
      quantity = 1,
      weight = 1,
      declaredValue = 0,
      serviceType = "REGULAR",
      paymentMethod = "COD",
      codAmount = 0,
    } = body;

    // Validate orderDate
    let parsedOrderDate: Date;
    if (orderDate) {
      parsedOrderDate = new Date(orderDate);
      if (isNaN(parsedOrderDate.getTime())) {
        return NextResponse.json(
          { success: false, error: { message: "Invalid Order Date format. Expected YYYY-MM-DD" } },
          { status: 400 }
        );
      }
    } else {
      parsedOrderDate = new Date();
    }

    // Validate required fields
    if (
      !senderName ||
      !senderPhone ||
      !senderDistrict ||
      !senderAddress ||
      !receiverName ||
      !receiverPhone ||
      !receiverDistrict ||
      !receiverAddress
    ) {
      return NextResponse.json(
        { success: false, error: { message: "All sender and receiver address fields are required" } },
        { status: 400 }
      );
    }

    // Phone normalizations
    const normSenderPhone = normalizeBangladeshPhone(senderPhone).normalized || senderPhone;
    const normReceiverPhone = normalizeBangladeshPhone(receiverPhone).normalized || receiverPhone;

    // Server-Side Pricing Recalculation (Strict Security - Never Trust Client Totals)
    const fromZone = getZoneByDistrict(senderDistrict);
    const toZone = getZoneByDistrict(receiverDistrict);

    const pricing = calculateDeliveryPricing({
      fromZone,
      toZone,
      weightKg: Number(weight),
      serviceType: serviceType as ServiceType,
      paymentMethod: paymentMethod as PaymentMethod,
      codAmount: paymentMethod === "COD" ? Number(codAmount) : 0,
    });

    const orderNumber = generateOrderNumber();
    const trackingId = generateTrackingId();

    let createdOrder;

    if (isDatabaseConfigured) {
      // Find or assign merchant ID if logged in as merchant
      let merchantId = session.merchantId;
      if (!merchantId && session.role === Role.MERCHANT) {
        const m = await prisma.merchant.findUnique({ where: { userId: session.id } });
        if (m) merchantId = m.id;
      }

      // Calculate estimated delivery
      const estimatedDelivery = new Date(Date.now() + pricing.estimatedHours * 3600000);

      // Create Order & Tracking Event transactionally
      createdOrder = await prisma.$transaction(async (tx) => {
        const ord = await tx.order.create({
          data: {
            orderNumber,
            trackingId,
            merchantId,
            customerId: session.customerId,
            senderName,
            senderPhone: normSenderPhone,
            senderDistrict,
            senderArea: senderArea || senderDistrict,
            senderAddress,
            pickupInstructions,
            receiverName,
            receiverPhone: normReceiverPhone,
            receiverDistrict,
            receiverArea: receiverArea || receiverDistrict,
            receiverAddress,
            deliveryInstructions,
            productType,
            productDescription,
            quantity: Number(quantity) || 1,
            weight: Number(weight) || 1,
            declaredValue: Number(declaredValue) || 0,
            serviceType: serviceType as ServiceType,
            baseCharge: pricing.baseCharge,
            weightCharge: pricing.weightCharge,
            codFee: pricing.codFee,
            taxAmount: pricing.taxAmount,
            discountAmount: pricing.discountAmount,
            totalCharge: pricing.totalCharge,
            paymentMethod: paymentMethod as PaymentMethod,
            paymentStatus: paymentMethod === "COD" ? PaymentStatus.PENDING : PaymentStatus.INITIATED,
            codAmount: paymentMethod === "COD" ? Number(codAmount) : 0,
            codStatus: paymentMethod === "COD" ? CodStatus.PENDING : CodStatus.SETTLED,
            status: OrderStatus.ORDER_CREATED,
            orderDate: parsedOrderDate,
            estimatedDelivery,
          },
        });

        // Initial Tracking Event
        await tx.trackingEvent.create({
          data: {
            orderId: ord.id,
            status: OrderStatus.ORDER_CREATED,
            message: `Consignment booked by ${session.name}. Scheduled for pickup.`,
            location: `${senderArea || senderDistrict} Hub`,
            actorId: session.id,
            actorRole: session.role,
          },
        });

        // If COD and merchant exists, log pending COD transaction
        if (paymentMethod === "COD" && merchantId && Number(codAmount) > 0) {
          await tx.codTransaction.create({
            data: {
              orderId: ord.id,
              merchantId,
              amount: Number(codAmount),
              codFee: pricing.codFee,
              netAmount: Number(codAmount) - pricing.codFee - pricing.totalCharge,
              status: CodStatus.PENDING,
            },
          });
        }

        return ord;
      });

      // Dispatch notification
      const smsTemplate = NotificationTemplates.orderConfirmed(orderNumber, trackingId);
      const smsProvider = getSmsProvider();
      await smsProvider.sendSms({
        toPhone: normReceiverPhone,
        message: smsTemplate.sms,
      });
    } else {
      createdOrder = {
        id: `ord_mock_${Date.now()}`,
        orderId: `#${Math.floor(100000 + Math.random() * 900000)}`,
        orderNumber,
        trackingId,
        senderName,
        receiverName,
        status: "ORDER_CREATED",
        totalCharge: pricing.totalCharge,
        codAmount: Number(codAmount),
      };
    }

    return NextResponse.json({
      success: true,
      data: createdOrder,
      message: "Order created successfully",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create order";
    return NextResponse.json({ success: false, error: { message } }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { session, error } = await requireAuth();
    if (!session) {
      return NextResponse.json({ success: false, error: { message: error || "Unauthorized" } }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const query = searchParams.get("search");

    if (!isDatabaseConfigured) {
      // Mock orders list
      return NextResponse.json({
        success: true,
        data: [
          {
            id: "ord_1",
            orderNumber: "S365-2026-000101",
            trackingId: "S365BD9K4M8X2",
            receiverName: "Shakib Al Hasan",
            receiverPhone: "+8801788990011",
            receiverDistrict: "Chattogram",
            totalCharge: 200,
            paymentMethod: "COD",
            codAmount: 4500,
            status: "DELIVERED",
            createdAt: new Date().toISOString(),
          },
        ],
        total: 1,
      });
    }

    // Role-based scoping
    const where: Record<string, unknown> = {};

    if (session.role === Role.MERCHANT) {
      let mId = session.merchantId;
      if (!mId) {
        const m = await prisma.merchant.findUnique({
          where: { userId: session.id },
        });
        mId = m?.id;
      }
      where.merchantId = mId;
    } else if (session.role === Role.CUSTOMER) {
      where.customerId = session.customerId;
    } else if (session.role === Role.RIDER) {
      where.assignments = {
        some: { riderId: session.riderId },
      };
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (query) {
      where.OR = [
        { orderNumber: { contains: query, mode: "insensitive" } },
        { trackingId: { contains: query, mode: "insensitive" } },
        { receiverName: { contains: query, mode: "insensitive" } },
        { receiverPhone: { contains: query } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        merchant: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: orders,
      total: orders.length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load orders";
    return NextResponse.json({ success: false, error: { message } }, { status: 500 });
  }
}
