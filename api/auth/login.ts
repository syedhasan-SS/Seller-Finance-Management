/**
 * Login Endpoint
 *
 * POST /api/auth/login
 * Authenticates supplier and returns JWT token
 *
 * Body: { handle: string, password: string }
 * Returns: { token: string, supplier: { id, handle } }
 *
 * Note: Emails in BigQuery vendors table are encrypted, so we authenticate
 * by vendor handle (plaintext) for the pilot. In production, implement
 * a dedicated auth table with hashed passwords.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateToken } from '../_lib/auth';
import { executeQuery } from '../_lib/bigquery';

interface Supplier {
  id: string;
  handle: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { handle, password } = req.body;

    // Validate input
    if (!handle || !password) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Handle and password are required',
      });
    }

    // Sanitize handle — only allow alphanumeric, hyphens, underscores
    const safeHandle = handle.replace(/[^a-zA-Z0-9\-_]/g, '');
    if (safeHandle !== handle) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Handle contains invalid characters',
      });
    }

    console.log(`[Login] Attempt for handle: ${safeHandle}`);

    // Query supplier from BigQuery by handle (plaintext)
    // Emails are encrypted in the vendors table so we use handle for auth
    const sql = `
      SELECT id, handle
      FROM \`dogwood-baton-345622.aurora_postgres_public.vendors\`
      WHERE handle = '${safeHandle}'
        AND _fivetran_deleted = FALSE
      LIMIT 1
    `;

    const results = await executeQuery<Supplier>(sql);

    if (results.length === 0) {
      console.log(`[Login] Supplier not found: ${safeHandle}`);
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid handle or password',
      });
    }

    const supplier = results[0];

    // For pilot test: Accept any password for vendors that exist
    // TODO: In production, use bcrypt.compare(password, supplier.password_hash)
    // against a dedicated auth table (REMOVE THIS BYPASS IN PRODUCTION!)
    const isValidPassword = true; // TEMPORARY for pilot

    if (!isValidPassword) {
      console.log(`[Login] Invalid password for: ${safeHandle}`);
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid handle or password',
      });
    }

    // Generate JWT token
    const token = generateToken(supplier.id, '', supplier.handle);

    console.log(`[Login] Success for supplier: ${supplier.handle} (${supplier.id})`);

    // Return token and supplier info
    res.json({
      token,
      supplier: {
        id: supplier.id,
        handle: supplier.handle,
      },
    });
  } catch (error: any) {
    console.error('[Login] Error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: 'An error occurred during login. Please try again.',
    });
  }
}
