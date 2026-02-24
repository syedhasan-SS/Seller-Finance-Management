# Product Requirements Document
## Seller Finance Management Portal
**Version:** 1.0
**Date:** February 2026
**Status:** Ready for Stakeholder Review
**Author:** Product Team

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Goals & Success Metrics](#3-goals--success-metrics)
4. [Users & Stakeholders](#4-users--stakeholders)
5. [Product Overview](#5-product-overview)
6. [Feature Requirements](#6-feature-requirements)
7. [Technical Architecture](#7-technical-architecture)
8. [Data Model & Integrations](#8-data-model--integrations)
9. [Security & Compliance](#9-security--compliance)
10. [Phased Rollout Plan](#10-phased-rollout-plan)
11. [Risks & Mitigations](#11-risks--mitigations)
12. [Open Questions](#12-open-questions)

---

## 1. Executive Summary

The **Seller Finance Management Portal** is a self-service web application that gives marketplace suppliers real-time visibility into their payout timelines, order-level financial breakdowns, and payment status — eliminating their current reliance on manual support requests to understand when and how much they will be paid.

**Current State:** MVP built and pilot-tested across 7 suppliers covering **18,785 orders** and **£1.6M in payout value**. Results validated. Ready for production deployment.

**Business Impact:**
- Reduce supplier support tickets related to payment inquiries
- Increase supplier trust and retention through financial transparency
- Enable the operations team to scale supplier onboarding without proportional support overhead

---

## 2. Problem Statement

### For Suppliers
Marketplace suppliers currently have no self-service way to:
- Know when their next payout will arrive or how much it will be
- Understand which specific orders are included in an upcoming payout
- Identify what is blocking or delaying a payment
- View a breakdown of how their payout amount was calculated (commissions, refunds, fees)

As a result, suppliers frequently contact support for payment status updates — creating friction, eroding trust, and consuming operations bandwidth.

### For Operations / Finance
- Support agents must manually query internal systems to answer "when do I get paid?" questions
- There is no structured way to surface payment blockers to suppliers proactively
- The lack of transparency creates disputes when payout amounts don't match supplier expectations

### Opportunity
By surfacing the financial data already available in our BigQuery data warehouse directly to suppliers through a clean, self-service portal, we can eliminate a significant category of support requests and meaningfully improve supplier satisfaction.

---

## 3. Goals & Success Metrics

### Primary Goals
| Goal | Metric | Target |
|------|--------|--------|
| Reduce payment-related support tickets | % reduction in payment inquiry tickets | ≥ 40% within 60 days of launch |
| Improve supplier payment transparency | Suppliers who understand their payout breakdown | ≥ 80% (via post-launch survey) |
| Achieve supplier self-service adoption | % of active suppliers logging in monthly | ≥ 70% within 90 days |
| Establish data accuracy baseline | Payout amounts matching actuals | 100% (zero tolerance) |

### Secondary Goals
- Reduce average time-to-resolution for payment disputes
- Establish foundation for future supplier financial tooling (invoicing, tax documents, forecasting)

---

## 4. Users & Stakeholders

### Primary Users — Marketplace Suppliers
Sellers who list and fulfil products on the marketplace. They need to understand:
- When they'll be paid
- How much they'll receive
- Why an order is held or excluded

**Characteristics:**
- Non-technical users; expect a clean, simple interface
- May manage multiple order lines simultaneously
- Operate in GBP; UK-based or UK-transacting

### Internal Stakeholders
| Stakeholder | Role | Interest |
|-------------|------|----------|
| Operations Team | Day-to-day | Reduced supplier payment queries |
| Finance Team | Data accuracy | Correct payout calculations surfaced to suppliers |
| Engineering | Build & maintain | Clear specs, secure architecture |
| Leadership / Exec | Strategic | Supplier NPS, support cost reduction |

---

## 5. Product Overview

### Pages & Navigation

```
/ (Login)
├── /dashboard       → Payout overview, recent orders, blockers, trust score
├── /orders          → Full order table with all financial fields, search & filter
└── /income-statement
    └── /:statementId → Line-by-line P&L breakdown for a given period
```

### High-Level User Journey
1. Supplier receives an email with their portal link
2. They log in with email + password credentials (provisioned by ops team)
3. They land on the **Dashboard**, which shows:
   - Upcoming payout amount + estimated date
   - Current payment cycle progress
   - Active blockers (if any)
   - Trust/risk score
4. They can drill into **Orders** to see a full breakdown of every order and its financial impact
5. They can view their **Income Statement** for a period-level P&L summary

---

## 6. Feature Requirements

### 6.1 Authentication & Access

| ID | Requirement | Priority |
|----|-------------|----------|
| AUTH-1 | Suppliers log in with email and password | Must Have |
| AUTH-2 | Sessions are managed via JWT tokens (short-lived, secure) | Must Have |
| AUTH-3 | Passwords stored as bcrypt hashes — no plain-text storage | Must Have |
| AUTH-4 | Each supplier only sees their own data (vendor ID-scoped) | Must Have |
| AUTH-5 | Failed login attempts surface a clear error message | Must Have |
| AUTH-6 | Session timeout after inactivity | Should Have |
| AUTH-7 | Password reset via email flow | Should Have |

---

### 6.2 Dashboard

The main landing page after login. Gives a at-a-glance view of the supplier's financial position.

| ID | Requirement | Priority |
|----|-------------|----------|
| DASH-1 | Display upcoming payout amount (GBP) | Must Have |
| DASH-2 | Display estimated payout date and days remaining | Must Have |
| DASH-3 | Show payout confidence level (High / Medium / Low) | Must Have |
| DASH-4 | Render a payout timeline showing current stage in the payment cycle | Must Have |
| DASH-5 | List active blockers preventing or delaying payout with explanation | Must Have |
| DASH-6 | Show trust/quality score with trend (improving / stable / declining) | Must Have |
| DASH-7 | Display payout history (last 5 payouts) with amount, date, order count | Must Have |
| DASH-8 | Show recent orders table with status indicators | Must Have |
| DASH-9 | Manual refresh button to reload live data | Should Have |
| DASH-10 | Loading and error states for all data sections | Must Have |

---

### 6.3 Orders Table

Full financial breakdown across all of a supplier's order lines.

#### Display Fields (all 14 required fields)
| # | Field | Description |
|---|-------|-------------|
| 1 | Internal Order ID | Platform-level order identifier |
| 2 | Product Name | Item title as listed on the marketplace |
| 3 | Vendor | Supplier handle |
| 4 | Payout Status | `eligible` / `pending_eligibility` / `held` / `paid` / `failed` / `cancelled` |
| 5 | Created At | Order creation date |
| 6 | Latest Status | Most recent fulfilment/QC status |
| 7 | Includes Shipping | Boolean flag |
| 8 | Original Final Base (£) | Base price before any deductions |
| 9 | Commission (%) | Marketplace commission rate |
| 10 | Original Commission (£) | Commission amount deducted |
| 11 | Base After Commission (£) | Net base after commission |
| 12 | Vendor Shipping Cost (£) | Shipping amount attributable to supplier |
| 13 | Supplier Refund (£) | Refund amount deducted |
| 14 | Cancellation Fee (£) | Fee applied for cancellations |
| 15 | Total Paid Amount (£) | Final payout amount for this order line |

#### Functional Requirements
| ID | Requirement | Priority |
|----|-------------|----------|
| ORD-1 | Display all 14 financial fields per order line | Must Have |
| ORD-2 | Filter orders by payout status | Must Have |
| ORD-3 | Search orders by order number, internal ID, or product name | Must Have |
| ORD-4 | Paginate results (default 100 per page) | Must Have |
| ORD-5 | Sort by date, amount, or status | Should Have |
| ORD-6 | Display order-level hold reasons when status is `held` | Must Have |
| ORD-7 | Show QC status and fulfilment status per order | Should Have |
| ORD-8 | Export orders to CSV | Nice to Have |

---

### 6.4 Income Statement

Period-level financial summary view.

| ID | Requirement | Priority |
|----|-------------|----------|
| INC-1 | List available statement periods (weekly/monthly) | Must Have |
| INC-2 | Show revenue, commission, fees, refunds, and net payout per period | Must Have |
| INC-3 | Drill down into a specific statement for line-by-line breakdown | Must Have |
| INC-4 | Display running totals and comparisons to prior period | Should Have |

---

### 6.5 Payout Timeline

Visual representation of the payment processing stages.

| ID | Requirement | Priority |
|----|-------------|----------|
| TL-1 | Show payment cycle stages (Order Received → QC → Eligibility → Payout) | Must Have |
| TL-2 | Highlight the current stage for the active payout | Must Have |
| TL-3 | Show date milestones for completed and upcoming stages | Must Have |
| TL-4 | Mark stages blocked by active holds | Must Have |

---

### 6.6 Trust Score & Active Blockers

Transparency into risk factors and payment holds.

| ID | Requirement | Priority |
|----|-------------|----------|
| TS-1 | Display numerical trust/quality score (0–100) | Must Have |
| TS-2 | Show risk level: Low / Medium / High | Must Have |
| TS-3 | List top score drivers (negative and positive factors) with impact | Must Have |
| TS-4 | Show score trend over time | Should Have |
| BLK-1 | List all active payment blockers with reason code and description | Must Have |
| BLK-2 | Indicate severity level per blocker (Info / Warning / Error) | Must Have |
| BLK-3 | Show estimated resolution timeline per blocker | Must Have |
| BLK-4 | Surface action buttons where the supplier can resolve a blocker | Nice to Have |

---

## 7. Technical Architecture

### System Diagram

```
Supplier Browser
      │
      ▼
  Vercel CDN  ──── Static Assets (React SPA) ──▶ Tailwind / Lucide UI
      │
      ▼
Vercel Serverless Functions (/api/*)
      │
      ├── POST /api/auth/login        → Authenticate, return JWT
      ├── GET  /api/sellers/:id/payout → Payout summary, history, trust score
      └── GET  /api/sellers/:id/orders → Order lines with 14 financial fields
      │
      ▼
  Google BigQuery
  ├── aurora_postgres_public.balance_transaction   (financial ledger)
  ├── aurora_postgres_public.payout                (payout records)
  ├── aurora_postgres_public.vendors               (supplier registry)
  └── fleek_analytics.vendor_payout                (enriched order data)
```

### Frontend
| Concern | Technology |
|---------|------------|
| Framework | React 18.3 + TypeScript 5.5 |
| Routing | React Router v7 |
| Styling | Tailwind CSS 3.4 |
| Icons | Lucide React |
| Build Tool | Vite 5.4 |
| Bundle Size | ~69–128 KB (gzipped) |

### Backend
| Concern | Technology |
|---------|------------|
| API Runtime | Vercel Serverless Functions (Node.js) |
| Auth | JWT (`jsonwebtoken`) + bcrypt (`bcryptjs`) |
| BigQuery Client | `@google-cloud/bigquery` v8 |
| CORS | `cors` middleware |

### Key Environment Variables
| Variable | Purpose |
|----------|---------|
| `JWT_SECRET` | Signing key for JWTs — must be a long, random string |
| `GOOGLE_APPLICATION_CREDENTIALS` | Service account JSON for BigQuery access |
| `VITE_USE_BIGQUERY` | `true` for production, `false` for dev/sample data |
| `VITE_BIGQUERY_PROJECT_ID` | GCP project ID (`dogwood-baton-345622`) |

---

## 8. Data Model & Integrations

### Core Data Entities

#### Order Line (`balance_transaction` + `vendor_payout`)
```
order_line_id          → Unique order line identifier
internal_order_id      → Platform order reference
destination_id         → Vendor/supplier ID
status                 → eligible | pending_eligibility | held | paid | failed | cancelled
final_base_smallest_unit      → Base price (pence)
commission_percentage         → Commission rate
shipping_amount_smallest_unit → Shipping cost (pence)
refund_amount_smallest_unit   → Refund (pence)
cancellation_fee_smallest_unit → Cancellation fee (pence)
total_payable_smallest_unit   → Net payout (pence)
created_at             → Order date
```

#### Payout Record (`payout`)
```
id                     → Payout batch ID
destination_id         → Vendor ID
amount_smallest_unit   → Total payout (pence)
status                 → completed | pending | failed
created_at             → Payout date
```

#### Vendor (`vendors`)
```
id                     → Numeric vendor ID
handle                 → URL-friendly vendor slug (e.g. "vibe-vintage")
email                  → Login email
password_hash          → bcrypt hash
```

### BigQuery Access Pattern
- All queries are **read-only** (SELECT only)
- Queries are vendor-scoped: `WHERE CAST(destination_id AS INT64) = :vendorId`
- Soft-delete filtering: `WHERE _fivetran_deleted = FALSE`
- All monetary values stored in smallest unit (pence); divided by 100 before display

---

## 9. Security & Compliance

### Current Status
| Control | Status | Notes |
|---------|--------|-------|
| JWT authentication | ✅ Implemented | Tokens issued on login |
| Password hashing (bcrypt) | ⚠️ Pending | Login endpoint currently accepts any password — **MUST fix before production** |
| JWT secret hardening | ⚠️ Pending | Placeholder secret in code — **MUST set real `JWT_SECRET` env var** |
| Vendor data isolation | ✅ Implemented | All queries scoped to authenticated vendor ID |
| HTTPS / TLS | ✅ Vercel-managed | Enforced automatically |
| BigQuery access (read-only) | ✅ Service account | No write access |
| CORS policy | ✅ Configured | Restricts cross-origin API access |

### Pre-Production Security Checklist
- [ ] Implement `bcrypt.compare(password, supplier.password_hash)` in `/api/auth/login.ts` (line 67)
- [ ] Set `JWT_SECRET` to a cryptographically random 64-character string in Vercel environment
- [ ] Set `VITE_USE_BIGQUERY=true` and configure BigQuery service account in Vercel
- [ ] Rotate any credentials used during development/piloting
- [ ] Review Vercel function logs access controls

---

## 10. Phased Rollout Plan

### Phase 1 — Security Hardening & Production Launch (Week 1–2)
**Goal:** Fix the two security gaps and deploy to production on Vercel.

**Tasks:**
- Implement bcrypt password verification in login endpoint
- Set production JWT secret and BigQuery credentials in Vercel environment
- Switch `VITE_USE_BIGQUERY=true`
- QA test against live BigQuery data with 1–2 suppliers
- Deploy to Vercel production URL
- Provision credentials for all 7 pilot suppliers

**Exit Criteria:** All 7 pilot suppliers can log in and view their live payout data.

---

### Phase 2 — Controlled Rollout (Week 3–6)
**Goal:** Expand to all active suppliers, gather feedback, resolve issues.

**Tasks:**
- Onboard remaining active suppliers (ops team provisions credentials)
- Monitor API error rates and BigQuery query performance
- Collect supplier feedback (short in-app survey or email)
- Resolve any data discrepancy reports immediately
- Add email notification for upcoming payout (optional, ops-driven)

**Exit Criteria:**
- ≥ 80% of active suppliers onboarded
- Zero unresolved payout data inaccuracies
- Support ticket volume for payment queries measurably reduced

---

### Phase 3 — Optimisation & Feature Expansion (Month 2–3)
**Goal:** Improve UX and add highest-value missing features based on Phase 2 feedback.

**Candidate Features (prioritised by supplier demand):**
- Password reset via email
- CSV export of orders
- Payout notifications (email alerts when payout is processed)
- Prior-period income statement comparisons
- Mobile-responsive improvements

**Exit Criteria:** NPS from supplier feedback ≥ 7/10. Support ticket reduction ≥ 40%.

---

### Phase 4 — Scale & Advanced Features (Month 3+)
**Goal:** Build towards a full supplier financial hub.

**Future Roadmap Items:**
- Tax document generation (VAT summaries)
- Bank account management (self-service updates with verification)
- Payout forecasting (predictive models from order pipeline)
- Multi-currency support
- API access for larger suppliers to pull data programmatically

---

## 11. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Payout data shown to wrong supplier | Low | Critical | Vendor ID enforced at every query; auth middleware validated |
| BigQuery query costs spike under load | Medium | Medium | Add query result caching (Redis or Vercel KV); set BigQuery cost alerts |
| Supplier disputes payout amount shown | Medium | High | Data is read-only from source of truth; add "last refreshed" timestamp for clarity |
| Login brute-force attack | Medium | High | Add rate limiting on `/api/auth/login`; monitor failed attempts |
| JWT secret exposure | Low | Critical | Store only in Vercel env vars; rotate regularly; never commit to git |
| Supplier loses access credentials | High | Low | Implement self-service password reset (Phase 3); ops team can re-provision in interim |

---

## 12. Open Questions

| # | Question | Owner | Target Resolution |
|---|----------|-------|-------------------|
| 1 | Who provisions supplier credentials for initial launch — ops team or automated? | Operations | Before Phase 1 launch |
| 2 | What is the agreed payout cycle cadence communicated to suppliers (weekly, bi-weekly)? | Finance | Before Phase 1 launch |
| 3 | Should trust score logic be dynamic (from BigQuery) or remain static in Phase 1? | Product / Engineering | Phase 1 scoping |
| 4 | What is the SLA for resolving reported data inaccuracies post-launch? | Finance / Engineering | Before Phase 2 |
| 5 | Are there GDPR / data retention requirements for storing supplier credentials? | Legal / Compliance | Before Phase 1 launch |
| 6 | Should income statements be weekly or monthly periods by default? | Finance | Before Phase 1 launch |

---

*This PRD was prepared based on the current codebase state (v1.0.0), pilot test results across 7 suppliers, and stakeholder conversations. It is a living document and will be updated as requirements evolve.*
