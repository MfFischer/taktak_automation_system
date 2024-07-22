/**
 * Webhook node handler
 * Handles incoming webhook requests (trigger node)
 */

import { WorkflowNode } from '@taktak/types';

import { NodeHandler } from '../nodeExecutor';
import { logger } from '../../utils/logger';

export class WebhookNodeHandler implements NodeHandler {
  async execute(
    node: WorkflowNode,
    context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): Promise<unknown> {
    logger.info('Webhook node triggered', {
      nodeId: node.id,
      hasInput: Object.keys(context.input).length > 0,
    });

    // Webhook nodes are triggers - they pass through the incoming request data
    // The actual webhook endpoint is handled by the API route
    return {
      triggered: true,
      timestamp: new Date().toISOString(),
      data: context.input,
    };
  }
}

