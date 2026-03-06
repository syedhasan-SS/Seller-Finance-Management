# Product Requirements Document
## Seller Financial Transparency & Payout Intelligence Portal

**Version:** 1.0
**Date:** March 2026
**Owner:** Seller Support
**Status:** Draft for Review
**Stakeholders:** Seller Support, Finance, Supply

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Solution Overview](#3-solution-overview)
4. [User Stories & Functional Requirements](#4-user-stories--functional-requirements)
5. [Technical Requirements](#5-technical-requirements)
6. [Success Metrics & KPIs](#6-success-metrics--kpis)
7. [Implementation Roadmap](#7-implementation-roadmap)
8. [Risks & Mitigation Strategies](#8-risks--mitigation-strategies)
9. [Dependencies & Assumptions](#9-dependencies--assumptions)
10. [Open Questions](#10-open-questions)

---

## 1. Executive Summary

### 1.1 Product Vision

We are building a comprehensive **Seller Financial Transparency & Payout Intelligence Portal** — a supplier-facing financial system that enables sellers to independently view, track, reconcile, and understand their weekly payouts with complete transparency and predictive intelligence.

Today, suppliers receive payout statements via chat (Sendbird) and must manually retrieve historical records from message threads. They have zero visibility into when orders become eligible for payout, what holds or delays may occur, or how their payment timeline is calculated. This approach does not scale — especially for large suppliers — and creates significant operational burden.

> **This is not a feature enhancement. This is financial infrastructure.**

### 1.2 What This Initiative Delivers

| Pillar | Outcome |
|--------|---------|
| **Centralise** | All payout and financial data in one structured, self-service portal |
| **Enable** | Statement-level and order-level visibility with complete transparency |
| **Predict** | Payout timelines with clear explanations of holds and delays |
| **Reduce** | Repetitive finance-related support tickets by ≥ 40% |
| **Improve** | Supplier trust through proactive financial communication |
| **Establish** | Foundation for a scalable seller finance ecosystem |

### 1.3 Current Build Status

An MVP has been built and pilot-tested:

| Dimension | Status |
|-----------|--------|
| Frontend portal (React + TypeScript) | ✅ Complete |
| BigQuery integration (live financial data) | ✅ Complete |
| JWT authentication | ✅ Complete |
| Payout timeline, orders table, income statement | ✅ Complete |
| Pilot test — 7 suppliers, 18,785 orders, £1.6M payout value | ✅ Passed |
| Production deployment (Vercel) | ✅ Live |
| Password hashing (bcrypt) | ⚠️ Pending — pre-production blocker |

---

## 2. Problem Statement

### 2.1 Current State: How Payouts Work Today

**Current financial workflow for suppliers:**
- Weekly payout statements are shared via **Sendbird chat every Monday**
- Payments are processed **Tuesday through Thursday**
- Historical statements remain **buried inside chat threads**
- No structured financial visibility exists inside the vendor application
- Sellers have **zero visibility** into when orders become eligible for payout
- No explanation is provided for holds, delays, or deductions unless the seller contacts Seller Support or KAM

### 2.2 Key Issues & Pain Points

**Issue #1 — Manual Reconciliation Burden**
Suppliers must manually search chat history and reconcile externally using spreadsheets. For large suppliers with hundreds of orders per week, this is time-consuming and error-prone. The Seller Support team spends multiple hours per day on reconciliation.

**Issue #2 — High Ticket Volume**

| Period | Volume |
|--------|--------|
| Oct 2025 – Jan 2026 | **1,172 finance-related support tickets** |
| Monthly average | **~293 tickets/month** |
| Informational requests (pure visibility gap) | **54–64%** |
| Reconciliation complaints | **36%** |

*The majority of these tickets could be eliminated with self-service visibility.*

**Issue #3 — Operational Burden**
- Manual checks by Seller Support and Finance teams for routine queries
- Repeated explanations of the same payout policies and calculations
- Delayed escalations due to lack of structured data access
- Multi-day reconciliation visits for zone sellers (untracked time cost)
- Manual BigQuery data pulls by technical teams (~15/week)

**Issue #4 — Supplier Trust & Retention**
- Limited transparency around commissions, deductions, and payment timing
- No visibility into why payouts are delayed or held
- Larger suppliers experience higher reconciliation friction
- Growing suppliers feel the platform doesn't scale with their business

**Issue #5 — No Predictive Intelligence**
Sellers cannot answer basic questions without contacting support:
- *"When will I be paid for this order?"*
- *"What is blocking my payout?"*
- *"When does the return window end?"*
- *"Why was my bank verification rejected?"*

### 2.3 Root Cause Analysis

**There is no centralised, self-service financial system for suppliers.** Financial data exists in fragmented systems (ledger, chat, support tickets, BigQuery) with no unified supplier-facing interface.

---

## 3. Solution Overview

### 3.1 Product Scope

We are developing a unified **Seller Financial Transparency & Payout Intelligence Portal** with three integrated capabilities:

| Capability | Purpose | Key Features |
|------------|---------|--------------|
| **Financial Transparency Portal** | Replace chat-based statement delivery with structured, self-service financial access | Statement history, order breakdown, reconciliation tools, export |
| **Payout Timeline Intelligence** | Show sellers exactly when they'll be paid and why, with order-level precision | Predictive dates, lifecycle tracking, hold explanations |
| **Proactive Blockers & Alerts** | Surface issues preventing payouts and guide sellers to resolution | Active holds, actionable next steps, notifications, progress tracking |

### 3.2 Core Capabilities

#### Capability 1: Financial Transparency Portal
**Purpose:** Replace chat-based statement delivery with structured, self-service financial access

**Features:**
- Weekly payout statement history (downloadable as PDF/Excel)
- Order-level financial breakdown across all 14 financial fields:
  - Internal Order ID, Product Name, Vendor, Payout Status, Created At
  - Latest Status, Includes Shipping flag
  - Original Final Base (£), Commission (%), Commission Amount (£)
  - Base After Commission (£), Vendor Shipping Cost (£)
  - Supplier Refund (£), Cancellation Fee (£), Total Paid Amount (£)
- Search and filter by date range, order ID, status
- Reconciliation tools with expected vs. actual payout comparison
- Export capabilities for external accounting systems

#### Capability 2: Payout Timeline Intelligence
**Purpose:** Show sellers exactly when they'll be paid and why, with order-level precision

**Features:**
- Predictive payout date for each order (based on completion, QC, return window)
- Clear explanation of payout timeline: `Order Completed → QC Approved → Eligible → Payout Cycle → Paid`
- Return window countdown (*"8 days until eligible for payout"*)
- Hold reasons with standardised codes and plain-language explanations
- Next payout cycle dashboard with total amount and order count
- Confidence indicator (High / Medium / Low) for upcoming payout

#### Capability 3: Proactive Blockers & Alerts
**Purpose:** Surface issues preventing payouts and guide sellers to resolution

**Features:**
- Active blockers dashboard showing all holds and delays
- Actionable next steps for each blocker (*"Complete bank verification", "Upload missing documents"*)
- Email and in-app notifications for: payout processed, new hold applied, action required
- Estimated resolution time for each blocker
- Progress tracking for verification steps (*"2 of 3 steps complete"*)

---

## 4. User Stories & Functional Requirements

### 4.1 Primary User Personas

| Persona | Characteristics | Primary Goals |
|---------|----------------|---------------|
| **Small Seller** | 1–50 orders/week, solo or small team, limited finance expertise | Know when I'll be paid, understand holds, access statements easily |
| **Medium Seller** | 50–200 orders/week, dedicated finance person, growing business | Efficient reconciliation, track deductions, reduce manual work |
| **Large Seller** | 200+ orders/week, finance team, enterprise needs | Bulk export, API access, automated reconciliation, zero manual lookups |
| **Finance/Ops Team** | Internal team managing seller payouts and issues | Monitor sellers, prevent escalations, quick issue resolution |

### 4.2 Core User Stories

#### For Small Sellers (1–50 orders/week)

**US-1: View Upcoming Payout**
> *As a small seller, I want to see when my next payout will arrive and how much I'll receive, so I can plan my cash flow and know when to expect funds in my bank account.*

Acceptance Criteria:
- Dashboard shows next payout date prominently
- Total payout amount displayed with order count
- Countdown timer showing days until payout
- Clear status indicator (Processing, On Track, Delayed)

**US-2: Understand Order Timeline**
> *As a small seller, I want to know when a specific order will be paid, so I understand the payout process and can set expectations.*

Acceptance Criteria:
- Click on any order to see detailed lifecycle timeline
- Visual timeline showing: `Completed → QC → Eligible → Payout`
- Each step shows date/time and status (completed, pending, future)
- Clear explanation of return window and eligibility date

**US-3: Access Historical Statements**
> *As a small seller, I want to view all my past payout statements in one place, so I can reconcile payments without searching through chat messages.*

Acceptance Criteria:
- Payout history page showing all weekly statements
- Filter by date range (last 7 days, 30 days, 90 days, custom)
- Each statement shows date, amount, order count, status
- Download individual statements as PDF or Excel

#### For Medium/Large Sellers (50–500+ orders/week)

**US-4: Bulk Reconciliation**
> *As a large seller, I want to reconcile hundreds of orders efficiently, so I can verify all payments without manual spreadsheet work.*

Acceptance Criteria:
- Export all orders for a period as CSV/Excel with all 14 financial fields
- Bulk filter by status, date range, amount discrepancy
- Summary row showing totals per column
- Flag orders where actual payout differs from expected

**US-5: Understand Deductions**
> *As a medium seller, I want to see exactly what was deducted from each order, so I can understand my net payout and identify discrepancies.*

Acceptance Criteria:
- Order detail view shows: Gross Sale, Commission (%), Platform Fees, Refunds, Net Payout
- Clear calculation breakdown with percentages
- Highlight unusual deductions or adjustments
- Link to fee policy documentation

**US-6: Resolve Payout Issues**
> *As a large seller, I want to see why my payout is delayed and how to fix it, so I can take action quickly without opening a support ticket.*

Acceptance Criteria:
- Active blockers section shows all holds and delays
- Each blocker displays: reason, impact, estimated resolution time
- Actionable buttons: *"Complete Verification"*, *"Upload Documents"*
- Progress tracking for multi-step verification

#### For Finance/Operations Teams

**US-7: Monitor Seller Issues**
> *As a finance team member, I want to see which sellers have payout issues, so I can proactively reach out before they escalate.*

Acceptance Criteria:
- Internal dashboard showing sellers with active holds
- Filter by risk level, hold type, pending verification
- Seller health score indicating likelihood of issues
- One-click access to seller's full financial profile

---

## 5. Technical Requirements

### 5.1 System Architecture

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Frontend** | React 18, TypeScript 5.5, Tailwind CSS, Vite | Seller dashboard and order detail views |
| **Backend API** | Node.js/Express, Vercel Serverless Functions | Business logic, data aggregation, authentication |
| **Authentication** | JWT (jsonwebtoken) + bcrypt | Secure seller login and session management |
| **Database** | Google BigQuery (read-only) | Live financial data — ledger, payouts, orders |
| **Notification Service** | SendGrid / Twilio / Firebase | Email, SMS, in-app notifications (Phase 2) |
| **Deployment** | Vercel (CDN + Serverless) | Global edge deployment, auto-scaling |
| **Analytics** | BigQuery + internal dashboards | Operational metrics, ticket deflection tracking |

**Architecture Flow:**
```
Supplier Browser
      │
      ▼
  Vercel CDN  ──── React SPA (Static Assets)
      │
      ▼
Vercel Serverless Functions (/api/*)
  ├── POST /api/auth/login        → JWT authentication
  ├── GET  /api/sellers/:id/payout → Payout summary, history, blockers
  └── GET  /api/sellers/:id/orders → Order lines with 14 financial fields
      │
      ▼
  Google BigQuery (dogwood-baton-345622)
  ├── aurora_postgres_public.balance_transaction  (financial ledger)
  ├── aurora_postgres_public.payout               (payout records)
  ├── aurora_postgres_public.vendors              (supplier registry)
  └── fleek_analytics.vendor_payout               (enriched order data)
```

### 5.2 Data Model

**Core Entities:**

| Entity | Key Fields |
|--------|-----------|
| `payout_cycle` | cycle_id, seller_id, cycle_date, total_amount, status |
| `balance_transaction` | order_line_id, destination_id, final_base, commission_%, shipping, refund, cancellation_fee, total_payable, status |
| `payout` | id, destination_id, amount, currency, status, created_at |
| `vendors` | id, handle, email, password_hash |

**Financial Field Mapping (all monetary values in GBP):**
- All values stored in smallest unit (pence) in BigQuery; divided by 100 for display
- Vendor scoping enforced on every query: `WHERE CAST(destination_id AS INT64) = :vendorId`
- Soft-delete filtering: `WHERE _fivetran_deleted = FALSE`

### 5.3 Integration Requirements

- **BigQuery:** Read-only access via Google service account; `@google-cloud/bigquery` npm package
- **Authentication:** JWT tokens (7-day expiry); bcrypt password hashing (cost factor 10)
- **CORS:** Configured to restrict cross-origin API access to known domains
- **Environment Variables:** `JWT_SECRET`, `GOOGLE_APPLICATION_CREDENTIALS_JSON`, `VITE_USE_BIGQUERY`

### 5.4 Performance Requirements

| Metric | Target |
|--------|--------|
| Dashboard load time | < 2 seconds (P95) |
| Orders table load (100 rows) | < 3 seconds (P95) |
| API uptime | ≥ 99.5% |
| Concurrent sellers supported | ≥ 500 |

### 5.5 Security & Compliance

| Control | Status | Detail |
|---------|--------|--------|
| JWT authentication | ✅ Implemented | Tokens issued on login, 7-day expiry |
| Password hashing (bcrypt) | ⚠️ Pre-production blocker | Must implement before supplier access |
| Vendor data isolation | ✅ Implemented | All queries scoped to authenticated vendor ID |
| HTTPS / TLS | ✅ Vercel-managed | Enforced automatically on all endpoints |
| BigQuery access (read-only) | ✅ Service account | No write access granted |
| Data retention | Requirement | 7 years for financial records (compliance) |
| Penetration testing | Required | Before production launch |

---

## 6. Success Metrics & KPIs

### 6.1 North Star Metric

**Finance-related ticket rate per 1,000 active sellers per month**

| Period | Tickets/Month |
|--------|--------------|
| Baseline (Oct 2025 – Jan 2026) | **293** |
| Target at 60 days post-launch | **≤ 176 (−40%)** |
| Stretch goal at 90 days | **≤ 146 (−50%)** |

### 6.2 Operational Impact Metrics

| Metric | Baseline | Target (60 days) | Owner |
|--------|----------|-----------------|-------|
| Finance tickets/month | 293 | ≤ 176 (−40%) | Support |
| Average resolution time | 48 hours | < 24 hours | Support |
| Manual BigQuery pulls/week | ~15 | < 5 | Tech |
| Support hours saved/month | — | ≥ 23 hours | Ops |

### 6.3 Supplier Impact Metrics

| Metric | Target (60 days) | Target (90 days) |
|--------|-----------------|-----------------|
| Monthly active adoption rate | ≥ 50% | ≥ 70% |
| Positive feedback on payout clarity | ≥ 75% | ≥ 80% |
| Self-service reconciliation rate | ≥ 60% | ≥ 75% |
| Statement download rate | ≥ 40% | ≥ 60% |

### 6.4 Data Accuracy & System Reliability

| Metric | Target |
|--------|--------|
| Payout data accuracy vs. ledger | 100% match |
| Discrepancy resolution SLA | ≤ 48 hours |
| Vendor data isolation — zero cross-contamination | 100% |
| System uptime | ≥ 99.5% |

---

## 7. Implementation Roadmap

### Phase 1 — Security Hardening & Production Launch *(Weeks 1–2)*
**Goal:** Fix pre-production security gaps and onboard pilot suppliers

| Task | Owner | Priority |
|------|-------|----------|
| Implement bcrypt password verification in login endpoint | Engineering | Critical |
| Set production JWT secret (cryptographically random) | Engineering | Critical |
| Set Google service account credentials in Vercel | Engineering | Critical |
| QA test against live BigQuery data with 2–3 suppliers | Engineering + Support | High |
| Provision credentials for all 7 pilot suppliers | Operations | High |
| Confirm payout data accuracy with Finance team | Finance | High |

**Exit Criteria:** All 7 pilot suppliers can log in and view their accurate live payout data.

---

### Phase 2 — Controlled Rollout *(Weeks 3–6)*
**Goal:** Expand to all active suppliers, measure impact, resolve issues

| Task | Owner |
|------|-------|
| Onboard remaining active suppliers (ops provisions credentials) | Operations |
| Monitor API error rates and BigQuery query performance | Engineering |
| Collect supplier feedback (in-app survey or email) | Support |
| Resolve data discrepancy reports within 48-hour SLA | Finance + Engineering |
| Track ticket volume reduction vs. baseline | Support |
| Password reset via email flow | Engineering |

**Exit Criteria:**
- ≥ 80% of active suppliers onboarded
- Zero unresolved payout data inaccuracies
- ≥ 20% reduction in finance-related support tickets observed

---

### Phase 3 — Intelligence & Optimisation *(Month 2–3)*
**Goal:** Add predictive features and close UX gaps from Phase 2 feedback

**Candidate Features (prioritised by supplier demand):**
- Payout notifications (email/SMS when payout is processed or held)
- CSV/Excel bulk export for large seller reconciliation
- Predictive eligibility dates (calculated from QC time + return window logic)
- Prior-period income statement comparisons
- Mobile-responsive improvements
- Dynamic trust/quality score from live BigQuery data

**Exit Criteria:** Supplier NPS ≥ 7/10. Finance ticket reduction ≥ 40% sustained.

---

### Phase 4 — Scale & Advanced Features *(Month 3+)*
**Goal:** Build towards a full supplier financial hub

**Future Roadmap:**
- Tax document generation (VAT summaries, annual statements)
- Self-service bank account management with verification
- Payout forecasting (predictive from order pipeline)
- API access for large suppliers to pull data programmatically
- Multi-currency support
- Finance/Ops internal dashboard (seller health monitoring, proactive escalation)

---

## 8. Risks & Mitigation Strategies

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Payout data shown to wrong supplier | Low | Critical | Vendor ID enforced at every query; auth middleware validated on all endpoints |
| Data inaccuracy / payout discrepancy shown to supplier | Medium | Critical | Finance team sign-off before launch; 48h SLA on discrepancy resolution |
| Password security breach (pre-production) | Medium | Critical | Implement bcrypt before any supplier access; rotate dev credentials |
| BigQuery query costs spike under load | Medium | Medium | Add query result caching (Redis/Vercel KV); set GCP cost alerts |
| JWT secret exposure | Low | Critical | Store only in Vercel env vars; never commit to git; rotate regularly |
| Supplier disputes payout amount shown | Medium | High | Read-only from source of truth; add "last refreshed" timestamp |
| Login brute-force attack | Medium | High | Add rate limiting on `/api/auth/login`; monitor failed attempts |
| Support team resistance to change | Medium | Medium | Co-design with support team, gradual rollout, quick win metrics |
| Scope creep during rollout | High | Medium | Strict change control; defer non-essential features to Phase 2/3 |

---

## 9. Dependencies & Assumptions

### 9.1 Technical Dependencies
- Read access to BigQuery financial ledger (`aurora_postgres_public`, `fleek_analytics`)
- Google service account with BigQuery Data Viewer role in GCP project `dogwood-baton-345622`
- Vercel deployment with production environment variables configured
- Email infrastructure for password reset and notifications (Phase 2)

### 9.2 Organisational Dependencies
- **Finance team** sign-off on payout calculation logic and data accuracy before launch
- **Legal/Compliance** review of financial data disclosure and 7-year retention requirement
- **Seller Support** team training on portal and updated escalation workflows
- **Operations** team to provision supplier credentials for initial launch
- **Executive sponsorship** for change management and supplier communication

### 9.3 Assumptions
- Payout cycle cadence (weekly, Monday) remains unchanged during rollout
- All active suppliers have email addresses registered in the `vendors` table in BigQuery
- The Finance team can validate payout calculation accuracy within the Phase 1 timeline
- Suppliers are willing to self-serve once given access (adoption ≥ 50% within 60 days)

---

## 10. Open Questions

| # | Question | Owner | Priority | Target Date |
|---|----------|-------|----------|-------------|
| 1 | Who provisions supplier credentials for initial launch — ops team or automated self-signup? | Operations | High | Before Phase 1 |
| 2 | What is the agreed payout cycle cadence to communicate to suppliers (weekly on Monday)? | Finance | High | Before Phase 1 |
| 3 | Should quality/trust score be dynamic (from BigQuery) or remain static in Phase 1? | Product + Engineering | Medium | Phase 1 scoping |
| 4 | What is the SLA for resolving reported data inaccuracies post-launch? | Finance + Engineering | High | Before Phase 2 |
| 5 | Are there GDPR / data retention requirements for storing supplier credentials and financial data? | Legal / Compliance | High | Before Phase 1 |
| 6 | Should income statements be weekly or monthly periods by default? | Finance | Medium | Before Phase 1 |
| 7 | Is a separate internal Finance/Ops dashboard in scope for Phase 1 or deferred to Phase 4? | Product | Medium | Phase 1 scoping |
| 8 | Will suppliers self-manage their bank details on the portal, or remain ops-managed? | Operations | Low | Phase 3 scoping |

---

*This PRD was prepared based on: (1) internal requirements documentation, (2) Notion product brief, (3) pilot test results across 7 suppliers — 18,785 orders, £1.6M in payout value, and (4) the current codebase state (v1.0.0, live at seller-finance-management.vercel.app). It is a living document and will be updated as requirements evolve.*

*Prepared for stakeholder review — March 2026*
