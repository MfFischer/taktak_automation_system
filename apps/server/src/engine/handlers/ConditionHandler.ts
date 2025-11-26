/**
 * Condition Node Handler
 * Evaluates conditions and returns true/false
 */

import { WorkflowNode } from '@taktak/types';
import { NodeHandler } from './types';

export class ConditionHandler implements NodeHandler {
  async execute(
    node: WorkflowNode,
    context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): Promise<unknown> {
    const { leftValue, operator, rightValue } = node.config;

    if (!operator) {
      throw new Error('Operator is required for condition');
    }

    // Resolve values
    const left = this.resolveValue(leftValue, context);
    const right = this.resolveValue(rightValue, context);

    // Evaluate condition
    let result = false;
    switch (operator) {
      case '==':
      case 'equals':
        result = left == right;
        break;
      case '===':
      case 'strictEquals':
        result = left === right;
        break;
      case '!=':
      case 'notEquals':
        result = left != right;
        break;
      case '!==':
      case 'strictNotEquals':
        result = left !== right;
        break;
      case '>':
      case 'greaterThan':
        result = (left as number) > (right as number);
        break;
      case '>=':
      case 'greaterThanOrEqual':
        result = (left as number) >= (right as number);
        break;
      case '<':
      case 'lessThan':
        result = (left as number) < (right as number);
        break;
      case '<=':
      case 'lessThanOrEqual':
        result = (left as number) <= (right as number);
        break;
      case 'contains':
        result = String(left).includes(String(right));
        break;
      case 'startsWith':
        result = String(left).startsWith(String(right));
        break;
      case 'endsWith':
        result = String(left).endsWith(String(right));
        break;
      case 'isEmpty':
        result = !left || (Array.isArray(left) && left.length === 0) || (typeof left === 'string' && left.trim() === '');
        break;
      case 'isNotEmpty':
        result = !!left && (!Array.isArray(left) || left.length > 0) && (typeof left !== 'string' || left.trim() !== '');
        break;
      default:
        throw new Error(`Unknown operator: ${operator}`);
    }

    return { result, leftValue: left, rightValue: right, operator };
  }

  private resolveValue(value: unknown, context: { input: Record<string, unknown>; variables: Record<string, unknown> }): unknown {
    if (typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}')) {
      const key = value.slice(2, -2).trim();
      return context.variables[key] ?? context.input[key] ?? value;
    }
    return value;
  }
}

