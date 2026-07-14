/**
 * /api/admin/seller-progress
 *
 * Returns a list of suppliers with their journey-stage signals so admins can
 * see who's stuck, who just activated, etc.
 *
 * Strategy:
 *   - Default cohort: top-GMV active + recently-signed-up new + slowing + dormant
 *     (a balanced 14-vendor sample for the demo)
 *   - Override: ?vendors=handle1,handle2,…
 *   - All signals come from int_vendor_activity + vendor_details directly via
 *     a single grouped query (no per-vendor round-trip).
 */

import type { VercelResponse } from '@vercel/node';
import { requireAdmin } from '../require-admin';
import { AuthenticatedRequest } from '../auth-middleware';
import { executeQuery } from '../bigquery';
import { classifyLifecycle } from '../home-rules/lifecycle';
import type { SellerSignals } from '../seller-signals';
import type { SupplierProgress } from '../admin-content-types';
import { listTasks } from '../admin-store';
import { evaluateConditions } from '../home-rules/conditions';

const HANDLE_PATTERN = /^[a-z0-9_-]+$/i;

interface CohortRow {
  vendor_id: number | null;
  vendor_handle: string;
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

const DEFAULT_COHORT_SQL = `
  (
    SELECT vd.vendor_id, vd.vendor_handle, vd.shop_name, vd.vendor_sign_up, vd.Vendor_Country,
           iva.vendor_status, iva.vendor_persona, iva.final_vendor_rating, iva.tenure_days,
           CAST(iva.last_upload_date AS STRING) AS last_upload_date, iva.uploads_30d,
           iva.lifetime_uploads, iva.days_since_last_upload,
           CAST(iva.last_order_date AS STRING) AS last_order_date,
           iva.orders_30d, iva.orders_90d, iva.gmv_90d_gbp,
           iva.days_since_last_order, iva.cancel_rate_90d, iva.dormancy_state, iva.unfulfilling_flag
    FROM \`dogwood-baton-345622.fleek_hub.vendor_details\` vd
    JOIN \`dogwood-baton-345622.fleek_hub.int_vendor_activity\` iva USING (vendor_id)
    WHERE iva.dormancy_state = 'active' AND iva.vendor_status = 'ACTIVE'
    ORDER BY iva.gmv_90d_gbp DESC NULLS LAST LIMIT 5
  )
  UNION ALL
  (
    SELECT vd.vendor_id, vd.vendor_handle, vd.shop_name, vd.vendor_sign_up, vd.Vendor_Country,
           iva.vendor_status, iva.vendor_persona, iva.final_vendor_rating, iva.tenure_days,
           CAST(iva.last_upload_date AS STRING), iva.uploads_30d, iva.lifetime_uploads,
           iva.days_since_last_upload, CAST(iva.last_order_date AS STRING),
           iva.orders_30d, iva.orders_90d, iva.gmv_90d_gbp,
           iva.days_since_last_order, iva.cancel_rate_90d, iva.dormancy_state, iva.unfulfilling_flag
    FROM \`dogwood-baton-345622.fleek_hub.vendor_details\` vd
    JOIN \`dogwood-baton-345622.fleek_hub.int_vendor_activity\` iva USING (vendor_id)
    WHERE iva.dormancy_state = 'never_activated' AND iva.vendor_status = 'ACTIVE'
      AND iva.tenure_days BETWEEN 1 AND 60
    ORDER BY iva.tenure_days DESC LIMIT 3
  )
  UNION ALL
  (
    SELECT vd.vendor_id, vd.vendor_handle, vd.shop_name, vd.vendor_sign_up, vd.Vendor_Country,
           iva.vendor_status, iva.vendor_persona, iva.final_vendor_rating, iva.tenure_days,
           CAST(iva.last_upload_date AS STRING), iva.uploads_30d, iva.lifetime_uploads,
           iva.days_since_last_upload, CAST(iva.last_order_date AS STRING),
           iva.orders_30d, iva.orders_90d, iva.gmv_90d_gbp,
           iva.days_since_last_order, iva.cancel_rate_90d, iva.dormancy_state, iva.unfulfilling_flag
    FROM \`dogwood-baton-345622.fleek_hub.vendor_details\` vd
    JOIN \`dogwood-baton-345622.fleek_hub.int_vendor_activity\` iva USING (vendor_id)
    WHERE iva.dormancy_state = 'slowing' AND iva.vendor_status = 'ACTIVE'
    ORDER BY iva.tenure_days DESC LIMIT 3
  )
  UNION ALL
  (
    SELECT vd.vendor_id, vd.vendor_handle, vd.shop_name, vd.vendor_sign_up, vd.Vendor_Country,
           iva.vendor_status, iva.vendor_persona, iva.final_vendor_rating, iva.tenure_days,
           CAST(iva.last_upload_date AS STRING), iva.uploads_30d, iva.lifetime_uploads,
           iva.days_since_last_upload, CAST(iva.last_order_date AS STRING),
           iva.orders_30d, iva.orders_90d, iva.gmv_90d_gbp,
           iva.days_since_last_order, iva.cancel_rate_90d, iva.dormancy_state, iva.unfulfilling_flag
    FROM \`dogwood-baton-345622.fleek_hub.vendor_details\` vd
    JOIN \`dogwood-baton-345622.fleek_hub.int_vendor_activity\` iva USING (vendor_id)
    WHERE iva.dormancy_state = 'dormant' AND iva.vendor_status = 'ACTIVE'
    ORDER BY iva.tenure_days DESC LIMIT 3
  )
`;

function cohortByHandlesSql(handles: string[]): string {
  const list = handles.map((h) => `'${h.toLowerCase()}'`).join(',');
  return `
    SELECT vd.vendor_id, vd.vendor_handle, vd.shop_name, vd.vendor_sign_up, vd.Vendor_Country,
           iva.vendor_status, iva.vendor_persona, iva.final_vendor_rating, iva.tenure_days,
           CAST(iva.last_upload_date AS STRING) AS last_upload_date, iva.uploads_30d,
           iva.lifetime_uploads, iva.days_since_last_upload,
           CAST(iva.last_order_date AS STRING) AS last_order_date,
           iva.orders_30d, iva.orders_90d, iva.gmv_90d_gbp,
           iva.days_since_last_order, iva.cancel_rate_90d, iva.dormancy_state, iva.unfulfilling_flag
    FROM \`dogwood-baton-345622.fleek_hub.vendor_details\` vd
    LEFT JOIN \`dogwood-baton-345622.fleek_hub.int_vendor_activity\` iva
      ON vd.vendor_id = iva.vendor_id
    WHERE LOWER(vd.vendor_handle) IN (${list})
  `;
}

function rowToSignals(r: CohortRow): SellerSignals {
  const gmvL90d = r.gmv_90d_gbp ?? 0;
  return {
    vendorHandle: r.vendor_handle,
    vendorId: r.vendor_id ?? null,
    shopName: r.shop_name ?? r.vendor_handle,
    email: '',
    bio: '',
    profileCompletion: r.shop_name ? 1 / 3 : 0,
    emailVerified: false,
    phoneVerified: false,
    country: r.Vendor_Country ?? null,
    persona: r.vendor_persona ?? null,
    vendorStatus: r.vendor_status ?? null,
    bankStatus: 'none',
    signupDate: r.vendor_sign_up ?? null,
    daysSinceSignup: r.tenure_days ?? null,
    dormancyState:
      r.dormancy_state === 'never_activated' || r.dormancy_state === 'active'
        || r.dormancy_state === 'slowing' || r.dormancy_state === 'dormant'
        ? (r.dormancy_state as SellerSignals['dormancyState'])
        : null,
    lifetimeUploads: r.lifetime_uploads ?? 0,
    uploadsL30d: r.uploads_30d ?? 0,
    lastUploadDate: r.last_upload_date ?? null,
    daysSinceLastUpload: r.days_since_last_upload ?? null,
    lastOrderAt: r.last_order_date ?? null,
    daysSinceLastOrder: r.days_since_last_order ?? null,
    orderCountL30d: r.orders_30d ?? 0,
    orderCountL90d: r.orders_90d ?? 0,
    orderCountLifetime: 0, // not needed for progress dashboard
    gmvL30d: gmvL90d / 3,
    gmvL90d,
    vendorRating: r.final_vendor_rating ?? null,
    cancellationRateL90d: r.cancel_rate_90d ?? null,
    fulfillmentRateL30d: null,
    unfulfillingFlag: r.unfulfilling_flag ?? false,
    hasEligibleOrders: false,
    hasHeldOrders: false,
    activeBlockerCount: 0,
    hasReceivedFirstPayout: (r.orders_90d ?? 0) > 0,
    ordersAwaitingFulfillment: 0,
    lastLoginAt: null,
  };
}

export default requireAdmin(async (req: AuthenticatedRequest, res: VercelResponse) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const param = (req.query?.vendors as string) || '';
  const handles = param
    ? param
        .split(',')
        .map((v) => v.trim())
        .filter((v) => HANDLE_PATTERN.test(v))
    : [];

  const sql = handles.length > 0 ? cohortByHandlesSql(handles) : DEFAULT_COHORT_SQL;

  let rows: CohortRow[] = [];
  try {
    rows = await executeQuery<CohortRow>(sql);
  } catch (err: any) {
    console.error('[seller-progress] cohort query failed:', err);
    return res.status(500).json({ error: 'cohort query failed', message: err?.message });
  }

  const adminTasks = listTasks().filter((t) => t.enabled);

  const out: SupplierProgress[] = rows.map((r) => {
    const signals = rowToSignals(r);
    const lifecycle = classifyLifecycle(signals);
    const openTasksCount = adminTasks.filter((t) =>
      evaluateConditions(t.conditions, { signals, lifecycle })
    ).length;
    return {
      vendorId: r.vendor_handle, // SupplierProgress.vendorId is a string; use handle for UI
      shopName: signals.shopName,
      lifecycle,
      profileCompletion: signals.profileCompletion,
      bankStatus: signals.bankStatus,
      hasFirstListing: signals.lifetimeUploads > 0,
      hasFirstOrder: signals.orderCountL90d > 0 || signals.lastOrderAt != null,
      hasReceivedPayout: signals.hasReceivedFirstPayout,
      daysSinceSignup: signals.daysSinceSignup,
      lastOrderAt: signals.lastOrderAt,
      openTasksCount,
    };
  });

  return res.status(200).json({ rows: out });
});
