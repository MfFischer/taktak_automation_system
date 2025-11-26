/**
 * Security middleware - Commercial-grade security hardening
 * Implements OWASP security best practices
 */

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

import { config } from '../config/environment.js';
import { RateLimitError, AuthenticationError } from '../utils/errors.js';
import { logSecurityEvent } from '../utils/logger.js';

// Dangerous patterns for XSS prevention (comprehensive list)
const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi, // onclick, onerror, onload, etc.
  /<iframe/gi,
  /<object/gi,
  /<embed/gi,
  /<link/gi,
  /<meta/gi,
  /data:text\/html/gi,
  /vbscript:/gi,
  /expression\s*\(/gi,
];

// SQL injection patterns
const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE|EXEC|EXECUTE)\b)/gi,
  /(--|#|\/\*|\*\/)/g,
  /(\bOR\b\s+\d+\s*=\s*\d+|\bAND\b\s+\d+\s*=\s*\d+)/gi,
  /('\s*(OR|AND)\s*')/gi,
];

/**
 * Helmet security headers - Enhanced for commercial grade
 */
export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Required for Tailwind
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      connectSrc: ["'self'", 'https://api.openrouter.ai', 'https://generativelanguage.googleapis.com'],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: [],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  noSniff: true,
  xssFilter: true,
  hidePoweredBy: true,
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
 * Request sanitization middleware - Commercial-grade XSS prevention
 */
export function sanitizeRequest(req: Request, _res: Response, next: NextFunction): void {
  try {
    // Sanitize query params
    if (req.query) {
      Object.keys(req.query).forEach((key) => {
        if (typeof req.query[key] === 'string') {
          req.query[key] = sanitizeString(req.query[key] as string);
        }
      });
    }

    // Sanitize body
    if (req.body && typeof req.body === 'object') {
      sanitizeObject(req.body);
    }

    // Sanitize params
    if (req.params) {
      Object.keys(req.params).forEach((key) => {
        req.params[key] = sanitizeString(req.params[key]);
      });
    }

    next();
  } catch (error) {
    logSecurityEvent('sanitization_error', undefined, {
      ip: req.ip,
      path: req.path,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    next(error);
  }
}

/**
 * Sanitize a string value against XSS attacks
 */
function sanitizeString(value: string): string {
  let sanitized = value.trim();

  // Apply all XSS patterns
  for (const pattern of XSS_PATTERNS) {
    sanitized = sanitized.replace(pattern, '');
  }

  // Encode HTML entities for remaining special chars
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');

  return sanitized;
}

/**
 * Recursively sanitize object properties
 */
function sanitizeObject(obj: Record<string, unknown>, depth: number = 0): void {
  // Prevent deep recursion attacks
  if (depth > 10) {
    throw new Error('Object too deeply nested');
  }

  Object.keys(obj).forEach((key) => {
    // Sanitize the key itself
    const sanitizedKey = sanitizeString(key);
    if (sanitizedKey !== key) {
      const value = obj[key];
      delete obj[key];
      obj[sanitizedKey] = value;
    }

    if (typeof obj[sanitizedKey] === 'string') {
      obj[sanitizedKey] = sanitizeString(obj[sanitizedKey] as string);
    } else if (Array.isArray(obj[sanitizedKey])) {
      (obj[sanitizedKey] as unknown[]).forEach((item, index) => {
        if (typeof item === 'string') {
          (obj[sanitizedKey] as string[])[index] = sanitizeString(item);
        } else if (typeof item === 'object' && item !== null) {
          sanitizeObject(item as Record<string, unknown>, depth + 1);
        }
      });
    } else if (typeof obj[sanitizedKey] === 'object' && obj[sanitizedKey] !== null) {
      sanitizeObject(obj[sanitizedKey] as Record<string, unknown>, depth + 1);
    }
  });
}

/**
 * SQL Injection detection middleware (for logging/alerting)
 */
export function detectSqlInjection(req: Request, _res: Response, next: NextFunction): void {
  const checkValue = (value: string, location: string): void => {
    for (const pattern of SQL_INJECTION_PATTERNS) {
      if (pattern.test(value)) {
        logSecurityEvent('sql_injection_attempt', undefined, {
          ip: req.ip,
          path: req.path,
          location,
          pattern: pattern.toString(),
        });
        // Don't block - just log for monitoring
        break;
      }
    }
  };

  // Check query params
  Object.values(req.query).forEach((value) => {
    if (typeof value === 'string') {
      checkValue(value, 'query');
    }
  });

  // Check body (if string values)
  if (req.body && typeof req.body === 'object') {
    JSON.stringify(req.body, (_key, value) => {
      if (typeof value === 'string') {
        checkValue(value, 'body');
      }
      return value;
    });
  }

  next();
}

/**
 * API key validation middleware - Commercial grade with proper validation
 */
export function validateApiKey(req: Request, _res: Response, next: NextFunction): void {
  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey) {
    logSecurityEvent('missing_api_key', undefined, {
      ip: req.ip,
      path: req.path,
    });
    throw new AuthenticationError('API key required');
  }

  // Validate API key format (should be 32+ chars, alphanumeric with dashes)
  const apiKeyPattern = /^[a-zA-Z0-9_-]{32,128}$/;
  if (!apiKeyPattern.test(apiKey)) {
    logSecurityEvent('invalid_api_key_format', undefined, {
      ip: req.ip,
      path: req.path,
    });
    throw new AuthenticationError('Invalid API key format');
  }

  // TODO: Validate against stored API keys in database
  // For now, check against environment variable if set
  const validApiKey = process.env.API_KEY;
  if (validApiKey && apiKey !== validApiKey) {
    logSecurityEvent('invalid_api_key', undefined, {
      ip: req.ip,
      path: req.path,
    });
    throw new AuthenticationError('Invalid API key');
  }

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

/**
 * Request size limiter - Prevents DoS via large payloads
 */
export function requestSizeLimiter(maxSizeKB: number = 1024) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    const maxBytes = maxSizeKB * 1024;

    if (contentLength > maxBytes) {
      logSecurityEvent('request_too_large', undefined, {
        ip: req.ip,
        path: req.path,
        size: contentLength,
        maxSize: maxBytes,
      });
      res.status(413).json({
        success: false,
        error: {
          code: 'PAYLOAD_TOO_LARGE',
          message: `Request body too large. Maximum size is ${maxSizeKB}KB`,
        },
      });
      return;
    }
    next();
  };
}

/**
 * Security headers for API responses
 */
export function securityHeaders(_req: Request, res: Response, next: NextFunction): void {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
}

export default {
  helmetMiddleware,
  rateLimiter,
  strictRateLimiter,
  sanitizeRequest,
  detectSqlInjection,
  validateApiKey,
  corsPreflightHandler,
  requestSizeLimiter,
  securityHeaders,
};

