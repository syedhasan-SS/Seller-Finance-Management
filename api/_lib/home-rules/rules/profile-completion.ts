import type { Rule } from '../types';

export const profileCompletionRule: Rule = {
  id: 'profile-completion',
  description: 'Push profile completion until the shop name + bio are filled in.',
  evaluate(ctx) {
    const { bio, shopName, profileCompletion } = ctx.signals;

    if (profileCompletion >= 1) return null;

    const missingShopName = !shopName?.trim() || shopName === ctx.signals.vendorHandle;
    const missingBio = !bio?.trim();

    if (!missingShopName && !missingBio) return null;

    const description = missingBio && missingShopName
      ? 'Add your shop name and a short bio so buyers know who you are.'
      : missingBio
        ? 'Add a short bio so buyers know what your shop is about.'
        : 'Set a friendly shop name buyers will recognize.';

    return {
      tasks: [
        {
          taskId: 'profile-complete',
          title: 'Finish your profile',
          description,
          urgency: ctx.lifecycle === 'new' ? 'high' : 'low',
          icon: 'User',
          cta: { label: 'Edit profile', href: '/tools/seller-profile-manager?tab=profile', kind: 'primary' },
          estimatedMinutes: 2,
          source: { ruleId: 'profile-completion' },
        },
      ],
    };
  },
};
