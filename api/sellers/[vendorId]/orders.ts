/**
 * Seller Orders Endpoint
 *
 * GET /api/sellers/:vendorId/orders
 * Returns seller's orders from fleek_analytics.vendor_payout
 *
 * Query params:
 * - status: Filter by latest_status (optional)
 * - search: Search by order number, internal ID, or product name (optional)
 * - limit: Number of results to return (default: 100)
 * - offset: Pagination offset (default: 0)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { executeQuery } from '../../_lib/bigquery';
import { CREED_ORDERS } from '../../_lib/creed-static-data';

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
  discount: number;
  make_an_offer: number;
  qc_status: string;
  ff_status: string;
  to_be_paid: string;
  payment_trigger: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { vendorId } = req.query;
    const { status, search, limit = '100', offset = '0' } = req.query;

    if (!vendorId || typeof vendorId !== 'string') {
      return res.status(400).json({ error: 'Vendor ID is required' });
    }

    // Static data for creed-vintage (vendor_id 259)
    if (vendorId === '259' || vendorId === 'creed-vintage') {
      let orders = CREED_ORDERS;

      if (status && status !== 'all') {
        orders = orders.filter(o => o.latestStatus === status);
      }
      if (search && typeof search === 'string') {
        const s = search.toLowerCase();
        orders = orders.filter(o =>
          String(o.orderNumber).includes(s) ||
          o.internalOrderId.toLowerCase().includes(s) ||
          o.productName.toLowerCase().includes(s)
        );
      }
      const lim = parseInt(limit as string, 10) || 100;
      const off = parseInt(offset as string, 10) || 0;
      return res.json(orders.slice(off, off + lim));
    }

    let whereClause = `WHERE vendor_id = ${parseInt(vendorId, 10)}`;

    if (status && status !== 'all') {
      whereClause += ` AND latest_status = '${status}'`;
    }

    if (search && typeof search === 'string') {
      whereClause += ` AND (
        CAST(order_number AS STRING) LIKE '%${search}%'
        OR internal_order_id LIKE '%${search}%'
        OR title LIKE '%${search}%'
      )`;
    }

    const sql = `
      SELECT
        CAST(order_line_id AS STRING) AS order_id,
        order_number,
        internal_order_id,
        title AS product_name,
        vendor,
        vendor_id,
        created_at,
        latest_status,
        latest_status AS payout_status,
        includesShipping,
        COALESCE(vbp_gbp, 0) AS original_final_base,
        COALESCE(CAST(commission_perc AS FLOAT64), 0) AS commission_percentage,
        COALESCE(commission, 0) AS original_commission,
        COALESCE(final_base, 0) AS base_after_commission,
        COALESCE(vendor_shipping_cost_gbp, 0) AS vendor_shipping_cost,
        COALESCE(supplier_impact, 0) AS supplier_refund,
        COALESCE(cancellation_fee_amount, 0) AS cancellation_fee,
        COALESCE(total_payable_product_cost_gbp, 0) AS total_paid_amount,
        COALESCE(discount_amount, 0) AS discount,
        COALESCE(make_an_offer_amount, 0) AS make_an_offer,
        COALESCE(qc_status, '') AS qc_status,
        COALESCE(ff_status, '') AS ff_status,
        COALESCE(to_be_paid, '') AS to_be_paid,
        COALESCE(payment_trigger, '') AS payment_trigger
      FROM \`dogwood-baton-345622.fleek_analytics.vendor_payout\`
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ${parseInt(limit as string, 10)}
      OFFSET ${parseInt(offset as string, 10)}
    `;

    const results = await executeQuery<OrderRow>(sql);

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
      discount: row.discount || 0,
      makeAnOffer: row.make_an_offer || 0,
      completedAt: row.created_at,
      status: row.payout_status,
      amount: row.total_paid_amount,
      qcStatus: row.qc_status,
      ffStatus: row.ff_status,
      toBePaid: row.to_be_paid,
      paymentTrigger: row.payment_trigger,
      eligibilityDate: null,
      holdReasons: [],
    }));

    res.json(orders);
  } catch (error: any) {
    console.error('Error getting orders:', error);
    res.status(500).json({ error: error.message || 'Failed to get orders' });
  }
}
