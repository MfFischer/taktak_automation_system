/**
 * Twilio Node Handler
 */

import { WorkflowNode } from '@taktak/types';
import { NodeHandler } from './types';
import { TwilioIntegration } from '../../integrations/twilio/TwilioIntegration';

export class TwilioHandler implements NodeHandler {
  async execute(
    node: WorkflowNode,
    context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): Promise<unknown> {
    // Extract credentials from node config
    const { accountSid, authToken } = node.config;

    if (!accountSid || !authToken) {
      throw new Error('Twilio Account SID and Auth Token are required');
    }

    // Create integration instance
    const integration = new TwilioIntegration({
      username: accountSid as string,
      password: authToken as string,
    });

    // Execute the operation
    return integration.execute(node, context);
  }
}

