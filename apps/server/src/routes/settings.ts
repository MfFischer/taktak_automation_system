/**
 * Settings routes
 */

import { Router, Request, Response } from 'express';
import Joi from 'joi';

import { asyncHandler } from '../middleware/errorHandler';
import { validateBody } from '../middleware/validation';
import { SettingsService } from '../services/settingsService';

const router = Router();
const settingsService = new SettingsService();

// Validation schemas
const updateSyncSettingsSchema = Joi.object({
  enabled: Joi.boolean().required(),
  couchdbUrl: Joi.string().uri().optional(),
  username: Joi.string().optional(),
  password: Joi.string().optional(),
  database: Joi.string().required(),
  autoSync: Joi.boolean().optional(),
  syncInterval: Joi.number().integer().min(1).optional(),
});

const addApiKeySchema = Joi.object({
  name: Joi.string().required().min(1).max(100),
  service: Joi.string()
    .valid('gemini', 'twilio', 'smtp', 'shopify', 'square', 'custom')
    .required(),
  key: Joi.string().required().min(1),
  expiresAt: Joi.date().iso().optional(),
});

const updateFeaturesSchema = Joi.object({
  aiEnabled: Joi.boolean().optional(),
  cloudSyncEnabled: Joi.boolean().optional(),
  analyticsEnabled: Joi.boolean().optional(),
});

/**
 * Get all settings
 * GET /api/settings
 */
router.get(
  '/',
  asyncHandler(async (_req: Request, res: Response) => {
    const settings = await settingsService.getSettings();

    res.json({
      success: true,
      data: settings,
    });
  })
);

/**
 * Update sync settings
 * PUT /api/settings/sync
 */
router.put(
  '/sync',
  validateBody(updateSyncSettingsSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const settings = await settingsService.updateSyncSettings(req.body);

    res.json({
      success: true,
      data: settings,
    });
  })
);

/**
 * Add API key
 * POST /api/settings/api-keys
 */
router.post(
  '/api-keys',
  validateBody(addApiKeySchema),
  asyncHandler(async (req: Request, res: Response) => {
    const settings = await settingsService.addApiKey(req.body);

    res.json({
      success: true,
      data: settings,
    });
  })
);

/**
 * Delete API key
 * DELETE /api/settings/api-keys/:id
 */
router.delete(
  '/api-keys/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const settings = await settingsService.deleteApiKey(req.params.id);

    res.json({
      success: true,
      data: settings,
    });
  })
);

/**
 * Update feature flags
 * PATCH /api/settings/features
 */
router.patch(
  '/features',
  validateBody(updateFeaturesSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const settings = await settingsService.updateFeatures(req.body);

    res.json({
      success: true,
      data: settings,
    });
  })
);

/**
 * Test sync connection
 * POST /api/settings/sync/test
 */
router.post(
  '/sync/test',
  asyncHandler(async (_req: Request, res: Response) => {
    const result = await settingsService.testSyncConnection();

    res.json({
      success: true,
      data: result,
    });
  })
);

export default router;

