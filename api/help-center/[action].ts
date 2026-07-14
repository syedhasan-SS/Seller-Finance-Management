/**
 * /api/help-center/:action — single dynamic function dispatching to the
 * help-center handlers (consolidated for Vercel Hobby's 12-function limit).
 * URLs are unchanged: /api/help-center/content, /api/help-center/upload.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import content from '../_lib/help-center/content';
import upload from '../_lib/help-center/upload';

const handlers: Record<string, (req: VercelRequest, res: VercelResponse) => Promise<void> | void> = {
  content,
  upload,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const action = String(req.query.action ?? '');
  const h = handlers[action];
  if (!h) {
    res.status(404).json({ error: `Unknown help-center action: ${action}` });
    return;
  }
  return h(req, res);
}
