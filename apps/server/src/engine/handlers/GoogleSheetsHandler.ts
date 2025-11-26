/**
 * Google Sheets Node Handler
 */

import { WorkflowNode } from '@taktak/types';
import { NodeHandler } from '../nodeExecutor';
import { GoogleSheetsIntegration } from '../../integrations/google/GoogleSheetsIntegration';
import { logger } from '../../utils/logger';

export class GoogleSheetsHandler implements NodeHandler {
  async execute(
    node: WorkflowNode,
    context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): Promise<unknown> {
    logger.info('Executing Google Sheets node', { nodeId: node.id });

    // Get credentials from node config or context
    const credentials = {
      accessToken: (node.config.accessToken as string) || (context.variables.$credentials as any)?.googleAccessToken as string,
    };

    if (!credentials.accessToken) {
      throw new Error('Google Sheets access token is required');
    }

    const integration = new GoogleSheetsIntegration(credentials);
    return integration.execute(node, context);
  }
}

