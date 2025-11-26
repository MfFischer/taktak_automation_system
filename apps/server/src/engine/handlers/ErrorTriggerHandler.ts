/**
 * Error Trigger Handler
 * Triggers workflows when errors occur in other workflows
 */

import { WorkflowNode } from '@taktak/types';
import { NodeHandler } from './types';

export class ErrorTriggerHandler implements NodeHandler {
  async execute(
    node: WorkflowNode,
    context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): Promise<unknown> {
    const { workflowId, errorType } = node.config;

    // Return error trigger information
    // In a real implementation, this would set up error listeners for other workflows
    return {
      triggered: true,
      workflowId: workflowId || 'any',
      errorType: errorType || 'all',
      timestamp: new Date().toISOString(),
      error: context.input,
      message: 'Error trigger executed',
    };
  }
}

