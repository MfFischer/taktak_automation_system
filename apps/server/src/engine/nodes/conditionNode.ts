/**
 * Condition node handler
 * Evaluates conditions for branching logic
 */

import { WorkflowNode, ConditionNodeConfig } from '@taktak/types';

import { NodeHandler } from '../nodeExecutor';
import { logger } from '../../utils/logger';

export class ConditionNodeHandler implements NodeHandler {
  async execute(
    node: WorkflowNode,
    context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): Promise<unknown> {
    const config = node.config as unknown as ConditionNodeConfig;

    logger.info('Evaluating conditions', {
      nodeId: node.id,
      conditionCount: config.conditions.length,
      logic: config.logic,
    });

    const results = config.conditions.map((condition) => {
      const value = this.getValue(condition.field, context);
      return this.evaluateCondition(value, condition.operator, condition.value);
    });

    const result = config.logic === 'and' ? results.every((r) => r) : results.some((r) => r);

    logger.info('Condition evaluation completed', {
      nodeId: node.id,
      result,
    });

    return {
      conditionMet: result,
      results,
    };
  }

  /**
   * Gets value from context by field path
   */
  private getValue(
    field: string,
    context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): unknown {
    // Support dot notation: "user.email"
    const parts = field.split('.');
    let value: unknown = context.variables[parts[0]] || context.input[parts[0]];

    for (let i = 1; i < parts.length; i++) {
      if (value && typeof value === 'object') {
        value = (value as Record<string, unknown>)[parts[i]];
      } else {
        return undefined;
      }
    }

    return value;
  }

  /**
   * Evaluates a single condition
   */
  private evaluateCondition(
    value: unknown,
    operator: ConditionNodeConfig['conditions'][0]['operator'],
    expected: unknown
  ): boolean {
    switch (operator) {
      case 'eq':
        return value === expected;
      case 'ne':
        return value !== expected;
      case 'gt':
        return Number(value) > Number(expected);
      case 'gte':
        return Number(value) >= Number(expected);
      case 'lt':
        return Number(value) < Number(expected);
      case 'lte':
        return Number(value) <= Number(expected);
      case 'contains':
        return String(value).includes(String(expected));
      case 'regex':
        return new RegExp(String(expected)).test(String(value));
      default:
        return false;
    }
  }
}

