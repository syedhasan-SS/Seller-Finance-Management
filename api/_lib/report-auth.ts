/**
 * Report API Key Authentication
 *
 * Lightweight auth for the /api/reports/* endpoints.
 * These endpoints are called by n8n (not by end users), so they use a
 * static API key rather than a user JWT.
 *
 * Set the key in environment variables:
 *   REPORT_API_KEY=<a long random string>
 *
 * n8n HTTP Request nodes should send:
 *   Authorization: Bearer <REPORT_API_KEY>
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

type ReportHandler = (req: VercelRequest, res: VercelResponse) => Promise<void>;

/**
 * Wraps a report endpoint handler with API key authentication.
 *
 * Usage:
 *   export default requireReportAuth(async (req, res) => { ... });
 */
export function requireReportAuth(handler: ReportHandler): ReportHandler {
  return async (req: VercelRequest, res: VercelResponse) => {
    const apiKey = process.env.REPORT_API_KEY;

    if (!apiKey) {
      // If no key is configured, deny all requests (fail safe)
      console.error('[ReportAuth] REPORT_API_KEY env var is not set');
      return res.status(500).json({ error: 'Report API key not configured on server' });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing Authorization header' });
    }

    const provided = authHeader.substring(7);
    if (provided !== apiKey) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    return handler(req, res);
  };
}
