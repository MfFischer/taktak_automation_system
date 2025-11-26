/**
 * Slack Integration Node
 * Send messages, create channels, manage users
 */

import { BaseNodeHandler, NodeContext } from './sdk/NodeSDK';
import { WorkflowNode } from '@taktak/types';
import { ValidationError } from '../../utils/errors';
import axios from 'axios';

/**
 * Slack node configuration
 */
export interface SlackNodeConfig {
  action: 'send_message' | 'create_channel' | 'update_status' | 'upload_file';
  token: string; // Slack Bot Token
  
  // For send_message
  channel?: string;
  text?: string;
  blocks?: unknown[];
  threadTs?: string;
  
  // For create_channel
  channelName?: string;
  isPrivate?: boolean;
  
  // For update_status
  statusText?: string;
  statusEmoji?: string;
  
  // For upload_file
  file?: string | Buffer;
  filename?: string;
  channels?: string[];
}

/**
 * Slack node handler
 */
export class SlackNodeHandler extends BaseNodeHandler {
  private readonly SLACK_API_BASE = 'https://slack.com/api';

  /**
   * Validate node configuration
   */
  validate(node: WorkflowNode): void {
    super.validate(node);
    
    const config = node.config as unknown as SlackNodeConfig;
    
    // Validate required fields
    this.validateRequired(config, ['action', 'token']);
    
    // Validate action-specific fields
    switch (config.action) {
      case 'send_message':
        this.validateRequired(config, ['channel', 'text']);
        break;
      case 'create_channel':
        this.validateRequired(config, ['channelName']);
        break;
      case 'update_status':
        this.validateRequired(config, ['statusText']);
        break;
      case 'upload_file':
        this.validateRequired(config, ['file', 'filename', 'channels']);
        break;
    }
  }

  /**
   * Execute the node
   */
  async execute(node: WorkflowNode, context: NodeContext): Promise<unknown> {
    this.validate(node);
    
    const config = node.config as unknown as SlackNodeConfig;
    
    // Resolve expressions
    const resolvedConfig = {
      ...config,
      channel: this.resolveExpression(config.channel as string, context) as string,
      text: this.resolveExpression(config.text as string, context) as string,
      channelName: this.resolveExpression(config.channelName as string, context) as string,
      statusText: this.resolveExpression(config.statusText as string, context) as string,
    };
    
    this.log('info', `Executing Slack ${config.action}: ${node.name}`, node.id);
    
    try {
      let result: unknown;
      
      switch (config.action) {
        case 'send_message':
          result = await this.sendMessage(resolvedConfig);
          break;
        case 'create_channel':
          result = await this.createChannel(resolvedConfig);
          break;
        case 'update_status':
          result = await this.updateStatus(resolvedConfig);
          break;
        case 'upload_file':
          result = await this.uploadFile(resolvedConfig);
          break;
        default:
          throw new ValidationError(`Unknown Slack action: ${config.action}`);
      }
      
      this.log('info', `Slack ${config.action} completed: ${node.name}`, node.id);
      
      return result;
    } catch (error) {
      this.log('error', `Slack ${config.action} failed: ${this.formatError(error)}`, node.id);
      throw error;
    }
  }

  /**
   * Send a message to a Slack channel
   */
  private async sendMessage(config: SlackNodeConfig): Promise<unknown> {
    const response = await axios.post(
      `${this.SLACK_API_BASE}/chat.postMessage`,
      {
        channel: config.channel,
        text: config.text,
        blocks: config.blocks,
        thread_ts: config.threadTs,
      },
      {
        headers: {
          'Authorization': `Bearer ${config.token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.data.ok) {
      throw new Error(`Slack API error: ${response.data.error}`);
    }

    return {
      success: true,
      messageTs: response.data.ts,
      channel: response.data.channel,
    };
  }

  /**
   * Create a Slack channel
   */
  private async createChannel(config: SlackNodeConfig): Promise<unknown> {
    const method = config.isPrivate ? 'conversations.create' : 'conversations.create';
    
    const response = await axios.post(
      `${this.SLACK_API_BASE}/${method}`,
      {
        name: config.channelName,
        is_private: config.isPrivate || false,
      },
      {
        headers: {
          'Authorization': `Bearer ${config.token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.data.ok) {
      throw new Error(`Slack API error: ${response.data.error}`);
    }

    return {
      success: true,
      channelId: response.data.channel.id,
      channelName: response.data.channel.name,
    };
  }

  /**
   * Update user status
   */
  private async updateStatus(config: SlackNodeConfig): Promise<unknown> {
    const response = await axios.post(
      `${this.SLACK_API_BASE}/users.profile.set`,
      {
        profile: {
          status_text: config.statusText,
          status_emoji: config.statusEmoji || ':speech_balloon:',
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${config.token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.data.ok) {
      throw new Error(`Slack API error: ${response.data.error}`);
    }

    return {
      success: true,
      statusText: config.statusText,
    };
  }

  /**
   * Upload a file to Slack
   */
  private async uploadFile(config: SlackNodeConfig): Promise<unknown> {
    const formData = new FormData();
    formData.append('file', config.file as any);
    formData.append('filename', config.filename!);
    formData.append('channels', config.channels!.join(','));

    const response = await axios.post(
      `${this.SLACK_API_BASE}/files.upload`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${config.token}`,
        },
      }
    );

    if (!response.data.ok) {
      throw new Error(`Slack API error: ${response.data.error}`);
    }

    return {
      success: true,
      fileId: response.data.file.id,
      fileUrl: response.data.file.permalink,
    };
  }
}

