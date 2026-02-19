/**
 * BigQuery Client Wrapper for Vercel Serverless Functions
 *
 * This module initializes the BigQuery client and provides helper functions
 * to execute queries safely in the serverless environment.
 */

import { BigQuery } from '@google-cloud/bigquery';

const PROJECT_ID = 'dogwood-baton-345622';

// Initialize BigQuery client with credentials from environment
export const bigquery = new BigQuery({
  projectId: PROJECT_ID,
  credentials: process.env.BIGQUERY_CREDENTIALS
    ? JSON.parse(process.env.BIGQUERY_CREDENTIALS)
    : undefined,
});

/**
 * Execute a BigQuery SQL query
 * @param sql - The SQL query to execute
 * @returns Array of result rows
 */
export async function executeQuery<T = any>(sql: string): Promise<T[]> {
  try {
    console.log('[BigQuery API] Executing query:', sql.substring(0, 200) + '...');

    const [rows] = await bigquery.query({ query: sql });

    console.log(`[BigQuery API] Query returned ${rows.length} rows`);
    return rows as T[];
  } catch (error: any) {
    console.error('[BigQuery API] Query failed:', error);
    throw new Error(`BigQuery query failed: ${error.message || error}`);
  }
}
