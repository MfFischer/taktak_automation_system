/**
 * Authentication routes
 */

import { Router } from 'express';
import Joi from 'joi';

import { AuthService } from '../services/authService';
import { asyncHandler } from '../middleware/errorHandler';
import { validateBody } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
import { ApiResponse } from '@taktak/types';

const router = Router();
const authService = new AuthService();

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  name: Joi.string().min(2).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).optional(),
  email: Joi.string().email().optional(),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).required(),
});

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post(
  '/register',
  validateBody(registerSchema),
  asyncHandler(async (req, res) => {
    const { email, password, name } = req.body;

    const result = await authService.register(email, password, name);

    const response: ApiResponse<typeof result> = {
      success: true,
      data: result,
    };

    res.status(201).json(response);
  })
);

/**
 * POST /api/auth/login
 * Login user
 */
router.post(
  '/login',
  validateBody(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    const response: ApiResponse<typeof result> = {
      success: true,
      data: result,
    };

    res.json(response);
  })
);

/**
 * GET /api/auth/me
 * Get current user
 */
router.get(
  '/me',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const user = await authService.getUserById(req.user!.id);

    const response: ApiResponse<typeof user> = {
      success: true,
      data: user,
    };

    res.json(response);
  })
);

/**
 * PATCH /api/auth/profile
 * Update user profile
 */
router.patch(
  '/profile',
  authenticateToken,
  validateBody(updateProfileSchema),
  asyncHandler(async (req, res) => {
    const user = await authService.updateProfile(req.user!.id, req.body);

    const response: ApiResponse<typeof user> = {
      success: true,
      data: user,
    };

    res.json(response);
  })
);

/**
 * POST /api/auth/change-password
 * Change user password
 */
router.post(
  '/change-password',
  authenticateToken,
  validateBody(changePasswordSchema),
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    await authService.changePassword(req.user!.id, currentPassword, newPassword);

    const response: ApiResponse<{ message: string }> = {
      success: true,
      data: { message: 'Password changed successfully' },
    };

    res.json(response);
  })
);

export default router;

