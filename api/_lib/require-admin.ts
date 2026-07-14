/**
 * Admin auth middleware. Wraps requireAuth and additionally checks the JWT
 * role is admin or owner.
 *
 * Pilot mode: if `PILOT_BYPASS_ADMIN` env is truthy OR the request includes
 * `?adminBypass=1` while running in dev (`process.env.NODE_ENV !== 'production'`),
 * the role check is skipped so we can demo without provisioning admin users.
 */

import type { VercelResponse } from '@vercel/node';
import { requireAuth, AuthenticatedRequest } from './auth-middleware';

export function requireAdmin(
  handler: (req: AuthenticatedRequest, res: VercelResponse) => Promise<void> | void
) {
  return requireAuth(async (req, res) => {
    const role = req.user?.role;
    const isAdmin = role === 'admin' || role === 'owner';
    const pilotBypass =
      process.env.PILOT_BYPASS_ADMIN === '1' ||
      (process.env.NODE_ENV !== 'production' && req.query?.adminBypass === '1');

    if (!isAdmin && !pilotBypass) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'Admin Console requires an admin or owner role.',
      });
      return;
    }
    return handler(req, res);
  });
}
