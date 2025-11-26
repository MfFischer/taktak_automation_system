/**
 * Delay Node Handler
 * Pauses workflow execution for a specified duration
 */

import { WorkflowNode } from '@taktak/types';
import { NodeHandler } from './types';

export class DelayHandler implements NodeHandler {
  async execute(
    node: WorkflowNode,
    context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): Promise<unknown> {
    const { duration, unit } = node.config;

    if (!duration) {
      throw new Error('Duration is required for delay');
    }

    // Resolve duration
    const resolvedDuration = Number(this.resolveValue(duration, context));
    const resolvedUnit = (unit as string) || 'seconds';

    // Convert to milliseconds
    let delayMs = resolvedDuration;
    switch (resolvedUnit) {
      case 'milliseconds':
      case 'ms':
        delayMs = resolvedDuration;
        break;
      case 'seconds':
      case 's':
        delayMs = resolvedDuration * 1000;
        break;
      case 'minutes':
      case 'm':
        delayMs = resolvedDuration * 60 * 1000;
        break;
      case 'hours':
      case 'h':
        delayMs = resolvedDuration * 60 * 60 * 1000;
        break;
      default:
        throw new Error(`Unknown time unit: ${resolvedUnit}`);
    }

    // Wait for the specified duration
    await new Promise(resolve => setTimeout(resolve, delayMs));

    return {
      delayed: true,
      duration: resolvedDuration,
      unit: resolvedUnit,
      delayMs,
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

