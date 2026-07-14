/**
 * Ordered list of rules. The engine iterates in this order; emission order
 * influences which task surfaces first when multiple rules fire.
 */

import type { Rule } from '../types';
import { welcomeHeroRule } from './welcome-hero';
import { bankStatusRule } from './bank-status';
import { profileCompletionRule } from './profile-completion';
import { quickActionsDefaultRule } from './quick-actions-default';
import { notificationsRecentRule } from './notifications-recent';
import { knowledgeStarterRule } from './knowledge-starter';
import { adminTasksRule } from './admin-tasks';
import { adminAnnouncementsRule } from './admin-announcements';
import { adminArticlesRule } from './admin-articles';

/**
 * Rule order matters. Admin-driven rules run alongside code-defined rules.
 * `admin-articles` emits a Knowledge Center module that supersedes the static
 * one from `knowledge-starter` — both are kept registered; the engine sorts
 * modules by priority and we let `admin-articles` win when populated by
 * giving them equal priority and ordering admin-articles first here.
 */
export const RULES: Rule[] = [
  welcomeHeroRule,
  adminAnnouncementsRule,
  bankStatusRule,
  profileCompletionRule,
  adminTasksRule,
  quickActionsDefaultRule,
  notificationsRecentRule,
  adminArticlesRule,
  knowledgeStarterRule,
];
