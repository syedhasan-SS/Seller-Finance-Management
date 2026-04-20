/**
 * Seller Payout Data Endpoint
 *
 * GET /api/sellers/:vendorId/payout
 * Returns complete payout data for Dashboard page using fleek_analytics.vendor_payout
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { executeQuery } from '../../_lib/bigquery';

interface UpcomingPayoutRow {
  eligible_order_count: number;
  eligible_amount_gbp: number;
  pending_order_count: number;
  pending_amount_gbp: number;
  held_order_count: number;
}

interface PayoutHistoryRow {
  payout_month: string;
  amount_gbp: number;
  order_count: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { vendorId } = req.query;

    if (!vendorId || typeof vendorId !== 'string') {
      return res.status(400).json({ error: 'Vendor ID is required' });
    }

    const vid = parseInt(vendorId, 10);

    // Upcoming payout: orders that are eligible or in progress (not yet paid)
    const summarySQL = `
      SELECT
        COUNTIF(latest_status IN ('eligible', 'in_progress')) AS eligible_order_count,
        COALESCE(SUM(CASE WHEN latest_status IN ('eligible', 'in_progress') THEN COALESCE(total_payable_product_cost_gbp, 0) ELSE 0 END), 0) AS eligible_amount_gbp,
        COUNTIF(latest_status = 'pending_eligibility') AS pending_order_count,
        COALESCE(SUM(CASE WHEN latest_status = 'pending_eligibility' THEN COALESCE(total_payable_product_cost_gbp, 0) ELSE 0 END), 0) AS pending_amount_gbp,
        COUNTIF(latest_status = 'held') AS held_order_count
      FROM \`dogwood-baton-345622.fleek_analytics.vendor_payout\`
      WHERE vendor_id = ${vid}
    `;

    const summaryResults = await executeQuery<UpcomingPayoutRow>(summarySQL);
    const summary = summaryResults[0] || {
      eligible_order_count: 0,
      eligible_amount_gbp: 0,
      pending_order_count: 0,
      pending_amount_gbp: 0,
      held_order_count: 0,
    };

    // Payout history: paid orders grouped by month
    const historySQL = `
      SELECT
        FORMAT_DATE('%Y-%m', DATE(created_at)) AS payout_month,
        COALESCE(SUM(COALESCE(paid_amount_gbp, 0)), 0) AS amount_gbp,
        COUNT(*) AS order_count
      FROM \`dogwood-baton-345622.fleek_analytics.vendor_payout\`
      WHERE vendor_id = ${vid}
        AND latest_status = 'paid'
      GROUP BY payout_month
      ORDER BY payout_month DESC
      LIMIT 6
    `;

    const history = await executeQuery<PayoutHistoryRow>(historySQL);

    // Estimated payout date: next Monday
    const today = new Date();
    const daysUntilMonday = (8 - today.getDay()) % 7 || 7;
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + daysUntilMonday);

    const payoutData = {
      sellerId: vendorId,
      currentCycle: `CYCLE-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`,
      estimatedPayoutDate: nextMonday.toISOString().split('T')[0],
      confidence: summary.eligible_order_count > 5 ? 'high' : summary.eligible_order_count > 0 ? 'medium' : 'low',
      totalAmount: summary.eligible_amount_gbp,
      daysUntilPayout: daysUntilMonday,
      eligibleOrders: summary.eligible_order_count,
      pendingOrders: summary.pending_order_count,
      heldOrders: summary.held_order_count,
      payoutHistory: history.map(h => ({
        payoutDate: `${h.payout_month}-01`,
        amount: h.amount_gbp,
        status: 'completed' as const,
        orderCount: h.order_count,
      })),
      trustScore: {
        score: 72,
        trend: 'stable' as const,
        topDrivers: [],
      },
      activeBlockers: [],
    };

    res.json(payoutData);
  } catch (error: any) {
    console.error('Error getting payout data:', error);
    res.status(500).json({ error: error.message || 'Failed to get payout data' });
  }
}
