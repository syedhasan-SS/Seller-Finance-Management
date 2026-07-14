/**
 * DEV-only localStorage fallback for the Admin Console.
 *
 * Vite's dev server doesn't run Vercel serverless functions, so /api/admin/*
 * returns HTML/source instead of JSON. To keep the demo working end-to-end
 * locally, the admin UI falls back to localStorage when the API call fails.
 *
 * In production (Vercel deploy), the API works and this code path is not hit.
 *
 * Seed mirrors data/admin-seed.json — kept here as a TS constant so we don't
 * need a fetch round-trip to bootstrap the local store on first load.
 */

import type {
  AdminAnnouncement,
  AdminFeaturedArticle,
  AdminTask,
} from '@/types/adminContent';

const KEY = 'fleek_admin_store_v1';

interface LocalStore {
  tasks: AdminTask[];
  announcements: AdminAnnouncement[];
  articles: AdminFeaturedArticle[];
}

const NOW = '2026-06-21T00:00:00.000Z';

const SEED: LocalStore = {
  tasks: [
    {
      id: 'tsk-bank-verification',
      title: 'Submit your bank verification video',
      description:
        'Record a short video confirming your bank account details so we can verify and enable payouts.',
      urgency: 'critical',
      icon: 'CreditCard',
      ctaLabel: 'Submit verification video',
      ctaHref: '/tools/seller-profile-manager?tab=bank',
      estimatedMinutes: 5,
      conditions: { bankStatuses: ['none', 'submitted', 'rejected'] },
      enabled: true,
      createdAt: NOW,
      updatedAt: NOW,
    },
    {
      id: 'tsk-first-listing',
      title: 'Create your first listing',
      description: 'Upload at least one product so buyers can discover your shop.',
      urgency: 'high',
      icon: 'Package',
      ctaLabel: 'Start listing',
      ctaHref: '/tools/seller-profile-manager?tab=listings',
      estimatedMinutes: 15,
      conditions: { hasFirstListing: 'no', bankStatuses: ['approved', 'under_review'] },
      enabled: true,
      createdAt: NOW,
      updatedAt: NOW,
    },
    {
      id: 'tsk-first-order',
      title: 'Get ready for your first order',
      description: 'Review our quick-start playbook so you can ship your first sale within 24 hours.',
      urgency: 'medium',
      icon: 'ShoppingBag',
      ctaLabel: 'Open playbook',
      ctaHref: 'https://help.joinfleek.com/seller/first-order',
      estimatedMinutes: 4,
      conditions: { hasFirstListing: 'yes', hasFirstOrder: 'no' },
      enabled: true,
      createdAt: NOW,
      updatedAt: NOW,
    },
    {
      id: 'tsk-fulfill-pending',
      title: 'Fulfil your pending orders',
      description: 'You have orders awaiting fulfilment. Ship soon to keep your performance metrics strong.',
      urgency: 'high',
      icon: 'Truck',
      ctaLabel: 'Open orders',
      ctaHref: '/orders',
      estimatedMinutes: 10,
      conditions: { hasFirstOrder: 'yes' },
      enabled: true,
      createdAt: NOW,
      updatedAt: NOW,
    },
    {
      id: 'tsk-understand-payments',
      title: 'Understand how payouts work',
      description: 'Learn when payouts happen, how holds work, and how to read your statement.',
      urgency: 'low',
      icon: 'Wallet',
      ctaLabel: 'Read payout guide',
      ctaHref: 'https://help.joinfleek.com/seller/payouts',
      estimatedMinutes: 3,
      conditions: { hasFirstOrder: 'yes', hasReceivedPayout: 'no' },
      enabled: true,
      createdAt: NOW,
      updatedAt: NOW,
    },
    {
      id: 'tsk-grow-listings',
      title: 'Grow your shop — add more listings',
      description: 'Sellers with 50+ listings see 3× more orders. Add inventory to lift visibility.',
      urgency: 'low',
      icon: 'TrendingUp',
      ctaLabel: 'Add listings',
      ctaHref: '/tools/seller-profile-manager?tab=listings',
      estimatedMinutes: 20,
      conditions: { hasReceivedPayout: 'yes', lifecycles: ['active'] },
      enabled: true,
      createdAt: NOW,
      updatedAt: NOW,
    },
  ],
  announcements: [
    {
      id: 'anc-welcome-pilot',
      severity: 'info',
      title: 'Welcome to the Fleek seller portal pilot',
      body:
        "You're one of our first sellers to try the new homepage. Share feedback with your account manager any time.",
      ctaLabel: 'Open feedback form',
      ctaHref: 'https://help.joinfleek.com/seller/feedback',
      conditions: { lifecycles: ['new', 'active'] },
      startsAt: null,
      endsAt: null,
      dismissible: true,
      enabled: true,
      createdAt: NOW,
      updatedAt: NOW,
    },
  ],
  articles: [
    {
      id: 'art-getting-started',
      title: 'Getting started on Fleek',
      summary: 'A 5-minute tour of the seller portal — profile, listings, and your first payout.',
      href: 'https://help.joinfleek.com/seller/getting-started',
      tag: 'getting-started',
      order: 1,
      conditions: { lifecycles: ['new'] },
      enabled: true,
      createdAt: NOW,
      updatedAt: NOW,
    },
    {
      id: 'art-upload-products',
      title: 'How to upload products',
      summary: 'Photo, title, grade, and pricing tips that lift conversion.',
      href: 'https://help.joinfleek.com/seller/listings',
      tag: 'listings',
      order: 2,
      conditions: {},
      enabled: true,
      createdAt: NOW,
      updatedAt: NOW,
    },
    {
      id: 'art-fulfil-orders',
      title: 'Fulfilling your orders',
      summary: 'Pickup, packaging, and labels — everything you need to ship.',
      href: 'https://help.joinfleek.com/seller/fulfilment',
      tag: 'listings',
      order: 3,
      conditions: {},
      enabled: true,
      createdAt: NOW,
      updatedAt: NOW,
    },
    {
      id: 'art-payouts',
      title: 'How payouts work',
      summary: 'When you get paid, how to read your statement, and what causes a hold.',
      href: 'https://help.joinfleek.com/seller/payouts',
      tag: 'payouts',
      order: 4,
      conditions: {},
      enabled: true,
      createdAt: NOW,
      updatedAt: NOW,
    },
    {
      id: 'art-support',
      title: 'Talk to seller support',
      summary: 'Have a question we did not cover? Reach the seller support team.',
      href: 'https://help.joinfleek.com/seller/contact',
      tag: 'support',
      order: 5,
      conditions: {},
      enabled: true,
      createdAt: NOW,
      updatedAt: NOW,
    },
  ],
};

function load(): LocalStore {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as LocalStore;
  } catch {
    /* fall through to seed */
  }
  localStorage.setItem(KEY, JSON.stringify(SEED));
  return SEED;
}

function save(store: LocalStore) {
  localStorage.setItem(KEY, JSON.stringify(store));
}

function now(): string {
  return new Date().toISOString();
}

function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;
}

export const localAdmin = {
  listTasks(): AdminTask[] {
    return load().tasks;
  },
  saveTask(input: Partial<AdminTask>): AdminTask {
    const store = load();
    if (input.id) {
      const idx = store.tasks.findIndex((t) => t.id === input.id);
      if (idx >= 0) {
        const updated = { ...store.tasks[idx], ...input, updatedAt: now() } as AdminTask;
        store.tasks[idx] = updated;
        save(store);
        return updated;
      }
    }
    const created = {
      ...input,
      id: input.id ?? makeId('tsk'),
      conditions: input.conditions ?? {},
      enabled: input.enabled ?? true,
      createdAt: now(),
      updatedAt: now(),
    } as AdminTask;
    store.tasks.push(created);
    save(store);
    return created;
  },
  deleteTask(id: string): void {
    const store = load();
    store.tasks = store.tasks.filter((t) => t.id !== id);
    save(store);
  },

  listAnnouncements(): AdminAnnouncement[] {
    return load().announcements;
  },
  saveAnnouncement(input: Partial<AdminAnnouncement>): AdminAnnouncement {
    const store = load();
    if (input.id) {
      const idx = store.announcements.findIndex((a) => a.id === input.id);
      if (idx >= 0) {
        const updated = { ...store.announcements[idx], ...input, updatedAt: now() } as AdminAnnouncement;
        store.announcements[idx] = updated;
        save(store);
        return updated;
      }
    }
    const created = {
      ...input,
      id: input.id ?? makeId('anc'),
      conditions: input.conditions ?? {},
      dismissible: input.dismissible ?? true,
      enabled: input.enabled ?? true,
      createdAt: now(),
      updatedAt: now(),
    } as AdminAnnouncement;
    store.announcements.push(created);
    save(store);
    return created;
  },
  deleteAnnouncement(id: string): void {
    const store = load();
    store.announcements = store.announcements.filter((a) => a.id !== id);
    save(store);
  },

  listArticles(): AdminFeaturedArticle[] {
    return load().articles.slice().sort((a, b) => a.order - b.order);
  },
  saveArticle(input: Partial<AdminFeaturedArticle>): AdminFeaturedArticle {
    const store = load();
    if (input.id) {
      const idx = store.articles.findIndex((a) => a.id === input.id);
      if (idx >= 0) {
        const updated = { ...store.articles[idx], ...input, updatedAt: now() } as AdminFeaturedArticle;
        store.articles[idx] = updated;
        save(store);
        return updated;
      }
    }
    const created = {
      ...input,
      id: input.id ?? makeId('art'),
      order: input.order ?? 999,
      conditions: input.conditions ?? {},
      enabled: input.enabled ?? true,
      createdAt: now(),
      updatedAt: now(),
    } as AdminFeaturedArticle;
    store.articles.push(created);
    save(store);
    return created;
  },
  deleteArticle(id: string): void {
    const store = load();
    store.articles = store.articles.filter((a) => a.id !== id);
    save(store);
  },
};
