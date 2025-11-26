/**
 * Transform Node Handler
 * Transforms data using JavaScript expressions
 */

import { WorkflowNode } from '@taktak/types';
import { NodeHandler } from './types';

export class TransformHandler implements NodeHandler {
  async execute(
    node: WorkflowNode,
    context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): Promise<unknown> {
    const { transformations } = node.config;

    if (!transformations || !Array.isArray(transformations)) {
      throw new Error('Transformations array is required');
    }

    const result: Record<string, unknown> = {};

    for (const transformation of transformations) {
      const { outputKey, expression } = transformation as { outputKey: string; expression: string };

      if (!outputKey || !expression) {
        continue;
      }

      // Resolve the expression
      const resolvedValue = this.evaluateExpression(expression, context);
      result[outputKey] = resolvedValue;
    }

    return result;
  }

  private evaluateExpression(expression: string, context: { input: Record<string, unknown>; variables: Record<string, unknown> }): unknown {
    // Simple variable replacement
    if (expression.startsWith('{{') && expression.endsWith('}}')) {
      const key = expression.slice(2, -2).trim();
      return context.variables[key] ?? context.input[key] ?? expression;
    }

    // Try to evaluate as JSON
    try {
      return JSON.parse(expression);
    } catch {
      // Return as string if not valid JSON
      return expression;
    }
  }
}

