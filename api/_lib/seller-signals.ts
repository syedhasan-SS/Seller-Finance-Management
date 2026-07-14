/**
 * Seller signals aggregator — single source of truth for what we know about a vendor.
 * Consumed by the home-config rules engine.
 *
 * Contract: NEVER throws. Every field has a typed null/zero default so rules
 * can check for null before acting. BigQuery failures degrade to zeros instead
 * of failing the page.
 *
 * Primary sources (live):
 *   fleek_hub.vendor_details          → identity, signup date, shop name, country
 *   fleek_hub.int_vendor_activity     → uploads, orders, GMV, dormancy_state, cancel rate, rating
 *   fleek_analytics.vendor_payout     → eligible/held/paid order counts (proven in /dashboard)
 *
 * Not in BQ (operational DB; require API extension):
 *   bank account status               → stays stubbed (existing endpoint returns 'none')
 *   profile bio, verified email/phone → stays stubbed
 */

import { executeQuery } from './bigquery';

export type BankStatus = 'none' | 'submitted' | 'under_review' | 'approved' | 'rejected';

export interface SellerSignals {
  // ── Identity / profile ────────────────────────────────────────────────────
  vendorHandle: string;
  /** Numeric vendor_id once resolved from BigQuery; null when unresolved. */
  vendorId: number | null;
  shopName: string;
  email: string;
  bio: string;
  /** 0–1, computed locally from fields present. */
  profileCompletion: number;
  /** TODO: data source needed — auth context only knows email is set, not verified. */
  emailVerified: boolean;
  /** TODO: data source needed. */
  phoneVerified: boolean;
  /** From vendor_details.Vendor_Country. */
  country: string | null;
  /** From int_vendor_activity.vendor_persona (e.g. "PK - Zone"). */
  persona: string | null;
  /** From vendor_details.vendor_status / int_vendor_activity.vendor_status (e.g. ACTIVE / DELETED / INCOMPLETE). */
  vendorStatus: string | null;

  // ── Bank ──────────────────────────────────────────────────────────────────
  bankStatus: BankStatus;
  bankRejectionReason?: string;

  // ── Lifecycle / activity (BigQuery) ──────────────────────────────────────
  /** Real signup date from vendor_details.vendor_sign_up; null if vendor not found. */
  signupDate: string | null;
  /** Derived from signupDate. Null if signup unknown. */
  daysSinceSignup: number | null;
  /** From int_vendor_activity. The canonical 4-state vendor lifecycle. */
  dormancyState: 'never_activated' | 'active' | 'slowing' | 'dormant' | null;

  // ── Listings (BigQuery int_vendor_activity) ──────────────────────────────
  /** Lifetime unique uploads. */
  lifetimeUploads: number;
  /** Uploads in last 30 days. */
  uploadsL30d: number;
  /** Most recent upload date (YYYY-MM-DD) or null. */
  lastUploadDate: string | null;
  daysSinceLastUpload: number | null;

  // ── Orders + GMV ─────────────────────────────────────────────────────────
  lastOrderAt: string | null;
  daysSinceLastOrder: number | null;
  orderCountL30d: number;
  orderCountL90d: number;
  orderCountLifetime: number;
  /** Real GMV L90d (GBP) from int_vendor_activity. We expose L30d as L90d/3 proxy. */
  gmvL30d: number;
  gmvL90d: number;

  // ── Quality ───────────────────────────────────────────────────────────────
  /** 1–5 final vendor rating from int_vendor_activity. */
  vendorRating: number | null;
  /** Share of orders cancelled, L90d. */
  cancellationRateL90d: number | null;
  /** TODO: needs ff_status aggregation; left null in v1. */
  fulfillmentRateL30d: number | null;
  /** From int_vendor_activity — true if vendor has unfulfilled obligations beyond SLA. */
  unfulfillingFlag: boolean;

  // ── Payout state ─────────────────────────────────────────────────────────
  hasEligibleOrders: boolean;
  hasHeldOrders: boolean;
  activeBlockerCount: number;
  hasReceivedFirstPayout: boolean;
  ordersAwaitingFulfillment: number;

  // ── Behaviour gaps (out of v1) ────────────────────────────────────────────
  /** TODO: no auth event log; v2. */
  lastLoginAt: string | null;
}

interface VendorRow {
  vendor_id: number | null;
  vendor_handle: string | null;
  shop_name: string | null;
  vendor_sign_up: string | null;
  Vendor_Country: string | null;
  vendor_status: string | null;
  vendor_persona: string | null;
  final_vendor_rating: number | null;
  tenure_days: number | null;
  last_upload_date: string | null;
  uploads_30d: number | null;
  lifetime_uploads: number | null;
  days_since_last_upload: number | null;
  last_order_date: string | null;
  orders_30d: number | null;
  orders_90d: number | null;
  gmv_90d_gbp: number | null;
  days_since_last_order: number | null;
  cancel_rate_90d: number | null;
  dormancy_state: string | null;
  unfulfilling_flag: boolean | null;
}

interface PayoutAggRow {
  lifetime_orders: number;
  eligible_count: number;
  held_count: number;
  lifetime_paid_orders: number;
}

const HANDLE_PATTERN = /^[a-z0-9_-]+$/i;

function safeHandle(handle: string): string | null {
  return HANDLE_PATTERN.test(handle) ? handle.toLowerCase() : null;
}

async function getVendorActivityRow(vendorId: string): Promise<VendorRow | null> {
  const handle = safeHandle(vendorId);
  const numeric = /^\d+$/.test(vendorId) ? parseInt(vendorId, 10) : null;
  if (!handle && numeric === null) return null;

  const where: string[] = [];
  if (handle) where.push(`LOWER(vd.vendor_handle) = LOWER('${handle}')`);
  if (numeric !== null) where.push(`vd.vendor_id = ${numeric}`);

  const sql = `
    SELECT
      vd.vendor_id,
      vd.vendor_handle,
      vd.shop_name,
      FORMAT_TIMESTAMP('%Y-%m-%dT%H:%M:%SZ', vd.vendor_sign_up) AS vendor_sign_up,
      vd.Vendor_Country,
      iva.vendor_status,
      iva.vendor_persona,
      iva.final_vendor_rating,
      iva.tenure_days,
      CAST(iva.last_upload_date AS STRING) AS last_upload_date,
      iva.uploads_30d,
      iva.lifetime_uploads,
      iva.days_since_last_upload,
      CAST(iva.last_order_date AS STRING) AS last_order_date,
      iva.orders_30d,
      iva.orders_90d,
      iva.gmv_90d_gbp,
      iva.days_since_last_order,
      iva.cancel_rate_90d,
      iva.dormancy_state,
      iva.unfulfilling_flag
    FROM \`dogwood-baton-345622.fleek_hub.vendor_details\` vd
    LEFT JOIN \`dogwood-baton-345622.fleek_hub.int_vendor_activity\` iva
      ON vd.vendor_id = iva.vendor_id
    WHERE ${where.join(' OR ')}
    LIMIT 1
  `;

  try {
    const rows = await executeQuery<VendorRow>(sql);
    return rows[0] ?? null;
  } catch (err) {
    console.warn('[seller-signals] vendor activity query failed:', err);
    return null;
  }
}

async function getPayoutAggregates(vendorId: number): Promise<PayoutAggRow> {
  const empty: PayoutAggRow = {
    lifetime_orders: 0,
    eligible_count: 0,
    held_count: 0,
    lifetime_paid_orders: 0,
  };
  const sql = `
    SELECT
      COUNT(*) AS lifetime_orders,
      COUNTIF(latest_status IN ('eligible', 'in_progress')) AS eligible_count,
      COUNTIF(latest_status = 'held') AS held_count,
      COUNTIF(latest_status = 'paid') AS lifetime_paid_orders
    FROM \`dogwood-baton-345622.fleek_analytics.vendor_payout\`
    WHERE vendor_id = ${vendorId}
  `;
  try {
    const rows = await executeQuery<PayoutAggRow>(sql);
    return rows[0] ?? empty;
  } catch (err) {
    console.warn('[seller-signals] payout aggregate query failed:', err);
    return empty;
  }
}

function computeProfileCompletion(fields: { shopName: string; bio: string; email: string }): number {
  const checks = [
    !!fields.shopName?.trim(),
    !!fields.bio?.trim(),
    !!fields.email?.trim(),
  ];
  return checks.filter(Boolean).length / checks.length;
}

function daysBetween(fromIso: string | null, now: Date): number | null {
  if (!fromIso) return null;
  const t = new Date(fromIso).getTime();
  if (Number.isNaN(t)) return null;
  return Math.floor((now.getTime() - t) / (1000 * 60 * 60 * 24));
}

function normalizeDormancy(s: string | null): SellerSignals['dormancyState'] {
  if (!s) return null;
  const lower = s.toLowerCase();
  if (['never_activated', 'active', 'slowing', 'dormant'].includes(lower)) {
    return lower as SellerSignals['dormancyState'];
  }
  return null;
}

interface SignalSeed {
  vendorHandle: string;
  /** From the JWT (auth-middleware). Available when called from an authenticated request. */
  email?: string;
  /** Stub fields the operational DB will populate later. */
  shopName?: string;
  bio?: string;
  bankStatus?: BankStatus;
  bankRejectionReason?: string;
}

export async function getSellerSignals(vendorId: string, seed: SignalSeed): Promise<SellerSignals> {
  const now = new Date();
  const row = await getVendorActivityRow(vendorId);

  const resolvedId = row?.vendor_id ?? null;
  const payoutAgg = resolvedId !== null ? await getPayoutAggregates(resolvedId) : {
    lifetime_orders: 0,
    eligible_count: 0,
    held_count: 0,
    lifetime_paid_orders: 0,
  };

  const shopName = seed.shopName ?? row?.shop_name ?? seed.vendorHandle;
  const bio = seed.bio ?? '';
  const email = seed.email ?? '';
  const bankStatus = seed.bankStatus ?? 'none';

  const signupDate = row?.vendor_sign_up ?? null;
  const daysSinceSignup = row?.tenure_days ?? daysBetween(signupDate, now);

  const dormancyState = normalizeDormancy(row?.dormancy_state ?? null);

  // L30d GMV: int_vendor_activity exposes L90d; for v1 we expose L90d / 3 as a
  // smoothed L30d proxy. Phase 2 should query a real L30d aggregate.
  const gmvL90d = row?.gmv_90d_gbp ?? 0;
  const gmvL30dProxy = gmvL90d / 3;

  const orderCountL30d = row?.orders_30d ?? 0;
  const orderCountL90d = row?.orders_90d ?? 0;
  const orderCountLifetime = payoutAgg.lifetime_orders;

  return {
    // identity
    vendorHandle: row?.vendor_handle ?? seed.vendorHandle,
    vendorId: resolvedId,
    shopName,
    email,
    bio,
    profileCompletion: computeProfileCompletion({ shopName, bio, email }),
    emailVerified: false, // TODO
    phoneVerified: false, // TODO
    country: row?.Vendor_Country ?? null,
    persona: row?.vendor_persona ?? null,
    vendorStatus: row?.vendor_status ?? null,

    // bank
    bankStatus,
    bankRejectionReason: seed.bankRejectionReason,

    // lifecycle
    signupDate,
    daysSinceSignup,
    dormancyState,

    // listings
    lifetimeUploads: row?.lifetime_uploads ?? 0,
    uploadsL30d: row?.uploads_30d ?? 0,
    lastUploadDate: row?.last_upload_date ?? null,
    daysSinceLastUpload: row?.days_since_last_upload ?? null,

    // orders + GMV
    lastOrderAt: row?.last_order_date ?? null,
    daysSinceLastOrder: row?.days_since_last_order ?? null,
    orderCountL30d,
    orderCountL90d,
    orderCountLifetime,
    gmvL30d: gmvL30dProxy,
    gmvL90d,

    // quality
    vendorRating: row?.final_vendor_rating ?? null,
    cancellationRateL90d: row?.cancel_rate_90d ?? null,
    fulfillmentRateL30d: null, // TODO Phase 2: aggregate ff_status
    unfulfillingFlag: row?.unfulfilling_flag ?? false,

    // payout
    hasEligibleOrders: payoutAgg.eligible_count > 0,
    hasHeldOrders: payoutAgg.held_count > 0,
    activeBlockerCount: payoutAgg.held_count + (bankStatus === 'rejected' ? 1 : 0),
    hasReceivedFirstPayout: payoutAgg.lifetime_paid_orders > 0,
    ordersAwaitingFulfillment: payoutAgg.eligible_count,

    // behaviour gaps
    lastLoginAt: null, // TODO
  };
}
