import type { Rule } from '../types';
import type { KnowledgeCenterModule } from '../../home-config-types';
import { KNOWLEDGE_STARTER } from '../copy';

export const knowledgeStarterRule: Rule = {
  id: 'knowledge-starter',
  description: 'Static curated help articles. Migrate to a CMS later.',
  evaluate(_ctx) {
    const module: KnowledgeCenterModule = {
      id: 'knowledge-starter',
      type: 'knowledge-center',
      priority: 50,
      analytics: { eventPrefix: 'home.knowledge' },
      data: {
        title: 'Knowledge center',
        items: KNOWLEDGE_STARTER,
      },
    };
    return { modules: [module] };
  },
};
