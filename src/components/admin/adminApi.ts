import type {
  AdminAnnouncement,
  AdminFeaturedArticle,
  AdminTask,
  SupplierProgress,
} from '@/types/adminContent';
import { localAdmin } from '@/lib/local-admin-store';

const API_URL = import.meta.env.VITE_API_URL || '';
const DEV = import.meta.env.DEV;

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function bypass(): string {
  return DEV ? '?adminBypass=1' : '';
}

class ApiUnavailableError extends Error {}

/**
 * Read JSON, but if the server returned HTML or source code (i.e. Vite dev
 * fallthrough), throw ApiUnavailableError so callers can use localStorage.
 */
async function readJson(res: Response): Promise<unknown> {
  if (res.status === 401) {
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
    throw new Error('Session expired');
  }
  const text = await res.text();
  if (!text || !text.trim().startsWith('{')) {
    throw new ApiUnavailableError('API returned non-JSON (likely Vite dev fallthrough)');
  }
  let body: any;
  try {
    body = JSON.parse(text);
  } catch {
    throw new ApiUnavailableError('Non-JSON response body');
  }
  if (!res.ok) throw new Error(body?.error || `Request failed: ${res.status}`);
  return body;
}

async function tryApi<T>(call: () => Promise<Response>, fallback: () => T): Promise<T> {
  try {
    const res = await call();
    return (await readJson(res)) as T;
  } catch (err) {
    if (err instanceof ApiUnavailableError && DEV) {
      console.info('[adminApi] using local store fallback (DEV).');
      return fallback();
    }
    throw err;
  }
}

// ── Tasks ──────────────────────────────────────────────────────────────────
export async function fetchTasks(): Promise<AdminTask[]> {
  const data = await tryApi<{ tasks: AdminTask[] }>(
    () => fetch(`${API_URL}/api/admin/tasks${bypass()}`, { headers: authHeaders() }),
    () => ({ tasks: localAdmin.listTasks() })
  );
  return data.tasks ?? [];
}

export async function saveTask(task: Partial<AdminTask>): Promise<AdminTask> {
  const data = await tryApi<{ task: AdminTask }>(
    () =>
      fetch(`${API_URL}/api/admin/tasks${bypass()}`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(task),
      }),
    () => ({ task: localAdmin.saveTask(task) })
  );
  return data.task;
}

export async function deleteTask(id: string): Promise<void> {
  const sep = bypass() ? '&' : '?';
  await tryApi<{ removed: boolean }>(
    () =>
      fetch(`${API_URL}/api/admin/tasks${bypass()}${sep}id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: authHeaders(),
      }),
    () => {
      localAdmin.deleteTask(id);
      return { removed: true };
    }
  );
}

// ── Announcements ──────────────────────────────────────────────────────────
export async function fetchAnnouncements(): Promise<AdminAnnouncement[]> {
  const data = await tryApi<{ announcements: AdminAnnouncement[] }>(
    () => fetch(`${API_URL}/api/admin/announcements${bypass()}`, { headers: authHeaders() }),
    () => ({ announcements: localAdmin.listAnnouncements() })
  );
  return data.announcements ?? [];
}

export async function saveAnnouncement(a: Partial<AdminAnnouncement>): Promise<AdminAnnouncement> {
  const data = await tryApi<{ announcement: AdminAnnouncement }>(
    () =>
      fetch(`${API_URL}/api/admin/announcements${bypass()}`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(a),
      }),
    () => ({ announcement: localAdmin.saveAnnouncement(a) })
  );
  return data.announcement;
}

export async function deleteAnnouncement(id: string): Promise<void> {
  const sep = bypass() ? '&' : '?';
  await tryApi<{ removed: boolean }>(
    () =>
      fetch(`${API_URL}/api/admin/announcements${bypass()}${sep}id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: authHeaders(),
      }),
    () => {
      localAdmin.deleteAnnouncement(id);
      return { removed: true };
    }
  );
}

// ── Articles ───────────────────────────────────────────────────────────────
export async function fetchArticles(): Promise<AdminFeaturedArticle[]> {
  const data = await tryApi<{ articles: AdminFeaturedArticle[] }>(
    () => fetch(`${API_URL}/api/admin/articles${bypass()}`, { headers: authHeaders() }),
    () => ({ articles: localAdmin.listArticles() })
  );
  return data.articles ?? [];
}

export async function saveArticle(a: Partial<AdminFeaturedArticle>): Promise<AdminFeaturedArticle> {
  const data = await tryApi<{ article: AdminFeaturedArticle }>(
    () =>
      fetch(`${API_URL}/api/admin/articles${bypass()}`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(a),
      }),
    () => ({ article: localAdmin.saveArticle(a) })
  );
  return data.article;
}

export async function deleteArticle(id: string): Promise<void> {
  const sep = bypass() ? '&' : '?';
  await tryApi<{ removed: boolean }>(
    () =>
      fetch(`${API_URL}/api/admin/articles${bypass()}${sep}id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: authHeaders(),
      }),
    () => {
      localAdmin.deleteArticle(id);
      return { removed: true };
    }
  );
}

// ── Progress ───────────────────────────────────────────────────────────────
export async function fetchSellerProgress(): Promise<SupplierProgress[]> {
  const data = await tryApi<{ rows: SupplierProgress[] }>(
    () => fetch(`${API_URL}/api/admin/seller-progress${bypass()}`, { headers: authHeaders() }),
    () => ({ rows: buildLocalProgressRows() })
  );
  return data.rows ?? [];
}

/**
 * DEV-fallback: synthesise demo seller-progress rows so the dashboard renders
 * without a backend. Mirrors the structure of the real endpoint.
 */
function buildLocalProgressRows(): SupplierProgress[] {
  const tasks = localAdmin.listTasks().filter((t) => t.enabled);
  const demo: Array<{
    vendorId: string;
    shopName: string;
    lifecycle: 'new' | 'active' | 'power' | 'dormant';
    profileCompletion: number;
    bankStatus: string;
    hasFirstListing: boolean;
    hasFirstOrder: boolean;
    hasReceivedPayout: boolean;
    daysSinceSignup: number | null;
    lastOrderAt: string | null;
  }> = [
    { vendorId: 'creed-vintage',  shopName: 'Creed Vintage',  lifecycle: 'power',   profileCompletion: 1.0, bankStatus: 'approved', hasFirstListing: true,  hasFirstOrder: true,  hasReceivedPayout: true,  daysSinceSignup: 220, lastOrderAt: '2026-06-21T08:00:00Z' },
    { vendorId: 'vibe-vintage',   shopName: 'Vibe Vintage',   lifecycle: 'active',  profileCompletion: 0.8, bankStatus: 'approved', hasFirstListing: true,  hasFirstOrder: true,  hasReceivedPayout: true,  daysSinceSignup: 92,  lastOrderAt: '2026-06-19T14:00:00Z' },
    { vendorId: 'demo-new',       shopName: 'New Threads Co', lifecycle: 'new',     profileCompletion: 0.4, bankStatus: 'none',     hasFirstListing: false, hasFirstOrder: false, hasReceivedPayout: false, daysSinceSignup: 4,   lastOrderAt: null },
    { vendorId: 'demo-stuck',     shopName: 'Slow Starter',   lifecycle: 'new',     profileCompletion: 0.6, bankStatus: 'rejected', hasFirstListing: false, hasFirstOrder: false, hasReceivedPayout: false, daysSinceSignup: 12,  lastOrderAt: null },
    { vendorId: 'demo-dormant',   shopName: 'Quiet Closet',   lifecycle: 'dormant', profileCompletion: 1.0, bankStatus: 'approved', hasFirstListing: true,  hasFirstOrder: true,  hasReceivedPayout: true,  daysSinceSignup: 320, lastOrderAt: '2026-04-10T10:00:00Z' },
  ];

  return demo.map((d) => ({
    ...d,
    openTasksCount: tasks.filter((t) => matchConditions(t.conditions, d)).length,
  }));
}

function matchConditions(c: AdminTask['conditions'], d: Pick<SupplierProgress, 'lifecycle' | 'bankStatus' | 'hasFirstListing' | 'hasFirstOrder' | 'hasReceivedPayout' | 'profileCompletion'>): boolean {
  if (c.lifecycles && c.lifecycles.length > 0 && !c.lifecycles.includes(d.lifecycle)) return false;
  if (c.bankStatuses && c.bankStatuses.length > 0 && !c.bankStatuses.includes(d.bankStatus as any)) return false;
  if (c.hasFirstListing && c.hasFirstListing !== 'any' && (c.hasFirstListing === 'yes') !== d.hasFirstListing) return false;
  if (c.hasFirstOrder && c.hasFirstOrder !== 'any' && (c.hasFirstOrder === 'yes') !== d.hasFirstOrder) return false;
  if (c.hasReceivedPayout && c.hasReceivedPayout !== 'any' && (c.hasReceivedPayout === 'yes') !== d.hasReceivedPayout) return false;
  if (c.profileComplete && c.profileComplete !== 'any' && (c.profileComplete === 'yes') !== (d.profileCompletion >= 1)) return false;
  return true;
}

/**
 * For the supplier homepage DEV preview path — merge admin-managed tasks +
 * announcements + featured articles into an existing mock HomeConfig so
 * admin edits show up live in the local demo.
 */
export { localAdmin };
