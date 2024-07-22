/**
 * SMS node handler
 * Sends SMS messages via Twilio
 */

import twilio from 'twilio';

import { WorkflowNode, SMSNodeConfig } from '@taktak/types';
import { NodeHandler } from '../nodeExecutor';
import { config } from '../../config/environment';
import { logger } from '../../utils/logger';
import { ExternalServiceError } from '../../utils/errors';
import { SettingsService } from '../../services/settingsService';

export class SMSNodeHandler implements NodeHandler {
  private settingsService = new SettingsService();

  async execute(
    node: WorkflowNode,
    context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): Promise<unknown> {
    const nodeConfig = node.config as SMSNodeConfig;

    // Get Twilio credentials
    const accountSid = config.services.twilio.accountSid;
    const authToken = config.services.twilio.authToken || (await this.settingsService.getApiKey('twilio'));
    const fromNumber = config.services.twilio.phoneNumber || nodeConfig.from;

    if (!accountSid || !authToken || !fromNumber) {
      throw new ExternalServiceError('Twilio', 'Twilio credentials not configured');
    }

    // Replace template variables in message
    const to = this.replaceVariables(nodeConfig.to, context);
    const message = this.replaceVariables(nodeConfig.message, context);

    logger.info('Sending SMS', {
      nodeId: node.id,
      to,
      messageLength: message.length,
    });

    try {
      const client = twilio(accountSid, authToken);

      const result = await client.messages.create({
        body: message,
        from: fromNumber,
        to,
      });

      logger.info('SMS sent successfully', {
        nodeId: node.id,
        messageSid: result.sid,
        status: result.status,
      });

      return {
        success: true,
        messageSid: result.sid,
        status: result.status,
        to,
      };
    } catch (error) {
      logger.error('Failed to send SMS', {
        nodeId: node.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw new ExternalServiceError('Twilio', error instanceof Error ? error.message : undefined);
    }
  }

  /**
   * Replaces template variables in string
   */
  private replaceVariables(
    template: string,
    context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      return String(context.variables[key] || context.input[key] || '');
    });
  }
}

