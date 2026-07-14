import type { Rule } from '../types';
import type { NotificationItem, NotificationsModule } from '../../home-config-types';

/**
 * Synthesizes notifications from existing signals. Replace later with a real
 * notification store + read/unread state.
 */
export const notificationsRecentRule: Rule = {
  id: 'notifications-recent',
  description: 'Synthesize recent notifications from payout/order signals.',
  evaluate(ctx) {
    const items: NotificationItem[] = [];

    if (ctx.signals.hasHeldOrders) {
      items.push({
        id: 'notif-held-orders',
        kind: 'order',
        message: 'You have orders on hold. Resolve to keep your payouts moving.',
        timestamp: ctx.now.toISOString(),
        href: '/orders?status=held',
        unread: true,
      });
    }

    if (ctx.signals.hasEligibleOrders) {
      items.push({
        id: 'notif-eligible',
        kind: 'payout',
        message: 'Eligible orders are queued for your next payout.',
        timestamp: ctx.now.toISOString(),
        href: '/dashboard',
      });
    }

    if (ctx.signals.lastOrderAt) {
      items.push({
        id: 'notif-last-order',
        kind: 'order',
        message: `Most recent order: ${ctx.signals.lastOrderAt.slice(0, 10)}`,
        timestamp: ctx.signals.lastOrderAt,
        href: '/orders',
      });
    }

    if (items.length === 0) {
      // Still emit the module so the page has a "you're all caught up" slot.
      const empty: NotificationsModule = {
        id: 'notifications-default',
        type: 'notifications',
        priority: 40,
        analytics: { eventPrefix: 'home.notifications' },
        data: {
          title: 'Notifications',
          items: [],
          emptyState: 'You are all caught up.',
        },
      };
      return { modules: [empty] };
    }

    const module: NotificationsModule = {
      id: 'notifications-default',
      type: 'notifications',
      priority: 40,
      analytics: { eventPrefix: 'home.notifications' },
      data: { title: 'Notifications', items },
    };
    return { modules: [module] };
  },
};
