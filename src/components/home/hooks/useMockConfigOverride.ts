import { useMemo } from 'react';
import type {
  ActionCenterModule,
  ActionTask,
  Announcement,
  AnnouncementsModule,
  HomeConfig,
  HomeModule,
  KnowledgeCenterModule,
  KnowledgeItem,
  LifecycleStage,
} from '@/types/homeConfig';
import type {
  AdminAnnouncement,
  AdminFeaturedArticle,
  AdminTask,
  AppearanceConditions,
} from '@/types/adminContent';
import { localAdmin } from '@/lib/local-admin-store';
import { newSellerConfig } from '../mocks/new-seller.config';
import { activeSellerConfig } from '../mocks/active-seller.config';
import { powerSellerConfig } from '../mocks/power-seller.config';
import { dormantSellerConfig } from '../mocks/dormant-seller.config';

const MOCKS: Record<string, HomeConfig> = {
  'new-seller': newSellerConfig,
  active: activeSellerConfig,
  'active-seller': activeSellerConfig,
  power: powerSellerConfig,
  'power-seller': powerSellerConfig,
  dormant: dormantSellerConfig,
  'dormant-seller': dormantSellerConfig,
};

/**
 * Returns a HomeConfig when `?mockConfig=...` is present in DEV.
 *
 * In addition to the base lifecycle layout, admin-managed tasks, announcements
 * and featured articles are merged in from localStorage so edits made in
 * /admin show up live on /home — without a running backend.
 */
export function useMockConfigOverride(): HomeConfig | null {
  return useMemo(() => {
    if (!import.meta.env.DEV) return null;
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    const key = params.get('mockConfig');
    if (!key) return null;
    const base = MOCKS[key];
    if (!base) return null;
    return mergeAdminContent(base);
  }, []);
}

function mergeAdminContent(base: HomeConfig): HomeConfig {
  const lifecycle = base.lifecycle;

  const adminTasks: ActionTask[] = localAdmin
    .listTasks()
    .filter((t) => t.enabled)
    .filter((t) => matchesLifecycle(t.conditions, lifecycle))
    .map(taskToActionTask);

  const adminAnnouncements: Announcement[] = localAdmin
    .listAnnouncements()
    .filter((a) => a.enabled)
    .filter((a) => matchesLifecycle(a.conditions, lifecycle))
    .map(announcementToFront);

  const adminArticles: KnowledgeItem[] = localAdmin
    .listArticles()
    .filter((a) => a.enabled)
    .filter((a) => matchesLifecycle(a.conditions, lifecycle))
    .map(articleToFront);

  let nextModules: HomeModule[] = base.modules.map((m) => m);

  // Inject Announcements module above any risk-alert (so it sits very near top).
  if (adminAnnouncements.length > 0) {
    const existingIdx = nextModules.findIndex((m) => m.type === 'announcements');
    const module: AnnouncementsModule = {
      id: 'announcements-admin',
      type: 'announcements',
      priority: 3,
      data: { items: adminAnnouncements },
    };
    if (existingIdx >= 0) nextModules[existingIdx] = module;
    else nextModules.splice(1, 0, module); // after welcome-hero
  }

  // Merge tasks into Action Center (if any), else create one.
  if (adminTasks.length > 0) {
    const acIdx = nextModules.findIndex((m) => m.type === 'action-center');
    if (acIdx >= 0) {
      const existing = nextModules[acIdx] as ActionCenterModule;
      const seen = new Set(existing.data.tasks.map((t) => t.taskId));
      const merged: ActionCenterModule = {
        ...existing,
        data: {
          ...existing.data,
          tasks: [
            ...adminTasks.filter((t) => !seen.has(t.taskId)),
            ...existing.data.tasks,
          ],
        },
      };
      nextModules[acIdx] = merged;
    } else {
      const ac: ActionCenterModule = {
        id: 'action-center-admin',
        type: 'action-center',
        priority: 10,
        data: { title: 'Things to do', tasks: adminTasks },
      };
      // Place after announcements/welcome-hero, before quick-actions.
      const insertIdx = Math.max(
        nextModules.findIndex((m) => m.type === 'quick-actions'),
        2
      );
      nextModules.splice(insertIdx, 0, ac);
    }
  }

  // Replace the Knowledge Center module with admin articles if any.
  if (adminArticles.length > 0) {
    const kcIdx = nextModules.findIndex((m) => m.type === 'knowledge-center');
    const kc: KnowledgeCenterModule = {
      id: 'knowledge-admin',
      type: 'knowledge-center',
      priority: 50,
      data: { title: 'Learning Center', items: adminArticles },
    };
    if (kcIdx >= 0) nextModules[kcIdx] = kc;
    else nextModules.push(kc);
  }

  return { ...base, modules: nextModules };
}

function matchesLifecycle(c: AppearanceConditions | undefined, lifecycle: LifecycleStage): boolean {
  // In DEV we evaluate the lifecycle condition only — other signals (bank,
  // listing, order, payout, profile) need a real seller and don't exist in the
  // mock context. This is the documented dev-fallback trade-off.
  if (!c?.lifecycles || c.lifecycles.length === 0) return true;
  return c.lifecycles.includes(lifecycle);
}

function taskToActionTask(t: AdminTask): ActionTask {
  return {
    taskId: t.id,
    title: t.title,
    description: t.description,
    urgency: t.urgency,
    icon: t.icon,
    cta: { label: t.ctaLabel, href: t.ctaHref, kind: 'primary' },
    estimatedMinutes: t.estimatedMinutes,
    source: { ruleId: 'admin-tasks-local' },
  };
}

function announcementToFront(a: AdminAnnouncement): Announcement {
  return {
    id: a.id,
    severity: a.severity,
    title: a.title,
    body: a.body,
    cta: a.ctaLabel && a.ctaHref ? { label: a.ctaLabel, href: a.ctaHref } : undefined,
    dismissible: a.dismissible,
  };
}

function articleToFront(a: AdminFeaturedArticle): KnowledgeItem {
  return {
    id: a.id,
    title: a.title,
    summary: a.summary,
    href: a.href,
    tag: a.tag,
    thumbnailUrl: a.thumbnailUrl,
  };
}
