/**
 * Seller Payout Data Endpoint
 *
 * GET /api/sellers/:vendorId/payout
 * Returns complete payout data for Dashboard page:
 * - Upcoming payout summary
 * - Recent orders
 * - Payout history
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { executeQuery } from '../../_lib/bigquery';

interface PayoutSummaryRow {
  eligible_order_count: number;
  eligible_amount_gbp: number;
  pending_amount_gbp: number;
  earliest_pending_date: string | null;
  latest_order_date: string | null;
  payout_id: number | null;
  payout_created_at: string | null;
}

interface PayoutHistoryRow {
  payout_id: number;
  payout_date: string;
  amount_gbp: number;
  status: string;
  order_count: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { vendorId } = req.query;

    if (!vendorId || typeof vendorId !== 'string') {
      return res.status(400).json({ error: 'Vendor ID is required' });
    }

    // Get upcoming payout summary
    const summarySQL = `
      SELECT
        COUNT(DISTINCT bt.order_line_id) AS eligible_order_count,
        SUM(bt.total_payable_smallest_unit) / 100.0 AS eligible_amount_gbp,
        0 AS pending_amount_gbp,
        MIN(bt.created_at) AS earliest_pending_date,
        MAX(bt.created_at) AS latest_order_date,
        p.id as payout_id,
        p.created_at as payout_created_at
      FROM \`dogwood-baton-345622.aurora_postgres_public.balance_transaction\` bt
      LEFT JOIN \`dogwood-baton-345622.aurora_postgres_public.payout\` p
        ON bt.payout_id = p.id AND p._fivetran_deleted = FALSE
      WHERE CAST(bt.destination_id AS INT64) = ${vendorId}
        AND bt._fivetran_deleted = FALSE
        AND bt.status = 'in_progress'
      GROUP BY p.id, p.created_at
      ORDER BY p.created_at DESC
      LIMIT 1
    `;

    const summaryResults = await executeQuery<PayoutSummaryRow>(summarySQL);
    const summary = summaryResults[0] || {
      eligible_order_count: 0,
      eligible_amount_gbp: 0,
      pending_amount_gbp: 0,
      earliest_pending_date: null,
      latest_order_date: null,
      payout_id: null,
      payout_created_at: null,
    };

    // Get payout history (last 5 payouts)
    const historySQL = `
      SELECT
        p.id AS payout_id,
        p.created_at AS payout_date,
        p.amount_smallest_unit / 100.0 AS amount_gbp,
        p.status,
        COUNT(DISTINCT bt.order_line_id) AS order_count
      FROM \`dogwood-baton-345622.aurora_postgres_public.payout\` p
      LEFT JOIN \`dogwood-baton-345622.aurora_postgres_public.balance_transaction\` bt
        ON bt.payout_id = p.id AND bt._fivetran_deleted = FALSE
      WHERE CAST(p.destination_id AS INT64) = ${vendorId}
        AND p._fivetran_deleted = FALSE
        AND p.status = 'completed'
      GROUP BY p.id, p.created_at, p.amount_smallest_unit, p.status
      ORDER BY p.created_at DESC
      LIMIT 5
    `;

    const history = await executeQuery<PayoutHistoryRow>(historySQL);

    // Calculate estimated payout date (next Monday)
    const today = new Date();
    const daysUntilMonday = (8 - today.getDay()) % 7 || 7;
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + daysUntilMonday);

    // Build response
    const payoutData = {
      sellerId: vendorId,
      currentCycle: summary.payout_id ? `PAYOUT-${summary.payout_id}` : 'CURRENT',
      estimatedPayoutDate: nextMonday.toISOString().split('T')[0],
      confidence: summary.eligible_order_count > 0 ? 'medium' : 'low',
      totalAmount: summary.eligible_amount_gbp,
      daysUntilPayout: daysUntilMonday,
      eligibleOrders: summary.eligible_order_count,
      pendingOrders: 0, // Could calculate from pending_eligibility status
      heldOrders: 0, // Could calculate from held status
      // Payout history
      payoutHistory: history.map(h => ({
        payoutDate: h.payout_date,
        amount: h.amount_gbp,
        status: h.status === 'completed' ? 'completed' as const : 'pending' as const,
        orderCount: h.order_count,
      })),
      // Trust score (static for MVP)
      trustScore: {
        score: 72,
        trend: 'declining' as const,
        topDrivers: [
          { factor: 'Return rate', impact: -15, description: 'Higher than average' },
          { factor: 'Delivery time', impact: -10, description: 'Delayed shipments' },
        ],
      },
      // Active blockers (would need to analyze orders)
      activeBlockers: [],
    };

    res.json(payoutData);
  } catch (error: any) {
    console.error('Error getting payout data:', error);
    res.status(500).json({ error: error.message || 'Failed to get payout data' });
  }
}
