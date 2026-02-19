/**
 * Pilot Test Script for 7 Suppliers
 *
 * Tests BigQuery data availability and quality for:
 * 1. creed-vintage
 * 2. retro-vintage-global
 * 3. italian-dream
 * 4. thrift-kings
 * 5. vintage-silver
 * 6. world-vintage-wholesale
 * 7. very-indian-people
 */

interface SupplierTestResult {
  handle: string;
  vendorId: string | null;
  orderCount: number;
  totalPayout: number;
  dateRange: { earliest: string; latest: string } | null;
  dataQuality: 'Good' | 'Issues' | 'Missing';
  notes: string[];
}

const suppliers = [
  'creed-vintage',
  'retro-vintage-global',
  'italian-dream',
  'thrift-kings',
  'vintage-silver',
  'world-vintage-wholesale',
  'very-indian-people',
];

async function testSupplier(handle: string): Promise<SupplierTestResult> {
  const result: SupplierTestResult = {
    handle,
    vendorId: null,
    orderCount: 0,
    totalPayout: 0,
    dateRange: null,
    dataQuality: 'Missing',
    notes: [],
  };

  try {
    // Step 1: Get vendor ID
    const vendorQuery = `
      SELECT id
      FROM \`dogwood-baton-345622.aurora_postgres_public.vendors\`
      WHERE handle = '${handle}'
        AND _fivetran_deleted = FALSE
      LIMIT 1
    `;

    const vendorResult = await (globalThis as any).mcp__bigquery__execute_sql({
      sql: vendorQuery,
      dry_run: false
    });

    if (!vendorResult || vendorResult.trim() === '') {
      result.notes.push('Vendor not found in vendors table');
      return result;
    }

    const vendorData = JSON.parse(vendorResult.split('\n')[0]);
    result.vendorId = vendorData.id;

    // Step 2: Get order statistics
    const ordersQuery = `
      SELECT
        COUNT(*) as order_count,
        SUM(bt.total_payable_smallest_unit) / 100.0 AS total_payout_gbp,
        MIN(bt.created_at) AS earliest_date,
        MAX(bt.created_at) AS latest_date
      FROM \`dogwood-baton-345622.aurora_postgres_public.balance_transaction\` bt
      WHERE CAST(bt.destination_id AS INT64) = ${vendorData.id}
        AND bt._fivetran_deleted = FALSE
        AND bt.status IN ('in_progress', 'completed', 'eligible', 'pending_eligibility', 'held', 'paid')
    `;

    const ordersResult = await (globalThis as any).mcp__bigquery__execute_sql({
      sql: ordersQuery,
      dry_run: false
    });

    if (ordersResult && ordersResult.trim()) {
      const ordersData = JSON.parse(ordersResult.split('\n')[0]);
      result.orderCount = parseInt(ordersData.order_count);
      result.totalPayout = parseFloat(ordersData.total_payout_gbp) || 0;
      result.dateRange = {
        earliest: ordersData.earliest_date,
        latest: ordersData.latest_date,
      };

      // Assess data quality
      if (result.orderCount === 0) {
        result.dataQuality = 'Missing';
        result.notes.push('No orders found in balance_transaction');
      } else if (result.orderCount < 5) {
        result.dataQuality = 'Issues';
        result.notes.push(`Only ${result.orderCount} orders (low volume)`);
      } else {
        result.dataQuality = 'Good';
        result.notes.push(`${result.orderCount} orders, £${result.totalPayout.toFixed(2)} total`);
      }
    } else {
      result.notes.push('Query returned no data');
    }

  } catch (error: any) {
    result.notes.push(`Error: ${error.message}`);
  }

  return result;
}

async function runPilotTest() {
  console.log('🚀 Starting Pilot Test for 7 Suppliers\n');
  console.log('=' .repeat(80));

  const results: SupplierTestResult[] = [];

  for (const handle of suppliers) {
    console.log(`\nTesting: ${handle}...`);
    const result = await testSupplier(handle);
    results.push(result);

    // Display result
    console.log(`  Vendor ID: ${result.vendorId || 'NOT FOUND'}`);
    console.log(`  Orders: ${result.orderCount}`);
    console.log(`  Total Payout: £${result.totalPayout.toFixed(2)}`);
    console.log(`  Date Range: ${result.dateRange ? `${result.dateRange.earliest} to ${result.dateRange.latest}` : 'N/A'}`);
    console.log(`  Data Quality: ${result.dataQuality}`);
    console.log(`  Notes: ${result.notes.join(', ')}`);
  }

  // Summary Report
  console.log('\n' + '='.repeat(80));
  console.log('\n📊 PILOT TEST SUMMARY\n');

  const goodCount = results.filter(r => r.dataQuality === 'Good').length;
  const issuesCount = results.filter(r => r.dataQuality === 'Issues').length;
  const missingCount = results.filter(r => r.dataQuality === 'Missing').length;

  console.log(`✅ Good Data: ${goodCount}/7 suppliers`);
  console.log(`⚠️  Issues: ${issuesCount}/7 suppliers`);
  console.log(`❌ Missing Data: ${missingCount}/7 suppliers`);

  console.log('\n### Detailed Results:\n');
  results.forEach((r, i) => {
    console.log(`${i + 1}. **${r.handle}**`);
    console.log(`   - Vendor ID: ${r.vendorId || 'NOT FOUND'}`);
    console.log(`   - Order Count: ${r.orderCount}`);
    console.log(`   - Total Payout: £${r.totalPayout.toFixed(2)}`);
    console.log(`   - Data Quality: ${r.dataQuality}`);
    console.log(`   - Notes: ${r.notes.join(', ')}\n`);
  });

  console.log('\n### Recommendation:\n');
  if (goodCount >= 5) {
    console.log('✅ **PROCEED WITH AUTH IMPLEMENTATION**');
    console.log('   Most suppliers have good data. Ready for production features.\n');
  } else {
    console.log('⚠️  **FIX DATA QUALITY ISSUES FIRST**');
    console.log('   Too many suppliers have missing or problematic data.');
    console.log('   Address data issues before building auth layer.\n');
  }

  return results;
}

// Run the test
runPilotTest().catch(console.error);
