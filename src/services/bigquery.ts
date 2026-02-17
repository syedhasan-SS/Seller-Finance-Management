/**
 * BigQuery Service Layer
 *
 * This service abstracts all BigQuery queries for the seller finance portal.
 * It replicates the data logic from Metabase Dashboard 71 (Vendor Payouts).
 *
 * Key tables:
 * - fleek_analytics.vendor_payout (primary view)
 * - aurora_postgres_public.balance_transaction (financial ledger)
 * - aurora_postgres_public.payout (payout records)
 * - aurora_postgres_public.vendors (seller profiles)
 */

import type {
  PayoutData,
  Order,
  OrderDetailView,
  PayoutHistoryItem,
  ActiveBlocker,
  TrustScore,
} from '../types';

// BigQuery project configuration
const PROJECT_ID = 'dogwood-baton-345622';

/**
 * Execute a BigQuery SQL query using MCP tool
 */
async function executeQuery<T = any>(sql: string): Promise<T[]> {
  try {
    // Note: This would use the MCP BigQuery tool
    // For now, returning mock data structure
    console.log('Executing BigQuery query:', sql);

    // TODO: Implement actual MCP tool call
    // const result = await mcp__bigquery__execute_sql({ sql, dry_run: false });
    // return parseQueryResults(result);

    return [];
  } catch (error) {
    console.error('BigQuery query failed:', error);
    throw new Error(`Failed to execute query: ${error.message}`);
  }
}

/**
 * Get vendor ID from vendor handle
 */
export async function getVendorId(vendorHandle: string): Promise<string | null> {
  const sql = `
    SELECT id
    FROM \`${PROJECT_ID}.aurora_postgres_public.vendors\`
    WHERE handle = '${vendorHandle}'
    AND _fivetran_deleted = FALSE
    LIMIT 1
  `;

  const results = await executeQuery<{ id: string }>(sql);
  return results.length > 0 ? results[0].id : null;
}

/**
 * Get seller's upcoming payout data
 * Aggregates eligible orders, calculates totals, and determines next payout date
 */
export async function getSellerPayoutData(vendorId: string): Promise<PayoutData> {
  // Get upcoming payout summary
  const summarySQL = `
    SELECT
      COUNT(*) AS eligible_order_count,
      SUM(CASE WHEN status = 'eligible' THEN total_payable_smallest_unit ELSE 0 END) / 100.0 AS eligible_amount_gbp,
      SUM(CASE WHEN status = 'pending_eligibility' THEN total_payable_smallest_unit ELSE 0 END) / 100.0 AS pending_amount_gbp,
      MIN(CASE WHEN status = 'pending_eligibility' THEN created_at END) AS earliest_pending_date,
      MAX(created_at) AS latest_order_date
    FROM \`${PROJECT_ID}.aurora_postgres_public.balance_transaction\`
    WHERE destination_id = '${vendorId}'
      AND _fivetran_deleted = FALSE
      AND status IN ('eligible', 'pending_eligibility')
      AND payout_id IS NULL
  `;

  const summaryResults = await executeQuery<{
    eligible_order_count: number;
    eligible_amount_gbp: number;
    pending_amount_gbp: number;
    earliest_pending_date: string | null;
    latest_order_date: string | null;
  }>(summarySQL);

  const summary = summaryResults[0] || {
    eligible_order_count: 0,
    eligible_amount_gbp: 0,
    pending_amount_gbp: 0,
    earliest_pending_date: null,
    latest_order_date: null,
  };

  // Calculate next payout date (next Monday)
  const today = new Date();
  const daysUntilMonday = (8 - today.getDay()) % 7 || 7;
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + daysUntilMonday);
  nextMonday.setHours(0, 0, 0, 0);

  // Get orders
  const orders = await getSellerOrders(vendorId);

  // Get active blockers
  const blockers = await getActiveBlockers(vendorId);

  // Get trust score
  const trustScore = await getTrustScore(vendorId);

  // Get payout history
  const payoutHistory = await getPayoutHistory(vendorId, 5);

  // Calculate confidence based on blockers
  const confidence = blockers.length === 0 ? 'high' :
                    blockers.some(b => b.severity === 'high') ? 'low' : 'medium';

  const totalAmount = summary.eligible_amount_gbp + summary.pending_amount_gbp;

  return {
    sellerId: vendorId,
    currentCycle: nextMonday.toISOString().split('T')[0],
    estimatedPayoutDate: nextMonday.toISOString().split('T')[0],
    confidence: confidence as 'high' | 'medium' | 'low',
    totalAmount,
    daysUntilPayout: daysUntilMonday,
    orders,
    activeBlockers: blockers,
    trustScore,
    payoutHistory,
  };
}

/**
 * Get seller's orders with payout status
 */
export async function getSellerOrders(
  vendorId: string,
  filters?: {
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }
): Promise<Order[]> {
  const { status, search, limit = 100, offset = 0 } = filters || {};

  let whereClause = `
    WHERE bt.destination_id = '${vendorId}'
      AND bt._fivetran_deleted = FALSE
      AND bt.status NOT IN ('failed', 'cancelled')
  `;

  if (status && status !== 'all') {
    whereClause += ` AND bt.status = '${status}'`;
  }

  if (search) {
    whereClause += ` AND (
      CAST(vp.order_number AS STRING) LIKE '%${search}%'
      OR vp.internal_order_id LIKE '%${search}%'
      OR vp.title LIKE '%${search}%'
    )`;
  }

  const sql = `
    SELECT
      CAST(bt.order_line_id AS STRING) AS order_id,
      vp.order_number,
      vp.internal_order_id,
      vp.title AS product_name,
      vp.customer_name,
      bt.created_at AS completed_at,
      bt.status,
      bt.total_payable_smallest_unit / 100.0 AS amount_gbp,
      vp.qc_status,
      vp.qc_time,
      vp.ff_status,
      vp.ff_time
    FROM \`${PROJECT_ID}.aurora_postgres_public.balance_transaction\` bt
    LEFT JOIN \`${PROJECT_ID}.fleek_analytics.vendor_payout\` vp
      ON bt.order_line_id = CAST(vp.order_line_id AS STRING)
    ${whereClause}
    ORDER BY bt.created_at DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `;

  const results = await executeQuery<{
    order_id: string;
    order_number: number;
    internal_order_id: string;
    product_name: string;
    customer_name: string;
    completed_at: string;
    status: string;
    amount_gbp: number;
    qc_status: string;
    qc_time: string | null;
    ff_status: string;
    ff_time: string | null;
  }>(sql);

  return results.map(row => {
    // Determine hold reasons based on status
    const holdReasons: string[] = [];
    if (row.status === 'pending_eligibility') {
      if (row.qc_status !== 'approved') {
        holdReasons.push(`QC Status: ${row.qc_status}`);
      }
      if (!row.ff_time) {
        holdReasons.push('Awaiting freight flight');
      }
    }

    // Calculate eligibility date based on QC/FF times
    let eligibilityDate: string | null = null;
    if (row.ff_time) {
      const ffDate = new Date(row.ff_time);
      ffDate.setDate(ffDate.getDate() + 7); // 7 days after FF
      eligibilityDate = ffDate.toISOString().split('T')[0];
    } else if (row.qc_time) {
      const qcDate = new Date(row.qc_time);
      qcDate.setDate(qcDate.getDate() + 14); // 14 days after QC
      eligibilityDate = qcDate.toISOString().split('T')[0];
    }

    return {
      orderId: row.order_id,
      orderNumber: row.order_number,
      internalOrderId: row.internal_order_id,
      productName: row.product_name,
      customerName: row.customer_name,
      completedAt: row.completed_at,
      eligibilityDate,
      status: row.status as any,
      amount: row.amount_gbp,
      qcStatus: row.qc_status,
      ffStatus: row.ff_status,
      holdReasons: holdReasons.length > 0 ? holdReasons : undefined,
      daysUntilEligible: eligibilityDate
        ? Math.ceil((new Date(eligibilityDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : undefined,
    };
  });
}

/**
 * Get order detail with timeline
 */
export async function getOrderDetail(orderLineId: string): Promise<OrderDetailView> {
  // This would fetch detailed order information including timeline events
  // For now, returning placeholder
  throw new Error('getOrderDetail not yet implemented');
}

/**
 * Get seller's payout history
 */
export async function getPayoutHistory(
  vendorId: string,
  limit: number = 10
): Promise<PayoutHistoryItem[]> {
  const sql = `
    SELECT
      p.id AS payout_id,
      p.created_at AS payout_date,
      p.amount_smallest_unit / 100.0 AS amount_gbp,
      p.status,
      COUNT(DISTINCT bt.order_line_id) AS order_count
    FROM \`${PROJECT_ID}.aurora_postgres_public.payout\` p
    LEFT JOIN \`${PROJECT_ID}.aurora_postgres_public.balance_transaction\` bt
      ON bt.payout_id = p.id
    WHERE p.destination_id = '${vendorId}'
      AND p._fivetran_deleted = FALSE
    GROUP BY p.id, p.created_at, p.amount_smallest_unit, p.status
    ORDER BY p.created_at DESC
    LIMIT ${limit}
  `;

  const results = await executeQuery<{
    payout_id: number;
    payout_date: string;
    amount_gbp: number;
    status: string;
    order_count: number;
  }>(sql);

  return results.map(row => ({
    payoutDate: row.payout_date.split('T')[0],
    amount: row.amount_gbp,
    status: row.status === 'completed' ? 'completed' : row.status === 'pending' ? 'pending' : 'failed',
    orderCount: row.order_count,
  }));
}

/**
 * Get seller's income statements (payout records)
 */
export async function getIncomeStatements(vendorId: string): Promise<any[]> {
  const sql = `
    SELECT
      p.id AS payout_id,
      CONCAT('PK2NBY8TW72-', EXTRACT(YEAR FROM p.created_at), '-',
             LPAD(CAST(ROW_NUMBER() OVER (ORDER BY p.created_at) AS STRING), 3, '0')) AS statement_number,
      FORMAT_DATE('%B %Y', p.created_at) AS statement_period,
      p.created_at AS payout_date,
      p.amount_smallest_unit / 100.0 AS amount_gbp,
      p.status,
      COUNT(DISTINCT bt.order_line_id) AS order_count
    FROM \`${PROJECT_ID}.aurora_postgres_public.payout\` p
    LEFT JOIN \`${PROJECT_ID}.aurora_postgres_public.balance_transaction\` bt
      ON bt.payout_id = p.id
    WHERE p.destination_id = '${vendorId}'
      AND p._fivetran_deleted = FALSE
    GROUP BY p.id, p.created_at, p.amount_smallest_unit, p.status
    ORDER BY p.created_at DESC
    LIMIT 50
  `;

  const results = await executeQuery(sql);
  return results;
}

/**
 * Get statement detail with fee breakdown
 */
export async function getStatementDetail(payoutId: number, vendorId: string): Promise<any> {
  const sql = `
    SELECT
      bt.order_line_id,
      vp.order_number,
      vp.title AS product_name,
      bt.created_at,
      bt.base_price_smallest_unit / 100.0 AS base_price,
      bt.chargeable_shipping_smallest_unit / 100.0 AS shipping_chargeable,
      bt.discount_amount_smallest_unit / 100.0 AS discount,
      bt.final_base_smallest_unit / 100.0 AS final_base,
      bt.commission_percentage,
      bt.final_base_smallest_unit / 100.0 * (1 - (bt.commission_percentage / 100)) AS base_after_commission,
      bt.shipping_amount_smallest_unit / 100.0 AS shipping_payable_to_vendor,
      bt.cancellation_fee_smallest_unit / 100.0 AS cancellation_fee,
      bt.refund_amount_smallest_unit / 100.0 AS refund,
      bt.previously_paid_smallest_unit / 100.0 AS previously_paid,
      bt.total_smallest_unit / 100.0 AS total,
      bt.total_adjustment_smallest_unit / 100.0 AS adjustment,
      bt.total_payable_smallest_unit / 100.0 AS total_payable,
      bt.status
    FROM \`${PROJECT_ID}.aurora_postgres_public.balance_transaction\` bt
    LEFT JOIN \`${PROJECT_ID}.fleek_analytics.vendor_payout\` vp
      ON bt.order_line_id = CAST(vp.order_line_id AS STRING)
    WHERE bt.payout_id = ${payoutId}
      AND bt.destination_id = '${vendorId}'
      AND bt._fivetran_deleted = FALSE
    ORDER BY bt.created_at DESC
  `;

  const results = await executeQuery(sql);

  // Calculate totals for fee breakdown
  const openingBalance = 0; // Always 0 for new statements
  const deliveredOrders = results.reduce((sum, r) => sum + r.final_base, 0);
  const transactionFees = results.reduce((sum, r) => sum + (r.final_base * r.commission_percentage / 100), 0);
  const logistics = results.reduce((sum, r) => sum - r.shipping_payable_to_vendor, 0);
  const adjustments = results.reduce((sum, r) => sum + r.adjustment, 0);
  const closingBalance = deliveredOrders - transactionFees + logistics + adjustments;

  return {
    payoutId,
    orders: results,
    breakdown: {
      openingBalance,
      deliveredOrders,
      transactionFees: -transactionFees,
      logistics,
      adjustments,
      closingBalance,
    },
  };
}

/**
 * Get active blockers for seller
 */
async function getActiveBlockers(vendorId: string): Promise<ActiveBlocker[]> {
  // Query orders with hold status
  const sql = `
    SELECT
      CAST(bt.order_line_id AS STRING) AS order_id,
      bt.status,
      vp.qc_status,
      vp.ff_status,
      bt.created_at
    FROM \`${PROJECT_ID}.aurora_postgres_public.balance_transaction\` bt
    LEFT JOIN \`${PROJECT_ID}.fleek_analytics.vendor_payout\` vp
      ON bt.order_line_id = CAST(vp.order_line_id AS STRING)
    WHERE bt.destination_id = '${vendorId}'
      AND bt._fivetran_deleted = FALSE
      AND bt.status IN ('held', 'pending_eligibility')
      AND bt.payout_id IS NULL
  `;

  const results = await executeQuery<{
    order_id: string;
    status: string;
    qc_status: string;
    ff_status: string;
    created_at: string;
  }>(sql);

  const blockers: ActiveBlocker[] = [];

  // Analyze results to create blockers
  results.forEach(row => {
    if (row.qc_status && row.qc_status !== 'approved') {
      blockers.push({
        reasonCode: 'QC_PENDING',
        severity: 'medium' as const,
        title: 'Quality Check Pending',
        description: `Order ${row.order_id} is awaiting quality approval`,
        actionRequired: false,
        estimatedResolution: '2-3 business days',
      });
    }

    if (!row.ff_status || row.ff_status !== 'completed') {
      blockers.push({
        reasonCode: 'FF_PENDING',
        severity: 'low' as const,
        title: 'Freight Flight Pending',
        description: `Order ${row.order_id} is awaiting freight flight confirmation`,
        actionRequired: false,
        estimatedResolution: '5-7 business days',
      });
    }
  });

  // Deduplicate blockers by reasonCode
  const uniqueBlockers = blockers.reduce((acc, blocker) => {
    if (!acc.find(b => b.reasonCode === blocker.reasonCode)) {
      acc.push(blocker);
    }
    return acc;
  }, [] as ActiveBlocker[]);

  return uniqueBlockers;
}

/**
 * Get seller trust score
 */
async function getTrustScore(vendorId: string): Promise<TrustScore> {
  // For MVP, return a static trust score
  // In production, this would calculate based on seller metrics
  return {
    score: 75,
    riskLevel: 'medium',
    topDrivers: [
      { factor: 'Return rate', impact: -15, description: 'Higher than average' },
      { factor: 'Delivery time', impact: -10, description: 'Delayed shipments' },
    ],
    trend: 'stable',
  };
}
