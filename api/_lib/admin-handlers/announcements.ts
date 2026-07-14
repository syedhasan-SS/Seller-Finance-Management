/**
 * /api/admin/announcements
 *   GET / POST (upsert) / DELETE (?id=…)
 */

import type { VercelResponse } from '@vercel/node';
import { requireAdmin } from '../require-admin';
import { AuthenticatedRequest } from '../auth-middleware';
import { listAnnouncements, upsertAnnouncement, removeAnnouncement } from '../admin-store';

export default requireAdmin(async (req: AuthenticatedRequest, res: VercelResponse) => {
  if (req.method === 'GET') {
    return res.status(200).json({ announcements: listAnnouncements() });
  }

  if (req.method === 'POST') {
    const body = req.body ?? {};
    if (!body.title || !body.body || !body.severity) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'title, body and severity are required.',
      });
    }
    const saved = upsertAnnouncement({
      ...body,
      conditions: body.conditions ?? {},
      dismissible: body.dismissible ?? true,
      enabled: body.enabled ?? true,
    });
    return res.status(200).json({ announcement: saved });
  }

  if (req.method === 'DELETE') {
    const id = (req.query?.id as string) || '';
    if (!id) return res.status(400).json({ error: 'id query param required' });
    const removed = removeAnnouncement(id);
    return res.status(removed ? 200 : 404).json({ removed });
  }

  return res.status(405).json({ error: 'Method not allowed' });
});
