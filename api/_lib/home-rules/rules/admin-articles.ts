import type { Rule } from '../types';
import type { KnowledgeCenterModule, KnowledgeItem } from '../../home-config-types';
import { listArticles } from '../../admin-store';
import { evaluateConditions } from '../conditions';

/**
 * Reads admin-curated featured articles from the store, filters by conditions,
 * and emits the Knowledge Center module. Replaces the static
 * `knowledge-starter` rule when any admin articles exist.
 */
export const adminArticlesRule: Rule = {
  id: 'admin-articles',
  description: 'Surfaces Help Center articles featured in the Admin Console.',
  evaluate(ctx) {
    const items: KnowledgeItem[] = listArticles()
      .filter((a) => a.enabled)
      .filter((a) => evaluateConditions(a.conditions, ctx))
      .map((a) => ({
        id: a.id,
        title: a.title,
        summary: a.summary,
        href: a.href,
        tag: a.tag,
        thumbnailUrl: a.thumbnailUrl,
      }));

    if (items.length === 0) return null;

    const module: KnowledgeCenterModule = {
      id: 'knowledge-admin',
      type: 'knowledge-center',
      priority: 50,
      analytics: { eventPrefix: 'home.knowledge' },
      data: { title: 'Learning Center', items },
    };
    return { modules: [module] };
  },
};
