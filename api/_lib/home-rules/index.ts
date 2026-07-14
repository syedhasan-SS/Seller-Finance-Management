/**
 * Home-config rules engine.
 *
 * Public surface: buildHomeConfig(signals, vendorId) => HomeConfig.
 * Future: swap the static RULES import for an async loadRulesFromCms() — the
 * engine and the HTTP contract don't change.
 */

import type {
  ActionCenterModule,
  ActionTask,
  ActionUrgency,
  HomeConfig,
  HomeModule,
  RiskAlertData,
  RiskAlertModule,
} from '../home-config-types';
import type { SellerSignals } from '../seller-signals';
import { classifyLifecycle } from './lifecycle';
import { RULES } from './rules';

const RULESET_VERSION = 'rules-v1.0.0';

const URGENCY_ORDER: Record<ActionUrgency, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

function byUrgency(a: ActionTask, b: ActionTask): number {
  return URGENCY_ORDER[a.urgency] - URGENCY_ORDER[b.urgency];
}

export function buildHomeConfig(signals: SellerSignals, vendorId: string): HomeConfig {
  const now = new Date();
  const lifecycle = classifyLifecycle(signals);
  const ctx = { signals, lifecycle, vendorId, now };

  const collectedTasks: ActionTask[] = [];
  const collectedAlerts: RiskAlertData[] = [];
  const collectedModules: HomeModule[] = [];
  const firedRuleIds: string[] = [];

  for (const rule of RULES) {
    const out = rule.evaluate(ctx);
    if (!out) continue;
    firedRuleIds.push(rule.id);
    if (out.tasks) collectedTasks.push(...out.tasks);
    if (out.alerts) collectedAlerts.push(...out.alerts);
    if (out.modules) collectedModules.push(...out.modules);
  }

  // Assemble: alerts first → action center (if any tasks) → other modules by priority.
  const alertModules: RiskAlertModule[] = collectedAlerts.map((data, i) => ({
    id: `risk-alert-${i}`,
    type: 'risk-alert',
    priority: 5,
    analytics: { eventPrefix: 'home.risk_alert' },
    data,
  }));

  const actionCenterModule: ActionCenterModule | null = collectedTasks.length > 0
    ? {
        id: 'action-center-default',
        type: 'action-center',
        priority: 10,
        analytics: { eventPrefix: 'home.action_center' },
        data: {
          title: 'Things to do',
          tasks: [...collectedTasks].sort(byUrgency),
        },
      }
    : null;

  const modules: HomeModule[] = [
    ...alertModules,
    ...(actionCenterModule ? [actionCenterModule] : []),
    ...collectedModules,
  ].sort((a, b) => a.priority - b.priority);

  return {
    version: 1,
    vendorId,
    generatedAt: now.toISOString(),
    lifecycle,
    modules,
    meta: {
      rulesetVersion: RULESET_VERSION,
      firedRuleIds,
    },
  };
}
