/**
 * AI routes for natural language workflow generation
 */

import { Router, Request, Response } from 'express';
import Joi from 'joi';

import { asyncHandler } from '../middleware/errorHandler';
import { validateBody } from '../middleware/validation';
import { strictRateLimiter } from '../middleware/security';
import { AIService } from '../services/aiService';

const router = Router();
const aiService = new AIService();

// Apply strict rate limiting to AI endpoints
router.use(strictRateLimiter);

// Validation schemas
const interpretSchema = Joi.object({
  prompt: Joi.string().required().min(10).max(2000),
  apiKey: Joi.string().optional(), // User can provide their own key
  dryRun: Joi.boolean().default(false),
});

const validateWorkflowSchema = Joi.object({
  workflow: Joi.object().required(),
});

/**
 * Interpret natural language to workflow
 * POST /api/ai/interpret
 */
router.post(
  '/interpret',
  validateBody(interpretSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { prompt, apiKey, dryRun } = req.body;

    const result = await aiService.interpretPrompt(prompt, apiKey, dryRun);

    res.json({
      success: true,
      data: result,
    });
  })
);

/**
 * Validate a workflow structure
 * POST /api/ai/validate
 */
router.post(
  '/validate',
  validateBody(validateWorkflowSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { workflow } = req.body;

    const result = await aiService.validateWorkflow(workflow);

    res.json({
      success: true,
      data: result,
    });
  })
);

/**
 * Get AI suggestions for workflow improvement
 * POST /api/ai/suggest
 */
router.post(
  '/suggest',
  validateBody(
    Joi.object({
      workflowId: Joi.string().required(),
      apiKey: Joi.string().optional(),
    })
  ),
  asyncHandler(async (req: Request, res: Response) => {
    const { workflowId, apiKey } = req.body;

    const suggestions = await aiService.getSuggestions(workflowId, apiKey);

    res.json({
      success: true,
      data: suggestions,
    });
  })
);

/**
 * Get current AI mode
 * GET /api/ai/mode
 */
router.get(
  '/mode',
  asyncHandler(async (_req: Request, res: Response) => {
    const mode = aiService.getAIMode();

    res.json({
      success: true,
      data: { mode },
    });
  })
);

/**
 * Set AI mode
 * POST /api/ai/mode
 */
router.post(
  '/mode',
  validateBody(
    Joi.object({
      mode: Joi.string().valid('cloud', 'local', 'auto').required(),
    })
  ),
  asyncHandler(async (req: Request, res: Response) => {
    const { mode } = req.body;

    aiService.setAIMode(mode);

    res.json({
      success: true,
      data: { mode },
    });
  })
);

export default router;

