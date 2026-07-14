/**
 * /api/admin/tasks
 *
 *   GET    → list all admin-defined tasks
 *   POST   → create or update (include `id` to update; omit to create)
 *   DELETE → delete (?id=...)
 */

import type { VercelResponse } from '@vercel/node';
import { requireAdmin } from '../require-admin';
import { AuthenticatedRequest } from '../auth-middleware';
import { listTasks, upsertTask, removeTask } from '../admin-store';

export default requireAdmin(async (req: AuthenticatedRequest, res: VercelResponse) => {
  if (req.method === 'GET') {
    return res.status(200).json({ tasks: listTasks() });
  }

  if (req.method === 'POST') {
    const body = req.body ?? {};
    if (!body.title || !body.description || !body.ctaLabel || !body.ctaHref || !body.urgency) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'title, description, urgency, ctaLabel and ctaHref are required.',
      });
    }
    const saved = upsertTask({
      ...body,
      conditions: body.conditions ?? {},
      enabled: body.enabled ?? true,
    });
    return res.status(200).json({ task: saved });
  }

  if (req.method === 'DELETE') {
    const id = (req.query?.id as string) || '';
    if (!id) return res.status(400).json({ error: 'id query param required' });
    const removed = removeTask(id);
    return res.status(removed ? 200 : 404).json({ removed });
  }

  return res.status(405).json({ error: 'Method not allowed' });
});
