import type { Rule } from '../types';
import type { QuickActionsModule } from '../../home-config-types';

export const quickActionsDefaultRule: Rule = {
  id: 'quick-actions-default',
  description: 'Always-on shortcuts to the seller portal core tools.',
  evaluate(_ctx) {
    const module: QuickActionsModule = {
      id: 'quick-actions-default',
      type: 'quick-actions',
      priority: 20,
      analytics: { eventPrefix: 'home.quick_actions' },
      data: {
        title: 'Quick actions',
        actions: [
          {
            id: 'qa-payouts',
            label: 'Payouts',
            sublabel: 'Track upcoming and past payouts',
            icon: 'Wallet',
            href: '/dashboard',
            tone: 'yellow',
          },
          {
            id: 'qa-orders',
            label: 'Orders',
            sublabel: 'Manage and fulfil your orders',
            icon: 'Package',
            href: '/orders',
            tone: 'black',
          },
          {
            id: 'qa-income',
            label: 'Income',
            sublabel: 'Statements and history',
            icon: 'DollarSign',
            href: '/income-statement',
            tone: 'neutral',
          },
          {
            id: 'qa-account',
            label: 'Account',
            sublabel: 'Profile, bank, and contact details',
            icon: 'User',
            href: '/tools/seller-profile-manager',
            tone: 'neutral',
          },
        ],
      },
    };
    return { modules: [module] };
  },
};
