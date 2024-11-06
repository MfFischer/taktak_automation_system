/**
 * Request validation middleware using Joi
 */

import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

import { ValidationError } from '../utils/errors';

/**
 * Validates request body against Joi schema
 */
export function validateBody(schema: Joi.ObjectSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((detail) => detail.message).join(', ');
      throw new ValidationError(messages);
    }

    req.body = value;
    next();
  };
}

/**
 * Validates request query params against Joi schema
 */
export function validateQuery(schema: Joi.ObjectSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((detail) => detail.message).join(', ');
      throw new ValidationError(messages);
    }

    req.query = value;
    next();
  };
}

/**
 * Validates request params against Joi schema
 */
export function validateParams(schema: Joi.ObjectSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((detail) => detail.message).join(', ');
      throw new ValidationError(messages);
    }

    req.params = value;
    next();
  };
}

// Common validation schemas
export const commonSchemas = {
  id: Joi.string().required().min(1),
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  }),
  dateRange: Joi.object({
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')),
  }),
};

export default {
  validateBody,
  validateQuery,
  validateParams,
  commonSchemas,
};

