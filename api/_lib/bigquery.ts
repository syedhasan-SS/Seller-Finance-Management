/**
 * BigQuery Client Wrapper using MCP Tools (Pilot Test)
 *
 * Uses mcp__bigquery__execute_sql which is available in Claude Code environment.
 * This allows us to test with real data before implementing production auth.
 */

const PROJECT_ID = 'dogwood-baton-345622';

/**
 * Execute a BigQuery SQL query using MCP tools
 * @param sql - The SQL query to execute
 * @returns Array of result rows
 */
export async function executeQuery<T = any>(sql: string): Promise<T[]> {
  try {
    console.log('[BigQuery API] Executing query:', sql.substring(0, 200) + '...');

    // Check if MCP tool is available
    if (typeof globalThis === 'undefined' || !(globalThis as any).mcp__bigquery__execute_sql) {
      throw new Error('MCP BigQuery tool not available. Running in Claude Code environment?');
    }

    // Call the MCP BigQuery tool
    const result = await (globalThis as any).mcp__bigquery__execute_sql({
      sql: sql,
      dry_run: false
    });

    // Parse newline-delimited JSON response
    if (!result || typeof result !== 'string') {
      console.warn('[BigQuery API] Query returned empty or invalid result');
      return [];
    }

    const lines = result.split('\n').filter((line: string) => line.trim());
    const parsedResults: T[] = lines.map((line: string) => JSON.parse(line));

    console.log(`[BigQuery API] Query returned ${parsedResults.length} rows`);
    return parsedResults;
  } catch (error: any) {
    console.error('[BigQuery API] Query failed:', error);
    throw new Error(`BigQuery query failed: ${error.message || error}`);
  }
}
