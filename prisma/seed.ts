// ==============================================================================
// Service365 - Prisma Comprehensive Seed Script
// Seeds: Divisions, 64 Districts, Thanas, Services, Pricing Rules, Demo Users, Orders, Ledger
// ==============================================================================

import { PrismaClient, Role, MerchantStatus, RiderStatus, ZoneType, ServiceType, OrderStatus, PaymentMethod, PaymentStatus, CodStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { BANGLADESH_DIVISIONS, BANGLADESH_DISTRICTS } from "../src/lib/bangladesh-data";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Service365 database seeding...");

  // 1. Seed Divisions
  console.log("📍 Seeding Bangladesh Divisions...");
  for (const div of BANGLADESH_DIVISIONS) {
    await prisma.division.upsert({
      where: { name: div.name },
      update: { bnName: div.bnName },
      create: {
        id: `DIV_${div.code}`,
        name: div.name,
        bnName: div.bnName,
      },
    });
  }

  // 2. Seed Districts and Thanas
  console.log("🏙️ Seeding 64 Districts and Upazilas...");
  for (const dist of BANGLADESH_DISTRICTS) {
    const divisionRecord = await prisma.division.findUnique({ where: { name: dist.division } });
    if (!divisionRecord) continue;

    const districtRecord = await prisma.district.upsert({
      where: { name: dist.name },
      update: {
        zoneType: dist.zoneType as ZoneType,
        deliveryTimeHours: dist.deliveryTimeHours,
        bnName: dist.bnName,
      },
      create: {
        name: dist.name,
        bnName: dist.bnName,
        divisionId: divisionRecord.id,
        zoneType: dist.zoneType as ZoneType,
        deliveryTimeHours: dist.deliveryTimeHours,
      },
    });

    // Seed top areas for each district
    if (dist.areas && dist.areas.length > 0) {
      await prisma.area.createMany({
        data: dist.areas.map((areaName) => ({
          districtId: districtRecord.id,
          name: areaName,
          bnName: areaName,
          expressAvailable: dist.zoneType === "INSIDE_DHAKA",
        })),
        skipDuplicates: true,
      });
    }
  }

  // 3. Seed Services
  console.log("🚚 Seeding Delivery Services...");
  const services = [
    { code: ServiceType.REGULAR, name: "Regular Delivery", description: "Standard nationwide doorstep delivery within 24-72 hours", baseLeadTimeHours: 24 },
    { code: ServiceType.EXPRESS, name: "Express Next-Day", description: "Priority handling with guaranteed next-day delivery", baseLeadTimeHours: 18 },
    { code: ServiceType.SAME_DAY, name: "Same Day Delivery", description: "Hyperfast within-Dhaka delivery on the same booking day", baseLeadTimeHours: 8 },
  ];

  for (const s of services) {
    await prisma.service.upsert({
      where: { code: s.code },
      update: { name: s.name, description: s.description, baseLeadTimeHours: s.baseLeadTimeHours },
      create: s,
    });
  }

  // 4. Seed Pricing Rules
  console.log("💰 Seeding Dynamic Pricing Rules...");
  const pricingRules = [
    { fromZone: ZoneType.INSIDE_DHAKA, toZone: ZoneType.INSIDE_DHAKA, baseCharge: 60, additionalWeightCharge: 15, codPercentage: 1.0 },
    { fromZone: ZoneType.INSIDE_DHAKA, toZone: ZoneType.DHAKA_SUBURB, baseCharge: 100, additionalWeightCharge: 20, codPercentage: 1.0 },
    { fromZone: ZoneType.DHAKA_SUBURB, toZone: ZoneType.INSIDE_DHAKA, baseCharge: 100, additionalWeightCharge: 20, codPercentage: 1.0 },
    { fromZone: ZoneType.DHAKA_SUBURB, toZone: ZoneType.DHAKA_SUBURB, baseCharge: 110, additionalWeightCharge: 20, codPercentage: 1.0 },
    { fromZone: ZoneType.INSIDE_DHAKA, toZone: ZoneType.OUTSIDE_DHAKA, baseCharge: 130, additionalWeightCharge: 25, codPercentage: 1.0 },
    { fromZone: ZoneType.OUTSIDE_DHAKA, toZone: ZoneType.INSIDE_DHAKA, baseCharge: 130, additionalWeightCharge: 25, codPercentage: 1.0 },
    { fromZone: ZoneType.DHAKA_SUBURB, toZone: ZoneType.OUTSIDE_DHAKA, baseCharge: 140, additionalWeightCharge: 25, codPercentage: 1.0 },
    { fromZone: ZoneType.OUTSIDE_DHAKA, toZone: ZoneType.DHAKA_SUBURB, baseCharge: 140, additionalWeightCharge: 25, codPercentage: 1.0 },
    { fromZone: ZoneType.OUTSIDE_DHAKA, toZone: ZoneType.OUTSIDE_DHAKA, baseCharge: 150, additionalWeightCharge: 25, codPercentage: 1.0 },
  ];

  for (const r of pricingRules) {
    await prisma.pricingRule.upsert({
      where: {
        fromZone_toZone_serviceType: {
          fromZone: r.fromZone,
          toZone: r.toZone,
          serviceType: ServiceType.REGULAR,
        },
      },
      update: {
        baseCharge: r.baseCharge,
        additionalWeightCharge: r.additionalWeightCharge,
        codPercentage: r.codPercentage,
      },
      create: {
        fromZone: r.fromZone,
        toZone: r.toZone,
        serviceType: ServiceType.REGULAR,
        baseCharge: r.baseCharge,
        additionalWeightCharge: r.additionalWeightCharge,
        codPercentage: r.codPercentage,
      },
    });
  }

  // 5. Seed Demo Users
  console.log("👥 Seeding Demo Accounts (Admin, Merchant, Rider, Customer)...");

  // Admin User
  const adminPassword = await bcrypt.hash("Admin@365", 10);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@service365.demo" },
    update: {},
    create: {
      name: "Super Admin",
      email: "admin@service365.demo",
      phone: "+8801700000001",
      passwordHash: adminPassword,
      role: Role.SUPER_ADMIN,
      emailVerified: true,
      phoneVerified: true,
    },
  });

  // Merchant User
  const merchantPassword = await bcrypt.hash("Merchant@365", 10);
  const merchantUser = await prisma.user.upsert({
    where: { email: "merchant@service365.demo" },
    update: {},
    create: {
      name: "Tanvir Ahmed (Apex Tech)",
      email: "merchant@service365.demo",
      phone: "+8801711223344",
      passwordHash: merchantPassword,
      role: Role.MERCHANT,
      emailVerified: true,
      phoneVerified: true,
    },
  });

  const merchant = await prisma.merchant.upsert({
    where: { userId: merchantUser.id },
    update: {},
    create: {
      userId: merchantUser.id,
      businessName: "Apex Tech BD",
      contactPerson: "Tanvir Ahmed",
      tradeLicenseNo: "TRAD/DSCC/2026/08941",
      status: MerchantStatus.APPROVED,
      paymentMethod: "BKASH",
      bkashNumber: "01711223344",
    },
  });

  // Merchant Store
  const store = await prisma.merchantStore.create({
    data: {
      merchantId: merchant.id,
      name: "Apex Tech Central Warehouse",
      phone: "01711223344",
      district: "Dhaka City",
      area: "Dhanmondi",
      fullAddress: "House 42, Road 9/A, Dhanmondi, Dhaka",
      isDefault: true,
    },
  });

  // Merchant Wallet
  await prisma.wallet.upsert({
    where: { merchantId: merchant.id },
    update: {},
    create: {
      merchantId: merchant.id,
      availableBalance: 8450.00,
      pendingBalance: 2400.00,
      totalWithdrawn: 15000.00,
    },
  });

  // Rider User
  const riderPassword = await bcrypt.hash("Rider@365", 10);
  const riderUser = await prisma.user.upsert({
    where: { email: "rider@service365.demo" },
    update: {},
    create: {
      name: "Rahim Uddin",
      email: "rider@service365.demo",
      phone: "+8801812345678",
      passwordHash: riderPassword,
      role: Role.RIDER,
      emailVerified: true,
      phoneVerified: true,
    },
  });

  const rider = await prisma.rider.upsert({
    where: { userId: riderUser.id },
    update: {},
    create: {
      userId: riderUser.id,
      vehicleType: "BIKE",
      licenseNumber: "DHAKA-METRO-LA-12-3456",
      nidNumber: "19941234567890123",
      currentZone: ZoneType.INSIDE_DHAKA,
      status: RiderStatus.AVAILABLE,
      cashInHand: 4200.00,
    },
  });

  // Customer User
  const customerPassword = await bcrypt.hash("Customer@365", 10);
  const customerUser = await prisma.user.upsert({
    where: { email: "customer@service365.demo" },
    update: {},
    create: {
      name: "Kazi Nabil",
      email: "customer@service365.demo",
      phone: "+8801912345678",
      passwordHash: customerPassword,
      role: Role.CUSTOMER,
      emailVerified: true,
      phoneVerified: true,
    },
  });

  await prisma.customer.upsert({
    where: { userId: customerUser.id },
    update: {},
    create: {
      userId: customerUser.id,
      defaultAddress: "Apartment 5B, Road 12, Banani, Dhaka",
      defaultDistrict: "Dhaka City",
      defaultArea: "Banani",
    },
  });

  // 6. Seed Demo Orders across the 13-stage lifecycle
  console.log("📦 Seeding Demo Parcels & Orders with Full Tracking Timelines...");

  // Order 1: DELIVERED with COD Collected
  const order1 = await prisma.order.upsert({
    where: { orderNumber: "S365-2026-000101" },
    update: {},
    create: {
      orderNumber: "S365-2026-000101",
      orderId: "#100001",
      trackingId: "S365BD9K4M8X2",
      merchantId: merchant.id,
      senderName: "Apex Tech BD",
      senderPhone: "+8801711223344",
      senderDistrict: "Dhaka City",
      senderArea: "Dhanmondi",
      senderAddress: "House 42, Road 9/A, Dhanmondi",
      receiverName: "Shakib Al Hasan",
      receiverPhone: "+8801788990011",
      receiverDistrict: "Chattogram",
      receiverArea: "Agrabad",
      receiverAddress: "Flat 4A, Green Villa, Agrabad C/A",
      productType: "ELECTRONICS",
      productDescription: "Wireless Mechanical Keyboard",
      quantity: 1,
      weight: 1.5,
      declaredValue: 4500,
      serviceType: ServiceType.REGULAR,
      baseCharge: 130,
      weightCharge: 25,
      codFee: 45,
      taxAmount: 0,
      totalCharge: 200,
      paymentMethod: PaymentMethod.COD,
      paymentStatus: PaymentStatus.SUCCESS,
      codAmount: 4500,
      codStatus: CodStatus.COLLECTED,
      status: OrderStatus.DELIVERED,
      orderDate: new Date(Date.now() - 3600000 * 48),
      deliveredAt: new Date(Date.now() - 3600000 * 4),
    },
  });

  // Tracking Events for Order 1
  const timelineEvents1 = [
    { status: OrderStatus.ORDER_CREATED, message: "Order placed by merchant", location: "Dhanmondi Hub", hoursAgo: 48 },
    { status: OrderStatus.ORDER_CONFIRMED, message: "Order confirmed for dispatch", location: "Dhanmondi Hub", hoursAgo: 46 },
    { status: OrderStatus.PICKUP_REQUESTED, message: "Pickup assigned to rider", location: "Dhanmondi Hub", hoursAgo: 44 },
    { status: OrderStatus.PICKED_UP, message: "Parcel received from merchant", location: "Dhanmondi, Dhaka", hoursAgo: 42 },
    { status: OrderStatus.AT_SORTING_CENTER, message: "Processed at Central Sorting Hub", location: "Tejgaon Hub, Dhaka", hoursAgo: 36 },
    { status: OrderStatus.IN_TRANSIT, message: "In transit to Chattogram Regional Facility", location: "Dhaka-Chattogram Highway", hoursAgo: 24 },
    { status: OrderStatus.OUT_FOR_DELIVERY, message: "Out for delivery with rider Rahim Uddin", location: "Agrabad Hub, Chattogram", hoursAgo: 6 },
    { status: OrderStatus.DELIVERED, message: "Delivered to receiver. COD ৳4,500 collected.", location: "Agrabad, Chattogram", hoursAgo: 4 },
  ];

  for (const ev of timelineEvents1) {
    await prisma.trackingEvent.create({
      data: {
        orderId: order1.id,
        status: ev.status,
        message: ev.message,
        location: ev.location,
        actorRole: Role.RIDER,
        createdAt: new Date(Date.now() - 3600000 * ev.hoursAgo),
      },
    });
  }

  // Order 2: OUT_FOR_DELIVERY
  const order2 = await prisma.order.upsert({
    where: { orderNumber: "S365-2026-000102" },
    update: {},
    create: {
      orderNumber: "S365-2026-000102",
      orderId: "#100002",
      trackingId: "S365BD7L3P9Q1",
      merchantId: merchant.id,
      senderName: "Apex Tech BD",
      senderPhone: "+8801711223344",
      senderDistrict: "Dhaka City",
      senderArea: "Dhanmondi",
      senderAddress: "House 42, Road 9/A, Dhanmondi",
      receiverName: "Sadia Afrin",
      receiverPhone: "+8801911223388",
      receiverDistrict: "Dhaka City",
      receiverArea: "Gulshan-2",
      receiverAddress: "Road 55, House 12, Gulshan-2",
      productType: "ACCESSORIES",
      productDescription: "Noise Cancelling Headphones",
      quantity: 1,
      weight: 0.8,
      declaredValue: 2800,
      serviceType: ServiceType.EXPRESS,
      baseCharge: 100,
      weightCharge: 0,
      codFee: 28,
      taxAmount: 0,
      totalCharge: 128,
      paymentMethod: PaymentMethod.COD,
      paymentStatus: PaymentStatus.PENDING,
      codAmount: 2800,
      codStatus: CodStatus.PENDING,
      status: OrderStatus.OUT_FOR_DELIVERY,
      orderDate: new Date(Date.now() - 3600000 * 18),
    },
  });

  await prisma.trackingEvent.createMany({
    data: [
      { orderId: order2.id, status: OrderStatus.ORDER_CREATED, message: "Order booked", location: "Dhanmondi Hub", createdAt: new Date(Date.now() - 3600000 * 18) },
      { orderId: order2.id, status: OrderStatus.PICKED_UP, message: "Picked up by rider", location: "Dhanmondi, Dhaka", createdAt: new Date(Date.now() - 3600000 * 14) },
      { orderId: order2.id, status: OrderStatus.AT_SORTING_CENTER, message: "Sorted at Tejgaon", location: "Tejgaon Hub", createdAt: new Date(Date.now() - 3600000 * 10) },
      { orderId: order2.id, status: OrderStatus.OUT_FOR_DELIVERY, message: "Rider is heading to recipient location", location: "Gulshan Hub, Dhaka", createdAt: new Date(Date.now() - 3600000 * 2) },
    ],
  });

  // Assign order2 to Rider
  await prisma.riderAssignment.create({
    data: {
      orderId: order2.id,
      riderId: rider.id,
      assignmentType: "DELIVERY",
      status: "ASSIGNED",
    },
  });

  console.log("✅ Service365 Database Seeding Completed Successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
