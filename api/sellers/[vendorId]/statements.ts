/**
 * Seller Income Statements Endpoint
 *
 * GET /api/sellers/:vendorId/statements
 * Returns income statements grouped by payment window from vendor_payout.
 * For creed-vintage, returns static data from Excel export (BigQuery view inaccessible).
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

const CREED_VINTAGE_STATEMENTS = [
  { id: 'PAYOUT-12609', payoutDate: '2026-04-15', releasedAmount: 5236.71, pdfUrl: 'https://payout-pdfs-dev.s3.amazonaws.com/Receipts/creed-vintage/2026/April/creed-vintage_15_April_2026.pdf' },
  { id: 'PAYOUT-12590', payoutDate: '2026-04-15', releasedAmount: 16016.27, pdfUrl: 'https://payout-pdfs-dev.s3.amazonaws.com/Receipts/creed-vintage/2026/April/creed-vintage_15_April_2026.pdf' },
  { id: 'PAYOUT-12222', payoutDate: '2026-04-07', releasedAmount: 9714.18, pdfUrl: 'https://payout-pdfs-dev.s3.amazonaws.com/Receipts/creed-vintage/2026/April/creed-vintage_7_April_2026.pdf' },
  { id: 'PAYOUT-11873', payoutDate: '2026-04-01', releasedAmount: 10423.49, pdfUrl: 'https://payout-pdfs-dev.s3.amazonaws.com/Receipts/creed-vintage/2026/April/creed-vintage_1_April_2026.pdf' },
  { id: 'PAYOUT-11544', payoutDate: '2026-03-24', releasedAmount: 16150.43, pdfUrl: 'https://payout-pdfs-dev.s3.amazonaws.com/Receipts/creed-vintage/2026/March/creed-vintage_24_March_2026.pdf' },
  { id: 'PAYOUT-10998', payoutDate: '2026-03-16', releasedAmount: 15882.02, pdfUrl: 'https://payout-pdfs-dev.s3.amazonaws.com/Receipts/creed-vintage/2026/March/creed-vintage_16_March_2026.pdf' },
  { id: 'PAYOUT-10966', payoutDate: '2026-03-11', releasedAmount: 134.94, pdfUrl: 'https://payout-pdfs-dev.s3.amazonaws.com/Receipts/creed-vintage/2026/March/creed-vintage_11_March_2026.pdf' },
  { id: 'PAYOUT-10931', payoutDate: '2026-03-11', releasedAmount: 11884.83, pdfUrl: 'https://payout-pdfs-dev.s3.amazonaws.com/Receipts/creed-vintage/2026/March/creed-vintage_11_March_2026.pdf' },
  { id: 'PAYOUT-10529', payoutDate: '2026-03-03', releasedAmount: 16474.50, pdfUrl: 'https://payout-pdfs-dev.s3.amazonaws.com/Receipts/creed-vintage/2026/March/creed-vintage_3_March_2026.pdf' },
  { id: 'PAYOUT-10222', payoutDate: '2026-02-27', releasedAmount: 1500.38, pdfUrl: 'https://payout-pdfs-dev.s3.amazonaws.com/Receipts/creed-vintage/2026/February/creed-vintage_27_February_2026.pdf' },
  { id: 'PAYOUT-10191', payoutDate: '2026-02-27', releasedAmount: 23721.66, pdfUrl: 'https://payout-pdfs-dev.s3.amazonaws.com/Receipts/creed-vintage/2026/February/creed-vintage_27_February_2026.pdf' },
  { id: 'PAYOUT-9794',  payoutDate: '2026-02-17', releasedAmount: 14433.14, pdfUrl: 'https://payout-pdfs-dev.s3.amazonaws.com/Receipts/creed-vintage/2026/February/creed-vintage_17_February_2026.pdf' },
  { id: 'PAYOUT-9442',  payoutDate: '2026-02-09', releasedAmount: 11974.94, pdfUrl: 'https://payout-pdfs-dev.s3.amazonaws.com/Receipts/creed-vintage/2026/February/creed-vintage_9_February_2026.pdf' },
  { id: 'PAYOUT-9147',  payoutDate: '2026-02-03', releasedAmount: 890.25,   pdfUrl: 'https://payout-pdfs-dev.s3.amazonaws.com/Receipts/creed-vintage/2026/February/creed-vintage_3_February_2026.pdf' },
  { id: 'PAYOUT-9141',  payoutDate: '2026-02-03', releasedAmount: 39999.97, pdfUrl: 'https://payout-pdfs-dev.s3.amazonaws.com/Receipts/creed-vintage/2026/February/creed-vintage_3_February_2026.pdf' },
  { id: 'PAYOUT-7811',  payoutDate: '2026-01-10', releasedAmount: 23271.59, pdfUrl: 'https://payout-pdfs-dev.s3.amazonaws.com/Receipts/creed-vintage/2026/January/creed-vintage_10_January_2026.pdf' },
  { id: 'PAYOUT-7489',  payoutDate: '2025-12-31', releasedAmount: 37306.95, pdfUrl: 'https://payout-pdfs-dev.s3.amazonaws.com/Receipts/creed-vintage/2025/December/creed-vintage_31_December_2025.pdf' },
  { id: 'PAYOUT-6606',  payoutDate: '2025-12-09', releasedAmount: 69.18,    pdfUrl: 'https://payout-pdfs-dev.s3.amazonaws.com/Receipts/creed-vintage/2025/December/creed-vintage_9_December_2025.pdf' },
  { id: 'PAYOUT-6572',  payoutDate: '2025-12-09', releasedAmount: 18312.05, pdfUrl: 'https://payout-pdfs-dev.s3.amazonaws.com/Receipts/creed-vintage/2025/December/creed-vintage_9_December_2025.pdf' },
  { id: 'PAYOUT-6257',  payoutDate: '2025-12-03', releasedAmount: 11464.45, pdfUrl: 'https://payout-pdfs-dev.s3.amazonaws.com/Receipts/creed-vintage/2025/December/creed-vintage_3_December_2025.pdf' },
  { id: 'PAYOUT-5951',  payoutDate: '2025-11-28', releasedAmount: 12384.81, pdfUrl: 'https://payout-pdfs-dev.s3.amazonaws.com/Receipts/creed-vintage/2025/November/creed-vintage_28_November_2025.pdf' },
  { id: 'PAYOUT-5663',  payoutDate: '2025-11-20', releasedAmount: 18474.59, pdfUrl: 'https://payout-pdfs-dev.s3.amazonaws.com/Receipts/creed-vintage/2025/November/creed-vintage_20_November_2025.pdf' },
  { id: 'PAYOUT-4012',  payoutDate: '2025-10-16', releasedAmount: 66.44,    pdfUrl: 'https://payout-pdfs-dev.s3.amazonaws.com/Receipts/creed-vintage/2025/October/creed-vintage_16_October_2025.pdf' },
  { id: 'PAYOUT-3829',  payoutDate: '2025-10-16', releasedAmount: 29495.40, pdfUrl: 'https://payout-pdfs-dev.s3.amazonaws.com/Receipts/creed-vintage/2025/October/creed-vintage_16_October_2025.pdf' },
  { id: 'PAYOUT-3400',  payoutDate: '2025-10-03', releasedAmount: 74162.70, pdfUrl: 'https://payout-pdfs-dev.s3.amazonaws.com/Receipts/creed-vintage/2025/October/creed-vintage_3_October_2025.pdf' },
  { id: 'PAYOUT-2570',  payoutDate: '2025-09-15', releasedAmount: 14485.39, pdfUrl: 'https://payout-pdfs-dev.s3.amazonaws.com/Receipts/creed-vintage/2025/September/creed-vintage_15_September_2025.pdf' },
  { id: 'PAYOUT-2484',  payoutDate: '2025-09-08', releasedAmount: 19481.09, pdfUrl: 'https://payout-pdfs-dev.s3.amazonaws.com/Receipts/creed-vintage/2025/September/creed-vintage_8_September_2025.pdf' },
  { id: 'PAYOUT-2170',  payoutDate: '2025-09-01', releasedAmount: 10797.93, pdfUrl: 'https://payout-pdfs-dev.s3.amazonaws.com/Receipts/creed-vintage/2025/September/creed-vintage_1_September_2025.pdf' },
  { id: 'PAYOUT-1903',  payoutDate: '2025-08-25', releasedAmount: 3948.97,  pdfUrl: 'https://payout-pdfs-dev.s3.amazonaws.com/Receipts/creed-vintage/2025/August/creed-vintage_25_August_2025.pdf' },
  { id: 'PAYOUT-1694',  payoutDate: '2025-08-18', releasedAmount: 14695.18, pdfUrl: 'https://payout-pdfs-dev.s3.amazonaws.com/Receipts/creed-vintage/2025/August/creed-vintage_18_August_2025.pdf' },
  { id: 'PAYOUT-1523',  payoutDate: '2025-08-11', releasedAmount: 4986.78,  pdfUrl: 'https://payout-pdfs-dev.s3.amazonaws.com/Receipts/creed-vintage/2025/August/creed-vintage_11_August_2025.pdf' },
  { id: 'PAYOUT-1152',  payoutDate: '2025-08-04', releasedAmount: 35094.78, pdfUrl: 'https://payout-pdfs-dev.s3.amazonaws.com/Receipts/creed-vintage/2025/August/creed-vintage_4_August_2025.pdf' },
  { id: 'PAYOUT-842',   payoutDate: '2025-07-24', releasedAmount: 13139.35, pdfUrl: 'https://payout-pdfs-dev.s3.amazonaws.com/Receipts/creed-vintage/2025/July/creed-vintage_24_July_2025.pdf' },
];

function formatDate(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { vendorId } = req.query;

    if (!vendorId || typeof vendorId !== 'string') {
      return res.status(400).json({ error: 'Vendor ID is required' });
    }

    // Static data for creed-vintage (BigQuery view depends on inaccessible postgres_rds_public table)
    if (vendorId === 'creed-vintage') {
      const statements = CREED_VINTAGE_STATEMENTS.map((row) => ({
        id: row.id,
        period: formatDate(row.payoutDate),
        releasedAmount: row.releasedAmount,
        status: 'Released',
        expectedPayoutDate: formatDate(row.payoutDate),
        pdfUrl: row.pdfUrl,
      }));
      return res.json(statements);
    }

    const vid = parseInt(vendorId, 10);
    if (isNaN(vid)) {
      return res.status(400).json({ error: 'Invalid vendor ID' });
    }

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

    const statements = results.map((row) => ({
      id: row.statement_id,
      period: `${row.period_start} - ${row.period_end}`,
      releasedAmount: row.released_amount,
      status: row.paid_count === row.total_count && row.total_count > 0 ? 'Released' : 'Ready to Release',
      expectedPayoutDate: row.payout_date,
      pdfUrl: null,
    }));

    res.json(statements);
  } catch (error: any) {
    console.error('Error getting statements:', error);
    res.status(500).json({ error: error.message || 'Failed to get statements' });
  }
}
