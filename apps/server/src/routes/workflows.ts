/**
 * Workflow routes
 */

import { Router, Request, Response } from 'express';
import Joi from 'joi';

import { asyncHandler } from '../middleware/errorHandler';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
import { checkExecutionLimit, checkWorkflowLimit } from '../middleware/usageLimits';
import { WorkflowService } from '../services/workflowService';
import { AuthService } from '../services/authService';
import { WorkflowStatus, NodeType } from '@taktak/types';

const router = Router();
const workflowService = new WorkflowService();
const authService = new AuthService();

// Validation schemas
const createWorkflowSchema = Joi.object({
  name: Joi.string().required().min(1).max(200),
  description: Joi.string().optional().max(1000),
  status: Joi.string()
    .valid(...Object.values(WorkflowStatus))
    .default(WorkflowStatus.DRAFT),
  nodes: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().required(),
        type: Joi.string()
          .valid(...Object.values(NodeType))
          .required(),
        name: Joi.string().required(),
        description: Joi.string().optional(),
        config: Joi.object().required(),
        position: Joi.object({
          x: Joi.number().required(),
          y: Joi.number().required(),
        }).optional(),
      })
    )
    .required()
    .min(1),
  connections: Joi.array()
    .items(
      Joi.object({
        from: Joi.string().required(),
        to: Joi.string().required(),
        condition: Joi.string().optional(),
      })
    )
    .required(),
  trigger: Joi.object({
    id: Joi.string().required(),
    type: Joi.string()
      .valid(...Object.values(NodeType))
      .required(),
    name: Joi.string().required(),
    config: Joi.object().required(),
  }).required(),
  tags: Joi.array().items(Joi.string()).optional(),
  metadata: Joi.object().optional(),
});

const updateWorkflowSchema = createWorkflowSchema.fork(
  ['name', 'nodes', 'connections', 'trigger'],
  (schema) => schema.optional()
);

const listWorkflowsSchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(WorkflowStatus))
    .optional(),
  tags: Joi.string().optional(), // comma-separated
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

const idParamSchema = Joi.object({
  id: Joi.string().required(),
});

/**
 * Create a new workflow
 * POST /api/workflows
 */
router.post(
  '/',
  validateBody(createWorkflowSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const workflow = await workflowService.createWorkflow(req.body);

    res.status(201).json({
      success: true,
      data: workflow,
    });
  })
);

/**
 * List all workflows
 * GET /api/workflows
 */
router.get(
  '/',
  validateQuery(listWorkflowsSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { status, tags, page, limit } = req.query as unknown as {
      status?: WorkflowStatus;
      tags?: string;
      page: number;
      limit: number;
    };

    const tagArray = tags ? tags.split(',').map((t) => t.trim()) : undefined;
    const userId = (req as any).user?.id;

    const result = await workflowService.listWorkflows({
      status,
      tags: tagArray,
      page,
      limit,
      userId, // Filter by authenticated user
    });

    res.json({
      success: true,
      data: result.workflows,
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
 * Get a workflow by ID
 * GET /api/workflows/:id
 */
router.get(
  '/:id',
  validateParams(idParamSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const workflow = await workflowService.getWorkflowById(req.params.id);

    res.json({
      success: true,
      data: workflow,
    });
  })
);

/**
 * Update a workflow
 * PUT /api/workflows/:id
 */
router.put(
  '/:id',
  validateParams(idParamSchema),
  validateBody(updateWorkflowSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const workflow = await workflowService.updateWorkflow(req.params.id, req.body);

    res.json({
      success: true,
      data: workflow,
    });
  })
);

/**
 * Delete a workflow
 * DELETE /api/workflows/:id
 */
router.delete(
  '/:id',
  validateParams(idParamSchema),
  asyncHandler(async (req: Request, res: Response) => {
    await workflowService.deleteWorkflow(req.params.id);

    res.json({
      success: true,
      message: 'Workflow deleted successfully',
    });
  })
);

/**
 * Execute a workflow manually
 * POST /api/workflows/:id/execute
 */
router.post(
  '/:id/execute',
  authenticateToken,
  checkExecutionLimit,
  validateParams(idParamSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const execution = await workflowService.executeWorkflow(req.params.id, req.body);

    // Increment execution count for user
    if (req.user) {
      await authService.incrementExecutionCount(req.user.id);
    }

    res.json({
      success: true,
      data: execution,
    });
  })
);

/**
 * Activate/deactivate a workflow
 * PATCH /api/workflows/:id/status
 */
router.patch(
  '/:id/status',
  authenticateToken,
  validateParams(idParamSchema),
  validateBody(
    Joi.object({
      status: Joi.string()
        .valid(...Object.values(WorkflowStatus))
        .required(),
    })
  ),
  asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.body;

    // Check workflow limit when activating
    if (status === WorkflowStatus.ACTIVE && req.user) {
      await checkWorkflowLimit(req, res, async () => {
        const workflow = await workflowService.updateWorkflowStatus(req.params.id, status);

        // Update active workflow count
        const activeWorkflows = await workflowService.countActiveWorkflows(req.user!.id);
        await authService.updateActiveWorkflowCount(req.user!.id, activeWorkflows);

        res.json({
          success: true,
          data: workflow,
        });
      });
    } else {
      const workflow = await workflowService.updateWorkflowStatus(req.params.id, status);

      // Update active workflow count if deactivating
      if (req.user && (status === WorkflowStatus.PAUSED || status === WorkflowStatus.DISABLED)) {
        const activeWorkflows = await workflowService.countActiveWorkflows(req.user.id);
        await authService.updateActiveWorkflowCount(req.user.id, activeWorkflows);
      }

      res.json({
        success: true,
        data: workflow,
      });
    }
  })
);

/**
 * List workflow versions
 * GET /api/workflows/:id/versions
 */
router.get(
  '/:id/versions',
  validateParams(idParamSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const versions = await workflowService.listWorkflowVersions(req.params.id);

    res.json({
      success: true,
      data: versions,
    });
  })
);

/**
 * Get a specific workflow version
 * GET /api/workflows/:id/versions/:versionId
 */
router.get(
  '/:id/versions/:versionId',
  asyncHandler(async (req: Request, res: Response) => {
    const version = await workflowService.getWorkflowVersion(req.params.versionId);

    res.json({
      success: true,
      data: version,
    });
  })
);

/**
 * Rollback to a specific version
 * POST /api/workflows/:id/versions/:versionId/rollback
 */
router.post(
  '/:id/versions/:versionId/rollback',
  asyncHandler(async (req: Request, res: Response) => {
    const workflow = await workflowService.rollbackToVersion(req.params.id, req.params.versionId);

    res.json({
      success: true,
      data: workflow,
    });
  })
);

/**
 * Create a new version snapshot
 * POST /api/workflows/:id/versions
 */
router.post(
  '/:id/versions',
  validateParams(idParamSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { changeDescription } = req.body;
    const version = await workflowService.createWorkflowVersion(req.params.id, changeDescription);

    res.json({
      success: true,
      data: version,
    });
  })
);

export default router;

