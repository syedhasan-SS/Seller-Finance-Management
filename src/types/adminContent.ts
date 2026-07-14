/**
 * Admin-managed homepage content. Frontend mirror.
 * MIRROR: api/_lib/admin-content-types.ts — keep both files in sync.
 */

import type { ActionUrgency, AlertSeverity, LifecycleStage, LucideIconName } from './homeConfig';

export type YesNoAny = 'yes' | 'no' | 'any';

export interface AppearanceConditions {
  lifecycles?: LifecycleStage[];
  bankStatuses?: ('none' | 'submitted' | 'under_review' | 'approved' | 'rejected')[];
  hasFirstListing?: YesNoAny;
  hasFirstOrder?: YesNoAny;
  hasReceivedPayout?: YesNoAny;
  profileComplete?: YesNoAny;
}

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

export interface AdminAnnouncement {
  id: string;
  severity: AlertSeverity;
  title: string;
  body: string;
  ctaLabel?: string;
  ctaHref?: string;
  conditions: AppearanceConditions;
  startsAt?: string | null;
  endsAt?: string | null;
  dismissible: boolean;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminFeaturedArticle {
  id: string;
  title: string;
  summary: string;
  href: string;
  tag?: 'getting-started' | 'payouts' | 'listings' | 'support';
  thumbnailUrl?: string;
  order: number;
  conditions: AppearanceConditions;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierProgress {
  vendorId: string;
  shopName: string;
  lifecycle: LifecycleStage;
  profileCompletion: number;
  bankStatus: string;
  hasFirstListing: boolean;
  hasFirstOrder: boolean;
  hasReceivedPayout: boolean;
  daysSinceSignup: number | null;
  lastOrderAt: string | null;
  openTasksCount: number;
}
