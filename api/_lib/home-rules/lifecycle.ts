/**
 * Lifecycle classifier. Pure function over SellerSignals.
 *
 * Primary source: int_vendor_activity.dormancy_state (canonical 4-state model
 * used across Fleek). We map it onto the homepage's 4 lifecycle states with a
 * Power-seller overlay derived from GMV/order volume.
 *
 * `slowing` is the "At Risk" cohort I called out in the gap analysis; for v1
 * we surface them as `dormant` so reactivation rules fire on them too. Phase 2
 * should add `at_risk` as a first-class lifecycle stage.
 */

import type { LifecycleStage } from '../home-config-types';
import type { SellerSignals } from '../seller-signals';

export const THRESHOLDS = {
  // Validated against the active PK-Zone cohort distribution (avg orders_90d=211, gmv £70K).
  POWER_MIN_ORDERS_L90D: 60,
  POWER_MIN_GMV_L90D: 15000, // GBP
  // Legacy / signup-proxy thresholds (used only when dormancy_state is missing).
  NEW_MAX_TENURE_DAYS: 30,
  NEW_MAX_LIFETIME_ORDERS: 3,
  DORMANT_MIN_DAYS_SINCE_LAST_ORDER: 60,
} as const;

export function classifyLifecycle(s: SellerSignals): LifecycleStage {
  // 1. Prefer the canonical dormancy_state from int_vendor_activity.
  if (s.dormancyState) {
    if (s.dormancyState === 'never_activated') return 'new';
    if (s.dormancyState === 'dormant' || s.dormancyState === 'slowing') return 'dormant';
    if (s.dormancyState === 'active') {
      const isPower =
        s.orderCountL90d >= THRESHOLDS.POWER_MIN_ORDERS_L90D ||
        s.gmvL90d >= THRESHOLDS.POWER_MIN_GMV_L90D;
      return isPower ? 'power' : 'active';
    }
  }

  // 2. Fallback rules for vendors missing from int_vendor_activity.
  if (
    s.lastOrderAt &&
    s.daysSinceLastOrder !== null &&
    s.daysSinceLastOrder > THRESHOLDS.DORMANT_MIN_DAYS_SINCE_LAST_ORDER
  ) {
    return 'dormant';
  }

  const tenureOk =
    s.daysSinceSignup === null || s.daysSinceSignup <= THRESHOLDS.NEW_MAX_TENURE_DAYS;
  if (tenureOk && s.orderCountLifetime <= THRESHOLDS.NEW_MAX_LIFETIME_ORDERS) {
    return 'new';
  }

  const isPower =
    s.orderCountL90d >= THRESHOLDS.POWER_MIN_ORDERS_L90D ||
    s.gmvL90d >= THRESHOLDS.POWER_MIN_GMV_L90D;
  if (isPower) return 'power';

  return 'active';
}
