/**
 * Help Center content API — backed by Vercel Blob (help-center/content.json).
 *
 * GET            → public: published articles + updates + media index (sellers)
 * GET ?full=1    → admin: everything incl. drafts (the manager portal)
 * PUT            → admin: overwrite the content document (portal auto-push)
 *
 * This is the production seam behind src/components/university/store.ts.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { head, put } from '@vercel/blob';
import { requireAdmin } from '../require-admin';

const PATHNAME = 'help-center/content.json';

async function readContent(): Promise<Record<string, unknown> | null> {
  try {
    const h = await head(PATHNAME);
    const res = await fetch(h.url, { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return null; // not created yet
  }
}

async function getPublic(_req: VercelRequest, res: VercelResponse) {
  const data = await readContent();
  if (!data) {
    res.status(404).json({ error: 'No content published yet' });
    return;
  }
  const articles = Array.isArray(data.articles)
    ? (data.articles as { status?: string }[]).filter((a) => a.status === 'published')
    : [];
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=120');
  res.status(200).json({ version: data.version ?? 1, articles, updates: data.updates ?? [], media: data.media ?? [] });
}

const getFull = requireAdmin(async (_req, res) => {
  const data = await readContent();
  if (!data) {
    res.status(404).json({ error: 'No content yet' });
    return;
  }
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json(data);
});

const putContent = requireAdmin(async (req, res) => {
  const body = req.body;
  if (!body || !Array.isArray(body.articles)) {
    res.status(400).json({ error: 'Body must be the content document with articles[]' });
    return;
  }
  await put(PATHNAME, JSON.stringify(body), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
  });
  res.status(200).json({ ok: true, articles: body.articles.length, savedAt: new Date().toISOString() });
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    if (req.query.full === '1') return getFull(req, res);
    return getPublic(req, res);
  }
  if (req.method === 'PUT') return putContent(req, res);
  res.status(405).json({ error: 'Method not allowed' });
}
