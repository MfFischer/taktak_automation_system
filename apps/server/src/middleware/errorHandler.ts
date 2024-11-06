/**
 * Global error handling middleware
 */

import { Request, Response, NextFunction } from 'express';

import { AppError, isOperationalError, formatErrorResponse } from '../utils/errors';
import { logger } from '../utils/logger';

/**
 * Express error handler middleware
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log error
  if (error instanceof AppError) {
    if (error.statusCode >= 500) {
      logger.error('Server error', {
        error: error.message,
        stack: error.stack,
        code: error.code,
        path: req.path,
        method: req.method,
      });
    } else {
      logger.warn('Client error', {
        error: error.message,
        code: error.code,
        path: req.path,
        method: req.method,
      });
    }
  } else {
    logger.error('Unexpected error', {
      error: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method,
    });
  }

  // Send response
  const statusCode = error instanceof AppError ? error.statusCode : 500;
  const response = formatErrorResponse(error);

  res.status(statusCode).json(response);
}

/**
 * Handles 404 errors
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
}

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Process uncaught exceptions and unhandled rejections
 */
export function setupProcessErrorHandlers(): void {
  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception', {
      error: error.message,
      stack: error.stack,
    });

    // Exit if it's not an operational error
    if (!isOperationalError(error)) {
      process.exit(1);
    }
  });

  process.on('unhandledRejection', (reason: unknown) => {
    logger.error('Unhandled Rejection', {
      reason: reason instanceof Error ? reason.message : String(reason),
      stack: reason instanceof Error ? reason.stack : undefined,
    });

    // Exit if it's not an operational error
    if (reason instanceof Error && !isOperationalError(reason)) {
      process.exit(1);
    }
  });

  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    process.exit(0);
  });

  process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    process.exit(0);
  });
}

export default {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  setupProcessErrorHandlers,
};

