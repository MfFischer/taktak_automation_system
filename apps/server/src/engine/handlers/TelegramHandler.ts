/**
 * Telegram Node Handler
 */

import { WorkflowNode } from '@taktak/types';
import { NodeHandler } from './types';
import { TelegramIntegration } from '../../integrations/telegram/TelegramIntegration';

export class TelegramHandler implements NodeHandler {
  async execute(
    node: WorkflowNode,
    context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): Promise<unknown> {
    // Extract credentials from node config
    const { apiKey } = node.config;

    if (!apiKey) {
      throw new Error('Telegram bot token is required');
    }

    // Create integration instance
    const integration = new TelegramIntegration({ apiKey: apiKey as string });

    // Execute the operation
    return integration.execute(node, context);
  }
}

