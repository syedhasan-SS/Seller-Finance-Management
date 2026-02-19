/**
 * Seller Orders Endpoint
 *
 * GET /api/sellers/:vendorId/orders
 * Returns seller's orders with all 14 financial fields
 *
 * Query params:
 * - status: Filter by payout status (optional)
 * - search: Search by order number, internal ID, or product name (optional)
 * - limit: Number of results to return (default: 100)
 * - offset: Pagination offset (default: 0)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { executeQuery } from '../../_lib/bigquery';

interface OrderRow {
  order_id: string;
  order_number: number;
  internal_order_id: string;
  product_name: string;
  vendor: string;
  vendor_id: number;
  created_at: string;
  latest_status: string;
  payout_status: string;
  includesShipping: boolean;
  original_final_base: number;
  commission_percentage: number;
  original_commission: number;
  base_after_commission: number;
  vendor_shipping_cost: number;
  supplier_refund: number;
  cancellation_fee: number;
  total_paid_amount: number;
  qc_status: string;
  ff_status: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { vendorId } = req.query;
    const { status, search, limit = '100', offset = '0' } = req.query;

    if (!vendorId || typeof vendorId !== 'string') {
      return res.status(400).json({ error: 'Vendor ID is required' });
    }

    // Build WHERE clause with filters
    let whereClause = `
      WHERE CAST(bt.destination_id AS INT64) = ${vendorId}
        AND bt._fivetran_deleted = FALSE
        AND bt.status IN ('in_progress', 'completed', 'eligible', 'pending_eligibility', 'held', 'paid')
    `;

    if (status && status !== 'all') {
      whereClause += ` AND bt.status = '${status}'`;
    }

    if (search && typeof search === 'string') {
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
        vp.vendor,
        vp.vendor_id,
        bt.created_at,
        vp.latest_status,
        bt.status AS payout_status,
        vp.includesShipping,
        bt.final_base_smallest_unit / 100.0 AS original_final_base,
        bt.commission_percentage,
        (bt.final_base_smallest_unit / 100.0) * (bt.commission_percentage / 100.0) AS original_commission,
        (bt.final_base_smallest_unit / 100.0) * (1 - (bt.commission_percentage / 100.0)) AS base_after_commission,
        bt.shipping_amount_smallest_unit / 100.0 AS vendor_shipping_cost,
        bt.refund_amount_smallest_unit / 100.0 AS supplier_refund,
        bt.cancellation_fee_smallest_unit / 100.0 AS cancellation_fee,
        bt.total_payable_smallest_unit / 100.0 AS total_paid_amount,
        vp.qc_status,
        vp.ff_status
      FROM \`dogwood-baton-345622.aurora_postgres_public.balance_transaction\` bt
      LEFT JOIN \`dogwood-baton-345622.fleek_analytics.vendor_payout\` vp
        ON bt.order_line_id = CAST(vp.order_line_id AS STRING)
      ${whereClause}
      ORDER BY bt.created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    const results = await executeQuery<OrderRow>(sql);

    // Map to Order objects with proper field names
    const orders = results.map(row => ({
      orderId: row.order_id,
      orderNumber: row.order_number,
      internalOrderId: row.internal_order_id,
      productName: row.product_name,
      vendor: row.vendor,
      vendorId: row.vendor_id,
      payoutStatus: row.payout_status,
      createdAt: row.created_at,
      latestStatus: row.latest_status,
      originalFinalBase: row.original_final_base,
      commissionPercentage: row.commission_percentage,
      originalCommission: row.original_commission,
      baseAfterCommission: row.base_after_commission,
      vendorShippingCost: row.vendor_shipping_cost,
      supplierRefund: row.supplier_refund,
      cancellationFee: row.cancellation_fee,
      totalPaidAmount: row.total_paid_amount,
      includesShipping: row.includesShipping || false,
      // Legacy/convenience fields for backward compatibility
      completedAt: row.created_at,
      status: row.payout_status,
      amount: row.total_paid_amount,
      qcStatus: row.qc_status,
      ffStatus: row.ff_status,
      eligibilityDate: null, // Could calculate based on qc_time/ff_time
      holdReasons: [], // Could determine from qc_status/ff_status
    }));

    res.json(orders);
  } catch (error: any) {
    console.error('Error getting orders:', error);
    res.status(500).json({ error: error.message || 'Failed to get orders' });
  }
}
