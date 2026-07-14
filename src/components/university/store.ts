/**
 * Help Center content store — local pilot implementation.
 *
 * Persists to localStorage so SX can migrate real content TODAY with zero
 * backend setup. Export/Import JSON gives backup + cross-browser transfer.
 * The public API (list/get/upsert/remove/…) is the migration seam: Phase 0
 * swaps the internals for Supabase without touching any component.
 */
import { articles as seedArticles, slugify, updates as seedUpdates, type Article, type Update } from './data';
import { htmlToBlocks, topicForTitle } from './htmlToBlocks';
import zendeskRaw from './zendesk-raw';

export type ArticleStatus = 'draft' | 'published' | 'archived';

export interface StoredArticle extends Article {
  status: ArticleStatus;
  updatedAt: string; // ISO
}

/** Media whose file lives on Vercel Blob (CDN URL) — shared across editors. */
export interface RemoteMedia {
  id: string;
  url: string;
  name: string;
  mime: string;
  size: number;
  alt: string;
  createdAt: string;
}

interface HCData {
  version: 1;
  articles: StoredArticle[];
  updates: Update[];
  media?: RemoteMedia[];
}

const KEY = 'fleek-help-center-v1';
const EVENT = 'uni-store-changed';

/** Real Fleek content seeded from the live Sea Shipping article. */
const seaShipping: StoredArticle = {
  slug: 'sea-shipping-policy-and-guide',
  topic: 'Ship Orders',
  title: 'Sea Shipping policy & guide',
  readMins: 2,
  updated: 'Updated this week',
  status: 'published',
  updatedAt: new Date().toISOString(),
  blocks: [
    {
      type: 'in_short',
      text: 'Sea Shipping is a lower-cost freight option — the same products from the same suppliers, with shipping cost cut by up to 70%. Buyers see the delivery estimate clearly at checkout.',
    },
    { type: 'section', title: 'What is Sea Shipping, and why offer it?' },
    { type: 'text', html: 'It makes your <b>bulk and heavy lots</b> far more affordable for buyers, helping you win and grow orders. Buyers are actively requesting it in chats — offering it removes a common reason deals stall.' },
    { type: 'text', html: 'Sea shipping orders usually take <b>60 to 90 days</b> to deliver, depending on the destination region. The estimated delivery time is shown to buyers during checkout, before they place the order.' },
    { type: 'text', html: 'Your fulfillment and order-preparation time stays <b>exactly the same</b> as today.' },
    { type: 'section', title: 'How do I enable it on a listing?' },
    { type: 'step', n: 1, html: 'Create a <b>Custom Handpick</b> listing as usual.' },
    { type: 'step', n: 2, html: 'Select the <b>Sea Shipping</b> option before you publish. Nothing else in your process changes.' },
    { type: 'video', caption: 'Watch: enabling Sea Shipping on a listing', length: '1:00' },
    {
      type: 'callout',
      tone: 'warn',
      title: 'Not yet on Exact or Representative listings',
      text: 'Sea Shipping is currently available on Custom Handpick listings only.',
    },
    {
      type: 'faq',
      items: [
        { q: 'Do I pay anything extra?', a: 'No — you prepare the order the same way. The freight choice and cost sit on the buyer side.' },
        { q: 'What if the buyer asks about delays?', a: 'The 60–90 day window is shown at checkout, so buyers accept it before ordering. Point them to their order page for the live estimate.' },
      ],
    },
  ],
};

function seed(): HCData {
  return {
    version: 1,
    articles: [
      ...seedArticles.map((a): StoredArticle => ({ ...a, status: 'published', updatedAt: new Date().toISOString() })),
      seaShipping,
    ],
    updates: [...seedUpdates],
  };
}

const ZD_MERGED_FLAG = 'fleek-hc-zendesk-merged-v1';

/**
 * One-time, non-destructive merge of the full Zendesk "For Sellers" library
 * (26 articles pulled 2026-07-10). Each lands as a DRAFT; slugs that already
 * exist (e.g. our rewritten Sea Shipping) are skipped so local work wins.
 */
function mergeZendesk(data: HCData): boolean {
  if (localStorage.getItem(ZD_MERGED_FLAG)) return false;
  const existing = new Set(data.articles.map((a) => a.slug));
  let added = 0;
  for (const raw of zendeskRaw) {
    const slug = slugify(raw.title);
    if (existing.has(slug)) continue;
    try {
      const blocks = htmlToBlocks(raw.body);
      if (!blocks.length) continue;
      const words = raw.body.replace(/<[^>]+>/g, ' ').split(/\s+/).length;
      data.articles.push({
        slug,
        title: raw.title,
        topic: topicForTitle(raw.title),
        readMins: Math.max(1, Math.round(words / 180)),
        updated: 'Imported from Zendesk',
        blocks,
        status: 'draft',
        updatedAt: new Date().toISOString(),
      });
      added++;
    } catch (err) {
      console.warn('[help-center store] zendesk convert failed:', raw.title, err);
    }
  }
  localStorage.setItem(ZD_MERGED_FLAG, '1');
  if (added) console.info(`[help-center store] merged ${added} Zendesk articles as drafts`);
  return added > 0;
}

function load(): HCData {
  let data: HCData | null = null;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) data = JSON.parse(raw) as HCData;
  } catch (err) {
    console.warn('[help-center store] could not read localStorage; reseeding', err);
  }
  if (!data) {
    data = seed();
    persist(data);
  }
  if (mergeZendesk(data)) persist(data);
  return data;
}

function persist(data: HCData) {
  localStorage.setItem(KEY, JSON.stringify(data));
  window.dispatchEvent(new Event(EVENT));
  schedulePush(); // no-op while offline/public mode
}

export function subscribe(cb: () => void): () => void {
  window.addEventListener(EVENT, cb);
  window.addEventListener('storage', cb); // cross-tab: edit in manager, see it in /university
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener('storage', cb);
  };
}

// ── articles ────────────────────────────────────────────────────────────────

export function listArticles(): StoredArticle[] {
  return load().articles.slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function publishedArticles(): StoredArticle[] {
  return listArticles().filter((a) => a.status === 'published');
}

export function getArticle(slug: string): StoredArticle | undefined {
  return load().articles.find((a) => a.slug === slug);
}

export function upsertArticle(article: StoredArticle) {
  const data = load();
  const i = data.articles.findIndex((a) => a.slug === article.slug);
  const stamped = { ...article, updatedAt: new Date().toISOString() };
  if (i >= 0) data.articles[i] = stamped;
  else data.articles.push(stamped);
  persist(data);
}

export function setArticleStatus(slug: string, status: ArticleStatus) {
  const a = getArticle(slug);
  if (a) upsertArticle({ ...a, status });
}

export function removeArticle(slug: string) {
  const data = load();
  data.articles = data.articles.filter((a) => a.slug !== slug);
  persist(data);
}

export function duplicateArticle(slug: string): string | undefined {
  const a = getArticle(slug);
  if (!a) return undefined;
  const copySlug = uniqueSlug(`${a.slug}-copy`);
  upsertArticle({ ...a, slug: copySlug, title: `${a.title} (copy)`, status: 'draft' });
  return copySlug;
}

export function uniqueSlug(base: string): string {
  const taken = new Set(load().articles.map((a) => a.slug));
  if (!taken.has(base)) return base;
  let i = 2;
  while (taken.has(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}

// ── updates (announcements) ─────────────────────────────────────────────────

export function listUpdates(): Update[] {
  return load().updates;
}

export function upsertUpdate(u: Update) {
  const data = load();
  const i = data.updates.findIndex((x) => x.id === u.id);
  if (i >= 0) data.updates[i] = u;
  else data.updates.unshift(u);
  persist(data);
}

export function removeUpdate(id: string) {
  const data = load();
  data.updates = data.updates.filter((u) => u.id !== id);
  persist(data);
}

// ── backup ──────────────────────────────────────────────────────────────────

export function exportJson(): string {
  return JSON.stringify(load(), null, 2);
}

export function importJson(text: string): { ok: boolean; message: string } {
  try {
    const parsed = JSON.parse(text) as HCData;
    if (!Array.isArray(parsed.articles)) return { ok: false, message: 'Not a valid backup: missing articles[]' };
    persist({ version: 1, articles: parsed.articles, updates: parsed.updates ?? [] });
    return { ok: true, message: `Imported ${parsed.articles.length} articles` };
  } catch {
    return { ok: false, message: 'Could not parse that file as JSON' };
  }
}

export function resetToSeed() {
  persist(seed());
}

// ── remote media index (files on Vercel Blob, metadata synced here) ─────────

export function listRemoteMedia(): RemoteMedia[] {
  return load().media ?? [];
}

export function addRemoteMedia(m: RemoteMedia) {
  const data = load();
  data.media = [...(data.media ?? []).filter((x) => x.id !== m.id), m];
  persist(data);
}

export function updateRemoteMediaAlt(id: string, alt: string) {
  const data = load();
  data.media = (data.media ?? []).map((m) => (m.id === id ? { ...m, alt } : m));
  persist(data);
}

export function removeRemoteMedia(id: string) {
  const data = load();
  data.media = (data.media ?? []).filter((m) => m.id !== id);
  persist(data);
}

// ── server sync (Vercel Blob via /api/help-center/content) ──────────────────
// Local-first: localStorage stays the working copy so every component keeps
// its synchronous reads; the server document is pulled+merged on boot and
// pushed (debounced) after every persist while online.

let online = false;
let pushTimer: ReturnType<typeof setTimeout> | null = null;

export function isOnline(): boolean {
  return online;
}

function authHeaders(): Record<string, string> {
  const t = localStorage.getItem('auth_token');
  return t ? { Authorization: `Bearer ${t}` } : {};
}

function schedulePush() {
  if (!online) return;
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(async () => {
    try {
      const res = await fetch('/api/help-center/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: localStorage.getItem(KEY) ?? '{}',
      });
      if (!res.ok) console.warn('[help-center sync] push rejected:', res.status);
    } catch (err) {
      console.warn('[help-center sync] push failed (kept locally):', err);
    }
  }, 1500);
}

/**
 * Admin/manager boot. Once a server document exists it is the source of
 * truth: local state is REPLACED wholesale on boot (prevents deleted drafts
 * resurrecting from another browser's seed data). After boot, edits are
 * local-first and pushed on every save. If the server has no content yet
 * (first-ever bootstrap), local seeds are pushed up.
 */
export async function initSyncAdmin(): Promise<'online' | 'local'> {
  try {
    const res = await fetch('/api/help-center/content?full=1', { headers: authHeaders() });
    if (res.status === 404) {
      online = true; // API reachable, nothing published yet → seed it with ours
      schedulePush();
      return 'online';
    }
    if (!res.ok) throw new Error(`status ${res.status}`);
    const remote = (await res.json()) as HCData;
    online = true;
    localStorage.setItem(ZD_MERGED_FLAG, '1'); // server exists → never re-seed Zendesk drafts
    persist({
      version: 1,
      articles: remote.articles ?? [],
      updates: remote.updates ?? [],
      media: remote.media ?? [],
    });
    return 'online';
  } catch {
    online = false;
    return 'local';
  }
}

/** Seller boot: replace local content with the published server document. */
export async function initSyncPublic(): Promise<'online' | 'local'> {
  try {
    const res = await fetch('/api/help-center/content');
    if (!res.ok) throw new Error(`status ${res.status}`);
    const remote = (await res.json()) as HCData;
    const local = load();
    persist({
      version: 1,
      articles: [
        ...(remote.articles ?? []),
        // keep local non-published seeds out; server is the truth for sellers
      ],
      updates: remote.updates ?? local.updates,
      media: remote.media ?? [],
    });
    return 'online';
  } catch {
    return 'local'; // dev without API → seeded local content
  }
}
