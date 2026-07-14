/**
 * Evaluate an AppearanceConditions bag against a seller's signals + lifecycle.
 * Returns true if ALL specified conditions match. Omitted fields = "any".
 */

import type { AppearanceConditions, YesNoAny } from '../admin-content-types';
import type { LifecycleStage } from '../home-config-types';
import type { SellerSignals } from '../seller-signals';

interface EvalCtx {
  signals: SellerSignals;
  lifecycle: LifecycleStage;
}

function checkYesNo(value: YesNoAny | undefined, actual: boolean): boolean {
  if (!value || value === 'any') return true;
  return value === 'yes' ? actual : !actual;
}

export function evaluateConditions(
  c: AppearanceConditions | undefined,
  { signals, lifecycle }: EvalCtx
): boolean {
  if (!c) return true;

  if (c.lifecycles && c.lifecycles.length > 0 && !c.lifecycles.includes(lifecycle)) {
    return false;
  }

  if (c.bankStatuses && c.bankStatuses.length > 0 && !c.bankStatuses.includes(signals.bankStatus)) {
    return false;
  }

  const hasFirstListing = signals.lifetimeUploads > 0;
  if (!checkYesNo(c.hasFirstListing, hasFirstListing)) return false;

  const hasFirstOrder = signals.orderCountLifetime > 0 || (signals.lastOrderAt != null);
  if (!checkYesNo(c.hasFirstOrder, hasFirstOrder)) return false;

  if (!checkYesNo(c.hasReceivedPayout, signals.hasReceivedFirstPayout)) return false;

  if (!checkYesNo(c.profileComplete, signals.profileCompletion >= 1)) return false;

  return true;
}

/**
 * Are we inside the [startsAt, endsAt] window? null/undefined = open.
 */
export function isWithinSchedule(
  startsAt: string | null | undefined,
  endsAt: string | null | undefined,
  now: Date
): boolean {
  if (startsAt) {
    const start = new Date(startsAt).getTime();
    if (!Number.isNaN(start) && now.getTime() < start) return false;
  }
  if (endsAt) {
    const end = new Date(endsAt).getTime();
    if (!Number.isNaN(end) && now.getTime() > end) return false;
  }
  return true;
}
