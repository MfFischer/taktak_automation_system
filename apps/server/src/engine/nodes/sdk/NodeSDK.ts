/**
 * Node Development SDK
 * Provides utilities and base classes for creating custom workflow nodes
 */

import { WorkflowNode } from '@taktak/types';
import { ValidationError } from '../../../utils/errors';
import { logger } from '../../../utils/logger';

/**
 * Context passed to node execution
 */
export interface NodeContext {
  input: Record<string, unknown>;
  variables: Record<string, unknown>;
  workflowId?: string;
  executionId?: string;
}

/**
 * Result of node execution
 */
export interface NodeExecutionResult {
  success: boolean;
  data?: unknown;
  error?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Base class for all node handlers
 */
export abstract class BaseNodeHandler {
  /**
   * Execute the node
   */
  abstract execute(node: WorkflowNode, context: NodeContext): Promise<unknown>;

  /**
   * Validate node configuration
   */
  validate(node: WorkflowNode): void {
    if (!node.id) {
      throw new ValidationError('Node must have an id');
    }
    if (!node.name) {
      throw new ValidationError('Node must have a name');
    }
    if (!node.type) {
      throw new ValidationError('Node must have a type');
    }
  }

  /**
   * Resolve expression from context
   */
  protected resolveExpression(expression: string, context: NodeContext): unknown {
    if (!expression || typeof expression !== 'string') {
      return expression;
    }

    // Check if it's an expression ({{...}})
    const expressionMatch = expression.match(/^\{\{(.+)\}\}$/);
    if (!expressionMatch) {
      return expression;
    }

    const path = expressionMatch[1].trim();

    // Handle special variables
    if (path.startsWith('$json.')) {
      const key = path.substring(6);
      return this.getNestedValue(context.input, key);
    }

    if (path.startsWith('$node.')) {
      const key = path.substring(6);
      return this.getNestedValue(context.variables, key);
    }

    if (path.startsWith('$')) {
      return context.variables[path];
    }

    // Default: try to get from variables
    return context.variables[path];
  }

  /**
   * Get nested value from object using dot notation
   */
  protected getNestedValue(obj: any, path: string): unknown {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Set nested value in object using dot notation
   */
  protected setNestedValue(obj: any, path: string, value: unknown): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
      if (!current[key]) {
        current[key] = {};
      }
      return current[key];
    }, obj);
    target[lastKey] = value;
  }

  /**
   * Log node execution
   */
  protected log(level: 'info' | 'warn' | 'error', message: string, nodeId?: string): void {
    logger[level](message, { nodeId });
  }

  /**
   * Validate required fields in config
   */
  protected validateRequired(config: any, fields: string[]): void {
    for (const field of fields) {
      if (config[field] === undefined || config[field] === null || config[field] === '') {
        throw new ValidationError(`Required field missing: ${field}`);
      }
    }
  }

  /**
   * Validate field type
   */
  protected validateType(value: unknown, expectedType: string, fieldName: string): void {
    const actualType = Array.isArray(value) ? 'array' : typeof value;
    if (actualType !== expectedType) {
      throw new ValidationError(
        `Invalid type for ${fieldName}: expected ${expectedType}, got ${actualType}`
      );
    }
  }

  /**
   * Safe JSON parse
   */
  protected safeJsonParse(value: string, defaultValue: any = null): any {
    try {
      return JSON.parse(value);
    } catch {
      return defaultValue;
    }
  }

  /**
   * Format error for user display
   */
  protected formatError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }

  /**
   * Retry with exponential backoff
   */
  protected async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt < maxRetries) {
          const delay = initialDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError!;
  }
}

