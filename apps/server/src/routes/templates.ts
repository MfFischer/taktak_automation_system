/**
 * Template Routes
 * API endpoints for workflow templates
 */

import { Router, Request, Response } from 'express';
import Joi from 'joi';
import { asyncHandler } from '../middleware/errorHandler';
import { validateBody, validateQuery } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
import {
  getAllTemplates,
  getTemplatesByCategory,
  getTemplateById,
  searchTemplatesByTags,
  searchTemplates,
} from '../data/templates';
import { TemplateCategory, TemplateDifficulty } from '@taktak/types';

const router = Router();

/**
 * GET /api/templates
 * Get all templates or filter by query parameters
 */
router.get(
  '/',
  validateQuery(
    Joi.object({
      category: Joi.string().valid(...Object.values(TemplateCategory)),
      difficulty: Joi.string().valid(...Object.values(TemplateDifficulty)),
      tags: Joi.string(), // Comma-separated tags
      search: Joi.string(),
    })
  ),
  asyncHandler(async (req: Request, res: Response) => {
    const { category, difficulty, tags, search } = req.query;

    let templates = getAllTemplates();

    // Filter by category
    if (category) {
      templates = getTemplatesByCategory(category as TemplateCategory);
    }

    // Filter by difficulty
    if (difficulty) {
      templates = templates.filter(t => t.difficulty === difficulty);
    }

    // Filter by tags
    if (tags) {
      const tagArray = (tags as string).split(',').map(t => t.trim());
      templates = searchTemplatesByTags(tagArray);
    }

    // Search by keyword
    if (search) {
      templates = searchTemplates(search as string);
    }

    res.json({
      success: true,
      data: templates,
      count: templates.length,
    });
  })
);

/**
 * GET /api/templates/categories
 * Get all available categories with counts
 */
router.get(
  '/categories',
  asyncHandler(async (_req: Request, res: Response) => {
    const allTemplates = getAllTemplates();
    const categories = Object.values(TemplateCategory).map(category => ({
      id: category,
      name: category.charAt(0).toUpperCase() + category.slice(1),
      count: allTemplates.filter(t => t.category === category).length,
    }));

    res.json({
      success: true,
      data: categories,
    });
  })
);

/**
 * GET /api/templates/:id
 * Get a specific template by ID
 */
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const template = getTemplateById(id);

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found',
      });
    }

    return res.json({
      success: true,
      data: template,
    });
  })
);

/**
 * POST /api/templates/:id/import
 * Import a template into user's workflows
 */
router.post(
  '/:id/import',
  authenticateToken,
  validateBody(
    Joi.object({
      customName: Joi.string().optional(),
      customDescription: Joi.string().optional(),
    })
  ),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { customName, customDescription } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const template = getTemplateById(id);

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found',
      });
    }

    // Create a new workflow from the template
    const newWorkflow = {
      ...template.workflow,
      name: customName || template.name,
      description: customDescription || template.description,
      userId,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // TODO: Save to database
    // For now, just return the workflow structure
    return res.json({
      success: true,
      data: newWorkflow,
      message: 'Template imported successfully. You can now customize and activate it.',
    });
  })
);

export default router;

