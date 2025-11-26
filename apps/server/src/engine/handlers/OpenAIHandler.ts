/**
 * OpenAI Node Handler
 */

import { WorkflowNode } from '@taktak/types';
import { NodeHandler } from '../nodeExecutor';
import { OpenAIIntegration } from '../../integrations/openai/OpenAIIntegration';
import { logger } from '../../utils/logger';

export class OpenAIHandler implements NodeHandler {
  async execute(
    node: WorkflowNode,
    context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): Promise<unknown> {
    logger.info('Executing OpenAI node', { nodeId: node.id });

    // Get credentials from node config or context
    const credentials = {
      apiKey: (node.config.apiKey as string) || (context.variables.$credentials as any)?.openaiApiKey as string,
    };

    if (!credentials.apiKey) {
      throw new Error('OpenAI API key is required');
    }

    const integration = new OpenAIIntegration(credentials);
    return integration.execute(node, context);
  }
}

