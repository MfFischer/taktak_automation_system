/**
 * Email node handler
 * Sends emails via SMTP
 */

import nodemailer from 'nodemailer';

import { WorkflowNode, EmailNodeConfig } from '@taktak/types';
import { NodeHandler } from '../nodeExecutor';
import { config } from '../../config/environment';
import { logger } from '../../utils/logger';
import { ExternalServiceError } from '../../utils/errors';
import { SettingsService } from '../../services/settingsService';

export class EmailNodeHandler implements NodeHandler {
  private settingsService = new SettingsService();

  async execute(
    node: WorkflowNode,
    context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): Promise<unknown> {
    const nodeConfig = node.config as EmailNodeConfig;

    // Get SMTP credentials
    const smtpPassword = config.services.smtp.password || (await this.settingsService.getApiKey('smtp'));

    if (!config.services.smtp.user || !smtpPassword) {
      throw new ExternalServiceError('SMTP', 'SMTP credentials not configured');
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: config.services.smtp.host,
      port: config.services.smtp.port,
      secure: config.services.smtp.secure,
      auth: {
        user: config.services.smtp.user,
        pass: smtpPassword,
      },
    });

    // Replace template variables
    const to = this.replaceVariables(String(nodeConfig.to), context);
    const subject = this.replaceVariables(nodeConfig.subject, context);
    const body = this.replaceVariables(nodeConfig.body, context);

    logger.info('Sending email', {
      nodeId: node.id,
      to,
      subject,
    });

    try {
      const info = await transporter.sendMail({
        from: config.services.smtp.user,
        to,
        cc: nodeConfig.cc,
        bcc: nodeConfig.bcc,
        subject,
        text: nodeConfig.html ? undefined : body,
        html: nodeConfig.html ? body : undefined,
        attachments: nodeConfig.attachments,
      });

      logger.info('Email sent successfully', {
        nodeId: node.id,
        messageId: info.messageId,
      });

      return {
        success: true,
        messageId: info.messageId,
        to,
        subject,
      };
    } catch (error) {
      logger.error('Failed to send email', {
        nodeId: node.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw new ExternalServiceError('SMTP', error instanceof Error ? error.message : undefined);
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

