/**
 * Send SMS Node Handler
 * Uses Twilio integration
 */

import { WorkflowNode } from '@taktak/types';
import { NodeHandler } from './types';
import { TwilioIntegration } from '../../integrations/twilio/TwilioIntegration';

export class SendSMSHandler implements NodeHandler {
  async execute(
    node: WorkflowNode,
    context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): Promise<unknown> {
    // Extract credentials from node config
    const { accountSid, authToken, to, from, body } = node.config;

    if (!accountSid || !authToken) {
      throw new Error('Twilio Account SID and Auth Token are required for SMS');
    }

    // Create Twilio integration instance
    const integration = new TwilioIntegration({
      username: accountSid as string,
      password: authToken as string,
    });

    // Create a modified node config for sendSMS operation
    const smsNode: WorkflowNode = {
      ...node,
      config: {
        ...node.config,
        operation: 'sendSMS',
        to,
        from,
        body,
      },
    };

    // Execute the SMS operation
    return integration.execute(smsNode, context);
  }
}

