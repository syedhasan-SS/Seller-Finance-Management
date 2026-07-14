import type { HomeConfig, HomeModule, HomeModuleType } from '@/types/homeConfig';
import WelcomeHeroModule from './modules/WelcomeHeroModule';
import ActionCenterModule from './modules/ActionCenterModule';
import RiskAlertModule from './modules/RiskAlertModule';
import AnnouncementsModule from './modules/AnnouncementsModule';
import QuickActionsModule from './modules/QuickActionsModule';
import NotificationsModule from './modules/NotificationsModule';
import KnowledgeCenterModule from './modules/KnowledgeCenterModule';
import UnknownModule from './modules/UnknownModule';

/**
 * Pure projection: config.modules → React tree. NO business logic, NO reordering,
 * NO hidden filtering. If a module needs to change, the rules engine emits a
 * different config.
 */

type AnyModuleComponent = React.ComponentType<{ module: any }>;

const MODULE_MAP: Partial<Record<HomeModuleType, AnyModuleComponent>> = {
  'welcome-hero': WelcomeHeroModule,
  'action-center': ActionCenterModule,
  'risk-alert': RiskAlertModule,
  announcements: AnnouncementsModule,
  'quick-actions': QuickActionsModule,
  notifications: NotificationsModule,
  'knowledge-center': KnowledgeCenterModule,
  // health-score, growth-recs, academy-path, ai-assistant — register as they ship.
};

function EmptyHome() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
      <h2 className="text-base font-bold text-fleek-black mb-1">Nothing to show yet</h2>
      <p className="text-sm text-gray-500">
        We will surface tasks, alerts, and growth tips here as your shop becomes active.
      </p>
    </div>
  );
}

export default function HomepageRenderer({ config }: { config: HomeConfig }) {
  if (!config.modules || config.modules.length === 0) return <EmptyHome />;

  return (
    <div className="space-y-4 sm:space-y-6">
      {config.modules.map((m: HomeModule) => {
        const Component = MODULE_MAP[m.type] ?? UnknownModule;
        return (
          <div key={m.id} data-home-module={m.id}>
            <Component module={m} />
          </div>
        );
      })}
    </div>
  );
}
