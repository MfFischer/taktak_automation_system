/**
 * Custom error classes for better error handling
 */

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;

  constructor(message: string, statusCode: number = 500, code?: string, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;

    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, code: string = 'VALIDATION_ERROR') {
    super(message, 400, code);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed', code: string = 'AUTH_ERROR') {
    super(message, 401, code);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions', code: string = 'FORBIDDEN') {
    super(message, 403, code);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource', code: string = 'NOT_FOUND') {
    super(`${resource} not found`, 404, code);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, code: string = 'CONFLICT') {
    super(message, 409, code);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests', code: string = 'RATE_LIMIT') {
    super(message, 429, code);
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message?: string, code: string = 'EXTERNAL_SERVICE_ERROR') {
    super(message || `${service} service error`, 502, code);
  }
}

export class WorkflowExecutionError extends AppError {
  public readonly workflowId?: string;
  public readonly nodeId?: string;

  constructor(
    message: string,
    workflowId?: string,
    nodeId?: string,
    code: string = 'WORKFLOW_EXECUTION_ERROR'
  ) {
    super(message, 500, code);
    this.workflowId = workflowId;
    this.nodeId = nodeId;
  }
}

/**
 * Checks if error is operational (expected) or programming error
 */
export function isOperationalError(error: Error): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}

/**
 * Formats error for API response
 */
export function formatErrorResponse(error: Error) {
  if (error instanceof AppError) {
    return {
      success: false,
      error: {
        code: error.code || 'INTERNAL_ERROR',
        message: error.message,
        ...(error instanceof WorkflowExecutionError && {
          workflowId: error.workflowId,
          nodeId: error.nodeId,
        }),
      },
    };
  }

  // Don't expose internal errors in production
  return {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production' 
        ? 'An internal error occurred' 
        : error.message,
    },
  };
}

export default {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ExternalServiceError,
  WorkflowExecutionError,
  isOperationalError,
  formatErrorResponse,
};

