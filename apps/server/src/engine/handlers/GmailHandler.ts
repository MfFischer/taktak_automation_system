/**
 * Gmail Node Handler
 */

import { WorkflowNode } from '@taktak/types';
import { NodeHandler } from '../nodeExecutor';
import { GmailIntegration } from '../../integrations/google/GmailIntegration';
import { logger } from '../../utils/logger';

export class GmailHandler implements NodeHandler {
  async execute(
    node: WorkflowNode,
    context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): Promise<unknown> {
    logger.info('Executing Gmail node', { nodeId: node.id });

    const credentials = {
      accessToken: (node.config.accessToken as string) || (context.variables.$credentials as any)?.googleAccessToken as string,
    };

    if (!credentials.accessToken) {
      throw new Error('Google access token is required');
    }

    const integration = new GmailIntegration(
      { name: 'gmail', authType: 'OAUTH2' as any },
      credentials
    );

    return integration.execute(node, context);
  }
}

