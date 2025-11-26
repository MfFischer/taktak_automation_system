/**
 * Usage Limits Service
 * Manages tier-based usage limits and enforcement
 */

import { UserTier, UsageStats } from './authService';
import { logger } from '../utils/logger';

export interface TierLimits {
  executionsPerMonth: number;
  maxActiveWorkflows: number;
  features: {
    cloudSync: boolean;
    advancedAnalytics: boolean;
    prioritySupport: boolean;
    customIntegrations: boolean;
    teamWorkspaces: boolean;
    whiteLabel: boolean;
    sso: boolean;
  };
}

export class UsageLimitsService {
  /**
   * Get limits for a specific tier
   */
  getTierLimits(tier: UserTier): TierLimits {
    switch (tier) {
      case UserTier.FREE:
        return {
          executionsPerMonth: 100,
          maxActiveWorkflows: 3,
          features: {
            cloudSync: false,
            advancedAnalytics: false,
            prioritySupport: false,
            customIntegrations: false,
            teamWorkspaces: false,
            whiteLabel: false,
            sso: false,
          },
        };

      case UserTier.STARTER:
        return {
          executionsPerMonth: 1000,
          maxActiveWorkflows: 10,
          features: {
            cloudSync: true,
            advancedAnalytics: false,
            prioritySupport: false,
            customIntegrations: false,
            teamWorkspaces: false,
            whiteLabel: false,
            sso: false,
          },
        };

      case UserTier.PRO:
        return {
          executionsPerMonth: 10000,
          maxActiveWorkflows: -1, // unlimited
          features: {
            cloudSync: true,
            advancedAnalytics: true,
            prioritySupport: true,
            customIntegrations: false,
            teamWorkspaces: false,
            whiteLabel: false,
            sso: false,
          },
        };

      case UserTier.ENTERPRISE:
        return {
          executionsPerMonth: -1, // unlimited
          maxActiveWorkflows: -1, // unlimited
          features: {
            cloudSync: true,
            advancedAnalytics: true,
            prioritySupport: true,
            customIntegrations: true,
            teamWorkspaces: true,
            whiteLabel: true,
            sso: true,
          },
        };

      default:
        return this.getTierLimits(UserTier.FREE);
    }
  }

  /**
   * Check if user can execute a workflow
   */
  canExecuteWorkflow(tier: UserTier, usageStats: UsageStats): {
    allowed: boolean;
    reason?: string;
    limit?: number;
    current?: number;
  } {
    const limits = this.getTierLimits(tier);

    // Unlimited executions
    if (limits.executionsPerMonth === -1) {
      return { allowed: true };
    }

    // Check if under limit
    if (usageStats.executionsThisMonth >= limits.executionsPerMonth) {
      logger.warn('Execution limit reached', {
        tier,
        limit: limits.executionsPerMonth,
        current: usageStats.executionsThisMonth,
      });

      return {
        allowed: false,
        reason: 'Monthly execution limit reached',
        limit: limits.executionsPerMonth,
        current: usageStats.executionsThisMonth,
      };
    }

    return { allowed: true };
  }

  /**
   * Check if user can create/activate a workflow
   */
  canActivateWorkflow(tier: UserTier, usageStats: UsageStats): {
    allowed: boolean;
    reason?: string;
    limit?: number;
    current?: number;
  } {
    const limits = this.getTierLimits(tier);

    // Unlimited workflows
    if (limits.maxActiveWorkflows === -1) {
      return { allowed: true };
    }

    // Check if under limit
    if (usageStats.activeWorkflows >= limits.maxActiveWorkflows) {
      logger.warn('Active workflow limit reached', {
        tier,
        limit: limits.maxActiveWorkflows,
        current: usageStats.activeWorkflows,
      });

      return {
        allowed: false,
        reason: 'Maximum active workflows reached',
        limit: limits.maxActiveWorkflows,
        current: usageStats.activeWorkflows,
      };
    }

    return { allowed: true };
  }
}

