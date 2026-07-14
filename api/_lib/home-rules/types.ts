/**
 * Rule contract. Rules are pure functions over a RuleContext.
 */

import type { ActionTask, HomeModule, LifecycleStage, RiskAlertData } from '../home-config-types';
import type { SellerSignals } from '../seller-signals';

export interface RuleContext {
  signals: SellerSignals;
  lifecycle: LifecycleStage;
  vendorId: string;
  now: Date;
}

export interface RuleOutput {
  /** Modules emitted standalone. */
  modules?: HomeModule[];
  /** Tasks merged into the single ActionCenter module. */
  tasks?: ActionTask[];
  /** Alerts emitted as RiskAlertModules at the top of the page. */
  alerts?: RiskAlertData[];
}

export interface Rule {
  id: string;
  description: string;
  evaluate(ctx: RuleContext): RuleOutput | null;
}
