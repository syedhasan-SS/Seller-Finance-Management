/**
 * Seller Income Statements Endpoint
 *
 * GET /api/sellers/:vendorId/statements
 * Returns income statements grouped by payment window from vendor_payout
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { executeQuery } from '../../_lib/bigquery';

interface StatementRow {
  statement_id: string;
  period_start: string;
  period_end: string;
  released_amount: number;
  paid_count: number;
  total_count: number;
  payout_date: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { vendorId } = req.query;

    if (!vendorId || typeof vendorId !== 'string') {
      return res.status(400).json({ error: 'Vendor ID is required' });
    }

    const vid = parseInt(vendorId, 10);

    const sql = `
      SELECT
        CONCAT('PAYOUT-', FORMAT_DATE('%Y-%m-%d', new_max_payment_date)) AS statement_id,
        FORMAT_DATE('%d %b %Y', new_min_payment_date) AS period_start,
        FORMAT_DATE('%d %b %Y', new_max_payment_date) AS period_end,
        COALESCE(SUM(COALESCE(paid_amount_gbp, total_payable_product_cost_gbp, 0)), 0) AS released_amount,
        COUNTIF(latest_status = 'paid') AS paid_count,
        COUNT(*) AS total_count,
        FORMAT_DATE('%d %b %Y', MAX(new_max_payment_date)) AS payout_date
      FROM \`dogwood-baton-345622.fleek_analytics.vendor_payout\`
      WHERE vendor_id = ${vid}
        AND new_max_payment_date IS NOT NULL
      GROUP BY new_max_payment_date, new_min_payment_date
      ORDER BY new_max_payment_date DESC
      LIMIT 20
    `;

    const results = await executeQuery<StatementRow>(sql);

    const statements = results.map((row, index) => ({
      id: row.statement_id,
      period: `${row.period_start} - ${row.period_end}`,
      releasedAmount: row.released_amount,
      status: row.paid_count === row.total_count && row.total_count > 0 ? 'Released' : 'Ready to Release',
      expectedPayoutDate: row.payout_date,
    }));

    res.json(statements);
  } catch (error: any) {
    console.error('Error getting statements:', error);
    res.status(500).json({ error: error.message || 'Failed to get statements' });
  }
}
