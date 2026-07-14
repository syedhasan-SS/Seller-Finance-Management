import type { HomeConfig } from '@/types/homeConfig';

/**
 * Mock POWER SELLER lifecycle: high volume, all account tasks complete.
 * Showcases a clean homepage focused on payouts + business growth content.
 */
export const powerSellerConfig: HomeConfig = {
  version: 1,
  vendorId: 'demo-power-seller',
  generatedAt: new Date().toISOString(),
  lifecycle: 'power',
  modules: [
    {
      id: 'welcome-hero',
      type: 'welcome-hero',
      priority: 1,
      analytics: { eventPrefix: 'home.welcome_hero' },
      data: {
        greeting: 'Welcome back, Creed Vintage',
        subline: 'You are one of our top sellers. Keep the momentum going.',
        badge: { label: 'Power seller', tone: 'success' },
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
          { id: 'n-eligible',   kind: 'payout', message: '34 eligible orders are queued for your next payout.', timestamp: new Date().toISOString(), href: '/dashboard', unread: true },
          { id: 'n-held',       kind: 'order',  message: '2 orders are on hold — resolve to keep payouts moving.', timestamp: new Date(Date.now() - 3600_000).toISOString(), href: '/orders?status=held', unread: true },
          { id: 'n-latest',     kind: 'order',  message: 'Most recent order: 2026-06-21',                          timestamp: new Date().toISOString(), href: '/orders' },
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
          { id: 'kc-payouts',  title: 'Reading your payout statement', summary: 'Quick reference for line items and deductions.',              href: 'https://help.joinfleek.com/seller/payouts',  tag: 'payouts' },
          { id: 'kc-listings', title: 'Pricing for high-volume shops', summary: 'Strategies for keeping conversion strong as you scale.',     href: 'https://help.joinfleek.com/seller/listings', tag: 'listings' },
          { id: 'kc-support',  title: 'Talk to seller support',        summary: 'Have a question we did not cover? Reach support.',           href: 'https://help.joinfleek.com/seller/contact',  tag: 'support' },
        ],
      },
    },
  ],
  meta: {
    rulesetVersion: 'rules-v1.0.0',
    firedRuleIds: ['welcome-hero', 'quick-actions-default', 'notifications-recent', 'knowledge-starter'],
  },
};
