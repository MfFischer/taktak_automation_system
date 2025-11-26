/**
 * Airtable Node Handler
 */

import { WorkflowNode } from '@taktak/types';
import { NodeHandler } from '../nodeExecutor';
import { AirtableIntegration } from '../../integrations/airtable/AirtableIntegration';
import { logger } from '../../utils/logger';

export class AirtableHandler implements NodeHandler {
  async execute(
    node: WorkflowNode,
    context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): Promise<unknown> {
    logger.info('Executing Airtable node', { nodeId: node.id });

    const credentials = {
      apiKey: (node.config.apiKey as string) || (context.variables.$credentials as any)?.airtableApiKey as string,
    };

    if (!credentials.apiKey) {
      throw new Error('Airtable API key is required');
    }

    const integration = new AirtableIntegration(
      { name: 'airtable', authType: 'API_KEY' as any, baseId: node.config.baseId as string },
      credentials
    );

    return integration.execute(node, context);
  }
}

