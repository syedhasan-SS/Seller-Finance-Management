/**
 * /api/admin/articles
 *   GET / POST (upsert) / DELETE (?id=…)
 */

import type { VercelResponse } from '@vercel/node';
import { requireAdmin } from '../require-admin';
import { AuthenticatedRequest } from '../auth-middleware';
import { listArticles, upsertArticle, removeArticle } from '../admin-store';

export default requireAdmin(async (req: AuthenticatedRequest, res: VercelResponse) => {
  if (req.method === 'GET') {
    return res.status(200).json({ articles: listArticles() });
  }

  if (req.method === 'POST') {
    const body = req.body ?? {};
    if (!body.title || !body.summary || !body.href) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'title, summary and href are required.',
      });
    }
    const saved = upsertArticle({
      ...body,
      order: typeof body.order === 'number' ? body.order : 999,
      conditions: body.conditions ?? {},
      enabled: body.enabled ?? true,
    });
    return res.status(200).json({ article: saved });
  }

  if (req.method === 'DELETE') {
    const id = (req.query?.id as string) || '';
    if (!id) return res.status(400).json({ error: 'id query param required' });
    const removed = removeArticle(id);
    return res.status(removed ? 200 : 404).json({ removed });
  }

  return res.status(405).json({ error: 'Method not allowed' });
});
