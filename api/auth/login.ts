/**
 * Login Endpoint
 *
 * POST /api/auth/login
 * Authenticates both internal admin users (by email) and vendor sellers (by handle).
 *
 * Body: { identifier: string, password: string }
 *   identifier — email address (admin/owner/viewer) OR vendor handle (vendors)
 * Returns: { token: string, user: { id, name, email, handle, role } }
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateToken, comparePassword, UserRole } from '../_lib/auth';
import { executeQuery } from '../_lib/bigquery';

interface AdminUser {
  name: string;
  email: string;
  role: UserRole;
  password_hash: string;
}

interface Vendor {
  id: string;
  handle: string;
}

/** Load admin users from ADMIN_USERS_JSON env var */
function getAdminUsers(): AdminUser[] {
  const raw = process.env.ADMIN_USERS_JSON;
  if (!raw) return [];
  try {
    return JSON.parse(raw) as AdminUser[];
  } catch {
    console.error('[Login] Failed to parse ADMIN_USERS_JSON');
    return [];
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Email/handle and password are required',
      });
    }

    const isEmail = identifier.includes('@');

    // ── Admin / Owner / Viewer login (by email) ──────────────────────────────
    if (isEmail) {
      const adminUsers = getAdminUsers();
      const user = adminUsers.find(
        (u) => u.email.toLowerCase() === identifier.toLowerCase()
      );

      if (!user) {
        console.log(`[Login] Admin user not found: ${identifier}`);
        return res.status(401).json({
          error: 'Authentication failed',
          message: 'Invalid email or password',
        });
      }

      const isValidPassword = await comparePassword(password, user.password_hash);
      if (!isValidPassword) {
        console.log(`[Login] Wrong password for: ${identifier}`);
        return res.status(401).json({
          error: 'Authentication failed',
          message: 'Invalid email or password',
        });
      }

      const token = generateToken(
        user.email,
        user.email,
        '',
        user.role,
        user.name
      );

      console.log(`[Login] Admin login success: ${user.email} (${user.role})`);

      return res.json({
        token,
        user: {
          id: user.email,
          name: user.name,
          email: user.email,
          handle: '',
          role: user.role,
        },
      });
    }

    // ── Vendor login (by handle) ─────────────────────────────────────────────
    const safeHandle = identifier.replace(/[^a-zA-Z0-9\-_]/g, '');
    if (safeHandle !== identifier) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Handle contains invalid characters',
      });
    }

    console.log(`[Login] Vendor login attempt for handle: ${safeHandle}`);

    const sql = `
      SELECT id, handle
      FROM \`dogwood-baton-345622.aurora_postgres_public.vendors\`
      WHERE handle = '${safeHandle}'
        AND _fivetran_deleted = FALSE
      LIMIT 1
    `;

    const results = await executeQuery<Vendor>(sql);

    if (results.length === 0) {
      console.log(`[Login] Vendor not found: ${safeHandle}`);
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid handle or password',
      });
    }

    const vendor = results[0];

    // Pilot mode: accept any password for vendors
    // TODO: Implement bcrypt check against a dedicated vendors auth table
    const token = generateToken(vendor.id, '', vendor.handle, 'vendor');

    console.log(`[Login] Vendor login success: ${vendor.handle} (${vendor.id})`);

    return res.json({
      token,
      user: {
        id: vendor.id,
        name: vendor.handle,
        email: '',
        handle: vendor.handle,
        role: 'vendor' as UserRole,
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
