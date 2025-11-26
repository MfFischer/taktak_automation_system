/**
 * Gmail Integration
 * Supports sending and receiving emails
 */

import { google } from 'googleapis';
import { WorkflowNode } from '@taktak/types';
import { BaseIntegration, AuthType, IntegrationConfig, AuthCredentials } from '../base/BaseIntegration';

export class GmailIntegration extends BaseIntegration {
  private gmail: any = null;

  constructor(config: IntegrationConfig, credentials: AuthCredentials) {
    super(config, credentials);
    this.config.authType = AuthType.OAUTH2;
  }

  protected async testConnection(): Promise<void> {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: this.credentials.accessToken });
    this.gmail = google.gmail({ version: 'v1', auth });
    await this.gmail.users.getProfile({ userId: 'me' });
  }

  async execute(
    node: WorkflowNode,
    _context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): Promise<unknown> {
    if (!this.gmail) {
      const auth = new google.auth.OAuth2();
      auth.setCredentials({ access_token: this.credentials.accessToken });
      this.gmail = google.gmail({ version: 'v1', auth });
    }

    const { operation } = node.config;

    switch (operation) {
      case 'sendEmail':
        return this.sendEmail(node.config);
      case 'listEmails':
        return this.listEmails(node.config);
      case 'getEmail':
        return this.getEmail(node.config);
      case 'deleteEmail':
        return this.deleteEmail(node.config);
      case 'markAsRead':
        return this.markAsRead(node.config);
      default:
        throw new Error(`Unknown Gmail operation: ${operation}`);
    }
  }

  private async sendEmail(config: Record<string, unknown>): Promise<unknown> {
    const { to, subject, body, cc, bcc } = config;
    
    const email = [
      `To: ${to}`,
      cc ? `Cc: ${cc}` : '',
      bcc ? `Bcc: ${bcc}` : '',
      `Subject: ${subject}`,
      '',
      body,
    ].filter(Boolean).join('\n');

    const encodedEmail = Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');

    const response = await this.gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedEmail,
      },
    });

    return response.data;
  }

  private async listEmails(config: Record<string, unknown>): Promise<unknown> {
    const { query, maxResults } = config;
    
    const response = await this.gmail.users.messages.list({
      userId: 'me',
      q: query as string,
      maxResults: (maxResults as number) || 10,
    });

    return response.data;
  }

  private async getEmail(config: Record<string, unknown>): Promise<unknown> {
    const { messageId } = config;
    
    const response = await this.gmail.users.messages.get({
      userId: 'me',
      id: messageId as string,
    });

    return response.data;
  }

  private async deleteEmail(config: Record<string, unknown>): Promise<unknown> {
    const { messageId } = config;
    
    const response = await this.gmail.users.messages.delete({
      userId: 'me',
      id: messageId as string,
    });

    return response.data;
  }

  private async markAsRead(config: Record<string, unknown>): Promise<unknown> {
    const { messageId } = config;
    
    const response = await this.gmail.users.messages.modify({
      userId: 'me',
      id: messageId as string,
      requestBody: {
        removeLabelIds: ['UNREAD'],
      },
    });

    return response.data;
  }
}

