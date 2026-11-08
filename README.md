# Skilljobs Affiliate Platform (স্কিলজবস অ্যাফিলিয়েট)
### Premium Bangla Affiliate Marketing & Course Commerce Platform

A production-ready full-stack educational affiliate marketing and course commerce platform tailored for the Bangladesh market, inspired by the high-converting storytelling and affiliate empowerment of 10 Minute School's affiliate platform (`affiliation.10minuteschool.com`).

---

## 🌟 Primary Portals & Experiences

1. **Public Website (Bangla-First)**
   - Sticky responsive navigation with trust indicators.
   - Storytelling Hero with custom 5-step visual affiliate journey.
   - Live platform statistics counter.
   - Visual 3-step "কীভাবে কাজ করে" journey.
   - Live interactive commission calculator with sliders.
   - Real course catalog with commission badges ("৳৮৭৫ কমিশন").
   - Marketer dashboard preview mockup.
   - Verified affiliate testimonials & FAQ accordion.
   - Trustworthy footer with bKash security notices.

2. **Super Admin Dashboard (`/admin/dashboard`)**
   - Executive metrics overview with Recharts.
   - **Dedicated Manual bKash Payment Verification Workspace (`/admin/payments`)**: Review submitted TrxID, sender number, course, and amount.
   - **Atomic Payment Approval Transaction**:
     1. Approves payment.
     2. Marks order `PAID`.
     3. Creates student course enrollment.
     4. Creates immutable affiliate commission snapshot & credits balance.
     5. Records reviewer email, timestamp, and audit log.
   - Affiliate application review & approval workflow (`/admin/applications`).
   - Marketer management & performance tracking (`/admin/marketers`).
   - Course catalog & curriculum management (`/admin/courses`).
   - Order history & attribution reports (`/admin/orders`).
   - Commission ledger (`/admin/commissions`).
   - Payout requests settlement with bKash/Bank reference (`/admin/payouts`).
   - Immutable security and financial audit logs (`/admin/audit-logs`).

3. **Marketer / Affiliate Dashboard (`/affiliate/dashboard`)**
   - Performance metrics: Total Clicks, Conversions, Conversion Rate %, Available Balance, Lifetime Earnings.
   - **Dynamic Referral Link Generator**: 1-click course selection, instant link generation (`/courses/[slug]?ref=CODE` and `/r/CODE`), and clipboard copy.
   - Click analytics & conversion ledger.
   - Commission history.
   - **Payout Request Manager**: Minimum ৳500 validation, balance reservation, and status tracking.
   - Marketing asset & banner downloads.

4. **Student / Customer Dashboard (`/student/dashboard`)**
   - Active enrolled courses.
   - **Course Learning Player (`/student/learn/[slug]`)**: Enforces server-side active enrollment checks, modules syllabus, lesson video/notes player, progress tracking.
   - Order history and bKash payment verification tracking (`/student/payments`) with retry flow.

---

## 🛠 Technology Stack

- **Core**: Next.js 14 App Router, TypeScript (strict mode), React 18, Node.js 22.
- **Database & ORM**: PostgreSQL, Prisma ORM (Neon compatible), Decimal minor units for money.
- **Styling & UI**: Tailwind CSS, Lucide React, Recharts.
- **Typography**: Bangla font *Hind Siliguri*, English font *Plus Jakarta Sans*.
- **Authentication**: Session/JWT HTTP-only cookie authentication (`jose`), password hashing (`bcryptjs`), Server-Side Role-Based Access Control (RBAC), Next.js Middleware route protection.
- **Affiliate Engine**: 30-day first-party cookie attribution, last-click attribution model, self-referral prevention, bot rate limiting.

---

## 🚀 Quick Start Guide

### 1. Installation
```bash
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```env
DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/skilljobs_db?schema=public"
JWT_SECRET="skilljobs-production-secret-jwt-key-2026-bangla-affiliate-platform"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
BKASH_RECEIVER_NUMBER="01712345678"
DEFAULT_COMMISSION_PERCENTAGE=20.00
MINIMUM_PAYOUT_AMOUNT=500.00
ATTRIBUTION_WINDOW_DAYS=30
```

### 3. Database Migration & Seeding
```bash
npx prisma generate
npx prisma db push
npm run prisma:seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Login Credentials

| Role | Email | Password | Access Portal |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@skilljobs.com` | `Admin@123456` | `/admin/dashboard` |
| **Affiliate Marketer** | `marketer@skilljobs.com` | `Password@123456` | `/affiliate/dashboard` (Referral: `TANVIR50`) |
| **Student** | `student@skilljobs.com` | `Password@123456` | `/student/dashboard` |

*(Quick-fill login buttons are available directly on `/login` for seamless evaluation.)*

---

## 🧪 Testing

Run live end-to-end integration tests:
```bash
node tests/test-e2e.mjs
```
*(All 19/19 test cases verify authentication, referral tracking, bKash checkout, payment approvals, commissions, and payouts.)*
