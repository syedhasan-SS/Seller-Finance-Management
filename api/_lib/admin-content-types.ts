/**
 * Admin-managed homepage content. The Admin Console writes these; the rules
 * engine reads them and emits HomeModules/ActionTasks accordingly.
 *
 * MIRROR: src/types/adminContent.ts — keep both files in sync.
 */

import type { ActionUrgency, AlertSeverity, LifecycleStage, LucideIconName } from './home-config-types';

export type YesNoAny = 'yes' | 'no' | 'any';

/**
 * The conditions ALL must match for an admin-defined item to appear for a seller.
 * Omitted/empty fields = "any".
 *
 * Designed as multi-select dropdowns in the Admin UI so ops doesn't write code.
 */
export interface AppearanceConditions {
  lifecycles?: LifecycleStage[];               // empty = any lifecycle
  bankStatuses?: ('none' | 'submitted' | 'under_review' | 'approved' | 'rejected')[]; // empty = any
  hasFirstListing?: YesNoAny;                  // default 'any'
  hasFirstOrder?: YesNoAny;
  hasReceivedPayout?: YesNoAny;
  profileComplete?: YesNoAny;
}

/**
 * A task an admin creates. Becomes an ActionTask in the homepage's Action
 * Center when conditions match.
 */
export interface AdminTask {
  id: string;
  title: string;
  description: string;
  urgency: ActionUrgency;
  icon?: LucideIconName;
  ctaLabel: string;
  ctaHref: string;
  estimatedMinutes?: number;
  conditions: AppearanceConditions;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * A banner an admin posts. Surfaces as an Announcement module on matching
 * sellers' homepages.
 */
export interface AdminAnnouncement {
  id: string;
  severity: AlertSeverity;
  title: string;
  body: string;
  ctaLabel?: string;
  ctaHref?: string;
  conditions: AppearanceConditions;
  /** Optional schedule. null/undefined = always. */
  startsAt?: string | null;
  endsAt?: string | null;
  dismissible: boolean;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * A curated Help Center link an admin features in the Learning Center.
 */
export interface AdminFeaturedArticle {
  id: string;
  title: string;
  summary: string;
  href: string;
  tag?: 'getting-started' | 'payouts' | 'listings' | 'support';
  thumbnailUrl?: string;
  /** Display order (lower first). */
  order: number;
  conditions: AppearanceConditions;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Shape of the seller-progress dashboard row in the Admin Console.
 */
export interface SupplierProgress {
  vendorId: string;
  shopName: string;
  lifecycle: LifecycleStage;
  profileCompletion: number;        // 0–1
  bankStatus: string;
  hasFirstListing: boolean;
  hasFirstOrder: boolean;
  hasReceivedPayout: boolean;
  daysSinceSignup: number | null;
  lastOrderAt: string | null;
  openTasksCount: number;
}
