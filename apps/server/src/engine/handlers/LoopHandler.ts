/**
 * Loop Node Handler
 * Iterates over arrays or ranges
 */

import { WorkflowNode } from '@taktak/types';
import { NodeHandler } from './types';

export class LoopHandler implements NodeHandler {
  async execute(
    node: WorkflowNode,
    context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): Promise<unknown> {
    const { loopType, items, start, end, step } = node.config;

    if (!loopType) {
      throw new Error('Loop type is required');
    }

    const results: unknown[] = [];

    if (loopType === 'forEach') {
      // Loop over array items
      const resolvedItems = this.resolveValue(items, context);
      if (!Array.isArray(resolvedItems)) {
        throw new Error('Items must be an array for forEach loop');
      }

      for (let i = 0; i < resolvedItems.length; i++) {
        results.push({
          index: i,
          item: resolvedItems[i],
          isFirst: i === 0,
          isLast: i === resolvedItems.length - 1,
        });
      }
    } else if (loopType === 'range') {
      // Loop over numeric range
      const startNum = Number(this.resolveValue(start, context) || 0);
      const endNum = Number(this.resolveValue(end, context) || 10);
      const stepNum = Number(this.resolveValue(step, context) || 1);

      for (let i = startNum; i < endNum; i += stepNum) {
        results.push({
          index: i,
          value: i,
          isFirst: i === startNum,
          isLast: i + stepNum >= endNum,
        });
      }
    } else {
      throw new Error(`Unknown loop type: ${loopType}`);
    }

    return {
      iterations: results.length,
      results,
    };
  }

  private resolveValue(value: unknown, context: { input: Record<string, unknown>; variables: Record<string, unknown> }): unknown {
    if (typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}')) {
      const key = value.slice(2, -2).trim();
      return context.variables[key] ?? context.input[key] ?? value;
    }
    return value;
  }
}

