/**
 * Seller Homepage V2 — config schema (backend mirror).
 * MIRROR: src/types/homeConfig.ts — keep both files in sync.
 */

export type LifecycleStage = 'new' | 'active' | 'power' | 'dormant';

export type HomeModuleType =
  | 'welcome-hero'
  | 'action-center'
  | 'risk-alert'
  | 'announcements'
  | 'quick-actions'
  | 'notifications'
  | 'knowledge-center'
  | 'health-score'
  | 'growth-recs'
  | 'academy-path'
  | 'ai-assistant';

export type ActionUrgency = 'critical' | 'high' | 'medium' | 'low';
export type AlertSeverity = 'error' | 'warning' | 'info';
export type CtaKind = 'primary' | 'secondary';
export type QuickActionTone = 'yellow' | 'black' | 'neutral';
export type NotificationKind = 'order' | 'payout' | 'profile' | 'system';
export type KnowledgeTag = 'getting-started' | 'payouts' | 'listings' | 'support';

export type LucideIconName =
  | 'AlertTriangle'
  | 'AlertCircle'
  | 'Bell'
  | 'BookOpen'
  | 'CheckCircle'
  | 'CreditCard'
  | 'DollarSign'
  | 'FileText'
  | 'Info'
  | 'Lightbulb'
  | 'Package'
  | 'Shield'
  | 'ShoppingBag'
  | 'Sparkles'
  | 'TrendingUp'
  | 'Truck'
  | 'User'
  | 'Wallet';

interface BaseModule {
  id: string;
  type: HomeModuleType;
  priority: number;
  analytics?: { eventPrefix: string };
}

export interface ActionTask {
  taskId: string;
  title: string;
  description: string;
  urgency: ActionUrgency;
  icon?: LucideIconName;
  cta: { label: string; href: string; kind: CtaKind };
  estimatedMinutes?: number;
  source: { ruleId: string };
}

export interface WelcomeHeroModule extends BaseModule {
  type: 'welcome-hero';
  data: {
    greeting: string;
    subline?: string;
    badge?: { label: string; tone: 'success' | 'warning' | 'info' };
  };
}

export interface ActionCenterModule extends BaseModule {
  type: 'action-center';
  data: { title: string; tasks: ActionTask[] };
}

export interface RiskAlertData {
  severity: AlertSeverity;
  title: string;
  body: string;
  cta?: { label: string; href: string };
}

export interface RiskAlertModule extends BaseModule {
  type: 'risk-alert';
  data: RiskAlertData;
}

export interface Announcement {
  id: string;
  severity: AlertSeverity;
  title: string;
  body: string;
  cta?: { label: string; href: string };
  dismissible?: boolean;
}

export interface AnnouncementsModule extends BaseModule {
  type: 'announcements';
  data: { items: Announcement[] };
}

export interface QuickActionItem {
  id: string;
  label: string;
  sublabel?: string;
  icon: LucideIconName;
  href: string;
  tone?: QuickActionTone;
}

export interface QuickActionsModule extends BaseModule {
  type: 'quick-actions';
  data: { title?: string; actions: QuickActionItem[] };
}

export interface NotificationItem {
  id: string;
  kind: NotificationKind;
  message: string;
  timestamp: string;
  href?: string;
  unread?: boolean;
}

export interface NotificationsModule extends BaseModule {
  type: 'notifications';
  data: { title: string; items: NotificationItem[]; emptyState?: string };
}

export interface KnowledgeItem {
  id: string;
  title: string;
  summary: string;
  href: string;
  tag?: KnowledgeTag;
  thumbnailUrl?: string;
}

export interface KnowledgeCenterModule extends BaseModule {
  type: 'knowledge-center';
  data: { title: string; items: KnowledgeItem[] };
}

export interface HealthScoreModule extends BaseModule {
  type: 'health-score';
  data: Record<string, unknown>;
}
export interface GrowthRecsModule extends BaseModule {
  type: 'growth-recs';
  data: Record<string, unknown>;
}
export interface AcademyPathModule extends BaseModule {
  type: 'academy-path';
  data: Record<string, unknown>;
}
export interface AIAssistantModule extends BaseModule {
  type: 'ai-assistant';
  data: Record<string, unknown>;
}

export type HomeModule =
  | WelcomeHeroModule
  | ActionCenterModule
  | RiskAlertModule
  | AnnouncementsModule
  | QuickActionsModule
  | NotificationsModule
  | KnowledgeCenterModule
  | HealthScoreModule
  | GrowthRecsModule
  | AcademyPathModule
  | AIAssistantModule;

export interface HomeConfig {
  version: 1;
  vendorId: string;
  generatedAt: string;
  lifecycle: LifecycleStage;
  modules: HomeModule[];
  meta: {
    rulesetVersion: string;
    signalsSnapshotId?: string;
    firedRuleIds?: string[];
  };
}
