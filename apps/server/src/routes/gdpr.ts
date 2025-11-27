/**
 * GDPR Compliance Routes
 * Data export, account deletion, and privacy controls
 */

import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticateToken } from '../middleware/auth.js';
import { auditService } from '../services/auditService.js';
import { AuthService } from '../services/authService.js';
import { WorkflowService } from '../services/workflowService.js';
import { logger } from '../utils/logger.js';

const router = Router();
const authService = new AuthService();
const workflowService = new WorkflowService();

/**
 * GET /api/gdpr/export
 * Export all user data (GDPR Article 20 - Right to data portability)
 */
router.get(
  '/export',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const userEmail = req.user!.email;

    logger.info('GDPR data export requested', { userId });

    // Collect all user data
    const userData = {
      exportDate: new Date().toISOString(),
      user: {
        id: userId,
        email: userEmail,
        name: req.user!.name,
        role: req.user!.role,
        tier: req.user!.tier,
        createdAt: req.user!.createdAt,
      },
      workflows: await workflowService.getWorkflowsByUser(userId),
      auditLogs: await auditService.getUserAuditLogs(userId),
    };

    // Log the export action
    await auditService.log({
      action: 'user.data_export',
      resource: 'user',
      resourceId: userId,
      userId,
      ipAddress: req.ip,
    });

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="taktak-data-export-${userId}.json"`);
    res.json({
      success: true,
      data: userData,
    });
  })
);

/**
 * DELETE /api/gdpr/account
 * Delete user account and all associated data (GDPR Article 17 - Right to erasure)
 */
router.delete(
  '/account',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const { confirmEmail } = req.body;

    // Require email confirmation for safety
    if (confirmEmail !== req.user!.email) {
      res.status(400).json({
        success: false,
        error: 'Email confirmation does not match. Please confirm your email to delete your account.',
      });
      return;
    }

    logger.warn('GDPR account deletion requested', { userId });

    // Log the deletion action before deleting
    await auditService.log({
      action: 'user.account_delete',
      resource: 'user',
      resourceId: userId,
      userId,
      ipAddress: req.ip,
      details: { reason: 'GDPR request' },
    });

    // Delete user workflows
    const workflows = await workflowService.getWorkflowsByUser(userId);
    for (const workflow of workflows) {
      await workflowService.deleteWorkflow(workflow._id);
    }

    // Delete user audit logs
    await auditService.deleteUserAuditLogs(userId);

    // Delete user account
    await authService.deleteUser(userId);

    logger.info('GDPR account deletion completed', { userId });

    res.json({
      success: true,
      message: 'Your account and all associated data have been permanently deleted.',
    });
  })
);

/**
 * GET /api/gdpr/audit-logs
 * Get user's audit logs (GDPR Article 15 - Right of access)
 */
router.get(
  '/audit-logs',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { limit = '50', skip = '0' } = req.query;

    const { logs, total } = await auditService.getLogs({
      userId,
      limit: parseInt(limit as string, 10),
      skip: parseInt(skip as string, 10),
    });

    res.json({
      success: true,
      data: {
        logs,
        total,
        limit: parseInt(limit as string, 10),
        skip: parseInt(skip as string, 10),
      },
    });
  })
);

export default router;

