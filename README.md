# Service365 - Bangladesh Logistics & Courier SaaS Platform

> **"Delivering Business. Every Day."**  
> Complete production-ready Bangladesh courier, e-commerce fulfillment, and parcel delivery SaaS platform with bespoke branding, server-side pricing engine, financial COD ledger, bKash Payment Gateway integration, and full Vercel compatibility backed by PostgreSQL (Neon) and Prisma ORM.

---

## Table of Contents

1. [Features & Architecture Overview](#features--architecture-overview)
2. [Beginner's Guide: How to Connect Service365 to Neon PostgreSQL](#beginners-guide-how-to-connect-service365-to-neon-postgresql)
3. [Local Development Setup](#local-development-setup)
4. [Demo Accounts & Test Credentials](#demo-accounts--test-credentials)
5. [Order State Machine & 13-Stage Lifecycle](#order-state-machine--13-stage-lifecycle)
6. [Server-Side Pricing Engine](#server-side-pricing-engine)
7. [Financial Ledger, COD & Settlements](#financial-ledger-cod--settlements)
8. [bKash Payment Gateway & Sandbox Mock Mode](#bkash-payment-gateway--sandbox-mock-mode)
9. [Automated Test Suite & Quality Verification](#automated-test-suite--quality-verification)
10. [Vercel Deployment Guide](#vercel-deployment-guide)
11. [Environment Variables Reference](#environment-variables-reference)

---

## Features & Architecture Overview

- **Next.js 15+ App Router & React 19**: Modern server components, strict typing, responsive layouts.
- **PostgreSQL + Prisma ORM**: 25+ relational database models with ACID transactions, zero in-memory hacks or fragile JSON files.
- **Bespoke Visual Identity**: Original Service365 brand palette, vector SVGs (Logo, Mark, Thermal Label), and custom typography.
- **Bangladesh Geographic Hierarchy**: Verified database coverage of all **8 Divisions, 64 Districts, and Thanas** mapped to dynamic pricing zones:
  - `INSIDE_DHAKA` (Next-day 24h & Express same-day delivery)
  - `DHAKA_SUBURB` (Savar, Gazipur, Narayanganj, Keraniganj)
  - `OUTSIDE_DHAKA` (Chattogram, Sylhet, Rajshahi, Khulna, Barishal, Rangpur, Mymensingh, etc.)
- **Multi-Role RBAC**: Strict role-based access control protecting resources for:
  - `SUPER_ADMIN` & `ADMIN` (Central logistics dispatch, pricing matrix, merchant approvals, COD disbursements)
  - `MERCHANT` (6-step parcel booking wizard, stores, live tracking, COD ledger, wallet payout requests)
  - `RIDER` (Mobile field delivery task board, cash-in-hand reconciliation, OTP / signature proof of delivery)
  - `CUSTOMER` (Order history, live tracking, direct parcel booking)
- **Printable 4x6 Thermal Shipping Labels**: High-contrast, standard 4x6 inch logistics label (`/print/label/[orderId]`) with Code 128 barcodes, public tracking QR codes, recipient routing tags, and bold COD collection indicators.
- **Pluggable Payment Gateway**: Official bKash Tokenized Checkout v1.2.0 provider alongside an interactive development sandbox simulator (`MOCK_BKASH=true`).

---

## Beginner's Guide: How to Connect Service365 to Neon PostgreSQL

If you are new to PostgreSQL, Neon provides a free, serverless cloud PostgreSQL database that connects in less than 2 minutes.

### Step-by-Step Instructions:

1. **Create a Neon Account**:
   - Go to [https://neon.tech](https://neon.tech) and sign up for a free account using GitHub or Google.
2. **Create a New Project**:
   - Click **"Create Project"**.
   - Name your project `service365` and choose the region closest to Bangladesh (e.g. `Singapore (ap-southeast-1)`).
   - Click **"Create Project"**.
3. **Copy the Connection String**:
   - In your Neon Dashboard, locate the **Connection Details** card.
   - Ensure **"Pooled connection"** is selected (recommended for Next.js serverless).
   - Copy the URI string (it looks like: `postgresql://neondb_owner:password@ep-cool-fog-123456-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`).
4. **Create your `.env` File**:
   - In the root folder of Service365, create a file named `.env` (or edit the existing one).
   - Paste your connection string into `DATABASE_URL`:
     ```env
     DATABASE_URL="postgresql://neondb_owner:password@ep-cool-fog-123456-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
     AUTH_SECRET="service365-super-secret-jwt-key-change-in-production-min-32-chars"
     NEXT_PUBLIC_APP_URL="http://localhost:3000"
     PAYMENT_MODE="mock"
     ```
5. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```
6. **Apply the Database Migrations**:
   ```bash
   npx prisma migrate deploy
   ```
   *(For active development with schema changes, use `npx prisma migrate dev`)*
7. **Seed Demo Data & 64 Bangladesh Districts**:
   ```bash
   npm run db:seed
   ```
   *(This populates all 8 divisions, 64 districts, pricing rules, demo users, and starter orders)*
8. **Launch the Application**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Local Development Setup

If running locally with local PostgreSQL (e.g. PostgreSQL 14/15/16/17/18 installed on Windows):

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Set up Local PostgreSQL Database**:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/service365"
   ```
3. **Run Prisma Migrations & Seed**:
   ```bash
   npx prisma migrate dev --name init
   npm run db:seed
   ```
4. **Start Development Server**:
   ```bash
   npm run dev
   ```

---

## Demo Accounts & Test Credentials

All accounts are pre-seeded with secure development credentials:

| Role | Email | Password | Dashboard URL | Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | `admin@service365.demo` | `Admin@365` | `/admin/dashboard` | Central dispatch, pricing simulator, merchant approvals, COD payouts, audit logs |
| **Merchant** | `merchant@service365.demo` | `Merchant@365` | `/merchant/dashboard` | 6-step parcel booking wizard, printable labels, COD wallet, payout requests |
| **Rider** | `rider@service365.demo` | `Rider@365` | `/rider/dashboard` | Mobile task sheet, OTP delivery confirmation, cash collection logging |
| **Customer** | `customer@service365.demo` | `Customer@365` | `/customer/dashboard` | Shipment tracking, receipt download, consumer direct parcel booking |

> **1-Click Demo Login**: The login page at `/login` provides one-tap demo buttons to immediately log into any of these roles without typing.

---

## Order State Machine & 13-Stage Lifecycle

Every consignment strictly moves through authorized state transitions, and every status change creates an immutable `TrackingEvent` record with timestamp, location, actor, and message:

```mermaid
stateDiagram-v2
    [*] --> ORDER_CREATED
    ORDER_CREATED --> ORDER_CONFIRMED: Merchant / Admin
    ORDER_CONFIRMED --> PICKUP_REQUESTED: Merchant / System
    PICKUP_REQUESTED --> PICKED_UP: Rider
    PICKED_UP --> AT_SORTING_CENTER: Hub Operator
    AT_SORTING_CENTER --> IN_TRANSIT: Dispatch
    IN_TRANSIT --> OUT_FOR_DELIVERY: Rider Assigned
    OUT_FOR_DELIVERY --> DELIVERED: OTP / Signature
    OUT_FOR_DELIVERY --> DELIVERY_FAILED: Exception
    DELIVERY_FAILED --> RETURN_REQUESTED: Policy Trigger
    RETURN_REQUESTED --> RETURNED: Returned to Merchant
    ORDER_CREATED --> CANCELLED: Merchant (pre-pickup)
```

Public tracking URL: `/track/[trackingId]` (e.g. `/track/S365BD9K4M8X2`).

---

## Server-Side Pricing Engine

Pricing calculations are **strictly computed on the server** via `src/lib/pricing-engine.ts`. The browser rate preview is non-authoritative.

**Deterministic Formula**:
$$\text{Total} = \text{Base Charge} + (\max(0, \lceil\text{Weight} - 1.0\rceil) \times \text{Extra Per Kg}) + \text{COD Fee} + \text{Tax} - \text{Discount}$$

- **Inside Dhaka**: ৳60 base (up to 1kg) + ৳15/kg extra
- **Dhaka Suburbs**: ৳100 base (up to 1kg) + ৳20/kg extra
- **Outside Dhaka**: ৳130 base (up to 1kg) + ৳25/kg extra
- **COD Fee**: 1% of collection amount (0% on prepayments)
- **Express / Same Day**: ৳40 - ৳70 priority surcharge

Admin can adjust all pricing matrix values dynamically at `/admin/pricing` with real-time server simulation.

---

## Financial Ledger, COD & Settlements

To maintain zero financial discrepancies, merchant balances are maintained through an auditable ledger:
- **`Wallet`**: Holds current available balance, pending balance, and lifetime withdrawals.
- **`WalletTransaction`**: Every credit or debit (COD Credit, Delivery Fee Debit, Payout Debit, Adjustment) creates an immutable record.
- **`CodTransaction`**: Tracks cash collection from recipient to rider to hub reconciliation.
- **`Settlement`**: Batch disbursement requests processed by Admin at `/admin/cod-settlements` with bank or bKash TrxID references.

---

## bKash Payment Gateway & Sandbox Mock Mode

Service365 uses a pluggable `PaymentProvider` abstraction (`src/lib/payment/`):

### 1. Mock Mode (Development & QA)
- Activated when `PAYMENT_MODE=mock` or `MOCK_BKASH=true`.
- Redirects to `/payment/mock-gateway` with an interactive sandbox:
  - **Authorize Payment**: Simulates successful tokenized execution with a generated transaction ID (`TRX...`).
  - **Simulate Failure**: Tests insufficient balance or bank decline.
  - **Cancel**: Tests checkout abort.
- Displays a prominent **"DEVELOPMENT SANDBOX ACTIVE"** banner.

### 2. Production bKash Mode
- Activated when `PAYMENT_MODE=bkash` and valid credentials are provided:
  - `BKASH_APP_KEY`, `BKASH_APP_SECRET`, `BKASH_USERNAME`, `BKASH_PASSWORD`, `BKASH_BASE_URL`.
- Communicates directly with the official bKash Tokenized Checkout APIs (`/tokenized/checkout/token/grant`, `/create`, `/execute`, `/query`).
- Never trusts client-side redirect parameters — always re-verifies transactions on the server.

---

## Automated Test Suite & Quality Verification

Run the comprehensive automated testing suite:

```bash
# 1. Run Jest Unit Tests (Pricing, Phone Normalizer, Tracking ID, Payment Mock)
npm run test

# 2. Run TypeScript Strict Typecheck
npm run typecheck

# 3. Run ESLint Code Quality Verification
npm run lint

# 4. Run Next.js Production Build
npm run build
```

---

## Vercel Deployment Guide

Service365 is 100% cloud-native and serverless-ready for Vercel deployment:

1. Push your repository to GitHub.
2. In Vercel, click **"Add New Project"** and import the `Service 365` repository.
3. Configure the **Environment Variables**:
   - `DATABASE_URL`: Your pooled Neon PostgreSQL connection string.
   - `AUTH_SECRET`: A secure random 32+ character string.
   - `NEXT_PUBLIC_APP_URL`: Your production URL (e.g. `https://service365.vercel.app`).
   - `PAYMENT_MODE`: `mock` (for initial testing) or `bkash` (for live payments).
4. Click **"Deploy"**.
5. Once deployed, run migrations against your production database:
   ```bash
   npx prisma migrate deploy
   ```

---

## Environment Variables Reference

```env
# Database (Neon or Local PostgreSQL)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/service365"

# Application Base URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# JWT & Authentication Secret
AUTH_SECRET="service365-super-secret-jwt-key-change-in-production-min-32-chars"

# Payment Configuration (mock or bkash)
PAYMENT_MODE="mock"
MOCK_BKASH="true"

# Production bKash Credentials (Optional in mock mode)
BKASH_APP_KEY=""
BKASH_APP_SECRET=""
BKASH_USERNAME=""
BKASH_PASSWORD=""
BKASH_BASE_URL="https://tokenized.sandbox.bka.sh/v1.2.0-beta"

# Notifications (Optional adapters)
SMS_PROVIDER="mock"
SMS_API_KEY=""
SMTP_HOST=""
SMTP_PORT=""
SMTP_USER=""
SMTP_PASSWORD=""
```

---

*Service365 — Delivering Business. Every Day.*
