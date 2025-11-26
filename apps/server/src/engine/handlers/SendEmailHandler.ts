/**
 * Send Email Node Handler
 * Uses Gmail integration
 */

import { WorkflowNode } from '@taktak/types';
import { NodeHandler } from './types.js';
import { GmailIntegration } from '../../integrations/google/GmailIntegration.js';
import { AuthType } from '../../integrations/base/BaseIntegration.js';

export class SendEmailHandler implements NodeHandler {
  async execute(
    node: WorkflowNode,
    context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): Promise<unknown> {
    // Extract credentials from node config
    const { accessToken, to, subject, body } = node.config;

    if (!accessToken) {
      throw new Error('Gmail access token is required for sending email');
    }

    // Create Gmail integration instance with proper config and credentials
    const integration = new GmailIntegration(
      { name: 'gmail', authType: AuthType.OAUTH2 },
      { accessToken: accessToken as string }
    );

    // Create a modified node config for sendEmail operation
    const emailNode: WorkflowNode = {
      ...node,
      config: {
        ...node.config,
        operation: 'sendEmail',
        to,
        subject,
        body,
      },
    };

    // Execute the email operation
    return integration.execute(emailNode, context);
  }
}

