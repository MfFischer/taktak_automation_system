/**
 * Notion Node Handler
 */

import { WorkflowNode } from '@taktak/types';
import { NodeHandler } from '../nodeExecutor';
import { NotionIntegration } from '../../integrations/notion/NotionIntegration';
import { logger } from '../../utils/logger';

export class NotionHandler implements NodeHandler {
  async execute(
    node: WorkflowNode,
    context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): Promise<unknown> {
    logger.info('Executing Notion node', { nodeId: node.id });

    // Get credentials from node config or context
    const credentials = {
      apiKey: (node.config.apiKey as string) || (context.variables.$credentials as any)?.notionApiKey as string,
    };

    if (!credentials.apiKey) {
      throw new Error('Notion API key is required');
    }

    const integration = new NotionIntegration(
      { name: 'notion', authType: 'API_KEY' as any },
      credentials
    );

    return integration.execute(node, context);
  }
}

