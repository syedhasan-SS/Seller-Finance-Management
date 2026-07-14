import type { HomeConfig } from '@/types/homeConfig';

/**
 * Mock DORMANT SELLER lifecycle: previously active, no orders in 60+ days.
 * Heavy on reactivation alerts + bank rejected (a common reactivation blocker).
 */
export const dormantSellerConfig: HomeConfig = {
  version: 1,
  vendorId: 'demo-dormant-seller',
  generatedAt: new Date().toISOString(),
  lifecycle: 'dormant',
  modules: [
    {
      id: 'risk-alert-0',
      type: 'risk-alert',
      priority: 5,
      analytics: { eventPrefix: 'home.risk_alert' },
      data: {
        severity: 'error',
        title: 'Bank account rejected',
        body: 'Your bank submission was rejected (IBAN format incorrect). Update your details and resubmit so future payouts can be processed.',
        cta: { label: 'Resubmit bank details', href: '/tools/seller-profile-manager?tab=bank' },
      },
    },
    {
      id: 'risk-alert-1',
      type: 'risk-alert',
      priority: 5,
      analytics: { eventPrefix: 'home.risk_alert' },
      data: {
        severity: 'warning',
        title: "You haven't been active for 60+ days",
        body: 'Buyers are actively searching for products you sold. Upload fresh stock to get discovered again.',
        cta: { label: 'Upload listings', href: '/orders' },
      },
    },
    {
      id: 'welcome-hero',
      type: 'welcome-hero',
      priority: 1,
      analytics: { eventPrefix: 'home.welcome_hero' },
      data: {
        greeting: 'Welcome back',
        subline: 'Buyers are searching for products you sell. Here is how to come back.',
        badge: { label: 'Reactivation', tone: 'warning' },
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
            taskId: 'bank-account-rejected',
            title: 'Resubmit bank details',
            description: 'Your last submission was rejected. Update and resubmit.',
            urgency: 'critical',
            icon: 'CreditCard',
            cta: { label: 'Open bank settings', href: '/tools/seller-profile-manager?tab=bank', kind: 'primary' },
            estimatedMinutes: 3,
            source: { ruleId: 'bank-status' },
          },
          {
            taskId: 'upload-listings',
            title: 'Upload fresh inventory',
            description: 'You have not uploaded in 45+ days. Refresh your shop to get discovered.',
            urgency: 'high',
            icon: 'Package',
            cta: { label: 'Open listing tools', href: '/orders', kind: 'primary' },
            estimatedMinutes: 15,
            source: { ruleId: 'reactivation-uploads' },
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
      id: 'knowledge-starter',
      type: 'knowledge-center',
      priority: 50,
      analytics: { eventPrefix: 'home.knowledge' },
      data: {
        title: 'Knowledge center',
        items: [
          { id: 'kc-getting-started', title: 'Getting back on Fleek',    summary: 'How to quickly relist popular items from your old catalog.',  href: 'https://help.joinfleek.com/seller/getting-started', tag: 'getting-started' },
          { id: 'kc-listings',        title: 'What buyers are searching', summary: 'Trending categories this month — restock these for visibility.', href: 'https://help.joinfleek.com/seller/listings',     tag: 'listings' },
          { id: 'kc-support',         title: 'Talk to seller support',    summary: 'Need help getting reactivated? We are here.',                  href: 'https://help.joinfleek.com/seller/contact',       tag: 'support' },
        ],
      },
    },
  ],
  meta: {
    rulesetVersion: 'rules-v1.0.0',
    firedRuleIds: ['welcome-hero', 'bank-status', 'reactivation-uploads', 'quick-actions-default', 'knowledge-starter'],
  },
};
