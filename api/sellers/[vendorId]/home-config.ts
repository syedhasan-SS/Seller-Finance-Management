/**
 * GET /api/sellers/:vendorId/home-config
 *
 * Returns the HomeConfig used by the Seller Homepage V2 renderer.
 * Server-side rules engine — frontend is a pure projection.
 *
 * Pilot caveats:
 * - Profile + bank persistence aren't fully wired yet. We seed from the same
 *   stubs the profile/bank endpoints use. When those endpoints get a real
 *   datastore, this aggregator picks up the change automatically.
 * - BigQuery aggregates are wrapped in try/catch in seller-signals — the page
 *   renders with zeros if creds aren't available locally.
 */

import type { VercelResponse } from '@vercel/node';
import { requireAuth, AuthenticatedRequest } from '../../_lib/auth-middleware';
import { getSellerSignals } from '../../_lib/seller-signals';
import { buildHomeConfig } from '../../_lib/home-rules';

export default requireAuth(async (req: AuthenticatedRequest, res: VercelResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { vendorId } = req.query as { vendorId: string };

  // Vendor-scoped access check, same pattern as profile/bank endpoints.
  const vendorHandle = req.user?.vendor_handle;
  if (vendorHandle && vendorHandle !== vendorId && req.user?.role === 'vendor') {
    return res
      .status(403)
      .json({ error: 'Access denied', message: 'You can only view your own home.' });
  }

  try {
    const signals = await getSellerSignals(vendorId, {
      vendorHandle: vendorHandle ?? vendorId,
      email: req.user?.supplier_email,
      // TODO: read shopName/bio from the profile store once it exists.
      // TODO: read bankStatus from the bank-account-submit store once it exists.
    });
    const config = buildHomeConfig(signals, vendorId);
    return res.status(200).json(config);
  } catch (err: any) {
    console.error('[home-config] failed to build config:', err);
    return res
      .status(500)
      .json({ error: 'Failed to build home config', message: err?.message ?? 'unknown' });
  }
});
