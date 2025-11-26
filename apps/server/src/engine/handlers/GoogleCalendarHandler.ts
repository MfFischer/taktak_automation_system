/**
 * Google Calendar Node Handler
 */

import { WorkflowNode } from '@taktak/types';
import { NodeHandler } from '../nodeExecutor';
import { GoogleCalendarIntegration } from '../../integrations/google/GoogleCalendarIntegration';
import { logger } from '../../utils/logger';

export class GoogleCalendarHandler implements NodeHandler {
  async execute(
    node: WorkflowNode,
    context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): Promise<unknown> {
    logger.info('Executing Google Calendar node', { nodeId: node.id });

    const credentials = {
      accessToken: (node.config.accessToken as string) || (context.variables.$credentials as any)?.googleAccessToken as string,
    };

    if (!credentials.accessToken) {
      throw new Error('Google access token is required');
    }

    const integration = new GoogleCalendarIntegration(
      { name: 'google_calendar', authType: 'OAUTH2' as any },
      credentials
    );

    return integration.execute(node, context);
  }
}

