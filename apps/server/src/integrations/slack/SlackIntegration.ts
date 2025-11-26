/**
 * Slack Integration
 * Supports sending messages, managing channels, and webhooks
 */

import { WorkflowNode } from '@taktak/types';
import { BaseIntegration, AuthType, IntegrationConfig, AuthCredentials } from '../base/BaseIntegration';
import { logger } from '../../utils/logger';

export class SlackIntegration extends BaseIntegration {
  constructor(credentials: AuthCredentials) {
    const config: IntegrationConfig = {
      name: 'Slack',
      authType: AuthType.OAUTH2,
      baseUrl: 'https://slack.com/api',
      requiredScopes: [
        'chat:write',
        'channels:read',
        'users:read',
      ],
    };
    super(config, credentials);
  }

  async execute(
    node: WorkflowNode,
    _context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): Promise<unknown> {
    const { operation, channel, text, username, iconEmoji, blocks, threadTs } = node.config;

    logger.info('Executing Slack operation', {
      operation,
      channel,
    });

    switch (operation) {
      case 'sendMessage':
        return this.sendMessage({
          channel: channel as string,
          text: text as string,
          username: username as string,
          iconEmoji: iconEmoji as string,
          blocks: blocks as any[],
          threadTs: threadTs as string,
        });
      
      case 'listChannels':
        return this.listChannels();
      
      case 'getUser':
        return this.getUser(node.config.userId as string);

      case 'uploadFile':
        return this.uploadFile({
          channels: channel as string,
          content: node.config.content as string,
          filename: node.config.filename as string,
          title: node.config.title as string,
        });
      
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }

  protected async testConnection(): Promise<void> {
    await this.makeRequest('/auth.test', { method: 'POST' });
  }

  /**
   * Send a message to a channel
   */
  private async sendMessage(params: {
    channel: string;
    text: string;
    username?: string;
    iconEmoji?: string;
    blocks?: any[];
    threadTs?: string;
  }): Promise<any> {
    const response = await this.makeRequest('/chat.postMessage', {
      method: 'POST',
      body: JSON.stringify({
        channel: params.channel,
        text: params.text,
        username: params.username,
        icon_emoji: params.iconEmoji,
        blocks: params.blocks,
        thread_ts: params.threadTs,
      }),
    });

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.error}`);
    }

    return {
      messageId: response.ts,
      channel: response.channel,
      timestamp: response.ts,
    };
  }

  /**
   * List all channels
   */
  private async listChannels(): Promise<any> {
    const response = await this.makeRequest('/conversations.list', {
      method: 'POST',
      body: JSON.stringify({
        exclude_archived: true,
        types: 'public_channel,private_channel',
      }),
    });

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.error}`);
    }

    return {
      channels: response.channels.map((ch: any) => ({
        id: ch.id,
        name: ch.name,
        isPrivate: ch.is_private,
        memberCount: ch.num_members,
      })),
    };
  }

  /**
   * Get user information
   */
  private async getUser(userId: string): Promise<any> {
    const response = await this.makeRequest('/users.info', {
      method: 'POST',
      body: JSON.stringify({ user: userId }),
    });

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.error}`);
    }

    return {
      id: response.user.id,
      name: response.user.name,
      realName: response.user.real_name,
      email: response.user.profile.email,
      isBot: response.user.is_bot,
    };
  }

  /**
   * Upload a file
   */
  private async uploadFile(params: {
    channels: string;
    content: string;
    filename: string;
    title?: string;
  }): Promise<any> {
    const response = await this.makeRequest('/files.upload', {
      method: 'POST',
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.error}`);
    }

    return {
      fileId: response.file.id,
      url: response.file.url_private,
    };
  }
}

