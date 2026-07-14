import type { Rule } from '../types';
import type { ActionTask } from '../../home-config-types';
import { listTasks } from '../../admin-store';
import { evaluateConditions } from '../conditions';

/**
 * Reads admin-managed tasks from the store and emits the ones whose conditions
 * match the current seller. Merged into the single Action Center module by the
 * engine.
 */
export const adminTasksRule: Rule = {
  id: 'admin-tasks',
  description: 'Surfaces tasks created in the Admin Console whose conditions match this seller.',
  evaluate(ctx) {
    const matching = listTasks().filter(
      (t) => t.enabled && evaluateConditions(t.conditions, ctx)
    );
    if (matching.length === 0) return null;

    const tasks: ActionTask[] = matching.map((t) => ({
      taskId: t.id,
      title: t.title,
      description: t.description,
      urgency: t.urgency,
      icon: t.icon,
      cta: { label: t.ctaLabel, href: t.ctaHref, kind: 'primary' },
      estimatedMinutes: t.estimatedMinutes,
      source: { ruleId: 'admin-tasks' },
    }));

    return { tasks };
  },
};
