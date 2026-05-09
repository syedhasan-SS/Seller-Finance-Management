/**
 * GET /api/sellers/:vendorId/profile
 * Returns the supplier's current profile information.
 *
 * POST /api/sellers/:vendorId/profile
 * Updates a profile field (shop name, bio).
 * Sensitive fields (email, phone) require OTP verification — handled separately.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth, AuthenticatedRequest } from '../../_lib/auth-middleware';

interface ProfileUpdateBody {
  field: 'shopName' | 'bio';
  value: string;
}

export default requireAuth(async (req: AuthenticatedRequest, res: VercelResponse) => {
  const { vendorId } = req.query as { vendorId: string };
  const vendorHandle = req.user?.vendor_handle;

  // Ensure supplier can only access their own profile
  if (vendorHandle && vendorHandle !== vendorId && req.user?.role === 'vendor') {
    return res.status(403).json({ error: 'Access denied', message: 'You can only access your own profile.' });
  }

  if (req.method === 'GET') {
    // Return current profile data
    // TODO: Replace with live data from aurora_postgres_public.vendors once write-back is available
    return res.status(200).json({
      handle: vendorHandle || vendorId,
      shopName: vendorHandle || vendorId,
      bio: '',
      email: req.user?.supplier_email || '',
      phone: '',
      profilePictureUrl: null,
    });
  }

  if (req.method === 'POST') {
    const { field, value } = req.body as ProfileUpdateBody;

    if (!field || value === undefined) {
      return res.status(400).json({ error: 'Bad request', message: '`field` and `value` are required.' });
    }

    const allowedFields = ['shopName', 'bio'];
    if (!allowedFields.includes(field)) {
      return res.status(400).json({
        error: 'Invalid field',
        message: `Field must be one of: ${allowedFields.join(', ')}`,
      });
    }

    if (typeof value !== 'string' || value.trim().length === 0) {
      return res.status(400).json({ error: 'Invalid value', message: 'Value cannot be empty.' });
    }

    if (value.length > 500) {
      return res.status(400).json({ error: 'Invalid value', message: 'Value exceeds maximum length.' });
    }

    // TODO: Persist to operational database when available.
    // For Phase 1 MVP, acknowledge the update.
    console.log(`[Profile] Update for ${vendorId}: ${field} = "${value.trim()}"`);

    return res.status(200).json({
      success: true,
      field,
      value: value.trim(),
      updatedAt: new Date().toISOString(),
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
});
