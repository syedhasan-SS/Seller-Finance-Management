import type { HomeConfig } from '@/types/homeConfig';

/**
 * Mock NEW SELLER lifecycle: signup recent, no orders yet, profile + bank pending.
 * Heavy on onboarding tasks.
 */
export const newSellerConfig: HomeConfig = {
  version: 1,
  vendorId: 'demo-new-seller',
  generatedAt: new Date().toISOString(),
  lifecycle: 'new',
  modules: [
    {
      id: 'welcome-hero',
      type: 'welcome-hero',
      priority: 1,
      analytics: { eventPrefix: 'home.welcome_hero' },
      data: {
        greeting: 'Welcome to Fleek',
        subline: "Let's get you set up to receive your first order.",
        badge: { label: 'New seller', tone: 'info' },
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
            taskId: 'bank-account-missing',
            title: 'Add your bank account',
            description: 'Required to receive your first payout.',
            urgency: 'high',
            icon: 'CreditCard',
            cta: { label: 'Add bank details', href: '/tools/seller-profile-manager?tab=bank', kind: 'primary' },
            estimatedMinutes: 5,
            source: { ruleId: 'bank-status' },
          },
          {
            taskId: 'profile-complete',
            title: 'Finish your profile',
            description: 'Add a shop name and short bio so buyers know who you are.',
            urgency: 'high',
            icon: 'User',
            cta: { label: 'Edit profile', href: '/tools/seller-profile-manager?tab=profile', kind: 'primary' },
            estimatedMinutes: 2,
            source: { ruleId: 'profile-completion' },
          },
          {
            taskId: 'upload-listings',
            title: 'Upload your first listings',
            description: 'Add at least 10 products so buyers have something to discover.',
            urgency: 'medium',
            icon: 'Package',
            cta: { label: 'Open listing tools', href: '/orders', kind: 'secondary' },
            estimatedMinutes: 15,
            source: { ruleId: 'onboarding-listings' },
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
        items: [],
        emptyState: 'You are all caught up. Once orders start coming in, updates will appear here.',
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
          { id: 'kc-getting-started', title: 'Getting started on Fleek', summary: 'A 5-minute tour of the seller portal — profile, listings, and your first payout.', href: 'https://help.joinfleek.com/seller/getting-started', tag: 'getting-started' },
          { id: 'kc-payouts',         title: 'How payouts work',          summary: 'When you get paid, how to read your statement, and what causes a hold.',           href: 'https://help.joinfleek.com/seller/payouts',         tag: 'payouts' },
          { id: 'kc-listings',        title: 'Listing best practices',    summary: 'Photo, title, and grading tips that lift conversion on your products.',           href: 'https://help.joinfleek.com/seller/listings',        tag: 'listings' },
          { id: 'kc-support',         title: 'Talk to seller support',    summary: 'Have a question we did not cover? Reach the seller support team.',                href: 'https://help.joinfleek.com/seller/contact',         tag: 'support' },
        ],
      },
    },
  ],
  meta: {
    rulesetVersion: 'rules-v1.0.0',
    firedRuleIds: ['welcome-hero', 'bank-status', 'profile-completion', 'quick-actions-default', 'notifications-recent', 'knowledge-starter'],
  },
};
