/**
 * Trello Node Handler
 */

import { WorkflowNode } from '@taktak/types';
import { NodeHandler } from './types';
import { TrelloIntegration } from '../../integrations/trello/TrelloIntegration';

export class TrelloHandler implements NodeHandler {
  async execute(
    node: WorkflowNode,
    context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): Promise<unknown> {
    // Extract credentials from node config
    const { apiKey, token } = node.config;

    if (!apiKey || !token) {
      throw new Error('Trello API key and token are required');
    }

    // Create integration instance
    const integration = new TrelloIntegration({
      apiKey: apiKey as string,
      accessToken: token as string,
    });

    // Execute the operation
    return integration.execute(node, context);
  }
}

