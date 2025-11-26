/**
 * Usage Limits Middleware
 * Enforces tier-based usage limits
 */

import { Request, Response, NextFunction } from 'express';
import { UsageLimitsService } from '../services/usageLimitsService';
import { AuthenticationError } from '../utils/errors';
import { logger } from '../utils/logger';

const usageLimitsService = new UsageLimitsService();

/**
 * Middleware to check if user can execute workflows
 */
export function checkExecutionLimit(req: Request, res: Response, next: NextFunction): void | Response {
  try {
    if (!req.user) {
      throw new AuthenticationError('User not authenticated');
    }

    const { tier, usageStats } = req.user;
    const check = usageLimitsService.canExecuteWorkflow(tier, usageStats);

    if (!check.allowed) {
      logger.warn('Execution limit exceeded', {
        userId: req.user.id,
        tier,
        limit: check.limit,
        current: check.current,
      });

      return res.status(429).json({
        success: false,
        error: check.reason || 'Execution limit exceeded',
        data: {
          tier,
          limit: check.limit,
          current: check.current,
          upgradeRequired: true,
        },
      });
    }

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Middleware to check if user can activate workflows
 */
export function checkWorkflowLimit(req: Request, res: Response, next: NextFunction): void | Response {
  try {
    if (!req.user) {
      throw new AuthenticationError('User not authenticated');
    }

    const { tier, usageStats } = req.user;
    const check = usageLimitsService.canActivateWorkflow(tier, usageStats);

    if (!check.allowed) {
      logger.warn('Workflow limit exceeded', {
        userId: req.user.id,
        tier,
        limit: check.limit,
        current: check.current,
      });

      return res.status(429).json({
        success: false,
        error: check.reason || 'Workflow limit exceeded',
        data: {
          tier,
          limit: check.limit,
          current: check.current,
          upgradeRequired: true,
        },
      });
    }

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Middleware to check if user has access to a feature
 */
export function checkFeatureAccess(feature: keyof ReturnType<UsageLimitsService['getTierLimits']>['features']) {
  return (req: Request, res: Response, next: NextFunction): void | Response => {
    try {
      if (!req.user) {
        throw new AuthenticationError('User not authenticated');
      }

      const { tier } = req.user;
      const limits = usageLimitsService.getTierLimits(tier);

      if (!limits.features[feature]) {
        logger.warn('Feature access denied', {
          userId: req.user.id,
          tier,
          feature,
        });

        return res.status(403).json({
          success: false,
          error: `This feature requires a higher tier plan`,
          data: {
            tier,
            feature,
            upgradeRequired: true,
          },
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

