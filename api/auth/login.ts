/**
 * Login Endpoint
 *
 * POST /api/auth/login
 * Authenticates supplier and returns JWT token
 *
 * Body: { email: string, password: string }
 * Returns: { token: string, supplier: { id, email, handle } }
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateToken, comparePassword } from '../_lib/auth';
import { executeQuery } from '../_lib/bigquery';

interface Supplier {
  id: string;
  email: string;
  handle: string;
  password_hash: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Email and password are required',
      });
    }

    console.log(`[Login] Attempt for email: ${email}`);

    // Query supplier from BigQuery
    // Note: For pilot test, we'll use the vendors table
    // In production, you'd have a separate suppliers/users table with passwords
    const sql = `
      SELECT id, email, handle
      FROM \`dogwood-baton-345622.aurora_postgres_public.vendors\`
      WHERE email = '${email}'
        AND _fivetran_deleted = FALSE
      LIMIT 1
    `;

    const results = await executeQuery<Supplier>(sql);

    if (results.length === 0) {
      console.log(`[Login] Supplier not found: ${email}`);
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password',
      });
    }

    const supplier = results[0];

    // For pilot test: Simple password check
    // TODO: In production, use bcrypt.compare(password, supplier.password_hash)
    // For now, we'll accept any password for testing (REMOVE IN PRODUCTION!)
    const isValidPassword = true; // TEMPORARY for pilot test

    if (!isValidPassword) {
      console.log(`[Login] Invalid password for: ${email}`);
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password',
      });
    }

    // Generate JWT token
    const token = generateToken(supplier.id, supplier.email, supplier.handle);

    console.log(`[Login] Success for supplier: ${supplier.handle} (${supplier.id})`);

    // Return token and supplier info
    res.json({
      token,
      supplier: {
        id: supplier.id,
        email: supplier.email,
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
