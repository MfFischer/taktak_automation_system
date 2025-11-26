/**
 * Telegram Integration Node
 * Send messages, photos, documents via Telegram Bot API
 */

import { BaseNodeHandler, NodeContext } from './sdk/NodeSDK';
import { WorkflowNode } from '@taktak/types';
import { ValidationError } from '../../utils/errors';
import axios from 'axios';

/**
 * Telegram node configuration
 */
export interface TelegramNodeConfig {
  action: 'send_message' | 'send_photo' | 'send_document' | 'send_location';
  botToken: string; // Telegram Bot Token
  chatId: string; // Chat ID or username
  
  // For send_message
  text?: string;
  parseMode?: 'Markdown' | 'HTML' | 'MarkdownV2';
  disableWebPagePreview?: boolean;
  disableNotification?: boolean;
  
  // For send_photo
  photoUrl?: string;
  caption?: string;
  
  // For send_document
  documentUrl?: string;
  documentCaption?: string;
  
  // For send_location
  latitude?: number;
  longitude?: number;
}

/**
 * Telegram node handler
 */
export class TelegramNodeHandler extends BaseNodeHandler {
  private readonly TELEGRAM_API_BASE = 'https://api.telegram.org';

  /**
   * Validate node configuration
   */
  validate(node: WorkflowNode): void {
    super.validate(node);
    
    const config = node.config as unknown as TelegramNodeConfig;
    
    if (!config.botToken) {
      throw new ValidationError('Telegram bot token is required');
    }
    
    if (!config.chatId) {
      throw new ValidationError('Chat ID is required');
    }
    
    if (!config.action) {
      throw new ValidationError('Action is required');
    }
  }

  /**
   * Execute the Telegram node
   */
  async execute(node: WorkflowNode, context: NodeContext): Promise<unknown> {
    const config = node.config as unknown as TelegramNodeConfig;
    
    const baseUrl = `${this.TELEGRAM_API_BASE}/bot${config.botToken}`;
    
    switch (config.action) {
      case 'send_message':
        return this.sendMessage(baseUrl, config, context);
      case 'send_photo':
        return this.sendPhoto(baseUrl, config, context);
      case 'send_document':
        return this.sendDocument(baseUrl, config, context);
      case 'send_location':
        return this.sendLocation(baseUrl, config, context);
      default:
        throw new ValidationError(`Unknown action: ${config.action}`);
    }
  }

  /**
   * Send a text message
   */
  private async sendMessage(baseUrl: string, config: TelegramNodeConfig, context: NodeContext): Promise<unknown> {
    const text = this.resolveExpression(config.text || '', context) as string;

    const response = await axios.post(`${baseUrl}/sendMessage`, {
      chat_id: config.chatId,
      text,
      parse_mode: config.parseMode,
      disable_web_page_preview: config.disableWebPagePreview,
      disable_notification: config.disableNotification,
    });

    return response.data;
  }

  /**
   * Send a photo
   */
  private async sendPhoto(baseUrl: string, config: TelegramNodeConfig, context: NodeContext): Promise<unknown> {
    const photoUrl = this.resolveExpression(config.photoUrl || '', context) as string;
    const caption = this.resolveExpression(config.caption || '', context) as string;

    const response = await axios.post(`${baseUrl}/sendPhoto`, {
      chat_id: config.chatId,
      photo: photoUrl,
      caption,
      parse_mode: config.parseMode,
      disable_notification: config.disableNotification,
    });

    return response.data;
  }

  /**
   * Send a document
   */
  private async sendDocument(baseUrl: string, config: TelegramNodeConfig, context: NodeContext): Promise<unknown> {
    const documentUrl = this.resolveExpression(config.documentUrl || '', context) as string;
    const caption = this.resolveExpression(config.documentCaption || '', context) as string;

    const response = await axios.post(`${baseUrl}/sendDocument`, {
      chat_id: config.chatId,
      document: documentUrl,
      caption,
      disable_notification: config.disableNotification,
    });

    return response.data;
  }

  /**
   * Send a location
   */
  private async sendLocation(baseUrl: string, config: TelegramNodeConfig, _context: NodeContext): Promise<unknown> {
    if (!config.latitude || !config.longitude) {
      throw new ValidationError('Latitude and longitude are required for send_location');
    }

    const response = await axios.post(`${baseUrl}/sendLocation`, {
      chat_id: config.chatId,
      latitude: config.latitude,
      longitude: config.longitude,
      disable_notification: config.disableNotification,
    });

    return response.data;
  }
}

