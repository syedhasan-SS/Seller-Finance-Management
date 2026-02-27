/**
 * BigQuery Client Wrapper
 *
 * Uses @google-cloud/bigquery npm package.
 * - Locally: uses Application Default Credentials (gcloud auth)
 * - Vercel: uses GOOGLE_APPLICATION_CREDENTIALS_JSON env var (JSON string of service account)
 */

import { BigQuery } from '@google-cloud/bigquery';

const PROJECT_ID = 'dogwood-baton-345622';

function createClient(): BigQuery {
  // On Vercel, credentials are stored as a JSON string in an env var
  const credsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

  if (credsJson) {
    try {
      const credentials = JSON.parse(credsJson);
      return new BigQuery({ projectId: PROJECT_ID, credentials });
    } catch (e) {
      console.error('[BigQuery] Failed to parse GOOGLE_APPLICATION_CREDENTIALS_JSON:', e);
      throw new Error('Invalid Google credentials JSON in environment variable');
    }
  }

  // Locally: falls back to Application Default Credentials automatically
  return new BigQuery({ projectId: PROJECT_ID });
}

/**
 * Execute a BigQuery SQL query
 * @param sql - The SQL query to execute
 * @returns Array of result rows
 */
export async function executeQuery<T = any>(sql: string): Promise<T[]> {
  try {
    console.log('[BigQuery] Executing query:', sql.substring(0, 200) + '...');

    const bigquery = createClient();
    const [rows] = await bigquery.query({ query: sql });

    console.log(`[BigQuery] Query returned ${rows.length} rows`);
    return rows as T[];
  } catch (error: any) {
    console.error('[BigQuery] Query failed:', error);
    throw new Error(`BigQuery query failed: ${error.message || error}`);
  }
}
