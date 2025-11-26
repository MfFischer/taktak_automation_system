/**
 * Discord Integration Node
 * Send messages, manage channels, webhooks
 */

import { BaseNodeHandler, NodeContext } from './sdk/NodeSDK';
import { WorkflowNode } from '@taktak/types';
import { ValidationError } from '../../utils/errors';
import axios from 'axios';

export interface DiscordNodeConfig {
  action: 'send_message' | 'send_webhook' | 'create_channel' | 'send_embed';
  
  // For bot actions
  token?: string; // Discord Bot Token
  channelId?: string;
  
  // For webhook
  webhookUrl?: string;
  
  // Message content
  content?: string;
  username?: string;
  avatarUrl?: string;
  
  // For embeds
  embed?: {
    title?: string;
    description?: string;
    color?: number;
    fields?: Array<{ name: string; value: string; inline?: boolean }>;
    footer?: { text: string; icon_url?: string };
    thumbnail?: { url: string };
    image?: { url: string };
  };
}

export class DiscordNodeHandler extends BaseNodeHandler {
  private readonly DISCORD_API_BASE = 'https://discord.com/api/v10';

  validate(node: WorkflowNode): void {
    super.validate(node);
    const config = node.config as unknown as DiscordNodeConfig;
    this.validateRequired(config, ['action']);
    
    if (config.action === 'send_webhook') {
      this.validateRequired(config, ['webhookUrl', 'content']);
    } else {
      this.validateRequired(config, ['token', 'channelId']);
    }
  }

  async execute(node: WorkflowNode, context: NodeContext): Promise<unknown> {
    this.validate(node);
    const config = node.config as unknown as DiscordNodeConfig;
    
    const resolvedConfig = {
      ...config,
      content: this.resolveExpression(config.content as string, context) as string,
      channelId: this.resolveExpression(config.channelId as string, context) as string,
    };
    
    this.log('info', `Executing Discord ${config.action}: ${node.name}`, node.id);
    
    try {
      let result: unknown;
      
      switch (config.action) {
        case 'send_message':
          result = await this.sendMessage(resolvedConfig);
          break;
        case 'send_webhook':
          result = await this.sendWebhook(resolvedConfig);
          break;
        case 'send_embed':
          result = await this.sendEmbed(resolvedConfig);
          break;
        default:
          throw new ValidationError(`Unknown Discord action: ${config.action}`);
      }
      
      this.log('info', `Discord ${config.action} completed: ${node.name}`, node.id);
      return result;
    } catch (error) {
      this.log('error', `Discord ${config.action} failed: ${this.formatError(error)}`, node.id);
      throw error;
    }
  }

  private async sendMessage(config: DiscordNodeConfig): Promise<unknown> {
    const response = await axios.post(
      `${this.DISCORD_API_BASE}/channels/${config.channelId}/messages`,
      { content: config.content },
      {
        headers: {
          'Authorization': `Bot ${config.token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: true,
      messageId: response.data.id,
      channelId: response.data.channel_id,
    };
  }

  private async sendWebhook(config: DiscordNodeConfig): Promise<unknown> {
    await axios.post(config.webhookUrl!, {
      content: config.content,
      username: config.username,
      avatar_url: config.avatarUrl,
    });

    return {
      success: true,
      webhookUrl: config.webhookUrl,
    };
  }

  private async sendEmbed(config: DiscordNodeConfig): Promise<unknown> {
    const response = await axios.post(
      `${this.DISCORD_API_BASE}/channels/${config.channelId}/messages`,
      {
        content: config.content,
        embeds: [config.embed],
      },
      {
        headers: {
          'Authorization': `Bot ${config.token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: true,
      messageId: response.data.id,
      channelId: response.data.channel_id,
    };
  }
}

