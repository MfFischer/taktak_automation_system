/**
 * Authentication middleware
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { config } from '../config/environment';
import { AuthenticationError } from '../utils/errors';
import { logger } from '../utils/logger';
import { UserTier, UsageStats } from '../services/authService';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  tier: UserTier;
  usageStats: UsageStats;
  role?: 'admin' | 'user';
  createdAt?: string;
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/**
 * Middleware to verify JWT token
 */
export function authenticateToken(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw new AuthenticationError('No token provided');
    }

    const decoded = jwt.verify(token, config.security.jwtSecret) as AuthUser;
    req.user = decoded;

    logger.debug('User authenticated', {
      userId: decoded.id,
      email: decoded.email,
    });

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('Invalid token', { error: error.message });
      next(new AuthenticationError('Invalid token'));
    } else if (error instanceof jwt.TokenExpiredError) {
      logger.warn('Token expired');
      next(new AuthenticationError('Token expired'));
    } else {
      next(error);
    }
  }
}

/**
 * Optional authentication - doesn't fail if no token
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, config.security.jwtSecret) as AuthUser;
      req.user = decoded;
    }

    next();
  } catch (error) {
    // Ignore auth errors for optional auth
    next();
  }
}

/**
 * Generate JWT token
 */
export function generateToken(user: AuthUser): string {
  return jwt.sign(user, config.security.jwtSecret, {
    expiresIn: '7d',
  });
}

/**
 * Verify and decode token without throwing
 */
export function verifyToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, config.security.jwtSecret) as AuthUser;
  } catch {
    return null;
  }
}

