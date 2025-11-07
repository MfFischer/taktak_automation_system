/**
 * Execution routes
 */

import { Router, Request, Response } from 'express';
import Joi from 'joi';

import { asyncHandler } from '../middleware/errorHandler';
import { validateParams, validateQuery } from '../middleware/validation';
import { ExecutionService } from '../services/executionService';
import { ExecutionStatus } from '@taktak/types';

const router = Router();
const executionService = new ExecutionService();

// Validation schemas
const listExecutionsSchema = Joi.object({
  workflowId: Joi.string().optional(),
  status: Joi.string()
    .valid(...Object.values(ExecutionStatus))
    .optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

const idParamSchema = Joi.object({
  id: Joi.string().required(),
});

/**
 * List all executions
 * GET /api/executions
 */
router.get(
  '/',
  validateQuery(listExecutionsSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { workflowId, status, page, limit } = req.query as unknown as {
      workflowId?: string;
      status?: ExecutionStatus;
      page: number;
      limit: number;
    };

    const result = await executionService.listExecutions({
      workflowId,
      status,
      page,
      limit,
    });

    res.json({
      success: true,
      data: result.executions,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    });
  })
);

/**
 * Get an execution by ID
 * GET /api/executions/:id
 */
router.get(
  '/:id',
  validateParams(idParamSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const execution = await executionService.getExecutionById(req.params.id);

    res.json({
      success: true,
      data: execution,
    });
  })
);

/**
 * Cancel a running execution
 * POST /api/executions/:id/cancel
 */
router.post(
  '/:id/cancel',
  validateParams(idParamSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const execution = await executionService.cancelExecution(req.params.id);

    res.json({
      success: true,
      data: execution,
    });
  })
);

/**
 * Retry a failed execution
 * POST /api/executions/:id/retry
 */
router.post(
  '/:id/retry',
  validateParams(idParamSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const execution = await executionService.retryExecution(req.params.id);

    res.json({
      success: true,
      data: execution,
    });
  })
);

/**
 * Delete an execution
 * DELETE /api/executions/:id
 */
router.delete(
  '/:id',
  validateParams(idParamSchema),
  asyncHandler(async (req: Request, res: Response) => {
    await executionService.deleteExecution(req.params.id);

    res.json({
      success: true,
      message: 'Execution deleted successfully',
    });
  })
);

export default router;

