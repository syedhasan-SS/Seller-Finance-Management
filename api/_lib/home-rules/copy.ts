/**
 * Centralized copy strings. Swap for a CMS lookup later without changing rules.
 */

import type { LifecycleStage } from '../home-config-types';

export const HERO_COPY: Record<LifecycleStage, { subline: string; badge: { label: string; tone: 'success' | 'warning' | 'info' } }> = {
  new: {
    subline: "Let's get you set up to receive your first order.",
    badge: { label: 'New seller', tone: 'info' },
  },
  active: {
    subline: 'Your shop is up and running. Stay on top of orders and growth.',
    badge: { label: 'Active seller', tone: 'success' },
  },
  power: {
    subline: 'You are one of our top sellers. Keep the momentum going.',
    badge: { label: 'Power seller', tone: 'success' },
  },
  dormant: {
    subline: 'Buyers are searching for products you sell. Here is how to come back.',
    badge: { label: 'Reactivation', tone: 'warning' },
  },
};

export const KNOWLEDGE_STARTER = [
  {
    id: 'kc-getting-started',
    title: 'Getting started on Fleek',
    summary: 'A 5-minute tour of the seller portal — profile, listings, and your first payout.',
    href: 'https://help.joinfleek.com/seller/getting-started',
    tag: 'getting-started' as const,
  },
  {
    id: 'kc-payouts',
    title: 'How payouts work',
    summary: 'When you get paid, how to read your statement, and what causes a hold.',
    href: 'https://help.joinfleek.com/seller/payouts',
    tag: 'payouts' as const,
  },
  {
    id: 'kc-listings',
    title: 'Listing best practices',
    summary: 'Photo, title, and grading tips that lift conversion on your products.',
    href: 'https://help.joinfleek.com/seller/listings',
    tag: 'listings' as const,
  },
  {
    id: 'kc-support',
    title: 'Talk to seller support',
    summary: 'Have a question we did not cover? Reach the seller support team.',
    href: 'https://help.joinfleek.com/seller/contact',
    tag: 'support' as const,
  },
];
