/**
 * Admin content store.
 *
 * Pilot implementation: in-memory map seeded from data/admin-seed.json on cold
 * start. Mutations persist for the lifetime of the Node process (local dev) but
 * reset on Vercel cold starts. Engineering replaces this with a real KV/DB at
 * productionisation time — the public interface (get/list/upsert/remove) is
 * the migration seam.
 */

import fs from 'node:fs';
import path from 'node:path';
import type {
  AdminAnnouncement,
  AdminFeaturedArticle,
  AdminTask,
} from './admin-content-types';

interface AdminStoreData {
  tasks: AdminTask[];
  announcements: AdminAnnouncement[];
  articles: AdminFeaturedArticle[];
}

const SEED_PATH = path.join(process.cwd(), 'data', 'admin-seed.json');

let cache: AdminStoreData | null = null;

function load(): AdminStoreData {
  if (cache) return cache;
  try {
    const raw = fs.readFileSync(SEED_PATH, 'utf-8');
    cache = JSON.parse(raw) as AdminStoreData;
  } catch (err) {
    console.warn('[admin-store] could not read seed; starting empty:', err);
    cache = { tasks: [], announcements: [], articles: [] };
  }
  return cache;
}

function now(): string {
  return new Date().toISOString();
}

function makeId(prefix: string): string {
  const rand = Math.floor(Math.random() * 1e9).toString(36);
  return `${prefix}-${Date.now().toString(36)}-${rand}`;
}

// ── Tasks ──────────────────────────────────────────────────────────────────
export function listTasks(): AdminTask[] {
  return [...load().tasks];
}

export function getTask(id: string): AdminTask | undefined {
  return load().tasks.find((t) => t.id === id);
}

export function upsertTask(input: Partial<AdminTask> & Omit<AdminTask, 'id' | 'createdAt' | 'updatedAt'>): AdminTask {
  const store = load();
  if (input.id) {
    const idx = store.tasks.findIndex((t) => t.id === input.id);
    if (idx >= 0) {
      const updated: AdminTask = { ...store.tasks[idx], ...input, updatedAt: now() } as AdminTask;
      store.tasks[idx] = updated;
      return updated;
    }
  }
  const created: AdminTask = {
    ...input,
    id: input.id ?? makeId('tsk'),
    createdAt: now(),
    updatedAt: now(),
  } as AdminTask;
  store.tasks.push(created);
  return created;
}

export function removeTask(id: string): boolean {
  const store = load();
  const before = store.tasks.length;
  store.tasks = store.tasks.filter((t) => t.id !== id);
  return store.tasks.length < before;
}

// ── Announcements ──────────────────────────────────────────────────────────
export function listAnnouncements(): AdminAnnouncement[] {
  return [...load().announcements];
}

export function getAnnouncement(id: string): AdminAnnouncement | undefined {
  return load().announcements.find((a) => a.id === id);
}

export function upsertAnnouncement(
  input: Partial<AdminAnnouncement> & Omit<AdminAnnouncement, 'id' | 'createdAt' | 'updatedAt'>
): AdminAnnouncement {
  const store = load();
  if (input.id) {
    const idx = store.announcements.findIndex((a) => a.id === input.id);
    if (idx >= 0) {
      const updated: AdminAnnouncement = {
        ...store.announcements[idx],
        ...input,
        updatedAt: now(),
      } as AdminAnnouncement;
      store.announcements[idx] = updated;
      return updated;
    }
  }
  const created: AdminAnnouncement = {
    ...input,
    id: input.id ?? makeId('anc'),
    createdAt: now(),
    updatedAt: now(),
  } as AdminAnnouncement;
  store.announcements.push(created);
  return created;
}

export function removeAnnouncement(id: string): boolean {
  const store = load();
  const before = store.announcements.length;
  store.announcements = store.announcements.filter((a) => a.id !== id);
  return store.announcements.length < before;
}

// ── Featured articles ─────────────────────────────────────────────────────
export function listArticles(): AdminFeaturedArticle[] {
  return [...load().articles].sort((a, b) => a.order - b.order);
}

export function getArticle(id: string): AdminFeaturedArticle | undefined {
  return load().articles.find((a) => a.id === id);
}

export function upsertArticle(
  input: Partial<AdminFeaturedArticle> & Omit<AdminFeaturedArticle, 'id' | 'createdAt' | 'updatedAt'>
): AdminFeaturedArticle {
  const store = load();
  if (input.id) {
    const idx = store.articles.findIndex((a) => a.id === input.id);
    if (idx >= 0) {
      const updated: AdminFeaturedArticle = {
        ...store.articles[idx],
        ...input,
        updatedAt: now(),
      } as AdminFeaturedArticle;
      store.articles[idx] = updated;
      return updated;
    }
  }
  const created: AdminFeaturedArticle = {
    ...input,
    id: input.id ?? makeId('art'),
    createdAt: now(),
    updatedAt: now(),
  } as AdminFeaturedArticle;
  store.articles.push(created);
  return created;
}

export function removeArticle(id: string): boolean {
  const store = load();
  const before = store.articles.length;
  store.articles = store.articles.filter((a) => a.id !== id);
  return store.articles.length < before;
}
