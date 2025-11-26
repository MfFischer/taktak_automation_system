/**
 * Webhook Trigger Handler
 * Triggers workflows via HTTP webhooks
 */

import { WorkflowNode } from '@taktak/types';
import { NodeHandler } from './types';

export class WebhookHandler implements NodeHandler {
  async execute(
    node: WorkflowNode,
    context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): Promise<unknown> {
    const { method, path } = node.config;

    // Return webhook information
    // In a real implementation, this would register a webhook endpoint
    return {
      triggered: true,
      method: method || 'POST',
      path: path || '/webhook',
      timestamp: new Date().toISOString(),
      payload: context.input,
      message: 'Webhook trigger executed',
    };
  }
}

