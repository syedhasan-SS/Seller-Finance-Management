import type { Rule } from '../types';

const BANK_HREF = '/tools/seller-profile-manager?tab=bank';

export const bankStatusRule: Rule = {
  id: 'bank-status',
  description: 'Surface bank verification problems as an alert + critical task; nudge missing bank for new sellers.',
  evaluate(ctx) {
    const { bankStatus, bankRejectionReason } = ctx.signals;

    if (bankStatus === 'rejected') {
      return {
        alerts: [
          {
            severity: 'error',
            title: 'Bank account rejected',
            body:
              bankRejectionReason ||
              'Your bank submission was rejected. Update your details and resubmit so future payouts can be processed.',
            cta: { label: 'Resubmit bank details', href: BANK_HREF },
          },
        ],
        tasks: [
          {
            taskId: 'bank-account-rejected',
            title: 'Resubmit bank details',
            description: 'Your last submission was rejected. Update and resubmit.',
            urgency: 'critical',
            icon: 'CreditCard',
            cta: { label: 'Open bank settings', href: BANK_HREF, kind: 'primary' },
            estimatedMinutes: 3,
            source: { ruleId: 'bank-status' },
          },
        ],
      };
    }

    if (bankStatus === 'none') {
      return {
        tasks: [
          {
            taskId: 'bank-account-missing',
            title: 'Add your bank account',
            description: 'Required to receive your first payout.',
            urgency: ctx.lifecycle === 'new' ? 'high' : 'medium',
            icon: 'CreditCard',
            cta: { label: 'Add bank details', href: BANK_HREF, kind: 'primary' },
            estimatedMinutes: 5,
            source: { ruleId: 'bank-status' },
          },
        ],
      };
    }

    if (bankStatus === 'submitted' || bankStatus === 'under_review') {
      return {
        tasks: [
          {
            taskId: 'bank-account-pending',
            title: 'Bank account under review',
            description: 'We are verifying your bank details. Most submissions are reviewed within 48 hours.',
            urgency: 'low',
            icon: 'CreditCard',
            cta: { label: 'View status', href: BANK_HREF, kind: 'secondary' },
            source: { ruleId: 'bank-status' },
          },
        ],
      };
    }

    return null;
  },
};
