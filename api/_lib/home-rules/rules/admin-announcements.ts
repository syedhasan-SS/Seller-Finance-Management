import type { Rule } from '../types';
import type { Announcement, AnnouncementsModule } from '../../home-config-types';
import { listAnnouncements } from '../../admin-store';
import { evaluateConditions, isWithinSchedule } from '../conditions';

/**
 * Reads admin-managed announcements from the store, filters by conditions +
 * schedule, and emits an Announcements module if any matched.
 */
export const adminAnnouncementsRule: Rule = {
  id: 'admin-announcements',
  description: 'Emits banner-style announcements created in the Admin Console.',
  evaluate(ctx) {
    const items: Announcement[] = listAnnouncements()
      .filter((a) => a.enabled)
      .filter((a) => isWithinSchedule(a.startsAt, a.endsAt, ctx.now))
      .filter((a) => evaluateConditions(a.conditions, ctx))
      .map((a) => ({
        id: a.id,
        severity: a.severity,
        title: a.title,
        body: a.body,
        cta: a.ctaLabel && a.ctaHref ? { label: a.ctaLabel, href: a.ctaHref } : undefined,
        dismissible: a.dismissible,
      }));

    if (items.length === 0) return null;

    const module: AnnouncementsModule = {
      id: 'announcements-admin',
      type: 'announcements',
      priority: 3, // above risk-alert (5) and action-center (10) but below welcome-hero (1)
      analytics: { eventPrefix: 'home.announcements' },
      data: { items },
    };
    return { modules: [module] };
  },
};
