/**
 * Discord Node Handler
 */

import { WorkflowNode } from '@taktak/types';
import { NodeHandler } from './types';
import { DiscordIntegration } from '../../integrations/discord/DiscordIntegration';

export class DiscordHandler implements NodeHandler {
  async execute(
    node: WorkflowNode,
    context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): Promise<unknown> {
    // Extract credentials from node config
    const { apiKey } = node.config;

    if (!apiKey) {
      throw new Error('Discord API key (bot token) is required');
    }

    // Create integration instance
    const integration = new DiscordIntegration({ apiKey: apiKey as string });

    // Execute the operation
    return integration.execute(node, context);
  }
}

