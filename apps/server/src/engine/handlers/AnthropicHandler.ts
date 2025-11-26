/**
 * Anthropic Node Handler
 */

import { WorkflowNode } from '@taktak/types';
import { NodeHandler } from './types';
import { AnthropicIntegration } from '../../integrations/anthropic/AnthropicIntegration';

export class AnthropicHandler implements NodeHandler {
  async execute(
    node: WorkflowNode,
    context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): Promise<unknown> {
    // Extract credentials from node config
    const { apiKey } = node.config;

    if (!apiKey) {
      throw new Error('Anthropic API key is required');
    }

    // Create integration instance
    const integration = new AnthropicIntegration({ apiKey: apiKey as string });

    // Execute the operation
    return integration.execute(node, context);
  }
}

