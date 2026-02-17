/**
 * Backend API Server for Seller Finance Portal
 *
 * This server acts as a proxy between the browser and BigQuery MCP tools.
 * MCP tools can only be called from Node.js, not from the browser.
 */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// BigQuery configuration
const PROJECT_ID = 'dogwood-baton-345622';

/**
 * Execute a BigQuery SQL query using MCP tool
 */
async function executeQuery(sql) {
  try {
    console.log('[BigQuery API] Executing query:', sql.substring(0, 200) + '...');

    // Check if MCP tool is available
    if (typeof globalThis.mcp__bigquery__execute_sql !== 'function') {
      throw new Error('BigQuery MCP tool not available. Make sure Claude Code is running.');
    }

    // Call the MCP BigQuery tool
    const result = await globalThis.mcp__bigquery__execute_sql({
      sql: sql,
      dry_run: false
    });

    // Parse the result - BigQuery returns newline-delimited JSON
    if (!result || typeof result !== 'string') {
      console.warn('[BigQuery API] Query returned empty or invalid result');
      return [];
    }

    const lines = result.split('\n').filter(line => line.trim());
    const parsedResults = lines.map(line => JSON.parse(line));

    console.log(`[BigQuery API] Query returned ${parsedResults.length} rows`);
    return parsedResults;
  } catch (error) {
    console.error('[BigQuery API] Query failed:', error);
    throw error;
  }
}

/**
 * API Endpoints
 */

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Seller Finance Portal API is running',
    bigqueryAvailable: typeof globalThis.mcp__bigquery__execute_sql === 'function'
  });
});

// Get vendor ID from handle
app.get('/api/vendors/:handle', async (req, res) => {
  try {
    const { handle } = req.params;
    const sql = `
      SELECT id
      FROM \`${PROJECT_ID}.aurora_postgres_public.vendors\`
      WHERE handle = '${handle}'
      AND _fivetran_deleted = FALSE
      LIMIT 1
    `;

    const results = await executeQuery(sql);
    if (results.length > 0) {
      res.json({ vendorId: results[0].id });
    } else {
      res.status(404).json({ error: 'Vendor not found' });
    }
  } catch (error) {
    console.error('Error getting vendor:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get seller payout data
app.get('/api/sellers/:vendorId/payout-data', async (req, res) => {
  try {
    const { vendorId } = req.params;

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
      FROM \`${PROJECT_ID}.aurora_postgres_public.balance_transaction\` bt
      LEFT JOIN \`${PROJECT_ID}.aurora_postgres_public.payout\` p
        ON bt.payout_id = p.id AND p._fivetran_deleted = FALSE
      WHERE CAST(bt.destination_id AS INT64) = ${vendorId}
        AND bt._fivetran_deleted = FALSE
        AND bt.status = 'in_progress'
      GROUP BY p.id, p.created_at
      ORDER BY p.created_at DESC
      LIMIT 1
    `;

    const summaryResults = await executeQuery(summarySQL);
    const summary = summaryResults[0] || {
      eligible_order_count: 0,
      eligible_amount_gbp: 0
    };

    res.json(summary);
  } catch (error) {
    console.error('Error getting payout data:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get seller orders
app.get('/api/sellers/:vendorId/orders', async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { status, search, limit = 100, offset = 0 } = req.query;

    let whereClause = `
      WHERE CAST(bt.destination_id AS INT64) = ${vendorId}
        AND bt._fivetran_deleted = FALSE
        AND bt.status IN ('in_progress', 'completed', 'eligible', 'pending_eligibility', 'held', 'paid')
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
        vp.vendor,
        vp.vendor_id,
        vp.customer_name,
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

    const results = await executeQuery(sql);
    res.json(results);
  } catch (error) {
    console.error('Error getting orders:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Seller Finance Portal API Server`);
  console.log(`📍 Running on: http://localhost:${PORT}`);
  console.log(`🔧 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📊 BigQuery MCP available: ${typeof globalThis.mcp__bigquery__execute_sql === 'function'}`);
  console.log(`\nReady to handle requests!\n`);
});

module.exports = app;
