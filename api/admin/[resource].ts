/**
 * /api/admin/:resource — single dynamic function dispatching to the admin
 * handlers (consolidated to stay under Vercel Hobby's 12-function limit).
 * URLs are unchanged: /api/admin/announcements, /articles, /tasks, /seller-progress.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import announcements from '../_lib/admin-handlers/announcements';
import articles from '../_lib/admin-handlers/articles';
import sellerProgress from '../_lib/admin-handlers/seller-progress';
import tasks from '../_lib/admin-handlers/tasks';

const handlers: Record<string, (req: VercelRequest, res: VercelResponse) => Promise<void> | void> = {
  announcements,
  articles,
  tasks,
  'seller-progress': sellerProgress,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const resource = String(req.query.resource ?? '');
  const h = handlers[resource];
  if (!h) {
    res.status(404).json({ error: `Unknown admin resource: ${resource}` });
    return;
  }
  return h(req, res);
}
