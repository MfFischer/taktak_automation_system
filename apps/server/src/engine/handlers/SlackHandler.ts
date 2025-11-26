/**
 * Slack Node Handler
 */

import { WorkflowNode } from '@taktak/types';
import { NodeHandler } from '../nodeExecutor';
import { SlackIntegration } from '../../integrations/slack/SlackIntegration';
import { logger } from '../../utils/logger';

export class SlackHandler implements NodeHandler {
  async execute(
    node: WorkflowNode,
    context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): Promise<unknown> {
    logger.info('Executing Slack node', { nodeId: node.id });

    // Get credentials from node config or context
    const credentials = {
      accessToken: (node.config.accessToken as string) || (context.variables.$credentials as any)?.slackAccessToken as string,
    };

    if (!credentials.accessToken) {
      throw new Error('Slack access token is required');
    }

    const integration = new SlackIntegration(credentials);
    return integration.execute(node, context);
  }
}

