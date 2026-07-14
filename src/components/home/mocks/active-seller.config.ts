import type { HomeConfig } from '@/types/homeConfig';

/**
 * Mock ACTIVE SELLER lifecycle: bank approved, profile mostly complete, normal order flow.
 * Light task load; notifications and quick actions take centre stage.
 */
export const activeSellerConfig: HomeConfig = {
  version: 1,
  vendorId: 'demo-active-seller',
  generatedAt: new Date().toISOString(),
  lifecycle: 'active',
  modules: [
    {
      id: 'welcome-hero',
      type: 'welcome-hero',
      priority: 1,
      analytics: { eventPrefix: 'home.welcome_hero' },
      data: {
        greeting: 'Welcome back, Vibe Vintage',
        subline: 'Your shop is up and running. Stay on top of orders and growth.',
        badge: { label: 'Active seller', tone: 'success' },
      },
    },
    {
      id: 'action-center-default',
      type: 'action-center',
      priority: 10,
      analytics: { eventPrefix: 'home.action_center' },
      data: {
        title: 'Things to do',
        tasks: [
          {
            taskId: 'profile-complete',
            title: 'Add a short bio',
            description: 'Buyers convert better on shops with a personal bio.',
            urgency: 'low',
            icon: 'User',
            cta: { label: 'Edit profile', href: '/tools/seller-profile-manager?tab=profile', kind: 'secondary' },
            estimatedMinutes: 2,
            source: { ruleId: 'profile-completion' },
          },
        ],
      },
    },
    {
      id: 'quick-actions-default',
      type: 'quick-actions',
      priority: 20,
      analytics: { eventPrefix: 'home.quick_actions' },
      data: {
        title: 'Quick actions',
        actions: [
          { id: 'qa-payouts', label: 'Payouts',  sublabel: 'Track upcoming and past payouts', icon: 'Wallet',     href: '/dashboard',                     tone: 'yellow' },
          { id: 'qa-orders',  label: 'Orders',   sublabel: 'Manage and fulfil your orders',   icon: 'Package',    href: '/orders',                        tone: 'black' },
          { id: 'qa-income',  label: 'Income',   sublabel: 'Statements and history',          icon: 'DollarSign', href: '/income-statement',              tone: 'neutral' },
          { id: 'qa-account', label: 'Account',  sublabel: 'Profile, bank, and contact',      icon: 'User',       href: '/tools/seller-profile-manager',  tone: 'neutral' },
        ],
      },
    },
    {
      id: 'notifications-default',
      type: 'notifications',
      priority: 40,
      analytics: { eventPrefix: 'home.notifications' },
      data: {
        title: 'Notifications',
        items: [
          { id: 'n-eligible', kind: 'payout', message: '8 eligible orders are queued for your next payout.', timestamp: new Date().toISOString(), href: '/dashboard', unread: true },
          { id: 'n-latest',   kind: 'order',  message: 'Most recent order: 2026-06-19',                       timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), href: '/orders' },
        ],
      },
    },
    {
      id: 'knowledge-starter',
      type: 'knowledge-center',
      priority: 50,
      analytics: { eventPrefix: 'home.knowledge' },
      data: {
        title: 'Knowledge center',
        items: [
          { id: 'kc-payouts',  title: 'How payouts work',         summary: 'When you get paid and what causes a hold.',                  href: 'https://help.joinfleek.com/seller/payouts',  tag: 'payouts' },
          { id: 'kc-listings', title: 'Listing best practices',   summary: 'Photo, title, and grading tips that lift conversion.',       href: 'https://help.joinfleek.com/seller/listings', tag: 'listings' },
          { id: 'kc-support',  title: 'Talk to seller support',   summary: 'Reach the seller support team if you need help.',            href: 'https://help.joinfleek.com/seller/contact',  tag: 'support' },
        ],
      },
    },
  ],
  meta: {
    rulesetVersion: 'rules-v1.0.0',
    firedRuleIds: ['welcome-hero', 'profile-completion', 'quick-actions-default', 'notifications-recent', 'knowledge-starter'],
  },
};
