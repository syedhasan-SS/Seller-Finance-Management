/**
 * Vendor Lookup Endpoint
 *
 * GET /api/vendors/:handle
 * Resolves a vendor handle (e.g., "vibe-vintage") to its vendor ID
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { executeQuery } from '../_lib/bigquery';

interface VendorRow {
  id: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { handle } = req.query;

    if (!handle || typeof handle !== 'string') {
      return res.status(400).json({ error: 'Vendor handle is required' });
    }

    // Static vendor ID for creed-vintage (BigQuery view inaccessible)
    if (handle === 'creed-vintage') {
      return res.json({ id: '259' });
    }

    const sql = `
      SELECT CAST(vendor_id AS STRING) AS id
      FROM \`dogwood-baton-345622.fleek_analytics.vendor_payout\`
      WHERE vendor = '${handle}'
      LIMIT 1
    `;

    const results = await executeQuery<VendorRow>(sql);

    if (results.length === 0) {
      return res.status(404).json({ error: `Vendor not found: ${handle}` });
    }

    res.json({ id: results[0].id });
  } catch (error: any) {
    console.error('Error getting vendor:', error);
    res.status(500).json({ error: error.message || 'Failed to get vendor' });
  }
}
