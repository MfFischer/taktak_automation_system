/**
 * Workflow routes
 */

import { Router, Request, Response } from 'express';
import Joi from 'joi';

import { asyncHandler } from '../middleware/errorHandler';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import { WorkflowService } from '../services/workflowService';
import { WorkflowStatus, NodeType } from '@taktak/types';

const router = Router();
const workflowService = new WorkflowService();

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
  validateParams(idParamSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const execution = await workflowService.executeWorkflow(req.params.id, req.body);

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
  validateParams(idParamSchema),
  validateBody(
    Joi.object({
      status: Joi.string()
        .valid(...Object.values(WorkflowStatus))
        .required(),
    })
  ),
  asyncHandler(async (req: Request, res: Response) => {
    const workflow = await workflowService.updateWorkflowStatus(req.params.id, req.body.status);

    res.json({
      success: true,
      data: workflow,
    });
  })
);

export default router;

