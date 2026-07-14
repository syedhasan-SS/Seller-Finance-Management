import type { Rule } from '../types';
import type { WelcomeHeroModule } from '../../home-config-types';
import { HERO_COPY } from '../copy';

export const welcomeHeroRule: Rule = {
  id: 'welcome-hero',
  description: 'Lifecycle-tailored greeting at the top of the page.',
  evaluate(ctx) {
    const copy = HERO_COPY[ctx.lifecycle];
    const greeting = ctx.signals.shopName
      ? `Welcome back, ${ctx.signals.shopName}`
      : 'Welcome back';

    const module: WelcomeHeroModule = {
      id: 'welcome-hero',
      type: 'welcome-hero',
      priority: 1,
      analytics: { eventPrefix: 'home.welcome_hero' },
      data: {
        greeting,
        subline: copy.subline,
        badge: copy.badge,
      },
    };
    return { modules: [module] };
  },
};
