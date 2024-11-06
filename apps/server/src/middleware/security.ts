/**
 * Security middleware
 */

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

import { config } from '../config/environment';
import { RateLimitError } from '../utils/errors';
import { logSecurityEvent } from '../utils/logger';

/**
 * Helmet security headers
 */
export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

/**
 * Rate limiting middleware
 */
export const rateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT',
      message: 'Too many requests, please try again later',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, _res: Response, _next: NextFunction) => {
    logSecurityEvent('rate_limit_exceeded', undefined, {
      ip: req.ip,
      path: req.path,
    });
    throw new RateLimitError();
  },
});

/**
 * Strict rate limiter for sensitive endpoints
 */
export const strictRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT',
      message: 'Too many requests to sensitive endpoint',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, _res: Response, _next: NextFunction) => {
    logSecurityEvent('strict_rate_limit_exceeded', undefined, {
      ip: req.ip,
      path: req.path,
    });
    throw new RateLimitError('Too many requests to sensitive endpoint');
  },
});

/**
 * Request sanitization middleware
 */
export function sanitizeRequest(req: Request, _res: Response, next: NextFunction): void {
  // Remove any potential XSS from query params
  if (req.query) {
    Object.keys(req.query).forEach((key) => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = (req.query[key] as string)
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .trim();
      }
    });
  }

  // Remove any potential XSS from body
  if (req.body && typeof req.body === 'object') {
    sanitizeObject(req.body);
  }

  next();
}

/**
 * Recursively sanitize object properties
 */
function sanitizeObject(obj: Record<string, unknown>): void {
  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === 'string') {
      obj[key] = (obj[key] as string)
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .trim();
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeObject(obj[key] as Record<string, unknown>);
    }
  });
}

/**
 * API key validation middleware
 */
export function validateApiKey(req: Request, _res: Response, next: NextFunction): void {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    logSecurityEvent('missing_api_key', undefined, {
      ip: req.ip,
      path: req.path,
    });
    throw new Error('API key required');
  }

  // In a real implementation, validate against stored API keys
  // For now, just check it exists
  next();
}

/**
 * CORS preflight handler
 */
export function corsPreflightHandler(req: Request, res: Response, next: NextFunction): void {
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  next();
}

export default {
  helmetMiddleware,
  rateLimiter,
  strictRateLimiter,
  sanitizeRequest,
  validateApiKey,
  corsPreflightHandler,
};

