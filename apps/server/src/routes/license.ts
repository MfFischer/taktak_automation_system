/**
 * License Routes
 * API endpoints for license management
 */

import { Router, Request, Response } from 'express';
import Joi from 'joi';
import { asyncHandler } from '../middleware/errorHandler';
import { validateBody } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
import { LicenseService, LicenseTier } from '../services/licenseService';

const router = Router();
const licenseService = new LicenseService();

/**
 * POST /api/license/validate
 * Validate a license key
 */
router.post(
  '/validate',
  validateBody(
    Joi.object({
      licenseKey: Joi.string().required(),
    })
  ),
  asyncHandler(async (req: Request, res: Response) => {
    const { licenseKey } = req.body;

    const validation = await licenseService.validateLicense(licenseKey);

    return res.json({
      success: validation.valid,
      data: validation.valid
        ? {
            tier: validation.license?.tier,
            expiresAt: validation.license?.expiresAt,
            activationsRemaining:
              validation.license!.maxActivations - validation.license!.activationCount,
          }
        : null,
      message: validation.valid ? 'License is valid' : validation.reason,
    });
  })
);

/**
 * POST /api/license/activate
 * Activate a license key
 */
router.post(
  '/activate',
  authenticateToken,
  validateBody(
    Joi.object({
      licenseKey: Joi.string().required(),
      deviceId: Joi.string().optional(),
    })
  ),
  asyncHandler(async (req: Request, res: Response) => {
    const { licenseKey, deviceId } = req.body;
    const userId = req.user!.id;

    const license = await licenseService.activateLicense(licenseKey, userId, deviceId);

    return res.json({
      success: true,
      data: {
        tier: license.tier,
        activatedAt: license.activatedAt,
        expiresAt: license.expiresAt,
      },
      message: 'License activated successfully',
    });
  })
);

/**
 * POST /api/license/create
 * Create a new license (admin only - for now, no auth check)
 * TODO: Add admin authentication
 */
router.post(
  '/create',
  validateBody(
    Joi.object({
      tier: Joi.string()
        .valid(...Object.values(LicenseTier))
        .required(),
      email: Joi.string().email().required(),
      expiresInDays: Joi.number().optional(),
      metadata: Joi.object({
        orderId: Joi.string().optional(),
        purchaseDate: Joi.string().optional(),
        amount: Joi.number().optional(),
        currency: Joi.string().optional(),
      }).optional(),
    })
  ),
  asyncHandler(async (req: Request, res: Response) => {
    const { tier, email, expiresInDays, metadata } = req.body;

    const license = await licenseService.createLicense({
      tier,
      email,
      expiresInDays,
      metadata,
    });

    return res.json({
      success: true,
      data: {
        licenseKey: license.licenseKey,
        tier: license.tier,
        email: license.email,
        expiresAt: license.expiresAt,
        maxActivations: license.maxActivations,
      },
      message: 'License created successfully',
    });
  })
);

/**
 * GET /api/license/my-licenses
 * Get all licenses for the authenticated user
 */
router.get(
  '/my-licenses',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const email = req.user!.email;

    const licenses = await licenseService.getLicensesByEmail(email);

    return res.json({
      success: true,
      data: licenses.map((license) => ({
        licenseKey: license.licenseKey,
        tier: license.tier,
        isActive: license.isActive,
        activatedAt: license.activatedAt,
        expiresAt: license.expiresAt,
        activationCount: license.activationCount,
        maxActivations: license.maxActivations,
      })),
    });
  })
);

/**
 * POST /api/license/deactivate
 * Deactivate a license (admin only - for now, no auth check)
 * TODO: Add admin authentication
 */
router.post(
  '/deactivate',
  validateBody(
    Joi.object({
      licenseKey: Joi.string().required(),
    })
  ),
  asyncHandler(async (req: Request, res: Response) => {
    const { licenseKey } = req.body;

    const license = await licenseService.deactivateLicense(licenseKey);

    return res.json({
      success: true,
      data: {
        licenseKey: license.licenseKey,
        isActive: license.isActive,
      },
      message: 'License deactivated successfully',
    });
  })
);

/**
 * POST /api/license/device-id
 * Generate a device ID for hardware binding
 */
router.post(
  '/device-id',
  validateBody(
    Joi.object({
      platform: Joi.string().required(),
      arch: Joi.string().required(),
      hostname: Joi.string().optional(),
      macAddress: Joi.string().optional(),
    })
  ),
  asyncHandler(async (req: Request, res: Response) => {
    const { platform, arch, hostname, macAddress } = req.body;

    const deviceId = licenseService.generateDeviceId({
      platform,
      arch,
      hostname,
      macAddress,
    });

    return res.json({
      success: true,
      data: { deviceId },
    });
  })
);

export default router;

